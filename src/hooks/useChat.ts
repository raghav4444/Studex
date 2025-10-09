import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Conversation, Message, User } from '../types';
import { useAuth } from '../components/AuthProvider';

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // For now, return empty array since chat tables don't exist yet
      // This will be implemented once the database migration is run
      console.log('Chat functionality requires database migration. Returning empty conversations.');
      setConversations([]);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create or get existing conversation with a user
  const startConversation = useCallback(async (otherUserId: string) => {
    if (!user) return null;

    try {
      // Check if conversation already exists
      const { data: existingConversation, error: checkError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner(
            id,
            conversation_participants!inner(user_id)
          )
        `)
        .eq('user_id', user.id);

      if (checkError) throw checkError;

      // Find existing conversation with the other user
      const existingConv = existingConversation?.find(conv => 
        conv.conversations.conversation_participants.some((p: any) => p.user_id === otherUserId)
      );

      if (existingConv) {
        return existingConv.conversation_id;
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (createError) throw createError;

      // Add both users as participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConversation.id, user_id: user.id },
          { conversation_id: newConversation.id, user_id: otherUserId },
        ]);

      if (participantsError) throw participantsError;

      return newConversation.id;
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
      return null;
    }
  }, [user]);

  // Send a message
  const sendMessage = useCallback(async (conversationId: string, content: string, messageType: 'text' | 'image' | 'file' = 'text', fileUrl?: string, fileName?: string, fileType?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new message to local state
      const newMessage: Message = {
        id: data.id,
        conversationId: data.conversation_id,
        senderId: data.sender_id,
        sender: user,
        content: data.content,
        messageType: data.message_type as 'text' | 'image' | 'file',
        fileUrl: data.file_url,
        fileName: data.file_name,
        fileType: data.file_type,
        isRead: data.is_read,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, [user]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          file_url,
          file_name,
          file_type,
          is_read,
          created_at,
          updated_at,
          profiles!inner(
            id,
            name,
            username,
            avatar_url,
            college,
            branch,
            year
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        sender: {
          id: msg.profiles.id,
          name: msg.profiles.name,
          username: msg.profiles.username,
          email: '',
          college: msg.profiles.college,
          branch: msg.profiles.branch,
          year: msg.profiles.year,
          bio: '',
          isVerified: false,
          isAnonymous: false,
          avatar: msg.profiles.avatar_url,
          skills: [],
          achievements: [],
          joinedAt: new Date(),
          lastActive: new Date(),
        },
        content: msg.content,
        messageType: msg.message_type as 'text' | 'image' | 'file',
        fileUrl: msg.file_url,
        fileName: msg.file_name,
        fileType: msg.file_type,
        isRead: msg.is_read,
        createdAt: new Date(msg.created_at),
        updatedAt: new Date(msg.updated_at),
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.conversationId === conversationId && msg.senderId !== user.id
            ? { ...msg, isRead: true }
            : msg
        )
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const newMessage = payload.new as any;
        
        // Only add message if it's for a conversation the user is part of
        const isParticipant = conversations.some(conv => conv.id === newMessage.conversation_id);
        if (isParticipant) {
          // Fetch the sender profile
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', newMessage.sender_id)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                const message: Message = {
                  id: newMessage.id,
                  conversationId: newMessage.conversation_id,
                  senderId: newMessage.sender_id,
                  sender: {
                    id: profile.id,
                    name: profile.name,
                    username: profile.username,
                    email: profile.email,
                    college: profile.college,
                    branch: profile.branch,
                    year: profile.year,
                    bio: profile.bio || '',
                    isVerified: profile.is_verified,
                    isAnonymous: profile.is_anonymous,
                    avatar: profile.avatar_url,
                    skills: profile.skills || [],
                    achievements: profile.achievements || [],
                    joinedAt: new Date(profile.created_at),
                    lastActive: new Date(profile.updated_at),
                  },
                  content: newMessage.content,
                  messageType: newMessage.message_type,
                  fileUrl: newMessage.file_url,
                  fileName: newMessage.file_name,
                  fileType: newMessage.file_type,
                  isRead: newMessage.is_read,
                  createdAt: new Date(newMessage.created_at),
                  updatedAt: new Date(newMessage.updated_at),
                };

                setMessages(prev => [...prev, message]);
              }
            });
        }
      })
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [user, conversations]);

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    error,
    fetchConversations,
    startConversation,
    sendMessage,
    fetchMessages,
    markMessagesAsRead,
    setActiveConversation,
  };
};

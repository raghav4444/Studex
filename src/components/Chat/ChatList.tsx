import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Search, User, Clock } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { Conversation } from '../../types';
import UserSearch from './UserSearch';
import { ChatSearchResult } from '../../types';

interface ChatListProps {
  onConversationSelect: (conversation: Conversation) => void;
  chatHook: ReturnType<typeof import('../../hooks/useChat').useChat>;
}

const ChatList: React.FC<ChatListProps> = ({ onConversationSelect, chatHook }) => {
  const { user } = useAuth();
  const { conversations, loading, fetchConversations, startConversation } = chatHook;
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log('🔍 ChatList: Conversations state updated:', {
      length: conversations.length,
      conversations: conversations.map(c => ({ id: c.id, participantsCount: c.participants.length }))
    });
  }, [conversations]);

  const handleUserSelect = async (selectedUser: ChatSearchResult) => {
    console.log('🔍 User selected:', selectedUser);
    
    try {
      const conversationId = await startConversation(selectedUser.id);
      console.log('🔍 Conversation ID:', conversationId);
      
      if (conversationId) {
        const conversation = conversations.find(c => c.id === conversationId);
        console.log('🔍 Found conversation:', conversation);
        
        if (conversation) {
          onConversationSelect(conversation);
        } else {
          console.log('🔄 Conversation not found, refreshing...');
          await fetchConversations();
        }
      } else {
        console.log('❌ Failed to create conversation');
      }
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
    }
    
    setShowUserSearch(false);
  };

  const handleConversationClick = (conversation: Conversation) => {
    onConversationSelect(conversation);
  };

  const formatLastMessage = (conversation: Conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const message = conversation.lastMessage;
    const senderName = message.sender.id === user?.id ? 'You' : message.sender.name;
    
    if (message.messageType === 'text') {
      return `${senderName}: ${message.content}`;
    } else if (message.messageType === 'image') {
      return `${senderName}: 📷 Image`;
    } else if (message.messageType === 'file') {
      return `${senderName}: 📎 ${message.fileName}`;
    }
    
    return `${senderName}: Message`;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    
    return date.toLocaleDateString();
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== user?.id);
  };

  const filteredConversations = conversations.filter(conversation => {
    const otherUser = getOtherParticipant(conversation);
    if (!otherUser) return false;
    
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           formatLastMessage(conversation).toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-[#161b22]">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-[#161b22]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-white">Messages</h1>
          <button
            onClick={() => setShowUserSearch(true)}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && filteredConversations.length === 0 && !searchQuery && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No conversations yet</h3>
            <p className="text-gray-400 text-sm mb-6">
              Start a conversation with someone from your college
            </p>
            <button
              onClick={() => setShowUserSearch(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Start Chatting
            </button>
          </div>
        )}

        {!loading && filteredConversations.length === 0 && searchQuery && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No conversations found</h3>
            <p className="text-gray-400 text-sm">
              Try a different search term
            </p>
          </div>
        )}

        {!loading && filteredConversations.length > 0 && (
          <div className="p-2">
            {filteredConversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              if (!otherUser) return null;

              return (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                  className="w-full p-3 hover:bg-gray-800 transition-colors text-left rounded-lg mb-1"
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        {otherUser.avatar ? (
                          <img
                            src={otherUser.avatar}
                            alt={otherUser.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      {otherUser.lastActive && new Date().getTime() - otherUser.lastActive.getTime() < 300000 && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#161b22]"></div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white font-medium truncate">
                          {otherUser.name}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(conversation.updatedAt)}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <div className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-400 truncate">
                        {formatLastMessage(conversation)}
                      </p>
                      
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                         <span className="text-xs text-gray-500 truncate">
                           {otherUser.college && otherUser.college.length > 10 
                             ? `${otherUser.college.substring(0, 10)}...` 
                             : otherUser.college} • {otherUser.branch}
                         </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* User Search Modal */}
      {showUserSearch && (
        <UserSearch
          onUserSelect={handleUserSelect}
          onClose={() => setShowUserSearch(false)}
        />
      )}
    </div>
  );
};

export default ChatList;
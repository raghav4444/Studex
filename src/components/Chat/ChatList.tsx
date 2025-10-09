import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Search, User, Clock } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../AuthProvider';
import { Conversation } from '../../types';
import UserSearch from './UserSearch';
import { ChatSearchResult } from '../../types';

interface ChatListProps {
  onConversationSelect: (conversation: Conversation) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onConversationSelect }) => {
  const { user } = useAuth();
  const { conversations, loading, fetchConversations, startConversation } = useChat();
  const [showUserSearch, setShowUserSearch] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleUserSelect = async (selectedUser: ChatSearchResult) => {
    if (!user) return;
    
    try {
      const conversationId = await startConversation(selectedUser.id);
      if (conversationId) {
        // Find the conversation and select it
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
          onConversationSelect(conversation);
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
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

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h1 className="text-lg sm:text-xl font-bold text-white">Messages</h1>
          <button
            onClick={() => setShowUserSearch(true)}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-[#161b22] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center">
            <div className="w-6 h-6 bg-blue-500 rounded-lg animate-pulse mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading conversations...</p>
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="p-4 text-center">
            <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No conversations yet</h3>
            <p className="text-gray-400 text-sm mb-4">
              Start a conversation with someone from your college
            </p>
            <button
              onClick={() => setShowUserSearch(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Start Chatting
            </button>
          </div>
        )}

        {!loading && conversations.length > 0 && (
          <div className="space-y-1">
            {conversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              if (!otherUser) return null;

              return (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                  className="w-full p-3 sm:p-4 hover:bg-[#161b22] transition-colors text-left border-b border-gray-800/50"
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        {otherUser.avatar ? (
                          <img
                            src={otherUser.avatar}
                            alt={otherUser.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                        )}
                      </div>
                      {otherUser.lastActive && new Date().getTime() - otherUser.lastActive.getTime() < 300000 && (
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-[#0d1117]"></div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white font-medium truncate text-sm sm:text-base">{otherUser.name}</p>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <span className="text-gray-500 text-xs hidden sm:inline">@{otherUser.username}</span>
                          <span className="text-gray-500 text-xs">
                            {formatTime(conversation.updatedAt)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-xs sm:text-sm truncate">
                        {formatLastMessage(conversation)}
                      </p>
                      
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-500 text-xs">
                          {otherUser.college} • {otherUser.branch} • {otherUser.year}
                        </span>
                      </div>
                    </div>

                    {/* Unread Count */}
                    {conversation.unreadCount > 0 && (
                      <div className="flex-shrink-0">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </div>
                      </div>
                    )}
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

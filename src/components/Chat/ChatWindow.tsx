import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Image, Paperclip, MoreVertical, User, Phone, Video } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../AuthProvider';
import { Conversation, Message } from '../../types';

interface ChatWindowProps {
  conversation: Conversation;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage, fetchMessages, markMessagesAsRead } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const otherUser = conversation.participants.find(p => p.id !== user?.id);

  useEffect(() => {
    if (conversation.id) {
      fetchMessages(conversation.id);
    }
  }, [conversation.id, fetchMessages]);

  useEffect(() => {
    // Mark messages as read when conversation is opened
    if (conversation.id) {
      markMessagesAsRead(conversation.id);
    }
  }, [conversation.id, markMessagesAsRead]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation.id) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    
    await sendMessage(conversation.id, messageContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleDateString();
  };

  const renderMessage = (message: Message, index: number) => {
    const isOwn = message.senderId === user?.id;
    const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId;
    const showTime = index === messages.length - 1 || 
      new Date(message.createdAt).getTime() - new Date(messages[index + 1]?.createdAt || 0).getTime() > 300000; // 5 minutes

    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
          {/* Avatar */}
          {showAvatar && !isOwn && (
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              {message.sender.avatar ? (
                <img
                  src={message.sender.avatar}
                  alt={message.sender.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-gray-400" />
              )}
            </div>
          )}
          
          {showAvatar && isOwn && <div className="w-8 h-8"></div>}

          {/* Message Content */}
          <div className={`${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
            {/* Sender Name */}
            {showAvatar && !isOwn && (
              <p className="text-gray-400 text-xs mb-1 px-2">{message.sender.name}</p>
            )}
            
            {/* Message Bubble */}
            <div
              className={`px-3 py-2 rounded-lg ${
                isOwn
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#161b22] text-white border border-gray-700'
              }`}
            >
              {message.messageType === 'text' && (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
              
              {message.messageType === 'image' && (
                <div>
                  <img
                    src={message.fileUrl}
                    alt="Shared image"
                    className="max-w-xs rounded-lg"
                  />
                  {message.content && (
                    <p className="text-sm mt-2">{message.content}</p>
                  )}
                </div>
              )}
              
              {message.messageType === 'file' && (
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-4 h-4" />
                  <div>
                    <p className="text-sm font-medium">{message.fileName}</p>
                    {message.content && (
                      <p className="text-sm opacity-80">{message.content}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Message Time */}
            {showTime && (
              <p className={`text-gray-500 text-xs mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
                {formatMessageTime(message.createdAt)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!otherUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">Invalid conversation</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-800 bg-[#161b22]">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
          
          {/* User Info */}
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full flex items-center justify-center">
              {otherUser.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={otherUser.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-medium truncate text-sm sm:text-base">{otherUser.name}</h2>
              <p className="text-gray-400 text-xs sm:text-sm truncate">
                @{otherUser.username} • {otherUser.college}
              </p>
            </div>
          </div>

          {/* Action Buttons - Hidden on mobile */}
          <div className="hidden sm:flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Video className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
        {loading && messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-6 h-6 bg-blue-500 rounded-lg animate-pulse mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading messages...</p>
          </div>
        )}

        {messages.length === 0 && !loading && (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Start the conversation</h3>
            <p className="text-gray-400 text-sm">
              Send a message to {otherUser.name} to get started
            </p>
          </div>
        )}

        {messages.map((message, index) => renderMessage(message, index))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 sm:p-4 border-t border-gray-800 bg-[#161b22]">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Image className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={`Message ${otherUser.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm sm:text-base"
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

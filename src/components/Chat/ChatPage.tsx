import React, { useState } from 'react';
import { Conversation } from '../../types';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const ChatPage: React.FC = () => {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  const handleConversationSelect = (conversation: Conversation) => {
    setActiveConversation(conversation);
  };

  const handleBackToList = () => {
    setActiveConversation(null);
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Chat List - Full width on mobile, sidebar on desktop */}
      <div className={`${activeConversation ? 'hidden md:block' : 'block'} w-full md:w-1/3 lg:w-1/4 border-r border-gray-800 h-full`}>
        <ChatList onConversationSelect={handleConversationSelect} />
      </div>

      {/* Chat Window - Full width on mobile when active, hidden on desktop when no conversation */}
      <div className={`${activeConversation ? 'block' : 'hidden md:block'} flex-1 h-full`}>
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            onBack={handleBackToList}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-[#0d1117] p-4">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Select a conversation</h3>
              <p className="text-gray-400 text-sm">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

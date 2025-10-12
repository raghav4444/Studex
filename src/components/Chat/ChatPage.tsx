import React, { useState } from 'react';
import { Conversation } from '../../types';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { useChat } from '../../hooks/useChat';

const ChatPage: React.FC = () => {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const chatHook = useChat();

  React.useEffect(() => {
    chatHook.fetchConversations();
  }, []);

  const handleConversationSelect = (conversation: Conversation) => {
    setActiveConversation(conversation);
  };

  const handleBackToList = () => {
    setActiveConversation(null);
  };

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] flex bg-[#0d1117]">
      {/* Chat List Sidebar */}
      <div className={`${activeConversation ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 xl:w-96 bg-[#161b22] border-r border-gray-800 h-full`}>
        <ChatList 
          onConversationSelect={handleConversationSelect} 
          chatHook={chatHook}
        />
      </div>

      {/* Chat Window */}
      <div className={`${activeConversation ? 'flex' : 'hidden lg:flex'} flex-col flex-1 bg-[#0d1117] h-full`}>
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            onBack={handleBackToList}
            chatHook={chatHook}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
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
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Phone, 
  Video, 
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Search,
  Filter,
  Online,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../AuthProvider';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: Date;
  isRead: boolean;
  isOnline: boolean;
  type: 'text' | 'image' | 'file' | 'voice';
  fileUrl?: string;
  fileName?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'group' | 'direct';
  participants: number;
  lastMessage?: Message;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
}

const ChatSection: React.FC = () => {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for chat rooms
  const [chatRooms] = useState<ChatRoom[]>([
    {
      id: '1',
      name: 'Computer Science 2024',
      type: 'group',
      participants: 45,
      unreadCount: 3,
      isOnline: true,
      lastMessage: {
        id: '1',
        content: 'Anyone has the assignment solution?',
        senderId: 'user1',
        senderName: 'Sarah Chen',
        senderAvatar: 'SC',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        isRead: false,
        isOnline: true,
        type: 'text'
      }
    },
    {
      id: '2',
      name: 'Study Group - Math',
      type: 'group',
      participants: 12,
      unreadCount: 0,
      isOnline: true,
      lastMessage: {
        id: '2',
        content: 'Meeting at 3 PM in library',
        senderId: 'user2',
        senderName: 'Mike Johnson',
        senderAvatar: 'MJ',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        isRead: true,
        isOnline: true,
        type: 'text'
      }
    },
    {
      id: '3',
      name: 'Alex Kumar',
      type: 'direct',
      participants: 2,
      unreadCount: 1,
      isOnline: true,
      lastMessage: {
        id: '3',
        content: 'Thanks for the notes!',
        senderId: 'user3',
        senderName: 'Alex Kumar',
        senderAvatar: 'AK',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: false,
        isOnline: true,
        type: 'text'
      }
    }
  ]);

  // Mock data for messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey everyone! How is everyone doing with the project?',
      senderId: 'user1',
      senderName: 'Sarah Chen',
      senderAvatar: 'SC',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      isOnline: true,
      type: 'text'
    },
    {
      id: '2',
      content: 'I\'m almost done with the frontend part. Just need to integrate the API.',
      senderId: 'user2',
      senderName: 'Mike Johnson',
      senderAvatar: 'MJ',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
      isRead: true,
      isOnline: true,
      type: 'text'
    },
    {
      id: '3',
      content: 'Great! I can help with the backend if you need.',
      senderId: user?.id || 'current',
      senderName: user?.name || 'You',
      senderAvatar: user?.name?.charAt(0) || 'U',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000),
      isRead: true,
      isOnline: true,
      type: 'text'
    },
    {
      id: '4',
      content: 'Anyone has the assignment solution?',
      senderId: 'user1',
      senderName: 'Sarah Chen',
      senderAvatar: 'SC',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      isOnline: true,
      type: 'text'
    }
  ]);

  // Mock online users
  const [onlineUsers] = useState([
    { id: '1', name: 'Sarah Chen', avatar: 'SC', isOnline: true },
    { id: '2', name: 'Mike Johnson', avatar: 'MJ', isOnline: true },
    { id: '3', name: 'Alex Kumar', avatar: 'AK', isOnline: true },
    { id: '4', name: 'Emma Wilson', avatar: 'EW', isOnline: false },
    { id: '5', name: 'David Lee', avatar: 'DL', isOnline: true }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !activeChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      senderId: user?.id || 'current',
      senderName: user?.name || 'You',
      senderAvatar: user?.name?.charAt(0) || 'U',
      timestamp: new Date(),
      isRead: false,
      isOnline: true,
      type: 'text'
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement file upload
      console.log('File selected:', file.name);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const activeChatRoom = chatRooms.find(room => room.id === activeChat);

  return (
    <div className="bg-[#161b22] rounded-lg border border-gray-800 h-[600px] flex">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
              College Chat
            </h3>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Online Users */}
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 4).map((user) => (
                <div
                  key={user.id}
                  className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-[#161b22] relative"
                >
                  {user.avatar}
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#161b22]"></div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-400">
              {onlineUsers.filter(u => u.isOnline).length} online
            </span>
          </div>
        </div>

        {/* Chat Rooms List */}
        <div className="flex-1 overflow-y-auto">
          {chatRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => setActiveChat(room.id)}
              className={`p-4 border-b border-gray-800 cursor-pointer transition-colors ${
                activeChat === room.id ? 'bg-blue-500/10 border-blue-500/30' : 'hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {room.type === 'group' ? room.name.charAt(0) : room.avatar || room.name.charAt(0)}
                  </div>
                  {room.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#161b22]"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-white truncate">{room.name}</h4>
                    {room.lastMessage && (
                      <span className="text-xs text-gray-500">{formatTime(room.lastMessage.timestamp)}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400 truncate">
                      {room.lastMessage ? room.lastMessage.content : 'No messages yet'}
                    </p>
                    {room.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {room.participants} {room.type === 'group' ? 'members' : 'participants'}
                    </span>
                    {room.type === 'group' && (
                      <span className="text-xs text-blue-400">Group</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {activeChatRoom?.type === 'group' ? activeChatRoom.name.charAt(0) : activeChatRoom?.avatar || activeChatRoom?.name.charAt(0)}
                    </div>
                    {activeChatRoom?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#161b22]"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{activeChatRoom?.name}</h4>
                    <p className="text-sm text-gray-400">
                      {activeChatRoom?.participants} {activeChatRoom?.type === 'group' ? 'members' : 'participants'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[70%] ${msg.senderId === user?.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {msg.senderAvatar}
                    </div>
                    <div className={`rounded-lg px-4 py-2 ${msg.senderId === user?.id ? 'bg-blue-500 text-white' : 'bg-[#0d1117] text-gray-300'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <div className={`flex items-center space-x-1 mt-1 ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs opacity-70">{formatTime(msg.timestamp)}</span>
                        {msg.senderId === user?.id && (
                          <div className="flex items-center space-x-1">
                            {msg.isRead ? (
                              <CheckCheck className="w-3 h-3 text-blue-300" />
                            ) : (
                              <Check className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    rows={1}
                  />
                </div>
                
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Smile className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Select a chat to start messaging</h3>
              <p className="text-gray-400">Choose from your college groups or start a direct conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSection;

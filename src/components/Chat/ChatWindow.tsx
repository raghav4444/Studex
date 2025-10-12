import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Image, Paperclip, MoreVertical, Phone, Video, MessageCircle, X, File, FileImage } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { Conversation, Message } from '../../types';
import { useWebRTC } from '../../hooks/useWebRTC';
import CallModal from '../Call/CallModal';

interface ChatWindowProps {
  conversation: Conversation;
  onBack: () => void;
  chatHook: ReturnType<typeof import('../../hooks/useChat').useChat>;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onBack, chatHook }) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage, fetchMessages, markMessagesAsRead, fetchConversationParticipants } = chatHook;
  const [newMessage, setNewMessage] = useState('');
  const [conversationParticipants, setConversationParticipants] = useState(conversation.participants);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // WebRTC calling functionality
  const {
    callState,
    incomingCall,
    outgoingCall,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare
  } = useWebRTC();

  const otherUser = conversationParticipants.find(p => p.id !== user?.id);

  useEffect(() => {
    if (conversation.id) {
      fetchMessages(conversation.id);
    }
  }, [conversation.id, fetchMessages]);

  useEffect(() => {
    if (conversation.id && conversation.participants.length === 0) {
      const loadParticipants = async () => {
        const participants = await fetchConversationParticipants(conversation.id);
        setConversationParticipants(participants);
      };
      loadParticipants();
    } else {
      setConversationParticipants(conversation.participants);
    }
  }, [conversation.id, conversation.participants, fetchConversationParticipants]);

  useEffect(() => {
    if (conversation.id) {
      markMessagesAsRead(conversation.id);
    }
  }, [conversation.id, markMessagesAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if ((newMessage.trim() || selectedFiles.length > 0) && conversation.id) {
      setUploadingFiles(true);
      try {
        if (selectedFiles.length > 0) {
          // Send files
          for (const file of selectedFiles) {
            const isImage = file.type.startsWith('image/');
            const messageType = isImage ? 'image' : 'file';
            
            // For now, we'll use a simple file URL (in production, upload to storage first)
            const fileUrl = URL.createObjectURL(file);
            
            await sendMessage(
              conversation.id, 
              newMessage.trim() || (isImage ? '📷 Image' : `📎 ${file.name}`),
              messageType,
              fileUrl,
              file.name,
              file.type
            );
          }
          setSelectedFiles([]);
        } else {
          // Send text message
          await sendMessage(conversation.id, newMessage.trim());
        }
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setUploadingFiles(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles: File[] = [];
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedFileTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    Array.from(files).forEach(file => {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      if (file.type.startsWith('image/')) {
        if (allowedImageTypes.includes(file.type)) {
          validFiles.push(file);
        } else {
          alert(`Image format ${file.type} is not supported.`);
        }
      } else {
        if (allowedFileTypes.includes(file.type)) {
          validFiles.push(file);
        } else {
          alert(`File format ${file.type} is not supported.`);
        }
      }
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the main container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  // Call handler functions
  const handleStartAudioCall = () => {
    if (otherUser) {
      startCall(otherUser, 'audio');
    }
  };

  const handleStartVideoCall = () => {
    if (otherUser) {
      startCall(otherUser, 'video');
    }
  };

  const handleAcceptCall = () => {
    acceptCall();
  };

  const handleRejectCall = () => {
    rejectCall();
  };

  const handleEndCall = () => {
    endCall();
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
      new Date(message.createdAt).getTime() - new Date(messages[index + 1]?.createdAt || 0).getTime() > 300000;

    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[80%]`}>
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
                <span className="text-gray-300 text-xs font-medium">
                  {message.sender.name ? message.sender.name[0].toUpperCase() : '?'}
                </span>
              )}
            </div>
          )}
          
          {showAvatar && isOwn && <div className="w-8"></div>}

          {/* Message Content */}
          <div className={`${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
            {/* Sender Name */}
            {showAvatar && !isOwn && (
              <p className="text-xs text-gray-400 mb-1 px-1">{message.sender.name}</p>
            )}
            
            {/* Message Bubble */}
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs ${
                isOwn
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-gray-700 text-white rounded-bl-md'
              }`}
            >
              {message.messageType === 'text' && (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
              
              {message.messageType === 'image' && (
                <div>
                  <img
                     src={message.fileUrl || ''}
                    alt="Shared image"
                     className="max-w-xs max-h-64 rounded-lg object-cover cursor-pointer"
                     onClick={() => window.open(message.fileUrl || '', '_blank')}
                  />
                   {message.content && message.content !== '📷 Image' && (
                    <p className="text-sm mt-2">{message.content}</p>
                  )}
                </div>
              )}
              
              {message.messageType === 'file' && (
                 <div className="flex items-center space-x-2 p-2 bg-gray-600/20 rounded-lg">
                   <div className="flex-shrink-0">
                     {getFileIcon({ type: message.fileType || '' } as File)}
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium truncate">{message.fileName}</p>
                     {message.content && message.content !== `📎 ${message.fileName}` && (
                      <p className="text-sm opacity-80">{message.content}</p>
                    )}
                  </div>
                   <button
                     onClick={() => window.open(message.fileUrl || '', '_blank')}
                     className="flex-shrink-0 p-1 hover:bg-gray-600/40 rounded transition-colors"
                     title="Download file"
                   >
                     <Paperclip className="w-4 h-4" />
                   </button>
                </div>
              )}
            </div>

            {/* Message Time */}
            {showTime && (
              <p className={`text-xs text-gray-400 mt-1 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
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
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">Invalid conversation</p>
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col h-full bg-[#0d1117] overflow-hidden relative ${isDragOver ? 'bg-blue-500/10' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center z-50 border-2 border-dashed border-blue-400 rounded-lg m-2">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileImage className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Drop files here</h3>
            <p className="text-blue-300 text-sm">Release to upload images and documents</p>
          </div>
        </div>
      )}

      {/* Header */}
       <div className="p-4 border-b border-gray-800 bg-[#161b22] flex-shrink-0">
         <div className="flex items-center space-x-4 min-w-0">
          <button
            onClick={onBack}
             className="p-2 hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
          >
             <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          
          {/* User Info */}
           <div className="flex items-center space-x-3 flex-1 min-w-0">
             <div className="relative flex-shrink-0">
               <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              {otherUser.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={otherUser.name}
                     className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                   <span className="text-gray-300 font-medium">
                     {otherUser.name ? otherUser.name[0].toUpperCase() : '?'}
                   </span>
                 )}
               </div>
               {otherUser.lastActive && new Date().getTime() - otherUser.lastActive.getTime() < 300000 && (
                 <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#161b22]"></div>
              )}
            </div>
            
             <div className="flex-1 min-w-0 overflow-hidden">
               <h2 className="text-white font-medium truncate">{otherUser.name}</h2>
               <p className="text-sm text-gray-400 truncate">
                 {otherUser.college && otherUser.college.length > 12 
                   ? `${otherUser.college.substring(0, 12)}...` 
                   : otherUser.college} • {otherUser.branch}
              </p>
            </div>
          </div>

           {/* Action Buttons */}
           <div className="flex items-center space-x-1 flex-shrink-0">
             <button 
               onClick={handleStartAudioCall}
               className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
               title="Start audio call"
             >
               <Phone className="w-5 h-5 text-gray-400" />
             </button>
             <button 
               onClick={handleStartVideoCall}
               className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
               title="Start video call"
             >
               <Video className="w-5 h-5 text-gray-400" />
             </button>
             <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
               <MoreVertical className="w-5 h-5 text-gray-400" />
             </button>
           </div>
        </div>
      </div>

       {/* Messages */}
       <div 
         className="flex-1 overflow-y-auto p-4 bg-[#0d1117] min-h-0 overflow-x-hidden"
         onDragEnter={handleDragEnter}
         onDragLeave={handleDragLeave}
         onDragOver={handleDragOver}
         onDrop={handleDrop}
       >
        {loading && messages.length === 0 && (
           <div className="flex items-center justify-center py-12">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {messages.length === 0 && !loading && (
           <div className="flex flex-col items-center justify-center py-12 text-center">
             <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4">
               <MessageCircle className="w-8 h-8 text-blue-400" />
             </div>
            <h3 className="text-lg font-medium text-white mb-2">Start the conversation</h3>
            <p className="text-gray-400 text-sm">
               Send a message to <span className="font-medium text-blue-400">{otherUser.name}</span> to get started
            </p>
          </div>
        )}

        {messages.map((message, index) => renderMessage(message, index))}
        <div ref={messagesEndRef} />
      </div>

       {/* Selected Files Preview */}
       {selectedFiles.length > 0 && (
         <div className="p-4 bg-[#161b22] border-t border-gray-800">
           <div className="flex flex-wrap gap-2">
             {selectedFiles.map((file, index) => (
               <div key={index} className="flex items-center space-x-2 bg-[#0d1117] rounded-lg p-2 border border-gray-700">
                 {file.type.startsWith('image/') ? (
                   <img
                     src={URL.createObjectURL(file)}
                     alt={file.name}
                     className="w-8 h-8 rounded object-cover"
                   />
                 ) : (
                   <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                     {getFileIcon(file)}
                   </div>
                 )}
                 <div className="flex-1 min-w-0">
                   <p className="text-xs text-white truncate">{file.name}</p>
                   <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                 </div>
                 <button
                   onClick={() => removeFile(index)}
                   className="p-1 hover:bg-gray-600 rounded transition-colors"
                 >
                   <X className="w-3 h-3 text-gray-400" />
                 </button>
               </div>
             ))}
           </div>
         </div>
       )}

       {/* Message Input - Fixed at bottom */}
       <div 
         className={`p-4 border-t border-gray-800 bg-[#161b22] flex-shrink-0 overflow-hidden ${isDragOver ? 'border-blue-400 bg-blue-500/5' : ''}`}
         onDragEnter={handleDragEnter}
         onDragLeave={handleDragLeave}
         onDragOver={handleDragOver}
         onDrop={handleDrop}
       >
         <div className="flex items-center space-x-3 min-w-0">
           <button 
             className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
             onClick={() => imageInputRef.current?.click()}
           >
             <Image className="w-5 h-5 text-gray-400" />
          </button>
           <button 
             className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
             onClick={() => fileInputRef.current?.click()}
           >
             <Paperclip className="w-5 h-5 text-gray-400" />
          </button>
          
           <div className="flex-1 relative min-w-0">
            <input
              ref={inputRef}
              type="text"
              placeholder={`Message ${otherUser.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
               className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <button
            onClick={handleSendMessage}
             disabled={(!newMessage.trim() && selectedFiles.length === 0) || uploadingFiles}
             className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex-shrink-0"
           >
             {uploadingFiles ? (
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
             ) : (
               <Send className="w-5 h-5" />
             )}
          </button>
        </div>

         {/* Hidden file inputs */}
         <input
           ref={imageInputRef}
           type="file"
           accept="image/*"
           multiple
           onChange={(e) => handleFileSelect(e.target.files)}
           className="hidden"
         />
         <input
           ref={fileInputRef}
           type="file"
           accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
           multiple
           onChange={(e) => handleFileSelect(e.target.files)}
           className="hidden"
         />
       </div>

       {/* Call Modal */}
       <CallModal
         isOpen={callState.isInCall}
         callUser={otherUser || null}
         callType={callState.callType}
         callState={callState}
         incomingCall={incomingCall as any}
         outgoingCall={outgoingCall as any}
         onAccept={handleAcceptCall}
         onReject={handleRejectCall}
         onEnd={handleEndCall}
         onToggleAudio={toggleAudio}
         onToggleVideo={toggleVideo}
         onToggleScreenShare={toggleScreenShare}
         localVideoRef={localVideoRef}
         remoteVideoRef={remoteVideoRef}
       />
     </div>
   );
 };
 
 export default ChatWindow;
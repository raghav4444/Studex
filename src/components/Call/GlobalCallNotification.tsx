import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, User } from 'lucide-react';
import { useCallSignaling } from '../../hooks/useCallSignaling';
import { useAuth } from '../AuthProvider';

const GlobalCallNotification: React.FC = () => {
  const { user } = useAuth();
  const { incomingCall, acceptCallInvitation, rejectCallInvitation } = useCallSignaling();
  const [isVisible, setIsVisible] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('🔔 GlobalCallNotification - incomingCall changed:', incomingCall);
    console.log('🔔 GlobalCallNotification - user:', user?.id);
    
    // Test if component is working by showing a test notification after 5 seconds
    if (user?.id) {
      const testTimer = setTimeout(() => {
        console.log('🔔 TEST: GlobalCallNotification component is working!');
      }, 5000);
      return () => clearTimeout(testTimer);
    }
  }, [incomingCall, user?.id]);

  useEffect(() => {
    if (incomingCall) {
      console.log('🔔 Showing incoming call notification for:', incomingCall);
      setIsVisible(true);
      // Auto-hide after 30 seconds if not answered
      const timer = setTimeout(() => {
        console.log('🔔 Auto-hiding call notification after timeout');
        setIsVisible(false);
      }, 30000);
      
      return () => clearTimeout(timer);
    } else {
      console.log('🔔 Hiding call notification - no incoming call');
      setIsVisible(false);
    }
  }, [incomingCall]);

  const handleAccept = async () => {
    if (incomingCall) {
      await acceptCallInvitation(incomingCall.id);
      setIsVisible(false);
    }
  };

  const handleReject = async () => {
    if (incomingCall) {
      await rejectCallInvitation(incomingCall.id);
      setIsVisible(false);
    }
  };

  if (!isVisible || !incomingCall) {
    console.log('🔔 GlobalCallNotification not rendering:', { isVisible, incomingCall });
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-[#161b22] rounded-xl p-6 w-full max-w-sm mx-4 border border-gray-800 shadow-2xl">
        {/* Call Header */}
        <div className="text-center mb-6">
          <div className="relative mx-auto mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-white" />
            </div>
            
            {/* Animated rings for incoming calls */}
            <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-75"></div>
            <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-1">
            Incoming {incomingCall.callType} call
          </h3>
          <p className="text-gray-400 text-sm">
            User {incomingCall.fromUserId.slice(-4)}
          </p>
        </div>

        {/* Call Actions */}
        <div className="flex justify-center space-x-6">
          {/* Accept Call */}
          <button
            onClick={handleAccept}
            className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
          >
            <Phone className="w-7 h-7 text-white" />
          </button>

          {/* Reject Call */}
          <button
            onClick={handleReject}
            className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
        </div>

        {/* Call Type Icon */}
        <div className="text-center mt-4">
          {incomingCall.callType === 'video' ? (
            <Video className="w-6 h-6 text-blue-400 mx-auto" />
          ) : (
            <Phone className="w-6 h-6 text-green-400 mx-auto" />
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalCallNotification;

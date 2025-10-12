import React, { useEffect, useRef } from 'react';
import { 
  Phone, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Monitor, 
  PhoneOff, 
  User 
} from 'lucide-react';
import { useWebRTC, CallUser } from '../../hooks/useWebRTC';

interface CallModalProps {
  isOpen: boolean;
  callUser: CallUser | null;
  callType: 'audio' | 'video' | null;
  callState: ReturnType<typeof useWebRTC>['callState'];
  incomingCall: any; // CallInvitation from useCallSignaling
  outgoingCall: any; // CallInvitation from useCallSignaling
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
}

const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  callUser,
  callType,
  callState,
  incomingCall,
  outgoingCall,
  onAccept,
  onReject,
  onEnd,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  localVideoRef,
  remoteVideoRef,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Play ringtone for incoming calls
  useEffect(() => {
    if (incomingCall && audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => {
        // Fallback: create a simple beep sound if ringtone file doesn't exist
        console.log('Ringtone file not found, using fallback notification');
      });
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [incomingCall]);

  if (!isOpen) return null;

  // Get user info from the call invitation
  const getCallUserInfo = () => {
    if (incomingCall) {
      return {
        name: `User ${(incomingCall.fromUserId || '').slice(-4)}`, // Fallback name
        id: incomingCall.fromUserId
      };
    }
    if (outgoingCall) {
      return {
        name: `User ${(outgoingCall.toUserId || '').slice(-4)}`, // Fallback name
        id: outgoingCall.toUserId
      };
    }
    return callUser;
  };

  const currentUser = getCallUserInfo();
  const isIncoming = !!incomingCall;
  const isOutgoing = !!outgoingCall && !callState.isCallActive;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Ringtone (hidden) */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/ringtone.mp3" type="audio/mpeg" />
      </audio>

      <div className="bg-[#161b22] rounded-xl p-8 w-full max-w-md mx-4 border border-gray-800">
        {/* Call Header */}
        <div className="text-center mb-8">
          <div className="relative mx-auto mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            
            {/* Animated rings for incoming calls */}
            {isIncoming && (
              <>
                <div className="absolute inset-0 border-2 border-blue-400 rounded-full animate-ping"></div>
                <div className="absolute inset-0 border-2 border-blue-400 rounded-full animate-ping animation-delay-1000"></div>
              </>
            )}
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {currentUser?.name || 'Unknown'}
          </h2>
          
          <p className="text-gray-400">
            {isIncoming && `Incoming ${incomingCall?.callType} call`}
            {isOutgoing && `Calling...`}
            {callState.isCallActive && `${callState.callType} call`}
          </p>

          {/* Call duration for active calls */}
          {callState.isCallActive && (
            <p className="text-sm text-gray-500 mt-2">
              Call in progress...
            </p>
          )}
        </div>

        {/* Video Streams (for video calls) */}
        {callType === 'video' && callState.isCallActive && (
          <div className="mb-6 relative">
            {/* Remote Video */}
            <div className="w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              {!callState.remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Waiting for {currentUser?.name}...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Local Video (picture-in-picture) */}
            <div className="absolute top-4 right-4 w-24 h-32 bg-gray-900 rounded-lg overflow-hidden border-2 border-white/20">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="flex items-center justify-center space-x-4">
          {/* Incoming Call Controls */}
          {isIncoming && (
            <>
              <button
                onClick={onReject}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              >
                <PhoneOff className="w-8 h-8 text-white" />
              </button>
              
              <button
                onClick={onAccept}
                className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
              >
                {callType === 'audio' ? (
                  <Phone className="w-8 h-8 text-white" />
                ) : (
                  <Video className="w-8 h-8 text-white" />
                )}
              </button>
            </>
          )}

          {/* Outgoing Call Controls */}
          {isOutgoing && (
            <button
              onClick={onReject}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
            >
              <PhoneOff className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Active Call Controls */}
          {callState.isCallActive && (
            <>
              {/* Audio Toggle */}
              <button
                onClick={onToggleAudio}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  callState.isAudioEnabled 
                    ? 'bg-gray-600 hover:bg-gray-700' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {callState.isAudioEnabled ? (
                  <Mic className="w-6 h-6 text-white" />
                ) : (
                  <MicOff className="w-6 h-6 text-white" />
                )}
              </button>

              {/* Video Toggle (for video calls) */}
              {callType === 'video' && (
                <button
                  onClick={onToggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    callState.isVideoEnabled 
                      ? 'bg-gray-600 hover:bg-gray-700' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {callState.isVideoEnabled ? (
                    <Video className="w-6 h-6 text-white" />
                  ) : (
                    <VideoOff className="w-6 h-6 text-white" />
                  )}
                </button>
              )}

              {/* Screen Share (for video calls) */}
              {callType === 'video' && (
                <button
                  onClick={onToggleScreenShare}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    callState.isScreenSharing 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  <Monitor className="w-6 h-6 text-white" />
                </button>
              )}

              {/* End Call */}
              <button
                onClick={onEnd}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              >
                <PhoneOff className="w-8 h-8 text-white" />
              </button>
            </>
          )}
        </div>

        {/* Additional Info */}
        {callState.isCallActive && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {callState.isAudioEnabled ? 'Microphone on' : 'Microphone off'} • 
              {callType === 'video' && (callState.isVideoEnabled ? ' Camera on' : ' Camera off')}
              {callState.isScreenSharing && ' • Screen sharing'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallModal;

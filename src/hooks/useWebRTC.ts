import { useState, useCallback, useRef, useEffect } from 'react';
import { useCallSignaling, CallInvitation } from './useCallSignaling';

export interface CallState {
  isInCall: boolean;
  isCallActive: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  callType: 'audio' | 'video' | null;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  currentInvitation: CallInvitation | null;
}

export interface CallUser {
  id: string;
  name: string;
  avatar?: string;
}

export const useWebRTC = () => {
  const [callState, setCallState] = useState<CallState>({
    isInCall: false,
    isCallActive: false,
    isVideoEnabled: true,
    isAudioEnabled: true,
    isScreenSharing: false,
    callType: null,
    remoteStream: null,
    localStream: null,
    peerConnection: null,
    currentInvitation: null,
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Initialize signaling
  const {
    incomingCall,
    outgoingCall,
    callUsers,
    sendCallInvitation,
    acceptCallInvitation,
    rejectCallInvitation,
    endCall,
    sendIceCandidate,
    getOnlineUsers,
  } = useCallSignaling();

  // WebRTC Configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Initialize peer connection
  const createPeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = peerConnection;

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream:', event.streams[0]);
      setCallState(prev => ({
        ...prev,
        remoteStream: event.streams[0],
        isCallActive: true,
      }));
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate:', event.candidate);
        // In a real app, you'd send this to the remote peer via signaling server
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        setCallState(prev => ({ ...prev, isCallActive: true }));
      } else if (peerConnection.connectionState === 'disconnected' || 
                 peerConnection.connectionState === 'failed' ||
                 peerConnection.connectionState === 'closed') {
        endCall();
      }
    };

    return peerConnection;
  }, []);

  // Get user media (camera and microphone)
  const getUserMedia = useCallback(async (video = true, audio = true) => {
    try {
      const constraints = {
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false,
        audio: audio
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCallState(prev => ({ ...prev, localStream: stream }));
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, []);

  // Start a call
  const startCall = useCallback(async (user: CallUser, type: 'audio' | 'video') => {
    try {
      console.log(`Starting ${type} call with ${user.name}`);
      
      setCallState(prev => ({
        ...prev,
        isInCall: true,
        callType: type,
      }));

      // Get local media
      const stream = await getUserMedia(type === 'video', true);
      
      // Create peer connection
      const peerConnection = createPeerConnection();
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send call invitation with offer
      const invitationId = await sendCallInvitation(user.id, type, offer);
      
      if (invitationId) {
        setCallState(prev => ({
          ...prev,
          currentInvitation: { id: invitationId } as CallInvitation,
        }));
        console.log('📞 Call invitation sent successfully');
      } else {
        throw new Error('Failed to send call invitation');
      }

    } catch (error) {
      console.error('Error starting call:', error);
      setCallState(prev => ({
        ...prev,
        isInCall: false,
        callType: null,
        currentInvitation: null,
      }));
    }
  }, [getUserMedia, createPeerConnection, sendCallInvitation]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    
    try {
      console.log(`Accepting ${incomingCall.callType} call from ${incomingCall.fromUserId}`);
      
      // Get local media
      const stream = await getUserMedia(incomingCall.callType === 'video', true);
      
      // Create peer connection
      const peerConnection = createPeerConnection();
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Set remote description if offer exists
      if (incomingCall.offer) {
        await peerConnection.setRemoteDescription(incomingCall.offer);
      }

      // Create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send answer to caller
      await acceptCallInvitation(incomingCall.id, answer);

      setCallState(prev => ({
        ...prev,
        isCallActive: true,
        callType: incomingCall.callType,
        currentInvitation: incomingCall,
      }));

    } catch (error) {
      console.error('Error accepting call:', error);
      if (incomingCall) {
        await rejectCallInvitation(incomingCall.id);
      }
    }
  }, [incomingCall, getUserMedia, createPeerConnection, acceptCallInvitation, rejectCallInvitation]);

  // Reject incoming call
  const rejectCall = useCallback(async () => {
    if (!incomingCall) return;
    
    console.log('Rejecting incoming call');
    await rejectCallInvitation(incomingCall.id);
    
    setCallState(prev => ({
      ...prev,
      isInCall: false,
      callType: null,
      currentInvitation: null,
    }));
  }, [incomingCall, rejectCallInvitation]);

  // End current call
  const endCallLocal = useCallback(async () => {
    console.log('Ending call');
    
    // End call in database if we have an active invitation
    if (callState.currentInvitation) {
      await endCall(callState.currentInvitation.id);
    }
    
    // Stop local stream
    if (callState.localStream) {
      callState.localStream.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Reset state
    setCallState({
      isInCall: false,
      isCallActive: false,
      isVideoEnabled: true,
      isAudioEnabled: true,
      isScreenSharing: false,
      callType: null,
      remoteStream: null,
      localStream: null,
      peerConnection: null,
      currentInvitation: null,
    });
  }, [callState.localStream, callState.currentInvitation, endCall]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (callState.localStream) {
      const audioTrack = callState.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState(prev => ({ ...prev, isAudioEnabled: audioTrack.enabled }));
      }
    }
  }, [callState.localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (callState.localStream) {
      const videoTrack = callState.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState(prev => ({ ...prev, isVideoEnabled: videoTrack.enabled }));
      }
    }
  }, [callState.localStream]);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    try {
      if (callState.isScreenSharing) {
        // Stop screen sharing
        if (callState.localStream) {
          const videoTrack = callState.localStream.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.stop();
          }
        }
        
        // Get camera stream back
        const stream = await getUserMedia(true, true);
        setCallState(prev => ({
          ...prev,
          localStream: stream,
          isScreenSharing: false,
        }));
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        if (callState.localStream) {
          const videoTrack = callState.localStream.getVideoTracks()[0];
          if (videoTrack) {
            callState.localStream.removeTrack(videoTrack);
          }
          callState.localStream.addTrack(screenStream.getVideoTracks()[0]);
        }

        setCallState(prev => ({
          ...prev,
          localStream: callState.localStream,
          isScreenSharing: true,
        }));
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  }, [callState.localStream, callState.isScreenSharing, getUserMedia]);

  // Simulate incoming call (for demo)
  const simulateIncomingCall = useCallback((user: CallUser, type: 'audio' | 'video') => {
    setIncomingCall(user);
    setCallState(prev => ({
      ...prev,
      isInCall: true,
      callType: type,
    }));
  }, []);

  // Update remote video when remote stream changes
  useEffect(() => {
    if (callState.remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = callState.remoteStream;
    }
  }, [callState.remoteStream]);

  return {
    callState,
    incomingCall,
    outgoingCall,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall: endCallLocal,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    callUsers,
    getOnlineUsers,
  };
};

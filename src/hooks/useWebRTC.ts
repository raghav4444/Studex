import { useState, useCallback, useRef, useEffect } from 'react';

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
  });

  const [incomingCall, setIncomingCall] = useState<CallUser | null>(null);
  const [outgoingCall, setOutgoingCall] = useState<CallUser | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

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
      
      setOutgoingCall(user);
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

      // In a real app, you'd send the offer to the remote peer via signaling server
      console.log('Call offer created:', offer);

      // Simulate call acceptance after 2 seconds (for demo)
      setTimeout(() => {
        acceptCall(user, type);
      }, 2000);

    } catch (error) {
      console.error('Error starting call:', error);
      setOutgoingCall(null);
      setCallState(prev => ({
        ...prev,
        isInCall: false,
        callType: null,
      }));
    }
  }, [getUserMedia, createPeerConnection]);

  // Accept incoming call
  const acceptCall = useCallback(async (user: CallUser, type: 'audio' | 'video') => {
    try {
      console.log(`Accepting ${type} call from ${user.name}`);
      
      setIncomingCall(null);
      setOutgoingCall(null);
      
      // Get local media
      const stream = await getUserMedia(type === 'video', true);
      
      // Create peer connection
      const peerConnection = createPeerConnection();
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // In a real app, you'd handle the offer/answer exchange here
      // For demo, we'll simulate a successful connection
      setCallState(prev => ({
        ...prev,
        isCallActive: true,
        callType: type,
      }));

    } catch (error) {
      console.error('Error accepting call:', error);
      endCall();
    }
  }, [getUserMedia, createPeerConnection]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    console.log('Rejecting incoming call');
    setIncomingCall(null);
    setCallState(prev => ({
      ...prev,
      isInCall: false,
      callType: null,
    }));
  }, []);

  // End current call
  const endCall = useCallback(() => {
    console.log('Ending call');
    
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
    });
    
    setIncomingCall(null);
    setOutgoingCall(null);
  }, [callState.localStream]);

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
    endCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    simulateIncomingCall,
  };
};

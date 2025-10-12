import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';

export interface CallInvitation {
  id: string;
  fromUserId: string;
  toUserId: string;
  callType: 'audio' | 'video';
  status: 'pending' | 'accepted' | 'rejected' | 'ended';
  createdAt: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  iceCandidates: RTCIceCandidateInit[];
}

export interface CallUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

export const useCallSignaling = () => {
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState<CallInvitation | null>(null);
  const [outgoingCall, setOutgoingCall] = useState<CallInvitation | null>(null);
  const [callUsers, setCallUsers] = useState<CallUser[]>([]);

  // Listen for incoming call invitations
  useEffect(() => {
    if (!user?.id) return;

    // Get the auth user ID (not profile ID)
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) return;

      const channel = supabase
        .channel(`call_invitations_${authUser.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'call_invitations',
          filter: `to_user_id=eq.${authUser.id}`,
        }, (payload) => {
          console.log('📞 Incoming call invitation:', payload.new);
          const invitation = payload.new as CallInvitation;
          setIncomingCall(invitation);
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_invitations',
          filter: `to_user_id=eq.${authUser.id}`,
        }, (payload) => {
          console.log('📞 Call invitation updated:', payload.new);
          const invitation = payload.new as CallInvitation;
          
          if (invitation.status === 'accepted') {
            // Remote user accepted our call
            setOutgoingCall(null);
            // Handle call acceptance logic here
          } else if (invitation.status === 'rejected') {
            // Remote user rejected our call
            setOutgoingCall(null);
            alert(`${getUserNameById(invitation.fromUserId)} rejected your call`);
          } else if (invitation.status === 'ended') {
            // Call ended
            setIncomingCall(null);
            setOutgoingCall(null);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, [user?.id]);

  // Listen for call responses on outgoing calls
  useEffect(() => {
    if (!user?.id || !outgoingCall) return;

    const channel = supabase
      .channel(`call_responses_${outgoingCall.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'call_invitations',
        filter: `id=eq.${outgoingCall.id}`,
      }, (payload) => {
        console.log('📞 Call response received:', payload.new);
        const invitation = payload.new as CallInvitation;
        
        if (invitation.status === 'accepted') {
          // Call accepted, start WebRTC connection
          setOutgoingCall(null);
          // Handle call acceptance logic here
        } else if (invitation.status === 'rejected') {
          // Call rejected
          setOutgoingCall(null);
          alert(`${getUserNameById(invitation.toUserId)} rejected your call`);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, outgoingCall]);

  // Get user name by ID (you might want to cache this or get from context)
  const getUserNameById = (userId: string): string => {
    const callUser = callUsers.find(u => u.id === userId);
    return callUser?.name || 'Unknown User';
  };

  // Send call invitation
  const sendCallInvitation = useCallback(async (
    toUserId: string, 
    callType: 'audio' | 'video',
    offer?: RTCSessionDescriptionInit
  ): Promise<string | null> => {
    // Get the auth user ID (not profile ID)
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser?.id) {
      console.error('No auth user ID available');
      return null;
    }

    try {
      console.log('📞 Sending call invitation:', {
        from: authUser.id,
        to: toUserId,
        type: callType
      });

      const { data, error } = await supabase
        .from('call_invitations')
        .insert({
          from_user_id: authUser.id,
          to_user_id: toUserId,
          call_type: callType,
          status: 'pending',
          offer: offer ? JSON.stringify(offer) : null,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('📞 Call invitation sent successfully:', data);
      setOutgoingCall(data);
      
      // Set timeout to auto-reject after 60 seconds (increased from 30)
      setTimeout(() => {
        console.log('⏰ Call timeout - auto rejecting');
        rejectCallInvitation(data.id);
      }, 60000);

      return data.id;
    } catch (error) {
      console.error('Error sending call invitation:', error);
      alert(`Failed to send call: ${error.message || 'Unknown error'}`);
      return null;
    }
  }, []);

  // Accept call invitation
  const acceptCallInvitation = useCallback(async (
    invitationId: string,
    answer?: RTCSessionDescriptionInit
  ) => {
    try {
      const { error } = await supabase
        .from('call_invitations')
        .update({
          status: 'accepted',
          answer: answer ? JSON.stringify(answer) : null,
        })
        .eq('id', invitationId);

      if (error) throw error;

      console.log('📞 Call invitation accepted');
      setIncomingCall(null);
    } catch (error) {
      console.error('Error accepting call invitation:', error);
    }
  }, []);

  // Reject call invitation
  const rejectCallInvitation = useCallback(async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('call_invitations')
        .update({ status: 'rejected' })
        .eq('id', invitationId);

      if (error) throw error;

      console.log('📞 Call invitation rejected');
      setIncomingCall(null);
    } catch (error) {
      console.error('Error rejecting call invitation:', error);
    }
  }, []);

  // End call
  const endCall = useCallback(async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('call_invitations')
        .update({ status: 'ended' })
        .eq('id', invitationId);

      if (error) throw error;

      console.log('📞 Call ended');
      setIncomingCall(null);
      setOutgoingCall(null);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }, []);

  // Send ICE candidate
  const sendIceCandidate = useCallback(async (
    invitationId: string,
    candidate: RTCIceCandidateInit
  ) => {
    try {
      // Get current invitation
      const { data: invitation, error: fetchError } = await supabase
        .from('call_invitations')
        .select('ice_candidates')
        .eq('id', invitationId)
        .single();

      if (fetchError) throw fetchError;

      const currentCandidates = invitation?.ice_candidates || [];
      const newCandidates = [...currentCandidates, candidate];

      const { error } = await supabase
        .from('call_invitations')
        .update({ ice_candidates: newCandidates })
        .eq('id', invitationId);

      if (error) throw error;

      console.log('🧊 ICE candidate sent');
    } catch (error) {
      console.error('Error sending ICE candidate:', error);
    }
  }, []);

  // Get online users for calling
  const getOnlineUsers = useCallback(async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, user_id, name, avatar_url, is_online')
        .eq('is_online', true)
        .neq('user_id', user?.id); // Exclude current user

      if (error) throw error;

      const users: CallUser[] = profiles.map(profile => ({
        id: profile.user_id,
        name: profile.name,
        avatar: profile.avatar_url,
        isOnline: profile.is_online,
      }));

      setCallUsers(users);
      return users;
    } catch (error) {
      console.error('Error getting online users:', error);
      return [];
    }
  }, [user?.id]);

  return {
    incomingCall,
    outgoingCall,
    callUsers,
    sendCallInvitation,
    acceptCallInvitation,
    rejectCallInvitation,
    endCall,
    sendIceCandidate,
    getOnlineUsers,
  };
};

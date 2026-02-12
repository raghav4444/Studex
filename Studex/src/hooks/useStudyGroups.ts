import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { StudyGroup, User } from '../types';

export const useStudyGroups = () => {
  const { user } = useAuth();
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for when database is not available
  const mockStudyGroups: StudyGroup[] = [
    {
      id: '1',
      name: 'Data Structures & Algorithms Mastery',
      subject: 'Computer Science',
      description: 'Weekly problem-solving sessions focusing on coding interview preparation and algorithmic thinking.',
      members: [
        {
          id: '1',
          name: 'Sarah Chen',
          email: 'sarah@mit.edu',
          college: 'MIT',
          branch: 'Computer Science',
          year: 3,
          isVerified: true,
          isAnonymous: false,
          joinedAt: new Date(),
          lastActive: new Date(),
        },
        {
          id: '2',
          name: 'Mike Johnson',
          email: 'mike@stanford.edu',
          college: 'Stanford',
          branch: 'Computer Science',
          year: 2,
          isVerified: true,
          isAnonymous: false,
          joinedAt: new Date(),
          lastActive: new Date(),
        }
      ],
      maxMembers: 15,
      createdBy: {
        id: '1',
        name: 'Sarah Chen',
        email: 'sarah@mit.edu',
        college: 'MIT',
        branch: 'Computer Science',
        year: 3,
        isVerified: true,
        isAnonymous: false,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
      isPrivate: false,
      tags: ['DSA', 'Coding', 'Interview Prep'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      name: 'Quantum Physics Discussion Circle',
      subject: 'Physics',
      description: 'Deep dive into quantum mechanics concepts, problem-solving, and research discussions.',
      members: [
        {
          id: '3',
          name: 'Alex Rodriguez',
          email: 'alex@caltech.edu',
          college: 'Caltech',
          branch: 'Physics',
          year: 4,
          isVerified: true,
          isAnonymous: false,
          joinedAt: new Date(),
          lastActive: new Date(),
        }
      ],
      maxMembers: 10,
      createdBy: {
        id: '3',
        name: 'Alex Rodriguez',
        email: 'alex@caltech.edu',
        college: 'Caltech',
        branch: 'Physics',
        year: 4,
        isVerified: true,
        isAnonymous: false,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
      isPrivate: true,
      tags: ['Quantum', 'Physics', 'Research'],
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      name: 'Mechanical Design Project Team',
      subject: 'Mechanical Engineering',
      description: 'Collaborative group working on innovative mechanical design projects and CAD modeling.',
      members: [
        {
          id: '4',
          name: 'Emily Wang',
          email: 'emily@stanford.edu',
          college: 'Stanford',
          branch: 'Mechanical Engineering',
          year: 3,
          isVerified: true,
          isAnonymous: false,
          joinedAt: new Date(),
          lastActive: new Date(),
        }
      ],
      maxMembers: 8,
      createdBy: {
        id: '4',
        name: 'Emily Wang',
        email: 'emily@stanford.edu',
        college: 'Stanford',
        branch: 'Mechanical Engineering',
        year: 3,
        isVerified: true,
        isAnonymous: false,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
      isPrivate: false,
      tags: ['CAD', 'Design', 'Projects'],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ];

  const fetchStudyGroups = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from database first
      const { data, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          profiles!study_groups_created_by_fkey (
            id,
            name,
            email,
            college,
            branch,
            year,
            is_verified,
            avatar_url
          ),
          study_group_members (
            profiles (
              id,
              name,
              email,
              college,
              branch,
              year,
              is_verified,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Database not available, using mock data:', error.message);
        // Use mock data if database is not available
        setStudyGroups(mockStudyGroups);
        return;
      }

      const formattedGroups: StudyGroup[] = data?.map((group: any) => ({
        id: group.id,
        name: group.name,
        subject: group.subject,
        description: group.description,
        members: group.study_group_members?.map((member: any) => ({
          id: member.profiles.id,
          name: member.profiles.name,
          email: member.profiles.email,
          college: member.profiles.college,
          branch: member.profiles.branch,
          year: member.profiles.year,
          isVerified: member.profiles.is_verified,
          isAnonymous: false,
          avatar: member.profiles.avatar_url,
          joinedAt: new Date(),
          lastActive: new Date(),
        })) || [],
        maxMembers: group.max_members,
        createdBy: {
          id: group.profiles.id,
          name: group.profiles.name,
          email: group.profiles.email,
          college: group.profiles.college,
          branch: group.profiles.branch,
          year: group.profiles.year,
          isVerified: group.profiles.is_verified,
          isAnonymous: false,
          avatar: group.profiles.avatar_url,
          joinedAt: new Date(),
          lastActive: new Date(),
        },
        isPrivate: group.is_private,
        tags: group.tags || [],
        createdAt: new Date(group.created_at),
      })) || [];

      setStudyGroups(formattedGroups);
    } catch (err) {
      console.warn('Error fetching study groups, using mock data:', err);
      // Use mock data as fallback
      setStudyGroups(mockStudyGroups);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStudyGroups();
  }, [fetchStudyGroups]);

  const createStudyGroup = async (groupData: {
    name: string;
    subject: string;
    description: string;
    maxMembers: number;
    isPrivate: boolean;
    tags: string[];
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Try to create in database first
      const { data, error } = await supabase
        .from('study_groups')
        .insert({
          name: groupData.name,
          subject: groupData.subject,
          description: groupData.description,
          max_members: groupData.maxMembers,
          is_private: groupData.isPrivate,
          tags: groupData.tags,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.warn('Database not available, using mock data for creation');
        // Create mock group
        const newGroup: StudyGroup = {
          id: Date.now().toString(),
          name: groupData.name,
          subject: groupData.subject,
          description: groupData.description,
          maxMembers: groupData.maxMembers,
          isPrivate: groupData.isPrivate,
          tags: groupData.tags,
          members: [{
            id: user.id,
            name: user.name || 'You',
            email: user.email || '',
            college: user.college || '',
            branch: user.branch || '',
            year: user.year || 1,
            isVerified: user.isVerified || false,
            isAnonymous: false,
            joinedAt: new Date(),
            lastActive: new Date(),
          }],
          createdBy: {
            id: user.id,
            name: user.name || 'You',
            email: user.email || '',
            college: user.college || '',
            branch: user.branch || '',
            year: user.year || 1,
            isVerified: user.isVerified || false,
            isAnonymous: false,
            joinedAt: new Date(),
            lastActive: new Date(),
          },
          createdAt: new Date(),
        };
        
        setStudyGroups(prev => [newGroup, ...prev]);
        return newGroup;
      }

      // Add creator as first member
      await supabase
        .from('study_group_members')
        .insert({
          group_id: data.id,
          user_id: user.id,
          role: 'admin',
        });

      await fetchStudyGroups();
      return data;
    } catch (err) {
      console.error('Error creating study group:', err);
      throw err;
    }
  };

  const joinStudyGroup = async (groupId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Try to join in database first
      const { error } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member',
        });

      if (error) {
        console.warn('Database not available, using mock data for join');
        // Update mock data
        setStudyGroups(prev => prev.map(group => {
          if (group.id === groupId && !group.members.some(member => member.id === user.id)) {
            return {
              ...group,
              members: [...group.members, {
                id: user.id,
                name: user.name || 'You',
                email: user.email || '',
                college: user.college || '',
                branch: user.branch || '',
                year: user.year || 1,
                isVerified: user.isVerified || false,
                isAnonymous: false,
                joinedAt: new Date(),
                lastActive: new Date(),
              }]
            };
          }
          return group;
        }));
        return;
      }

      await fetchStudyGroups();
    } catch (err) {
      console.error('Error joining study group:', err);
      throw err;
    }
  };

  const leaveStudyGroup = async (groupId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Try to leave in database first
      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) {
        console.warn('Database not available, using mock data for leave');
        // Update mock data
        setStudyGroups(prev => prev.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              members: group.members.filter(member => member.id !== user.id)
            };
          }
          return group;
        }));
        return;
      }

      await fetchStudyGroups();
    } catch (err) {
      console.error('Error leaving study group:', err);
      throw err;
    }
  };

  const updateStudyGroup = async (groupId: string, updates: Partial<{
    name: string;
    subject: string;
    description: string;
    maxMembers: number;
    isPrivate: boolean;
    tags: string[];
  }>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('study_groups')
        .update({
          name: updates.name,
          subject: updates.subject,
          description: updates.description,
          max_members: updates.maxMembers,
          is_private: updates.isPrivate,
          tags: updates.tags,
        })
        .eq('id', groupId)
        .eq('created_by', user.id);

      if (error) throw error;

      await fetchStudyGroups();
    } catch (err) {
      console.error('Error updating study group:', err);
      throw err;
    }
  };

  const deleteStudyGroup = async (groupId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Delete all members first
      await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId);

      // Delete the group
      const { error } = await supabase
        .from('study_groups')
        .delete()
        .eq('id', groupId)
        .eq('created_by', user.id);

      if (error) throw error;

      await fetchStudyGroups();
    } catch (err) {
      console.error('Error deleting study group:', err);
      throw err;
    }
  };

  const isUserMember = (groupId: string) => {
    if (!user) return false;
    const group = studyGroups.find(g => g.id === groupId);
    return group?.members.some(member => member.id === user.id) || false;
  };

  const isUserAdmin = (groupId: string) => {
    if (!user) return false;
    const group = studyGroups.find(g => g.id === groupId);
    return group?.createdBy.id === user.id;
  };

  return {
    studyGroups,
    loading,
    error,
    createStudyGroup,
    joinStudyGroup,
    leaveStudyGroup,
    updateStudyGroup,
    deleteStudyGroup,
    isUserMember,
    isUserAdmin,
    refetch: fetchStudyGroups,
  };
};

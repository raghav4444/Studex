import React, { useState } from 'react';
import { CreditCard as Edit, Shield, Eye, EyeOff, BookOpen, MessageSquare, Award, Calendar, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../AuthProvider';

const ProfilePage: React.FC = () => {
  const { user, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(user?.isAnonymous || false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
  });

  if (!user) return null;

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        name: editForm.name,
        bio: editForm.bio,
        skills: editForm.skills,
        isAnonymous,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const stats = [
    { label: 'Posts Shared', value: 12, icon: MessageSquare },
    { label: 'Notes Uploaded', value: 5, icon: BookOpen },
    { label: 'Mentorship Connections', value: 3, icon: Users },
    { label: 'Events Attended', value: 8, icon: Calendar },
  ];

  const achievements = [
    { title: 'Knowledge Sharer', description: 'Uploaded 5+ notes', icon: BookOpen, color: 'blue' },
    { title: 'Community Helper', description: 'Helped 10+ students', icon: Users, color: 'green' },
    { title: 'Active Learner', description: 'Attended 5+ events', icon: Calendar, color: 'purple' },
    { title: 'Rising Star', description: 'Top contributor this month', icon: TrendingUp, color: 'yellow' },
  ];

  const getAchievementColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500/20 text-blue-400',
      green: 'bg-green-500/20 text-green-400',
      purple: 'bg-purple-500/20 text-purple-400',
      yellow: 'bg-yellow-500/20 text-yellow-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-[#161b22] rounded-lg p-8 border border-gray-800 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-all ${
                  isAnonymous 
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' 
                    : 'bg-gray-700 text-gray-300 border border-gray-600'
                }`}
              >
                {isAnonymous ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{isAnonymous ? 'Anonymous Mode' : 'Public Profile'}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              {user.isVerified && (
                <div className="flex items-center space-x-1 bg-blue-500/20 px-2 py-1 rounded-full">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-300 font-medium">Verified</span>
                </div>
              )}
            </div>
            
            <div className="space-y-1 text-gray-400 mb-4">
              <p>{user.branch} • {user.year}th Year</p>
              <p>{user.college}</p>
              <p>{user.email}</p>
            </div>

            <p className="text-gray-300 mb-6">{user.bio || 'No bio added yet.'}</p>

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
              >
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievements */}
      <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Award className="w-5 h-5 text-yellow-400" />
          <span>Achievements</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <div key={index} className="flex items-center space-x-4 p-4 bg-[#0d1117] rounded-lg border border-gray-700">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getAchievementColor(achievement.color)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{achievement.title}</h4>
                  <p className="text-sm text-gray-400">{achievement.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-[#0d1117] rounded-lg border border-gray-700">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-white">Uploaded "Linear Algebra Notes"</p>
              <p className="text-sm text-gray-400">2 hours ago</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-[#0d1117] rounded-lg border border-gray-700">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-white">Posted in College Hub</p>
              <p className="text-sm text-gray-400">1 day ago</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-[#0d1117] rounded-lg border border-gray-700">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-white">Connected with mentor Alex Rodriguez</p>
              <p className="text-sm text-gray-400">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
import React, { useState, useEffect } from 'react';
import { 
  CreditCard as Edit, 
  Shield, 
  Eye, 
  EyeOff, 
  BookOpen, 
  MessageSquare, 
  Award, 
  Calendar, 
  Users, 
  TrendingUp,
  Heart,
  ThumbsUp,
  Star,
  Zap,
  Target,
  Activity,
  Clock,
  Filter,
  MoreHorizontal,
  ExternalLink,
  ChevronRight,
  BarChart3,
  UserPlus,
  Bookmark,
  Share2,
  Settings,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'trending' | 'stats'>('overview');
  const [showSettings, setShowSettings] = useState(false);

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

  // Enhanced stats with more detailed metrics
  const [stats] = useState({
    posts: 12,
    notes: 5,
    mentorship: 3,
    events: 8,
    likes: 247,
    comments: 89,
    followers: 156,
    following: 98,
    studyHours: 42.5,
    achievements: 7
  });

  // Trending topics data
  const [trendingTopics] = useState([
    { 
      name: '#ExamPrep2024', 
      posts: 45, 
      trending: true, 
      category: 'Study',
      engagement: 'high',
      yourPosts: 2
    },
    { 
      name: '#StudyGroup', 
      posts: 32, 
      trending: false, 
      category: 'Community',
      engagement: 'medium',
      yourPosts: 1
    },
    { 
      name: '#InternshipTips', 
      posts: 28, 
      trending: true, 
      category: 'Career',
      engagement: 'high',
      yourPosts: 0
    },
    { 
      name: '#ProjectHelp', 
      posts: 19, 
      trending: false, 
      category: 'Academic',
      engagement: 'medium',
      yourPosts: 3
    },
    { 
      name: '#CareerAdvice', 
      posts: 15, 
      trending: false, 
      category: 'Career',
      engagement: 'low',
      yourPosts: 1
    }
  ]);

  // Enhanced recent activity
  const [recentActivity] = useState([
    { 
      type: 'post', 
      action: 'shared a post', 
      content: 'Study tips for finals week', 
      time: '2m ago', 
      icon: MessageSquare, 
      color: 'blue',
      likes: 12,
      comments: 3
    },
    { 
      type: 'note', 
      action: 'uploaded notes', 
      content: 'Linear Algebra - Chapter 5', 
      time: '1h ago', 
      icon: BookOpen, 
      color: 'green',
      downloads: 8
    },
    { 
      type: 'like', 
      action: 'liked a post', 
      content: 'Sarah Chen\'s study schedule', 
      time: '2h ago', 
      icon: Heart, 
      color: 'red'
    },
    { 
      type: 'comment', 
      action: 'commented on', 
      content: 'Mike Johnson\'s project showcase', 
      time: '3h ago', 
      icon: MessageSquare, 
      color: 'blue'
    },
    { 
      type: 'follow', 
      action: 'started following', 
      content: 'Alex Kumar', 
      time: '5h ago', 
      icon: UserPlus, 
      color: 'green'
    },
    { 
      type: 'achievement', 
      action: 'earned badge', 
      content: 'Helpful Contributor', 
      time: '1d ago', 
      icon: Award, 
      color: 'yellow'
    },
    { 
      type: 'event', 
      action: 'attended event', 
      content: 'Study Group Meeting', 
      time: '2d ago', 
      icon: Calendar, 
      color: 'purple'
    }
  ]);

  // Community stats
  const [communityStats] = useState({
    totalPosts: 1247,
    activeUsers: 89,
    studyGroups: 15,
    events: 23,
    mentorshipConnections: 45,
    notesShared: 234,
    totalLikes: 5678,
    totalComments: 1234
  });

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

  const getActivityColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500/20 text-blue-400',
      green: 'bg-green-500/20 text-green-400',
      red: 'bg-red-500/20 text-red-400',
      purple: 'bg-purple-500/20 text-purple-400',
      yellow: 'bg-yellow-500/20 text-yellow-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'high': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatTimeAgo = (time: string) => {
    return time; // Already formatted in mock data
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Profile Header - Instagram Style */}
      <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-4xl mb-4 border-4 border-gray-800">
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
                <span>{isAnonymous ? 'Anonymous' : 'Public'}</span>
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              <h1 className="text-3xl font-bold text-white">{user.name}</h1>
              {user.isVerified && (
                <div className="flex items-center space-x-1 bg-blue-500/20 px-2 py-1 rounded-full">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-300 font-medium">Verified</span>
                </div>
              )}
            </div>
            
            <div className="space-y-1 text-gray-400 mb-4">
              <p className="text-lg">{user.branch} • {user.year}th Year</p>
              <p>{user.college}</p>
            </div>

            <p className="text-gray-300 mb-6 max-w-md">{user.bio || 'No bio added yet.'}</p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 font-medium"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instagram-style Stats */}
      <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.posts}</div>
            <div className="text-sm text-gray-400">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.followers}</div>
            <div className="text-sm text-gray-400">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.following}</div>
            <div className="text-sm text-gray-400">Following</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.likes}</div>
            <div className="text-sm text-gray-400">Likes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.achievements}</div>
            <div className="text-sm text-gray-400">Badges</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-[#161b22] rounded-lg border border-gray-800 mb-6">
        <div className="flex items-center space-x-1 p-1">
          {[
            { key: 'overview', label: 'Overview', icon: Activity },
            { key: 'activity', label: 'Activity', icon: Clock },
            { key: 'trending', label: 'Trending', icon: TrendingUp },
            { key: 'stats', label: 'Stats', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Achievements */}
              <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span>Achievements</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-[#0d1117] rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getAchievementColor(achievement.color)}`}>
                          <Icon className="w-6 h-6" />
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
            </>
          )}

          {activeTab === 'activity' && (
            <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>Recent Activity</span>
              </h3>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-[#0d1117] rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.color)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white">
                          <span className="font-medium">You</span> {activity.action} <span className="font-medium">"{activity.content}"</span>
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-400">{activity.time}</span>
                          {activity.likes && (
                            <div className="flex items-center space-x-1 text-sm text-gray-400">
                              <Heart className="w-3 h-3" />
                              <span>{activity.likes}</span>
                            </div>
                          )}
                          {activity.comments && (
                            <div className="flex items-center space-x-1 text-sm text-gray-400">
                              <MessageSquare className="w-3 h-3" />
                              <span>{activity.comments}</span>
                            </div>
                          )}
                          {activity.downloads && (
                            <div className="flex items-center space-x-1 text-sm text-gray-400">
                              <BookOpen className="w-3 h-3" />
                              <span>{activity.downloads} downloads</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'trending' && (
            <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span>Trending Topics</span>
              </h3>
              
              <div className="space-y-4">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#0d1117] rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400 font-medium">{topic.name}</span>
                        {topic.trending && <Zap className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getEngagementColor(topic.engagement)}`}>
                        {topic.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-white">{topic.posts} posts</div>
                        {topic.yourPosts > 0 && (
                          <div className="text-xs text-blue-400">{topic.yourPosts} yours</div>
                        )}
                      </div>
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <span>Detailed Stats</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#0d1117] rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-white">{stats.posts}</div>
                  <div className="text-sm text-gray-400">Posts Shared</div>
                </div>
                <div className="p-4 bg-[#0d1117] rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-white">{stats.notes}</div>
                  <div className="text-sm text-gray-400">Notes Uploaded</div>
                </div>
                <div className="p-4 bg-[#0d1117] rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-white">{stats.likes}</div>
                  <div className="text-sm text-gray-400">Likes Received</div>
                </div>
                <div className="p-4 bg-[#0d1117] rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-white">{stats.comments}</div>
                  <div className="text-sm text-gray-400">Comments</div>
                </div>
                <div className="p-4 bg-[#0d1117] rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-white">{stats.studyHours}h</div>
                  <div className="text-sm text-gray-400">Study Hours</div>
                </div>
                <div className="p-4 bg-[#0d1117] rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-white">{stats.achievements}</div>
                  <div className="text-sm text-gray-400">Achievements</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Community Stats */}
          <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-orange-400" />
              <span>Community Stats</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Posts</span>
                <span className="text-white font-medium">{communityStats.totalPosts.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Active Users</span>
                <span className="text-white font-medium">{communityStats.activeUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Study Groups</span>
                <span className="text-white font-medium">{communityStats.studyGroups}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Events</span>
                <span className="text-white font-medium">{communityStats.events}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Mentorship</span>
                <span className="text-white font-medium">{communityStats.mentorshipConnections}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Notes Shared</span>
                <span className="text-white font-medium">{communityStats.notesShared}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-[#0d1117] rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span className="text-white">Share Notes</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-[#0d1117] rounded-lg border border-gray-700 hover:border-green-500 transition-colors">
                <Users className="w-5 h-5 text-green-400" />
                <span className="text-white">Create Study Group</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-[#0d1117] rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="text-white">Add Event</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-[#0d1117] rounded-lg border border-gray-700 hover:border-orange-500 transition-colors">
                <Award className="w-5 h-5 text-orange-400" />
                <span className="text-white">View Achievements</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
import React, { useState } from 'react';
import { Users, Search, Plus, Lock, Globe, BookOpen } from 'lucide-react';
import { StudyGroup } from '../../types';
import { useAuth } from '../AuthProvider';

const StudyGroupsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const [studyGroups] = useState<StudyGroup[]>([
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
  ]);

  const subjects = ['all', 'Computer Science', 'Physics', 'Mechanical Engineering', 'Mathematics', 'Chemistry'];

  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || group.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Study Groups</h1>
          <p className="text-gray-400">Join collaborative learning communities and study together</p>
        </div>
        
        <button
          onClick={() => setShowCreateGroup(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Create Group</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search study groups..."
              className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            />
          </div>

          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all appearance-none"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Study Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <div key={group.id} className="bg-[#161b22] rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                {group.isPrivate ? (
                  <Lock className="w-4 h-4 text-orange-400" />
                ) : (
                  <Globe className="w-4 h-4 text-green-400" />
                )}
              </div>
              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                {group.subject}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
              {group.name}
            </h3>

            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
              {group.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {group.tags.map((tag, index) => (
                <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 3).map((member, index) => (
                    <div key={index} className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-[#161b22]">
                      {member.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-400">
                  {group.members.length}/{group.maxMembers} members
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {group.createdBy.name.charAt(0)}
                </div>
                <span className="text-sm text-gray-400">{group.createdBy.name}</span>
              </div>
              
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-all duration-200">
                {group.isPrivate ? 'Request Join' : 'Join Group'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No study groups found</h3>
          <p className="text-gray-400">Try adjusting your search or create a new study group</p>
        </div>
      )}
    </div>
  );
};

export default StudyGroupsPage;
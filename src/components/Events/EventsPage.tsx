import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Plus, Filter, Search } from 'lucide-react';
import { Event } from '../../types';
import { useAuth } from '../AuthProvider';

const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'AI/ML Study Group - Weekly Meetup',
      description: 'Join us for our weekly AI/ML study session. This week we\'re covering neural networks and deep learning fundamentals.',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      location: 'MIT Library, Room 302',
      organizer: {
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
      attendees: ['1', '2', '3', '4', '5'],
      maxAttendees: 20,
      tags: ['AI', 'Machine Learning', 'Study Group'],
      isOnline: false,
    },
    {
      id: '2',
      title: 'Virtual Career Fair - Tech Companies',
      description: 'Connect with recruiters from top tech companies. Bring your resume and be ready for on-the-spot interviews!',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      location: 'Online Event',
      organizer: {
        id: '2',
        name: 'Career Services',
        email: 'careers@stanford.edu',
        college: 'Stanford University',
        branch: 'Career Services',
        year: 0,
        isVerified: true,
        isAnonymous: false,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
      attendees: ['1', '2', '3'],
      maxAttendees: 100,
      tags: ['Career', 'Tech', 'Networking'],
      isOnline: true,
      meetingLink: 'https://meet.google.com/abc-def-ghi',
    },
    {
      id: '3',
      title: 'Physics Problem Solving Workshop',
      description: 'Struggling with quantum mechanics? Join our interactive workshop where seniors will help solve complex physics problems.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: 'Caltech Physics Building',
      organizer: {
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
      attendees: ['1', '2'],
      maxAttendees: 15,
      tags: ['Physics', 'Workshop', 'Problem Solving'],
      isOnline: false,
    },
  ]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'online' && event.isOnline) ||
                         (selectedFilter === 'offline' && !event.isOnline) ||
                         (selectedFilter === 'my-college' && event.organizer.college === user?.college);
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Campus Events</h1>
          <p className="text-gray-400">Discover and join events happening in your college and beyond</p>
        </div>
        
        <button
          onClick={() => setShowCreateEvent(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Create Event</span>
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
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all appearance-none"
            >
              <option value="all">All Events</option>
              <option value="my-college">My College</option>
              <option value="online">Online Events</option>
              <option value="offline">In-Person Events</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-[#161b22] rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-wrap gap-2">
                {event.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              {event.isOnline && (
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                  Online
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
              {event.title}
            </h3>

            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
              {event.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{formatDate(event.date)}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{event.location}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  {event.attendees.length}/{event.maxAttendees || '∞'} attending
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {event.organizer.name.charAt(0)}
                </div>
                <span className="text-sm text-gray-400">{event.organizer.name}</span>
              </div>
              
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-all duration-200">
                Join Event
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No events found</h3>
          <p className="text-gray-400">Try adjusting your search or create a new event</p>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
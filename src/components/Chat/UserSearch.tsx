import React, { useState, useRef, useEffect } from 'react';
import { Search, X, User, MessageCircle, Clock } from 'lucide-react';
import { useUserSearch } from '../../hooks/useUserSearch';
import { ChatSearchResult } from '../../types';

interface UserSearchProps {
  onUserSelect: (user: ChatSearchResult) => void;
  onClose: () => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onUserSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchResults, loading, error, searchUsers, clearSearch } = useUserSearch();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      } else {
        clearSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers, clearSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const formatLastSeen = (date: Date | null) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={searchRef}
        className="bg-[#161b22] rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl border border-gray-800"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-[#161b22]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Start a conversation</h2>
              <p className="text-gray-400 text-sm">Find someone to chat with</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && searchResults.length === 0 && searchQuery && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
              <p className="text-gray-400 text-sm">Try a different search term</p>
            </div>
          )}

          {!loading && !error && searchResults.length > 0 && (
            <div className="p-2">
              {searchResults.map((user, index) => (
                <button
                  key={user.id}
                  onClick={() => {
                    console.log('🔍 UserSearch: User clicked:', user);
                    onUserSelect(user);
                  }}
                  className="w-full p-4 hover:bg-gray-800 transition-colors text-left rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-300 font-medium">
                            {user.name ? user.name[0].toUpperCase() : '?'}
                          </span>
                        )}
                      </div>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#161b22]"></div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-white font-medium truncate">{user.name}</p>
                        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
                          @{user.username}
                        </span>
                      </div>
                       <p className="text-gray-400 text-sm truncate mb-1">
                         {user.college && user.college.length > 15 
                           ? `${user.college.substring(0, 15)}...` 
                           : user.college} • {user.branch} • Year {user.year}
                       </p>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {user.isOnline ? (
                            <span className="text-green-400 font-medium">Online now</span>
                          ) : (
                            `Last seen ${formatLastSeen(user.lastSeen)}`
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Message Button */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
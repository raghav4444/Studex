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

  // Handle search with debounce
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

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return 'Never';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        ref={searchRef}
        className="bg-[#161b22] rounded-lg border border-gray-800 w-full max-w-md max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Search Users</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by username, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center">
              <div className="w-6 h-6 bg-blue-500 rounded-lg animate-pulse mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Searching...</p>
            </div>
          )}

          {error && (
            <div className="p-4 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && searchResults.length === 0 && searchQuery && (
            <div className="p-4 text-center">
              <User className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No users found</p>
            </div>
          )}

          {!loading && !error && searchResults.length > 0 && (
            <div className="space-y-1">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => onUserSelect(user)}
                  className="w-full p-3 hover:bg-[#0d1117] transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#161b22]"></div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-medium truncate">{user.name}</p>
                        <span className="text-gray-500 text-sm">@{user.username}</span>
                      </div>
                      <p className="text-gray-400 text-sm truncate">
                        {user.college} • {user.branch} • {user.year}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-500 text-xs">
                          {user.isOnline ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen)}`}
                        </span>
                      </div>
                    </div>

                    {/* Message Button */}
                    <div className="flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-blue-400" />
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

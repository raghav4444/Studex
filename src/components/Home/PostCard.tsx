import React from 'react';
import { Download, Clock, Shield, Heart, MessageSquare, Share } from 'lucide-react';
import { Post } from '../../types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all duration-200">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
          {post.isAnonymous ? '?' : post.author.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-white">
              {post.isAnonymous ? 'Anonymous' : post.author.name}
            </span>
            {post.author.isVerified && (
              <Shield className="w-4 h-4 text-blue-400" />
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{post.likes || 0}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">{post.comments?.length || 0}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors">
                  <Share className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">{post.author.college}</span>
            <span className="text-sm text-gray-500">•</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>
          
          <p className="text-gray-300 mb-4 leading-relaxed">{post.content}</p>
          
          {post.fileUrl && (
            <div className="flex items-center space-x-3 p-3 bg-[#0d1117] rounded-lg border border-gray-700">
              <div className="flex items-center space-x-2 flex-1">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Download className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{post.fileName}</p>
                  <p className="text-xs text-gray-500">{post.fileType}</p>
                </div>
              </div>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                Download
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
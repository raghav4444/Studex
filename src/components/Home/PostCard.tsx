import React, { useState } from 'react';
import { 
  Download, 
  Clock, 
  Shield, 
  Heart, 
  MessageSquare, 
  Share2, 
  MoreHorizontal,
  Eye,
  Bookmark,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Copy
} from 'lucide-react';
import { Post } from '../../types';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onUnlike?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onUnlike }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [commentText, setCommentText] = useState('');

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      onUnlike?.(post.id);
    } else {
      setIsLiked(true);
      onLike?.(post.id);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.author.name}`,
          text: post.content,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${post.content}\n\n- ${post.author.name}`);
    }
  };


  const handleComment = () => {
    if (commentText.trim()) {
      // TODO: Implement comment functionality
      console.log('Adding comment:', commentText);
      setCommentText('');
    }
  };

  return (
    <div className="bg-[#161b22] rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-200 group">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
            {post.isAnonymous ? '?' : post.author.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-white">
                {post.isAnonymous ? 'Anonymous' : post.author.name}
              </span>
              {post.author.isVerified && (
                <Shield className="w-4 h-4 text-blue-400" />
              )}
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{post.author.college}</span>
              <span className="text-sm text-gray-500">•</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* More Options */}
          <div className="relative">
            <button 
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {showMoreOptions && (
              <div className="absolute right-0 top-10 bg-[#0d1117] border border-gray-700 rounded-lg shadow-lg z-10 min-w-[160px]">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center space-x-2">
                  <Bookmark className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center space-x-2">
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center space-x-2">
                  <Flag className="w-4 h-4" />
                  <span>Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Attachment */}
      {post.fileUrl && (
        <div className="px-6 pb-4">
          <div className="flex items-center space-x-3 p-4 bg-[#0d1117] rounded-lg border border-gray-700">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{post.fileName}</p>
              <p className="text-xs text-gray-500">{post.fileType}</p>
            </div>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="px-6 py-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{post.likes || 0}</span>
            </button>
            
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments?.length || 0}</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </button>

            <button className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors">
              <Eye className="w-5 h-5" />
              <span className="text-sm font-medium">View</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-1 text-gray-400 hover:text-yellow-400 transition-colors">
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-300 transition-colors">
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-6 py-4 border-t border-gray-800 bg-[#0d1117]">
          {/* Comment Input */}
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              U
            </div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 bg-[#161b22] border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                rows={2}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <button className="text-xs text-gray-500 hover:text-white transition-colors">
                    Anonymous
                  </button>
                </div>
                <button 
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                  className="px-4 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white text-sm rounded-lg transition-colors"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {comment.isAnonymous ? '?' : comment.author.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {comment.isAnonymous ? 'Anonymous' : comment.author.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
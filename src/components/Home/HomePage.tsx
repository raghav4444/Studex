import React, { useState } from 'react';
import { School, Globe } from 'lucide-react';
import { useAuth } from '../AuthProvider';

// Lazy load components for better performance
const PostComposer = React.lazy(() => import('./PostComposer'));
const PostCard = React.lazy(() => import('./PostCard'));
const PostsHook = React.lazy(() => import('../../hooks/usePosts').then(module => ({ default: () => module.usePosts })));

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'college' | 'global'>('college');
  
  // Mock data for better performance - replace with real data when needed
  const [posts] = useState([]);
  const [loading] = useState(false);
  
  const createPost = async (content: string, file?: File, isAnonymous?: boolean) => {
    // Mock implementation - replace with real API call
    console.log('Creating post:', { content, file, isAnonymous });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 mb-8 bg-[#161b22] p-1 rounded-lg border border-gray-800 w-fit">
        <button
          onClick={() => setActiveTab('college')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
            activeTab === 'college'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <School className="w-4 h-4" />
          <span className="font-medium">College Hub</span>
        </button>
        
        <button
          onClick={() => setActiveTab('global')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
            activeTab === 'global'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span className="font-medium">Global Feed</span>
        </button>
      </div>

      {/* Post Composer */}
      <div className="mb-8">
        <React.Suspense fallback={<div className="bg-[#161b22] rounded-lg p-6 border border-gray-800 animate-pulse h-32"></div>}>
          <PostComposer onPostCreate={createPost} />
        </React.Suspense>
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 bg-blue-500 rounded-lg animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-400">Loading posts...</p>
        </div>
      ) : (
      <div className="space-y-6">
        {posts.length > 0 ? (
          <React.Suspense fallback={<div className="space-y-6">{Array(3).fill(0).map((_, i) => <div key={i} className="bg-[#161b22] rounded-lg p-6 border border-gray-800 animate-pulse h-48"></div>)}</div>}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </React.Suspense>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'college' ? (
                <School className="w-8 h-8 text-gray-500" />
              ) : (
                <Globe className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
            <p className="text-gray-400">
              Be the first to share something with your {activeTab === 'college' ? 'college' : 'global'} community!
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default HomePage;
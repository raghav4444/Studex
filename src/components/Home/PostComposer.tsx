import React, { useState } from 'react';
import { Send, Paperclip, Eye, EyeOff } from 'lucide-react';

interface PostComposerProps {
  onPostCreate: (content: string, file?: File, isAnonymous?: boolean) => void;
}

const PostComposer: React.FC<PostComposerProps> = ({ onPostCreate }) => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onPostCreate(content, file || undefined, isAnonymous);
    setContent('');
    setFile(null);
    setIsAnonymous(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share something with your fellow students..."
          className="w-full h-24 p-4 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
          required
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <Paperclip className="w-5 h-5" />
              <span className="text-sm">Attach file</span>
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </label>

            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`flex items-center space-x-2 text-sm transition-all ${
                isAnonymous ? 'text-blue-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              {isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>Anonymous</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!content.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-all duration-200"
          >
            <Send className="w-4 h-4" />
            <span>Post</span>
          </button>
        </div>

        {file && (
          <div className="flex items-center space-x-2 p-3 bg-[#0d1117] rounded-lg border border-gray-700">
            <Paperclip className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">{file.name}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-red-400 hover:text-red-300 text-sm ml-auto"
            >
              Remove
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PostComposer;
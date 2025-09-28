import React, { useState } from 'react';
import { Search, Upload, Download, BookOpen, Filter, Heart, Star, Eye } from 'lucide-react';
import { Note } from '../../types';

const NotesLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [notes] = useState<Note[]>([
    {
      id: '1',
      userId: '1',
      title: 'Data Structures and Algorithms - Complete Notes',
      subject: 'Computer Science',
      semester: 'Semester 3',
      fileUrl: '#',
      fileName: 'DSA_Complete_Notes.pdf',
      fileSize: 2048576,
      downloads: 45,
      uploadedBy: {
        id: '1',
        name: 'Sarah Chen',
        email: 'sarah@mit.edu',
        college: 'MIT',
        branch: 'Computer Science',
        year: 3,
        isVerified: true,
        isAnonymous: false,
        createdAt: new Date(),
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      userId: '2',
      title: 'Thermodynamics Lecture Notes with Examples',
      subject: 'Mechanical Engineering',
      semester: 'Semester 4',
      fileUrl: '#',
      fileName: 'Thermodynamics_Notes.pdf',
      fileSize: 1536000,
      downloads: 23,
      uploadedBy: {
        id: '2',
        name: 'Mike Johnson',
        email: 'mike@stanford.edu',
        college: 'Stanford University',
        branch: 'Mechanical Engineering',
        year: 4,
        isVerified: true,
        isAnonymous: false,
        createdAt: new Date(),
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      userId: '3',
      title: 'Quantum Mechanics Problem Sets and Solutions',
      subject: 'Physics',
      semester: 'Semester 6',
      fileUrl: '#',
      fileName: 'Quantum_Mechanics_Problems.pdf',
      fileSize: 3072000,
      downloads: 67,
      uploadedBy: {
        id: '3',
        name: 'Alex Rodriguez',
        email: 'alex@caltech.edu',
        college: 'Caltech',
        branch: 'Physics',
        year: 4,
        isVerified: true,
        isAnonymous: false,
        createdAt: new Date(),
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ]);

  const subjects = ['all', 'Computer Science', 'Mechanical Engineering', 'Physics', 'Mathematics'];
  const semesters = ['all', 'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'];

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject;
    const matchesSemester = selectedSemester === 'all' || note.semester === selectedSemester;
    
    return matchesSearch && matchesSubject && matchesSemester;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Notes Library</h1>
          <p className="text-gray-400">Access and share study materials with your peers</p>
        </div>
        
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Notes</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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

          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all appearance-none"
            >
              {semesters.map(semester => (
                <option key={semester} value={semester}>
                  {semester === 'all' ? 'All Semesters' : semester}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Featured Notes Section */}
      <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-400" />
          <span>Featured Notes</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.slice(0, 2).map((note) => (
            <div key={note.id} className="flex items-center space-x-4 p-4 bg-[#0d1117] rounded-lg border border-gray-700">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white line-clamp-1">{note.title}</h4>
                <p className="text-sm text-gray-400">{note.subject} • {note.downloads} downloads</p>
              </div>
              <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-all duration-200">
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div key={note.id} className="bg-[#161b22] rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                {note.subject}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
              {note.title}
            </h3>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Uploaded by</span>
                <span className="text-gray-300">{note.uploadedBy.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Semester</span>
                <span className="text-gray-300">{note.semester}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Size</span>
                <span className="text-gray-300">{formatFileSize(note.fileSize)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Downloads</span>
                <span className="text-gray-300">{note.downloads}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Likes</span>
                <span className="text-gray-300">{note.likes || 0}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <button className="flex-1 flex items-center justify-center space-x-2 py-2 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200">
                  <Heart className="w-4 h-4" />
                  <span>Like</span>
                </button>
                
                <button className="flex-1 flex items-center justify-center space-x-2 py-2 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200">
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No notes found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default NotesLibrary;
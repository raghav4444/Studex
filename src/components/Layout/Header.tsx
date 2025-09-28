import React, { useState } from "react";
import {
  BookOpen,
  Users,
  MessageSquare,
  User,
  Home,
  Calendar,
  Briefcase,
  Bell,
  Menu,
  X,
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Memoize tabs to prevent re-renders
  const tabs = React.useMemo(
    () => [
      { id: "home", label: "Home", icon: Home },
      { id: "notes", label: "Notes", icon: BookOpen },
      { id: "events", label: "Events", icon: Calendar },
      { id: "study-groups", label: "Groups", icon: Users },
      { id: "mentorship", label: "Mentorship", icon: Users },
      { id: "jobs", label: "Jobs", icon: Briefcase },
      { id: "profile", label: "Profile", icon: User },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "skills", label: "Skill Hub", icon: MessageSquare },
    ],
    []
  );

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu when tab is selected
  };

  return (
    <>
      <header className="bg-[#161b22]/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 relative z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Desktop Logo */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Studex</h1>
          </div>

          {/* Mobile - Empty left space */}
          <div className="md:hidden w-8"></div>

          {/* Mobile - Centered Logo */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Studex</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 bg-white/5 backdrop-blur-md rounded-xl p-2 border border-white/10 shadow-2xl">
            {tabs.slice(0, 7).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 backdrop-blur-sm ${
                    activeTab === tab.id
                      ? "bg-blue-500/90 text-white shadow-lg shadow-blue-500/25 backdrop-blur-md"
                      : "text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-80 bg-[#0f1419]/95 backdrop-blur-2xl border-l border-white/20 transform transition-all duration-500 ease-out z-50 shadow-2xl ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background:
            "linear-gradient(135deg, rgba(15, 20, 25, 0.95) 0%, rgba(22, 27, 34, 0.98) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/20 flex items-center justify-between bg-white/5 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">Navigation</h2>
          </div>
          <button
            className="text-gray-300 hover:text-white transition-all duration-300 hover:bg-white/10 p-2 rounded-lg backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left backdrop-blur-sm border ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border-blue-400/30 shadow-lg shadow-blue-500/10"
                      : "text-gray-300 hover:text-white hover:bg-white/10 border-transparent hover:border-white/10 hover:shadow-md"
                  }`}
                  style={{
                    backdropFilter:
                      activeTab === tab.id ? "blur(10px)" : "blur(5px)",
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 bg-white/5 backdrop-blur-md">
          <div className="text-center text-gray-300">
            <p className="font-semibold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Studex
            </p>
            <p className="text-xs mt-1 text-gray-400">Connect • Learn • Grow</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;

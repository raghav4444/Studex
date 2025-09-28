import React from "react";
import {
  BookOpen,
  Users,
  MessageSquare,
  User,
  Home,
  Calendar,
  Briefcase,
  Bell,
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  // Memoize tabs to prevent re-renders
  const tabs = React.useMemo(
    () => [
      { id: "home", label: "Home", icon: Home },
      { id: "notes", label: "Notes", icon: BookOpen },
      { id: "events", label: "Events", icon: Calendar },
      { id: "study-groups", label: "Groups", icon: Users },
      { id: "mentorship", label: "Mentorship", icon: Users },
      { id: "jobs", label: "Jobs", icon: Briefcase },
      { id: "profile", label: "Profile", icon: User }, // Moved Profile to position 7
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "skills", label: "Skill Hub", icon: MessageSquare },
    ],
    []
  );

  return (
    <header className="bg-[#161b22] border-b border-gray-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">CampusLink</h1>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          {tabs.slice(0, 7).map((tab) => {
            // Include Profile tab (was 6, now 7)
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="md:hidden">
          <button className="text-gray-400 hover:text-white">
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden mt-3 flex items-center justify-around border-t border-gray-800 pt-3">
        {tabs.slice(0, 6).map((tab) => {
          // Include Profile tab for mobile (was 5, now 6)
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-blue-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};

export default Header;

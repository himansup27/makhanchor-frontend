import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Search, User, Settings, LogOut } from 'lucide-react';
import Logo from "../../Assets/images/makhanchor_logo.png";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Logo & Search */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-[200px] h-16 bg-gradient-to-br rounded-2xl">
                <img
                  src={Logo}
                  alt="Logo"
                  className="w-[200px] h-16"
                />
              </div>
              {/* <div>
                <h1 className="text-xl font-bold text-gray-900">MakhanChor</h1>
                <p className="text-xs text-gray-500">Biscuits Dashboard</p>
              </div> */}
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-4 py-2.5 w-80 border border-gray-200 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
              <Search className="text-gray-400 mr-3" size={18} />
              <input
                type="text"
                placeholder="Search production, inventory..."
                className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Right Section - Date & Actions */}
          <div className="flex items-center gap-4">
            {/* Date Display */}
            <div className="hidden lg:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">{currentDate}</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Settings */}
            <button 
              onClick={() => navigate('/settings')}
              className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Settings size={20} className="text-gray-600" />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
              </div>
              <div className="relative group">
                <button className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold shadow-md hover:shadow-lg transition-all">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </button>
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={() => navigate('/settings')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                  >
                    <User size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-700">Profile</span>
                  </button>
                  <button
                    onClick={() => navigate('/settings')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Settings size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-700">Settings</span>
                  </button>
                  <hr className="my-2 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-red-600 text-left"
                  >
                    <LogOut size={16} />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
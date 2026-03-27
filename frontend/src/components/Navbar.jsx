import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BrainCircuit, LogOut, LayoutDashboard, History } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
              <BrainCircuit className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">AI Interviewer</span>
          </Link>
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 text-sm font-medium pr-1">{user.name}</span>
                </div>
                <Link to="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/my-interviews" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                  <History className="h-4 w-4" />
                  <span>My Interviews</span>
                </Link>
                {user.isAdmin && (
                  <Link to="/admin/sessions" className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                    <BrainCircuit className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Log in</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

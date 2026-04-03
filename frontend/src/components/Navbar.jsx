import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BrainCircuit, LogOut, LayoutDashboard, History, Sun, Moon, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 fixed top-0 left-0 w-full z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 group shrink-0">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
              <BrainCircuit className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">AI Interviewer</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-gray-200 dark:border-gray-700 shadow-sm"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {user ? (
              <>
                <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs text-center leading-none">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-medium pr-1">{user.name}</span>
                </div>
                <Link to="/dashboard" className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/my-interviews" className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                  <History className="h-4 w-4" />
                  <span>My Interviews</span>
                </Link>
                {user.isAdmin && (
                  <Link to="/admin/sessions" className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold transition-colors">
                    <BrainCircuit className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Log in</Link>
                <Link to="/register" className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-all border border-indigo-700/20 shadow-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center space-x-3">
             <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pt-2 pb-6 space-y-4">
          {user ? (
            <>
              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 my-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-900 dark:text-white font-bold">{user.name}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">{user.email}</span>
                </div>
              </div>
              <Link to="/dashboard" onClick={toggleMenu} className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors">
                <LayoutDashboard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span>Dashboard</span>
              </Link>
              <Link to="/my-interviews" onClick={toggleMenu} className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors">
                <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span>My Interviews</span>
              </Link>
              {user.isAdmin && (
                <Link to="/admin/sessions" onClick={toggleMenu} className="flex items-center space-x-3 px-4 py-3 text-indigo-600 dark:text-indigo-400 font-black hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors border-l-4 border-indigo-600">
                  <BrainCircuit className="h-5 w-5" />
                  <span>Admin Panel</span>
                </Link>
              )}
              <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => { logout(); toggleMenu(); }}
                  className="w-full flex items-center space-x-3 px-4 py-4 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-3 pt-2">
              <Link to="/login" onClick={toggleMenu} className="w-full flex items-center justify-center py-4 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-900 rounded-2xl transition-colors border border-gray-100 dark:border-gray-800">
                Log in
              </Link>
              <Link to="/register" onClick={toggleMenu} className="w-full flex items-center justify-center py-4 bg-indigo-600 dark:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-indigo-900/40">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

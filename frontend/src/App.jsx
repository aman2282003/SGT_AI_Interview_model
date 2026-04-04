import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useContext, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InterviewRoom from './pages/InterviewRoom';
import Results from './pages/Results';

import MyInterviews from './pages/MyInterviews';
import AdminSessions from './pages/AdminSessions';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null; // Let AuthProvider handle the initial load state
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null; // Let AuthProvider handle the initial load state
  if (!user || !user.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    console.log(`[Navigation] URL changed to: ${location.pathname}${location.search}`);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-white dark:bg-gray-950 dark:text-gray-100">
      <Navbar />
      <main className="flex-1 w-full flex flex-col pt-16 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/my-interviews" element={
              <ProtectedRoute>
                <MyInterviews />
              </ProtectedRoute>
            } />
            <Route path="/admin/sessions" element={
              <ProtectedAdminRoute>
                <AdminSessions />
              </ProtectedAdminRoute>
            } />
            <Route path="/interview/:tech" element={
              <ProtectedRoute>
                <InterviewRoom />
              </ProtectedRoute>
            } />
            <Route path="/results/:id" element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, Code2, Video, MonitorUp, Award, ChevronDown, ChevronUp, MessageSquare, History, PlayCircle } from 'lucide-react';
import { API_BASE } from '../config/api';

export default function MyInterviews() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/api/interview/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSessions(res.data);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors duration-300"
    >
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3 transition-colors duration-300">
          <History className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 dark:text-indigo-400" />
          My Interviews Archive
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">Review your past performance, analyze AI feedback, and watch your recorded sessions.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
          <Code2 className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">No interviews found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-300">You haven't completed any mock interviews yet.</p>
          <Link to="/dashboard" className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors border border-indigo-700/20 dark:border-indigo-400/30">Go to Dashboard</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {sessions.map((session) => {
            const isExpanded = expandedId === session._id;
            const scoreColor = session.aiMarks >= 80 ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : session.aiMarks >= 50 ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
            
            return (
              <div key={session._id} className={`bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:border-indigo-200 dark:hover:border-indigo-500 hover:shadow-md'}`}>
                {/* Header Row (Clickable) */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : session._id)}
                  className="p-6 sm:p-8 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative"
                >
                  <div className={`absolute top-0 left-0 w-2 h-full ${session.aiMarks >= 80 ? 'bg-green-400' : session.aiMarks >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}></div>
                  
                  <div className="flex items-center gap-3 sm:gap-5 pl-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30 shadow-inner transition-colors duration-300">
                      <Code2 className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300">{session.techStack}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400 font-bold tracking-wide transition-colors duration-300">
                        <Calendar className="w-4 h-4 mr-1.5 opacity-70" /> 
                        {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        <span className="mx-2 text-gray-300">•</span>
                        {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-auto pl-4 sm:pl-0">
                    <div className={`px-5 py-2 rounded-xl font-bold text-lg border border-transparent flex items-center shadow-sm transition-colors duration-300 ${scoreColor}`}>
                      Score: {session.aiMarks} / 100
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors duration-300">
                      {isExpanded ? <ChevronUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Content Body */}
                {isExpanded && (
                  <div className="px-6 pb-6 sm:px-8 sm:pb-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 transition-colors duration-300">
                    
                    {/* Left Column: Feedback & Transcript */}
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-purple-100 dark:border-purple-900/30 relative transition-colors duration-300">
                        <div className="absolute top-4 right-4"><Award className="w-6 h-6 text-purple-200 dark:text-purple-800" /></div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-3 flex items-center transition-colors duration-300">
                          <Award className="w-4 h-4 mr-2" /> AI Evaluation
                        </h4>
                        <div className="prose prose-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed max-h-60 overflow-y-auto custom-scrollbar transition-colors duration-300">
                           <div style={{ whiteSpace: 'pre-wrap' }}>{session.aiFeedback}</div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/30 relative transition-colors duration-300">
                        <h4 className="text-sm font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 flex items-center transition-colors duration-300">
                          <MessageSquare className="w-4 h-4 mr-2" /> Full Transcript
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed shadow-inner max-h-48 overflow-y-auto custom-scrollbar transition-colors duration-300">
                          <div style={{ whiteSpace: 'pre-wrap' }}>{session.transcript}</div>
                        </div>
                      </div>
                      
                      <Link to={`/results/${session._id}`} className="inline-flex w-full items-center justify-center px-4 py-3 bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-gray-700 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors shadow-sm">
                        View Full Details Page
                      </Link>
                    </div>

                    {/* Right Column: Media Playback */}
                    <div className="flex flex-col space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center mb-1 transition-colors duration-300">
                        <PlayCircle className="w-4 h-4 mr-2" /> Session Recordings
                      </h4>
                      
                      {!session.screenVideoUrl && !session.cameraVideoUrl && (
                        <div className="flex-1 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center p-6 text-gray-400 dark:text-gray-500 font-medium text-center transition-colors duration-300">
                          No video recordings available for this historical session.
                        </div>
                      )}

                      {session.screenVideoUrl && (
                        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-md border-4 border-gray-200 dark:border-gray-800 relative group transition-colors duration-300">
                          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold flex items-center z-10">
                            <MonitorUp className="w-3 h-3 mr-1.5" /> Screen Capture
                          </div>
                          <video controls playsInline className="w-full h-auto max-h-[250px] object-cover">
                            <source 
                              src={session.screenVideoUrl.startsWith('http') ? session.screenVideoUrl : `${API_BASE}${session.screenVideoUrl}`} 
                              type="video/webm" 
                            />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                      
                      {session.cameraVideoUrl && (
                        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-md border-4 border-gray-200 dark:border-gray-800 relative group transition-colors duration-300">
                          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold flex items-center z-10">
                            <Video className="w-3 h-3 mr-1.5" /> Camera
                          </div>
                          <video controls playsInline className="w-full h-auto max-h-[250px] object-cover">
                            <source 
                              src={session.cameraVideoUrl.startsWith('http') ? session.cameraVideoUrl : `${API_BASE}${session.cameraVideoUrl}`} 
                              type="video/webm" 
                            />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                    </div>
                    
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

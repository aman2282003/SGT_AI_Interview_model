import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Award, AlertCircle, ChevronLeft, Calendar, Code2, MessageSquare, Video, MonitorUp, Sparkles, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../config/api';

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval;
    
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/api/interview/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSession(res.data);
        setLoading(false);

        // If AI assessment is done, clear the interval
        if (res.data.aiMarks !== null && interval) {
          clearInterval(interval);
          interval = null;
        }
      } catch (err) {
        console.error("Polling error:", err);
        setError('Failed to load interview results');
        setLoading(false);
        if (interval) clearInterval(interval);
      }
    };

    // Initial fetch
    fetchSession();

    // Only start polling if we don't have the result yet
    interval = setInterval(() => {
      // Check if we already have the session AND it still has no marks
      // Using a closure/ref or just checking the latest state via functional update is tricky in setInterval
      // but here we can just call fetchSession and it will handle the stop condition.
      fetchSession();
    }, 5000); // Poll every 5 seconds

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id]);

  if (loading) return <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  if (error) return (
    <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center flex-col space-y-4">
      <AlertCircle className="w-16 h-16 text-red-500" />
      <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{error}</h2>
      <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all">Return to Dashboard</button>
    </div>
  );

  if (!session) return null;

  const evaluationSteps = [
    { id: 1, label: 'Extracting technical keywords', delay: 0 },
    { id: 2, label: 'Analyzing response depth', delay: 1500 },
    { id: 3, label: 'Benchmarking against industry standards', delay: 3000 },
    { id: 4, label: 'Finalizing assessment report', delay: 4500 }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const isEvaluating = session.aiMarks === null;
  const scoreColor = isEvaluating ? 'text-indigo-600' : session.aiMarks >= 80 ? 'text-green-600' : session.aiMarks >= 50 ? 'text-amber-500' : 'text-red-500';
  const scoreBg = isEvaluating ? 'bg-indigo-50 border-indigo-200' : session.aiMarks >= 80 ? 'bg-green-50 border-green-200' : session.aiMarks >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors duration-300"
    >
      <button onClick={() => navigate('/dashboard')} className="flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all group bg-white dark:bg-gray-900 shadow-sm hover:shadow-md">
        <ChevronLeft className="w-5 h-5 mr-1 transform group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden relative transition-colors duration-300">
        <div className={`absolute top-0 left-0 w-full h-4 ${session.aiMarks >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-600' : session.aiMarks >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}></div>
        
        <div className="p-8 md:p-14">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-10 border-b border-gray-100 dark:border-gray-800 gap-8">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-4 transition-colors duration-300">
                <Code2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                {session.techStack} Assessment
              </h1>
              <div className="mt-4 flex items-center space-x-4 text-gray-500 dark:text-gray-400 font-bold tracking-wide transition-colors duration-300">
                <span className="flex items-center"><Calendar className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" /> {new Date(session.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(session.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 min-w-[14rem] shadow-sm transform hover:scale-105 transition-all duration-300 relative ${isEvaluating ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-900/30' : session.aiMarks >= 80 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30' : session.aiMarks >= 50 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30'}`}>
                {!isEvaluating && session.aiMarks >= 85 && (
                  <div className="absolute -top-3 -right-3">
                    <div className="bg-indigo-600 text-white p-2 rounded-full shadow-lg animate-bounce">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                )}
                <span className="text-sm font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300 font-sans">{isEvaluating ? 'Evaluating' : 'Total Score'}</span>
                <div className="flex items-baseline">
                  {isEvaluating ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                      <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Processing...</span>
                    </div>
                  ) : (
                    <>
                      <span className={`text-7xl font-black tracking-tighter transition-colors duration-300 font-sans ${isEvaluating ? 'text-indigo-600 dark:text-indigo-400' : session.aiMarks >= 80 ? 'text-green-600 dark:text-green-400' : session.aiMarks >= 50 ? 'text-amber-500 dark:text-amber-400' : 'text-red-500 dark:text-red-400'}`}>{session.aiMarks}</span>
                      <span className="text-3xl font-bold text-gray-400 dark:text-gray-500 ml-1">/100</span>
                    </>
                  )}
                </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isEvaluating ? (
              <motion.div 
                key="evaluating"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="grid grid-cols-1 gap-6 bg-gray-50 dark:bg-gray-800/50 p-8 rounded-3xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl">
                    <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">AI Interview Specialist is assessing...</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">This usually takes 10-15 seconds. Please stay on this page.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {evaluationSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-4 group">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full border-2 border-indigo-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-900">
                          <CheckCircle2 className="w-5 h-5 text-gray-200 dark:text-gray-800 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        {step.id < 4 && <div className="absolute top-8 left-4 w-0.5 h-4 bg-gray-100 dark:bg-gray-800"></div>}
                      </div>
                      <p className="text-sm font-bold text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors uppercase tracking-tight">{step.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12"
              >
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center transition-colors duration-300">
                    <Award className="w-8 h-8 mr-3 text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg shadow-sm transition-colors duration-300" /> 
                    AI Technical Feedback
                  </h3>
                  <div className="prose prose-indigo dark:prose-invert max-w-none prose-lg text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-950/20 p-8 rounded-3xl border border-purple-100 dark:border-purple-900/30 leading-relaxed shadow-inner transition-colors duration-300">
                    <ReactMarkdown className="markdown-feedback">{session.aiFeedback}</ReactMarkdown>
                  </div>
                </div>

                <div className="space-y-12">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center transition-colors duration-300">
                      <MessageSquare className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg shadow-sm transition-colors duration-300" /> 
                      Full Transcript
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-950 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-[1.05rem] italic leading-relaxed shadow-inner transition-colors duration-300">
                      <div style={{ whiteSpace: 'pre-wrap' }}>{session.transcript}</div>
                    </div>
                  </div>
                  
                  {/* Media Recording Playback */}
                  {(session.cameraVideoUrl || session.screenVideoUrl) && (
                    <div className="space-y-6">
                       <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center transition-colors duration-300">
                        <Video className="w-8 h-8 mr-3 text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg shadow-sm transition-colors duration-300" /> 
                        Interview Replay
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        {session.screenVideoUrl && (
                          <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-lg border-4 border-gray-100 dark:border-gray-800 relative group transition-colors duration-300">
                            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center z-10">
                              <MonitorUp className="w-4 h-4 mr-2" /> Screen Capture
                            </div>
                            <video controls playsInline className="w-full h-auto max-h-[400px]">
                              <source src={session.screenVideoUrl.startsWith('http') ? session.screenVideoUrl : `${API_BASE}${session.screenVideoUrl}`} type="video/webm" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}
                        {session.cameraVideoUrl && (
                          <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-lg border-4 border-gray-100 dark:border-gray-800 relative group transition-colors duration-300">
                            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center z-10">
                              <Video className="w-4 h-4 mr-2" /> Personal Camera
                            </div>
                            <video controls playsInline className="w-full h-auto max-h-[300px]">
                              <source src={session.cameraVideoUrl.startsWith('http') ? session.cameraVideoUrl : `${API_BASE}${session.cameraVideoUrl}`} type="video/webm" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

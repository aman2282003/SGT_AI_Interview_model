import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Award, AlertCircle, ChevronLeft, Calendar, Code2, MessageSquare, Video, MonitorUp } from 'lucide-react';

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_HOST}/api/interview/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSession(res.data);
      } catch (err) {
        setError('Failed to load interview results');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  if (loading) return <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (error) return (
    <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center flex-col space-y-4">
      <AlertCircle className="w-16 h-16 text-red-500" />
      <h2 className="text-xl font-semibold">{error}</h2>
      <button onClick={() => navigate('/dashboard')} className="text-indigo-600 hover:underline font-bold">Return to Dashboard</button>
    </div>
  );
  if (!session) return null;

  const scoreColor = session.aiMarks >= 80 ? 'text-green-600' : session.aiMarks >= 50 ? 'text-amber-500' : 'text-red-500';
  const scoreBg = session.aiMarks >= 80 ? 'bg-green-50 border-green-200' : session.aiMarks >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  return (
    <div className="max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button onClick={() => navigate('/dashboard')} className="flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors group">
        <ChevronLeft className="w-5 h-5 mr-1 transform group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden relative">
        <div className={`absolute top-0 left-0 w-full h-4 ${session.aiMarks >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-600' : session.aiMarks >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}></div>
        
        <div className="p-8 md:p-14">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-10 border-b border-gray-100 gap-8">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-4">
                <Code2 className="w-10 h-10 text-indigo-600" />
                {session.techStack} Assessment
              </h1>
              <div className="mt-4 flex items-center space-x-4 text-gray-500 font-bold tracking-wide">
                <span className="flex items-center"><Calendar className="w-5 h-5 mr-2 text-gray-400" /> {new Date(session.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(session.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 ${scoreBg} min-w-[14rem] shadow-sm transform hover:scale-105 transition-transform`}>
              <span className="text-sm font-bold uppercase tracking-widest text-gray-600 mb-2">Total AI Score</span>
              <div className="flex items-baseline">
                <span className={`text-7xl font-black tracking-tighter ${scoreColor}`}>{session.aiMarks}</span>
                <span className="text-3xl font-bold text-gray-400 ml-1">/100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                <Award className="w-8 h-8 mr-3 text-purple-600 bg-purple-100 p-1.5 rounded-lg shadow-sm" /> 
                AI Technical Feedback
              </h3>
              <div className="prose prose-indigo prose-lg text-gray-700 bg-purple-50 p-8 rounded-3xl border border-purple-100 leading-relaxed font-medium shadow-inner">
                <div style={{ whiteSpace: 'pre-wrap' }}>{session.aiFeedback}</div>
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                  <MessageSquare className="w-8 h-8 mr-3 text-blue-600 bg-blue-100 p-1.5 rounded-lg shadow-sm" /> 
                  Your Transcript
                </h3>
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 text-gray-600 text-[1.05rem] italic leading-relaxed shadow-inner">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{session.transcript}</div>
                </div>
              </div>
              
              {/* Media Recording Playback */}
              {(session.cameraVideoUrl || session.screenVideoUrl) && (
                <div>
                   <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                    <Video className="w-8 h-8 mr-3 text-indigo-600 bg-indigo-100 p-1.5 rounded-lg shadow-sm" /> 
                    Interview Replay
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {session.screenVideoUrl && (
                      <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-lg border-4 border-gray-100 relative group">
                        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center z-10 opacity-100 transition-opacity">
                          <MonitorUp className="w-4 h-4 mr-2" /> Screen Capture
                        </div>
                        <video src={`${import.meta.env.VITE_HOST}${session.screenVideoUrl}`} controls className="w-full h-auto max-h-[400px]" />
                      </div>
                    )}
                    {session.cameraVideoUrl && (
                      <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-lg border-4 border-gray-100 relative group">
                        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center z-10 opacity-100 transition-opacity">
                          <Video className="w-4 h-4 mr-2" /> Personal Camera
                        </div>
                        <video src={`${import.meta.env.VITE_HOST}${session.cameraVideoUrl}`} controls className="w-full h-auto max-h-[300px]" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

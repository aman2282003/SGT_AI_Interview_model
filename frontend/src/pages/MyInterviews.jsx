import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Code2, Video, MonitorUp, Award, ChevronDown, ChevronUp, MessageSquare, History, PlayCircle } from 'lucide-react';

export default function MyInterviews() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_HOST}/api/interview/history`, {
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <History className="w-10 h-10 text-indigo-600" />
          My Interviews Archive
        </h1>
        <p className="mt-3 text-lg text-gray-600 font-medium">Review your past performance, analyze AI feedback, and watch your recorded sessions.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <Code2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No interviews found</h3>
          <p className="text-gray-500 mb-6">You haven't completed any mock interviews yet.</p>
          <Link to="/dashboard" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">Go to Dashboard</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {sessions.map((session) => {
            const isExpanded = expandedId === session._id;
            const scoreColor = session.aiMarks >= 80 ? 'text-green-600 bg-green-50' : session.aiMarks >= 50 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
            
            return (
              <div key={session._id} className={`bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:border-indigo-200 hover:shadow-md'}`}>
                {/* Header Row (Clickable) */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : session._id)}
                  className="p-6 sm:p-8 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative"
                >
                  <div className={`absolute top-0 left-0 w-2 h-full ${session.aiMarks >= 80 ? 'bg-green-400' : session.aiMarks >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}></div>
                  
                  <div className="flex items-center gap-5 pl-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-inner">
                      <Code2 className="w-7 h-7 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-gray-900">{session.techStack}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-500 font-bold tracking-wide">
                        <Calendar className="w-4 h-4 mr-1.5 opacity-70" /> 
                        {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        <span className="mx-2 text-gray-300">•</span>
                        {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-auto pl-4 sm:pl-0">
                    <div className={`px-5 py-2 rounded-xl font-bold text-lg border border-transparent flex items-center shadow-sm ${scoreColor}`}>
                      Score: {session.aiMarks} / 100
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 group-hover:bg-indigo-50 transition-colors">
                      {isExpanded ? <ChevronUp className="w-6 h-6 text-indigo-600" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Content Body */}
                {isExpanded && (
                  <div className="px-6 pb-6 sm:px-8 sm:pb-8 border-t border-gray-100 bg-gray-50/50 grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
                    
                    {/* Left Column: Feedback & Transcript */}
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 relative">
                        <div className="absolute top-4 right-4"><Award className="w-6 h-6 text-purple-200" /></div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-purple-600 mb-3 flex items-center">
                          <Award className="w-4 h-4 mr-2" /> AI Evaluation
                        </h4>
                        <div className="prose prose-sm text-gray-700 font-medium leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
                           <div style={{ whiteSpace: 'pre-wrap' }}>{session.aiFeedback}</div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 relative">
                        <h4 className="text-sm font-black uppercase tracking-widest text-blue-600 mb-3 flex items-center">
                          <MessageSquare className="w-4 h-4 mr-2" /> Full Transcript
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 italic leading-relaxed shadow-inner max-h-48 overflow-y-auto custom-scrollbar">
                          <div style={{ whiteSpace: 'pre-wrap' }}>{session.transcript}</div>
                        </div>
                      </div>
                      
                      <Link to={`/results/${session._id}`} className="inline-flex w-full items-center justify-center px-4 py-3 bg-white border-2 border-indigo-100 rounded-xl text-indigo-600 font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-colors">
                        View Full Details Page
                      </Link>
                    </div>

                    {/* Right Column: Media Playback */}
                    <div className="flex flex-col space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center mb-1">
                        <PlayCircle className="w-4 h-4 mr-2" /> Session Recordings
                      </h4>
                      
                      {!session.screenVideoUrl && !session.cameraVideoUrl && (
                        <div className="flex-1 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center p-6 text-gray-400 font-medium text-center">
                          No video recordings available for this historical session.
                        </div>
                      )}

                      {session.screenVideoUrl && (
                        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-md border-4 border-gray-200 relative group">
                          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold flex items-center z-10">
                            <MonitorUp className="w-3 h-3 mr-1.5" /> Screen Capture
                          </div>
                          <video src={`${import.meta.env.VITE_HOST}${session.screenVideoUrl}`} controls className="w-full h-auto max-h-[250px] object-cover" />
                        </div>
                      )}
                      
                      {session.cameraVideoUrl && (
                        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-md border-4 border-gray-200 relative group">
                          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold flex items-center z-10">
                            <Video className="w-3 h-3 mr-1.5" /> Camera
                          </div>
                          <video src={`${import.meta.env.VITE_HOST}${session.cameraVideoUrl}`} controls className="w-full h-auto max-h-[250px] object-cover" />
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
    </div>
  );
}

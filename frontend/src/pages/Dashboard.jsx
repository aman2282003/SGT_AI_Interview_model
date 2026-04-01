import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Server, Database, Smartphone, Palette, ChevronRight, Terminal, Network, ShieldCheck, CupSoda, MonitorCog, TrendingUp, Target, BrainCircuit, Video } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../config/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export const TECH_STACKS = [
  { id: 'react', name: 'React.js', icon: <Palette className="w-6 h-6" />, desc: 'UI/UX, State, Hooks' },
  { id: 'frontend', name: 'Frontend (Vanilla)', icon: <MonitorCog className="w-6 h-6" />, desc: 'JS, CSS, HTML5' },
  { id: 'node', name: 'Node.js', icon: <Server className="w-6 h-6" />, desc: 'Express, API Design' },
  { id: 'python', name: 'Python Backend', icon: <Code2 className="w-6 h-6" />, desc: 'Django, Flask, Logic' },
  { id: 'java', name: 'Java Spring', icon: <CupSoda className="w-6 h-6" />, desc: 'OOP, JVM, Spring Boot' },
  { id: 'csharp', name: 'C# .NET', icon: <Terminal className="w-6 h-6" />, desc: 'ASP.NET Core, LINQ' },
  { id: 'database', name: 'Database / SQL', icon: <Database className="w-6 h-6" />, desc: 'Queries, Indexing' },
  { id: 'mobile', name: 'Mobile App', icon: <Smartphone className="w-6 h-6" />, desc: 'React Native, Flutter' },
  { id: 'devops', name: 'DevOps & Cloud', icon: <Network className="w-6 h-6" />, desc: 'Docker, AWS, CI/CD' },
  { id: 'system_design', name: 'System Design', icon: <Server className="w-6 h-6" />, desc: 'Scaling, Architecture' },
  { id: 'cybersecurity', name: 'Cybersecurity', icon: <ShieldCheck className="w-6 h-6" />, desc: 'Security, Pen Testing' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [customTopic, setCustomTopic] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/api/interview/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (err) {
        console.error('Failed to fetch history');
      }
    };
    fetchHistory();
  }, []);

  const chartData = history.slice().reverse().map(session => ({
    name: new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: session.aiMarks || 0,
    stack: session.techStack
  }));

  const stackAverages = history.reduce((acc, curr) => {
    if (!curr.aiMarks) return acc;
    if (!acc[curr.techStack]) acc[curr.techStack] = { stack: curr.techStack, total: 0, count: 0 };
    acc[curr.techStack].total += curr.aiMarks;
    acc[curr.techStack].count += 1;
    return acc;
  }, {});
  
  const barData = Object.values(stackAverages).map(d => ({
    stack: d.stack,
    avgScore: Math.round(d.total / d.count)
  }));

  const overallAvg = barData.length > 0 ? Math.round(barData.reduce((acc, curr) => acc + curr.avgScore, 0) / barData.length) : 0;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 transition-colors duration-300"
    >
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">Select your Tech Stack</h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl font-medium transition-colors duration-300">Choose a specific technology to practice your virtual interview with our AI.</p>
          </div>
          {history.length === 0 && (
            <div className="mt-4 md:mt-0 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex items-center gap-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span className="text-indigo-700 dark:text-indigo-300 font-bold text-sm">First Interview Roadmap Ready</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {TECH_STACKS.map((stack) => (
            <motion.div 
              key={stack.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/interview/${stack.id}`)}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl cursor-pointer transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-bl-[100px] -z-10 opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 transition-colors duration-300 shadow-sm group-hover:shadow-md">
                  {stack.icon}
                </div>
                <div className="flex-1 mt-1">
                  <h3 className="font-extrabold tracking-tight text-gray-900 dark:text-white mb-1 text-lg transition-colors duration-300">{stack.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider transition-colors duration-300">{stack.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          variants={itemVariants}
          className="mt-8 bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm p-8 border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-6 justify-between transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500"
        >
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Can't find your topic?</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">Enter any custom topic and the AI will generate tailored questions for you.</p>
          </div>
          <div className="flex w-full sm:w-auto gap-4">
            <input 
              type="text"
              placeholder="e.g. Marketing, Professionalism..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 sm:w-64 transition-colors duration-300"
            />
            <button 
              onClick={() => {
                if(customTopic.trim()) {
                  navigate(`/interview/${encodeURIComponent(customTopic.trim())}`);
                }
              }}
              disabled={!customTopic.trim()}
              className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all whitespace-nowrap border border-indigo-700/20 dark:border-indigo-400/30"
            >
              Start Custom
            </button>
          </div>
        </motion.div>
      </section>

      {history.length === 0 ? (
        <section>
          <motion.div 
            variants={itemVariants}
            className="bg-indigo-600 dark:bg-indigo-500 rounded-[3rem] p-10 md:p-20 text-white shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/20 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12"
          >
             <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
             
             <div className="relative z-10 flex-1 space-y-6 text-center lg:text-left">
               <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest border border-white/30">Your Journey Begins</span>
               <h2 className="text-5xl md:text-6xl font-black leading-tight tracking-tighter">Prepare for your <br/> Dream Job.</h2>
               <p className="text-xl text-indigo-100 font-medium max-w-xl mx-auto lg:mx-0">Take your first mock interview and get instant AI feedback to improve your technical and soft skills.</p>
               <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                 <div className="flex items-center -space-x-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-indigo-600 bg-indigo-400 flex items-center justify-center font-bold text-xs ring-2 ring-indigo-300">UI</div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-600 bg-white text-indigo-600 flex items-center justify-center font-black text-xs ring-2 ring-indigo-300">+2k</div>
                 </div>
                 <p className="text-sm font-bold text-indigo-100 italic">Joined by 2,000+ candidates this month</p>
               </div>
             </div>
             
             <div className="relative z-10 w-full lg:w-1/3 grid grid-cols-2 gap-4">
                {[
                  { label: 'Real-time AI', icon: <Network /> },
                  { label: 'Video Analysis', icon: <Video /> },
                  { label: 'Technical Depth', icon: <BrainCircuit /> },
                  { label: 'Soft Skills', icon: <CupSoda /> }
                ].map((feature, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 flex flex-col items-center justify-center text-center group hover:bg-white/20 transition-all">
                    <div className="mb-2 text-indigo-200 group-hover:text-white transition-colors capitalize">{feature.icon}</div>
                    <span className="text-xs font-black uppercase tracking-tight">{feature.label}</span>
                  </div>
                ))}
             </div>
          </motion.div>
        </section>
      ) : (
        <section className="mt-16 mb-10">
          <motion.h2 variants={itemVariants} className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8 transition-colors duration-300">Performance Analytics</motion.h2>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Analytics Dashboard */}
            <div className="xl:col-span-2 space-y-8">
              {/* Top Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6 transition-colors duration-300">
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400"/>
                  </div>
                  <div>
                    <h4 className="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase tracking-wider mb-1 transition-colors duration-300">Average Score</h4>
                    <p className="text-4xl font-black text-gray-900 dark:text-white transition-colors duration-300">{overallAvg}<span className="text-xl text-gray-400 dark:text-gray-500 font-semibold">/100</span></p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6 transition-colors duration-300">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                    <Target className="w-8 h-8 text-blue-600 dark:text-blue-400"/>
                  </div>
                  <div>
                    <h4 className="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase tracking-wider mb-1 transition-colors duration-300">Interviews Taken</h4>
                    <p className="text-4xl font-black text-gray-900 dark:text-white transition-colors duration-300">{history.length}</p>
                  </div>
                </motion.div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Line Chart: Progress Over Time */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 min-h-[350px] flex flex-col transition-colors duration-300">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-6 transition-colors duration-300">Progress Over Time</h3>
                  <div className="flex-1 w-full relative -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={document.documentElement.classList.contains('dark') ? '#1f2937' : '#f3f4f6'} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} domain={[0, 100]} />
                        <Tooltip cursor={{stroke: '#e5e7eb', strokeWidth: 2}} contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#fff', color: document.documentElement.classList.contains('dark') ? '#fff' : '#000', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                        <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={4} dot={{r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Bar Chart: Avg By Stack */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 min-h-[350px] flex flex-col transition-colors duration-300">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-6 transition-colors duration-300">Average by Tech Stack</h3>
                  <div className="flex-1 w-full relative -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={document.documentElement.classList.contains('dark') ? '#1f2937' : '#f3f4f6'} />
                        <XAxis dataKey="stack" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} dy={10} />
                        <Tooltip cursor={{fill: document.documentElement.classList.contains('dark') ? '#1f2937' : '#f9fafb'}} contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#fff', color: document.documentElement.classList.contains('dark') ? '#fff' : '#000', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                        <Bar dataKey="avgScore" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Recent History List */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full transition-colors duration-300">
              <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-6 flex items-center gap-3 transition-colors duration-300">
                <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                Recent Sessions
              </h3>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {history.map((session) => (
                  <div key={session._id} onClick={() => navigate(`/results/${session._id}`)} className="bg-gray-50 dark:bg-gray-950 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] cursor-pointer rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col transition-all transform hover:-translate-y-0.5 group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                          <Code2 className="w-5 h-5 text-indigo-500" />
                        </div>
                        <h4 className="font-extrabold text-gray-900 dark:text-white tracking-wide text-sm transition-colors duration-300">{session.techStack} <span className="text-gray-400 font-medium ml-1">Mock</span></h4>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider transition-colors duration-300">{new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <span className={`inline-flex items-center px-3 py-1 font-bold rounded-lg text-xs shadow-sm ${session.aiMarks >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : session.aiMarks >= 60 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                        Score: {session.aiMarks ? `${session.aiMarks}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </motion.div>
  );
}

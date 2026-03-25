import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Play, CheckCircle2, ShieldCheck, Video, MessageSquare, Code2, Zap, ArrowRight, Star, Cpu, Lock, Server, Database } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}></div>
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <span className="inline-flex space-x-3 items-center rounded-full bg-indigo-50/80 px-5 py-2 text-sm font-bold text-indigo-700 ring-1 ring-inset ring-indigo-500/20 shadow-sm backdrop-blur-sm">
                <Cpu className="h-4 w-4" />
                <span>Powered by Google Gemini 2.5 Flash</span>
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-gray-900 sm:text-7xl mb-8 leading-tight">
              Master your tech interviews with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI Precision</span>
            </h1>
            <p className="text-xl leading-relaxed text-gray-600 mb-10 max-w-3xl mx-auto font-medium">
              We don't just ask you to code. We simulate high-pressure verbal technical interviews across 11 different technology stacks. Share your screen, explain your thought process out loud, and get precise marks and detailed feedback instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto rounded-2xl bg-indigo-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1">
                Start Practicing for Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto rounded-2xl bg-white px-8 py-4 text-base font-bold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 flex items-center justify-center transition-all">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trust/Social Proof */}
      <div className="bg-white py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-sm font-bold tracking-widest text-gray-400 uppercase mb-8">Supporting the world's most modern tech stacks</p>
          <div className="flex justify-center items-center gap-x-12 gap-y-8 flex-wrap opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center gap-2 text-2xl font-black text-gray-900 tracking-tighter"><Code2 className="h-8 w-8 text-indigo-600" /> ReactDev</div>
            <div className="flex items-center gap-2 text-2xl font-black text-gray-900 tracking-tighter"><Server className="h-8 w-8 text-indigo-600" /> NodeCore</div>
            <div className="flex items-center gap-2 text-2xl font-black text-gray-900 tracking-tighter"><ShieldCheck className="h-8 w-8 text-indigo-600" /> CyberSec</div>
            <div className="flex items-center gap-2 text-2xl font-black text-gray-900 tracking-tighter"><Zap className="h-8 w-8 text-indigo-600" /> SysScale</div>
            <div className="flex items-center gap-2 text-2xl font-black text-gray-900 tracking-tighter"><BrainCircuit className="h-8 w-8 text-indigo-600" /> JavaSpring</div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-20">
            <h2 className="text-base font-bold leading-7 text-indigo-600 uppercase tracking-widest">The Process</h2>
            <p className="mt-2 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">How AI Interviewer Works</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[4rem] left-[15%] right-[15%] h-0.5 bg-gray-200 z-0"></div>
            
            {[
              { title: "Select Tech Stack", desc: "Choose your focus area from our 11 curated tech stacks. Each contains a dynamic bank of deeply technical questions.", icon: <Database className="w-8 h-8"/> },
              { title: "Hardware Lock", desc: "To simulate a proctored environment, questions remain hidden until you explicitly share your Screen and Camera.", icon: <Lock className="w-8 h-8"/> },
              { title: "Verbal Assessment", desc: "For 5 sequential questions, speak your answer aloud. Our real-time speech engine captures your transcript securely.", icon: <MessageSquare className="w-8 h-8"/> },
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 bg-white p-10 rounded-[2rem] shadow-xl border border-gray-100 hover:border-indigo-200 hover:shadow-2xl transition-all group transform hover:-translate-y-2">
                <div className="absolute -top-6 -left-6 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl transform -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all">
                  {idx + 1}
                </div>
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-8 mx-auto group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{step.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed text-center">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Features */}
      <div className="overflow-hidden bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-16 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
            <div className="lg:pr-8 lg:pt-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-bold leading-7 text-indigo-600 uppercase tracking-widest">Advanced Evaluation</h2>
                <p className="mt-2 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl leading-tight">Everything you need to succeed</p>
                <p className="mt-6 text-lg leading-relaxed text-gray-600 font-medium pb-6 border-b border-gray-100">
                  We don't just provide generic leetcode challenges. Our bespoke platform mimics the anxiety and crucial communication aspects of a real-life technical round.
                </p>
                <dl className="mt-10 max-w-xl space-y-10 text-base leading-7 text-gray-600 lg:max-w-none">
                  {[
                    { title: 'Google Gemini Grading Engine', desc: 'When you complete all 5 questions, your full transcript is instantly compiled and evaluated by Gemini for deep technical veracity and verbal articulation.', icon: <BrainCircuit className="w-6 h-6 text-white" /> },
                    { title: 'Anti-Cheat Hardware Enforcements', desc: 'Questions are strictly hidden behind CSS-locks until you grant native Camera and Screen-share permissions preventing cheating.', icon: <ShieldCheck className="w-6 h-6 text-white" /> },
                    { title: 'Live Typewriter Transcription', desc: 'Watch your spoken answers type out natively in real-time. Pausing your thought process won\'t break our highly robust Web Speech API recording loop.', icon: <MessageSquare className="w-6 h-6 text-white" /> },
                  ].map((feature, idx) => (
                    <div key={idx} className="relative pl-16">
                      <dt className="inline font-bold text-gray-900 text-xl tracking-tight block mb-2">
                        <div className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-[1rem] bg-indigo-600 shadow-md">
                          {feature.icon}
                        </div>
                        {feature.title}
                      </dt>
                      <dd className="mt-1 font-medium text-gray-600 text-[1.05rem]">{feature.desc}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <div className="relative mt-10 md:mt-0">
               <div className="bg-gray-50 rounded-[2.5rem] p-10 shadow-2xl border border-gray-200 transform rotate-3 hover:rotate-0 transition-all duration-500 relative z-10 w-full max-w-lg mx-auto">
                 <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-6">
                   <h3 className="font-extrabold text-gray-900 text-2xl flex items-center gap-3 tracking-tight"><CheckCircle2 className="w-8 h-8 text-green-500"/> Final Result</h3>
                   <span className="bg-green-100 text-green-800 text-sm font-black px-4 py-1.5 rounded-full shadow-sm tracking-wide">Score: 92/100</span>
                 </div>
                 <div className="space-y-4">
                   <div className="h-5 bg-gray-200 rounded-full w-3/4 animate-pulse"></div>
                   <div className="h-5 bg-gray-200 rounded-full w-full animate-pulse opacity-70"></div>
                   <div className="h-5 bg-gray-200 rounded-full w-5/6 animate-pulse opacity-50"></div>
                   <div className="h-5 bg-gray-200 rounded-full w-4/6 animate-pulse opacity-30"></div>
                 </div>
                 <div className="mt-10 bg-indigo-50 p-6 rounded-2xl border-2 border-indigo-100 relative">
                   <div className="absolute -top-4 -left-3 bg-indigo-600 text-white rounded-full p-2 shadow-md">
                     <Star className="w-4 h-4" />
                   </div>
                   <p className="text-base text-indigo-900 font-bold italic leading-relaxed">
                     "Your explanation of the React Fiber architecture was highly robust. However, you could improve by mentioning the reconciliation heuristics when comparing keyed DOM children."
                   </p>
                 </div>
               </div>
               {/* Decorative background blob */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-indigo-200 to-purple-300 rounded-full blur-[100px] opacity-40 -z-10 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer CTA */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto text-center bg-gray-900 rounded-[3rem] p-12 sm:p-20 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] opacity-5 bg-cover bg-center mix-blend-overlay"></div>
            
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl relative z-10 leading-tight">Ready to ace your next <br className="hidden sm:block" />technical interview?</h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-indigo-200 relative z-10 font-medium">
              Join developers implicitly improving their verbal communication and technical depth by practicing in our simulated proctored environment.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link to="/register" className="w-full sm:w-auto rounded-xl bg-white px-10 py-4 text-lg font-bold text-gray-900 shadow-xl hover:bg-gray-50 transition-all transform hover:-translate-y-1">
                Create Your Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

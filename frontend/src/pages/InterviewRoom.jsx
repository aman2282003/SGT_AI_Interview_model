import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Mic, MonitorUp, StopCircle, PlayCircle, Loader2, ChevronRight, Video, AlertTriangle, Code2 } from 'lucide-react';
import { interviewQuestions } from '../data/questions';
import Editor from '@monaco-editor/react';

export default function InterviewRoom() {
  const { tech } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interimAnswer, setInterimAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [isCameraRequested, setIsCameraRequested] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [didActuallyStart, setDidActuallyStart] = useState(false);
  
  // Debug / Diagnostics
  const [diagnosticStatus, setDiagnosticStatus] = useState('Idle');
  
  // Code Editor states
  const [codeContent, setCodeContent] = useState('');
  const [codeOutput, setCodeOutput] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const screenRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const streamRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const screenRecorderRef = useRef(null);
  const cameraRecorderRef = useRef(null);
  const screenChunksRef = useRef([]);
  const cameraChunksRef = useRef([]);
  
  const audioRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  
  const recordingStateRef = useRef(isRecording);
  
  useEffect(() => {
    recordingStateRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    const fetchQuestions = async () => {
      // 1. Try to load from localStorage first
      const savedProgress = localStorage.getItem('interview_progress');
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          if (parsed.tech === tech && parsed.questions.length > 0) {
            console.log("Resuming interview from saved progress...");
            setQuestions(parsed.questions);
            setAnswers(parsed.answers);
            setCurrentIndex(parsed.currentIndex);
            // If it was a coding question, set the code too
            if (parsed.codeContent) setCodeContent(parsed.codeContent);
            return; // Exit if loaded from cache
          }
        } catch (e) {
          console.error("Failed to parse saved progress", e);
        }
      }

      // 2. Otherwise fetch fresh questions
      const techKey = tech.toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (interviewQuestions[techKey]) {
        // Predefined topic
        const allQs = interviewQuestions[techKey];
        const shuffled = [...allQs].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);
        setQuestions(selected);
        setAnswers(new Array(5).fill(''));
      } else {
        // Custom topic
        try {
          const token = localStorage.getItem('token');
          const res = await axios.post(`${import.meta.env.VITE_HOST}/api/interview/generate-questions`, { topic: tech }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setQuestions(res.data.questions);
          setAnswers(new Array(5).fill(''));
        } catch (err) {
          console.error("Failed to generate custom questions", err);
          alert("Failed to generate custom interview questions. Falling back to default questions.");
          const allQs = interviewQuestions['system_design'];
          const shuffled = [...allQs].sort(() => 0.5 - Math.random());
          setQuestions(shuffled.slice(0, 5));
          setAnswers(new Array(5).fill(''));
        }
      }
    };
    
    fetchQuestions();
  }, [tech]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (questions.length > 0) {
      const stateToSave = {
        tech,
        questions,
        answers,
        currentIndex,
        codeContent
      };
      localStorage.setItem('interview_progress', JSON.stringify(stateToSave));
    }
  }, [questions, answers, currentIndex, codeContent, tech]);

  useEffect(() => {
    const currentQ = questions[currentIndex];
    if (currentQ && typeof currentQ === 'object' && currentQ.type === 'coding') {
       setCodeContent(currentQ.initialCode || '');
       setCodeOutput(null);
    }
  }, [currentIndex, questions]);

  const activeRecorderRef = useRef(null);

  const startRecordingSystem = async () => {
    try {
      // Reuse the audio track from camera stream if available to avoid multiple mic requests
      let stream;
      if (cameraStreamRef.current && cameraStreamRef.current.getAudioTracks().length > 0) {
        stream = new MediaStream(cameraStreamRef.current.getAudioTracks());
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      audioStreamRef.current = stream;
      setDiagnosticStatus('Recording (Live AI Transcription)...');
      
      const processChunk = () => {
        if (!recordingStateRef.current) return;
        
        let recorder;
        try {
          recorder = new MediaRecorder(stream);
        } catch (e) {
          setDiagnosticStatus('Browser MediaRecorder failed: ' + e.message);
          setIsRecording(false);
          recordingStateRef.current = false;
          return;
        }
        
        activeRecorderRef.current = recorder;
        const chunks = [];
        
        recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        
        recorder.onstop = async () => {
           if (chunks.length > 0) {
              const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
              const formData = new FormData();
              // Determine file extension
              const ext = (recorder.mimeType || '').includes('mp4') ? 'm4a' : 'webm';
              formData.append('audio', blob, 'chunk.' + ext);
              try {
                const res = await axios.post(`${import.meta.env.VITE_HOST}/api/interview/transcribe`, formData, {
                   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.data && res.data.text) {
                   const txt = res.data.text.trim();
                   const isHallucination = /^(Thank you|Thanks for watching|Thanks|Subscribe)\.?$/i.test(txt);
                   if (txt.length > 1 && !isHallucination) {
                      setCurrentAnswer(prev => prev + (prev.trim() ? " " : "") + txt);
                   }
                }
              } catch(e) {
                 console.log("Chunk transcription dropped", e);
                 setDiagnosticStatus('Cloud AI Offline: ' + e.message);
              }
           }
           // Loop next chunk 
           if (recordingStateRef.current) {
              processChunk();
           }
        };
        
        recorder.start();
        setTimeout(() => {
           if (recorder.state === 'recording' && recordingStateRef.current) {
               recorder.stop();
           }
        }, 3500); // 3.5 seconds per chunk
      };
      
      processChunk();

    } catch (err) {
      console.error("Recording system failed:", err);
      // Give them the specific javascript exception
      alert("Microphone Error: " + err.message + "\nIf you get permission denied, click the lock icon next to the URL.");
      setIsRecording(false);
      recordingStateRef.current = false;
      setDiagnosticStatus('Hardware Error: ' + err.message);
    }
  };

  useEffect(() => {
    return () => {
      if (activeRecorderRef.current && activeRecorderRef.current.state === 'recording') {
         try { activeRecorderRef.current.stop(); } catch(e) {}
      }
      if (audioStreamRef.current) {
         audioStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleUserMedia = (stream) => {
    setHasCamera(true);
    cameraStreamRef.current = stream;
  };

  const handleUserMediaError = () => {
    setHasCamera(false);
    alert("Camera access is required for this interview. Please enable it in your browser settings.");
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      if (screenRef.current) screenRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsScreenSharing(true);
      
      stream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        if (screenRef.current) screenRef.current.srcObject = null;
      };
    } catch (err) {
      console.error("Error sharing screen: ", err);
    }
  };

  const isHardwareReady = hasCamera && isScreenSharing;

  useEffect(() => {
    if (isHardwareReady && !isInterviewStarted) {
      setIsInterviewStarted(true);
      setDidActuallyStart(true);
      try {
        // Prepare streams with audio for both recorders
        const audioTracks = cameraStreamRef.current ? cameraStreamRef.current.getAudioTracks() : [];
        console.log("Starting recorders. Audio tracks found:", audioTracks.length);
        
        const preferredMimeType = 'video/webm; codecs=vp9,opus';
        const fallbackMimeType = 'video/webm';
        const finalMimeType = MediaRecorder.isTypeSupported(preferredMimeType) ? preferredMimeType : fallbackMimeType;

        if (streamRef.current && !screenRecorderRef.current) {
          // Combine screen video with camera audio
          const screenWithAudio = new MediaStream([
            ...streamRef.current.getVideoTracks(),
            ...audioTracks
          ]);
          console.log("Screen recorder tracks:", screenWithAudio.getTracks().map(t => t.kind));
          const sRecorder = new MediaRecorder(screenWithAudio, { mimeType: finalMimeType });
          sRecorder.ondataavailable = e => { if (e.data && e.data.size > 0) screenChunksRef.current.push(e.data); };
          sRecorder.start(1000);
          screenRecorderRef.current = sRecorder;
        }
        if (cameraStreamRef.current && !cameraRecorderRef.current) {
          // Camera stream already includes audio if Webcam audio prop is true
          console.log("Camera recorder tracks:", cameraStreamRef.current.getTracks().map(t => t.kind));
          const cRecorder = new MediaRecorder(cameraStreamRef.current, { mimeType: finalMimeType });
          cRecorder.ondataavailable = e => { if (e.data && e.data.size > 0) cameraChunksRef.current.push(e.data); };
          cRecorder.start(1000);
          cameraRecorderRef.current = cRecorder;
        }
      } catch (err) {
        console.warn("VP media recorder failed, falling back to default.", err);
        const audioTracks = cameraStreamRef.current ? cameraStreamRef.current.getAudioTracks() : [];

        if (streamRef.current) {
          const screenWithAudio = new MediaStream([
            ...streamRef.current.getVideoTracks(),
            ...audioTracks
          ]);
          const sRecorder = new MediaRecorder(screenWithAudio);
          sRecorder.ondataavailable = e => { if (e.data && e.data.size > 0) screenChunksRef.current.push(e.data); };
          sRecorder.start(1000);
          screenRecorderRef.current = sRecorder;
        }
        if (cameraStreamRef.current) {
          const cRecorder = new MediaRecorder(cameraStreamRef.current);
          cRecorder.ondataavailable = e => { if (e.data && e.data.size > 0) cameraChunksRef.current.push(e.data); };
          cRecorder.start(1000);
          cameraRecorderRef.current = cRecorder;
        }
      }
    }
  }, [isHardwareReady, isInterviewStarted]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      recordingStateRef.current = false;
      if (activeRecorderRef.current && activeRecorderRef.current.state === 'recording') {
        try { activeRecorderRef.current.stop(); } catch(e){}
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
      }
      setDiagnosticStatus('Mic Paused');
    } else {
      setIsRecording(true);
      recordingStateRef.current = true;
      startRecordingSystem();
    }
  };

  const executeCode = async () => {
    const currentQ = questions[currentIndex];
    setIsExecuting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_HOST}/api/execute/run`, {
        language: currentQ.language,
        code: codeContent,
        testCases: currentQ.testCases
      }, { headers: { Authorization: `Bearer ${token}` } });
      setCodeOutput(res.data);
    } catch(err) {
      setCodeOutput({ output: "Execution Engine Timeout. Please try again.", passed: false });
    }
    setIsExecuting(false);
  };

  const handleNextQuestion = () => {
    const currentQ = questions[currentIndex];
    const questionText = typeof currentQ === 'string' ? currentQ : currentQ.prompt;
    // Capture BOTH final and interim text so nothing is lost when clicking next
    const combinedAnswer = (currentAnswer + ' ' + interimAnswer).trim();
    const finalAnswerText = typeof currentQ === 'object' && currentQ.type === 'coding' 
        ? `[Code Submitted]\n${codeContent}\n\n[Spoken Transcript]\n${combinedAnswer}`
        : combinedAnswer;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = {
      question: questionText,
      answer: finalAnswerText || 'No answer provided.'
    };
    setAnswers(newAnswers);
    
    setCurrentAnswer('');
    setInterimAnswer('');
    
    // DO NOT stop recording when moving to the next question!
    // Maintain a gapless stream of audio transcription!
    setCurrentIndex(prev => prev + 1);
  };

  const submitInterview = async () => {
    const currentQ = questions[currentIndex];
    const questionText = typeof currentQ === 'string' ? currentQ : currentQ.prompt;
    // Capture BOTH final and interim text so nothing is lost on submit
    const combinedAnswer = (currentAnswer + ' ' + interimAnswer).trim();
    const finalAnswerText = typeof currentQ === 'object' && currentQ.type === 'coding' 
        ? `[Code Submitted]\n${codeContent}\n\n[Spoken Transcript]\n${combinedAnswer}`
        : combinedAnswer;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = {
      question: questionText,
      answer: finalAnswerText || 'No answer provided.'
    };
    
    // Check that the candidate gave at least one real answer
    const hasAnyAnswer = newAnswers.some(item => item && item.answer && item.answer !== 'No answer provided.' && item.answer.trim().length > 0);
    if (!hasAnyAnswer) {
      alert("Please provide at least one answer before submitting. You can speak using the microphone or type directly in the answer box.");
      return;
    }
    
    let fullTranscript = newAnswers.map((item, idx) => `Q${idx + 1}: ${item ? item.question : questions[idx]}\nA: ${item ? item.answer : 'No answer provided.'}`).join('\n\n');
    
    setIsSubmitting(true);
    
    if (isRecording) {
      setIsRecording(false);
      recordingStateRef.current = false;
      if (activeRecorderRef.current && activeRecorderRef.current.state === 'recording') {
        try { activeRecorderRef.current.stop(); } catch(e){}
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
      }
    }
    
    const getBlob = (recorder, chunks) => new Promise((resolve) => {
      if (!recorder || recorder.state === 'inactive') {
        resolve(new Blob(chunks, { type: 'video/webm' }));
        return;
      }
      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: 'video/webm' }));
      };
      recorder.stop();
    });

    try {
      const screenBlob = await getBlob(screenRecorderRef.current, screenChunksRef.current);
      const cameraBlob = await getBlob(cameraRecorderRef.current, cameraChunksRef.current);

      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (cameraStreamRef.current) cameraStreamRef.current.getTracks().forEach(track => track.stop());

      const formData = new FormData();
      formData.append('techStack', tech.toUpperCase());
      formData.append('transcript', fullTranscript);
      if (cameraBlob.size > 0) formData.append('cameraVideo', cameraBlob, 'camera.webm');
      if (screenBlob.size > 0) formData.append('screenVideo', screenBlob, 'screen.webm');

      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_HOST}/api/interview/submit`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      localStorage.removeItem('interview_progress');
      navigate(`/results/${res.data._id}`);
    } catch (err) {
      console.error("Submission failed", err);
      // If session expired / token invalid, log out and redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        alert('Your session has expired. Please log in again to continue.');
        navigate('/login');
        return;
      }
      alert(err.response?.data?.message || "Failed to submit interview. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (questions.length === 0) return <div className="min-h-screen flex items-center justify-center">Loading interview...</div>;
  const currentQ = questions[currentIndex];
  // Strict requirement: must have camera AND screen sharing active

  return (
    <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight capitalize transition-colors duration-300">{tech} Technical Interview</h2>
            {isHardwareReady && (
              <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition-colors duration-300">
                Question {currentIndex + 1} of {questions.length}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm font-medium bg-white dark:bg-gray-900 px-5 py-2.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <span className="relative flex h-3 w-3">
              {isRecording && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isRecording ? 'bg-red-500' : 'bg-gray-300'}`}></span>
            </span>
            <span className={isRecording ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-500 dark:text-gray-400 font-semibold'}>
              {diagnosticStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-8 mb-4">
        {/* LEFT COMPONENT */}
        <div className="lg:col-span-3 flex flex-col space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-indigo-100 dark:border-gray-800 p-8 flex flex-col flex-1 relative overflow-hidden transition-colors duration-300">
             
             {!didActuallyStart ? (
               <div className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full">
                 <div className="bg-amber-100 dark:bg-amber-900/30 p-5 rounded-full mb-6 transition-colors duration-300">
                   <AlertTriangle className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                 </div>
                 <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight transition-colors duration-300">Hardware Setup Required</h3>
                 <p className="text-gray-600 dark:text-gray-400 text-lg max-w-lg mx-auto mb-10 font-medium leading-relaxed transition-colors duration-300">
                   To unlock your interview questions and begin, you must first <strong>grant camera access</strong> and <strong>start sharing your screen</strong>.
                 </p>
                 <div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-xl">
                    <div className={`p-5 rounded-2xl border-2 flex items-center justify-center gap-3 w-full transition-all ${hasCamera ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 shadow-sm' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400'}`}>
                      <Video className="w-6 h-6" />
                      <span className="font-bold text-lg">{hasCamera ? 'Camera Ready' : 'Waiting for Camera...'}</span>
                    </div>
                    <button 
                      onClick={!isScreenSharing ? startScreenShare : undefined}
                      className={`p-5 rounded-2xl border-2 flex items-center justify-center gap-3 w-full transition-all ${isScreenSharing ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 shadow-sm cursor-default' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400 cursor-pointer shadow-sm hover:shadow-md transform hover:-translate-y-0.5 border border-gray-300 dark:border-gray-600'}`}
                    >
                      <MonitorUp className="w-6 h-6" />
                      <span className="font-bold text-lg">{isScreenSharing ? 'Screen Ready' : 'Click to Share Screen'}</span>
                    </button>
                 </div>
               </div>
             ) : (
                <>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-950/30 rounded-bl-full -z-10 transition-colors duration-300"></div>
                  
                  <h3 className="uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-3 transition-colors duration-300">Live Question</h3>
                  <p className="text-gray-900 dark:text-white font-bold text-2xl leading-relaxed transition-colors duration-300">
                    {typeof currentQ === 'string' ? currentQ : currentQ.prompt}
                  </p>

                  <hr className="my-8 border-gray-100 dark:border-gray-800 transition-colors duration-300" />
                  
                  {typeof currentQ === 'object' && currentQ.type === 'coding' ? (
                     <div className="flex-1 flex flex-col space-y-4">
                       <h3 className="font-semibold text-gray-900 dark:text-white flex items-center text-lg transition-colors duration-300">
                          <Code2 className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" /> Integrated Code Editor
                       </h3>
                       <div className="flex-1 bg-[#1e1e1e] rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-700 shadow-inner min-h-[300px] p-2 pt-4 transition-colors duration-300">
                         <Editor 
                           height="100%" 
                           language={currentQ.language} 
                           theme="vs-dark"
                           value={codeContent}
                           onChange={val => setCodeContent(val)}
                           options={{ minimap: { enabled: false }, fontSize: 15, scrollBeyondLastLine: false }}
                         />
                       </div>
                       
                       <div className="flex items-center gap-4">
                         <button onClick={executeCode} disabled={isExecuting} className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center hover:bg-indigo-700 dark:hover:bg-indigo-400 border border-indigo-700/20 dark:border-indigo-400/30 shadow-md transition-all sm:w-auto w-full">
                           {isExecuting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <PlayCircle className="w-5 h-5 mr-2" />}
                           {isExecuting ? 'Running Analysis...' : 'Run Code & Tests'}
                         </button>
                         {codeOutput && (
                           <div className={`px-4 py-3 rounded-xl font-bold flex-1 text-center transition-colors duration-300 ${codeOutput.passed ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                             {codeOutput.passed ? 'Status: All Tests Passed' : 'Status: Failed / Syntax Error'}
                           </div>
                         )}
                       </div>
                       
                       {codeOutput && (
                         <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 text-sm font-mono text-green-400 whitespace-pre-wrap shadow-inner max-h-32 overflow-y-auto">
                           {codeOutput.output}
                         </div>
                       )}
                       
                       {/* Mini transcript so they can still see they are recording */}
                       <div className="mt-4 flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/30 px-4 py-3 rounded-xl border border-indigo-100 dark:border-gray-800 transition-colors duration-300">
                         <div className="flex items-center gap-2">
                           <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400 dark:bg-gray-600'}`}></span>
                           <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{isRecording ? 'Capturing Voice...' : 'Mic Paused'}</span>
                         </div>
                         <div className="text-xs text-indigo-400 dark:text-indigo-500 truncate max-w-xs">{currentAnswer.slice(-50) + " " + interimAnswer}</div>
                       </div>
                     </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center text-lg transition-colors duration-300">
                          <Mic className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" /> Live Transcript Feed
                      </h3>
                      <div className="flex-1 bg-gray-50 dark:bg-gray-950 rounded-2xl p-6 shadow-inner relative flex flex-col min-h-[250px] transition-colors duration-300">
                        <textarea
                          className="w-full h-full bg-transparent resize-none outline-none text-gray-700 dark:text-gray-300 leading-relaxed font-medium transition-colors duration-300"
                          placeholder='Press "Start Recording" to speak, or click here to manually type your answer if voice recording fails...'
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                        />
                        {interimAnswer && (
                          <div className="text-indigo-500 font-medium mt-2 italic">{interimAnswer}</div>
                        )}
                      </div>
                    </>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <button 
                        onClick={toggleRecording}
                        className={`py-4 px-6 rounded-2xl font-bold flex items-center justify-center transition-all duration-300 border ${isRecording ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]' : 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400 border-indigo-700/20 dark:border-indigo-400/30 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 transform hover:-translate-y-1'}`}
                      >
                      {isRecording ? <><StopCircle className="w-6 h-6 mr-2 animate-pulse" /> Stop Recording</> : <><PlayCircle className="w-6 h-6 mr-2" /> Start Recording</>}
                    </button>
                    
                    {currentIndex < questions.length - 1 ? (
                      <button 
                        onClick={handleNextQuestion}
                        className="py-4 px-6 rounded-2xl font-bold text-gray-700 dark:text-white bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 flex items-center justify-center transition-all shadow-sm"
                      >
                        Next <ChevronRight className="w-5 h-5 ml-1" />
                      </button>
                    ) : (
                      <button 
                        onClick={submitInterview}
                        disabled={isSubmitting}
                        className="py-4 px-6 rounded-2xl font-bold text-white bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-green-200 dark:shadow-green-900/20 flex items-center justify-center transition-all transform hover:-translate-y-1 border border-green-700/20 dark:border-green-400/30"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> {uploadProgress < 100 ? `Uploading: ${uploadProgress}%` : 'Finishing Submission...'}</>
                        ) : (
                          'Complete & Evaluate'
                        )}
                      </button>
                    )}
                  </div>
                </>
             )}
          </div>
        </div>

        {/* RIGHT COMPONENT */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <div className="h-[300px] bg-gray-900 rounded-3xl overflow-hidden relative shadow-lg ring-1 ring-gray-900/10 border border-gray-800 flex items-center justify-center transition-colors duration-300">
            {isCameraRequested ? (
              <Webcam 
                audio={true} 
                muted={true}
                className="w-full h-full object-cover" 
                mirrored={true} 
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-center p-6 bg-gray-900 z-10 rounded-3xl">
                <Video className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 font-medium text-sm max-w-[200px] mx-auto">Click below to enable your camera. This is strictly required to view questions.</p>
                <button 
                  onClick={() => setIsCameraRequested(true)}
                  className="mt-6 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all duration-300 font-medium border border-gray-700 shadow-sm"
                >
                  Enable Camera
                </button>
              </div>
            )}
            
            <div className={`absolute top-4 left-4 backdrop-blur-md px-4 py-2 rounded-xl text-white/90 text-sm font-bold flex items-center shadow-sm transition-colors duration-300 ${hasCamera ? 'bg-black/60 dark:bg-black/80' : 'bg-red-600/80'}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${hasCamera ? 'bg-green-500 animate-pulse' : 'bg-white'}`}></span> 
              {hasCamera ? 'Personal Camera' : 'Camera Blocked'}
            </div>
          </div>

          <div className="flex-1 bg-gray-900 rounded-3xl overflow-hidden relative shadow-lg ring-1 ring-gray-900/10 flex items-center justify-center border border-gray-800 min-h-[300px] transition-colors duration-300">
            <video 
              ref={screenRef} 
              autoPlay 
              playsInline 
              muted
              className={`w-full h-full object-contain ${isScreenSharing ? 'block' : 'hidden'}`} 
            />
            
            {!isScreenSharing && (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-center p-6 bg-gray-900 z-10 rounded-3xl">
                <MonitorUp className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 font-medium text-sm max-w-[200px] mx-auto">Click below to share your screen. This is strictly required to view questions.</p>
                <button 
                  onClick={startScreenShare}
                  className="mt-6 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all duration-300 font-medium border border-gray-700 shadow-sm"
                >
                  Share Screen
                </button>
              </div>
            )}
            
            <div className={`absolute top-4 left-4 backdrop-blur-md px-4 py-2 rounded-xl text-white/90 text-sm font-bold flex items-center shadow-sm z-20 transition-colors duration-300 ${isScreenSharing ? 'bg-black/60 dark:bg-black/80' : 'bg-red-600/80'}`}>
              <MonitorUp className="w-4 h-4 mr-2" /> {isScreenSharing ? 'Presenter Screen' : 'Screen share required'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';

export default function Register() {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await register(formData.name, formData.email, formData.password);
    if (!res.success) {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
      className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:bg-none dark:bg-transparent flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden"
    >
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-40 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl dark:shadow-purple-500/20 border border-white/50 dark:border-white/10 relative z-10 transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-purple-50 dark:bg-purple-900/50 items-center justify-center flex rounded-2xl shadow-inner mb-6 transform -rotate-3 transition-colors duration-300">
            <UserPlus className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight transition-colors duration-300">Create your account</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-600 text-sm p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>{error}</div>}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 tracking-wide">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input id="name" type="text" required className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-800 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  placeholder="John Doe"
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 tracking-wide">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input id="email" type="email" required className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-800 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  placeholder="you@example.com"
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 tracking-wide">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input id="password" type="password" required className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-800 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  placeholder="••••••••"
                  value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-purple-700/20 dark:border-purple-400/30 rounded-xl shadow-lg dark:shadow-indigo-900/40 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 hover:from-purple-700 hover:to-indigo-700 dark:hover:from-purple-400 dark:hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70 transition-all transform hover:-translate-y-0.5">
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : 'Create Account'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

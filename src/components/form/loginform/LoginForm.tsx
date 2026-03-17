
import { motion } from "framer-motion";


const LoginForm = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f1a] via-[#141427] to-[#0d0d17]">
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        <div className="logo flex items-center justify-start mb-1">
          <span className="text-3xl font-bold text-purple-400">V<span className="text-white">ault</span></span>
        </div>
        <div className="header mb-1 flex justify-start">
          <span className="text-2xl font-bold text-white mb-2">Welcome Back</span>
        </div>
        <form className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-lg hover:shadow-purple-500/30 transition"
          >
            Sign In
          </motion.button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-6">
          Don’t have an account? <span className="text-purple-400 cursor-pointer">Sign up</span>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginForm;
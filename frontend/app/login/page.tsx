'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100 + delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);

  return (
    <span className="inline-block">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block w-0.5 h-6 bg-cyan-400 ml-1"
      />
    </span>
  );
};

const FloatingParticle = ({ delay }: { delay: number }) => {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-20"
      animate={{
        y: [0, -100, 0],
        x: [0, Math.random() * 50 - 25, 0],
        opacity: [0, 0.5, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay: delay,
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: '100%',
      }}
    />
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = isLogin
        ? await api.login({ email: formData.email, password: formData.password })
        : await api.register(formData);

      localStorage.setItem('token', response.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#0d1117] to-[#0a0a0a] flex items-center justify-center p-4">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.2} />
        ))}
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,217,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        {/* Glass morphism card */}
        <motion.div
          className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          whileHover={{ boxShadow: '0 0 40px rgba(0, 217, 255, 0.2)' }}
        >
          {/* Top border glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          <div className="p-8">
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                <TypewriterText text="DataHub API" />
              </h1>
              <p className="text-gray-400 text-sm mt-4">
                {isLogin ? 'Access your data ecosystem' : 'Join the data revolution'}
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login' : 'register'}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Email Input */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </motion.div>

                  {/* Password Input */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="password"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </motion.div>

                  {/* Role Selection for Register */}
                  {!isLogin && (
                    <motion.div
                      variants={itemVariants}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Account Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormData({ ...formData, role: 'user' })}
                          className={`px-4 py-3 rounded-lg border transition-all duration-300 ${
                            formData.role === 'user'
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-cyan-400/50'
                          }`}
                        >
                          User
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormData({ ...formData, role: 'business' })}
                          className={`px-4 py-3 rounded-lg border transition-all duration-300 ${
                            formData.role === 'business'
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-cyan-400/50'
                          }`}
                        >
                          Business
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Processing...
                    </>
                  ) : (
                    <>{isLogin ? 'Sign In' : 'Create Account'}</>
                  )}
                </span>
              </motion.button>

              {/* Toggle Login/Register */}
              <motion.div variants={itemVariants} className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-sm text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                >
                  {isLogin ? (
                    <>
                      Don't have an account?{' '}
                      <span className="text-cyan-400 font-medium">Sign up</span>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <span className="text-cyan-400 font-medium">Sign in</span>
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </div>

          {/* Bottom border glow */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-cyan-400/10 rounded-full"
        />
      </motion.div>
    </div>
  );
}

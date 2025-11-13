'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();
  const [earnings, setEarnings] = useState(0);
  const [activeUsers, setActiveUsers] = useState(15247);

  useEffect(() => {
    // Animate earnings counter
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { value: '$340K+', label: 'Paid Out' },
    { value: '15K+', label: 'Active Users' },
    { value: '$23.80', label: 'Avg/Month' },
    { value: '450K+', label: 'Receipts' }
  ];

  const howItWorks = [
    { step: '1', icon: '📸', title: 'Take Photo', description: 'Snap any receipt from any store' },
    { step: '2', icon: '⚡', title: 'Instant Process', description: 'AI reads it in seconds' },
    { step: '3', icon: '💰', title: 'Get Paid', description: 'Money added to your account' }
  ];

  const pricing = [
    { merchant: 'Apple Store', amount: '$2.50', icon: '🍎' },
    { merchant: 'Target', amount: '$0.15', icon: '🎯' },
    { merchant: 'Costco', amount: '$0.12', icon: '🏪' },
    { merchant: 'Starbucks', amount: '$0.03', icon: '☕' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d1117] to-[#0a0a0a] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-8"
            >
              <span className="text-green-400 font-semibold">💰 {activeUsers.toLocaleString()} people earning right now</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                Receipts = Money
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-medium">
              Upload. Earn. Repeat.
            </p>
            <p className="text-xl text-gray-400 mb-12">
              Stop throwing away money. Turn every receipt into cash.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-green-500 to-cyan-500 rounded-2xl text-white text-xl font-bold shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all"
              >
                Start Earning Now 💸
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-10 py-5 backdrop-blur-xl bg-white/5 border-2 border-white/20 rounded-2xl text-white text-xl font-semibold hover:bg-white/10 transition-all"
              >
                See How It Works
              </motion.button>
            </div>

            {/* Demo Animation */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative max-w-2xl mx-auto"
            >
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Example Receipt</span>
                  <span className="text-green-400 font-bold">→ $0.15</span>
                </div>
                <div className="h-32 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl"
                  >
                    🧾
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + (index * 0.1) }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
              >
                <p className="text-3xl font-bold text-green-400 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* How It Works */}
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-12">
              It's Stupid Simple
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {howItWorks.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + (index * 0.2) }}
                  className="relative"
                >
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:border-green-500/30 transition-all">
                    <div className="text-6xl mb-4">{item.icon}</div>
                    <div className="text-green-400 text-sm font-bold mb-2">STEP {item.step}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-400">{item.description}</p>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 text-green-400 text-2xl">
                      →
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Receipt Values */}
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
              What's Your Receipt Worth?
            </h2>
            <p className="text-center text-gray-400 mb-12 text-lg">Real earnings per receipt</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {pricing.map((item, index) => (
                <motion.div
                  key={item.merchant}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5 + (index * 0.1) }}
                  whileHover={{ scale: 1.05 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-green-500/30 transition-all"
                >
                  <div className="text-5xl mb-3">{item.icon}</div>
                  <p className="text-white font-semibold mb-2">{item.merchant}</p>
                  <p className="text-2xl font-bold text-green-400">{item.amount}</p>
                  <p className="text-xs text-gray-500 mt-1">per receipt</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            className="backdrop-blur-xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-3xl p-12 text-center max-w-4xl mx-auto mb-20"
          >
            <div className="text-5xl mb-6">🎉</div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Join 15,000+ People Making Money From Receipts
            </h3>
            <p className="text-xl text-gray-300 mb-8">
              "I made $47 last month from receipts I was going to throw away anyway. This is genius!" - Sarah M.
            </p>
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              {'★★★★★'.split('').map((star, i) => (
                <span key={i} className="text-2xl">{star}</span>
              ))}
              <span className="text-white ml-2">4.8/5 from 2,341 reviews</span>
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.2 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Upload your first receipt in 30 seconds
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard')}
              className="px-12 py-6 bg-gradient-to-r from-green-500 to-cyan-500 rounded-2xl text-white text-2xl font-bold shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all"
            >
              Get Started Free →
            </motion.button>
            <p className="text-sm text-gray-500 mt-4">No credit card required • 100% free</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

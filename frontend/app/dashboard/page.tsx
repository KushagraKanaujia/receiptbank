'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Simple Receipt Card
const ReceiptCard = ({ receipt }: any) => {
  const icons: any = {
    'Target': '🎯', 'Costco': '🏪', 'Wingstop': '🍗', 'Walmart': '🛒',
    'Whole Foods': '🥬', 'Starbucks': '☕', 'Apple Store': '🍎',
    'CVS': '💊', 'Trader Joe\'s': '🛍️', 'McDonald\'s': '🍔'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl hover:border-green-500/30 transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icons[receipt.merchant] || '🧾'}</span>
        <div>
          <p className="text-white font-semibold">{receipt.merchant}</p>
          <p className="text-xs text-gray-400">{receipt.date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-green-400">+${receipt.earnings}</p>
        {receipt.verified && <p className="text-xs text-green-400">✓ Verified</p>}
      </div>
    </motion.div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Gamification State
  const [stats, setStats] = useState({
    totalEarnings: 147.50,
    todayEarnings: 2.34,
    streak: 5,
    level: 'Silver',
    receiptsUploaded: 234,
    nextLevelAt: 300
  });

  const [badges, setBadges] = useState([
    { id: 1, name: '5 Day Streak', icon: '🔥', unlocked: true },
    { id: 2, name: 'Electronics Hunter', icon: '📱', unlocked: true },
    { id: 3, name: 'Century Club', icon: '💯', unlocked: true },
    { id: 4, name: 'Top Earner', icon: '👑', unlocked: false }
  ]);

  const [dailyChallenge, setDailyChallenge] = useState({
    title: 'Upload 3 receipts today',
    progress: 1,
    total: 3,
    reward: '$0.50 bonus'
  });

  const [recentReceipts, setRecentReceipts] = useState([
    {
      id: 1,
      merchant: 'Target',
      earnings: '0.15',
      date: 'Today, 2:34 PM',
      verified: true
    },
    {
      id: 2,
      merchant: 'Starbucks',
      earnings: '0.03',
      date: 'Today, 11:20 AM',
      verified: true
    },
    {
      id: 3,
      merchant: 'Apple Store',
      earnings: '2.50',
      date: 'Yesterday',
      verified: true
    }
  ]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    // Simulate upload with celebration
    setTimeout(() => {
      const newReceipt = {
        id: recentReceipts.length + 1,
        merchant: 'Trader Joe\'s',
        earnings: '0.09',
        date: 'Just now',
        verified: false
      };

      setRecentReceipts([newReceipt, ...recentReceipts]);
      setStats({
        ...stats,
        todayEarnings: stats.todayEarnings + 0.09,
        totalEarnings: stats.totalEarnings + 0.09,
        receiptsUploaded: stats.receiptsUploaded + 1
      });

      // Update challenge progress
      setDailyChallenge({
        ...dailyChallenge,
        progress: Math.min(dailyChallenge.progress + 1, dailyChallenge.total)
      });

      setUploading(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }, 1500);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const progressToNextLevel = (stats.receiptsUploaded / stats.nextLevelAt) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d1117] to-[#0a0a0a] relative overflow-hidden">
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              className="text-9xl"
            >
              🎉
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10">
        {/* Minimal Header */}
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">
              ReceiptBank
            </h1>
            <div className="flex items-center gap-4">
              {/* Streak Counter */}
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-xs text-gray-400">Streak</p>
                  <p className="text-sm font-bold text-orange-400">{stats.streak} days</p>
                </div>
              </div>
              {/* Today's Earnings */}
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="text-xs text-gray-400">Today</p>
                  <p className="text-sm font-bold text-green-400">${stats.todayEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8 max-w-6xl">
          {/* Hero Upload Section */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Hey! Upload a Receipt
              </h2>
              <p className="text-xl text-gray-400">Turn it into ${(0.02 + Math.random() * 0.5).toFixed(2)} instantly</p>
            </motion.div>

            {/* Giant Upload Button */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative backdrop-blur-xl bg-gradient-to-r from-green-500/20 to-cyan-500/20 border-4 border-dashed rounded-3xl p-12 transition-all duration-300 ${
                dragActive ? 'border-green-400 scale-105' : 'border-green-500/40 hover:border-green-400/60'
              }`}
            >
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  disabled={uploading}
                />

                <div className="text-center">
                  <motion.div
                    animate={{
                      y: uploading ? [0, -10, 0] : 0,
                      rotate: uploading ? [0, 5, -5, 0] : 0
                    }}
                    transition={{ duration: 0.6, repeat: uploading ? Infinity : 0 }}
                    className="text-8xl mb-6"
                  >
                    {uploading ? '⏳' : '📸'}
                  </motion.div>

                  <h3 className="text-3xl font-bold text-white mb-3">
                    {uploading ? 'Processing...' : 'Take Photo or Upload'}
                  </h3>

                  <p className="text-gray-400 mb-6">
                    {uploading ? 'Scanning your receipt...' : 'Any receipt from any store works!'}
                  </p>

                  {!uploading && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block px-12 py-5 bg-gradient-to-r from-green-500 to-cyan-500 rounded-2xl text-white text-2xl font-bold shadow-2xl shadow-green-500/50"
                    >
                      Click or Drop Here
                    </motion.div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Level & Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 backdrop-blur-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">⭐</span>
                <div>
                  <p className="text-xs text-gray-400">Your Level</p>
                  <p className="text-2xl font-bold text-white">{stats.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Progress to Gold</p>
                <p className="text-sm font-semibold text-white">{stats.receiptsUploaded}/{stats.nextLevelAt} receipts</p>
              </div>
            </div>
            <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextLevel}%` }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
          </motion.div>

          {/* Daily Challenge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 backdrop-blur-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🎯</span>
                <div>
                  <p className="text-yellow-400 font-bold mb-1">Daily Challenge</p>
                  <p className="text-white text-lg">{dailyChallenge.title}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold">{dailyChallenge.reward}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all"
                  style={{ width: `${(dailyChallenge.progress / dailyChallenge.total) * 100}%` }}
                />
              </div>
              <span className="text-white font-semibold">{dailyChallenge.progress}/{dailyChallenge.total}</span>
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold text-white mb-4">Your Badges</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + (index * 0.1) }}
                  className={`backdrop-blur-xl border rounded-xl p-4 text-center ${
                    badge.unlocked
                      ? 'bg-white/5 border-white/20'
                      : 'bg-white/5 border-white/10 opacity-50'
                  }`}
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <p className="text-white text-sm font-semibold">{badge.name}</p>
                  {badge.unlocked && <p className="text-xs text-green-400 mt-1">✓ Unlocked</p>}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Receipts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Recent Uploads</h3>
              <button
                onClick={() => router.push('/analytics')}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {recentReceipts.map((receipt) => (
                <ReceiptCard key={receipt.id} receipt={receipt} />
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <button
              onClick={() => router.push('/marketplace')}
              className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl hover:border-purple-400/50 transition-all text-left"
            >
              <div className="text-3xl mb-2">🛒</div>
              <p className="text-white font-semibold">Marketplace</p>
              <p className="text-xs text-gray-400 mt-1">See who's buying data</p>
            </button>

            <button
              onClick={() => router.push('/analytics')}
              className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl hover:border-cyan-400/50 transition-all text-left"
            >
              <div className="text-3xl mb-2">📊</div>
              <p className="text-white font-semibold">Analytics</p>
              <p className="text-xs text-gray-400 mt-1">Track your earnings</p>
            </button>

            <button
              className="p-6 backdrop-blur-xl bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-xl hover:border-green-400/50 transition-all text-left"
            >
              <div className="text-3xl mb-2">💰</div>
              <p className="text-green-400 font-bold">${stats.totalEarnings.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">Cash Out</p>
            </button>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

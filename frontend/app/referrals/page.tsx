'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ReferralsPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');

  const referralCode = 'DATAHUB-KA947';
  const referralLink = `https://datahub.app/join/${referralCode}`;

  const stats = {
    totalReferrals: 8,
    activeReferrals: 6,
    pendingEarnings: 20,
    totalEarned: 60,
  };

  const referralHistory = [
    { id: 1, name: 'Sarah J.', status: 'active', joined: '2 weeks ago', earned: 10, lifetime: 10, progress: 100 },
    { id: 2, name: 'Michael R.', status: 'active', joined: '3 weeks ago', earned: 10, lifetime: 20, progress: 100 },
    { id: 3, name: 'Emma K.', status: 'pending', joined: '5 days ago', earned: 0, lifetime: 0, progress: 60 },
    { id: 4, name: 'David L.', status: 'active', joined: '1 month ago', earned: 10, lifetime: 30, progress: 100 },
  ];

  const leaderboard = [
    { rank: 1, name: 'Alex Chen', referrals: 147, earnings: 1470, badge: '👑' },
    { rank: 2, name: 'Jordan Smith', referrals: 98, earnings: 980, badge: '🥈' },
    { rank: 3, name: 'Taylor Kim', referrals: 76, earnings: 760, badge: '🥉' },
    { rank: 12, name: 'You', referrals: 8, earnings: 80, badge: '⭐', highlight: true },
  ];

  const milestones = [
    { referrals: 5, bonus: 25, completed: true },
    { referrals: 10, bonus: 50, completed: false },
    { referrals: 25, bonus: 150, completed: false },
    { referrals: 50, bonus: 500, completed: false },
    { referrals: 100, bonus: 1500, completed: false },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInvite = () => {
    if (email.trim()) {
      alert(`Invitation sent to ${email}!`);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d1117] to-[#0a0a0a] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,217,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="backdrop-blur-xl bg-white/5 border-b border-white/10"
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  🎁 Referral Program
                </h1>
                <p className="text-sm text-gray-400">Earn $10 for every friend who joins • They get $10 too!</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8 max-w-6xl">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <p className="text-gray-400 text-sm mb-1">Total Referrals</p>
              <p className="text-3xl font-bold text-white">{stats.totalReferrals}</p>
              <p className="text-green-400 text-xs mt-1">+2 this month</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <p className="text-gray-400 text-sm mb-1">Active Referrals</p>
              <p className="text-3xl font-bold text-cyan-400">{stats.activeReferrals}</p>
              <p className="text-gray-400 text-xs mt-1">Earning monthly</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <p className="text-gray-400 text-sm mb-1">Pending Earnings</p>
              <p className="text-3xl font-bold text-yellow-400">${stats.pendingEarnings}</p>
              <p className="text-gray-400 text-xs mt-1">Processing</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <p className="text-gray-400 text-sm mb-1">Total Earned</p>
              <p className="text-3xl font-bold text-green-400">${stats.totalEarned}</p>
              <p className="text-green-400 text-xs mt-1">All time</p>
            </motion.div>
          </div>

          {/* How it Works Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 backdrop-blur-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">💰 How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400 font-bold">1</span>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Share Your Link</p>
                  <p className="text-gray-400 text-sm">Invite friends via email, social media, or your unique code</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400 font-bold">2</span>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">They Earn $20</p>
                  <p className="text-gray-400 text-sm">Your friend gets $10 bonus after earning their first $10</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400 font-bold">3</span>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">You Earn $10</p>
                  <p className="text-gray-400 text-sm">Get $10 instantly when they hit the milestone</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Share Your Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">🔗 Your Referral Link</h2>

              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Referral Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-mono"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-3 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all"
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Full Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-3 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all"
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              {/* Social Share */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Share on Social</label>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-3 bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 text-[#1DA1F2] rounded-lg hover:bg-[#1DA1F2]/30 transition-all">
                    🐦 Twitter
                  </button>
                  <button className="flex-1 px-4 py-3 bg-[#0077B5]/20 border border-[#0077B5]/30 text-[#0077B5] rounded-lg hover:bg-[#0077B5]/30 transition-all">
                    💼 LinkedIn
                  </button>
                  <button className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all">
                    📧 Email
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Send Invite */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">📨 Send Invite</h2>

              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Friend's Email</label>
                <input
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendInvite()}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                />
              </div>

              <button
                onClick={sendInvite}
                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all mb-4"
              >
                Send Invitation
              </button>

              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                <p className="text-cyan-400 text-sm font-semibold mb-2">📧 Email Preview:</p>
                <p className="text-gray-300 text-xs leading-relaxed">
                  "Hey! I've been earning passive income from my data with DataHub. Join using my code <span className="text-cyan-400 font-mono">{referralCode}</span> and we both get $10 bonus! 🎁"
                </p>
              </div>
            </motion.div>
          </div>

          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-4">🎯 Milestone Bonuses</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {milestones.map((milestone) => (
                <div
                  key={milestone.referrals}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    milestone.completed
                      ? 'bg-green-500/10 border-green-500/30'
                      : stats.totalReferrals >= milestone.referrals
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="text-2xl mb-2">{milestone.completed ? '✅' : '🎁'}</div>
                  <p className="text-white font-bold text-lg mb-1">{milestone.referrals} Refs</p>
                  <p className="text-green-400 font-semibold text-sm">${milestone.bonus} Bonus</p>
                  {milestone.completed && (
                    <p className="text-green-400 text-xs mt-2">Earned!</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referral History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">👥 Your Referrals</h2>
              <div className="space-y-3">
                {referralHistory.map((ref) => (
                  <div
                    key={ref.id}
                    className={`p-4 rounded-lg border ${
                      ref.status === 'active'
                        ? 'bg-green-500/5 border-green-500/20'
                        : 'bg-yellow-500/5 border-yellow-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {ref.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{ref.name}</p>
                          <p className="text-gray-400 text-xs">{ref.joined}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ref.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {ref.status === 'active' ? '✓ Active' : '⏳ Pending'}
                      </span>
                    </div>

                    {ref.status === 'pending' && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400">Progress to $10</span>
                          <span className="text-cyan-400 font-semibold">{ref.progress}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                            style={{ width: `${ref.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Your earnings:</span>
                      <span className="text-green-400 font-bold">${ref.earned}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">🏆 Global Leaderboard</h2>
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`p-3 rounded-lg flex items-center justify-between ${
                      entry.highlight
                        ? 'bg-cyan-500/10 border border-cyan-500/30'
                        : 'bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{entry.badge}</span>
                      <div>
                        <p className={`font-semibold ${entry.highlight ? 'text-cyan-400' : 'text-white'}`}>
                          {entry.name}
                        </p>
                        <p className="text-gray-400 text-xs">{entry.referrals} referrals</p>
                      </div>
                    </div>
                    <p className="text-green-400 font-bold">${entry.earnings}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg text-center">
                <p className="text-sm text-gray-300">
                  Reach top 10 to unlock <span className="text-cyan-400 font-bold">exclusive rewards</span> 🎁
                </p>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

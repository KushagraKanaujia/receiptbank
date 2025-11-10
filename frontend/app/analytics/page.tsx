'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const router = useRouter();

  const monthlyData = [
    { month: 'Jan', spotify: 45, fitbit: 38, google: 42, plaid: 35, notion: 28 },
    { month: 'Feb', spotify: 52, fitbit: 42, google: 45, plaid: 38, notion: 32 },
    { month: 'Mar', spotify: 48, fitbit: 45, google: 48, plaid: 42, notion: 35 },
    { month: 'Apr', spotify: 61, fitbit: 48, google: 51, plaid: 45, notion: 38 },
    { month: 'May', spotify: 58, fitbit: 52, google: 54, plaid: 48, notion: 42 },
    { month: 'Jun', spotify: 65, fitbit: 55, google: 57, plaid: 51, notion: 45 }
  ];

  const earningsData = [
    { month: 'Jan', earnings: 0 },
    { month: 'Feb', earnings: 0 },
    { month: 'Mar', earnings: 30 },
    { month: 'Apr', earnings: 60 },
    { month: 'May', earnings: 90 },
    { month: 'Jun', earnings: 120 }
  ];

  const dataUsageByService = [
    { name: 'Spotify', value: 35, color: '#1DB954' },
    { name: 'Fitbit', value: 25, color: '#00B0B9' },
    { name: 'Google Calendar', value: 20, color: '#4285F4' },
    { name: 'Plaid', value: 15, color: '#00C9A7' },
    { name: 'Notion', value: 5, color: '#FFFFFF' }
  ];

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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <p className="text-gray-400 text-sm mb-1">Total Data Points</p>
              <p className="text-4xl font-bold text-white">12.4K</p>
              <p className="text-green-400 text-sm mt-2">+23% from last month</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <p className="text-gray-400 text-sm mb-1">Active Buyers</p>
              <p className="text-4xl font-bold text-white">1</p>
              <p className="text-gray-400 text-sm mt-2">Productivity Labs</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <p className="text-gray-400 text-sm mb-1">Monthly Revenue</p>
              <p className="text-4xl font-bold text-green-400">$30</p>
              <p className="text-green-400 text-sm mt-2">+100% growth</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <p className="text-gray-400 text-sm mb-1">Data Quality Score</p>
              <p className="text-4xl font-bold text-cyan-400">94%</p>
              <p className="text-gray-400 text-sm mt-2">Excellent</p>
            </motion.div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Activity by Service */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Data Activity by Service</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Legend />
                  <Line type="monotone" dataKey="spotify" stroke="#1DB954" strokeWidth={2} name="Spotify" />
                  <Line type="monotone" dataKey="fitbit" stroke="#00B0B9" strokeWidth={2} name="Fitbit" />
                  <Line type="monotone" dataKey="google" stroke="#4285F4" strokeWidth={2} name="Google" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Earnings Growth */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Earnings Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={earningsData}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Area type="monotone" dataKey="earnings" stroke="#10b981" fillOpacity={1} fill="url(#colorEarnings)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Data Usage Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Data Usage Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dataUsageByService}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {dataUsageByService.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Data Requests by Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Request Volume by Service</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { service: 'Spotify', requests: 45 },
                  { service: 'Fitbit', requests: 38 },
                  { service: 'Google', requests: 32 },
                  { service: 'Plaid', requests: 28 },
                  { service: 'Notion', requests: 22 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="service" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Bar dataKey="requests" fill="#00d9ff" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* AI-Powered Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 backdrop-blur-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI-Powered Insights</h3>
                <p className="text-sm text-gray-400">Smart recommendations to maximize your earnings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-400">💰</span>
                  <p className="text-green-400 font-semibold">Pricing Opportunity</p>
                </div>
                <p className="text-gray-300 text-sm mb-2">Your Spotify data is in very high demand. Market rate is 20% higher.</p>
                <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                  Optimize Pricing →
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-400">📦</span>
                  <p className="text-purple-400 font-semibold">Package Suggestion</p>
                </div>
                <p className="text-gray-300 text-sm mb-2">Create "Fitness Enthusiast" package and earn 50% more per service.</p>
                <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                  View Packages →
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-400">🎯</span>
                  <p className="text-blue-400 font-semibold">New Opportunities</p>
                </div>
                <p className="text-gray-300 text-sm mb-2">5 businesses looking for your Fitbit health data profile. Average: $28/mo.</p>
                <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                  View Requests →
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400">⚠️</span>
                  <p className="text-yellow-400 font-semibold">Data Quality Alert</p>
                </div>
                <p className="text-gray-300 text-sm mb-2">Last sync was 2 days ago. Sync now to maintain 94% quality score.</p>
                <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                  Sync Now →
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-cyan-400">📈</span>
                  <p className="text-cyan-400 font-semibold">Growth Forecast</p>
                </div>
                <p className="text-gray-300 text-sm mb-2">Connect 3 more sources and you could earn $180/mo (+100% increase).</p>
                <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                  Add Sources →
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-pink-400">🎁</span>
                  <p className="text-pink-400 font-semibold">Referral Bonus</p>
                </div>
                <p className="text-gray-300 text-sm mb-2">You're 2 referrals away from $50 milestone bonus. Share your link!</p>
                <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                  Invite Friends →
                </button>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

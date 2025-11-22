'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PublicStats {
  platform: {
    totalUsers: number;
    totalReceipts: number;
    totalEarningsPaid: number;
    receiptsToday: number;
  };
  recentActivity: Array<{
    category: string;
    earnings: number;
    timeAgo: string;
  }>;
  categories: Array<{
    category: string;
    count: number;
    totalEarnings: number;
  }>;
}

export default function PublicStatsPage() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/receipts/public-stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a1f] via-[#1a1a3f] to-[#0a0a1f] flex items-center justify-center">
        <div className="text-white text-xl">Loading stats...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a1f] via-[#1a1a3f] to-[#0a0a1f] flex items-center justify-center">
        <div className="text-white text-xl">Failed to load stats</div>
      </div>
    );
  }

  const { platform, recentActivity, categories } = stats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1f] via-[#1a1a3f] to-[#0a0a1f] text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            ReceiptBank Live Stats
          </h1>
          <p className="text-gray-400 text-lg">
            Real-time platform activity and earnings
          </p>
        </motion.div>

        {/* Platform Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <StatCard
            label="Total Users"
            value={platform.totalUsers.toLocaleString()}
            icon="👥"
            delay={0}
          />
          <StatCard
            label="Receipts Processed"
            value={platform.totalReceipts.toLocaleString()}
            icon="📄"
            delay={0.1}
          />
          <StatCard
            label="Total Paid Out"
            value={`$${platform.totalEarningsPaid.toLocaleString()}`}
            icon="💰"
            delay={0.2}
          />
          <StatCard
            label="Today's Receipts"
            value={platform.receiptsToday.toLocaleString()}
            icon="🔥"
            delay={0.3}
          />
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>📊</span> Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    {getCategoryIcon(activity.category)}
                  </div>
                  <div>
                    <div className="font-semibold capitalize">{activity.category}</div>
                    <div className="text-sm text-gray-400">{activity.timeAgo}</div>
                  </div>
                </div>
                <div className="text-green-400 font-bold">
                  +${activity.earnings.toFixed(2)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>📈</span> Category Breakdown
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat: any, index) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4"
              >
                <div className="text-3xl mb-2">{getCategoryIcon(cat.category)}</div>
                <div className="font-semibold capitalize text-lg mb-1">{cat.category}</div>
                <div className="text-sm text-gray-400">{cat.count} receipts</div>
                <div className="text-cyan-400 font-bold mt-2">
                  ${parseFloat(cat.totalEarnings).toFixed(2)} paid
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <a
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full font-bold text-lg hover:scale-105 transition-transform"
          >
            Start Earning Now →
          </a>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, delay }: { label: string; value: string; icon: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
    >
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-gray-400">{label}</div>
    </motion.div>
  );
}

function getCategoryIcon(category: string): string {
  const icons: { [key: string]: string } = {
    grocery: '🛒',
    electronics: '📱',
    restaurant: '🍔',
    retail: '🏪',
    pharmacy: '💊',
    other: '📦',
  };
  return icons[category.toLowerCase()] || '📄';
}

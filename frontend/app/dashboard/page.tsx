'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import DataModal from '@/components/DataModal';

// Service card component with stunning visuals
const ServiceCard = ({
  name,
  icon,
  description,
  isConnected,
  color,
  demand,
  onConnect,
  onDisconnect,
  onSync
}: any) => {
  const [isHovered, setIsHovered] = useState(false);

  const demandConfig = {
    'Very High': { color: '#10b981', bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400', label: '🔥 Very High Demand' },
    'High': { color: '#0ea5e9', bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', label: '⚡ High Demand' },
    'Medium': { color: '#f59e0b', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', label: '💫 Medium Demand' },
    'Low': { color: '#6b7280', bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-400', label: '💤 Low Demand' }
  };

  const demandInfo = demandConfig[demand as keyof typeof demandConfig] || demandConfig['Medium'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
           style={{ background: `linear-gradient(135deg, ${color}20, ${color}40)` }}
      />

      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 h-full overflow-hidden">
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px"
             style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />

        {/* Icon & Status */}
        <div className="flex items-start justify-between mb-3">
          <motion.div
            animate={{ rotate: isHovered ? [0, 5, -5, 0] : 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl"
          >
            {icon}
          </motion.div>

          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isConnected
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </div>
        </div>

        {/* Demand Badge */}
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3 ${demandInfo.bg} ${demandInfo.border} ${demandInfo.text} border`}>
          {demandInfo.label}
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-white mb-2">{name}</h3>
        <p className="text-gray-400 text-xs mb-4">{description}</p>

        {/* Actions */}
        <div className="flex gap-2">
          {isConnected ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSync}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                style={{
                  background: `linear-gradient(135deg, ${color}40, ${color}60)`,
                  color: 'white',
                  border: `1px solid ${color}50`
                }}
              >
                Sync
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDisconnect}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-red-500/30 transition-all duration-300 text-sm"
              >
                Disconnect
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConnect}
              className="w-full px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
              style={{
                background: `linear-gradient(135deg, ${color}40, ${color}60)`,
                color: 'white',
                border: `1px solid ${color}50`
              }}
            >
              Connect
            </motion.button>
          )}
        </div>

        {/* Corner accent */}
        <motion.div
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8
          }}
          className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-2xl"
          style={{ background: `${color}20` }}
        />
      </div>
    </motion.div>
  );
};

// Stats card component
const StatsCard = ({ label, value, icon, color }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 overflow-hidden group"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="text-3xl opacity-50" style={{ color }}>
          {icon}
        </div>
      </div>

      <motion.div
        className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `${color}30` }}
      />
    </motion.div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showDataModal, setShowDataModal] = useState(false);
  const [stats, setStats] = useState({
    connected: 0,
    totalData: '0',
    earnings: '$0'
  });

  const serviceCategories = {
    'Music & Entertainment': [
      {
        name: 'Spotify',
        provider: 'spotify',
        icon: '🎵',
        description: 'Music streaming & listening habits',
        color: '#1DB954',
        demand: 'High'
      },
      {
        name: 'Netflix',
        provider: 'netflix',
        icon: '🎬',
        description: 'Watch history & preferences',
        color: '#E50914',
        demand: 'High'
      },
      {
        name: 'YouTube',
        provider: 'youtube',
        icon: '📺',
        description: 'Video watch history & subscriptions',
        color: '#FF0000',
        demand: 'Very High'
      },
    ],
    'Health & Fitness': [
      {
        name: 'Fitbit',
        provider: 'fitbit',
        icon: '⚡',
        description: 'Activity, sleep & heart rate data',
        color: '#00B0B9',
        demand: 'Very High'
      },
      {
        name: 'Apple Health',
        provider: 'apple_health',
        icon: '❤️',
        description: 'Comprehensive health metrics',
        color: '#FF3B30',
        demand: 'Very High'
      },
      {
        name: 'Oura Ring',
        provider: 'oura',
        icon: '💍',
        description: 'Sleep & readiness tracking',
        color: '#00D9FF',
        demand: 'Medium'
      },
      {
        name: 'Whoop',
        provider: 'whoop',
        icon: '📊',
        description: 'Recovery & strain analytics',
        color: '#FF3366',
        demand: 'Medium'
      },
      {
        name: 'Strava',
        provider: 'strava',
        icon: '🏃',
        description: 'Running & cycling activities',
        color: '#FC4C02',
        demand: 'High'
      },
      {
        name: 'MyFitnessPal',
        provider: 'myfitnesspal',
        icon: '🍎',
        description: 'Nutrition & calorie tracking',
        color: '#0072C6',
        demand: 'High'
      },
    ],
    'Social Media': [
      {
        name: 'Instagram',
        provider: 'instagram',
        icon: '📸',
        description: 'Posts, stories & engagement data',
        color: '#E1306C',
        demand: 'Very High'
      },
      {
        name: 'TikTok',
        provider: 'tiktok',
        icon: '🎵',
        description: 'Video engagement & preferences',
        color: '#000000',
        demand: 'Very High'
      },
      {
        name: 'Twitter/X',
        provider: 'twitter',
        icon: '🐦',
        description: 'Tweets, likes & interactions',
        color: '#1DA1F2',
        demand: 'High'
      },
      {
        name: 'LinkedIn',
        provider: 'linkedin',
        icon: '💼',
        description: 'Professional network & activity',
        color: '#0077B5',
        demand: 'High'
      },
    ],
    'Shopping & Travel': [
      {
        name: 'Amazon',
        provider: 'amazon',
        icon: '📦',
        description: 'Purchase history & preferences',
        color: '#FF9900',
        demand: 'Very High'
      },
      {
        name: 'Uber',
        provider: 'uber',
        icon: '🚗',
        description: 'Ride history & location patterns',
        color: '#000000',
        demand: 'High'
      },
      {
        name: 'DoorDash',
        provider: 'doordash',
        icon: '🍔',
        description: 'Food delivery preferences',
        color: '#FF3008',
        demand: 'Medium'
      },
    ],
    'Finance & Banking': [
      {
        name: 'Plaid',
        provider: 'plaid',
        icon: '💳',
        description: 'Banking & transaction data',
        color: '#00C9A7',
        demand: 'Very High'
      },
      {
        name: 'Venmo',
        provider: 'venmo',
        icon: '💸',
        description: 'P2P payment patterns',
        color: '#3D95CE',
        demand: 'High'
      },
      {
        name: 'PayPal',
        provider: 'paypal',
        icon: '💰',
        description: 'Transaction & payment history',
        color: '#003087',
        demand: 'High'
      },
      {
        name: 'Coinbase',
        provider: 'coinbase',
        icon: '₿',
        description: 'Crypto trading & portfolio',
        color: '#0052FF',
        demand: 'Medium'
      },
    ],
    'Productivity': [
      {
        name: 'Google Calendar',
        provider: 'google',
        icon: '📅',
        description: 'Calendar & scheduling patterns',
        color: '#4285F4',
        demand: 'High'
      },
      {
        name: 'Notion',
        provider: 'notion',
        icon: '📝',
        description: 'Workspace & productivity data',
        color: '#FFFFFF',
        demand: 'Medium'
      },
      {
        name: 'Slack',
        provider: 'slack',
        icon: '💬',
        description: 'Communication patterns',
        color: '#4A154B',
        demand: 'Medium'
      },
      {
        name: 'GitHub',
        provider: 'github',
        icon: '💻',
        description: 'Code activity & contributions',
        color: '#181717',
        demand: 'Medium'
      },
      {
        name: 'Trello',
        provider: 'trello',
        icon: '📋',
        description: 'Task management & workflows',
        color: '#0079BF',
        demand: 'Low'
      },
    ],
    'Gaming': [
      {
        name: 'Steam',
        provider: 'steam',
        icon: '🎮',
        description: 'Gaming activity & preferences',
        color: '#171A21',
        demand: 'High'
      },
    ]
  };

  // Flatten all services for easy iteration
  const serviceConfig = Object.values(serviceCategories).flat();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Skip auth for now - just show the UI with demo data
    setUser({ email: 'demo@datahub.com' });
    setServices([]);
    setStats({
      connected: 0,
      totalData: '0',
      earnings: '$0.00'
    });
    setLoading(false);
  };

  const handleConnect = (provider: string) => {
    // Simulate connection - show data modal immediately for demo
    setServices([...services, { provider, isActive: true }]);
    setStats({
      ...stats,
      connected: stats.connected + 1,
      totalData: `${(stats.connected + 1) * 1240}`
    });
    setSelectedService(provider);
    setShowDataModal(true);
  };

  const handleDisconnect = async (provider: string) => {
    setServices(services.filter(s => s.provider !== provider));
    setStats({
      ...stats,
      connected: Math.max(0, stats.connected - 1),
      totalData: `${Math.max(0, stats.connected - 1) * 1240}`
    });
  };

  const handleSync = async (provider: string) => {
    setSelectedService(provider);
    setShowDataModal(true);
  };

  const handleViewData = (provider: string) => {
    setSelectedService(provider);
    setShowDataModal(true);
  };

  const handleLogout = () => {
    // Refresh the page to reset demo
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d1117] to-[#0a0a0a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <DataModal
        isOpen={showDataModal}
        onClose={() => setShowDataModal(false)}
        service={selectedService || ''}
        data={{}}
      />

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  DataHub API
                </h1>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-xs text-cyan-400 font-medium">Live</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:block text-right">
                  <p className="text-sm text-gray-400">Welcome back,</p>
                  <p className="text-sm font-medium text-white">{user?.email}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-cyan-400/50 transition-all duration-300"
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <StatsCard
              label="Connected Services"
              value={stats.connected}
              icon="🔗"
              color="#00d9ff"
            />
            <StatsCard
              label="Data Points"
              value={stats.totalData}
              icon="📊"
              color="#0ea5e9"
            />
            <StatsCard
              label="Total Earnings"
              value={stats.earnings}
              icon="💰"
              color="#10b981"
            />
          </motion.div>

          {/* Services Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Available Data Sources</h2>
                <p className="text-gray-400 text-sm">26 integrations • Connect and monetize your data</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => loadData()}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
              >
                🔄 Refresh
              </motion.button>
            </div>

            {/* Services grouped by category */}
            {Object.entries(serviceCategories).map(([category, categoryServices], catIndex) => (
              <div key={category} className="mb-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * catIndex }}
                  className="flex items-center gap-3 mb-4"
                >
                  <h3 className="text-lg font-semibold text-white">{category}</h3>
                  <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs text-cyan-400">
                    {categoryServices.length} sources
                  </span>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryServices.map((service: any, index: number) => {
                    const isConnected = services.some(s => s.provider === service.provider);
                    return (
                      <motion.div
                        key={service.provider}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <ServiceCard
                          {...service}
                          isConnected={isConnected}
                          onConnect={() => handleConnect(service.provider)}
                          onDisconnect={() => handleDisconnect(service.provider)}
                          onSync={() => handleSync(service.provider)}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 space-y-4"
          >
            {/* Featured: Data Packages */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => router.push('/packages')}
              className="w-full p-6 backdrop-blur-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl text-left group hover:border-green-400/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-2xl">
                    📦
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-green-400 group-hover:text-green-300 transition-colors">Data Packages</h3>
                      <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400 font-semibold">+50% Earnings</span>
                    </div>
                    <p className="text-gray-400 text-sm">Bundle your data sources for premium pricing • 6 curated packages available</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/autopilot')}
                className="p-6 backdrop-blur-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl text-left group hover:border-cyan-400/50 transition-all duration-300"
              >
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="text-cyan-400 font-semibold mb-1 group-hover:text-cyan-300 transition-colors">Autopilot Mode</h3>
                <p className="text-gray-400 text-sm">Auto-approve with smart rules</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/marketplace')}
                className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-left group hover:border-cyan-400/30 transition-all duration-300"
              >
                <div className="text-2xl mb-2">🛒</div>
                <h3 className="text-white font-semibold mb-1 group-hover:text-cyan-400 transition-colors">Marketplace</h3>
                <p className="text-gray-400 text-sm">Browse data requests</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/analytics')}
                className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-left group hover:border-cyan-400/30 transition-all duration-300"
              >
                <div className="text-2xl mb-2">📈</div>
                <h3 className="text-white font-semibold mb-1 group-hover:text-cyan-400 transition-colors">Analytics</h3>
                <p className="text-gray-400 text-sm">View your insights</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/settings')}
                className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-left group hover:border-cyan-400/30 transition-all duration-300"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <h3 className="text-white font-semibold mb-1 group-hover:text-cyan-400 transition-colors">Settings</h3>
                <p className="text-gray-400 text-sm">Manage account</p>
              </motion.button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
    </>
  );
}

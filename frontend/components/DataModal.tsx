'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: string;
  data: any;
}

export default function DataModal({ isOpen, onClose, service, data }: DataModalProps) {
  const renderSpotifyData = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Total Listening Time</p>
          <p className="text-3xl font-bold text-white">127h 32m</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Tracks Played</p>
          <p className="text-3xl font-bold text-white">1,234</p>
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Top Songs This Month</h3>
        <div className="space-y-2">
          {['Blinding Lights', 'Starboy', 'Save Your Tears', 'The Hills', 'Can\'t Feel My Face'].map((song, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-cyan-400 font-bold">#{i + 1}</span>
                <div>
                  <p className="text-white font-medium">{song}</p>
                  <p className="text-gray-400 text-sm">The Weeknd</p>
                </div>
              </div>
              <span className="text-gray-400 text-sm">{Math.floor(Math.random() * 50) + 10} plays</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Listening Activity</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={[
            { day: 'Mon', hours: 4 },
            { day: 'Tue', hours: 6 },
            { day: 'Wed', hours: 5 },
            { day: 'Thu', hours: 8 },
            { day: 'Fri', hours: 7 },
            { day: 'Sat', hours: 9 },
            { day: 'Sun', hours: 6 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="day" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
            <Line type="monotone" dataKey="hours" stroke="#1DB954" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderFitbitData = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Today's Steps</p>
          <p className="text-3xl font-bold text-white">8,432</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Calories</p>
          <p className="text-3xl font-bold text-white">2,341</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Active Minutes</p>
          <p className="text-3xl font-bold text-white">67</p>
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Weekly Steps</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[
            { day: 'Mon', steps: 7200 },
            { day: 'Tue', steps: 8500 },
            { day: 'Wed', steps: 9100 },
            { day: 'Thu', steps: 7800 },
            { day: 'Fri', steps: 8200 },
            { day: 'Sat', steps: 10500 },
            { day: 'Sun', steps: 8432 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="day" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
            <Bar dataKey="steps" fill="#00B0B9" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Heart Rate Zones</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={[
                { name: 'Rest', value: 45, color: '#10b981' },
                { name: 'Fat Burn', value: 30, color: '#f59e0b' },
                { name: 'Cardio', value: 20, color: '#ef4444' },
                { name: 'Peak', value: 5, color: '#8b5cf6' }
              ]}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label
            >
              {[
                { name: 'Rest', value: 45, color: '#10b981' },
                { name: 'Fat Burn', value: 30, color: '#f59e0b' },
                { name: 'Cardio', value: 20, color: '#ef4444' },
                { name: 'Peak', value: 5, color: '#8b5cf6' }
              ].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderGoogleCalendarData = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Upcoming Events</p>
          <p className="text-3xl font-bold text-white">12</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">This Week</p>
          <p className="text-3xl font-bold text-white">23h</p>
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Upcoming Events</h3>
        <div className="space-y-2">
          {[
            { title: 'Team Standup', time: 'Today, 10:00 AM', duration: '30 min' },
            { title: 'Client Meeting', time: 'Today, 2:00 PM', duration: '1 hour' },
            { title: 'Code Review', time: 'Tomorrow, 11:00 AM', duration: '45 min' },
            { title: 'Sprint Planning', time: 'Wed, 9:00 AM', duration: '2 hours' }
          ].map((event, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-white font-medium">{event.title}</p>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-gray-400 text-sm">📅 {event.time}</p>
                <p className="text-gray-400 text-sm">⏱️ {event.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Meeting Hours This Week</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[
            { day: 'Mon', hours: 3 },
            { day: 'Tue', hours: 5 },
            { day: 'Wed', hours: 4 },
            { day: 'Thu', hours: 6 },
            { day: 'Fri', hours: 2 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="day" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
            <Bar dataKey="hours" fill="#4285F4" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderPlaidData = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Total Balance</p>
          <p className="text-3xl font-bold text-white">$12,487.32</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">This Month</p>
          <p className="text-3xl font-bold text-red-400">-$3,241</p>
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Spending by Category</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={[
                { name: 'Food', value: 800, color: '#10b981' },
                { name: 'Transport', value: 400, color: '#f59e0b' },
                { name: 'Shopping', value: 1200, color: '#ef4444' },
                { name: 'Bills', value: 600, color: '#8b5cf6' },
                { name: 'Other', value: 241, color: '#06b6d4' }
              ]}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label
            >
              {[
                { name: 'Food', value: 800, color: '#10b981' },
                { name: 'Transport', value: 400, color: '#f59e0b' },
                { name: 'Shopping', value: 1200, color: '#ef4444' },
                { name: 'Bills', value: 600, color: '#8b5cf6' },
                { name: 'Other', value: 241, color: '#06b6d4' }
              ].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Recent Transactions</h3>
        <div className="space-y-2">
          {[
            { name: 'Whole Foods Market', amount: -87.32, category: 'Food' },
            { name: 'Uber', amount: -15.50, category: 'Transport' },
            { name: 'Amazon', amount: -234.99, category: 'Shopping' },
            { name: 'Salary Deposit', amount: 5000, category: 'Income' }
          ].map((txn, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{txn.name}</p>
                <p className="text-gray-400 text-sm">{txn.category}</p>
              </div>
              <span className={`font-bold ${txn.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                {txn.amount > 0 ? '+' : ''}${Math.abs(txn.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotionData = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Total Pages</p>
          <p className="text-3xl font-bold text-white">127</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Databases</p>
          <p className="text-3xl font-bold text-white">8</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">This Week</p>
          <p className="text-3xl font-bold text-white">23</p>
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Recently Edited</h3>
        <div className="space-y-2">
          {[
            { title: 'Project Roadmap Q4', updated: '2 hours ago', type: 'Page' },
            { title: 'Meeting Notes', updated: '5 hours ago', type: 'Page' },
            { title: 'Tasks Database', updated: '1 day ago', type: 'Database' },
            { title: 'Ideas & Brainstorm', updated: '2 days ago', type: 'Page' }
          ].map((item, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <p className="text-white font-medium">📄 {item.title}</p>
                <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">{item.type}</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Updated {item.updated}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Activity This Month</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={[
            { week: 'Week 1', edits: 12 },
            { week: 'Week 2', edits: 19 },
            { week: 'Week 3', edits: 15 },
            { week: 'Week 4', edits: 23 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="week" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
            <Line type="monotone" dataKey="edits" stroke="#FFFFFF" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (service) {
      case 'spotify':
        return renderSpotifyData();
      case 'fitbit':
        return renderFitbitData();
      case 'google':
        return renderGoogleCalendarData();
      case 'plaid':
        return renderPlaidData();
      case 'notion':
        return renderNotionData();
      default:
        return <p className="text-gray-400">No data available</p>;
    }
  };

  const getServiceName = () => {
    const names: Record<string, string> = {
      spotify: 'Spotify',
      fitbit: 'Fitbit',
      google: 'Google Calendar',
      plaid: 'Plaid',
      notion: 'Notion'
    };
    return names[service] || service;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 p-6 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">{getServiceName()} Data</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {renderContent()}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 p-6">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all"
                  >
                    Close
                  </button>
                  <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white hover:from-cyan-600 hover:to-blue-700 transition-all">
                    Export Data
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

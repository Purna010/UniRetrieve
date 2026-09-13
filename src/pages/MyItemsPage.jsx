import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import ItemCard from '../components/items/ItemCard';
import { staggerContainer, staggerItem, fadeInUp } from '../animations/variants';

export default function MyItemsPage() {
  const { items, currentUser } = useApp();

  const myItems = items.filter(item => item.reportedBy.id === currentUser.id);
  const activeItems = myItems.filter(item => item.status !== 'claimed');
  const pastItems = myItems.filter(item => item.status === 'claimed');

  return (
    <div className="space-y-10">
      <motion.div {...fadeInUp}>
        <h1 className="text-2xl font-bold text-white mb-2">My Items</h1>
        <p className="text-sm text-white/50">Manage your reported lost and found items from here.</p>
      </motion.div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-neon-cyan border-b border-neon-cyan/20 pb-2">Active Reports</h2>
        {activeItems.length === 0 ? (
          <p className="text-sm text-white/30 italic">No active reports.</p>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {activeItems.map(item => (
              <motion.div key={item.id} variants={staggerItem}>
                <ItemCard item={item} showMatch={true} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-white/50 border-b border-white/10 pb-2">Past History (Claimed)</h2>
        {pastItems.length === 0 ? (
          <p className="text-sm text-white/30 italic">No past history.</p>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 opacity-70"
          >
            {pastItems.map(item => (
              <motion.div key={item.id} variants={staggerItem}>
                <ItemCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

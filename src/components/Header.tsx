/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bell, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import './CSS/Header.css';

export default function Header() {
  return (
    <nav className="bg-surface/70 backdrop-blur-2xl fixed top-0 w-full z-50 border-b border-outline-variant/10">
      <div className="flex justify-between items-center w-full px-6 md:px-12 py-6 max-w-[1920px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-headline italic font-bold text-primary"
        >
          BeeSang
        </motion.div>
        
        <div className="hidden md:flex gap-8 items-center font-headline text-lg tracking-tight">
          <a className="text-primary font-bold border-b-2 border-primary/40 pb-1 hover:text-primary-dim transition-all duration-500" href="#">Dashboard</a>
          <a className="text-on-surface-variant font-medium hover:text-primary-dim transition-all duration-500" href="#">Meditation</a>
          <a className="text-on-surface-variant font-medium hover:text-primary-dim transition-all duration-500" href="#">Reports</a>
          <a className="text-on-surface-variant font-medium hover:text-primary-dim transition-all duration-500" href="#">Profile</a>
        </div>

        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-on-primary rounded-full px-6 py-2 text-sm font-semibold tracking-wide hover:bg-primary-dim transition-colors hidden sm:block"
          >
            Start Session
          </motion.button>
          
          <div className="flex gap-2 text-primary">
            <button className="p-2 hover:bg-surface-container rounded-full transition-colors">
              <Bell size={20} />
            </button>
            <button className="p-2 hover:bg-surface-container rounded-full transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

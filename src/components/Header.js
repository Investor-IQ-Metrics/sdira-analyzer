import React from 'react';
import { motion } from 'framer-motion';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <motion.div 
          className="logo-section"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="logo-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="18" width="14" height="18" rx="2" fill="currentColor" opacity="0.8"/>
              <rect x="22" y="10" width="14" height="26" rx="2" fill="currentColor"/>
              <path d="M20 4L36 16H4L20 4Z" fill="currentColor" opacity="0.6"/>
              <circle cx="11" cy="24" r="2" fill="white"/>
              <circle cx="29" cy="18" r="2" fill="white"/>
              <circle cx="29" cy="28" r="2" fill="white"/>
            </svg>
          </div>
          <div className="logo-text">
            <h1>SDIRA Property Analyzer</h1>
            <p>Self-Directed IRA Investment Intelligence</p>
          </div>
        </motion.div>

        <motion.div 
          className="header-badge"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="badge-text">Real Estate Analysis</span>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;

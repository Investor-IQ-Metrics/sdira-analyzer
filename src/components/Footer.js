import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Copyright } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Main Footer Info */}
        <div className="footer-main">
          <div className="footer-brand">
            <div className="brand-logo">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="18" width="14" height="18" rx="2" fill="currentColor" opacity="0.8"/>
                <rect x="22" y="10" width="14" height="26" rx="2" fill="currentColor"/>
                <path d="M20 4L36 16H4L20 4Z" fill="currentColor" opacity="0.6"/>
                <circle cx="11" cy="24" r="2" fill="white"/>
                <circle cx="29" cy="18" r="2" fill="white"/>
                <circle cx="29" cy="28" r="2" fill="white"/>
              </svg>
            </div>
            <div className="brand-text">
              <h4>SDIRA Property Investment Analyzer</h4>
              <p>Self-Directed IRA Investment Intelligence Platform</p>
            </div>
          </div>
          
          <div className="footer-tagline">
            <p>Empowering investors with data-driven real estate analysis</p>
          </div>
        </div>

        {/* Legal Section */}
        <div className="footer-legal">
          <motion.div 
            className="legal-item copyright-notice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Copyright className="legal-icon" size={18} />
            <div className="legal-text">
              <span className="legal-title">Copyright Notice</span>
              <p>© {currentYear} Investor IQ Metrics. All Rights Reserved.</p>
              <p className="legal-detail">
                This software, including all source code, algorithms, user interface designs, 
                documentation, and associated intellectual property, is protected by copyright law 
                and international treaties. Unauthorized reproduction, distribution, or modification 
                is strictly prohibited.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="legal-item patent-notice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Shield className="legal-icon" size={18} />
            <div className="legal-text">
              <span className="legal-title">Patent Pending</span>
              <p>U.S. Patent Application Pending</p>
              <p className="legal-detail">
                The proprietary investment analysis methodology, including but not limited to the 
                70% Rule validation engine, multi-source market data aggregation system, 
                real-time investment scoring algorithm, and automated recommendation generation 
                technology are protected under pending patent applications.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="legal-item trademark-notice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Award className="legal-icon" size={18} />
            <div className="legal-text">
              <span className="legal-title">Trademarks</span>
              <p>"Investor IQ Metrics" and "SDIRA Property Analyzer" are trademarks of Investor IQ Metrics.</p>
            </div>
          </motion.div>
        </div>

        {/* Disclaimer */}
        <div className="footer-disclaimer">
          <p>
            <strong>Disclaimer:</strong> This tool provides estimates and analysis for educational purposes only 
            and should not be considered financial, legal, or investment advice. Real estate investments carry 
            inherent risks, and past performance does not guarantee future results. Always conduct your own due 
            diligence and consult with qualified real estate professionals, accountants, attorneys, and financial 
            advisors before making any investment decisions. The information provided is based on third-party data 
            sources which may not be accurate or up-to-date.
          </p>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <span className="divider">|</span>
            <a href="#terms">Terms of Service</a>
            <span className="divider">|</span>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-version">
            <p>Version 1.0.0 | Built with ♥ for SDIRA Investors</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

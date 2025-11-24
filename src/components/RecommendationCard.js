import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Award } from 'lucide-react';

const RecommendationCard = ({ recommendation }) => {
  if (!recommendation) return null;

  const getIcon = () => {
    switch (recommendation.recommendation) {
      case 'STRONG BUY':
        return <Award className="rec-icon" />;
      case 'BUY':
        return <TrendingUp className="rec-icon" />;
      case 'CONSIDER':
        return <AlertTriangle className="rec-icon" />;
      case 'WEAK CONSIDER':
        return <AlertTriangle className="rec-icon" />;
      case 'AVOID':
        return <TrendingDown className="rec-icon" />;
      case 'STRONG AVOID':
        return <XCircle className="rec-icon" />;
      default:
        return <AlertTriangle className="rec-icon" />;
    }
  };

  const scorePercentage = Math.min(Math.max((recommendation.score + 50) / 150 * 100, 0), 100);

  return (
    <motion.div 
      className="recommendation-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div 
        className="recommendation-header"
        style={{ background: recommendation.bgGradient }}
      >
        <div className="rec-icon-wrapper">
          {getIcon()}
        </div>
        <div className="rec-text">
          <h2 className="rec-title">{recommendation.recommendation}</h2>
          <p className="rec-confidence">
            {recommendation.confidence} Confidence • Score: {recommendation.score}
          </p>
        </div>
      </div>

      <div className="score-bar-container">
        <div className="score-labels">
          <span>Strong Avoid</span>
          <span>Avoid</span>
          <span>Consider</span>
          <span>Buy</span>
          <span>Strong Buy</span>
        </div>
        <div className="score-bar">
          <motion.div 
            className="score-fill"
            initial={{ width: 0 }}
            animate={{ width: `${scorePercentage}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ background: recommendation.bgGradient }}
          />
          <motion.div 
            className="score-marker"
            initial={{ left: 0 }}
            animate={{ left: `${scorePercentage}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
        <div className="score-ticks">
          {[0, 25, 50, 75, 100].map((tick) => (
            <span key={tick} className="tick" style={{ left: `${tick}%` }} />
          ))}
        </div>
      </div>

      <div className="recommendation-details">
        <div className="details-column positive">
          <h4>
            <CheckCircle className="details-icon" />
            Positive Factors
          </h4>
          <ul>
            {recommendation.reasons.length > 0 ? (
              recommendation.reasons.map((reason, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {reason}
                </motion.li>
              ))
            ) : (
              <li className="no-items">No positive factors identified</li>
            )}
          </ul>
        </div>

        <div className="details-column negative">
          <h4>
            <XCircle className="details-icon" />
            Warning Factors
          </h4>
          <ul>
            {recommendation.warnings.length > 0 ? (
              recommendation.warnings.map((warning, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {warning}
                </motion.li>
              ))
            ) : (
              <li className="no-items">No warnings identified</li>
            )}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationCard;

import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatPercent, formatNumber } from '../utils/calculations';

const MetricsGrid = ({ metrics }) => {
  if (!metrics) return null;

  const metricCards = [
    {
      title: 'Monthly Cash Flow',
      value: formatCurrency(metrics.monthlyCashFlow),
      description: 'Net monthly income after expenses',
      color: metrics.monthlyCashFlow >= 0 ? '#10b981' : '#ef4444',
      icon: '💰'
    },
    {
      title: 'Annual Cash Flow',
      value: formatCurrency(metrics.annualCashFlow),
      description: 'Yearly net income',
      color: metrics.annualCashFlow >= 0 ? '#10b981' : '#ef4444',
      icon: '📈'
    },
    {
      title: 'Cash-on-Cash Return',
      value: formatPercent(metrics.cashOnCashReturn),
      description: 'Annual return on cash invested',
      color: metrics.cashOnCashReturn >= 8 ? '#10b981' : metrics.cashOnCashReturn >= 5 ? '#f59e0b' : '#ef4444',
      icon: '🎯'
    },
    {
      title: 'Cap Rate',
      value: formatPercent(metrics.capRate),
      description: 'NOI divided by property value',
      color: metrics.capRate >= 8 ? '#10b981' : metrics.capRate >= 5 ? '#f59e0b' : '#ef4444',
      icon: '📊'
    },
    {
      title: 'Total ROI',
      value: formatPercent(metrics.totalROI),
      description: 'Total return including appreciation',
      color: metrics.totalROI >= 15 ? '#10b981' : metrics.totalROI >= 8 ? '#f59e0b' : '#ef4444',
      icon: '🚀'
    },
    {
      title: 'LTV Ratio',
      value: formatPercent(metrics.ltvRatio),
      description: 'Loan-to-value ratio',
      color: metrics.ltvRatio <= 70 ? '#10b981' : metrics.ltvRatio <= 80 ? '#f59e0b' : '#ef4444',
      icon: '🏦'
    },
    {
      title: 'Gross Rent Multiplier',
      value: formatNumber(metrics.grossRentMultiplier),
      description: 'Price / Annual rent',
      color: metrics.grossRentMultiplier <= 10 ? '#10b981' : metrics.grossRentMultiplier <= 15 ? '#f59e0b' : '#ef4444',
      icon: '🔢'
    },
    {
      title: 'DSCR',
      value: formatNumber(metrics.debtServiceCoverageRatio),
      description: 'Debt service coverage ratio',
      color: metrics.debtServiceCoverageRatio >= 1.25 ? '#10b981' : metrics.debtServiceCoverageRatio >= 1 ? '#f59e0b' : '#ef4444',
      icon: '📋'
    }
  ];

  const investmentCards = [
    {
      title: 'ARV (After Repair Value)',
      value: formatCurrency(metrics.arv),
      description: 'Estimated value after repairs',
      icon: '🏠'
    },
    {
      title: 'Max Investment (70% Rule)',
      value: formatCurrency(metrics.maxTotalInvestment),
      description: 'Maximum total investment',
      highlight: metrics.totalInvestment <= metrics.maxTotalInvestment,
      icon: '📐'
    },
    {
      title: 'Total Investment',
      value: formatCurrency(metrics.totalInvestment),
      description: 'Purchase + Repairs + Closing',
      color: metrics.totalInvestment <= metrics.maxTotalInvestment ? '#10b981' : '#ef4444',
      icon: '💵'
    },
    {
      title: 'Max Purchase Price',
      value: formatCurrency(metrics.maxPurchasePrice),
      description: 'Maximum recommended price',
      icon: '🎚️'
    },
    {
      title: 'Available Rehab Budget',
      value: formatCurrency(metrics.availableRehabBudget),
      description: 'Remaining budget for repairs',
      color: metrics.availableRehabBudget >= 0 ? '#10b981' : '#ef4444',
      icon: '🔧'
    },
    {
      title: 'Forced Appreciation',
      value: formatCurrency(metrics.forcedAppreciation),
      description: 'Instant equity creation',
      color: metrics.forcedAppreciation >= 0 ? '#10b981' : '#ef4444',
      icon: '⬆️'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="metrics-section">
      <motion.div 
        className="metrics-group"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="metrics-group-title">
          <span className="title-icon">📊</span>
          Performance Metrics
        </h3>
        <div className="metrics-grid">
          {metricCards.map((metric, index) => (
            <motion.div 
              key={metric.title}
              className="metric-card"
              variants={cardVariants}
            >
              <div className="metric-header">
                <span className="metric-icon">{metric.icon}</span>
                <span className="metric-title">{metric.title}</span>
              </div>
              <div className="metric-value" style={{ color: metric.color }}>
                {metric.value}
              </div>
              <div className="metric-description">{metric.description}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        className="metrics-group"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="metrics-group-title">
          <span className="title-icon">💼</span>
          Investment Analysis
        </h3>
        <div className="metrics-grid">
          {investmentCards.map((metric, index) => (
            <motion.div 
              key={metric.title}
              className={`metric-card ${metric.highlight ? 'highlight' : ''}`}
              variants={cardVariants}
            >
              <div className="metric-header">
                <span className="metric-icon">{metric.icon}</span>
                <span className="metric-title">{metric.title}</span>
              </div>
              <div className="metric-value" style={{ color: metric.color || 'inherit' }}>
                {metric.value}
              </div>
              <div className="metric-description">{metric.description}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 70% Rule Indicator */}
      <motion.div 
        className="rule-indicator"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className={`rule-status ${metrics.totalInvestment <= metrics.maxTotalInvestment ? 'pass' : 'fail'}`}>
          <div className="rule-icon">
            {metrics.totalInvestment <= metrics.maxTotalInvestment ? '✅' : '❌'}
          </div>
          <div className="rule-text">
            <h4>70% Rule Status</h4>
            <p>
              {metrics.totalInvestment <= metrics.maxTotalInvestment
                ? `PASS - You have ${formatCurrency(metrics.maxTotalInvestment - metrics.totalInvestment)} margin`
                : `FAIL - Exceeds by ${formatCurrency(metrics.totalInvestment - metrics.maxTotalInvestment)}`
              }
            </p>
          </div>
        </div>
        <div className="rule-progress">
          <div className="progress-bar">
            <motion.div 
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min((metrics.totalInvestment / metrics.maxTotalInvestment) * 100, 100)}%` 
              }}
              transition={{ duration: 0.8 }}
              style={{ 
                backgroundColor: metrics.totalInvestment <= metrics.maxTotalInvestment ? '#10b981' : '#ef4444' 
              }}
            />
          </div>
          <div className="progress-labels">
            <span>Total Investment</span>
            <span>{formatCurrency(metrics.totalInvestment)} / {formatCurrency(metrics.maxTotalInvestment)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MetricsGrid;

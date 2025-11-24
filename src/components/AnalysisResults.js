import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { FileText, Download, Printer } from 'lucide-react';

const AnalysisResults = ({ metrics, recommendation, similarHomes }) => {
  if (!metrics) return null;

  const exportToCSV = () => {
    const data = {
      'Analysis Date': new Date().toLocaleDateString(),
      'Recommendation': recommendation?.recommendation || 'N/A',
      'Score': recommendation?.score || 0,
      'Confidence': recommendation?.confidence || 'N/A',
      'ARV': metrics.arv,
      'Total Investment': metrics.totalInvestment,
      'Max Total Investment (70%)': metrics.maxTotalInvestment,
      'Monthly Cash Flow': metrics.monthlyCashFlow,
      'Annual Cash Flow': metrics.annualCashFlow,
      'Cash-on-Cash Return': metrics.cashOnCashReturn,
      'Cap Rate': metrics.capRate,
      'Total ROI': metrics.totalROI,
      'LTV Ratio': metrics.ltvRatio,
      'Gross Rent Multiplier': metrics.grossRentMultiplier,
      'DSCR': metrics.debtServiceCoverageRatio,
      'Forced Appreciation': metrics.forcedAppreciation,
      'Positive Factors': recommendation?.reasons?.join('; ') || '',
      'Warning Factors': recommendation?.warnings?.join('; ') || ''
    };

    const headers = Object.keys(data);
    const values = Object.values(data);
    const csvContent = headers.join(',') + '\n' + values.map(v => `"${v}"`).join(',');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `property_analysis_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      className="analysis-results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="results-header">
        <h3>
          <FileText className="results-icon" />
          Detailed Analysis Summary
        </h3>
        <div className="results-actions">
          <button className="action-button" onClick={exportToCSV}>
            <Download size={16} />
            Export CSV
          </button>
          <button className="action-button" onClick={handlePrint}>
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      <div className="summary-grid">
        {/* Investment Summary */}
        <div className="summary-card">
          <h4>Investment Summary</h4>
          <div className="summary-items">
            <div className="summary-item">
              <span className="item-label">Purchase Price</span>
              <span className="item-value">{formatCurrency(metrics.purchasePrice)}</span>
            </div>
            <div className="summary-item">
              <span className="item-label">Repair Costs</span>
              <span className="item-value">{formatCurrency(metrics.repairCosts)}</span>
            </div>
            <div className="summary-item">
              <span className="item-label">Closing Costs</span>
              <span className="item-value">{formatCurrency(metrics.closingCosts)}</span>
            </div>
            <div className="summary-item highlight">
              <span className="item-label">Total Investment</span>
              <span className="item-value">{formatCurrency(metrics.totalInvestment)}</span>
            </div>
          </div>
        </div>

        {/* Cash Flow Summary */}
        <div className="summary-card">
          <h4>Cash Flow Analysis</h4>
          <div className="summary-items">
            <div className="summary-item">
              <span className="item-label">Monthly Rent</span>
              <span className="item-value">{formatCurrency(metrics.monthlyRent)}</span>
            </div>
            <div className="summary-item">
              <span className="item-label">Monthly Expenses</span>
              <span className="item-value">{formatCurrency(metrics.monthlyExpenses)}</span>
            </div>
            <div className="summary-item highlight">
              <span className="item-label">Monthly Cash Flow</span>
              <span className="item-value" style={{ color: metrics.monthlyCashFlow >= 0 ? '#10b981' : '#ef4444' }}>
                {formatCurrency(metrics.monthlyCashFlow)}
              </span>
            </div>
            <div className="summary-item highlight">
              <span className="item-label">Annual Cash Flow</span>
              <span className="item-value" style={{ color: metrics.annualCashFlow >= 0 ? '#10b981' : '#ef4444' }}>
                {formatCurrency(metrics.annualCashFlow)}
              </span>
            </div>
          </div>
        </div>

        {/* Returns Summary */}
        <div className="summary-card">
          <h4>Returns & Ratios</h4>
          <div className="summary-items">
            <div className="summary-item">
              <span className="item-label">Cash-on-Cash Return</span>
              <span className="item-value">{formatPercent(metrics.cashOnCashReturn)}</span>
            </div>
            <div className="summary-item">
              <span className="item-label">Cap Rate</span>
              <span className="item-value">{formatPercent(metrics.capRate)}</span>
            </div>
            <div className="summary-item">
              <span className="item-label">Total ROI</span>
              <span className="item-value">{formatPercent(metrics.totalROI)}</span>
            </div>
            <div className="summary-item">
              <span className="item-label">Forced Appreciation</span>
              <span className="item-value" style={{ color: metrics.forcedAppreciation >= 0 ? '#10b981' : '#ef4444' }}>
                {formatCurrency(metrics.forcedAppreciation)}
              </span>
            </div>
          </div>
        </div>

        {/* Similar Homes Comparison */}
        {similarHomes && similarHomes.price_statistics && (
          <div className="summary-card similar-homes-summary">
            <h4>Market Comparison</h4>
            <div className="summary-items">
              <div className="summary-item">
                <span className="item-label">Similar Homes Median</span>
                <span className="item-value">
                  {formatCurrency(similarHomes.price_statistics.median_price)}
                </span>
              </div>
              <div className="summary-item">
                <span className="item-label">Price Range</span>
                <span className="item-value">
                  {formatCurrency(similarHomes.price_statistics.min_price)} - {formatCurrency(similarHomes.price_statistics.max_price)}
                </span>
              </div>
              {similarHomes.rental_statistics && (
                <div className="summary-item">
                  <span className="item-label">Median Rent</span>
                  <span className="item-value">
                    {formatCurrency(similarHomes.rental_statistics.median_rent_estimate)}/mo
                  </span>
                </div>
              )}
              <div className="summary-item">
                <span className="item-label">Homes Analyzed</span>
                <span className="item-value">{similarHomes.total_similar_homes}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Notes */}
      <div className="analysis-notes">
        <h4>Analysis Notes</h4>
        <ul>
          <li>
            The <strong>70% Rule</strong> suggests your total investment (purchase + repairs + closing) should not exceed 70% of the ARV.
          </li>
          <li>
            A positive <strong>Cash-on-Cash Return</strong> above 8% is generally considered good for rental properties.
          </li>
          <li>
            <strong>Cap Rate</strong> above 6% is typically favorable for investment properties.
          </li>
          <li>
            <strong>DSCR</strong> above 1.25 indicates healthy debt coverage.
          </li>
        </ul>
      </div>

      <div className="disclaimer-box">
        <p>
          <strong>Disclaimer:</strong> This analysis is for educational purposes only and should not be considered financial advice. 
          Always consult with qualified real estate professionals, accountants, and financial advisors before making investment decisions.
          Past performance does not guarantee future results.
        </p>
      </div>
    </motion.div>
  );
};

export default AnalysisResults;

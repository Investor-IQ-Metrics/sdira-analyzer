import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, analyzeSimilarHomes } from '../utils/calculations';
import { Home, TrendingUp, Clock, DollarSign, MapPin } from 'lucide-react';

const SimilarHomesPanel = ({ data, propertyData }) => {
  const analysis = useMemo(() => {
    return analyzeSimilarHomes(data, propertyData);
  }, [data, propertyData]);

  if (!data || !data.similar_homes || data.similar_homes.length === 0) {
    return (
      <div className="similar-homes-panel empty">
        <div className="empty-state">
          <Home size={48} />
          <h3>No Similar Homes Data</h3>
          <p>Enter a property address and fetch data to see similar homes in the area.</p>
        </div>
      </div>
    );
  }

  const homes = data.similar_homes;

  return (
    <motion.div 
      className="similar-homes-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Market Overview */}
      <div className="market-overview">
        <h3>
          <TrendingUp className="panel-icon" />
          Market Analysis
        </h3>
        
        <div className="overview-cards">
          {analysis?.price_statistics && (
            <div className="overview-card">
              <div className="card-icon">
                <DollarSign />
              </div>
              <div className="card-content">
                <span className="card-label">Median Price</span>
                <span className="card-value">
                  {formatCurrency(analysis.price_statistics.median_price)}
                </span>
                <span className="card-range">
                  Range: {formatCurrency(analysis.price_statistics.min_price)} - {formatCurrency(analysis.price_statistics.max_price)}
                </span>
              </div>
            </div>
          )}

          {analysis?.rental_statistics && (
            <div className="overview-card">
              <div className="card-icon">
                <Home />
              </div>
              <div className="card-content">
                <span className="card-label">Median Rent</span>
                <span className="card-value">
                  {formatCurrency(analysis.rental_statistics.median_rent_estimate)}/mo
                </span>
                <span className="card-range">
                  Range: {formatCurrency(analysis.rental_statistics.min_rent_estimate)} - {formatCurrency(analysis.rental_statistics.max_rent_estimate)}
                </span>
              </div>
            </div>
          )}

          {analysis?.market_timing && (
            <div className="overview-card">
              <div className="card-icon">
                <Clock />
              </div>
              <div className="card-content">
                <span className="card-label">Avg Days on Market</span>
                <span className="card-value">
                  {Math.round(analysis.market_timing.average_days_on_zillow)} days
                </span>
              </div>
            </div>
          )}

          <div className="overview-card">
            <div className="card-icon">
              <MapPin />
            </div>
            <div className="card-content">
              <span className="card-label">Properties Analyzed</span>
              <span className="card-value">{analysis?.total_similar_homes || homes.length}</span>
            </div>
          </div>
        </div>

        {/* Market Insights */}
        {analysis?.market_insights && analysis.market_insights.length > 0 && (
          <div className="market-insights">
            <h4>Market Insights</h4>
            <ul>
              {analysis.market_insights.map((insight, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {insight}
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Similar Homes List */}
      <div className="homes-list">
        <h3>
          <Home className="panel-icon" />
          Similar Properties ({homes.length})
        </h3>
        
        <div className="homes-grid">
          {homes.map((home, index) => (
            <motion.div 
              key={home.zpid || index}
              className="home-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {home.image_url && (
                <div className="home-image">
                  <img 
                    src={home.image_url} 
                    alt={home.address}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <span className={`status-badge ${home.home_status?.toLowerCase().replace(/_/g, '-')}`}>
                    {home.home_status?.replace(/_/g, ' ') || 'Unknown'}
                  </span>
                </div>
              )}
              
              <div className="home-details">
                <h4 className="home-address">{home.address}</h4>
                <div className="home-location">
                  {home.city}, {home.state} {home.zipcode}
                </div>
                
                <div className="home-price">
                  {home.price > 0 
                    ? formatCurrency(home.price)
                    : home.zestimate > 0 
                      ? `${formatCurrency(home.zestimate)} (Zestimate)`
                      : 'Price N/A'
                  }
                </div>

                <div className="home-specs">
                  {home.beds > 0 && <span>{home.beds} beds</span>}
                  {home.baths > 0 && <span>{home.baths} baths</span>}
                  {home.sqft > 0 && <span>{home.sqft.toLocaleString()} sqft</span>}
                </div>

                <div className="home-metrics">
                  {home.price_per_sqft > 0 && (
                    <div className="metric">
                      <span className="label">$/sqft</span>
                      <span className="value">${Math.round(home.price_per_sqft)}</span>
                    </div>
                  )}
                  {home.rent_zestimate > 0 && (
                    <div className="metric">
                      <span className="label">Rent Est.</span>
                      <span className="value">${home.rent_zestimate.toLocaleString()}/mo</span>
                    </div>
                  )}
                  {home.year_built > 0 && (
                    <div className="metric">
                      <span className="label">Built</span>
                      <span className="value">{home.year_built}</span>
                    </div>
                  )}
                  {home.days_on_zillow > 0 && (
                    <div className="metric">
                      <span className="label">DOM</span>
                      <span className="value">{home.days_on_zillow} days</span>
                    </div>
                  )}
                </div>

                {home.gross_rent_multiplier > 0 && (
                  <div className="home-investment">
                    <span className="inv-label">GRM:</span>
                    <span className="inv-value">{home.gross_rent_multiplier.toFixed(1)}</span>
                    {home.cap_rate_estimate > 0 && (
                      <>
                        <span className="inv-label">Cap Rate:</span>
                        <span className="inv-value">{home.cap_rate_estimate.toFixed(1)}%</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SimilarHomesPanel;

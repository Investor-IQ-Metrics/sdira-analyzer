import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyForm from './components/PropertyForm';
import AnalysisResults from './components/AnalysisResults';
import RecommendationCard from './components/RecommendationCard';
import MetricsGrid from './components/MetricsGrid';
import SimilarHomesPanel from './components/SimilarHomesPanel';
import Header from './components/Header';
import { calculateInvestmentMetrics, generateRecommendation } from './utils/calculations';
import { initializeFirebase, logAnalyticsEvent } from './utils/firebase';

function App() {
  const [formData, setFormData] = useState({
    // Property Information
    propertyAddress: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Purchase Details
    purchasePrice: '',
    closingCosts: '',
    assessedValue: '',
    
    // Repair & Renovation
    repairCosts: '',
    availableRehabBudget: '',
    
    // Rental Income
    monthlyRent: '',
    vacancyRate: '5',
    
    // Expenses
    mortgagePayment: '',
    propertyTaxes: '',
    insurance: '',
    managementFees: '10',
    
    // Loan Details
    loanAmount: '',
    annualDebtService: '',
    
    // Valuation
    propertyValue: '',
    marketValueComparables: '',
    noi: '',
    operatingExpenses: ''
  });
  
  const [metrics, setMetrics] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [similarHomes, setSimilarHomes] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [propertyData, setPropertyData] = useState(null);

  useEffect(() => {
    initializeFirebase();
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const analyzeProperty = useCallback(async () => {
    setIsAnalyzing(true);
    logAnalyticsEvent('analyze_property', { 
      hasAddress: !!formData.propertyAddress,
      purchasePrice: formData.purchasePrice 
    });

    try {
      // Calculate metrics
      const calculatedMetrics = calculateInvestmentMetrics(formData);
      setMetrics(calculatedMetrics);

      // Generate recommendation
      const rec = generateRecommendation(calculatedMetrics, similarHomes);
      setRecommendation(rec);

      setActiveTab('results');
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [formData, similarHomes]);

  const fetchPropertyData = useCallback(async () => {
    if (!formData.propertyAddress || !formData.city || !formData.state || !formData.zipCode) {
      alert('Please enter complete address information');
      return;
    }

    setIsLoading(true);
    logAnalyticsEvent('fetch_property_data', { zipCode: formData.zipCode });

    try {
      const response = await fetch(
        `${process.env.REACT_APP_FIREBASE_FUNCTIONS_URL || ''}/api/property?` + 
        new URLSearchParams({
          address: formData.propertyAddress,
          city: formData.city,
          state: formData.state,
          zipcode: formData.zipCode
        })
      );

      if (!response.ok) throw new Error('Failed to fetch property data');

      const data = await response.json();
      setPropertyData(data);

      // Auto-populate form fields
      if (data.zestimate) {
        handleInputChange('marketValueComparables', data.zestimate.toString());
        handleInputChange('propertyValue', data.zestimate.toString());
      }
      if (data.rent_zestimate) {
        handleInputChange('monthlyRent', data.rent_zestimate.toString());
      }

      // Fetch similar homes
      if (data.zpid) {
        fetchSimilarHomes(data.zpid);
      }
    } catch (error) {
      console.error('Error fetching property data:', error);
      alert('Unable to fetch property data. You can still enter values manually.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, handleInputChange]);

  const fetchSimilarHomes = useCallback(async (zpid) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_FIREBASE_FUNCTIONS_URL || ''}/api/similar-homes?zpid=${zpid}`
      );

      if (!response.ok) throw new Error('Failed to fetch similar homes');

      const data = await response.json();
      setSimilarHomes(data);
      logAnalyticsEvent('fetch_similar_homes', { count: data?.similar_homes?.length || 0 });
    } catch (error) {
      console.error('Error fetching similar homes:', error);
    }
  }, []);

  const clearForm = useCallback(() => {
    setFormData({
      propertyAddress: '',
      city: '',
      state: '',
      zipCode: '',
      purchasePrice: '',
      closingCosts: '',
      assessedValue: '',
      repairCosts: '',
      availableRehabBudget: '',
      monthlyRent: '',
      vacancyRate: '5',
      mortgagePayment: '',
      propertyTaxes: '',
      insurance: '',
      managementFees: '10',
      loanAmount: '',
      annualDebtService: '',
      propertyValue: '',
      marketValueComparables: '',
      noi: '',
      operatingExpenses: ''
    });
    setMetrics(null);
    setRecommendation(null);
    setSimilarHomes(null);
    setPropertyData(null);
    setActiveTab('input');
    logAnalyticsEvent('clear_form');
  }, []);

  return (
    <div className="app">
      <div className="background-gradient" />
      <div className="noise-overlay" />
      
      <Header />
      
      <main className="main-content">
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'input' ? 'active' : ''}`}
            onClick={() => setActiveTab('input')}
          >
            <span className="tab-icon">📝</span>
            Property Input
          </button>
          <button 
            className={`tab-button ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
            disabled={!metrics}
          >
            <span className="tab-icon">📊</span>
            Analysis Results
          </button>
          <button 
            className={`tab-button ${activeTab === 'similar' ? 'active' : ''}`}
            onClick={() => setActiveTab('similar')}
            disabled={!similarHomes}
          >
            <span className="tab-icon">🏘️</span>
            Similar Homes
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PropertyForm
                formData={formData}
                onInputChange={handleInputChange}
                onFetchProperty={fetchPropertyData}
                onAnalyze={analyzeProperty}
                onClear={clearForm}
                isLoading={isLoading}
                isAnalyzing={isAnalyzing}
                propertyData={propertyData}
              />
            </motion.div>
          )}

          {activeTab === 'results' && metrics && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="results-container"
            >
              <RecommendationCard recommendation={recommendation} />
              <MetricsGrid metrics={metrics} />
              <AnalysisResults 
                metrics={metrics} 
                recommendation={recommendation}
                similarHomes={similarHomes}
              />
            </motion.div>
          )}

          {activeTab === 'similar' && similarHomes && (
            <motion.div
              key="similar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SimilarHomesPanel 
                data={similarHomes}
                propertyData={propertyData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="footer">
        <p>SDIRA Property Investment Analyzer • For Educational Purposes Only</p>
        <p className="disclaimer">
          This tool provides estimates only. Always consult with qualified professionals before making investment decisions.
        </p>
      </footer>
    </div>
  );
}

export default App;

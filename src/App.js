import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyForm from './components/PropertyForm';
import AnalysisResults from './components/AnalysisResults';
import RecommendationCard from './components/RecommendationCard';
import MetricsGrid from './components/MetricsGrid';
import SimilarHomesPanel from './components/SimilarHomesPanel';
import Header from './components/Header';
import Footer from './components/Footer';
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
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    initializeFirebase();
  }, []);

  // Memoized input change handler to prevent unnecessary re-renders
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

  const fetchSimilarHomes = useCallback(async (zpid) => {
    try {
      // Use Firebase Function endpoint instead of direct RapidAPI call
      const response = await fetch(`/api/similar-homes?zpid=${zpid}`);

      if (!response.ok) {
        console.warn('Similar homes API returned:', response.status);
        return;
      }

      const data = await response.json();
      
      if (data.error) {
        console.warn('Similar homes error:', data.error);
        return;
      }

      // Use the pre-formatted data from Firebase Function
      setSimilarHomes({
        similar_homes: data.similar_homes || [],
        total_similar_homes: data.total_similar_homes || 0,
        price_statistics: data.price_statistics,
        rental_statistics: data.rental_statistics,
        price_per_sqft_statistics: data.price_per_sqft_statistics,
        market_timing: data.market_timing
      });
      
      logAnalyticsEvent('fetch_similar_homes', { count: data.total_similar_homes });
    } catch (error) {
      console.error('Error fetching similar homes:', error);
    }
  }, []);

  const fetchPropertyData = useCallback(async () => {
    if (!formData.propertyAddress || !formData.city || !formData.state || !formData.zipCode) {
      alert('Please enter complete address information');
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    logAnalyticsEvent('fetch_property_data', { zipCode: formData.zipCode });

    try {
      // Use Firebase Function endpoint instead of direct RapidAPI call
      // This solves CORS issues and keeps API key secure on the server
      const response = await fetch(
        `/api/property?address=${encodeURIComponent(formData.propertyAddress)}&city=${encodeURIComponent(formData.city)}&state=${encodeURIComponent(formData.state)}&zipcode=${encodeURIComponent(formData.zipCode)}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();

      // Handle error from API
      if (data.error) {
        throw new Error(data.error);
      }

      // Format property data from Firebase Function response
      const propertyDataFormatted = {
        zpid: data.zpid,
        zestimate: data.zestimate || 0,
        rentZestimate: data.rent_zestimate || 0,
        rent_zestimate: data.rent_zestimate || 0,
        imageLink: data.image_link || null,
        streetView: data.street_view || null,
        homeType: data.home_type || 'Not available',
        livingArea: data.living_area || 0,
        living_area: data.living_area || 0,
        lotArea: data.lot_area || 0,
        lotUnits: data.lot_units || '',
        yearBuilt: data.year_built || 0,
        year_built: data.year_built || 0,
        beds: data.beds || 'N/A',
        baths: data.baths || 'N/A',
        price: data.zestimate || 0,
        hoaFee: data.hoa_fee || 0,
        heating: data.heating || 'Not available'
      };

      setPropertyData(propertyDataFormatted);

      // Auto-populate form fields
      if (propertyDataFormatted.zestimate) {
        handleInputChange('marketValueComparables', propertyDataFormatted.zestimate.toString());
        handleInputChange('propertyValue', propertyDataFormatted.zestimate.toString());
      }
      if (propertyDataFormatted.rentZestimate) {
        handleInputChange('monthlyRent', propertyDataFormatted.rentZestimate.toString());
      }

      // Fetch similar homes if we have zpid
      if (propertyDataFormatted.zpid) {
        fetchSimilarHomes(propertyDataFormatted.zpid);
      }

      logAnalyticsEvent('property_data_success', { 
        zestimate: propertyDataFormatted.zestimate,
        rentEstimate: propertyDataFormatted.rentZestimate 
      });

    } catch (error) {
      console.error('Error fetching property data:', error);
      setFetchError(error.message || 'Unable to fetch property data');
      alert('Unable to fetch property data. You can still enter values manually.');
      logAnalyticsEvent('property_data_error', { error: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [formData, handleInputChange, fetchSimilarHomes]);

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
    setFetchError(null);
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
                fetchError={fetchError}
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

      <Footer />
    </div>
  );
}

export default App;

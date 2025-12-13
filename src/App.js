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

  const fetchPropertyData = useCallback(async () => {
    if (!formData.propertyAddress || !formData.city || !formData.state || !formData.zipCode) {
      alert('Please enter complete address information');
      return;
    }

    setIsLoading(true);
    logAnalyticsEvent('fetch_property_data', { zipCode: formData.zipCode });

    try {
      // Build full address for Zillow API
      const fullAddress = `${formData.propertyAddress} ${formData.city} ${formData.state} ${formData.zipCode}`;
      
      // Call Zillow API directly via RapidAPI
      const response = await fetch(
        `https://zillow-com4.p.rapidapi.com/properties/search-address?address=${encodeURIComponent(fullAddress)}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': '8ee7a51770msh842b16b029b5f03p143525jsnf14ca034fdb5',
            'x-rapidapi-host': 'zillow-com4.p.rapidapi.com'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const jsonData = await response.json();
      const mainData = jsonData.data || {};
      const resoFacts = mainData.resoFacts || {};
      const formattedChip = mainData.formattedChip || {};
      const quickFacts = formattedChip.quickFacts || [];
      const additionalFacts = formattedChip.additionalFacts || [];

      // Extract rent zestimate
      let rentZestimate = 0;
      for (const fact of additionalFacts) {
        if (fact.elementType === 'rentZestimate') {
          const valueStr = fact.value?.fullValue || '0';
          rentZestimate = parseInt(valueStr.replace(/[$,]/g, '')) || 0;
          break;
        }
      }

      // Extract beds and baths
      let beds = 'N/A';
      let baths = 'N/A';
      for (const fact of quickFacts) {
        if (fact.elementType === 'beds') {
          beds = fact.value?.fullValue || 'N/A';
        } else if (fact.elementType === 'baths') {
          baths = fact.value?.fullValue || 'N/A';
        }
      }

      // Format property data
      const data = {
        zpid: mainData.zpid,
        zestimate: mainData.zestimate || 0,
        rentZestimate: rentZestimate,
        rent_zestimate: rentZestimate,
        imageLink: mainData.imageLink || mainData.hiResImageLink,
        homeType: mainData.homeType || 'Not available',
        livingArea: mainData.livingAreaValue || 0,
        lotArea: mainData.lotAreaValue || 0,
        yearBuilt: resoFacts.yearBuilt || 0,
        beds: beds,
        baths: baths,
        price: mainData.price || mainData.zestimate || 0,
        taxAnnualAmount: mainData.taxAnnualAmount || 0
      };

      setPropertyData(data);

      // Auto-populate form fields
      if (data.zestimate) {
        handleInputChange('marketValueComparables', data.zestimate.toString());
        handleInputChange('propertyValue', data.zestimate.toString());
      }
      if (data.rentZestimate) {
        handleInputChange('monthlyRent', data.rentZestimate.toString());
      }
      if (data.taxAnnualAmount) {
        handleInputChange('propertyTaxes', data.taxAnnualAmount.toString());
      }

      // Fetch similar homes if we have zpid
      if (data.zpid) {
        fetchSimilarHomes(data.zpid);
      }

      logAnalyticsEvent('property_data_success', { 
        zestimate: data.zestimate,
        rentEstimate: data.rentZestimate 
      });

    } catch (error) {
      console.error('Error fetching property data:', error);
      alert('Unable to fetch property data. You can still enter values manually.');
      logAnalyticsEvent('property_data_error', { error: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [formData, handleInputChange]);

  const fetchSimilarHomes = useCallback(async (zpid) => {
    try {
      const response = await fetch(
        `https://zillow-com4.p.rapidapi.com/properties/similar-homes?zpid=${zpid}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': '8ee7a51770msh842b16b029b5f03p143525jsnf14ca034fdb5',
            'x-rapidapi-host': 'zillow-com4.p.rapidapi.com'
          }
        }
      );

      if (!response.ok) {
        console.warn('Similar homes API returned:', response.status);
        return;
      }

      const jsonData = await response.json();
      const homes = jsonData.data || jsonData.results || jsonData || [];
      
      if (!Array.isArray(homes)) {
        console.warn('No similar homes data found');
        return;
      }

      // Format similar homes
      const formattedHomes = homes.slice(0, 20).map(home => ({
        zpid: home.zpid,
        address: home.address?.streetAddress || home.streetAddress || '',
        city: home.address?.city || home.city || '',
        state: home.address?.state || home.state || '',
        zipcode: home.address?.zipcode || home.zipcode || '',
        price: home.price || 0,
        zestimate: home.zestimate || 0,
        rent_zestimate: home.rentZestimate || 0,
        beds: home.bedrooms || home.beds || 0,
        baths: home.bathrooms || home.baths || 0,
        sqft: home.livingArea || home.sqft || 0,
        year_built: home.yearBuilt || 0,
        home_type: home.homeType || 'Unknown',
        home_status: home.homeStatus || 'Unknown',
        days_on_zillow: home.daysOnZillow || 0,
        image_url: home.imgSrc || home.imageLink || null,
        price_per_sqft: home.livingArea > 0 ? Math.round((home.price || home.zestimate) / home.livingArea) : 0,
        gross_rent_multiplier: home.rentZestimate > 0 ? parseFloat(((home.price || home.zestimate) / (home.rentZestimate * 12)).toFixed(2)) : 0,
        cap_rate_estimate: home.rentZestimate > 0 && (home.price || home.zestimate) > 0
          ? parseFloat((((home.rentZestimate * 12 * 0.6) / (home.price || home.zestimate)) * 100).toFixed(2))
          : 0
      }));

      setSimilarHomes({
        similar_homes: formattedHomes,
        total: formattedHomes.length
      });
      
      logAnalyticsEvent('fetch_similar_homes', { count: formattedHomes.length });
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

      <Footer />
    </div>
  );
}

export default App;

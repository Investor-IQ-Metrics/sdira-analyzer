import React from 'react';
import { motion } from 'framer-motion';
import { Search, Calculator, Trash2, Building, DollarSign, Wrench, TrendingUp, CreditCard, Loader2 } from 'lucide-react';

const PropertyForm = ({ 
  formData, 
  onInputChange, 
  onFetchProperty, 
  onAnalyze, 
  onClear, 
  isLoading,
  isAnalyzing,
  propertyData 
}) => {
  const handleChange = (field) => (e) => {
    onInputChange(field, e.target.value);
  };

  const InputField = ({ label, field, placeholder, prefix, suffix, type = "text" }) => (
    <div className="input-group">
      <label htmlFor={field}>{label}</label>
      <div className="input-wrapper">
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input
          id={field}
          type={type}
          value={formData[field]}
          onChange={handleChange(field)}
          placeholder={placeholder}
          className={prefix ? 'has-prefix' : ''}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div 
      className="property-form"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Property Address Section */}
      <motion.div className="form-section address-section" variants={itemVariants}>
        <div className="section-header">
          <Building className="section-icon" />
          <h3>Property Address</h3>
        </div>
        <div className="form-grid address-grid">
          <div className="input-group full-width">
            <label htmlFor="propertyAddress">Street Address</label>
            <input
              id="propertyAddress"
              type="text"
              value={formData.propertyAddress}
              onChange={handleChange('propertyAddress')}
              placeholder="123 Main Street"
            />
          </div>
          <InputField label="City" field="city" placeholder="Miami" />
          <InputField label="State" field="state" placeholder="FL" />
          <InputField label="ZIP Code" field="zipCode" placeholder="33101" />
        </div>
        <button 
          className="fetch-button"
          onClick={onFetchProperty}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="button-icon spinning" />
              Fetching Data...
            </>
          ) : (
            <>
              <Search className="button-icon" />
              Fetch Property Data
            </>
          )}
        </button>

        {propertyData && (
          <motion.div 
            className="property-preview"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <div className="preview-header">
              <span className="preview-badge">Property Found</span>
            </div>
            <div className="preview-grid">
              {propertyData.zestimate > 0 && (
                <div className="preview-item">
                  <span className="preview-label">Zestimate</span>
                  <span className="preview-value">${propertyData.zestimate.toLocaleString()}</span>
                </div>
              )}
              {propertyData.rent_zestimate > 0 && (
                <div className="preview-item">
                  <span className="preview-label">Rent Estimate</span>
                  <span className="preview-value">${propertyData.rent_zestimate.toLocaleString()}/mo</span>
                </div>
              )}
              {propertyData.beds && (
                <div className="preview-item">
                  <span className="preview-label">Beds</span>
                  <span className="preview-value">{propertyData.beds}</span>
                </div>
              )}
              {propertyData.baths && (
                <div className="preview-item">
                  <span className="preview-label">Baths</span>
                  <span className="preview-value">{propertyData.baths}</span>
                </div>
              )}
              {propertyData.living_area > 0 && (
                <div className="preview-item">
                  <span className="preview-label">Sq Ft</span>
                  <span className="preview-value">{propertyData.living_area.toLocaleString()}</span>
                </div>
              )}
              {propertyData.year_built > 0 && (
                <div className="preview-item">
                  <span className="preview-label">Year Built</span>
                  <span className="preview-value">{propertyData.year_built}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Purchase Details Section */}
      <motion.div className="form-section" variants={itemVariants}>
        <div className="section-header">
          <DollarSign className="section-icon" />
          <h3>Purchase Details</h3>
        </div>
        <div className="form-grid">
          <InputField 
            label="Purchase Price" 
            field="purchasePrice" 
            placeholder="250,000"
            prefix="$"
          />
          <InputField 
            label="Closing Costs" 
            field="closingCosts" 
            placeholder="5,000"
            prefix="$"
          />
          <InputField 
            label="Assessed Value" 
            field="assessedValue" 
            placeholder="240,000"
            prefix="$"
          />
          <InputField 
            label="Property Value (ARV)" 
            field="propertyValue" 
            placeholder="280,000"
            prefix="$"
          />
        </div>
      </motion.div>

      {/* Repair & Renovation Section */}
      <motion.div className="form-section" variants={itemVariants}>
        <div className="section-header">
          <Wrench className="section-icon" />
          <h3>Repair & Renovation</h3>
        </div>
        <div className="form-grid">
          <InputField 
            label="Repair Costs" 
            field="repairCosts" 
            placeholder="25,000"
            prefix="$"
          />
          <InputField 
            label="Available Rehab Budget" 
            field="availableRehabBudget" 
            placeholder="30,000"
            prefix="$"
          />
        </div>
      </motion.div>

      {/* Rental Income Section */}
      <motion.div className="form-section" variants={itemVariants}>
        <div className="section-header">
          <TrendingUp className="section-icon" />
          <h3>Rental Income & Comparables</h3>
        </div>
        <div className="form-grid">
          <InputField 
            label="Monthly Rent" 
            field="monthlyRent" 
            placeholder="2,000"
            prefix="$"
          />
          <InputField 
            label="Vacancy Rate" 
            field="vacancyRate" 
            placeholder="5"
            suffix="%"
          />
          <InputField 
            label="Market Value of Comparables" 
            field="marketValueComparables" 
            placeholder="280,000"
            prefix="$"
          />
        </div>
      </motion.div>

      {/* Expenses Section */}
      <motion.div className="form-section" variants={itemVariants}>
        <div className="section-header">
          <CreditCard className="section-icon" />
          <h3>Monthly Expenses</h3>
        </div>
        <div className="form-grid">
          <InputField 
            label="Mortgage Payment" 
            field="mortgagePayment" 
            placeholder="1,200"
            prefix="$"
          />
          <InputField 
            label="Property Taxes (Annual)" 
            field="propertyTaxes" 
            placeholder="3,600"
            prefix="$"
          />
          <InputField 
            label="Insurance (Annual)" 
            field="insurance" 
            placeholder="1,800"
            prefix="$"
          />
          <InputField 
            label="Management Fees" 
            field="managementFees" 
            placeholder="10"
            suffix="%"
          />
        </div>
      </motion.div>

      {/* Loan & Advanced Section */}
      <motion.div className="form-section" variants={itemVariants}>
        <div className="section-header">
          <Calculator className="section-icon" />
          <h3>Loan & Advanced Metrics</h3>
        </div>
        <div className="form-grid">
          <InputField 
            label="Loan Amount" 
            field="loanAmount" 
            placeholder="200,000"
            prefix="$"
          />
          <InputField 
            label="Annual Debt Service" 
            field="annualDebtService" 
            placeholder="14,400"
            prefix="$"
          />
          <InputField 
            label="Net Operating Income (NOI)" 
            field="noi" 
            placeholder="18,000"
            prefix="$"
          />
          <InputField 
            label="Operating Expenses (Annual)" 
            field="operatingExpenses" 
            placeholder="6,000"
            prefix="$"
          />
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div className="form-actions" variants={itemVariants}>
        <button 
          className="analyze-button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="button-icon spinning" />
              Analyzing...
            </>
          ) : (
            <>
              <Calculator className="button-icon" />
              Analyze Investment
            </>
          )}
        </button>
        <button 
          className="clear-button"
          onClick={onClear}
        >
          <Trash2 className="button-icon" />
          Clear Form
        </button>
      </motion.div>
    </motion.div>
  );
};

export default PropertyForm;

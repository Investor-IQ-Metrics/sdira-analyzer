import React, { useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Search, Calculator, Trash2, Building, DollarSign, Wrench, TrendingUp, CreditCard, Loader2 } from 'lucide-react';

// InputField component moved OUTSIDE of PropertyForm to prevent re-creation on each render
// This fixes the issue where input loses focus after each keystroke
const InputField = memo(({ label, field, placeholder, prefix, suffix, value, onChange, type = "text" }) => (
  <div className="input-group">
    <label htmlFor={field}>{label}</label>
    <div className="input-wrapper">
      {prefix && <span className="input-prefix">{prefix}</span>}
      <input
        id={field}
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        className={prefix ? 'has-prefix' : ''}
      />
      {suffix && <span className="input-suffix">{suffix}</span>}
    </div>
  </div>
));

InputField.displayName = 'InputField';

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
  // Use useCallback to memoize the change handler
  const handleInputChange = useCallback((field, value) => {
    onInputChange(field, value);
  }, [onInputChange]);

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
              onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
              placeholder="123 Main Street"
            />
          </div>
          <InputField 
            label="City" 
            field="city" 
            placeholder="Miami" 
            value={formData.city}
            onChange={handleInputChange}
          />
          <InputField 
            label="State" 
            field="state" 
            placeholder="FL" 
            value={formData.state}
            onChange={handleInputChange}
          />
          <InputField 
            label="ZIP Code" 
            field="zipCode" 
            placeholder="33101" 
            value={formData.zipCode}
            onChange={handleInputChange}
          />
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
            value={formData.purchasePrice}
            onChange={handleInputChange}
          />
          <InputField 
            label="Closing Costs" 
            field="closingCosts" 
            placeholder="5,000"
            prefix="$"
            value={formData.closingCosts}
            onChange={handleInputChange}
          />
          <InputField 
            label="Assessed Value" 
            field="assessedValue" 
            placeholder="240,000"
            prefix="$"
            value={formData.assessedValue}
            onChange={handleInputChange}
          />
          <InputField 
            label="Property Value (ARV)" 
            field="propertyValue" 
            placeholder="280,000"
            prefix="$"
            value={formData.propertyValue}
            onChange={handleInputChange}
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
            value={formData.repairCosts}
            onChange={handleInputChange}
          />
          <InputField 
            label="Available Rehab Budget" 
            field="availableRehabBudget" 
            placeholder="30,000"
            prefix="$"
            value={formData.availableRehabBudget}
            onChange={handleInputChange}
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
            value={formData.monthlyRent}
            onChange={handleInputChange}
          />
          <InputField 
            label="Vacancy Rate" 
            field="vacancyRate" 
            placeholder="5"
            suffix="%"
            value={formData.vacancyRate}
            onChange={handleInputChange}
          />
          <InputField 
            label="Market Value of Comparables" 
            field="marketValueComparables" 
            placeholder="280,000"
            prefix="$"
            value={formData.marketValueComparables}
            onChange={handleInputChange}
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
            value={formData.mortgagePayment}
            onChange={handleInputChange}
          />
          <InputField 
            label="Property Taxes (Annual)" 
            field="propertyTaxes" 
            placeholder="3,600"
            prefix="$"
            value={formData.propertyTaxes}
            onChange={handleInputChange}
          />
          <InputField 
            label="Insurance (Annual)" 
            field="insurance" 
            placeholder="1,800"
            prefix="$"
            value={formData.insurance}
            onChange={handleInputChange}
          />
          <InputField 
            label="Management Fees" 
            field="managementFees" 
            placeholder="10"
            suffix="%"
            value={formData.managementFees}
            onChange={handleInputChange}
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
            value={formData.loanAmount}
            onChange={handleInputChange}
          />
          <InputField 
            label="Annual Debt Service" 
            field="annualDebtService" 
            placeholder="14,400"
            prefix="$"
            value={formData.annualDebtService}
            onChange={handleInputChange}
          />
          <InputField 
            label="Net Operating Income (NOI)" 
            field="noi" 
            placeholder="18,000"
            prefix="$"
            value={formData.noi}
            onChange={handleInputChange}
          />
          <InputField 
            label="Operating Expenses (Annual)" 
            field="operatingExpenses" 
            placeholder="6,000"
            prefix="$"
            value={formData.operatingExpenses}
            onChange={handleInputChange}
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

export default memo(PropertyForm);

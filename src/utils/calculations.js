// Investment metrics calculations - mirrors the Jupyter notebook logic

export const safeFloat = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const calculateInvestmentMetrics = (inputData) => {
  // Convert all inputs to float values
  const purchasePrice = safeFloat(inputData.purchasePrice);
  const closingCosts = safeFloat(inputData.closingCosts);
  const repairCosts = safeFloat(inputData.repairCosts);
  const monthlyRent = safeFloat(inputData.monthlyRent);
  const mortgagePayment = safeFloat(inputData.mortgagePayment);
  const propertyTaxes = safeFloat(inputData.propertyTaxes);
  const insurance = safeFloat(inputData.insurance);
  const managementFeeRate = safeFloat(inputData.managementFees, 10) / 100;
  const vacancyRate = safeFloat(inputData.vacancyRate, 5) / 100;
  const loanAmount = safeFloat(inputData.loanAmount);
  const propertyValue = safeFloat(inputData.propertyValue);
  const marketValueComparables = safeFloat(inputData.marketValueComparables);
  const noi = safeFloat(inputData.noi);
  const annualDebtService = safeFloat(inputData.annualDebtService);
  const operatingExpenses = safeFloat(inputData.operatingExpenses);

  // Core calculations
  const arv = marketValueComparables || propertyValue;
  const maxTotalInvestment = arv * 0.70; // 70% rule
  const totalInvestment = purchasePrice + repairCosts + closingCosts;
  const maxPurchasePrice = maxTotalInvestment - repairCosts - closingCosts;
  const availableRehabBudget = maxTotalInvestment - purchasePrice - closingCosts;

  // Monthly calculations
  const monthlyTaxes = propertyTaxes / 12;
  const monthlyInsurance = insurance / 12;
  const monthlyManagement = monthlyRent * managementFeeRate;
  const monthlyExpenses = mortgagePayment + monthlyTaxes + monthlyInsurance + monthlyManagement;
  const monthlyCashFlow = monthlyRent - monthlyExpenses;

  // Annual calculations
  const annualRent = monthlyRent * 12;
  const annualExpenses = monthlyExpenses * 12;
  const annualCashFlow = monthlyCashFlow * 12;
  const annualVacancyCost = annualRent * vacancyRate;
  const annualMaintenance = arv * 0.015; // 1.5% of property value

  // Investment ratios
  const cashOnCashReturn = totalInvestment > 0 ? (annualCashFlow / totalInvestment * 100) : 0;
  const capRate = arv > 0 && noi > 0 ? (noi / arv * 100) : 0;
  const ltvRatio = arv > 0 ? (loanAmount / arv * 100) : 0;
  const grossRentMultiplier = annualRent > 0 ? arv / annualRent : 0;
  const debtServiceCoverageRatio = annualDebtService > 0 ? noi / annualDebtService : 0;
  const breakEvenRatio = annualRent > 0 ? (operatingExpenses + annualDebtService) / annualRent : 0;

  // Profitability analysis
  const forcedAppreciation = arv - purchasePrice;
  const totalReturn1yr = annualCashFlow + forcedAppreciation;
  const roiPercentage = totalInvestment > 0 ? (totalReturn1yr / totalInvestment * 100) : 0;

  // Calculate estimated NOI if not provided
  const estimatedNoi = noi || (annualRent * (1 - vacancyRate) - operatingExpenses - annualMaintenance);

  // Price per square foot (if available)
  const pricePerSqft = 0; // Would need sqft input

  return {
    arv,
    maxTotalInvestment,
    maxPurchasePrice,
    totalInvestment,
    availableRehabBudget,
    monthlyCashFlow,
    annualCashFlow,
    cashOnCashReturn,
    capRate,
    ltvRatio,
    grossRentMultiplier,
    debtServiceCoverageRatio,
    breakEvenRatio,
    forcedAppreciation,
    totalROI: roiPercentage,
    annualVacancyCost,
    annualMaintenance,
    vacancyRate: vacancyRate * 100,
    monthlyExpenses,
    annualExpenses,
    monthlyRent,
    estimatedNoi,
    purchasePrice,
    repairCosts,
    closingCosts
  };
};

export const generateRecommendation = (metrics, similarHomesAnalysis = null) => {
  let score = 0;
  const reasons = [];
  const warnings = [];

  // Cash Flow Analysis (25 points max)
  if (metrics.monthlyCashFlow > 300) {
    score += 25;
    reasons.push("Excellent monthly cash flow (>$300)");
  } else if (metrics.monthlyCashFlow > 200) {
    score += 20;
    reasons.push("Strong monthly cash flow (>$200)");
  } else if (metrics.monthlyCashFlow > 100) {
    score += 15;
    reasons.push("Good monthly cash flow (>$100)");
  } else if (metrics.monthlyCashFlow > 0) {
    score += 10;
    reasons.push("Positive monthly cash flow");
  } else {
    score -= 25;
    warnings.push("Negative monthly cash flow");
  }

  // Cash-on-Cash Return Analysis (25 points max)
  if (metrics.cashOnCashReturn > 15) {
    score += 25;
    reasons.push("Outstanding cash-on-cash return (>15%)");
  } else if (metrics.cashOnCashReturn > 12) {
    score += 20;
    reasons.push("Excellent cash-on-cash return (>12%)");
  } else if (metrics.cashOnCashReturn > 8) {
    score += 15;
    reasons.push("Good cash-on-cash return (>8%)");
  } else if (metrics.cashOnCashReturn > 5) {
    score += 10;
    reasons.push("Adequate cash-on-cash return (>5%)");
  } else if (metrics.cashOnCashReturn > 0) {
    score += 5;
    reasons.push("Positive cash-on-cash return");
  } else {
    score -= 20;
    warnings.push("Negative cash-on-cash return");
  }

  // Cap Rate Analysis (20 points max)
  if (metrics.capRate > 10) {
    score += 20;
    reasons.push("Exceptional cap rate (>10%)");
  } else if (metrics.capRate > 8) {
    score += 15;
    reasons.push("Strong cap rate (>8%)");
  } else if (metrics.capRate > 6) {
    score += 10;
    reasons.push("Decent cap rate (>6%)");
  } else if (metrics.capRate > 4) {
    score += 5;
    reasons.push("Low but acceptable cap rate");
  } else if (metrics.capRate > 0) {
    score -= 10;
    warnings.push("Very low cap rate (<4%)");
  }

  // 70% Rule Compliance (20 points max)
  if (metrics.totalInvestment <= metrics.maxTotalInvestment) {
    score += 20;
    reasons.push("Meets 70% rule investment criteria");
    const margin = metrics.maxTotalInvestment - metrics.totalInvestment;
    if (margin > 20000) {
      reasons.push(`Strong safety margin ($${margin.toLocaleString()})`);
    }
  } else {
    const excess = metrics.totalInvestment - metrics.maxTotalInvestment;
    score -= 25;
    warnings.push(`Exceeds 70% rule by $${excess.toLocaleString()}`);
  }

  // Similar Homes Market Analysis Integration (15 points max)
  if (similarHomesAnalysis && !similarHomesAnalysis.error) {
    score += 5; // Bonus for having market data

    const priceStats = similarHomesAnalysis.price_statistics;
    if (priceStats) {
      const medianSimilarPrice = priceStats.median_price || 0;
      const targetArv = metrics.arv || 0;

      if (targetArv > 0 && medianSimilarPrice > 0) {
        const priceRatio = targetArv / medianSimilarPrice;

        if (priceRatio <= 0.85) {
          score += 10;
          reasons.push("Property significantly below similar homes median");
        } else if (priceRatio <= 0.95) {
          score += 8;
          reasons.push("Property priced below similar homes median");
        } else if (priceRatio <= 1.05) {
          score += 5;
          reasons.push("Property competitively priced with similar homes");
        } else if (priceRatio <= 1.15) {
          score -= 3;
          warnings.push("Property above similar homes median");
        } else {
          score -= 8;
          warnings.push("Property significantly overpriced vs similar homes");
        }
      }
    }

    // Rental market analysis
    const rentalStats = similarHomesAnalysis.rental_statistics;
    if (rentalStats && metrics.monthlyRent > 0) {
      const medianMarketRent = rentalStats.median_rent_estimate || 0;

      if (medianMarketRent > 0) {
        const rentRatio = metrics.monthlyRent / medianMarketRent;
        if (rentRatio >= 1.1) {
          score += 5;
          reasons.push("Rent above market median - strong income potential");
        } else if (rentRatio >= 0.95) {
          reasons.push("Rent competitive with market");
        } else {
          warnings.push("Rent below market median");
        }
      }
    }

    // Market activity insights
    const marketTiming = similarHomesAnalysis.market_timing;
    if (marketTiming) {
      const avgDom = marketTiming.average_days_on_zillow || 0;
      if (avgDom < 30) {
        reasons.push("Hot market - quick sales expected");
      } else if (avgDom > 90) {
        warnings.push("Slower market - extended selling times");
      }
    }
  }

  // Debt Service Coverage (10 points max)
  if (metrics.debtServiceCoverageRatio > 1.5) {
    score += 10;
    reasons.push("Excellent debt service coverage (>1.5)");
  } else if (metrics.debtServiceCoverageRatio > 1.25) {
    score += 8;
    reasons.push("Strong debt service coverage (>1.25)");
  } else if (metrics.debtServiceCoverageRatio > 1.0) {
    score += 5;
    reasons.push("Adequate debt service coverage");
  } else if (metrics.debtServiceCoverageRatio > 0) {
    score -= 10;
    warnings.push("Insufficient debt service coverage (<1.0)");
  }

  // LTV Ratio Analysis (bonus/penalty)
  if (metrics.ltvRatio > 0 && metrics.ltvRatio < 70) {
    score += 5;
    reasons.push("Conservative loan-to-value ratio");
  } else if (metrics.ltvRatio > 85) {
    score -= 10;
    warnings.push("High loan-to-value ratio (>85%)");
  }

  // Generate final recommendation
  let recommendation, confidence, color, bgGradient;

  if (score >= 85) {
    recommendation = "STRONG BUY";
    confidence = "Very High";
    color = "#059669";
    bgGradient = "linear-gradient(135deg, #059669 0%, #047857 100%)";
  } else if (score >= 70) {
    recommendation = "BUY";
    confidence = "High";
    color = "#10b981";
    bgGradient = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
  } else if (score >= 50) {
    recommendation = "CONSIDER";
    confidence = "Medium";
    color = "#f59e0b";
    bgGradient = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
  } else if (score >= 30) {
    recommendation = "WEAK CONSIDER";
    confidence = "Low";
    color = "#f97316";
    bgGradient = "linear-gradient(135deg, #f97316 0%, #ea580c 100%)";
  } else if (score >= 10) {
    recommendation = "AVOID";
    confidence = "Medium";
    color = "#ef4444";
    bgGradient = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
  } else {
    recommendation = "STRONG AVOID";
    confidence = "High";
    color = "#b91c1c";
    bgGradient = "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)";
  }

  return {
    score,
    recommendation,
    confidence,
    color,
    bgGradient,
    reasons,
    warnings
  };
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatPercent = (value) => {
  return `${value.toFixed(2)}%`;
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const analyzeSimilarHomes = (similarHomesData, targetPropertyData = null) => {
  if (!similarHomesData || !similarHomesData.similar_homes) {
    return null;
  }

  const homes = similarHomesData.similar_homes;
  const validHomes = homes.filter(home => home.price > 0 || home.zestimate > 0);

  if (validHomes.length < 3) {
    return { error: "Insufficient similar homes data for analysis" };
  }

  // Extract statistics
  const prices = validHomes.map(h => h.price || h.zestimate).filter(p => p > 0);
  const rents = validHomes.map(h => h.rent_zestimate).filter(r => r > 0);
  const pricesPerSqft = validHomes.map(h => h.price_per_sqft).filter(p => p > 0);
  const daysOnZillow = validHomes.map(h => h.days_on_zillow).filter(d => d > 0);

  const median = arr => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

  const analysis = {
    total_similar_homes: validHomes.length,
    price_statistics: prices.length > 0 ? {
      median_price: median(prices),
      average_price: avg(prices),
      min_price: Math.min(...prices),
      max_price: Math.max(...prices)
    } : null,
    rental_statistics: rents.length > 0 ? {
      median_rent_estimate: median(rents),
      average_rent_estimate: avg(rents),
      min_rent_estimate: Math.min(...rents),
      max_rent_estimate: Math.max(...rents)
    } : null,
    price_per_sqft_statistics: pricesPerSqft.length > 0 ? {
      median_price_per_sqft: median(pricesPerSqft),
      average_price_per_sqft: avg(pricesPerSqft)
    } : null,
    market_timing: daysOnZillow.length > 0 ? {
      average_days_on_zillow: avg(daysOnZillow),
      median_days_on_zillow: median(daysOnZillow)
    } : null
  };

  // Generate insights
  const insights = [];

  if (analysis.price_statistics) {
    insights.push(`Similar homes range: ${formatCurrency(analysis.price_statistics.min_price)} - ${formatCurrency(analysis.price_statistics.max_price)}`);
    insights.push(`Median similar home price: ${formatCurrency(analysis.price_statistics.median_price)}`);
  }

  if (analysis.rental_statistics) {
    insights.push(`Area rental range: ${formatCurrency(analysis.rental_statistics.min_rent_estimate)} - ${formatCurrency(analysis.rental_statistics.max_rent_estimate)}/month`);
  }

  if (analysis.market_timing) {
    const avgDom = analysis.market_timing.average_days_on_zillow;
    if (avgDom < 20) {
      insights.push("🔥 Very hot market - similar homes selling quickly");
    } else if (avgDom < 45) {
      insights.push("📈 Active market - normal absorption rate");
    } else if (avgDom < 90) {
      insights.push("📊 Moderate market - longer time to sell");
    } else {
      insights.push("📉 Slower market - extended marketing time");
    }
  }

  analysis.market_insights = insights;
  return analysis;
};

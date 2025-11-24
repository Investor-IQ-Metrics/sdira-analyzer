const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');

// RapidAPI configuration - store in Firebase environment config for production
const RAPIDAPI_KEY = functions.config().rapidapi?.key || '8ee7a51770msh842b16b029b5f03p143525jsnf14ca034fdb5';
const RAPIDAPI_HOST = 'zillow-com4.p.rapidapi.com';

/**
 * Fetch property data from Zillow API
 */
exports.getPropertyData = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { address, city, state, zipcode } = req.query;
      
      if (!address || !city || !state || !zipcode) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const fullAddress = `${address} ${city} ${state} ${zipcode}`;
      
      const response = await fetch(
        `https://${RAPIDAPI_HOST}/properties/search-address?` + 
        new URLSearchParams({ address: fullAddress }),
        {
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const jsonData = await response.json();
      const mainData = jsonData.data || {};
      const resoFacts = mainData.resoFacts || {};
      const formattedChip = mainData.formattedChip || {};
      const quickFacts = formattedChip.quickFacts || [];

      // Extract property data
      const propertyData = {
        zpid: mainData.zpid,
        image_link: mainData.imageLink || null,
        street_view: mainData.streetViewImageUrl || null,
        home_type: mainData.homeType || 'Unknown',
        zestimate: mainData.zestimate || 0,
        living_area: mainData.livingAreaValue || 0,
        lot_area: mainData.lotAreaValue || 0,
        lot_units: mainData.lotAreaUnits || '',
        hoa_fee: mainData.hoaFee || 0,
        year_built: resoFacts.yearBuilt || 0
      };

      // Extract rent zestimate
      let rentZestimate = 0;
      const additionalFacts = (formattedChip.additionalFacts || []);
      for (const fact of additionalFacts) {
        if (fact.elementType === 'rentZestimate') {
          const valueStr = fact.value?.fullValue || '0';
          rentZestimate = parseInt(valueStr.replace(/[$,]/g, '')) || 0;
          break;
        }
      }
      propertyData.rent_zestimate = rentZestimate;

      // Extract heating
      let heating = 'Not available';
      const atGlanceFacts = resoFacts.atAGlanceFacts || [];
      for (const fact of atGlanceFacts) {
        if (fact.factLabel === 'Heating') {
          heating = fact.factValue || 'Not available';
          break;
        }
      }
      propertyData.heating = heating;

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
      propertyData.beds = beds;
      propertyData.baths = baths;

      res.json(propertyData);
    } catch (error) {
      console.error('Error fetching property data:', error);
      res.status(500).json({ error: 'Failed to fetch property data', details: error.message });
    }
  });
});

/**
 * Fetch similar homes data from Zillow API
 */
exports.getSimilarHomes = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { zpid } = req.query;
      
      if (!zpid) {
        return res.status(400).json({ error: 'Missing zpid parameter' });
      }

      const response = await fetch(
        `https://${RAPIDAPI_HOST}/properties/similar-homes?zpid=${zpid}`,
        {
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const jsonData = await response.json();
      const similarHomes = jsonData.data?.similarHomes || [];

      // Process similar homes data
      const processedHomes = [];
      for (const home of similarHomes.slice(0, 20)) {
        try {
          const priceForCalc = home.price > 0 ? home.price : home.zestimate;
          let pricePerSqft = 0;
          if (home.livingArea > 0 && priceForCalc > 0) {
            pricePerSqft = priceForCalc / home.livingArea;
          }

          const compData = {
            zpid: home.zpid,
            address: home.address || 'Unknown',
            price: home.price || 0,
            zestimate: home.zestimate || 0,
            beds: home.bedrooms || 0,
            baths: home.bathrooms || 0,
            sqft: home.livingArea || 0,
            lot_size: home.lotAreaValue || 0,
            lot_units: home.lotAreaUnits || '',
            year_built: home.yearBuilt || 0,
            property_type: home.homeType || 'Unknown',
            home_status: home.homeStatus || 'Unknown',
            days_on_zillow: home.daysOnZillow || 0,
            price_per_sqft: pricePerSqft,
            last_sold_date: home.dateSold || '',
            last_sold_price: home.lastSoldPrice || 0,
            property_tax: home.propertyTax || 0,
            hoa_fee: home.hoaFee || 0,
            city: home.city || '',
            state: home.state || '',
            zipcode: home.zipcode || '',
            rent_zestimate: home.rentZestimate || 0,
            image_url: home.imgSrc || '',
            property_url: home.detailUrl || ''
          };

          // Add investment metrics
          if (compData.rent_zestimate > 0 && priceForCalc > 0) {
            const annualRent = compData.rent_zestimate * 12;
            compData.gross_rent_multiplier = priceForCalc / annualRent;
            compData.cap_rate_estimate = (annualRent * 0.6) / priceForCalc * 100;
          }

          processedHomes.push(compData);
        } catch (err) {
          console.warn('Error processing home:', err);
          continue;
        }
      }

      // Calculate market statistics
      const validHomes = processedHomes.filter(h => h.price > 0 || h.zestimate > 0);
      const prices = validHomes.map(h => h.price || h.zestimate).filter(p => p > 0);
      const rents = validHomes.map(h => h.rent_zestimate).filter(r => r > 0);
      const pricesPerSqft = validHomes.map(h => h.price_per_sqft).filter(p => p > 0);
      const daysOnZillow = validHomes.map(h => h.days_on_zillow).filter(d => d > 0);

      const median = arr => {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      };
      const avg = arr => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

      const result = {
        target_zpid: zpid,
        similar_homes: processedHomes,
        total_similar_homes: processedHomes.length,
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

      res.json(result);
    } catch (error) {
      console.error('Error fetching similar homes:', error);
      res.status(500).json({ error: 'Failed to fetch similar homes', details: error.message });
    }
  });
});

/**
 * Health check endpoint
 */
exports.healthCheck = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
});

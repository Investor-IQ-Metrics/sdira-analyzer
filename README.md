# SDIRA Property Investment Analyzer

A sophisticated web application for analyzing real estate investment properties for Self-Directed IRA (SDIRA) accounts. Get instant recommendations on whether to buy a property based on comprehensive financial metrics and market comparables.

![SDIRA Property Analyzer](docs/screenshot.png)

## Features

- 📊 **Investment Analysis**: Calculate key metrics like Cash-on-Cash Return, Cap Rate, ROI, and DSCR
- 🏠 **Property Data Fetch**: Automatically fetch property details from Zillow (Zestimate, rent estimates, etc.)
- 🏘️ **Similar Homes Analysis**: Compare with nearby properties to validate pricing
- ✅ **70% Rule Validation**: Ensure your investment meets the industry-standard 70% rule
- 📈 **Smart Recommendations**: Get BUY/CONSIDER/AVOID recommendations with confidence scores
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🔒 **No Authentication Required**: Anyone can use the tool without signing up

## Architecture

- **Frontend**: React.js hosted on GitHub Pages
- **Backend**: Firebase Cloud Functions (serverless)
- **Analytics**: Firebase Analytics
- **API**: Zillow API via RapidAPI

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project (already configured: `sdira-property-analyzer`)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sdira-property-analyzer.git
   cd sdira-property-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase Functions URL (for production)
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Start Firebase emulators (for local API testing)**
   ```bash
   firebase emulators:start
   ```

The app will be available at `http://localhost:3000`

## Deployment

### Deploy Firebase Functions (Backend)

1. **Login to Firebase**
   ```bash
   firebase login
   ```

2. **Set the RapidAPI key in Firebase config** (for production)
   ```bash
   firebase functions:config:set rapidapi.key="YOUR_RAPIDAPI_KEY"
   ```

3. **Deploy functions**
   ```bash
   firebase deploy --only functions
   ```

4. **Note the Functions URL** (e.g., `https://us-central1-sdira-property-analyzer.cloudfunctions.net`)

### Deploy Frontend to GitHub Pages

1. **Update homepage in package.json**
   Edit `package.json` and update the `homepage` field:
   ```json
   "homepage": "https://yourusername.github.io/sdira-property-analyzer"
   ```

2. **Set the Functions URL as a GitHub Secret**
   - Go to your repository Settings → Secrets and variables → Actions
   - Add a new secret: `FIREBASE_FUNCTIONS_URL` with your Functions URL

3. **Push to main branch**
   ```bash
   git add .
   git commit -m "Deploy"
   git push origin main
   ```

   GitHub Actions will automatically build and deploy to GitHub Pages.

### Alternative: Deploy to Firebase Hosting

If you prefer to host everything on Firebase:

```bash
npm run build
firebase deploy
```

## Configuration

### Firebase Configuration

The Firebase configuration is already set up in `src/utils/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDFa-TisIx0GltDHk6vO-jRoLYVuuELhM4",
  authDomain: "sdira-property-analyzer.firebaseapp.com",
  projectId: "sdira-property-analyzer",
  storageBucket: "sdira-property-analyzer.firebasestorage.app",
  messagingSenderId: "443847454060",
  appId: "1:443847454060:web:1441617738cd1943911749",
  measurementId: "G-84YQ2RK77P"
};
```

### RapidAPI Configuration

The Zillow API is accessed through RapidAPI. The API key is stored in Firebase Functions config for security.

## Usage Guide

### Analyzing a Property

1. **Enter Property Address**: Fill in the street address, city, state, and ZIP code

2. **Fetch Property Data**: Click "Fetch Property Data" to automatically populate Zestimate and rent estimates

3. **Enter Financial Details**:
   - Purchase Price
   - Closing Costs
   - Repair Costs
   - Monthly Rent
   - Mortgage Payment
   - Property Taxes (annual)
   - Insurance (annual)
   - Management Fees (%)

4. **Enter Loan Details** (if applicable):
   - Loan Amount
   - Annual Debt Service
   - NOI (Net Operating Income)

5. **Analyze**: Click "Analyze Investment" to get your recommendation

### Understanding the Results

#### Recommendation Score
- **85+**: STRONG BUY - Excellent investment opportunity
- **70-84**: BUY - Good investment with high confidence
- **50-69**: CONSIDER - Moderate investment, review factors carefully
- **30-49**: WEAK CONSIDER - Borderline investment, proceed with caution
- **10-29**: AVOID - Poor investment characteristics
- **<10**: STRONG AVOID - Significant red flags

#### Key Metrics

| Metric | Good | Average | Poor |
|--------|------|---------|------|
| Cash-on-Cash Return | >12% | 5-12% | <5% |
| Cap Rate | >8% | 5-8% | <5% |
| Monthly Cash Flow | >$300 | $100-300 | <$100 |
| DSCR | >1.25 | 1.0-1.25 | <1.0 |
| LTV Ratio | <70% | 70-80% | >80% |

#### 70% Rule

The 70% Rule states that you should pay no more than 70% of the ARV (After Repair Value) minus repair costs. This ensures a built-in profit margin.

```
Max Purchase = (ARV × 70%) - Repair Costs - Closing Costs
```

## Project Structure

```
sdira-property-analyzer/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── PropertyForm.js
│   │   ├── RecommendationCard.js
│   │   ├── MetricsGrid.js
│   │   ├── AnalysisResults.js
│   │   └── SimilarHomesPanel.js
│   ├── utils/
│   │   ├── calculations.js
│   │   └── firebase.js
│   ├── styles/
│   │   └── index.css
│   ├── App.js
│   └── index.js
├── functions/
│   ├── index.js
│   └── package.json
├── .github/
│   └── workflows/
│       └── deploy.yml
├── firebase.json
├── .firebaserc
├── package.json
└── README.md
```

## API Endpoints

### GET /api/property

Fetches property data from Zillow.

**Parameters:**
- `address`: Street address
- `city`: City name
- `state`: State abbreviation
- `zipcode`: ZIP code

**Response:**
```json
{
  "zpid": "12345678",
  "zestimate": 350000,
  "rent_zestimate": 2500,
  "beds": "3",
  "baths": "2",
  "living_area": 1800,
  "year_built": 1995
}
```

### GET /api/similar-homes

Fetches similar properties in the area.

**Parameters:**
- `zpid`: Zillow Property ID

**Response:**
```json
{
  "similar_homes": [...],
  "price_statistics": {
    "median_price": 340000,
    "average_price": 355000
  },
  "rental_statistics": {
    "median_rent_estimate": 2400
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is for educational purposes only. Always consult with qualified professionals before making investment decisions.

## Disclaimer

This tool provides estimates only and should not be considered financial advice. Real estate investments carry risk, and past performance does not guarantee future results. Always conduct your own due diligence and consult with qualified real estate professionals, accountants, and financial advisors before making investment decisions.

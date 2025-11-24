import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFa-TisIx0GltDHk6vO-jRoLYVuuELhM4",
  authDomain: "sdira-property-analyzer.firebaseapp.com",
  projectId: "sdira-property-analyzer",
  storageBucket: "sdira-property-analyzer.firebasestorage.app",
  messagingSenderId: "443847454060",
  appId: "1:443847454060:web:1441617738cd1943911749",
  measurementId: "G-84YQ2RK77P"
};

let app = null;
let analytics = null;

export const initializeFirebase = () => {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      
      // Only initialize analytics in production and browser environment
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        analytics = getAnalytics(app);
      }
    }
    return app;
  } catch (error) {
    console.warn('Firebase initialization error:', error);
    return null;
  }
};

export const logAnalyticsEvent = (eventName, params = {}) => {
  try {
    if (analytics) {
      logEvent(analytics, eventName, params);
    }
  } catch (error) {
    console.warn('Analytics error:', error);
  }
};

export const getFirebaseApp = () => app;

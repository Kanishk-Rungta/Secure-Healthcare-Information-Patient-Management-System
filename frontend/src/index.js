import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * Application Entry Point
 * 
 * This file boots up the React application, attaching the main <App /> 
 * component to the DOM. It enables React StrictMode to catch potential 
 * problems in the application during the development phase.
 * 
 * StrictMode checks include:
 * - Identifying components with unsafe lifecycles
 * - Warning about legacy string ref API usage
 * - Warning about deprecated findDOMNode usage
 * - Detecting unexpected side effects
 * - Detecting legacy context API
 */

// Initialize root element for React 18+ concurrent mode rendering

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

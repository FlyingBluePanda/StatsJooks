/* ------------------------------------------------ */
/* --------------- Main App File ----------------- */
/* ------------------------------------------------ */

// Import necessary modules from React and ReactDOM
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import Bootstrap for styling
import 'bootstrap/dist/css/bootstrap.min.css';

// Import global styles
import './css/App.css';

// Import application components
import BossStats from './components/BossStats';
import Home from './pages/Home';
import Navigationbar from './components/Navigationbar';

// Create root element and render the main application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Initialize BrowserRouter for handling navigation */}
    <BrowserRouter>
      <div>
        {/* Include the navigation bar on all pages */}
        <Navigationbar />

        {/* Define application routes */}
        <Routes>
          {/* Home page route */}
          <Route path="/" element={<Home />} />
          
          {/* Boss statistics page route */}
          <Route path="boss-stats" element={<BossStats />} />
        </Routes>
      </div>
    </BrowserRouter>
  </React.StrictMode>
);

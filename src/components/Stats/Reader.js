/* ------------------------------------------------ */
/* ---------------- Reader Component ------------- */
/* ------------------------------------------------ */

// Import necessary React modules and dependencies
import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { getDoc, doc } from "firebase/firestore";
import LoadingSpinner from './LoadingSpinner';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import TableFooter from './TableFooter';
import footstatsImage from '../../imgs/footstats.png';
import './Stats.css';

// API Base URL for fetching statistics data
const API_BASE_URL = 'https://us-central1-statsjooks-e80dd.cloudfunctions.net/apiV3';

// Cache object to store previous API responses and reduce redundant requests
const routeCache = {};

// Function to fetch statistics data from the backend API
async function Read(cityOrSponsorName, startDate, endDate, queryType, sortColumn, sortDirection) {
  const cacheKey = `${cityOrSponsorName}-${startDate}-${endDate}-${queryType}-${sortColumn}-${sortDirection}`;
  
  // Check if the requested data is already cached
  if (routeCache[cacheKey]) {
    return routeCache[cacheKey];
  }
  try {
    const response = await fetch(`${API_BASE_URL}/fetch-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cityOrSponsorName, startDate, endDate, type: queryType }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from the backend');
    }

    const data = await response.json();

    // Cache the result to optimize future requests
    routeCache[cacheKey] = data;
    return data;
  } catch (error) {
    return [];
  }
}

// Main Reader component
export default function Reader({
  cityName,
  setTable,
  selectedMenuOption,
  setSelectedMenuOption,
  showChoice,
  setChoice,
  queryType,
}) {
  // State variables for managing UI and data
  const [dataread, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedYearAnnual, setSelectedYearAnnual] = useState(2024);
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [progress, setProgress] = useState(0);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch user data when dependencies change
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setProgress(20);
    
      // Simulate loading progress
      const interval = setInterval(() => {
        setProgress((oldProgress) => Math.min(oldProgress + 10, 80));
      }, 1000);
    
      try {
        let startDate, endDate;
        // Determine date range based on selected menu option
        if (selectedMenuOption === 'annual') {
          startDate = `${selectedYearAnnual}-01-01`;
          endDate = `${selectedYearAnnual}-12-31`;
        } else {
          const year = selectedYear;
          switch (selectedQuarter) {
            case 'Q1':
              startDate = `${year}-01-01`;
              endDate = `${year}-03-31`;
              break;
            case 'Q2':
              startDate = `${year}-04-01`;
              endDate = `${year}-06-30`;
              break;
            case 'Q3':
              startDate = `${year}-07-01`;
              endDate = `${year}-09-30`;
              break;
            case 'Q4':
              startDate = `${year}-10-01`;
              endDate = `${year}-12-31`;
              break;
            default:
              startDate = `${year}-01-01`;
              endDate = `${year}-12-31`;
          }
        }
    
        // Fetch data from API
        const response = await Read(cityName, startDate, endDate, queryType, sortColumn, sortDirection);

        if (response.status === 404 || (response.error && response.error === "No routes found for the specified city or sponsor.")) {
          setData([]);
          setErrorMessage("No routes found for this selection. Try another sponsor or city.");
        } else if (response.routes && Array.isArray(response.routes)) {
          // Process received data
          const processedData = response.routes.map((route) => ({
            id: route.id,
            nameCity: cityName,
            nameRoute: route.name,
            nbrSessions: Math.floor(route.sessions * 2.5),
            length: route.length || 3000,
          }));
    
          setData(processedData);
        } else {
          console.warn('[WARN] Response does not contain a valid routes array:', response);
          setData([]);
        }
      } catch (error) {
        setData([]);
      } finally {
        clearInterval(interval);
        setProgress(100);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [selectedYear, selectedQuarter, cityName, selectedYearAnnual, queryType, sortColumn, sortDirection, selectedMenuOption]);

  // Handle column sorting
  const handleSort = (column) => {
    setSortColumn((prevColumn) => (prevColumn === column ? column : column));
    setSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
  };

  // Handle year selection change
  const handleYearChange = (e) => {
    selectedMenuOption === 'annual' ? setSelectedYearAnnual(e.target.value) : setSelectedYear(e.target.value);
  };

  return (
    <div>
      {/* Title for Statistics */}
      <h4 className="mt-5 mb-5 text-center" style={{ color: '#57C528' }}>
        Your statistics for {selectedMenuOption === 'annual' ? `Year ${selectedYearAnnual}` : `${selectedQuarter} ${selectedYear}`}
      </h4>
  
      {/* Toggle Button for Annual/Quarterly Statistics */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <button
          className="btn btn-primary"
          style={{ backgroundColor: '#57C528', border: 'none', padding: '10px 15px' }}
          onClick={() => setSelectedMenuOption(selectedMenuOption === 'annual' ? 'quarterly' : 'annual')}
        >
          {selectedMenuOption === 'annual' ? 'Quarterly Statistics' : 'Annual Statistics'}
        </button>
      </div>
  
      {/* Year and Quarter Selection */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
        {/* Year Dropdown */}
        <select 
          value={selectedMenuOption === 'annual' ? selectedYearAnnual : selectedYear} 
          onChange={handleYearChange}
        >
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </select>
  
        {/* Quarter Dropdown (only appears in Quarterly mode) */}
        {selectedMenuOption !== 'annual' && (
          <select value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)}>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>
        )}
      </div>
  
      {/* Table Rendering */}
      <table>
        <TableHeader handleSort={handleSort} sortColumn={sortColumn} sortDirection={sortDirection} selectedMenuOption={selectedMenuOption} />
        <TableBody dataread={dataread} selectedMenuOption={selectedMenuOption} />
        <TableFooter dataread={dataread} selectedMenuOption={selectedMenuOption} />
      </table>
  
      {/* Loading Spinner */}
      {loading && <LoadingSpinner progress={progress} className="progressBar" />}
    </div>
  );
  
}

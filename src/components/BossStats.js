
/* ----------------------------------------------------------------------------------------- */
/* ---------------- BossStats Component : Shows stats based on TypeTransportation ---------- */
/* ----------------------------------------------------------------------------------------- */

import React, { useState, useEffect, useMemo } from 'react';
import Cookies from 'js-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../imgs/logov.png';
import LoadingSpinner from './Stats/LoadingSpinner';

// API Base URL for fetching global transportation statistics\ for the time being "https://us-central1-statsjooks-e80dd.cloudfunctions.net/apiV3";
const firebaseFunctionsBaseUrl = "https://us-central1-statsjooks-e80dd.cloudfunctions.net/apiV3";

/**
 * BossStats Component
 * Displays global statistics classified by transportation type.
 */
const BossStats = () => {
  // State variables for managing data and UI elements
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [transportType, setTransportType] = useState("pmr");
  const [isConnected, giveAccess] = useState(Cookies.get('acsssn') || false);
  const [error, setError] = useState(false);

  //!!!!!!!!!!!!!!!!! Hardcoded login credentials for access control, ro change to a secure login system in the future if necessary !!!!!!!!!!!!!!!!!
  const validCredentials = { username: 'admin', password: 'Test' };

  // Fetch data when relevant state variables change
  useEffect(() => {
    if (isConnected) {
      fetchData();
    }
  }, [isConnected, transportType, startDate, endDate]); 

  /**
   * Fetches transportation statistics from the backend API.
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const payload = { transportType, startDate, endDate };

      console.log("[DEBUG] Sending payload to /fetch-global-transportation:", payload);

      const response = await fetch(`${firebaseFunctionsBaseUrl}/fetch-global-transportation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[DEBUG] Response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("[ERROR] Failed to fetch data:", error);
        throw new Error(`Failed to fetch data: ${error.error}`);
      }
       // Process and store the fetched data
      const { routes } = await response.json();
      console.log("[DEBUG] Fetched routes:", routes);

      const combinedData = routes.map((route) => ({
        id: route.id,
        nameRoute: route.name,
        length: route.length || 0,
        typeTransportation: route.typeTransportation || "Unknown",
        nbrSessions: route.sessions || 0,
        treesPlanted: Math.floor(((route.sessions || 0) * ((route.length || 0) * 0.75 / 1000)) / 100),
      }));

      setData(combinedData);
    } catch (error) {
      console.error("[ERROR] Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  /**
   * Handles transportation type selection.
   */
  const handleTransportChange = (e) => {
    setTransportType(e.target.value);
  };
  /**
   * Handles changes in the selected date range.
   */
  const handleDateChange = (e, type) => {
    if (type === "start") setStartDate(e.target.value);
    if (type === "end") setEndDate(e.target.value);
  };
  /**
   * Handles login form submission and user authentication.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { formName, formPassword } = Object.fromEntries(formData);

    if (formName === validCredentials.username && formPassword === validCredentials.password) {
      giveAccess(true);
      setError(false);
      Cookies.set('acsssn', formName, { expires: 1, sameSite: 'Strict' });
    } else {
      setError(true);
    }
  };
  /**
   * Handles user logout by clearing authentication cookies.
   */
  const disconnectUser = () => {
    Cookies.remove('acsssn');
    giveAccess(false);
    window.location.href = '/'; // Redirect to home page after logout
};

  /**
   * Handles sorting functionality for table columns.
   */
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  /**
   * Returns sorted data based on the selected column and direction.
   */
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (!sortColumn) return 0;
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const exportToCSV = () => {
    const csvData = sortedData.map((route) => ({
      ID: route.id,
      Route: route.nameRoute,
      Sessions: route.nbrSessions,
      Length: route.length,
      Transportation: route.typeTransportation,
      TreesPlanted: route.treesPlanted,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'routes_statistics.csv');
    link.click();
  };

  const exportToPDF = () => {
    const input = document.getElementById('pdfContent');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 10, 10);
      pdf.save('routes_statistics.pdf');
    });
  };

  return (
    
    <div className="container mt-5">
      {/* Logout Button */}
      <button className="btn btn-danger float-right" onClick={disconnectUser}>Logout</button>
  
      <div className="text-center mb-4">
        {/* Logo Display */}
        <img src={logo} alt="Jooks Logo" width="300" height="300" />
      </div>
  
      {/* CSV & PDF Export Buttons - Separated */}
      <div className="mb-4 d-flex justify-content-between">
        <button className="btn btn-success">Export CSV</button>
        <button className="btn btn-primary">Export PDF</button>
      </div>
  
      <div className="mb-4">
        {/* Date selection */}
        <label>Start Date: </label>
        <input type="date" value={startDate} onChange={(e) => handleDateChange(e, "start")} className="form-control w-auto d-inline-block ml-2" />
        <label className="ml-3">End Date: </label>
        <input type="date" value={endDate} onChange={(e) => handleDateChange(e, "end")} className="form-control w-auto d-inline-block ml-2" />
      </div>
  
      <div className="mb-4">
        {/* Transportation type selection */}
        <label>Select Transportation Type: </label>
        <select value={transportType} onChange={handleTransportChange} className="form-control w-auto d-inline-block ml-2">
          <option value="run">Run</option>
          <option value="walk">Walk</option>
          <option value="pmr">PMR</option>
          <option value="bike">Bike</option>
          <option value="kick-scooter">Kick Scooter</option>
          <option value="babycarriage">Baby Carriage</option>
        </select>
      </div>
  
      {loading ? (
        
        <div className="text-center my-3"><LoadingSpinner /></div>
      ) : (
        <div id="pdfContent">
          {/* Data table creation */}
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Route Name</th>
                <th>Sessions</th>
                <th>Length</th>
                <th>Transportation Type</th>
                <th>Trees Planted</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map(route => (
                <tr key={route.id}>
                  <td>{route.id}</td>
                  <td>{route.nameRoute}</td>
                  <td>{route.nbrSessions}</td>
                  <td>{route.length}</td>
                  <td>{Array.isArray(route.typeTransportation) ? route.typeTransportation.join(", ") : route.typeTransportation}</td>
                  <td>{route.treesPlanted}</td>
                </tr>
              ))}
            </tbody>
            {/* Total Row at the End */}
            <tfoot>
              <tr>
                <td colSpan="2"><strong>Total</strong></td>
                <td><strong>{sortedData.reduce((sum, route) => sum + route.nbrSessions, 0)}</strong></td>
                <td><strong>{sortedData.reduce((sum, route) => sum + route.length, 0)}</strong></td>
                <td>—</td>
                <td><strong>{sortedData.reduce((sum, route) => sum + route.treesPlanted, 0)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
  
};

export default BossStats;

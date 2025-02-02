/* ------------------------------------------------ */
/* ---------------- Stats Page ------------------- */
/* ------------------------------------------------ */

// WARNING: Hardcoded passwords are temporarily used while waiting for a new login system.
// Please ensure this is updated before deploying the application.

// Import necessary React modules and components
import React, { useState } from 'react';
import Reader from './Reader';
import './Stats.css';
import { fetchStatsData } from '../BigQuery/BigQueryClient';

export default function Stats() {
  // State management for different UI elements
  const [showChoice, setChoice] = useState(false);
  const [showTest, setTable] = useState(false);
  const [errorForm, showError] = useState(false);
  const [errorForm2, showError2] = useState(false);
  const [cityName, setCityName] = useState('');
  const [selectedMenuOption, setSelectedMenuOption] = useState('quarterly');
  const [queryType, setQueryType] = useState('city');
  const [loading, setLoading] = useState(false);

  // Hardcoded passwords (Temporary solution)
  const validPasswords = ['Test', 'u5D79u37t7tD'];

  // Function to handle login and fetch statistics data
  async function startTest(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    let { city_name, city_password } = formProps;

    // Validate password input
    if (!validPasswords.includes(city_password)) {
      console.warn('[WARN] Invalid password provided:', city_password);
      showError2(true);
      return;
    }

    showError2(false);
    setLoading(true);

    try {
      console.log('[DEBUG] Sending request to /check-names with payload:', { name: city_name, type: queryType });

      // API call to validate the city name and retrieve data
      const response = await fetch(
        'https://us-central1-statsjooks-e80dd.cloudfunctions.net/apiV3/check-names',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: city_name, type: queryType }),
        }
      );

      console.log('[DEBUG] Response status:', response.status);
      const result = await response.json();
      console.log('[DEBUG] Response body:', result);

      // Handle unsuccessful responses
      if (!response.ok) {
        console.error('[ERROR] API Error:', result.error);
        showError(true);
        setLoading(false);
        return;
      }

      // Extract the best-matching city or sponsor from the API response
      const suggestedCityOrSponsor = result.matches[0]?.name;
      console.log('[DEBUG] Suggested city or sponsor:', suggestedCityOrSponsor);

      if (!suggestedCityOrSponsor) {
        console.warn('[WARN] No matches found in response.');
        showError(true);
        setLoading(false);
        return;
      }

      // Confirm the suggested city/sponsor with the user
      if (window.confirm(`Did you mean "${suggestedCityOrSponsor}"?`)) {
        setCityName(suggestedCityOrSponsor);
        setTable(true);
        showError(false);
      } else {
        showError(true);
      }
    } catch (error) {
      console.error('[ERROR] Failed to fetch /check-names:', error);
      showError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fullHeight">
      {showTest ? (
        // If test mode is enabled, render the statistics viewer component
        <Reader
          cityName={cityName}
          setTable={setTable}
          selectedMenuOption={selectedMenuOption}
          setSelectedMenuOption={setSelectedMenuOption}
          showChoice={showChoice}
          setChoice={setChoice}
          queryType={queryType}
          fetchStatsData={fetchStatsData}
        />
      ) : (
        <div>
          {/* Display a loading overlay when data is being fetched */}
          {loading && (
            <div className="loading-overlay">
              <p>Loading...</p>
            </div>
          )}
          <form onSubmit={startTest}>
            <div className="col mb-3 mt-3 text-center" style={{ margin: '20px' }}>
              <h2 className="title" style={{ margin: '60px' }}>
                Login to access the statistics of your JOOKS routes! Every three months, we will upload the statistics
                of your routes on this platform, so you can access them at any time.
              </h2>
            </div>
            <div className="col mb-3 mt-3 text-center">
              {/* Input field for city or sponsor name */}
              <input
                className="form-control form-control-lg m-auto input-quizz"
                placeholder="Your city or sponsor brand"
                type="text"
                name="city_name"
                required
              />
              {/* Input field for password */}
              <input
                className="form-control form-control-lg m-auto mt-3 input-quizz"
                placeholder="Your password"
                type="text"
                name="city_password"
                required
              />
              <h5 style={{ margin: '60px' }}>
                Please specify if you are a sponsor or a city before proceeding.
              </h5>
              {/* Dropdown menu to select between city or sponsor */}
              <select
                value={queryType}
                onChange={(e) => setQueryType(e.target.value)}
                style={{ marginTop: '20px' }}
              >
                <option value="city">City</option>
                <option value="sponsor">Sponsor</option>
              </select>
              {/* Error messages for invalid city/sponsor name or password */}
              <p className={errorForm ? 'msgError' : 'hide-error'}>
                The entered name does not match any city or sponsor. Please try again or contact support.
              </p>
              <p className={errorForm2 ? 'msgError' : 'hide-error'}>
                Invalid password. Please try again or contact support.
              </p>
              {/* Submit button */}
              <button
                type="submit"
                className="btn btn-danger mt-0 btn-lg"
                style={{ backgroundColor: '#57C528', border: 'none' }}
                disabled={loading}
              >
                Access your statistics
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
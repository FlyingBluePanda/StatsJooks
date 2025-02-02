/* ------------------------------------------------ */
/* ---------------- Loading Spinner -------------- */
/* ------------------------------------------------ */

// Import React for component creation
import React from 'react';

// Import the CSS file for styling
import './Stats/Stats.css';

/**
 * LoadingSpinner Component
 * Displays a progress bar with a percentage indicator.
 *
 * @param {Object} props - Component properties
 * @param {number} props.progress - The current progress percentage (0-100)
 * @returns {JSX.Element} A styled loading progress bar
 */
export default function LoadingSpinner({ progress }) {
  return (
    <div>
      {/* Progress bar container */}
      <div
        className="progressBar"
        style={{
          width: '100%',
          backgroundColor: '#f0f0f0', // Light grey background for the bar
          position: 'relative',
          height: '20px', // Fixed height for visibility
          borderRadius: '5px', // Rounded corners for aesthetics
          overflow: 'hidden', // Ensures progress stays within bounds
        }}
      >
        {/* Progress fill indicator */}
        <div
          className="progress"
          style={{
            width: `${progress}%`, // Dynamic width based on progress value
            backgroundColor: '#f09400', // Orange color for the progress indicator
            height: '100%',
            transition: 'width 0.3s ease', // Smooth transition effect
          }}
        >
          {progress}%
        </div>
      </div>
      {/* Loading text */}
      <p>Loading...</p>
    </div>
  );
}

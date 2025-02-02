import React from 'react';
import './Stats.css';

export default function LoadingSpinner({ progress }) {
  return (
    <div>
      <div
        className="progressBar"
        style={{
          width: '100%',
          backgroundColor: '#f0f0f0', // Light grey for the full background
          position: 'relative',
          height: '20px', // Adjust the height as needed
          borderRadius: '5px', // Optional, for rounded corners
          overflow: 'hidden',
        }}
      >
        <div
          className="progress"
          style={{
            width: `${progress}%`,
            backgroundColor: '#f09400', // Orange color for the progress
            height: '100%',
            transition: 'width 0.3s ease', // Smooth transition for width changes
          }}
        >
          {progress}%
        </div>
      </div>
      <p>Loading...</p>
    </div>
  );
}

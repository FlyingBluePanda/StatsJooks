/* ------------------------------------------------ */
/* ---------------- Table Header Component ------- */
/* ------------------------------------------------ */

// Import necessary React module
import React from 'react';

// TableHeader component that provides column headers with sorting functionality
// Props:
// - handleSort: Function to handle sorting when a column header is clicked
// - sortColumn: The currently selected column for sorting
// - sortDirection: The direction of sorting ('asc' or 'desc')
export default function TableHeader({ handleSort, sortColumn, sortDirection }) {
    return (
        <thead>
            <tr>
                {/* Column for unique ID, sortable */}
                <th className="table_header" style={{ width: "10%" }} onClick={() => handleSort('id')}>
                    ID {sortColumn === 'id' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                
                {/* Column for city name, sortable */}
                <th className="table_header" style={{ width: "25%" }} onClick={() => handleSort('nameCity')}>
                    City name {sortColumn === 'nameCity' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                
                {/* Column for route name, sortable */}
                <th className="table_header" style={{ width: "25%" }} onClick={() => handleSort('nameRoute')}>
                    Route name {sortColumn === 'nameRoute' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                
                {/* Column for number of sessions, sortable */}
                <th className="table_header" style={{ width: "20%" }} onClick={() => handleSort('nbrSessions')}>
                    Number of sessions {sortColumn === 'nbrSessions' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                
                {/* Column for number of trees planted, sortable */}
                <th className="table_header" style={{ width: "20%" }} onClick={() => handleSort('nbrSessionsAnnual')}>
                    Number of trees planted {sortColumn === 'nbrSessionsAnnual' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
            </tr>
        </thead>
    );
}

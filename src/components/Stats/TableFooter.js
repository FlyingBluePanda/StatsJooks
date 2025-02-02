/* ------------------------------------------------ */
/* ---------------- Table Footer Component ------- */
/* ------------------------------------------------ */

// Import necessary React module
import React from 'react';

// TableFooter component that calculates and displays total values at the bottom of the table
// Props:
// - dataread: Array of data objects used to compute totals
export default function TableFooter({ dataread }) {
    
    // Compute total number of sessions, rounded down for each item and summed up
    const totalSessions = dataread.reduce((acc, item) => acc + Math.floor(item.nbrSessions), 0);
    
    // Compute total estimated trees saved, using the same calculation as in the table body
    // Formula: (nbrSessions * (route length * 0.75 / 1000)) / 100
    const totalTrees = dataread.reduce((acc, item) => 
        acc + Math.floor((item.nbrSessions * (item.length * 0.75 / 1000)) / 100), 0);

    return (
        <tfoot>
            <tr>
                {/* Label for total row */}
                <td className="table_body" style={{ fontWeight: "bold" }}>Total</td>
                
                {/* Empty cells for alignment */}
                <td className="table_body"></td>
                <td className="table_body"></td>
                
                {/* Display total number of sessions */}
                <td className="table_body" style={{ fontWeight: "bold" }}>
                    {totalSessions}
                </td>
                
                {/* Display total estimated trees saved */}
                <td className="table_body" style={{ fontWeight: "bold" }}>
                    {totalTrees}
                </td>
            </tr>
        </tfoot>
    );
}

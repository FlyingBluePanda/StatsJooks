/* ------------------------------------------------ */
/* ---------------- Table Body Component --------- */
/* ------------------------------------------------ */

// Import necessary React module
import React from 'react';

// TableBody component that displays the data in a table format
// Props:
// - dataread: Array of data objects to display in table rows
// - selectedMenuOption: Option chosen by the user (currently logged for debugging purposes)
export default function TableBody({ dataread, selectedMenuOption }) {
    console.log('TableBody says the selectedMenuOption is: ' + selectedMenuOption);
    
    return (
        <tbody>
            {/* Map through dataread array and create a table row for each item */}
            {dataread.map((item) => (
                <tr key={item.id}>
                    {/* Displaying unique ID of the item */}
                    <td className="table_body">{item.id}</td>
                    
                    {/* Displaying the city name */}
                    <td className="table_body">{item.nameCity}</td>
                    
                    {/* Displaying the route name */}
                    <td className="table_body">{item.nameRoute}</td>
                    
                    {/* Displaying the total number of sessions, rounded down because of factoring previously */}
                    <td className="table_body">{Math.floor(item.nbrSessions)}</td>
                    
                    {/* Calculating a derived metric: estimated distance per 100 sessions */}
                    {/* Formula: (nbrSessions * (route length * 0.75 / 1000)) / 100 */}
                    <td className="table_body">{Math.floor((item.nbrSessions * (item.length * 0.75 / 1000)) / 100)}</td>
                </tr>
            ))}
        </tbody>
    );
}

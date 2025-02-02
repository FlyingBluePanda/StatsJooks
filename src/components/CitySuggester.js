/* ------------------------------------------------ */
/* ---------------- City Suggester -------------- */
/* ------------------------------------------------ */

// Import Firebase database instance and Firestore utilities
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Import Fuse.js for fuzzy searching functionality
import Fuse from 'fuse.js';

/**
 * Function to suggest a city based on a fuzzy search.
 *
 * @param {string} searchName - The name of the city to search for.
 * @param {string} collectionName - The Firestore collection to query.
 * @returns {Promise<string|null>} - Returns the document ID of the best match or null if no match is found.
 */
export async function citysuggester(searchName, collectionName) {
  // Reference the specified Firestore collection
  const targetRef = collection(db, collectionName);
  
  // Retrieve all documents from the specified collection
  const querySnapshot = await getDocs(targetRef);

  // Array to store the extracted city names and their document IDs
  const searchData = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    
    // Extract the English name of the city (if available) and store it along with its ID
    searchData.push({ id: doc.id, name: data?.Name?.EN || '' });
  });

  // Configuration options for Fuse.js fuzzy searching
  const options = {
    includeScore: true, // Include search precision scores in the results
    keys: ['name'], // Define searchable fields (only 'name' in this case)
  };

  // Initialize Fuse.js with the extracted city data
  const fuse = new Fuse(searchData, options);
  
  // Perform the fuzzy search on the provided city name
  const result = fuse.search(searchName);

  // Return null if no match is found
  if (result.length === 0) {
    return null;
  }

  // Return the document ID of the closest match
  return result[0].item.id;
}

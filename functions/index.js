
/* ----------------------------------------------------------------------------------------- */
/* ---------------- Firebase functions------------------------------------------- ---------- */
/* ----------------------------------------------------------------------------------------- */


const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const express = require("express");
const cors = require("cors");
const { BigQuery } = require("@google-cloud/bigquery");
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Define Secrets
const GOOGLE_SERVICE_KEY_BASE64 = defineSecret("GOOGLE_SERVICE_KEY_BASE64");
const SERVICE_ACCOUNT_KEY = defineSecret("SERVICE_ACCOUNT_KEY");

let db; // Initialize `db` later after secrets are resolved

// Express app for apiV3
const appV3 = express();

// Configure CORS
appV3.use(
  cors({
    origin: [
      "http://127.0.0.1:5000",
      "http://127.0.0.1:5001",
      "http://localhost:3000",
      "https://newstatsjooks.web.app",
      "https://statsjooks.web.app",
      "https://statsjooks-e80dd.firebaseapp.com/",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

appV3.use(express.json());

// Initialize Firebase Admin dynamically when the function is invoked
async function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    const serviceAccountBase64 = SERVICE_ACCOUNT_KEY.value();
    const serviceAccountJson = JSON.parse(
      Buffer.from(serviceAccountBase64, "base64").toString("utf8")
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
      databaseURL: "https://shining-heat-203.firebaseio.com",
    });

    db = admin.firestore();
  }
}

// Initialize BigQuery
async function initializeBigQuery() {
  const serviceKeyJson = Buffer.from(
    GOOGLE_SERVICE_KEY_BASE64.value(),
    "base64"
  ).toString("utf8");

  const tempDir = process.env.TEMP || process.env.TMP || "/tmp";
  const tempFilePath = path.join(tempDir, "GoogleServiceKeyJOOKS.json");

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  fs.writeFileSync(tempFilePath, serviceKeyJson);

  return new BigQuery({
    projectId: "shining-heat-203",
    keyFilename: tempFilePath,
  });
}

// Fetch BigQuery data
async function fetchBigQueryData(bigquery, startDate, endDate, routeIds = []) {
  console.log("[DEBUG] Extracted route IDs:", routeIds);

  const query = `
    SELECT
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'route_id') AS route_id,
      COUNT(*) AS sessions
    FROM \`shining-heat-203.analytics_153288982.events_*\`
    WHERE event_name = 'open_route_detail'
    AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'route_id') IN UNNEST(@routeIds)
    AND _TABLE_SUFFIX BETWEEN @startDate AND @endDate
    GROUP BY route_id
  `;

  const options = {
    query,
    params: {
      startDate: startDate.replace(/-/g, ""), // Convert to 'YYYYMMDD' format
      endDate: endDate.replace(/-/g, ""), // Convert to 'YYYYMMDD' format
      routeIds,
    },
  };

  try {
    const [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();

    console.log("[DEBUG] Aggregated BigQuery response rows:", rows); // Log the rows for debugging
    return rows; // Rows now contain aggregated session counts for each route_id
  } catch (error) {
    console.error("Error executing BigQuery query:", error);
    throw new Error("Error executing BigQuery query");
  }
}


// Smaller API Endpoint: /check-names
appV3.post("/check-names", async (req, res) => {
  const { name, type } = req.body;

  console.log("[DEBUG] Request received at /check-names with:", { name, type });

  // Validate input
  if (!["city", "sponsor"].includes(type)) {
    console.error("[ERROR] Invalid type provided:", type);
    return res.status(400).json({ error: "Invalid type. Must be 'city' or 'sponsor'." });
  }

  try {
    console.log("[DEBUG] Initializing Firebase Admin...");
    await initializeFirebaseAdmin();

    const collectionName = type === "city" ? "City" : "Sponsor";
    console.log(`[DEBUG] Querying Firestore collection: ${collectionName}`);

    const querySnapshot = await db.collection(collectionName).get();

    if (querySnapshot.empty) {
      console.warn(`[WARN] No documents found in collection: ${collectionName}`);
      return res.status(404).json({ error: `${type.charAt(0).toUpperCase() + type.slice(1)} not found` });
    }

    const data = [];
    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      console.log(`[DEBUG] Document ID: ${doc.id}, Name.EN: ${docData.Name?.EN || "Unknown"}`);
      data.push({ id: doc.id, name: docData.Name?.EN || "Unknown" });
    });

    console.log("[DEBUG] Collected data for fuzzy search:", JSON.stringify(data, null, 2));

    const Fuse = require("fuse.js");
    const fuse = new Fuse(data, {
      keys: ["name"],
      threshold: 0.4,
    });

    const result = fuse.search(name);

    if (result.length === 0) {
      console.warn("[WARN] No matches found for:", name);
      return res.status(404).json({ error: `${type.charAt(0).toUpperCase() + type.slice(1)} not found` });
    }

    console.log("[DEBUG] Matches found:", JSON.stringify(result, null, 2));
    const matches = result.map((match) => match.item);
    res.status(200).json({ matches });
  } catch (error) {
    console.error("[ERROR] Exception in /check-names:", error);
    res.status(500).json({ error: "An error occurred while checking names.", details: error.message });
  }
});




// Query stats endpoint for testing purposes
appV3.post("/query-stats", async (req, res) => {
  const { startDate, endDate, routeIds = [] } = req.body;

  console.log("[DEBUG] Received query parameters for testing:", {
    startDate,
    endDate,
    routeIds,
  });

  try {
    if (!startDate || !endDate || routeIds.length === 0) {
      console.error("[ERROR] Missing or invalid parameters.");
      return res.status(400).json({ error: "Missing or invalid parameters." });
    }

    const bigquery = await initializeBigQuery();
    const data = await fetchBigQueryData(bigquery, startDate, endDate, routeIds);

    console.log("[DEBUG] Query response data for testing:", data); // Log the full response
    res.json(data);
  } catch (error) {
    console.error("[ERROR] Exception in query-stats:", error);
    res.status(500).send({ error: "Failed to execute query", details: error.message });
  }
});

// Unified endpoint for City and Sponsor
appV3.post("/fetch-data", async (req, res) => {
  const { name, type, startDate, endDate } = req.body;

  console.log("[DEBUG] Received request:", { name, type, startDate, endDate });

  if (!["city", "sponsor"].includes(type)) {
    console.error("[ERROR] Invalid type provided:", type);
    return res.status(400).json({ error: "Invalid type. Must be 'city' or 'sponsor'." });
  }

  try {
    console.log("[DEBUG] Initializing Firebase Admin...");
    await initializeFirebaseAdmin();

    let routeIds = [];

    if (name === "all") {
      // Fetch all routes
      console.log("[DEBUG] Fetching all routes from the 'Route' collection.");
      const routesSnapshot = await db.collection("Route").get();

      if (routesSnapshot.empty) {
        console.warn("[WARN] No routes found in the database.");
        return res.status(404).json({ error: "No routes found in the database." });
      }

      routeIds = routesSnapshot.docs.map((doc) => doc.id);
    } else {
      // Fetch data for a specific city/sponsor
      const collectionName = type === "city" ? "City" : "Sponsor";
      console.log(`[DEBUG] Querying Firestore collection: ${collectionName} with name: ${name}`);
      const querySnapshot = await db.collection(collectionName).where("Name.EN", "==", name).get();

      if (querySnapshot.empty) {
        console.warn("[WARN] No results found for the provided name.");
        return res.status(404).json({ error: `${type.charAt(0).toUpperCase() + type.slice(1)} not found` });
      }

      const doc = querySnapshot.docs[0];
      const document = doc.data();
      console.log("[DEBUG] Retrieved Firestore document:", document);

      routeIds = type === "city" ? document.Route : document.IdRoute || [];
      if (!routeIds.length) {
        console.warn("[WARN] No routes found for the specified city or sponsor.");
        return res.status(404).json({ error: "No routes found for the specified city or sponsor." });
      }
    }

    console.log("[DEBUG] Extracted route IDs:", routeIds);

    // Fetch route details for each routeId
    const routeDetails = await Promise.all(
      routeIds.map(async (routeId) => {
        const routeDoc = await db.collection("Route").doc(routeId).get();
        if (routeDoc.exists) {
          return { id: routeId, ...routeDoc.data() };
        } else {
          console.warn(`[WARN] Route ${routeId} not found in Firestore.`);
          return { id: routeId, name: "Unknown Route", length: 0 };
        }
      })
    );

    console.log("[DEBUG] Route details:", routeDetails);

    // Fetch BigQuery analytics for the routeIds
    const bigquery = await initializeBigQuery();
    const stats = await fetchBigQueryData(bigquery, startDate, endDate, routeIds);
    console.log("[DEBUG] Aggregated BigQuery analytics:", stats);

    // Combine Firestore route details with BigQuery stats
    const statsByRouteId = stats.reduce((acc, stat) => {
      acc[stat.route_id] = stat.sessions; // Map route_id to session count
      return acc;
    }, {});

    const combinedData = routeDetails.map((route) => ({
      id: route.id,
      name: route.Name?.EN || "Unknown Route",
      length: route.Length || 0,
      typeTransportation: route.TypeTransportation || "Unknown", // Include TypeTransportation
      sessions: statsByRouteId[route.id] || 0,
    }));

    console.log("[DEBUG] Combined data for response:", combinedData);

    // Respond with the combined data
    res.json({ routes: combinedData });
  } catch (error) {
    console.error("[ERROR] Exception in fetch-data:", error);
    res.status(500).send({ error: "An error occurred while fetching data.", details: error.message });
  }
});

appV3.post("/fetch-global-transportation", async (req, res) => {
  const { transportType, startDate, endDate } = req.body;

  console.log("[DEBUG] Received request:", { transportType, startDate, endDate });

  try {
    console.log("[DEBUG] Initializing Firebase Admin...");
    await initializeFirebaseAdmin();

    console.log(`[DEBUG] Querying Firestore Route collection for TypeTransportation: ${transportType}`);

    // 🔹 Fetch routes with the specified TypeTransportation
    const querySnapshot = await db
      .collection("Route")
      .where("TypeTransportation", "array-contains", transportType)
      .select("Name", "Length", "TypeTransportation") // Select necessary fields only
      .get();

    if (querySnapshot.empty) {
      console.warn(`[WARN] No routes found for TypeTransportation: ${transportType}`);
      return res.status(404).json({ error: "No routes found for the specified transport type." });
    }

    // 🔹 Convert Firestore documents into route objects
    const routes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().Name?.EN || "Unknown Route",
      length: doc.data().Length || 0,
      typeTransportation: Array.isArray(doc.data().TypeTransportation) 
        ? doc.data().TypeTransportation.join(", ") // Format properly for readability
        : doc.data().TypeTransportation || "Unknown",
    }));

    const routeIds = routes.map((route) => route.id);

    console.log("[DEBUG] Retrieved routes:", routes.length);
    console.log("[DEBUG] Extracted Route IDs:", routeIds);

    if (routeIds.length === 0) {
      console.warn("[WARN] No valid route IDs found.");
      return res.status(404).json({ error: "No valid route IDs found." });
    }

    // 🔹 Limit route IDs to avoid BigQuery memory overflow
    const maxRoutesPerQuery = 1000;
    const limitedRouteIds = routeIds.slice(0, maxRoutesPerQuery);

    console.log(`[DEBUG] Fetching BigQuery stats for ${limitedRouteIds.length} routes`);

    // Fetch BigQuery analytics
    const bigquery = await initializeBigQuery();
    const stats = await fetchBigQueryData(bigquery, startDate, endDate, limitedRouteIds);

    console.log("[DEBUG] Aggregated BigQuery analytics:", stats);

    // 🔹 Create a lookup table for BigQuery stats
    const statsByRouteId = stats.reduce((acc, stat) => {
      acc[stat.route_id] = stat.sessions || 0;
      return acc;
    }, {});

    // 🔹 Combine Firestore route details with BigQuery stats
    const combinedData = routes.map((route) => ({
      id: route.id,
      name: route.name,
      length: route.length,
      typeTransportation: route.typeTransportation, 
      sessions: statsByRouteId[route.id] || 0,
    }));

    console.log("[DEBUG] Combined data for response:", combinedData.length);

    res.json({ routes: combinedData });
  } catch (error) {
    console.error("[ERROR] Exception in /fetch-global-transportation:", error);
    res.status(500).json({ error: "An error occurred while fetching data.", details: error.message });
  }
});



// Export apiV3 function
exports.apiV3 = onRequest(
  {
    timeoutSeconds: 120,
    memory: "512MB",
    secrets: [GOOGLE_SERVICE_KEY_BASE64, SERVICE_ACCOUNT_KEY],
  },
  appV3
);

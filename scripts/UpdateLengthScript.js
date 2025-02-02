const { BigQuery } = require('@google-cloud/bigquery');

const bigquery = new BigQuery({
  projectId: 'shining-heat-203', // Replace with your project ID
  keyFilename: 'C:/Users/logic/OneDrive/Documents/GitHub/StatsJooks/StatsJooksBigQuery/statsjooks/config/GoogleServiceKeyJOOKS.json', // Replace with the path to your key file
});

async function fetchBigQueryData(startDate, endDate) {
  const query = `
    SELECT
      event_timestamp AS id,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'route_id') AS route_id,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'route_name') AS route_name,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'city_id') AS city_id,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'city_name') AS city_name,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'user_id') AS user_id,
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'datetime') AS date_time
    FROM \`shining-heat-203.analytics_153288982.events_*\`
    WHERE event_name = 'open_route_detail'
    AND _TABLE_SUFFIX BETWEEN @startDate AND @endDate
  `;

  const options = {
    query: query,
    params: {
      startDate: startDate.replace(/-/g, ''), // Convert to 'YYYYMMDD' format
      endDate: endDate.replace(/-/g, ''), // Convert to 'YYYYMMDD' format
    },
  };

  try {
    const [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();
    console.log('Fetched BigQuery data:', rows);

    if (rows.length > 0) {
      console.log('First item:', rows[0]); // Log the first item
      console.log('First item structure:', JSON.stringify(rows[0], null, 2)); // Log the structure of the first item
    } else {
      console.log('No data found');
    }

    return rows;
  } catch (error) {
    console.error('Error executing BigQuery query:', error);
    return [];
  }
}

// Test the function
fetchBigQueryData('2023-01-01', '2023-12-31');

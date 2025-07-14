const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

// Validate required environment variables
const validateEnvironment = () => {
  const requiredVars = ['GOOGLE_SERVICE_ACCOUNT_KEY', 'GOOGLE_SPREADSHEET_ID'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Initialize Google Sheets API
let auth, sheets, SPREADSHEET_ID;
try {
  validateEnvironment();
  auth = new GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  sheets = google.sheets({ version: 'v4', auth });
  SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
} catch (error) {
  console.error('Failed to initialize Google Sheets API:', error.message);
}

const RANGE = 'Sheet1!A:H'; // Read all columns, filter out calculated ones in code

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Check if Google Sheets API is properly initialized
  if (!sheets || !SPREADSHEET_ID) {
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Server configuration error',
        details: 'Google Sheets API not properly configured'
      }),
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api', '');
    console.log('Request path:', event.path);
    console.log('Processed path:', path);
    console.log('HTTP method:', event.httpMethod);
    
    // GET /api/clubs - Fetch all clubs
    if (event.httpMethod === 'GET' && (path === '/clubs' || path === '/clubs/')) {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
      });
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify([]),
        };
      }
      // Convert rows to objects (assuming first row is headers)
      const headersRow = rows[0];
      const clubs = rows.slice(1).map(row => {
        const club = {};
        headersRow.forEach((header, index) => {
          club[header] = row[index] || '';
        });
        return club;
      });
      // Filter out calculated fields from the response
      const fieldsToExclude = ['Average Roll (Yards)', 'Overhit Risk (Yards)'];
      const filteredClubs = clubs.map(club => {
        const filteredClub = { ...club };
        fieldsToExclude.forEach(field => {
          delete filteredClub[field];
        });
        return filteredClub;
      });
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(filteredClubs),
      };
    }

    // PUT /api/clubs/:clubName - Update a specific club
    if (event.httpMethod === 'PUT' && path.startsWith('/clubs/')) {
      const clubName = decodeURIComponent(path.split('/clubs/')[1]);
      const updatedClub = JSON.parse(event.body);
      // Remove calculated fields from the update data
      const fieldsToExclude = ['Average Roll (Yards)', 'Overhit Risk (Yards)'];
      const filteredClub = { ...updatedClub };
      fieldsToExclude.forEach(field => {
        delete filteredClub[field];
      });
      // Find the row index for the club
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
      });
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return {
          statusCode: 404,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Club not found' }),
        };
      }
      const headersRow = rows[0];
      const clubIndex = rows.findIndex((row, index) => index > 0 && row[0] === clubName);
      if (clubIndex === -1) {
        return {
          statusCode: 404,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Club not found' }),
        };
      }
      // Filter out calculated fields that shouldn't be saved to the sheet
      const filteredHeaders = headersRow.filter(header => !fieldsToExclude.includes(header));
      const updatedRow = filteredHeaders.map(header => filteredClub[header] || '');
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Sheet1!A${clubIndex + 1}:${String.fromCharCode(65 + filteredHeaders.length - 1)}${clubIndex + 1}`,
        valueInputOption: 'RAW',
        resource: {
          values: [updatedRow],
        },
      });
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(filteredClub),
      };
    }

    // Default response for unknown routes
    console.log('No matching route found for:', event.httpMethod, path);
    return {
      statusCode: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Route not found',
        path: path,
        method: event.httpMethod
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
    };
  }
}; 
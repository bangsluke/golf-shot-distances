const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

// Validate required environment variables
const validateEnvironment = () => {
  const requiredVars = ['GOOGLE_SERVICE_ACCOUNT_KEY', 'GOOGLE_SPREADSHEET_ID', 'GOOGLE_SHEET_TAB'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Initialize Google Sheets API
let auth, sheets, SPREADSHEET_ID;
try {
  console.log('Starting Google Sheets API initialization...');
  validateEnvironment();
  console.log('Environment validation passed');
  
  auth = new GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  console.log('GoogleAuth created successfully');
  
  sheets = google.sheets({ version: 'v4', auth });
  console.log('Google Sheets API client created successfully');
  
  SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
  console.log('SPREADSHEET_ID set to:', SPREADSHEET_ID ? '***' : 'undefined');
  
  const SHEET_TAB = process.env.GOOGLE_SHEET_TAB;
  console.log('SHEET_TAB set to:', SHEET_TAB);
  
  console.log('Google Sheets API initialization completed successfully');
} catch (error) {
  console.error('Failed to initialize Google Sheets API:', error.message);
  console.error('Error stack:', error.stack);
}

// We'll construct the range dynamically using the SHEET_TAB environment variable

exports.handler = async (event, context) => {
  console.log('Function called with event:', {
    path: event.path,
    method: event.httpMethod,
    headers: event.headers
  });
  
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
  if (!sheets || !SPREADSHEET_ID || !SHEET_TAB) {
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
    console.log('Original event.path:', event.path);
    console.log('Looking for pattern: /.netlify/functions/api');
    
    let path = event.path;
    if (event.path.includes('/.netlify/functions/api')) {
      path = event.path.replace('/.netlify/functions/api', '');
    } else if (event.path.includes('/api')) {
      path = event.path.replace('/api', '');
    }
    
    console.log('Processed path:', path);
    console.log('HTTP method:', event.httpMethod);
    
    // GET /api/clubs - Fetch all clubs
    if (event.httpMethod === 'GET' && (path === '/clubs' || path === '/clubs/' || path.includes('clubs'))) {
      const range = `${SHEET_TAB}!A:Z`;
      console.log('Attempting to fetch data from spreadsheet:', SPREADSHEET_ID);
      console.log('Using range:', range);
      
      try {
        // First, let's get the spreadsheet metadata to see available sheets
        const metadataResponse = await sheets.spreadsheets.get({
          spreadsheetId: SPREADSHEET_ID,
        });
        console.log('Available sheets:', metadataResponse.data.sheets.map(sheet => sheet.properties.title));
        
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: range,
        });
        console.log('Google Sheets API response received');
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        const rows = response.data.values;
        console.log('Number of rows received:', rows ? rows.length : 0);
        console.log('First few rows:', rows ? rows.slice(0, 3) : 'No rows');
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
      console.log('Final filtered clubs:', JSON.stringify(filteredClubs, null, 2));
              return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(filteredClubs),
        };
      } catch (sheetsError) {
        console.error('Google Sheets API error:', sheetsError.message);
        console.error('Error details:', sheetsError);
        return {
          statusCode: 500,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'Google Sheets API error',
            details: sheetsError.message 
          }),
        };
      }
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
      const range = `${SHEET_TAB}!A:Z`;
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
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
        range: `${SHEET_TAB}!A${clubIndex + 1}:${String.fromCharCode(65 + filteredHeaders.length - 1)}${clubIndex + 1}`,
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
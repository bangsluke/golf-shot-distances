const { google } = require('googleapis');

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const RANGE = 'Sheet1!A:H'; // Adjust based on your sheet structure

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

  try {
    const path = event.path.replace('/.netlify/functions/api', '');
    
    // GET /api/clubs - Fetch all clubs
    if (event.httpMethod === 'GET' && path === '/clubs') {
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
      const headers = rows[0];
      const clubs = rows.slice(1).map(row => {
        const club = {};
        headers.forEach((header, index) => {
          club[header] = row[index] || '';
        });
        return club;
      });

      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(clubs),
      };
    }

    // PUT /api/clubs/:clubName - Update a specific club
    if (event.httpMethod === 'PUT' && path.startsWith('/clubs/')) {
      const clubName = decodeURIComponent(path.split('/clubs/')[1]);
      const updatedClub = JSON.parse(event.body);

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

      const headers = rows[0];
      const clubIndex = rows.findIndex((row, index) => index > 0 && row[0] === clubName);
      
      if (clubIndex === -1) {
        return {
          statusCode: 404,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Club not found' }),
        };
      }

      // Update the row
      const updatedRow = headers.map(header => updatedClub[header] || '');
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Sheet1!A${clubIndex + 1}:H${clubIndex + 1}`,
        valueInputOption: 'RAW',
        resource: {
          values: [updatedRow],
        },
      });

      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClub),
      };
    }

    // Default response for unknown routes
    return {
      statusCode: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Route not found' }),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}; 
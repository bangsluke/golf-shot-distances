require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Load service account credentials
const credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH));
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});
const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_TAB || 'golfData';

// Helper to get all club data
app.get('/api/clubs', async (req, res) => {
  try {
    const range = `${SHEET_NAME}!A1:J`; // Read all columns, filter out calculated ones in code
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });
    const [header, ...rows] = response.data.values;
    const clubs = rows.map(row => Object.fromEntries(header.map((h, i) => [h, row[i] || ''])));
    
    // Filter out calculated fields from the response
    const fieldsToExclude = ['Carry (Yards)', 'Overhit Risk (Yards)'];
    const filteredClubs = clubs.map(club => {
      const filteredClub = { ...club };
      fieldsToExclude.forEach(field => {
        delete filteredClub[field];
      });
      return filteredClub;
    });
    
    res.json(filteredClubs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to update a club row by club name
app.put('/api/clubs/:club', async (req, res) => {
  try {
    const clubName = req.params.club;
    const updateData = req.body;
    // Fetch all data to find the row index
    const range = `${SHEET_NAME}!A1:H`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });
    const [header, ...rows] = response.data.values;
    const rowIndex = rows.findIndex(row => row[0] === clubName);
    if (rowIndex === -1) return res.status(404).json({ error: 'Club not found' });
    
    // Remove calculated fields from the update data
    const fieldsToExclude = ['Carry (Yards)', 'Overhit Risk (Yards)'];
    const filteredData = { ...updateData };
    fieldsToExclude.forEach(field => {
      delete filteredData[field];
    });
    
    // Prepare updated row
    const updatedRow = header.map(h => filteredData[h] || '');
    // Update the row in the sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${rowIndex + 2}:H${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [updatedRow] },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
}); 
# Golf Shot Distances Backend

This backend provides a secure API to read and update golf club data in a private Google Sheet using a Google service account.

## Setup

1. **Create a Google Cloud Project & Service Account**
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project.
   - Enable the Google Sheets API for your project.
   - Create a service account and download the JSON key file.
   - Share your Google Sheet with the service account email (found in the JSON key file).

2. **Configure Environment Variables**
   - In the `backend` directory, create a `.env` file with:
     ```env
     GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account.json
     GOOGLE_SHEET_ID=your_google_sheet_id_here
     GOOGLE_SHEET_TAB=golfData
     PORT=4000
     ```
   - Place your downloaded service account JSON as `backend/service-account.json` (or update the path above).

3. **Install Dependencies**
   ```sh
   npm install
   ```

4. **Run the Backend**
   ```sh
   node index.js
   ```

## API Endpoints
- `GET /api/clubs` — Get all club data
- `PUT /api/clubs/:club` — Update a club's data (send JSON body with updated fields)

---

See the main project README for frontend integration. 
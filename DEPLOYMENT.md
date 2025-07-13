# Golf Shot Distances - Netlify Deployment Guide

This guide explains how to deploy both the frontend and backend of the Golf Shot Distances app on Netlify.

## Architecture Overview

- **Frontend**: React SPA built with Vite
- **Backend**: Netlify Functions (serverless) replacing Express
- **Database**: Google Sheets API
- **Hosting**: Netlify (both frontend and backend)

## Prerequisites

1. **Google Sheets Setup**:
   - Create a Google Sheet with your golf club data
   - Set up a Google Service Account
   - Share the sheet with the service account email
   - Enable Google Sheets API

2. **Netlify Account**:
   - Sign up at [netlify.com](https://netlify.com)
   - Install Netlify CLI (optional): `npm install -g netlify-cli`

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your project structure looks like this:
```
golf-shot-distances/
├── src/                    # Frontend React code
├── netlify/
│   └── functions/
│       ├── api.js         # Netlify function (backend)
│       └── package.json   # Function dependencies
├── netlify.toml           # Netlify configuration
├── package.json           # Frontend dependencies
└── DEPLOYMENT.md          # This file
```

### 2. Set Up Environment Variables

In your Netlify dashboard, go to **Site settings > Environment variables** and add:

```
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id-here
```

**Important**: The `GOOGLE_SERVICE_ACCOUNT_KEY` should be the entire JSON content of your service account key file.

### 3. Deploy to Netlify

#### Option A: Deploy via Git (Recommended)

1. **Push to GitHub/GitLab**:
   ```bash
   git add .
   git commit -m "Add Netlify deployment configuration"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose your repository
   - Set build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Click "Deploy site"

#### Option B: Deploy via Netlify CLI

1. **Install dependencies**:
   ```bash
   npm install
   cd netlify/functions && npm install && cd ../..
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### 4. Configure Build Settings

Netlify will automatically detect the build settings from `netlify.toml`, but you can verify in the dashboard:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

### 5. Set Up Redirects

The `netlify.toml` file includes redirects for:
- API routes (`/api/*` → `/.netlify/functions/api/*`)
- SPA routing (`/*` → `/index.html`)

## Environment Variables Setup

### Google Service Account Setup

1. **Create Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google Sheets API
   - Create a service account
   - Download the JSON key file

2. **Share Google Sheet**:
   - Open your Google Sheet
   - Click "Share" and add the service account email
   - Give "Editor" permissions

3. **Get Spreadsheet ID**:
   - From the sheet URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the ID between `/d/` and `/edit`

### Netlify Environment Variables

In Netlify dashboard → Site settings → Environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Full JSON content of service account key | `{"type":"service_account",...}` |
| `GOOGLE_SPREADSHEET_ID` | Your Google Sheet ID | `your-google-sheet-ID` |

## Testing the Deployment

1. **Check Function Logs**:
   - Go to Netlify dashboard → Functions
   - Click on your function to see logs

2. **Test API Endpoints**:
   - `GET /api/clubs` - Should return your club data
   - `PUT /api/clubs/[club-name]` - Should update club data

3. **Test Frontend**:
   - Visit your Netlify URL
   - Try changing conditions and editing clubs

## Troubleshooting

### Common Issues

1. **Function Not Found (404)**:
   - Check `netlify.toml` redirects
   - Verify function is in `netlify/functions/` directory
   - Check function logs in Netlify dashboard

2. **Google Sheets API Errors**:
   - Verify service account JSON is correct
   - Check sheet is shared with service account email
   - Ensure Google Sheets API is enabled

3. **CORS Errors**:
   - Function includes CORS headers
   - Check browser console for specific errors

4. **Build Failures**:
   - Check build logs in Netlify dashboard
   - Verify all dependencies are in `package.json`
   - Ensure Node.js version is compatible

### Debugging

1. **Function Logs**:
   ```bash
   netlify functions:list
   netlify functions:invoke api --no-identity
   ```

2. **Local Testing**:
   ```bash
   netlify dev
   ```

## Performance Considerations

- **Cold Starts**: Netlify functions may have cold start delays
- **Timeout**: Functions timeout after 10 seconds (free tier)
- **Rate Limits**: Google Sheets API has quotas
- **Caching**: Consider implementing caching for frequently accessed data

## Security

- **Environment Variables**: Never commit service account keys to Git
- **CORS**: Function includes permissive CORS for development
- **API Keys**: Keep Google service account key secure
- **Access Control**: Consider adding authentication for production

## Cost

- **Netlify Free Tier**: 125K function invocations/month
- **Google Sheets API**: Free for reasonable usage
- **Bandwidth**: 100GB/month free

## Maintenance

- **Updates**: Regularly update dependencies
- **Monitoring**: Check function logs for errors
- **Backups**: Keep local copy of Google Sheet data
- **Testing**: Test after any changes to functions or frontend

## Support

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Google Sheets API**: [developers.google.com/sheets](https://developers.google.com/sheets)
- **Function Logs**: Available in Netlify dashboard 
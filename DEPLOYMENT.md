# Deployment Guide for Golf Shot Distances App

## Prerequisites

1. **Google Sheets API Setup**
   - Create a Google Cloud Project
   - Enable Google Sheets API
   - Create a Service Account
   - Download the service account JSON key

2. **Google Spreadsheet**
   - Create a Google Spreadsheet with your club data
   - Share the spreadsheet with your service account email
   - Note the spreadsheet ID from the URL

## Environment Variables Setup

### For Netlify Deployment

1. Go to your Netlify dashboard
2. Navigate to your site's settings
3. Go to "Environment variables"
4. Add the following variables:

```
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id-here
```

### Important Notes:

- **GOOGLE_SERVICE_ACCOUNT_KEY**: This should be the entire JSON content of your service account key file
- **GOOGLE_SPREADSHEET_ID**: This is the long string in your Google Sheets URL between `/d/` and `/edit`

## Google Sheets Setup

Your spreadsheet should have the following structure:

| Club | Average Flat Carry (Yards) | Carry (Yards) | Overhit Risk (Yards) | Average Total Distance Hit (Yards) | ... |
|------|---------------------------|---------------|---------------------|-----------------------------------|-----|
| Driver | 250 | 240 | 20 | 260 | ... |
| 3 Wood | 220 | 210 | 15 | 230 | ... |

## Troubleshooting 502 Errors

### Common Causes:

1. **Missing Environment Variables**
   - Check that both `GOOGLE_SERVICE_ACCOUNT_KEY` and `GOOGLE_SPREADSHEET_ID` are set
   - Verify the JSON key is properly formatted

2. **Invalid Service Account Key**
   - Ensure the service account has the correct permissions
   - Verify the JSON key is not corrupted

3. **Spreadsheet Access Issues**
   - Make sure the service account email has access to the spreadsheet
   - Check that the spreadsheet ID is correct

4. **Google Sheets API Quotas**
   - Check if you've exceeded API quotas
   - Consider upgrading your Google Cloud project

### Debugging Steps:

1. **Check Netlify Function Logs**
   - Go to your Netlify dashboard
   - Navigate to "Functions" tab
   - Check the logs for error messages

2. **Test API Endpoint**
   - Try accessing `https://your-site.netlify.app/.netlify/functions/api/clubs`
   - Check the response for error details

3. **Verify Environment Variables**
   - In Netlify dashboard, verify environment variables are set correctly
   - Redeploy after making changes

## Local Development

For local development, you can use the backend server:

1. Navigate to the `backend` folder
2. Install dependencies: `npm install`
3. Create a `.env` file with your environment variables
4. Start the server: `npm start`

## Security Notes

- Never commit your service account key to version control
- Use environment variables for all sensitive data
- Regularly rotate your service account keys
- Monitor API usage to avoid unexpected charges

## Support

If you continue to experience issues:

1. Check the browser console for JavaScript errors
2. Review Netlify function logs
3. Verify all environment variables are correctly set
4. Test the Google Sheets API access manually 
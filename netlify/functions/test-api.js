exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Check environment variables
    const envCheck = {
      hasGoogleServiceAccountKey: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      hasGoogleSpreadsheetId: !!process.env.GOOGLE_SPREADSHEET_ID,
      serviceAccountKeyLength: process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? process.env.GOOGLE_SERVICE_ACCOUNT_KEY.length : 0,
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || 'NOT_SET',
    };

    // Try to parse the service account key
    let serviceAccountParsed = false;
    try {
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        serviceAccountParsed = true;
      }
    } catch (error) {
      serviceAccountParsed = false;
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Environment check completed',
        environment: envCheck,
        serviceAccountParsed,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Test failed',
        details: error.message,
      }),
    };
  }
}; 
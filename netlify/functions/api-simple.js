exports.handler = async (event, context) => {
  console.log('Simple API function called with event:', {
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

  try {
    console.log('Original event.path:', event.path);
    console.log('Looking for pattern: /.netlify/functions/api-simple');
    
    let path = event.path;
    if (event.path.includes('/.netlify/functions/api-simple')) {
      path = event.path.replace('/.netlify/functions/api-simple', '');
    } else if (event.path.includes('/api-simple')) {
      path = event.path.replace('/api-simple', '');
    }
    
    console.log('Processed path:', path);
    console.log('HTTP method:', event.httpMethod);
    
    // GET /api-simple/clubs - Return mock data
    if (event.httpMethod === 'GET' && (path === '/clubs' || path === '/clubs/' || path.includes('clubs'))) {
      const mockClubs = [
        {
          'Club': 'Driver',
          'Make': 'Callaway',
          'Model': 'XR',
          'Average Flat Carry (Yards)': '250',
          'Max Flat Carry (Yards)': '260',
          'Max Total Distance Hit (Yards)': '280',
          'Average Total Distance Hit (Yards)': '270',
          'Comments': 'Test club',
          'LastUpdated': '2024-01-01 12:00:00'
        }
      ];
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(mockClubs),
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
    console.error('Error in simple API handler:', error);
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
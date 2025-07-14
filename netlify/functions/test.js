exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Test function is working!',
      path: event.path,
      method: event.httpMethod,
      timestamp: new Date().toISOString()
    }),
  };
}; 
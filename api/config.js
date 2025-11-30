module.exports = (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;

  if (!RAZORPAY_KEY_ID) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  return res.status(200).json({
    keyId: RAZORPAY_KEY_ID
  });
};

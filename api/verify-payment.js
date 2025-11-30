const crypto = require('crypto');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      clinic_name,
      contact_name,
      email,
      phone,
      plan,
      amount
    } = req.body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    // Verify payment signature
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    if (!RAZORPAY_KEY_SECRET) {
      console.error('RAZORPAY_KEY_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Generate signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    // Verify signature
    if (generated_signature !== razorpay_signature) {
      console.error('Invalid signature:', { generated: generated_signature, received: razorpay_signature });
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    // Payment verified successfully
    console.log('Payment verified:', {
      payment_id: razorpay_payment_id,
      clinic_name,
      email,
      plan,
      amount
    });

    // TODO: Save to database
    // await saveSubscription({...});

    // TODO: Send confirmation email
    // await sendEmail({...});

    return res.status(200).json({
      success: true,
      message: 'Payment verified and subscription activated',
      payment_id: razorpay_payment_id
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};


const Razorpay = require("razorpay");

function getRazorpayClient() {
    const keyId = process.env.RAZORPAY_TEST_API;
    const keySecret = process.env.RAZORPAY_TEST_SECRET;

    if (!keyId || !keySecret) {
        throw new Error("Razorpay credentials are missing. Set RAZORPAY_TEST_API and RAZORPAY_TEST_SECRET in .env.");
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
}

module.exports = { getRazorpayClient };

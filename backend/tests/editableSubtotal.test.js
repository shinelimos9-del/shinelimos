require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_mockkey1234567890";
const assert = require("assert");
const pricingEngine = require("../src/utils/pricingEngine");
const Booking = require("../src/models/bookingModel");
const emailService = require("../src/utils/emailService");

let sentEmailData = [];
const originalSendEmail = emailService.sendEmail;
emailService.sendEmail = async (emailObj) => {
  sentEmailData.push(emailObj);
  return { success: true };
};

const paymentService = require("../src/services/payment");

async function runEditableSubtotalTests() {
  console.log("\n========================================================");
  console.log("  RUNNING EDITABLE SUBTOTAL TEST SUITE (TESTS 1 - 8)   ");
  console.log("========================================================\n");

  // ========================================================
  // TEST 1 — Existing Behavior (No manual change)
  // Calculated Subtotal: $500
  // Expected: Final amount = 500 + 100 gratuity + 18 card fee = $618.00
  // ========================================================
  const test1 = pricingEngine.calculateQuote({
    initialBookingSubtotal: 500,
  });
  assert.strictEqual(test1.breakdown.mainBookingPrice, 500);
  assert.strictEqual(test1.breakdown.effectiveSubtotal, 500);
  assert.strictEqual(test1.breakdown.subtotal, 500);
  assert.strictEqual(test1.breakdown.gratuity, 100.00);
  assert.strictEqual(test1.breakdown.creditCardFee, 18.00);
  assert.strictEqual(test1.breakdown.grandTotal, 618.00);
  assert.strictEqual(test1.formattedGrandTotal, "618.00");
  console.log("✓ PASS: TEST 1 — Existing behavior: Calculated Subtotal $500 -> Final Total $618.00");

  // ========================================================
  // TEST 2 — Edit Subtotal Downward
  // Original Subtotal: $500, New Subtotal: $450
  // Expected: Effective Subtotal = 450, Gratuity = 90, CC Fee = 16.20, Grand Total = $556.20
  // ========================================================
  const test2 = pricingEngine.calculateQuote({
    subtotal: 450,
    originalSubtotal: 500,
  });
  assert.strictEqual(test2.breakdown.mainBookingPrice, 450);
  assert.strictEqual(test2.breakdown.effectiveSubtotal, 450);
  assert.strictEqual(test2.breakdown.originalSubtotal, 500);
  assert.strictEqual(test2.breakdown.isSubtotalEdited, true);
  assert.strictEqual(test2.breakdown.gratuity, 90.00);
  assert.strictEqual(test2.breakdown.creditCardFee, 16.20);
  assert.strictEqual(test2.breakdown.grandTotal, 556.20);
  assert.strictEqual(test2.formattedGrandTotal, "556.20");
  console.log("✓ PASS: TEST 2 — Edit subtotal downward: $500 -> $450 -> Final Total $556.20");

  // ========================================================
  // TEST 3 — Edit Subtotal Upward
  // Original Subtotal: $500, New Subtotal: $600
  // Expected: Effective Subtotal = 600, Gratuity = 120, CC Fee = 21.60, Grand Total = $741.60
  // ========================================================
  const test3 = pricingEngine.calculateQuote({
    subtotal: 600,
    originalSubtotal: 500,
  });
  assert.strictEqual(test3.breakdown.mainBookingPrice, 600);
  assert.strictEqual(test3.breakdown.effectiveSubtotal, 600);
  assert.strictEqual(test3.breakdown.originalSubtotal, 500);
  assert.strictEqual(test3.breakdown.isSubtotalEdited, true);
  assert.strictEqual(test3.breakdown.gratuity, 120.00);
  assert.strictEqual(test3.breakdown.creditCardFee, 21.60);
  assert.strictEqual(test3.breakdown.grandTotal, 741.60);
  assert.strictEqual(test3.formattedGrandTotal, "741.60");
  console.log("✓ PASS: TEST 3 — Edit subtotal upward: $500 -> $600 -> Final Total $741.60");

  // ========================================================
  // TEST 4 — Decimal Subtotal
  // Example: $450.50
  // Expected: Effective Subtotal = 450.50, Gratuity = 90.10, CC Fee = 16.22, Grand Total = $556.82
  // ========================================================
  const test4 = pricingEngine.calculateQuote({
    subtotal: 450.50,
    originalSubtotal: 500,
  });
  assert.strictEqual(test4.breakdown.effectiveSubtotal, 450.50);
  assert.strictEqual(test4.breakdown.gratuity, 90.10);
  assert.strictEqual(test4.breakdown.creditCardFee, 16.22);
  assert.strictEqual(test4.breakdown.grandTotal, 556.82);
  console.log("✓ PASS: TEST 4 — Decimal subtotal ($450.50) handled with exact 2-decimal precision -> Final $556.82");

  // ========================================================
  // TEST 5 — Invalid Subtotal Validation
  // Rejection of abc, -100, empty string, > 2 decimals
  // ========================================================
  const origFindById = Booking.findById;
  let savedBookingData = null;
  Booking.findById = async () => ({
    _id: "660000000000000000000099",
    trip_details: [{
      trip_type: "one-way",
      pickup_location: "Tysons Corner, VA",
      dropoff_location: "Dulles International Airport (IAD)",
      start_time: "10:00 AM",
      date: "2026-10-15",
      duration: "30 mins",
      distance_miles: 15
    }],
    vehicle_details: {
      vehicle_name: "Luxury Sedan",
      estimated_price: 500
    },
    price_breakdown: {
      mainBookingPrice: 500,
      subtotal: 500
    },
    contact_details: {
      booker: {
        first_name: "Jane",
        last_name: "Doe",
        email: "jane@example.com"
      }
    },
    save: async function() {
      savedBookingData = this;
    }
  });

  // 5a. Non-numeric
  const resAbc = await paymentService.sendFinalInvoicePaymentLink("660000000000000000000099", { subtotal: "abc" });
  assert.strictEqual(resAbc.success, false);
  assert.strictEqual(resAbc.message, "Invalid subtotal amount: must be a valid number");

  // 5b. Negative
  const resNeg = await paymentService.sendFinalInvoicePaymentLink("660000000000000000000099", { subtotal: -100 });
  assert.strictEqual(resNeg.success, false);
  assert.strictEqual(resNeg.message, "Subtotal amount cannot be negative");

  // 5c. Empty string
  const resEmpty = await paymentService.sendFinalInvoicePaymentLink("660000000000000000000099", { subtotal: "" });
  assert.strictEqual(resEmpty.success, false);
  assert.strictEqual(resEmpty.message, "Subtotal cannot be empty: must be a valid number");

  // 5d. Excessive decimals
  const resDec = await paymentService.sendFinalInvoicePaymentLink("660000000000000000000099", { subtotal: "450.999" });
  assert.strictEqual(resDec.success, false);
  assert.strictEqual(resDec.message, "Subtotal amount cannot exceed 2 decimal places");

  console.log("✓ PASS: TEST 5 — Invalid subtotal rejection (non-numeric, negative, empty, > 2 decimals) strictly enforced");

  // ========================================================
  // TEST 6 — Extras + Edited Subtotal
  // Subtotal: $450
  // Additional Stops: 2 stops ($30 on sedan)
  // Waiting Time: 35 mins (15 free + 20 chargeable mins = $20 on sedan)
  // Subtotal with Extras: $450 + $30 + $20 = $500
  // Gratuity: $100.00 (20%)
  // CC Fee: $18.00 (3%)
  // Grand Total: $618.00
  // ========================================================
  const test6 = pricingEngine.calculateQuote({
    vehicle: 'sedan',
    subtotal: 450,
    originalSubtotal: 500,
    additionalStopsCount: 2,
    waitingMinutes: 35,
  });
  assert.strictEqual(test6.breakdown.mainBookingPrice, 450);
  assert.strictEqual(test6.breakdown.additionalStopsFee, 30.00);
  assert.strictEqual(test6.breakdown.waitingTimeFee, 20.00);
  assert.strictEqual(test6.breakdown.subtotal, 500.00);
  assert.strictEqual(test6.breakdown.gratuity, 100.00);
  assert.strictEqual(test6.breakdown.creditCardFee, 18.00);
  assert.strictEqual(test6.breakdown.grandTotal, 618.00);
  console.log("✓ PASS: TEST 6 — Extras ($30 stops + $20 wait) + edited subtotal ($450) -> Effective Subtotal $450, Total $618.00");

  // ========================================================
  // TEST 7 & TEST 8 — Send Invoice & Payment Link Synchronization
  // Change: Subtotal $500 -> $450
  // Backend processes and creates Stripe Session with exact updated final amount
  // ========================================================
  let createdStripeSession = null;
  sentEmailData = [];

  // Mock Stripe checkout sessions
  const Stripe = require("stripe");
  const dummyStripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origStripeCreate = dummyStripe.checkout.sessions.constructor.prototype.create;
  dummyStripe.checkout.sessions.constructor.prototype.create = async function(params) {
    createdStripeSession = params;
    return {
      id: "cs_test_mock_12345",
      url: "https://checkout.stripe.com/c/pay/cs_test_mock_12345"
    };
  };

  const invoiceResult = await paymentService.sendFinalInvoicePaymentLink("660000000000000000000099", {
    subtotal: 450
  });

  assert.strictEqual(invoiceResult.success, true);
  assert.strictEqual(invoiceResult.quote.breakdown.effectiveSubtotal, 450);
  assert.strictEqual(invoiceResult.quote.breakdown.originalSubtotal, 500);
  assert.strictEqual(invoiceResult.quote.breakdown.isSubtotalEdited, true);
  assert.strictEqual(invoiceResult.quote.breakdown.grandTotal, 556.20);
  assert.strictEqual(invoiceResult.quote.formattedGrandTotal, "556.20");

  // TEST 7: DB Booking persistence uses updated amount
  assert.strictEqual(savedBookingData.price_breakdown.effectiveSubtotal, 450);
  assert.strictEqual(savedBookingData.price_breakdown.grandTotal, 556.20);
  assert.strictEqual(savedBookingData.vehicle_details.estimated_price, "556.20");
  assert.strictEqual(savedBookingData.payment_status, "requested");
  console.log("✓ PASS: TEST 7 — Send invoice: Booking updated with edited subtotal $450 and final total $556.20");

  // TEST 8: Payment Link amount matches invoice amount exactly
  assert.notStrictEqual(createdStripeSession, null);
  const expectedCents = Math.round(556.20 * 100); // 55620 cents
  assert.strictEqual(createdStripeSession.line_items[0].price_data.unit_amount, expectedCents);
  assert.strictEqual(invoiceResult.payment_url, "https://checkout.stripe.com/c/pay/cs_test_mock_12345");
  console.log(`✓ PASS: TEST 8 — Payment link received exact updated amount: ${expectedCents} cents ($556.20) matching invoice`);

  // Verify email sent contains updated amount
  assert(sentEmailData.length > 0);
  assert(sentEmailData[0].html.includes("Pay Final Invoice ($556.20) Now"));
  console.log("✓ PASS: Email invoice contains button: 'Pay Final Invoice ($556.20) Now'");

  // Restore mocks
  Booking.findById = origFindById;
  emailService.sendEmail = originalSendEmail;
  dummyStripe.checkout.sessions.constructor.prototype.create = origStripeCreate;

  console.log("\n========================================================");
  console.log("  ALL EDITABLE SUBTOTAL TESTS PASSED SUCCESSFULLY!      ");
  console.log("========================================================\n");
}

runEditableSubtotalTests().catch(err => {
  console.error("Editable Subtotal Test Failed:", err);
  process.exit(1);
});

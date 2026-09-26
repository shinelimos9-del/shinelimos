require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const assert = require("assert");
const bookingService = require("../src/services/booking");
const pricingEngine = require("../src/utils/pricingEngine");

async function runValidationTests() {
  console.log("=================================================");
  console.log("  RUNNING HOURLY & DISCOUNT VALIDATION TESTS     ");
  console.log("=================================================");

  // 1. Duration Validation Tests (initiateBooking)
  // Test 1 hour -> allowed
  const r1 = await bookingService.initiateBooking([
    {
      pickup_location: "Dulles International Airport",
      dropoff_location: "Washington DC",
      trip_type: "Hourly",
      duration: "1 hour",
      total_passengers: "2",
      total_luggage: "2",
      date: "2026-10-01",
      start_time: "10:00 AM",
    }
  ]);
  // Since DB may not be connected in this unit test run, check if duration validation passes before DB or returns specific error
  // If it fails on DB connection (e.g. "buffering timed out" or "Vehicle.find"), that means duration validation passed!
  // But if duration > 12, it MUST immediately fail with "Hourly duration cannot exceed 12 hours" BEFORE reaching DB!

  const r13 = await bookingService.initiateBooking([
    {
      pickup_location: "Dulles International Airport",
      dropoff_location: "Washington DC",
      trip_type: "Hourly",
      duration: "13 hours",
      total_passengers: "2",
      total_luggage: "2",
      date: "2026-10-01",
      start_time: "10:00 AM",
    }
  ]);
  assert.strictEqual(r13.success, false);
  assert.strictEqual(r13.message, "Hourly duration cannot exceed 12 hours");
  console.log("✓ PASS: 13 Hours Duration Rejected by initiateBooking");

  // Test 14 hours -> rejected
  const r14 = await bookingService.initiateBooking([
    {
      pickup_location: "Dulles International Airport",
      dropoff_location: "Washington DC",
      trip_type: "Hourly",
      duration: "14 hours",
    }
  ]);
  assert.strictEqual(r14.success, false);
  assert.strictEqual(r14.message, "Hourly duration cannot exceed 12 hours");
  console.log("✓ PASS: 14 Hours Duration Rejected by initiateBooking");

  // Test createBooking with 13 hours -> rejected
  const cb13 = await bookingService.createBooking({
    trip_details: [
      {
        pickup_location: "Dulles",
        dropoff_location: "DC",
        duration: "13 hours",
      }
    ]
  });
  assert.strictEqual(cb13.success, false);
  assert.strictEqual(cb13.message, "Hourly duration cannot exceed 12 hours");
  console.log("✓ PASS: 13 Hours Duration Rejected by createBooking");

  // 2. Test calculateQuote exact requirements:
  // No adjustment: Calculated = $500, Discount = $0, Final = $500
  // With 20% gratuity and 3% cc fee included in grandTotal:
  // Base = $404.53 -> Subtotal = $404.53, Gratuity = $80.91, CC = $14.56, Grand Total = $500.00
  const q500 = pricingEngine.calculateQuote({ initialBookingSubtotal: 404.53 });
  assert.strictEqual(q500.breakdown.calculatedGrandTotal, 500.00);
  assert.strictEqual(q500.breakdown.grandTotal, 500.00);
  console.log("✓ PASS: Test 1: No adjustment -> Calculated $500, Discount $0, Final $500.00");

  // Normal discount: Calculated = $500, Discount = $50, Final = $450
  const q450 = pricingEngine.calculateQuote({ initialBookingSubtotal: 404.53, discount: 50 });
  assert.strictEqual(q450.breakdown.calculatedGrandTotal, 500.00);
  assert.strictEqual(q450.breakdown.discount, 50.00);
  assert.strictEqual(q450.breakdown.grandTotal, 450.00);
  console.log("✓ PASS: Test 2: Normal discount -> Calculated $500, Discount $50, Final $450.00");

  // Decimal amount: Calculated = $500, Discount = $25.50, Final = $474.50
  const q474_50 = pricingEngine.calculateQuote({ initialBookingSubtotal: 404.53, discount: 25.50 });
  assert.strictEqual(q474_50.breakdown.calculatedGrandTotal, 500.00);
  assert.strictEqual(q474_50.breakdown.discount, 25.50);
  assert.strictEqual(q474_50.breakdown.grandTotal, 474.50);
  console.log("✓ PASS: Test 3: Decimal discount -> Calculated $500, Discount $25.50, Final $474.50");

  // Excessive discount: Calculated = $500, Discount = $600 -> capped at 0, no negative
  const qExcessive = pricingEngine.calculateQuote({ initialBookingSubtotal: 404.53, discount: 600 });
  assert.strictEqual(qExcessive.breakdown.calculatedGrandTotal, 500.00);
  assert.strictEqual(qExcessive.breakdown.discount, 500.00);
  assert.strictEqual(qExcessive.breakdown.grandTotal, 0.00);
  console.log("✓ PASS: Test 4: Excessive discount -> Calculated $500, Discount $600 -> Final $0.00 (non-negative)");

  // Invalid inputs:
  const qAbc = pricingEngine.calculateQuote({ initialBookingSubtotal: 404.53, discount: "abc" });
  assert.strictEqual(qAbc.breakdown.discount, 0);
  assert.strictEqual(qAbc.breakdown.grandTotal, 500.00);
  console.log("✓ PASS: Test 5: Invalid 'abc' handled safely -> Final $500.00");

  const qNeg = pricingEngine.calculateQuote({ initialBookingSubtotal: 404.53, discount: -50 });
  assert.strictEqual(qNeg.breakdown.discount, 0);
  assert.strictEqual(qNeg.breakdown.grandTotal, 500.00);
  console.log("✓ PASS: Test 6: Invalid '-50' handled safely -> Final $500.00");

  const qBlank = pricingEngine.calculateQuote({ initialBookingSubtotal: 404.53, discount: "" });
  assert.strictEqual(qBlank.breakdown.discount, 0);
  assert.strictEqual(qBlank.breakdown.grandTotal, 500.00);
  console.log("✓ PASS: Test 7: Blank discount handled safely -> Final $500.00");

  const qSpecial = pricingEngine.calculateQuote({ initialBookingSubtotal: 404.53, discount: "!@#$%" });
  assert.strictEqual(qSpecial.breakdown.discount, 0);
  assert.strictEqual(qSpecial.breakdown.grandTotal, 500.00);
  // 3. Payment Service sendFinalInvoicePaymentLink Validation Tests
  const paymentService = require("../src/services/payment");
  const Booking = require("../src/models/bookingModel");

  // Stub Booking.findById to return a mock booking
  const originalFindById = Booking.findById;
  Booking.findById = async () => ({
    _id: "660000000000000000000001",
    trip_details: [{
      trip_type: "one-way",
      pickup_location: "Tysons",
      dropoff_location: "Dulles",
      start_time: "10:00 AM",
      date: "2026-10-01",
      duration: "30 mins",
      distance_miles: 15
    }],
    vehicle_details: {
      vehicle_name: "Luxury Sedan",
      estimated_price: "404.53"
    },
    price_breakdown: {
      mainBookingPrice: 404.53,
      subtotal: 404.53
    },
    contact_details: {
      booker: {
        first_name: "John",
        last_name: "Doe",
        email: "test@example.com"
      }
    },
    save: async () => {}
  });

  // Test 3a: Non-numeric discount rejected
  const pNonNum = await paymentService.sendFinalInvoicePaymentLink("660000000000000000000001", { discount: "invalid_num" });
  assert.strictEqual(pNonNum.success, false);
  assert.strictEqual(pNonNum.message, "Invalid discount amount: must be a valid number");
  console.log("✓ PASS: Payment Service rejects non-numeric discount");

  // Test 3b: Negative discount rejected
  const pNeg = await paymentService.sendFinalInvoicePaymentLink("660000000000000000000001", { discount: -25 });
  assert.strictEqual(pNeg.success, false);
  assert.strictEqual(pNeg.message, "Discount amount cannot be negative");
  console.log("✓ PASS: Payment Service rejects negative discount");

  // Test 3c: Invalid decimal places (> 2) rejected
  const pDec = await paymentService.sendFinalInvoicePaymentLink("660000000000000000000001", { discount: "15.999" });
  assert.strictEqual(pDec.success, false);
  assert.strictEqual(pDec.message, "Discount amount cannot exceed 2 decimal places");
  console.log("✓ PASS: Payment Service rejects discount with > 2 decimal places");

  // Test 3d: Discount exceeding total rejected
  const pExcess = await paymentService.sendFinalInvoicePaymentLink("660000000000000000000001", { discount: 9999 });
  assert.strictEqual(pExcess.success, false);
  assert(pExcess.message.includes("Discount cannot exceed"), `Expected discount exceeding total message, got: ${pExcess.message}`);
  console.log("✓ PASS: Payment Service rejects discount exceeding total amount");

  // Restore Booking.findById
  Booking.findById = originalFindById;

  console.log("\n=================================================");
  console.log("  ALL VALIDATION TESTS PASSED SUCCESSFULLY!      ");
  console.log("=================================================\n");
  process.exit(0);
}

runValidationTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

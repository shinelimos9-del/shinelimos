/**
 * Automated QA Test Suite for Instant Quote Pricing Engine
 * ShineLimos LLC - Full Rule Verification & Loop Audit
 */

const assert = require('assert');
const { calculateQuote, VEHICLE_RATES, getVehicleTierKey } = require('../src/utils/pricingEngine');

console.log("=================================================");
console.log("  RUNNING PRICING ENGINE AUTOMATED TEST SUITE   ");
console.log("=================================================\n");

let passedCount = 0;
let totalCount = 0;

function test(description, fn) {
  totalCount++;
  try {
    fn();
    passedCount++;
    console.log(`✓ PASS: ${description}`);
  } catch (err) {
    console.error(`✗ FAIL: ${description}`);
    console.error(`  Error: ${err.message}`);
    if (err.actual !== undefined && err.expected !== undefined) {
      console.error(`  Actual:   ${err.actual}`);
      console.error(`  Expected: ${err.expected}`);
    }
  }
}

// 1. SEDAN BASE, MILEAGE, TIME & MINIMUM FARE
test("Sedan Standard Trip Calculation", () => {
  // Trip: 10 miles, 20 minutes in Sedan
  // Base: 25, Mileage: 10 * 3.25 = 32.50, Time: 20 * 0.75 = 15.00
  // Subtotal: 25 + 32.50 + 15 = 72.50
  // Min Fare for Sedan: 75.00 -> Enforced!
  // Subtotal with Min Fare: 75.00
  // Gratuity 20%: 75 * 0.20 = 15.00
  // CC Fee 3%: (75 + 15) * 0.03 = 2.70
  // Grand Total: 75 + 15 + 2.70 = 92.70
  const quote = calculateQuote({
    vehicle: 'sedan',
    bookingType: 'one-way',
    distanceMiles: 10,
    durationMinutes: 20,
    pickupTime: '10:00 AM',
    pickupDate: '2026-06-15',
  });

  assert.strictEqual(quote.breakdown.baseFare, 25.00);
  assert.strictEqual(quote.breakdown.mileageCharge, 32.50);
  assert.strictEqual(quote.breakdown.timeCharge, 15.00);
  assert.strictEqual(quote.breakdown.rawSubtotal, 72.50);
  assert.strictEqual(quote.breakdown.subtotal, 75.00); // Minimum fare enforced
  assert.strictEqual(quote.breakdown.gratuity, 15.00);
  assert.strictEqual(quote.breakdown.creditCardFee, 2.70);
  assert.strictEqual(quote.breakdown.grandTotal, 92.70);
});

// 2. SUV STANDARD TRIP
test("SUV Standard Trip Calculation", () => {
  // Trip: 20 miles, 30 minutes in SUV
  // Base: 35, Mileage: 20 * 4.50 = 90.00, Time: 30 * 1.00 = 30.00
  // Subtotal: 35 + 90 + 30 = 155.00 (Exceeds min fare 110)
  // Gratuity 20%: 155 * 0.20 = 31.00
  // CC Fee 3%: (155 + 31) * 0.03 = 5.58
  // Grand Total: 155 + 31 + 5.58 = 191.58
  const quote = calculateQuote({
    vehicle: 'suv',
    bookingType: 'one-way',
    distanceMiles: 20,
    durationMinutes: 30,
    pickupTime: '14:00',
    pickupDate: '2026-06-15',
  });

  assert.strictEqual(quote.breakdown.baseFare, 35.00);
  assert.strictEqual(quote.breakdown.mileageCharge, 90.00);
  assert.strictEqual(quote.breakdown.timeCharge, 30.00);
  assert.strictEqual(quote.breakdown.subtotal, 155.00);
  assert.strictEqual(quote.breakdown.gratuity, 31.00);
  assert.strictEqual(quote.breakdown.creditCardFee, 5.58);
  assert.strictEqual(quote.breakdown.grandTotal, 191.58);
});

// 3. SPRINTER STANDARD TRIP
test("Sprinter Standard Trip Calculation", () => {
  // Trip: 15 miles, 40 minutes in Sprinter
  // Base: 75, Mileage: 15 * 7.00 = 105.00, Time: 40 * 1.50 = 60.00
  // Subtotal: 75 + 105 + 60 = 240.00
  // Min Fare for Sprinter: 250.00 -> Enforced!
  // Subtotal: 250.00
  // Gratuity 20%: 250 * 0.20 = 50.00
  // CC Fee 3%: (250 + 50) * 0.03 = 9.00
  // Grand Total: 250 + 50 + 9 = 309.00
  const quote = calculateQuote({
    vehicle: 'sprinter',
    bookingType: 'one-way',
    distanceMiles: 15,
    durationMinutes: 40,
    pickupTime: '11:00 AM',
    pickupDate: '2026-06-15',
  });

  assert.strictEqual(quote.breakdown.subtotal, 250.00);
  assert.strictEqual(quote.breakdown.gratuity, 50.00);
  assert.strictEqual(quote.breakdown.creditCardFee, 9.00);
  assert.strictEqual(quote.breakdown.grandTotal, 309.00);
});

// 4. AIRPORT PICKUP & MEET AND GREET
test("Airport Pickup Fees Across Tiers", () => {
  const sedanAirport = calculateQuote({ vehicle: 'sedan', pickupLocation: 'Dulles International Airport (IAD)' });
  assert.strictEqual(sedanAirport.breakdown.airportPickupFee, 15.00);
  assert.strictEqual(sedanAirport.meetAndGreetIncluded, true);

  const suvAirport = calculateQuote({ vehicle: 'suv', pickupLocation: 'Reagan National Airport (DCA)' });
  assert.strictEqual(suvAirport.breakdown.airportPickupFee, 20.00);
  assert.strictEqual(suvAirport.meetAndGreetIncluded, true);

  const sprinterAirport = calculateQuote({ vehicle: 'sprinter', flightInfo: { arrival: true, airline_flight_no: 'AA123' } });
  assert.strictEqual(sprinterAirport.breakdown.airportPickupFee, 25.00);
  assert.strictEqual(sprinterAirport.meetAndGreetIncluded, true);
});

// 5. WAITING TIME RULES (First 15 mins FREE)
test("Waiting Time Rules & Rates", () => {
  // 15 mins wait -> $0 charge
  const wait15 = calculateQuote({ vehicle: 'sedan', waitingMinutes: 15 });
  assert.strictEqual(wait15.breakdown.chargeableWaitMins, 0);
  assert.strictEqual(wait15.breakdown.waitingTimeFee, 0.00);

  // 25 mins wait Sedan -> (25 - 15) = 10 mins * $1.00 = $10.00
  const waitSedan = calculateQuote({ vehicle: 'sedan', waitingMinutes: 25 });
  assert.strictEqual(waitSedan.breakdown.chargeableWaitMins, 10);
  assert.strictEqual(waitSedan.breakdown.waitingTimeFee, 10.00);

  // 35 mins wait SUV -> (35 - 15) = 20 mins * $1.50 = $30.00
  const waitSuv = calculateQuote({ vehicle: 'suv', waitingMinutes: 35 });
  assert.strictEqual(waitSuv.breakdown.chargeableWaitMins, 20);
  assert.strictEqual(waitSuv.breakdown.waitingTimeFee, 30.00);

  // 45 mins wait Sprinter -> (45 - 15) = 30 mins * $2.00 = $60.00
  const waitSprinter = calculateQuote({ vehicle: 'sprinter', waitingMinutes: 45 });
  assert.strictEqual(waitSprinter.breakdown.chargeableWaitMins, 30);
  assert.strictEqual(waitSprinter.breakdown.waitingTimeFee, 60.00);
});

// 6. CHILD SEAT RULES (Seat 1 FREE, Seat 2+ $15 each)
test("Child Seat Rules", () => {
  const seat1 = calculateQuote({ vehicle: 'sedan', childSeatsCount: 1 });
  assert.strictEqual(seat1.breakdown.childSeatsFee, 0.00);

  const seat2 = calculateQuote({ vehicle: 'sedan', childSeatsCount: 2 });
  assert.strictEqual(seat2.breakdown.childSeatsFee, 15.00);

  const seat3 = calculateQuote({ vehicle: 'suv', childSeatsCount: 3 });
  assert.strictEqual(seat3.breakdown.childSeatsFee, 30.00);
});

// 7. HOURLY BOOKINGS & MINIMUM HOURS ENFORCEMENT
test("Hourly Booking Minimum Hours Enforcement", () => {
  // Sedan min 2 hours: User requests 1 hour -> 2 hours billed @ $75/hr = $150 subtotal
  const hourlySedan1 = calculateQuote({ vehicle: 'sedan', bookingType: 'hourly', durationHours: 1 });
  assert.strictEqual(hourlySedan1.billedHours, 2);
  assert.strictEqual(hourlySedan1.breakdown.hourlyCharge, 150.00);
  assert.strictEqual(hourlySedan1.breakdown.subtotal, 150.00);

  // SUV min 2 hours: User requests 4 hours -> 4 hours billed @ $95/hr = $380 subtotal
  const hourlySuv4 = calculateQuote({ vehicle: 'suv', bookingType: 'hourly', durationHours: 4 });
  assert.strictEqual(hourlySuv4.billedHours, 4);
  assert.strictEqual(hourlySuv4.breakdown.hourlyCharge, 380.00);
  assert.strictEqual(hourlySuv4.breakdown.subtotal, 380.00);

  // Sprinter min 3 hours: User requests 1 hour -> 3 hours billed @ $150/hr = $450 subtotal
  const hourlySprinter1 = calculateQuote({ vehicle: 'sprinter', bookingType: 'hourly', durationHours: 1 });
  assert.strictEqual(hourlySprinter1.billedHours, 3);
  assert.strictEqual(hourlySprinter1.breakdown.hourlyCharge, 450.00);
  assert.strictEqual(hourlySprinter1.breakdown.subtotal, 450.00);
});

// 8. LATE NIGHT SURCHARGE (12 AM - 5 AM -> 15%)
test("Late Night Surcharge (15%)", () => {
  const lateNight = calculateQuote({
    vehicle: 'suv',
    bookingType: 'one-way',
    distanceMiles: 20,
    durationMinutes: 30,
    pickupTime: '02:30 AM',
  });
  // Subtotal = 155.00
  // Late Night 15%: 155 * 0.15 = 23.25
  assert.strictEqual(lateNight.breakdown.subtotal, 155.00);
  assert.strictEqual(lateNight.breakdown.isLateNight, true);
  assert.strictEqual(lateNight.breakdown.lateNightSurcharge, 23.25);
  assert.strictEqual(lateNight.breakdown.subtotalWithSurcharges, 178.25);
});

// 9. HOLIDAY SURCHARGE (20%)
test("Holiday Surcharge (20%)", () => {
  const holiday = calculateQuote({
    vehicle: 'suv',
    bookingType: 'one-way',
    distanceMiles: 20,
    durationMinutes: 30,
    pickupTime: '12:00 PM',
    pickupDate: '2026-12-25', // Christmas
  });
  // Subtotal = 155.00
  // Holiday 20%: 155 * 0.20 = 31.00
  assert.strictEqual(holiday.breakdown.subtotal, 155.00);
  assert.strictEqual(holiday.breakdown.isHoliday, true);
  assert.strictEqual(holiday.breakdown.holidaySurcharge, 31.00);
  assert.strictEqual(holiday.breakdown.subtotalWithSurcharges, 186.00);
});

// 10. SIMULTANEOUS SURCHARGES & ALL FEES COMBINED
test("All Fees Combined Edge Case", () => {
  const superTrip = calculateQuote({
    vehicle: 'sprinter',
    bookingType: 'one-way',
    distanceMiles: 50,           // 50 * $7 = 350
    durationMinutes: 60,         // 60 * $1.50 = 90
    pickupLocation: 'Dulles Airport', // Airport Fee: $25
    pickupTime: '03:00 AM',      // Late Night 15%
    pickupDate: '2026-07-04',    // July 4th Holiday 20%
    waitingMinutes: 35,          // (35-15) = 20m * $2 = $40
    additionalStopsCount: 2,     // 2 * $30 = $60
    childSeatsCount: 3,          // (3-1) = 2 * $15 = $30
    hasCleaningFee: true,        // $150
    tolls: 15.00,                // $15
    parking: 20.00,              // $20
  });

  // Calculation Breakdown:
  // Base: 75
  // Mileage: 350
  // Time: 90
  // Airport: 25
  // Stops: 60
  // Waiting: 40
  // Child Seats: 30
  // Cleaning: 150
  // Tolls: 15
  // Parking: 20
  // Raw Subtotal = 75+350+90+25+60+40+30+150+15+20 = 855.00 (Exceeds min fare 250)
  // Late Night 15%: 855 * 0.15 = 128.25
  // Holiday 20%: 855 * 0.20 = 171.00
  // Subtotal with Surcharges = 855 + 128.25 + 171.00 = 1154.25
  // Gratuity 20%: 1154.25 * 0.20 = 230.85
  // CC Fee 3%: (1154.25 + 230.85) * 0.03 = 1385.10 * 0.03 = 41.55
  // Grand Total = 1154.25 + 230.85 + 41.55 = 1426.65

  assert.strictEqual(superTrip.breakdown.baseFare, 75.00);
  assert.strictEqual(superTrip.breakdown.mileageCharge, 350.00);
  assert.strictEqual(superTrip.breakdown.timeCharge, 90.00);
  assert.strictEqual(superTrip.breakdown.airportPickupFee, 25.00);
  assert.strictEqual(superTrip.breakdown.additionalStopsFee, 60.00);
  assert.strictEqual(superTrip.breakdown.waitingTimeFee, 40.00);
  assert.strictEqual(superTrip.breakdown.childSeatsFee, 30.00);
  assert.strictEqual(superTrip.breakdown.cleaningFee, 150.00);
  assert.strictEqual(superTrip.breakdown.tolls, 15.00);
  assert.strictEqual(superTrip.breakdown.parking, 20.00);
  assert.strictEqual(superTrip.breakdown.subtotal, 855.00);
  assert.strictEqual(superTrip.breakdown.lateNightSurcharge, 128.25);
  assert.strictEqual(superTrip.breakdown.holidaySurcharge, 171.00);
  assert.strictEqual(superTrip.breakdown.subtotalWithSurcharges, 1154.25);
  assert.strictEqual(superTrip.breakdown.gratuity, 230.85);
  assert.strictEqual(superTrip.breakdown.creditCardFee, 41.55);
  assert.strictEqual(superTrip.breakdown.grandTotal, 1426.65);
});

// 11. EDGE CASES (0 MILES, ZERO MINUTES, INVALID NUMBERS, NaN, FLOATING POINT)
test("Edge Cases & Robust Sanitization", () => {
  const zeroTrip = calculateQuote({
    vehicle: 'sedan',
    distanceMiles: 0,
    durationMinutes: 0,
    waitingMinutes: -5,
    tolls: NaN,
    parking: undefined,
  });

  // Base: 25, Mileage: 0, Time: 0 -> Raw Subtotal = 25. Min Fare = 75 enforced!
  assert.strictEqual(zeroTrip.breakdown.rawSubtotal, 25.00);
  assert.strictEqual(zeroTrip.breakdown.subtotal, 75.00);
  assert.strictEqual(zeroTrip.breakdown.grandTotal, 92.70);
  assert.strictEqual(isNaN(zeroTrip.breakdown.grandTotal), false);
});

console.log("\n=================================================");
console.log(`  TEST RESULTS: ${passedCount} / ${totalCount} PASSED  `);
console.log("=================================================\n");

if (passedCount !== totalCount) {
  process.exit(1);
}

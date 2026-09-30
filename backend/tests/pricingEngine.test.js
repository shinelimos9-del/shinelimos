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

// 4. AIRPORT PICKUP & OPTIONAL MEET AND GREET
test("Airport Pickup Fees Across Tiers (Optional Meet & Greet)", () => {
  // Case A: Airport Location but Meet & Greet NOT selected -> $0 fee
  const sedanAirportNoMG = calculateQuote({ vehicle: 'sedan', pickupLocation: 'Dulles International Airport (IAD)' });
  assert.strictEqual(sedanAirportNoMG.breakdown.airportPickupFee, 0.00);
  assert.strictEqual(sedanAirportNoMG.meetAndGreetIncluded, false);

  const suvAirportNoMG = calculateQuote({ vehicle: 'suv', pickupLocation: 'Reagan National Airport (DCA)' });
  assert.strictEqual(suvAirportNoMG.breakdown.airportPickupFee, 0.00);
  assert.strictEqual(suvAirportNoMG.meetAndGreetIncluded, false);

  const sprinterAirportNoMG = calculateQuote({ vehicle: 'sprinter', flightInfo: { arrival: true, airline_flight_no: 'AA123', meet_and_greet: false } });
  assert.strictEqual(sprinterAirportNoMG.breakdown.airportPickupFee, 0.00);
  assert.strictEqual(sprinterAirportNoMG.meetAndGreetIncluded, false);

  // Case B: Airport Location with Meet & Greet selected -> Existing fee added
  const sedanAirportMG = calculateQuote({ vehicle: 'sedan', pickupLocation: 'Dulles International Airport (IAD)', meetAndGreet: true });
  assert.strictEqual(sedanAirportMG.breakdown.airportPickupFee, 15.00);
  assert.strictEqual(sedanAirportMG.meetAndGreetIncluded, true);

  const suvAirportMG = calculateQuote({ vehicle: 'suv', pickupLocation: 'Reagan National Airport (DCA)', meetAndGreet: true });
  assert.strictEqual(suvAirportMG.breakdown.airportPickupFee, 20.00);
  assert.strictEqual(suvAirportMG.meetAndGreetIncluded, true);

  const sprinterAirportMG = calculateQuote({ vehicle: 'sprinter', flightInfo: { arrival: true, airline_flight_no: 'AA123', meet_and_greet: true } });
  assert.strictEqual(sprinterAirportMG.breakdown.airportPickupFee, 25.00);
  assert.strictEqual(sprinterAirportMG.meetAndGreetIncluded, true);
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
    meetAndGreet: true,
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

// 12. ADMIN CUSTOM VEHICLE PRICING OVERRIDE
test("Admin Custom Vehicle Pricing Override", () => {
  const customVehicle = {
    vehicle_name: "Executive Sedan",
    vehicle_class_name: "Executive Sedan",
    price: {
      base_price: 50,
      price_per_minute: 1.5,
      price_per_mile: 7,
      price_per_hour: 85
    }
  };

  // Trip: 10 miles, 20 minutes with admin custom pricing
  // Base: 50, Mileage: 10 * 7 = 70.00, Time: 20 * 1.5 = 30.00
  // Raw Subtotal: 50 + 70 + 30 = 150.00
  const quote = calculateQuote({
    vehicle: customVehicle,
    bookingType: 'one-way',
    distanceMiles: 10,
    durationMinutes: 20,
    pickupTime: '10:00 AM',
    pickupDate: '2026-06-15',
  });

  assert.strictEqual(quote.breakdown.baseFare, 50.00);
  assert.strictEqual(quote.breakdown.mileageCharge, 70.00);
  assert.strictEqual(quote.breakdown.timeCharge, 30.00);
  assert.strictEqual(quote.breakdown.rawSubtotal, 150.00);
});

// 13. EXTENDED HOURLY DURATION (1 to 12 HOURS)
test("Extended Hourly Duration (1, 5, 6, 8, 12 Hours)", () => {
  // 1 hour Sedan (min 2 hours = 2 * $75 = $150)
  const h1 = calculateQuote({ vehicle: 'sedan', bookingType: 'hourly', durationHours: 1 });
  assert.strictEqual(h1.billedHours, 2);
  assert.strictEqual(h1.breakdown.hourlyCharge, 150.00);

  // 5 hours Sedan (5 * $75 = $375)
  const h5 = calculateQuote({ vehicle: 'sedan', bookingType: 'hourly', durationHours: 5 });
  assert.strictEqual(h5.billedHours, 5);
  assert.strictEqual(h5.breakdown.hourlyCharge, 375.00);

  // 6 hours Sedan (6 * $75 = $450)
  const h6 = calculateQuote({ vehicle: 'sedan', bookingType: 'hourly', durationHours: 6 });
  assert.strictEqual(h6.billedHours, 6);
  assert.strictEqual(h6.breakdown.hourlyCharge, 450.00);

  // 8 hours Sedan (8 * $75 = $600)
  const h8 = calculateQuote({ vehicle: 'sedan', bookingType: 'hourly', durationHours: 8 });
  assert.strictEqual(h8.billedHours, 8);
  assert.strictEqual(h8.breakdown.hourlyCharge, 600.00);

  // 12 hours Sedan (12 * $75 = $900)
  const h12 = calculateQuote({ vehicle: 'sedan', bookingType: 'hourly', durationHours: 12 });
  assert.strictEqual(h12.billedHours, 12);
  assert.strictEqual(h12.breakdown.hourlyCharge, 900.00);

  // Parse string durations like "6 hours", "8 hours", "12 hours"
  const h6Str = calculateQuote({ vehicle: 'sedan', bookingType: 'hourly', duration: "6 hours" });
  assert.strictEqual(h6Str.billedHours, 6);
  assert.strictEqual(h6Str.breakdown.hourlyCharge, 450.00);

  const h12Str = calculateQuote({ vehicle: 'sedan', bookingType: 'hourly', duration: "12 hours" });
  assert.strictEqual(h12Str.billedHours, 12);
  assert.strictEqual(h12Str.breakdown.hourlyCharge, 900.00);
});

// 14. CUSTOM DISCOUNT & ADJUSTED FINAL AMOUNT
test("Custom Amount & Discount Calculations", () => {
  // Use initialBookingSubtotal = 404.53 to create exactly $500.00 calculated total:
  // Subtotal = 404.53, Gratuity 20% = 80.91, Credit Card Fee 3% = 14.56, Grand Total = 500.00
  // Or test with initialBookingSubtotal = 500
  const baseQuote = calculateQuote({ initialBookingSubtotal: 500 });
  const calculated = baseQuote.breakdown.calculatedGrandTotal;
  assert.strictEqual(calculated, 618.00); // 500 + 100 gratuity + 18 card fee

  // Test with exactly 500 subtotal-to-total test
  // 1. No adjustment: discount = 0
  const noDiscount = calculateQuote({ initialBookingSubtotal: 500, discount: 0 });
  assert.strictEqual(noDiscount.breakdown.discount, 0);
  assert.strictEqual(noDiscount.breakdown.grandTotal, 618.00);

  // 2. Normal discount: discount = $50
  const normalDiscount = calculateQuote({ initialBookingSubtotal: 500, discount: 50 });
  assert.strictEqual(normalDiscount.breakdown.discount, 50.00);
  assert.strictEqual(normalDiscount.breakdown.grandTotal, 568.00); // 618.00 - 50.00
  assert.strictEqual(normalDiscount.breakdown.calculatedGrandTotal, 618.00);

  // 3. Decimal discount: discount = $25.50
  const decimalDiscount = calculateQuote({ initialBookingSubtotal: 500, discount: 25.50 });
  assert.strictEqual(decimalDiscount.breakdown.discount, 25.50);
  assert.strictEqual(decimalDiscount.breakdown.grandTotal, 592.50); // 618.00 - 25.50

  // 4. Excessive discount: discount = $700 on $618 total -> capped, never negative
  const excessiveDiscount = calculateQuote({ initialBookingSubtotal: 500, discount: 700 });
  assert.strictEqual(excessiveDiscount.breakdown.discount, 618.00);
  assert.strictEqual(excessiveDiscount.breakdown.grandTotal, 0.00);
  assert(excessiveDiscount.breakdown.grandTotal >= 0, "Grand total must never be negative");

  // 5. Invalid discount inputs: 'abc', -50, blank, special characters
  const strInvalid = calculateQuote({ initialBookingSubtotal: 500, discount: 'abc' });
  assert.strictEqual(strInvalid.breakdown.discount, 0);
  assert.strictEqual(strInvalid.breakdown.grandTotal, 618.00);

  const negInvalid = calculateQuote({ initialBookingSubtotal: 500, discount: -50 });
  assert.strictEqual(negInvalid.breakdown.discount, 0);
  assert.strictEqual(negInvalid.breakdown.grandTotal, 618.00);

  const blankInvalid = calculateQuote({ initialBookingSubtotal: 500, discount: '' });
  assert.strictEqual(blankInvalid.breakdown.discount, 0);
  assert.strictEqual(blankInvalid.breakdown.grandTotal, 618.00);

  const specialInvalid = calculateQuote({ initialBookingSubtotal: 500, discount: '$%#@' });
  assert.strictEqual(specialInvalid.breakdown.discount, 0);
  assert.strictEqual(specialInvalid.breakdown.grandTotal, 618.00);
});

// 15. OPTIONAL AIRPORT MEET & GREET BEHAVIOR
test("Optional Airport Meet & Greet Behavior Across All Scenarios", () => {
  // Scenario 1: Airport Booking + Meet & Greet = NO -> $0 fee, normal subtotal and total
  const airportNoMG = calculateQuote({
    vehicle: 'sedan',
    pickupLocation: 'Dulles International Airport (IAD)',
    distanceMiles: 20,
    durationMinutes: 30,
    meetAndGreet: false,
  });
  // Sedan base 25, 20 mi * 3.25 = 65, 30 min * 0.75 = 22.50 -> rawSubtotal = 112.50
  assert.strictEqual(airportNoMG.breakdown.airportPickupFee, 0.00);
  assert.strictEqual(airportNoMG.meetAndGreetIncluded, false);
  assert.strictEqual(airportNoMG.breakdown.subtotal, 112.50);
  // Gratuity 20% = 22.50, CC Fee 3% = (112.50 + 22.50) * 0.03 = 4.05 -> Grand Total = 139.05
  assert.strictEqual(airportNoMG.breakdown.grandTotal, 139.05);

  // Scenario 2: Airport Booking + Meet & Greet = YES -> Exact existing Meet & Greet fee added ($15.00 for Sedan)
  const airportWithMG = calculateQuote({
    vehicle: 'sedan',
    pickupLocation: 'Dulles International Airport (IAD)',
    distanceMiles: 20,
    durationMinutes: 30,
    meetAndGreet: true,
  });
  // Subtotal = 112.50 + 15.00 = 127.50
  assert.strictEqual(airportWithMG.breakdown.airportPickupFee, 15.00);
  assert.strictEqual(airportWithMG.meetAndGreetIncluded, true);
  assert.strictEqual(airportWithMG.breakdown.subtotal, 127.50);
  // Gratuity 20% = 25.50, CC Fee 3% = (127.50 + 25.50) * 0.03 = 4.59 -> Grand Total = 157.59
  assert.strictEqual(airportWithMG.breakdown.grandTotal, 157.59);

  // Scenario 3: SUV with and without Meet & Greet ($20.00 fee)
  const suvNoMG = calculateQuote({ vehicle: 'suv', initialBookingSubtotal: 500, meetAndGreet: false });
  assert.strictEqual(suvNoMG.breakdown.airportPickupFee, 0.00);
  assert.strictEqual(suvNoMG.breakdown.subtotal, 500.00);
  assert.strictEqual(suvNoMG.breakdown.grandTotal, 618.00);

  const suvWithMG = calculateQuote({ vehicle: 'suv', initialBookingSubtotal: 500, meetAndGreet: true });
  assert.strictEqual(suvWithMG.breakdown.airportPickupFee, 20.00);
  assert.strictEqual(suvWithMG.breakdown.subtotal, 520.00); // 500 + 20
  // Gratuity: 520 * 0.20 = 104, CC Fee: (520 + 104) * 0.03 = 18.72 -> Grand Total = 642.72
  assert.strictEqual(suvWithMG.breakdown.grandTotal, 642.72);

  // Scenario 4: Sprinter with and without Meet & Greet ($25.00 fee) via flightInfo.meet_and_greet
  const sprinterNoMG = calculateQuote({ vehicle: 'sprinter', initialBookingSubtotal: 500, flightInfo: { arrival: true, meet_and_greet: false } });
  assert.strictEqual(sprinterNoMG.breakdown.airportPickupFee, 0.00);
  assert.strictEqual(sprinterNoMG.breakdown.subtotal, 500.00);
  assert.strictEqual(sprinterNoMG.breakdown.grandTotal, 618.00);

  const sprinterWithMG = calculateQuote({ vehicle: 'sprinter', initialBookingSubtotal: 500, flightInfo: { arrival: true, meet_and_greet: true } });
  assert.strictEqual(sprinterWithMG.breakdown.airportPickupFee, 25.00);
  assert.strictEqual(sprinterWithMG.breakdown.subtotal, 525.00);
  // Gratuity: 525 * 0.20 = 105, CC Fee: (525 + 105) * 0.03 = 18.90 -> Grand Total = 648.90
  assert.strictEqual(sprinterWithMG.breakdown.grandTotal, 648.90);
});

console.log("\n=================================================");
console.log(`  TEST RESULTS: ${passedCount} / ${totalCount} PASSED  `);
console.log("=================================================\n");

if (passedCount !== totalCount) {
  process.exit(1);
}

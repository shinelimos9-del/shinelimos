/**
 * Instant Quote Pricing Engine - ShineLimos LLC
 * Pure, deterministic pricing module enforcing strict calculation order, minimum fares,
 * vehicle rates, airport fees, waiting time rules, child seats, surcharges, gratuity, and credit card processing fee.
 */

// Vehicle Rates Configuration
const VEHICLE_RATES = {
  sedan: {
    name: "Luxury Sedan",
    baseFare: 25.00,
    perMile: 3.25,
    perMinute: 0.75,
    minimumFare: 75.00,
    hourlyRate: 75.00,
    minimumHours: 2,
    airportFee: 15.00,
    waitingRatePerMin: 1.00,
    additionalStopRate: 15.00,
  },
  suv: {
    name: "Luxury SUV",
    baseFare: 35.00,
    perMile: 4.50,
    perMinute: 1.00,
    minimumFare: 110.00,
    hourlyRate: 95.00,
    minimumHours: 2,
    airportFee: 20.00,
    waitingRatePerMin: 1.50,
    additionalStopRate: 20.00,
  },
  sprinter: {
    name: "Mercedes Sprinter",
    baseFare: 75.00,
    perMile: 7.00,
    perMinute: 1.50,
    minimumFare: 250.00,
    hourlyRate: 150.00,
    minimumHours: 3,
    airportFee: 25.00,
    waitingRatePerMin: 2.00,
    additionalStopRate: 30.00,
  },
};

/**
 * Safely parse numeric value, guarding against NaN, Infinity, negative values
 */
function safeNumber(val, defaultVal = 0) {
  if (val === null || val === undefined || val === '') return defaultVal;
  const num = Number(val);
  if (isNaN(num) || !isFinite(num) || num < 0) return defaultVal;
  return num;
}

/**
 * Safely parse hours or duration value from string or number (e.g. "3 Hours" -> 3)
 */
function parseHours(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return safeNumber(val, 0);
  const str = String(val);
  const match = str.match(/(\d+(?:\.\d+)?)/);
  return match ? safeNumber(match[1], 0) : 0;
}

/**
 * Round number to exactly 2 decimal places to prevent floating point inaccuracies
 */
function round2(val) {
  const num = safeNumber(val, 0);
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Determine vehicle tier key ('sedan', 'suv', 'sprinter') from vehicle object or category name
 */
function getVehicleTierKey(vehicle) {
  if (!vehicle) return 'sedan';
  const name = String(vehicle.vehicle_name || vehicle.name || '').toLowerCase();
  const cat = String(vehicle.vehicle_class_name || vehicle.category || '').toLowerCase();
  const slug = String(vehicle.slug || vehicle._id || '').toLowerCase();

  const combined = `${name} ${cat} ${slug}`;

  if (combined.includes('sprinter') || combined.includes('bus') || combined.includes('coach') || combined.includes('30-pax') || combined.includes('50-pax')) {
    return 'sprinter';
  }
  if (combined.includes('suv') || combined.includes('escalade') || combined.includes('suburban') || combined.includes('navigator')) {
    return 'suv';
  }
  if (combined.includes('sedan') || combined.includes('s-class') || combined.includes('e-class') || combined.includes('executive')) {
    return 'sedan';
  }

  // Fallback by capacity if available
  const capacity = safeNumber(vehicle.passenger_capacity || vehicle.passengers, 3);
  if (capacity > 7) return 'sprinter';
  if (capacity > 4) return 'suv';
  return 'sedan';
}

/**
 * Check if pick-up address or details indicate an airport pickup
 */
function isAirportPickup(pickupLoc, flightInfo, occasion) {
  if (occasion && String(occasion).toLowerCase().includes('airport')) return true;
  if (flightInfo && (flightInfo.arrival || flightInfo.airline_flight_no)) return true;
  
  const loc = String(pickupLoc || '').toLowerCase();
  const airportKeywords = [
    'airport', 'iad', 'dca', 'bwi', 'dulles', 'reagan', 'national airport',
    'thurgood', 'terminal', 'concourse', 'baggage claim', 'flight'
  ];
  return airportKeywords.some(kw => loc.includes(kw));
}

/**
 * Check if pickup time falls between 12:00 AM (00:00) and 5:00 AM (05:00)
 */
function isLateNightTime(timeStr) {
  if (!timeStr) return false;
  // Handle 24h format (e.g. "01:30" or "04:00") or 12h format (e.g. "02:15 AM", "12:30 AM")
  const str = String(timeStr).trim().toUpperCase();

  // If 12h format
  if (str.includes('AM') || str.includes('PM')) {
    const isAM = str.includes('AM');
    const matches = str.match(/(\d+):(\d+)/);
    if (!matches) return false;
    let hour = parseInt(matches[1], 10);
    if (isAM && hour === 12) hour = 0; // 12:xx AM is 00:xx
    if (!isAM && hour !== 12) hour += 12; // PM
    return hour >= 0 && hour < 5;
  }

  // If 24h format (e.g., "03:45")
  const matches = str.match(/(\d+):(\d+)/);
  if (matches) {
    const hour = parseInt(matches[1], 10);
    return hour >= 0 && hour < 5;
  }

  return false;
}

/**
 * Check if pickup date is a US federal holiday or marked as holiday
 */
function isHolidayDate(dateStr, explicitIsHoliday = false) {
  if (explicitIsHoliday) return true;
  if (!dateStr) return false;

  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return false;

  const month = dateObj.getUTCMonth() + 1; // 1 - 12
  const day = dateObj.getUTCDate();

  // Fixed date holidays
  if (month === 1 && day === 1) return true;   // New Year's Day (Jan 1)
  if (month === 7 && day === 4) return true;   // Independence Day (Jul 4)
  if (month === 11 && day === 11) return true; // Veterans Day (Nov 11)
  if (month === 12 && day === 25) return true; // Christmas Day (Dec 25)
  if (month === 12 && day === 31) return true; // New Year's Eve (Dec 31)

  return false;
}

/**
 * Helper to parse hours from duration string or number
 */
function parseHours(durationStrOrNum) {
  if (typeof durationStrOrNum === 'number') return safeNumber(durationStrOrNum, 0);
  if (!durationStrOrNum) return 0;
  const str = String(durationStrOrNum);
  const match = str.match(/(\d+(?:\.\d+)?)/);
  return match ? safeNumber(parseFloat(match[1]), 0) : 0;
}

/**
 * Main Pricing Engine Calculation Function
 *
 * @param {Object} options Calculation parameters:
 *   - vehicle: Object vehicle or vehicle tier string ('sedan'|'suv'|'sprinter')
 *   - bookingType: 'one-way' | 'round-trip' | 'hourly' | 'airport' | 'as-directed' | 'point-to-point'
 *   - distanceMiles: number
 *   - durationMinutes: number
 *   - durationHours: number
 *   - pickupLocation: string
 *   - pickupTime: string (e.g. "02:30 AM" or "14:00")
 *   - pickupDate: string (e.g. "2026-12-25")
 *   - flightInfo: Object
 *   - occasion: string
 *   - waitingMinutes: number
 *   - additionalStopsCount: number
 *   - childSeatsCount: number
 *   - hasCleaningFee: boolean
 *   - cleaningFeeAmount: number
 *   - tolls: number
 *   - parking: number
 *   - isHoliday: boolean
 *   - isLateNight: boolean
 * @returns {Object} Full itemized breakdown and grand total
 */
function calculateQuote(options = {}) {
  const tierKey = typeof options.vehicle === 'string' ? options.vehicle : getVehicleTierKey(options.vehicle);
  const defaultRates = VEHICLE_RATES[tierKey] || VEHICLE_RATES.sedan;

  // Database pricing rates with fallback to tier defaults
  const rates = {
    name: options.vehicle?.vehicle_name || options.vehicle?.name || defaultRates.name,
    baseFare: safeNumber(options.vehicle?.price_snapshot?.base_price ?? options.vehicle?.base_price, defaultRates.baseFare),
    perMile: safeNumber(options.vehicle?.price_snapshot?.price_per_mile ?? options.vehicle?.price_per_mile, defaultRates.perMile),
    perMinute: safeNumber(options.vehicle?.price_snapshot?.price_per_minute ?? options.vehicle?.price_per_minute, defaultRates.perMinute),
    minimumFare: safeNumber(options.vehicle?.price_snapshot?.minimum_fare ?? options.vehicle?.minimum_fare, defaultRates.minimumFare),
    hourlyRate: safeNumber(options.vehicle?.price_snapshot?.price_per_hour ?? options.vehicle?.price_per_hour, defaultRates.hourlyRate),
    minimumHours: defaultRates.minimumHours,
    airportFee: defaultRates.airportFee,
    waitingRatePerMin: defaultRates.waitingRatePerMin,
    additionalStopRate: defaultRates.additionalStopRate,
  };

  const rawBookingType = String(options.bookingType || options.type || 'one-way').toLowerCase();
  const isHourly = rawBookingType === 'hourly' || rawBookingType === 'as-directed' || rawBookingType === 'as directed';
  const isRoundTrip = rawBookingType === 'round-trip' || rawBookingType === 'round trip';

  // Check if an initial main booking price from DB is provided!
  const hasInitialBookingPrice = options.initialBookingSubtotal !== undefined && options.initialBookingSubtotal !== null && safeNumber(options.initialBookingSubtotal, 0) > 0;

  let baseFare = 0;
  let mileageCharge = 0;
  let timeCharge = 0;
  let hourlyCharge = 0;
  let billedHours = 0;
  let minimumFareAdjustment = 0;
  let mainBookingPrice = 0;

  if (hasInitialBookingPrice) {
    // USE STORED MAIN BOOKING PRICE FROM DATABASE CREATION TIME
    mainBookingPrice = safeNumber(options.initialBookingSubtotal, 0);
    baseFare = mainBookingPrice;
  } else {
    // Standalone quote calculation for fresh quote widget
    const distanceMiles = safeNumber(options.distanceMiles, 0);
    const durationMinutes = safeNumber(options.durationMinutes, 0);

    baseFare = isHourly ? 0 : rates.baseFare;
    let effectiveMiles = isRoundTrip ? distanceMiles * 2 : distanceMiles;
    mileageCharge = isHourly ? 0 : round2(effectiveMiles * rates.perMile);

    if (isHourly) {
      const inputHours = parseHours(options.durationHours || options.duration);
      billedHours = Math.max(rates.minimumHours, inputHours > 0 ? Math.ceil(inputHours) : rates.minimumHours);
      hourlyCharge = round2(billedHours * rates.hourlyRate);
    } else {
      timeCharge = round2(durationMinutes * rates.perMinute);
    }

    let rawSubtotal = baseFare + mileageCharge + timeCharge + hourlyCharge;
    if (!isHourly && rawSubtotal < rates.minimumFare) {
      minimumFareAdjustment = round2(rates.minimumFare - rawSubtotal);
    }
    mainBookingPrice = rawSubtotal + minimumFareAdjustment;
  }

  // 4. Airport Pickup Fee
  const isAirport = isAirportPickup(options.pickupLocation, options.flightInfo, options.occasion);
  const airportPickupFee = isAirport ? rates.airportFee : 0;

  // 5. Additional Stops Fee
  const stopsCount = safeNumber(options.additionalStopsCount || options.stopsCount, 0);
  const additionalStopsFee = round2(stopsCount * rates.additionalStopRate);

  // 6. Waiting Time Fee
  const totalWaitMins = safeNumber(options.waitingMinutes, 0);
  const chargeableWaitMins = Math.max(0, totalWaitMins - 15);
  const waitingTimeFee = round2(chargeableWaitMins * rates.waitingRatePerMin);

  // 7. Child Seats Fee
  const childSeats = safeNumber(options.childSeatsCount || options.childSeats, 0);
  const chargeableChildSeats = Math.max(0, childSeats - 1);
  const childSeatsFee = round2(chargeableChildSeats * 15.00);

  // 8. Cleaning Fee
  const hasCleaning = Boolean(options.hasCleaningFee);
  const cleaningFee = hasCleaning ? Math.max(150.00, safeNumber(options.cleaningFeeAmount, 150.00)) : 0;

  // 9. Tolls & Parking
  const tolls = safeNumber(options.tolls, 0);
  const parking = safeNumber(options.parking, 0);

  // Subtotal = Main Booking Price + Extra Charges
  const subtotal = round2(
    mainBookingPrice +
    airportPickupFee +
    additionalStopsFee +
    waitingTimeFee +
    childSeatsFee +
    cleaningFee +
    tolls +
    parking
  );

  // 10. Late Night & Holiday Surcharges
  const lateNight = options.isLateNight !== undefined ? Boolean(options.isLateNight) : isLateNightTime(options.pickupTime);
  const holiday = options.isHoliday !== undefined ? Boolean(options.isHoliday) : isHolidayDate(options.pickupDate, options.isHoliday);

  const lateNightSurcharge = lateNight ? round2(subtotal * 0.15) : 0;
  const holidaySurcharge = holiday ? round2(subtotal * 0.20) : 0;
  const subtotalWithSurcharges = round2(subtotal + lateNightSurcharge + holidaySurcharge);

  // 11. Gratuity (20%)
  const gratuity = round2(subtotalWithSurcharges * 0.20);

  // 12. Credit Card Fee (3%)
  const creditCardFee = round2((subtotalWithSurcharges + gratuity) * 0.03);

  // 13. Grand Total
  const grandTotal = round2(subtotalWithSurcharges + gratuity + creditCardFee);

  return {
    vehicleTier: tierKey,
    vehicleName: rates.name,
    isHourly,
    isRoundTrip,
    isAirportPickup: isAirport,
    meetAndGreetIncluded: isAirport,
    billedHours,
    breakdown: {
      mainBookingPrice,
      baseFare,
      mileageCharge,
      effectiveMiles: isRoundTrip ? safeNumber(options.distanceMiles, 0) * 2 : safeNumber(options.distanceMiles, 0),
      timeCharge,
      hourlyCharge,
      airportPickupFee,
      additionalStopsFee,
      stopsCount,
      waitingTimeFee,
      totalWaitMins,
      chargeableWaitMins,
      childSeatsFee,
      childSeatsCount: childSeats,
      cleaningFee,
      tolls,
      parking,
      minimumFare: rates.minimumFare,
      minimumFareAdjustment,
      subtotal,
      lateNightSurcharge,
      isLateNight: lateNight,
      holidaySurcharge,
      isHoliday: holiday,
      subtotalWithSurcharges,
      gratuity,
      creditCardFee,
      grandTotal,
    },
    formattedGrandTotal: grandTotal.toFixed(2),
  };
}

module.exports = {
  VEHICLE_RATES,
  getVehicleTierKey,
  calculateQuote,
  round2,
  safeNumber,
  parseHours,
  isAirportPickup,
  isLateNightTime,
  isHolidayDate,
};

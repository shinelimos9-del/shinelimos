// Phase 3 — final-receipt PDF attached to the customer's final invoice
// email (Moovs-style: whole trip info + price summary in one document).
// Pure pdfkit (no browser, no new system dependency). The PDF mirrors
// exactly the itemized breakdown the final invoice email shows — no
// invented lines, no pricing math here; the caller passes quote.breakdown.
// If the vehicle photo cannot be fetched, the PDF is still generated
// without a photo rather than failing the email.
const PDFDocument = require("pdfkit");
const axios = require("axios");
const { displayConfirmationCode, formatTripDateEastern } = require("../utils/confirmationCode");

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

// Vehicle photo source, in order: the snapshot stored on the booking
// (vehicle_details.image, set at booking time), then a populated
// vehicle record's image, then its first gallery image. Returns a
// Buffer or null — never throws.
async function fetchVehiclePhotoBuffer(booking) {
  const vehicle = (booking && booking.vehicle_details) || {};
  const populated = vehicle.vehicle_id && typeof vehicle.vehicle_id === "object" ? vehicle.vehicle_id : null;
  const url = vehicle.image
    || (populated && populated.image)
    || (populated && Array.isArray(populated.images) && populated.images[0])
    || (Array.isArray(vehicle.images) && vehicle.images[0])
    || null;
  if (!url || typeof url !== "string") return null;
  try {
    const response = await axios.get(url, { responseType: "arraybuffer", timeout: 8000 });
    if (response && response.data) {
      const buffer = Buffer.from(response.data);
      // Reject non-image downloads (e.g. an HTML error page served for a
      // dead Cloudinary URL) before pdfkit ever sees them.
      const isJpeg = buffer.length > 2 && buffer[0] === 0xff && buffer[1] === 0xd8;
      const isPng = buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      const isGif = buffer.length > 3 && buffer.toString("ascii", 0, 3) === "GIF";
      const isWebp = buffer.length > 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
      if (isJpeg || isPng || isGif || isWebp) return buffer;
      console.error("receiptPdf: vehicle photo URL did not return an image, continuing without photo");
    }
  } catch (error) {
    console.error("receiptPdf: vehicle photo fetch failed, continuing without photo:", error.message);
  }
  return null;
}

// Itemized lines in the same order as the final invoice email, only
// lines with a positive amount (plus subtotal and grand total always).
function breakdownLines(b) {
  const lines = [];
  const add = (label, amount) => { if (amount > 0) lines.push([label, money(amount)]); };
  add("Base Fare", b.baseFare);
  if (b.mileageCharge > 0) add(`Mileage Charge (${Number(b.effectiveMiles || 0).toFixed(1)} miles)`, b.mileageCharge);
  if (b.hourlyCharge > 0) add(`Hourly Charge (${b.billedHours} hrs)`, b.hourlyCharge);
  add("Airport Meet & Greet Fee", b.airportPickupFee);
  if (b.additionalStopsFee > 0) add(`Additional Stops (${b.stopsCount})`, b.additionalStopsFee);
  if (b.waitingTimeFee > 0) add(`Waiting Time (${b.totalWaitMins} mins, ${b.chargeableWaitMins} chargeable)`, b.waitingTimeFee);
  if (b.childSeatsFee > 0) add(`Child Seats (${b.childSeatsCount})`, b.childSeatsFee);
  add("Cleaning Fee", b.cleaningFee);
  add("Tolls", b.tolls);
  add("Parking", b.parking);
  add("Minimum Fare Adjustment", b.minimumFareAdjustment);
  lines.push(["Subtotal", money(b.subtotal)]);
  add("Late Night Surcharge (15%)", b.lateNightSurcharge);
  add("Holiday Surcharge (20%)", b.holidaySurcharge);
  add("Gratuity (20%)", b.gratuity);
  lines.push(["Credit Card Fee (3%)", money(b.creditCardFee)]);
  if (b.discount > 0) lines.push(["Discount", `-${money(b.discount)}`]);
  return lines;
}

// Returns a Promise<Buffer> of the finished PDF.
async function buildReceiptPdf({ booking, quote, paymentUrl }) {
  const trip = (booking.trip_details && booking.trip_details[0]) || {};
  const booker = (booking.contact_details && booking.contact_details.booker) || {};
  const passenger = (booking.contact_details && booking.contact_details.passenger) || {};
  const passengerName = [passenger.first_name, passenger.last_name].filter(Boolean).join(" ")
    || [booker.first_name, booker.last_name].filter(Boolean).join(" ") || "Valued Customer";
  const code = displayConfirmationCode(booking);
  const breakdown = (quote && quote.breakdown) || {};
  const driverName = booking.driver_details && booking.driver_details.driver_name;
  const driverPhone = booking.driver_details && booking.driver_details.driver_phone;
  const photoBuffer = await fetchVehiclePhotoBuffer(booking);

  return new Promise((resolve, reject) => {
    // compress: false keeps the text streams searchable (and the file
    // easy to verify) at a negligible size cost for a one-page receipt.
    const doc = new PDFDocument({ margin: 50, size: "A4", compress: false });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(22).text("SHINE LIMOS", { align: "center" });
    doc.fontSize(13).text("Final Trip Receipt", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).text(`Confirmation #${code}`, { align: "center" });
    doc.moveDown(1);

    if (photoBuffer) {
      try {
        doc.image(photoBuffer, { fit: [480, 240], align: "center" });
        doc.moveDown(1);
      } catch (error) {
        console.error("receiptPdf: could not embed vehicle photo:", error.message);
      }
    }

    const field = (label, value) => {
      if (value === undefined || value === null || value === "") return;
      doc.fontSize(12).text(`${label}: ${value}`);
    };
    doc.fontSize(14).text("Trip Details");
    field("Passenger", passengerName);
    field("Vehicle", booking.vehicle_details && booking.vehicle_details.vehicle_name);
    field("Pickup", trip.pickup_location);
    field("Drop-off", trip.dropoff_location);
    field("Date", formatTripDateEastern(trip.date));
    field("Time", trip.start_time);
    if (driverName) field("Chauffeur", driverName);
    if (driverPhone) field("Chauffeur phone", driverPhone);
    if (booking.special_requests) field("Notes", booking.special_requests);
    doc.moveDown(1);

    doc.fontSize(14).text("Price Summary");
    for (const [label, amount] of breakdownLines(breakdown)) {
      doc.fontSize(12).text(`${label}: ${amount}`);
    }
    doc.fontSize(14).text(`Grand Total Due: ${money(breakdown.grandTotal)}`);
    doc.moveDown(1);

    if (paymentUrl) {
      doc.fontSize(12).text("Pay this invoice:");
      doc.fontSize(11).text(paymentUrl);
    }
    doc.moveDown(1);
    doc.fontSize(10).text("Thank you for traveling with Shine Limos. We look forward to hosting you again soon!");
    doc.fontSize(10).text("Shine Limos LLC  |  (202) 951-7172  |  shinelimos.com");
    doc.end();
  });
}

module.exports = { buildReceiptPdf, formatTripDateEastern, breakdownLines, fetchVehiclePhotoBuffer };

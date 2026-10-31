// Phase 3 — final-receipt PDF attached to the customer's final invoice
// email (Moovs-style: whole trip info + price summary in one document).
// Pure pdfkit (no browser, no new system dependency). The PDF mirrors
// exactly the itemized breakdown the final invoice email shows — no
// invented lines, no pricing math here; the caller passes quote.breakdown.
//
// Phase 3.1 (Amjad, Oct 31): NO vehicle photo and NO payment link in
// the PDF — the email already has the pay button, and the receipt is
// meant to be a clean document. The PDF contains NO clickable links at
// all (contact details are plain text only). The top carries the Shine
// Limos logo only: the official white artwork (shinelimos/public/logo/
// logo.webp) is invisible on a white page, so it is committed as a PNG
// at backend/assets/shine-limos-logo.png and drawn on a black header
// band. If that file is missing at runtime, the header falls back to
// plain "SHINE LIMOS" text — never a failed PDF or email.
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { displayConfirmationCode, formatTripDateEastern } = require("../utils/confirmationCode");

const LOGO_PATH = path.join(__dirname, "..", "..", "assets", "shine-limos-logo.png");

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

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
async function buildReceiptPdf({ booking, quote }) {
  const trip = (booking.trip_details && booking.trip_details[0]) || {};
  const booker = (booking.contact_details && booking.contact_details.booker) || {};
  const passenger = (booking.contact_details && booking.contact_details.passenger) || {};
  const passengerName = [passenger.first_name, passenger.last_name].filter(Boolean).join(" ")
    || [booker.first_name, booker.last_name].filter(Boolean).join(" ") || "Valued Customer";
  const code = displayConfirmationCode(booking);
  const breakdown = (quote && quote.breakdown) || {};
  const driverName = booking.driver_details && booking.driver_details.driver_name;
  const driverPhone = booking.driver_details && booking.driver_details.driver_phone;

  return new Promise((resolve, reject) => {
    // compress: false keeps the text streams searchable (and the file
    // easy to verify) at a negligible size cost for a one-page receipt.
    const doc = new PDFDocument({ margin: 50, size: "A4", compress: false });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Black header band with the logo only (no photo, no links anywhere
    // in this PDF). The logo is white artwork, so it needs the dark band
    // to be visible. Missing/unreadable logo -> plain-text header.
    const pageWidth = doc.page.width;
    doc.rect(0, 0, pageWidth, 110).fill("#111111");
    let logoDrawn = false;
    try {
      if (fs.existsSync(LOGO_PATH)) {
        doc.image(LOGO_PATH, (pageWidth - 180) / 2, 28, { width: 180 });
        logoDrawn = true;
      }
    } catch (error) {
      console.error("receiptPdf: could not embed logo, falling back to text header:", error.message);
    }
    if (!logoDrawn) {
      doc.fillColor("#ffffff").fontSize(22).text("SHINE LIMOS", 0, 38, { align: "center" });
    }
    doc.fillColor("#000000");
    doc.y = 130;
    doc.fontSize(13).text("Final Trip Receipt", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).text(`Confirmation #${code}`, { align: "center" });
    doc.moveDown(1);

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

    // Phase 3.1: no payment link in the PDF — the email carries the pay
    // button. Contact details below are plain text, not clickable links.
    doc.fontSize(10).text("Thank you for traveling with Shine Limos. We look forward to hosting you again soon!");
    doc.fontSize(10).text("Shine Limos LLC  |  (202) 951-7172  |  shinelimos.com");
    doc.end();
  });
}

module.exports = { buildReceiptPdf, formatTripDateEastern, breakdownLines, LOGO_PATH };

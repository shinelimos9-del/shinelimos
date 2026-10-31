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
//
// Phase 3.2 (Amjad, Oct 31): structure rebuilt to mirror the Moovs
// receipt Amjad sent (Reservation_ZE34.pdf): a prominent confirmation
// header, a structured Booking Contact + Trip Details table, a proper
// two-column Price Summary table, and a Payments section. Still no
// photo, no payment link, no hyperlinks anywhere in the PDF.
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

// Display-only: "one-way" -> "One Way", "hourly" -> "Hourly".
const prettyTripType = (t) => (t || "")
  .replace(/[-_]+/g, " ")
  .replace(/\b\w/g, (c) => c.toUpperCase());

// Payments (Phase 3.2): the final invoice email is a payment REQUEST
// for the full grand total — it is generated (and its Stripe session
// created) before any payment for this invoice exists, and the code has
// no logic crediting earlier initial-link payments against it. So there
// is no reliable paid-against-this-invoice figure at generation time:
// Amount Paid is $0.00 and Amount Due is the grand total, exactly as
// in the Moovs example (Amount Paid $0.00, Amount Due = total). Never
// a negative due, never an invented paid amount.
const paymentsFor = (breakdown) => ({
  amountPaid: money(0),
  amountDue: money(Math.max(0, Number(breakdown.grandTotal || 0))),
});

// Returns a Promise<Buffer> of the finished PDF.
async function buildReceiptPdf({ booking, quote }) {
  const trip = (booking.trip_details && booking.trip_details[0]) || {};
  const booker = (booking.contact_details && booking.contact_details.booker) || {};
  const passenger = (booking.contact_details && booking.contact_details.passenger) || {};
  const bookerName = [booker.first_name, booker.last_name].filter(Boolean).join(" ");
  const passengerName = [passenger.first_name, passenger.last_name].filter(Boolean).join(" ")
    || bookerName || "Valued Customer";
  const code = displayConfirmationCode(booking);
  const breakdown = (quote && quote.breakdown) || {};
  const driverName = booking.driver_details && booking.driver_details.driver_name;
  const driverPhone = booking.driver_details && booking.driver_details.driver_phone;
  const payments = paymentsFor(breakdown);
  const pickupDateTime = [formatTripDateEastern(trip.date), trip.start_time].filter(Boolean).join(" at ");

  return new Promise((resolve, reject) => {
    // compress: false keeps the text streams searchable (and the file
    // easy to verify) at a negligible size cost for a short receipt.
    const doc = new PDFDocument({ margin: 50, size: "A4", compress: false });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const left = 50;
    const right = pageWidth - 50;
    const contentWidth = right - left;

    // Black header band with the logo only (no photo, no links anywhere
    // in this PDF). The logo is white artwork, so it needs the dark band
    // to be visible. Missing/unreadable logo -> plain-text header.
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
      doc.fillColor("#ffffff").fontSize(22).font("Helvetica-Bold").text("SHINE LIMOS", 0, 38, { align: "center" });
    }
    doc.fillColor("#000000");
    doc.y = 130;

    // Prominent trip header, Moovs-style: title + confirmation number.
    doc.font("Helvetica").fontSize(13).text("Final Trip Receipt", { align: "center" });
    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").fontSize(18).text(`Confirmation #${code}`, { align: "center" });
    doc.moveDown(1);

    const sectionTitle = (title) => {
      ensureSpace(40);
      doc.moveDown(0.5);
      // Explicit x: after a table, pdfkit's cursor x sits at the value
      // column, so a plain text() call would indent the title.
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#111111").text(title, left, doc.y);
      doc.moveDown(0.3);
      doc.fillColor("#000000");
    };

    // Keep rows together: if a row (or a section title, or the grand
    // total row) would not fit in the space left on this page, start a
    // fresh page first instead of stranding a label on one page and its
    // value on the next.
    const bottom = doc.page.height - 50;
    const ensureSpace = (needed) => {
      if (doc.y + needed > bottom) doc.addPage();
    };

    // Two-column fact table: bold label column, wrapping value column,
    // a light rule under each row. Rows with no value are omitted, never
    // printed blank or invented.
    const factTable = (rows) => {
      const labelWidth = 150;
      const valueWidth = contentWidth - labelWidth - 10;
      for (const [label, value] of rows) {
        if (value === undefined || value === null || value === "") continue;
        const text = String(value);
        doc.font("Helvetica").fontSize(12);
        const valueHeight = doc.heightOfString(text, { width: valueWidth });
        const labelHeight = doc.heightOfString(label, { width: labelWidth });
        ensureSpace(Math.max(labelHeight, valueHeight) + 12);
        const y0 = doc.y;
        doc.font("Helvetica-Bold").text(label, left, y0, { width: labelWidth });
        doc.font("Helvetica").text(text, left + labelWidth + 10, y0, { width: valueWidth });
        doc.y = y0 + Math.max(labelHeight, valueHeight) + 4;
        doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor("#dddddd").lineWidth(0.5).stroke();
        doc.strokeColor("#000000");
        doc.y += 4;
      }
    };

    // Two-column price table: item left, amount right-aligned, with a
    // rule under each row; the grand total row is bold with a heavier
    // rule above it.
    const priceTable = (lines, grandTotal) => {
      const amountWidth = 110;
      const itemWidth = contentWidth - amountWidth - 10;
      for (const [label, amount] of lines) {
        const bold = label === "Subtotal";
        doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(12);
        const itemHeight = doc.heightOfString(label, { width: itemWidth });
        ensureSpace(Math.max(itemHeight, 14) + 12);
        const y0 = doc.y;
        doc.text(label, left, y0, { width: itemWidth });
        doc.text(amount, left + itemWidth + 10, y0, { width: amountWidth, align: "right" });
        doc.y = y0 + Math.max(itemHeight, 14) + 4;
        doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor("#dddddd").lineWidth(0.5).stroke();
        doc.strokeColor("#000000");
        doc.y += 4;
      }
      doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor("#111111").lineWidth(1.5).stroke();
      doc.strokeColor("#000000");
      doc.y += 8;
      ensureSpace(24);
      doc.font("Helvetica-Bold").fontSize(13);
      const y0 = doc.y;
      doc.text("Grand Total", left, y0, { width: itemWidth });
      doc.text(grandTotal, left + itemWidth + 10, y0, { width: amountWidth, align: "right" });
      doc.y = y0 + 20;
    };

    // Section 1 — Booking contact + trip facts (Moovs "Trip" block).
    sectionTitle("Trip Details");
    factTable([
      ["Booking Contact", bookerName],
      ["Booking Email", booker.email],
      ["Booking Phone", booker.primary_phone && booker.primary_phone.number],
      ["Passenger", passengerName],
      ["Passenger Phone", passenger.primary_phone && passenger.primary_phone.number],
      ["Passenger Count", trip.total_passengers],
      ["Luggage", trip.total_luggage],
      ["Vehicle", booking.vehicle_details && booking.vehicle_details.vehicle_name],
      ["Chauffeur", driverName],
      ["Chauffeur Phone", driverPhone],
      ["Trip Type", prettyTripType(trip.trip_type)],
      ["Duration", trip.duration],
      ["Pick-up Date & Time", pickupDateTime],
      ["Pick-up", trip.pickup_location],
      ["Drop-off", trip.dropoff_location],
      ["Trip Notes", booking.special_requests || trip.comment],
    ]);

    // Section 2 — Price summary table.
    sectionTitle("Price Summary");
    priceTable(breakdownLines(breakdown), money(breakdown.grandTotal));

    // Section 3 — Payments (Moovs "Payments" block).
    sectionTitle("Payments");
    factTable([
      ["Amount Paid", payments.amountPaid],
      ["Amount Due", payments.amountDue],
    ]);

    // Phase 3.1: no payment link in the PDF — the email carries the pay
    // button. Contact details below are plain text, not clickable links.
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10).text("Thank you for traveling with Shine Limos. We look forward to hosting you again soon!");
    doc.fontSize(10).text("Shine Limos LLC  |  (202) 951-7172  |  shinelimos.com");
    doc.end();
  });
}

module.exports = { buildReceiptPdf, formatTripDateEastern, breakdownLines, paymentsFor, LOGO_PATH };

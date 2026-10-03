# Shine Limos — Website Fix List for Developer
**One page. Send as-is.** Compiled 2026-10-03 from a full live audit of shinelimosllc.com: homepage, fleet, services, locations, about, contact, FAQ, the complete 4-step booking flow, and a real test booking (Confirmation #CN-562828, Dulles → Reagan Oct 15, Executive Sedan, $162.71).

---

## 1. Critical — fix first

1. **Wrong canonical domain.** Homepage canonical points to `https://shinelimos.com/`. Every canonical must be `https://shinelimosllc.com/...`. Google is being told the wrong domain is the real site.
2. **Two different booking references.** The confirmation screen shows **CN-562828**; the customer and admin emails show **#6ac08e76b5409c8307b68f37**. Use ONE reference everywhere (screen, emails, admin panel).
3. **Confirmation screen shows no price.** The customer books at $162.71 but the confirmation page never repeats the total (the email does show it — good). Add the total to the confirmation screen.
4. **Time-picker bug.** On /booking the picker header renders "12:undefined AM" before selection. Fix the undefined value.
5. **No AM/PM anywhere.** Summary, confirmation screen, and both emails show "10:00" with no AM/PM. Show "10:00 AM" everywhere.

## 2. Booking flow copy & consistency

6. **Wait-time conflict.** Step 3 says airport pickups include 60 minutes' free wait; Step 4 says only 15 minutes. Standard wording everywhere: "Airport pickups include 60 minutes of complimentary wait time; all other pickups include 15 minutes."
7. **Payment story doesn't match.** The confirmation screen says a specialist will call within 15 minutes to verify payment; the email says dispatch "will send you a payment link shortly." Pick the real process and use the same words in both places. Also state on the confirm step exactly when the card is charged ("24 hours before pickup") and the cancellation window — mirror the /terms policy.
8. **Duplicated address text.** Booking summary prints "...United States, Sterling, 20166" (city/state/ZIP twice). Clean the address formatting.
9. **Signup friction.** Address fields only save if the user taps a Google Places suggestion — typed addresses silently don't save. Add a hint: "Start typing and select your address from the list."

## 3. Fleet page & content consistency

10. **Fleet page lists only 4 vehicles** (XTS Sedan, Escalade SUV, S-Class, Sprinter) but About claims "200+ vehicles fleet-wide." Remove the 200+ claim or correct it.
11. **Party buses, stretch limos, and coaches** appear in the booking widget and service pages as "Call to Book" but don't exist on the fleet page. Add them to the fleet page (photos + capacity) or show them consistently as call-only.
12. **Exotic call-out** (Rolls-Royce/Bentley/Lamborghini, 48-hr notice) — put it on the fleet page too, not only behind a Contact link.
13. **Malformed fleet URLs.** `/fleet/executive-sedan-` has a trailing hyphen. Clean slugs + 301 redirects.
14. **Blank stat.** About page "AVERAGE RATING" renders empty. Fill the real number or remove it.

## 4. Page titles (replace all)

| Page | Current | Replace with |
|---|---|---|
| Home | "Affordable Airport Limo Service \| ShineLimos" (+ a duplicate second title tag — delete it) | "Shine Limos \| Premium Black Car & Chauffeur Service in Washington DC" |
| Fleet | "Mercedes Sprinter Rental DC \| Luxury SUV Hire" | "Our Fleet \| Luxury Sedans, SUVs, S-Class & Sprinters — Shine Limos" |
| Fleet detail pages | "Shine limos — Premier Black Car & Limo Service in Washington DC" (generic) | Per vehicle, e.g. "Cadillac XTS Executive Sedan \| Shine Limos DC" |
| Contact | "Private Airport Taxi Service \| Transportation Support" | "Contact Shine Limos \| 24/7 Chauffeur Service in DC, VA & MD" |
| About | "About ShineLimos \| Executive Transfer" | "About Shine Limos \| Premium Chauffeur Service in the DMV" |
| FAQ | "FAQ & Transportation Support \| ShineLimos" | "FAQs \| Booking, Pricing & Chauffeur Service — Shine Limos" |
| Location pages (e.g. Dulles) | "Shine limos — Premier Black Car & Limo Service in Washington DC" (duplicate) | "Dulles Airport (IAD) Limo & Car Service \| Shine Limos" |

15. **Add a BWI Airport location page** — BWI is marketed all over the site but has no location page.

## 5. Reviews & trust

16. Service pages claim "5.0 · 1,200+ reviews" but nothing on the site backs it up: embed the live Google reviews feed on the homepage, and point the Google icon to the actual reviews listing (it currently links to a Maps short link).
17. Homepage testimonials are anonymous ("Senator's Chief of Staff"). Replace with real, named, dated reviews from Google/Yelp.

## 6. NEW PAGE: Corporate & Affiliates (`/corporate`)

Add to nav as CORPORATE. Copy below is ready to use.

**Headline:** Corporate Accounts & Affiliate Partners
**Sub:** Direct billing, priority dispatch, and a vetted DMV chauffeur network — for companies, hotels, travel advisors, and affiliate operators.

**Corporate accounts:**
- One monthly invoice, direct billing — no per-trip card charges
- Priority booking for executives, roadshows, and airport transfers
- Named account contact, 24/7 dispatch
- Sedans from $85/hr · SUVs from $105/hr · S-Class from $125/hr · Sprinters from $135/hr (3-hour minimum; airport transfers from $95)
- Contact: (202) 951-7172 · booking@shinelimos.com

**Hotels & travel advisors:**
- Preferred-partner chauffeur service for your guests, commission-protected bookings
- Background-checked professional chauffeurs, late-model fleet, flight tracking on every airport pickup

**Affiliate operators — join our DMV network:**
- Commercial insurance current, licensed vehicles, professional chauffeurs, on-time guarantee
- Contact: (202) 951-7172 · **affiliate@shinelimos.com**

**Form fields:** Company name · Contact name · Email · Phone · Type (Corporate / Hotel / Travel Advisor / Affiliate) · Monthly ride volume (optional) · Message. Route affiliate submissions to affiliate@shinelimos.com, everything else to booking@shinelimos.com.

---

## Verified working — do not break

- Instant all-inclusive quotes: Dulles → Reagan test priced Sedan $162.71 / Escalade $192.76 / S-Class $246.73 / Sprinter $309.00, quote matched the summary total exactly.
- Customer confirmation email and admin notification email both send correctly and include full trip details and the estimated price.
- No credit card is collected online; payment link follows after dispatch review; card charged 24 hours before pickup.
- Click-to-call and WhatsApp links work in header/footer.

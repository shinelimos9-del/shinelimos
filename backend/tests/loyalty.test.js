// Returning-client loyalty discount (Phase 0) — pure-function tests.
// These run without mongoose or a DB connection: the Booking model is
// only required lazily inside countPriorCompletedBookings, and
// validateLoyalty accepts a stub count function for tests.
const test = require("node:test");
const assert = require("node:assert/strict");
const loyalty = require("../src/services/loyalty");

test("code matching is case-insensitive and trims whitespace", () => {
  assert.equal(loyalty.isValidCode("SHINE10"), true);
  assert.equal(loyalty.isValidCode("shine10"), true);
  assert.equal(loyalty.isValidCode("  Shine10  "), true);
  assert.equal(loyalty.isValidCode("SHINE20"), false);
  assert.equal(loyalty.isValidCode(""), false);
  assert.equal(loyalty.isValidCode(null), false);
  assert.equal(loyalty.normalizeCode(" shine10 "), "SHINE10");
});

test("discountFor is 10% of the grand total, rounded to cents", () => {
  assert.equal(loyalty.discountFor(185.40), 18.54); // 2h sedan
  assert.equal(loyalty.discountFor(343.61), 34.36); // 2h Sprinter
  assert.equal(loyalty.discountFor(0), 0);
  assert.equal(loyalty.discountFor("185.40"), 18.54);
});

test("validateLoyalty: no code -> not applied, reason no_code", async () => {
  const r = await loyalty.validateLoyalty("", "a@b.com", null, async () => 3);
  assert.deepEqual(r, { applied: false, code: null, reason: "no_code" });
});

test("validateLoyalty: wrong code -> not applied, reason invalid_code", async () => {
  const r = await loyalty.validateLoyalty("WRONG", "a@b.com", null, async () => 3);
  assert.deepEqual(r, { applied: false, code: "WRONG", reason: "invalid_code" });
});

test("validateLoyalty: right code, no email -> not applied, reason no_email", async () => {
  const r = await loyalty.validateLoyalty("SHINE10", "", null, async () => 3);
  assert.deepEqual(r, { applied: false, code: "SHINE10", reason: "no_email" });
});

test("validateLoyalty: right code, no prior completed booking -> not_returning", async () => {
  const r = await loyalty.validateLoyalty("SHINE10", "first@timer.com", null, async () => 0);
  assert.equal(r.applied, false);
  assert.equal(r.reason, "not_returning");
});

test("validateLoyalty: right code + prior completed booking -> applied", async () => {
  const r = await loyalty.validateLoyalty("shine10", "Returning@Example.com", null, async () => 2);
  assert.deepEqual(r, { applied: true, code: "SHINE10", reason: null });
});

test("validateLoyalty: the count function receives the normalized email", async () => {
  let seenEmail;
  await loyalty.validateLoyalty("SHINE10", "  Mixed@Case.com ", null, async (email) => {
    seenEmail = email;
    return 1;
  });
  assert.equal(seenEmail, "mixed@case.com");
});

test("loyaltyNote: plain-English note for each outcome, null when applied", async () => {
  const applied = await loyalty.validateLoyalty("SHINE10", "a@b.com", null, async () => 1);
  assert.equal(loyalty.loyaltyNote(applied), "Returning-client discount applied: 10% off your whole trip.");
  const bad = await loyalty.validateLoyalty("NOPE", "a@b.com", null, async () => 1);
  assert.match(loyalty.loyaltyNote(bad), /wasn't recognised/);
  const fresh = await loyalty.validateLoyalty("SHINE10", "a@b.com", null, async () => 0);
  assert.match(loyalty.loyaltyNote(fresh), /no completed trip/);
});

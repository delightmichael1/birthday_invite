// ─────────────────────────────────────────────────────────────
// EDIT THIS FILE — all invitation details live here.
// ─────────────────────────────────────────────────────────────
export const event = {
  pastorName: "Pastor Stephen Mudhege",
  title: "A Blessed Birthday Celebration",
  tagline:
    "Help us celebrate our very own Pastor as he reaches another milestone in his life.",
  date: "Sunday, 6 December 2026",
  time: "4:00 PM",
  venue: "BloomingDeck Restaurant",
  address: "Lot 2 Small Holding, Gweru",
  dresscode: "Bring a touch of class to the table",
  rsvpDeadline: "Kindly respond by Wednesday, 2 December 2026",
  rsvpDeadlineLabel: "Wednesday, 2 December 2026",
  rsvpDeadlineDate: "2026-12-02",
  rsvpDeadlineTimezone: "Africa/Harare",
  paymentDeadline:
    "Payment needed by Wednesday, 2 December to secure venue and logistics",
  paymentNote:
    "Due to venue restrictions, no payments will be accepted on the day. Table reservations are done in advance.",
};

export const payment = {
  // Set to true once a payment provider is connected (Stripe, Paystack, etc.)
  enabled: false,
  feePerHead: 35,
  currency: "USD",
};

function dateKeyInTimezone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

export function isRsvpDeadlinePassed(now = new Date()) {
  return (
    dateKeyInTimezone(now, event.rsvpDeadlineTimezone) >
    event.rsvpDeadlineDate
  );
}

const mongoose = require("mongoose");
const { generateUniqueConfirmationCode } = require("../utils/confirmationCode");

const bookingSchema = new mongoose.Schema({

  // Phase 3 — short customer-facing confirmation code (e.g. "ZE34").
  // The Mongo _id stays the internal key; customers only ever see this.
  // Sparse so bookings created before Phase 3 (no code yet) don't
  // collide on a null value; the backfill script fills those in.
  confirmation_code: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
    required: false,
  },

  trip_details: [{
    date: {
      type: Date,
      required: true,
    },
    pickup_location: {
      type: String,
      required: true,
    },
    pickup_details: {
      flat_no: String,
      area: String,
      landmark: String,
      postal_code: String,
      city: String,
      latitude: Number,
      longitude: Number,
    },
    stops: [{
      location: String,
      details: {
        flat_no: String,
        area: String,
        landmark: String,
        postal_code: String,
        city: String,
        latitude: Number,
        longitude: Number,
      }
    }],
    dropoff_location: {
      type: String,
      required: true,
    },
    dropoff_details: {
      flat_no: String,
      area: String,
      landmark: String,
      postal_code: String,
      city: String,
      latitude: Number,
      longitude: Number,
    },
    distance_miles: Number,
    start_time: {
      type: String,
      required: true,
    },
    end_time: {
      type: String,
      required: false,
    },
    duration: {
      type: String,
      required: false,
    },
    comment: {
      type: String,
      required: false,
    },
    flight_details: {
      international: {
        type: Boolean,
        default: false,
      },
      domestic: {
        type: Boolean,
        default: false,
      },
      departure: {
        type: Boolean,
        default: false,
      },
      arrival: {
        type: Boolean,
        default: false,
      },
      airline_flight_no: {
        type: String,
        default: "",
      },
      meet_and_greet: {
        type: Boolean,
        default: false,
      },
    },
    trip_type: {
      type: String,
      required: true,
    },
    occasion: {
      type: String,
      required: true,
    },
    total_passengers: {
      type: String,
      required: true,
    },
    total_luggage: {
      type: String,
      default: "0",
    },
  }],
  vehicle_details: {
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vehicle",
      required: false,
    },
    vehicle_name: String,
    image: String,
    price_snapshot: {
      base_price: Number,
      price_per_minute: Number,
      price_per_mile: Number,
      price_per_hour: Number,
    },
    estimated_price: Number,
  },
  contact_details: {
    booker: {
      first_name: String,
      last_name: String,
      company_name: String,
      email: String,
      primary_phone: {
        number: String,
        type: { type: String, default: "Cellular" }
      },
      secondary_phone: {
        number: String,
        type: { type: String, default: "Home" }
      },
      is_passenger: {
        type: Boolean,
        default: true
      }
    },
    passenger: {
      first_name: String,
      last_name: String,
      primary_phone: {
        number: String,
        type: { type: String, default: "Cellular" }
      },
      secondary_phone: {
        number: String,
        type: { type: String, default: "Home" }
      },
      email: String
    },
    marketing_consent: {
      type: Boolean,
      default: false
    }
  },
  special_requests: String,
  // Assigned driver (Phase 1). driver_name is a snapshot kept on the
  // booking so trip history survives a later driver rename/delete.
  driver_details: {
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "driver",
      required: false,
    },
    driver_name: String,
    // Phase 2 snapshot of the driver's phone at assignment time, so the
    // customer-facing booking view can show it even if the driver record
    // is later edited or deleted.
    driver_phone: String,
  },
  // Phase 2 driver trip progress, separate from booking_status so the
  // admin pipeline (pending/confirmed/dispatched/completed/cancelled) is
  // untouched. Set to "assigned" when a driver is assigned, cleared on
  // unassign. Moves forward only: assigned -> on_the_way -> arrived ->
  // completed. No new booking_status values were needed: completing a
  // trip also sets booking_status to "completed", and going on the way
  // sets it to "dispatched" — both pre-existing values, so no migration
  // is required for existing bookings.
  driver_status: {
    type: String,
    enum: ["assigned", "on_the_way", "arrived", "completed"],
    required: false,
  },
  // Real enum (Phase 1 fix): previously a free string, so any typo was
  // silently accepted and broke dashboard counts. Existing non-enum
  // values are mapped to "pending" by scripts/migrate-booking-status.js
  // before this enum is enforced on writes.
  booking_status: {
    type: String,
    enum: ["pending", "confirmed", "dispatched", "completed", "cancelled"],
    default: "pending",
  },
  payment_status: {
    type: String,
    enum: ["pending", "requested", "completed", "failed"],
    default: "pending",
  },
  payment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: false,
  },
  transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },

  // Live Vehicle Tracking & Extras
  vehicle_arrived: { type: Boolean, default: false },
  arrival_time: { type: Date },
  ride_started: { type: Boolean, default: false },
  ride_start_time: { type: Date },
  waiting_minutes: { type: Number, default: 0 },
  waiting_fee: { type: Number, default: 0 },
  additional_stops_count: { type: Number, default: 0 },
  price_breakdown: { type: Object },

  // Origin of the booking: website bookings vs GNet farm-in trips.
  source: {
    type: String,
    enum: ["website", "gnet"],
    default: "website",
  },

  // GNet farm-in metadata (only set for source === "gnet").
  gnet: {
    requesterId: String,
    requesterResNo: String,
    providerResNo: String,
    accountNumber: String,
    transactionId: String,
    vehicleType: String,
    raw: mongoose.Schema.Types.Mixed,
  },

  created_at: { 
    type: Date,
    default: Date.now,
  },

  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Phase 3 — every booking gets a short code at creation, no matter
// which path created it (website quote flow, finalize, createBooking,
// GNet farm-in). Only assigns when missing, so later saves are a no-op
// and existing bookings are untouched until the backfill script runs.
bookingSchema.pre("save", async function (next) {
  try {
    if (!this.confirmation_code) {
      this.confirmation_code = await generateUniqueConfirmationCode(this.constructor);
    }
    next();
  } catch (error) {
    next(error);
  }
});

const booking = mongoose.model("booking", bookingSchema);
module.exports = booking;

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

  trip_details: [{
    date: {
      type: Date,
      required: true,
    },
    pickup_location: {
      type: String,
      required: true,
    },
    dropoff_location: {
      type: String,
      required: true,
    },
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
      required: true,
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
    }
  },
  special_requests: String,
  booking_status: {
    type: String,
    default: "panding",
  },
  transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
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

const booking = mongoose.model("booking", bookingSchema);
module.exports = booking;

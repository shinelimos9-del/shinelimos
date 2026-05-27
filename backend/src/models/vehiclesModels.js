const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({

  vehicle_name: {
    type: String,
    required: true,
  },
  vehicle_class_name: {
    type: String,
    required: true,
  },
  discription: {
    type: String,
    required: true,
  },
  features: {
    type: Array,
    required: true,
  },

  price: {
    base_price: {
      type: Number,
      required: true,
    },
    price_per_minute: {
      type: Number,
      required: true,
    },
    price_per_mile: {
      type: Number,
      required: true,
    },
    price_per_hour: {
      type: Number,
      required: true,
    },
  },
   
  unites: {
    type: String,
    required: true,
  },

  passenger_capacity: {
    type: String,
    required: true,
  },

  luggage_capacity: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
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

const vehicle = mongoose.model("vehicle", vehicleSchema);
module.exports = vehicle;

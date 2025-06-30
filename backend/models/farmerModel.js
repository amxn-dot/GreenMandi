// models/farmerModel.js

const mongoose = require('mongoose');

const farmerSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    farmName: {
      type: String,
      required: [true, 'Please add a farm name'],
    },
    farmLocation: {
      type: String,
      required: [true, 'Please add a farm location'],
    },
    farmDescription: {
      type: String,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Check if model already exists before defining to prevent OverwriteModelError in watch mode
let Farmer;
if (mongoose.models.Farmer) {
  Farmer = mongoose.models.Farmer;
} else {
  Farmer = mongoose.model('Farmer', farmerSchema);
}

module.exports = Farmer;

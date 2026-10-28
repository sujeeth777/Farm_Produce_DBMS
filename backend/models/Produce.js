const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema(
  {
    produce_id: {
      type: String,
      required: [true, 'Produce ID is required (e.g. P001)'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Produce name is required'],
      trim: true,
    },
    category_id: {
      type: Number,
      default: 1,
    },
    category: {
      type: String,
      required: [true, 'Produce category is required'],
      trim: true,
      default: 'Vegetable',
    },
    price_per_kg: {
      type: Number,
      required: [true, 'Price per KG is required'],
      min: [0, 'Price must be a positive number'],
    },
    available_quantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property for stock status
produceSchema.virtual('status').get(function () {
  if (this.available_quantity <= 0) return 'Out of Stock';
  if (this.available_quantity <= 20) return 'Low Stock';
  return 'In Stock';
});

produceSchema.set('toJSON', { virtuals: true });
produceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Produce', produceSchema);

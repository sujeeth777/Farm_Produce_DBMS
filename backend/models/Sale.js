const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    sale_id: {
      type: Number,
      required: true,
      unique: true,
    },
    produce_id: {
      type: String,
      required: [true, 'Produce ID is required'],
      ref: 'Produce',
    },
    produce_name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    quantity_sold: {
      type: Number,
      required: [true, 'Quantity sold is required'],
      min: [0.01, 'Quantity must be greater than zero'],
    },
    price_per_kg: {
      type: Number,
      required: [true, 'Price per KG is required'],
      min: [0, 'Price must be >= 0'],
    },
    total_amount: {
      type: Number,
      required: true,
      min: [0, 'Total amount must be >= 0'],
    },
    sale_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Sale', saleSchema);

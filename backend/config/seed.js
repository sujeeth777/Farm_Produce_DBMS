const Category = require('../models/Category');
const Produce = require('../models/Produce');
const Sale = require('../models/Sale');

const SEED_CATEGORIES = [
  { category_id: 1, category_name: 'Vegetable' },
  { category_id: 2, category_name: 'Fruit' },
  { category_id: 3, category_name: 'Grain' },
  { category_id: 4, category_name: 'Pulse' },
  { category_id: 5, category_name: 'Spice' },
  { category_id: 6, category_name: 'Other' },
];

const SEED_PRODUCE = [
  { produce_id: 'P001', name: 'Tomato', category_id: 1, category: 'Vegetable', price_per_kg: 40, available_quantity: 105 },
  { produce_id: 'P002', name: 'Potato', category_id: 1, category: 'Vegetable', price_per_kg: 35, available_quantity: 230 },
  { produce_id: 'P003', name: 'Onion', category_id: 1, category: 'Vegetable', price_per_kg: 45, available_quantity: 140 },
  { produce_id: 'P004', name: 'Carrot', category_id: 1, category: 'Vegetable', price_per_kg: 50, available_quantity: 90 },
  { produce_id: 'P005', name: 'Spinach', category_id: 1, category: 'Vegetable', price_per_kg: 30, available_quantity: 60 },
  { produce_id: 'P006', name: 'Apple', category_id: 2, category: 'Fruit', price_per_kg: 120, available_quantity: 75 },
  { produce_id: 'P007', name: 'Mango', category_id: 2, category: 'Fruit', price_per_kg: 100, available_quantity: 50 },
  { produce_id: 'P008', name: 'Banana', category_id: 2, category: 'Fruit', price_per_kg: 60, available_quantity: 80 },
  { produce_id: 'P009', name: 'Orange', category_id: 2, category: 'Fruit', price_per_kg: 90, available_quantity: 70 },
  { produce_id: 'P010', name: 'Rice', category_id: 3, category: 'Grain', price_per_kg: 60, available_quantity: 475 },
  { produce_id: 'P011', name: 'Wheat', category_id: 3, category: 'Grain', price_per_kg: 55, available_quantity: 320 },
  { produce_id: 'P012', name: 'Maize', category_id: 3, category: 'Grain', price_per_kg: 42, available_quantity: 300 },
  { produce_id: 'P013', name: 'Toor Dal', category_id: 4, category: 'Pulse', price_per_kg: 140, available_quantity: 100 },
  { produce_id: 'P014', name: 'Green Gram', category_id: 4, category: 'Pulse', price_per_kg: 130, available_quantity: 75 },
  { produce_id: 'P015', name: 'Chilli', category_id: 5, category: 'Spice', price_per_kg: 180, available_quantity: 50 },
];

const SEED_SALES = [
  { sale_id: 1, produce_id: 'P001', produce_name: 'Tomato', category: 'Vegetable', quantity_sold: 15, price_per_kg: 40, total_amount: 600 },
  { sale_id: 2, produce_id: 'P002', produce_name: 'Potato', category: 'Vegetable', quantity_sold: 20, price_per_kg: 35, total_amount: 700 },
  { sale_id: 3, produce_id: 'P003', produce_name: 'Onion', category: 'Vegetable', quantity_sold: 10, price_per_kg: 45, total_amount: 450 },
  { sale_id: 4, produce_id: 'P006', produce_name: 'Apple', category: 'Fruit', quantity_sold: 5, price_per_kg: 120, total_amount: 600 },
  { sale_id: 5, produce_id: 'P007', produce_name: 'Mango', category: 'Fruit', quantity_sold: 10, price_per_kg: 100, total_amount: 1000 },
  { sale_id: 6, produce_id: 'P008', produce_name: 'Banana', category: 'Fruit', quantity_sold: 20, price_per_kg: 60, total_amount: 1200 },
  { sale_id: 7, produce_id: 'P010', produce_name: 'Rice', category: 'Grain', quantity_sold: 25, price_per_kg: 60, total_amount: 1500 },
  { sale_id: 8, produce_id: 'P011', produce_name: 'Wheat', category: 'Grain', quantity_sold: 30, price_per_kg: 55, total_amount: 1650 },
];

async function seedDatabase() {
  try {
    const existingCount = await Produce.countDocuments();
    if (existingCount > 0) {
      console.log(`[Seed] Database already has ${existingCount} produce items. Skipping seed.`);
      return;
    }

    console.log('[Seed] Empty database detected. Seeding initial farm data...');

    // Insert categories
    for (const cat of SEED_CATEGORIES) {
      await Category.findOneAndUpdate(
        { category_id: cat.category_id },
        cat,
        { upsert: true, returnDocument: 'after' }
      );
    }
    console.log(`[Seed] ✓ ${SEED_CATEGORIES.length} categories inserted`);

    // Insert produce
    await Produce.insertMany(SEED_PRODUCE);
    console.log(`[Seed] ✓ ${SEED_PRODUCE.length} produce items inserted`);

    // Insert sales
    await Sale.insertMany(SEED_SALES);
    console.log(`[Seed] ✓ ${SEED_SALES.length} sales records inserted`);

    console.log('[Seed] ✓ Database seeding complete!');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err.message);
  }
}

module.exports = { seedDatabase };

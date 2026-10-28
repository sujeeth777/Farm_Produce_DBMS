// =========================================================================
// Farm Produce Management System - MongoDB Initialization & Seed Script
// Database: farm_produce_db
// Collections: categories, produces, sales, users
// =========================================================================

// Switch to database
db = db.getSiblingDB('farm_produce_db');

// Drop existing collections to reset cleanly if needed
db.categories.drop();
db.produces.drop();
db.sales.drop();
db.users.drop();

// 1. Seed Categories Collection
db.categories.insertMany([
  { category_id: 1, category_name: 'Vegetable', createdAt: new Date(), updatedAt: new Date() },
  { category_id: 2, category_name: 'Fruit', createdAt: new Date(), updatedAt: new Date() },
  { category_id: 3, category_name: 'Grain', createdAt: new Date(), updatedAt: new Date() },
  { category_id: 4, category_name: 'Pulse', createdAt: new Date(), updatedAt: new Date() },
  { category_id: 5, category_name: 'Spice', createdAt: new Date(), updatedAt: new Date() },
  { category_id: 6, category_name: 'Other', createdAt: new Date(), updatedAt: new Date() }
]);

// 2. Seed Produces Collection
db.produces.insertMany([
  { produce_id: 'P001', name: 'Tomato', category_id: 1, category: 'Vegetable', price_per_kg: 40.0, available_quantity: 105.0, createdAt: new Date(), updatedAt: new Date() },
  { produce_id: 'P002', name: 'Potato', category_id: 1, category: 'Vegetable', price_per_kg: 35.0, available_quantity: 230.0, createdAt: new Date(), updatedAt: new Date() },
  { produce_id: 'P003', name: 'Onion', category_id: 1, category: 'Vegetable', price_per_kg: 45.0, available_quantity: 140.0, createdAt: new Date(), updatedAt: new Date() },
  { produce_id: 'P004', name: 'Carrot', category_id: 1, category: 'Vegetable', price_per_kg: 50.0, available_quantity: 90.0, createdAt: new Date(), updatedAt: new Date() },
  { produce_id: 'P005', name: 'Spinach', category_id: 1, category: 'Vegetable', price_per_kg: 30.0, available_quantity: 60.0, createdAt: new Date(), updatedAt: new Date() },
  { produce_id: 'P006', name: 'Apple', category_id: 2, category: 'Fruit', price_per_kg: 120.0, available_quantity: 75.0, createdAt: new Date(), updatedAt: new Date() },
  { produce_id: 'P007', name: 'Mango', category_id: 2, category: 'Fruit', price_per_kg: 100.0, available_quantity: 50.0, createdAt: new Date(), updatedAt: new Date() },
  { produce_id: 'P008', name: 'Banana', category_id: 2, category: 'Fruit', price_per_kg: 60.0, available_quantity: 80.0, createdAt: new Date(), updatedAt: new Date() },
  { produce_id: 'P009', name: 'Orange', category_id: 2, category: 'Fruit', price_per_kg: 90.0, available_quantity: 70.0, createdAt: new Date(), updatedAt: new Date() },
  { produce_id: 'P010', name: 'Rice', category_id: 3, category: 'Grain', price_per_kg: 60.0, available_quantity: 475.0, createdAt: new Date(), updatedAt: new Date() },
  { produce_id: 'P011', name: 'Wheat', category_id: 3, category: 'Grain', price_per_kg: 55.0, available_quantity: 320.0, createdAt: new Date(), updatedAt: new Date() },
  { produce_id: 'P012', name: 'Maize', category_id: 3, category: 'Grain', price_per_kg: 42.0, available_quantity: 300.0, createdAt: new Date(), updatedAt: new Date() },
  { produce_id: 'P013', name: 'Toor Dal', category_id: 4, category: 'Pulse', price_per_kg: 140.0, available_quantity: 100.0, createdAt: new Date(), updatedAt: new Date() },
  { produce_id: 'P014', name: 'Green Gram', category_id: 4, category: 'Pulse', price_per_kg: 130.0, available_quantity: 75.0, createdAt: new Date(), updatedAt: new Date() },
  { produce_id: 'P015', name: 'Chilli', category_id: 5, category: 'Spice', price_per_kg: 180.0, available_quantity: 50.0, createdAt: new Date(), updatedAt: new Date() }
]);

// 3. Seed Sales Collection
db.sales.insertMany([
  { sale_id: 1, produce_id: 'P001', produce_name: 'Tomato', category: 'Vegetable', quantity_sold: 15, price_per_kg: 40, total_amount: 600, sale_date: new Date() },
  { sale_id: 2, produce_id: 'P002', produce_name: 'Potato', category: 'Vegetable', quantity_sold: 20, price_per_kg: 35, total_amount: 700, sale_date: new Date() },
  { sale_id: 3, produce_id: 'P003', produce_name: 'Onion', category: 'Vegetable', quantity_sold: 10, price_per_kg: 45, total_amount: 450, sale_date: new Date() },
  { sale_id: 4, produce_id: 'P006', produce_name: 'Apple', category: 'Fruit', quantity_sold: 5, price_per_kg: 120, total_amount: 600, sale_date: new Date() },
  { sale_id: 5, produce_id: 'P007', produce_name: 'Mango', category: 'Fruit', quantity_sold: 10, price_per_kg: 100, total_amount: 1000, sale_date: new Date() },
  { sale_id: 6, produce_id: 'P008', produce_name: 'Banana', category: 'Fruit', quantity_sold: 20, price_per_kg: 60, total_amount: 1200, sale_date: new Date() },
  { sale_id: 7, produce_id: 'P010', produce_name: 'Rice', category: 'Grain', quantity_sold: 25, price_per_kg: 60, total_amount: 1500, sale_date: new Date() },
  { sale_id: 8, produce_id: 'P011', produce_name: 'Wheat', category: 'Grain', quantity_sold: 30, price_per_kg: 55, total_amount: 1650, sale_date: new Date() }
]);

// 4. Create Indexes
db.produces.createIndex({ produce_id: 1 }, { unique: true });
db.produces.createIndex({ name: 1 });
db.produces.createIndex({ category: 1 });
db.sales.createIndex({ sale_id: 1 }, { unique: true });
db.sales.createIndex({ sale_date: -1 });

print("✓ MongoDB farm_produce_db successfully initialized and seeded!");

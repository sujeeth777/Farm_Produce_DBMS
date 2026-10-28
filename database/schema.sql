-- ===================================================
-- FarmHub: Agricultural Produce & Sales Management Schema
-- Supabase / PostgreSQL Schema
-- ===================================================

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    category_id BIGSERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Produce (Inventory) Table
CREATE TABLE IF NOT EXISTS public.produce (
    produce_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category_id BIGINT REFERENCES public.categories(category_id) ON DELETE SET NULL,
    price_per_kg NUMERIC(10, 2) NOT NULL CHECK (price_per_kg >= 0),
    available_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Sales Transactions Table
CREATE TABLE IF NOT EXISTS public.sales (
    sale_id BIGSERIAL PRIMARY KEY,
    produce_id VARCHAR(50) NOT NULL REFERENCES public.produce(produce_id) ON DELETE RESTRICT,
    quantity_sold NUMERIC(10, 2) NOT NULL CHECK (quantity_sold > 0),
    price_per_kg NUMERIC(10, 2) NOT NULL CHECK (price_per_kg >= 0),
    total_amount NUMERIC(12, 2) GENERATED ALWAYS AS (quantity_sold * price_per_kg) STORED,
    sale_date TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ===================================================
-- Helpful Indexes for Performance
-- ===================================================
CREATE INDEX IF NOT EXISTS idx_produce_category ON public.produce(category_id);
CREATE INDEX IF NOT EXISTS idx_produce_name ON public.produce(name);
CREATE INDEX IF NOT EXISTS idx_sales_produce ON public.sales(produce_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(sale_date DESC);

-- ===================================================
-- Initial Reference Data (Matches Current Supabase State)
-- ===================================================
INSERT INTO public.categories (category_id, category_name) VALUES
    (1, 'Vegetable'),
    (2, 'Fruit'),
    (3, 'Grain'),
    (4, 'Pulse'),
    (5, 'Spice'),
    (6, 'Other')
ON CONFLICT (category_name) DO NOTHING;

-- Sample Produce Seeds
INSERT INTO public.produce (produce_id, name, category_id, price_per_kg, available_quantity) VALUES
    ('P001', 'Tomato', 1, 40.00, 105.00),
    ('P002', 'Potato', 1, 35.00, 230.00),
    ('P003', 'Onion', 1, 45.00, 140.00),
    ('P004', 'Carrot', 1, 50.00, 90.00),
    ('P005', 'Spinach', 1, 30.00, 60.00),
    ('P006', 'Apple', 2, 120.00, 75.00),
    ('P007', 'Mango', 2, 100.00, 50.00),
    ('P008', 'Banana', 2, 60.00, 80.00),
    ('P009', 'Orange', 2, 90.00, 70.00),
    ('P010', 'Rice', 3, 60.00, 475.00),
    ('P011', 'Wheat', 3, 55.00, 320.00),
    ('P012', 'Maize', 3, 42.00, 300.00),
    ('P013', 'Toor Dal', 4, 140.00, 100.00),
    ('P014', 'Green Gram', 4, 130.00, 75.00),
    ('P015', 'Chilli', 5, 180.00, 50.00)
ON CONFLICT (produce_id) DO NOTHING;

const Produce = require('../models/Produce');
const Sale = require('../models/Sale');
const Category = require('../models/Category');

// POST /api/sales - Record a new sale, deduct stock atomically
async function recordSale(req, res) {
  try {
    const { produce_id, quantity_sold, price_per_kg } = req.body;

    if (!produce_id) {
      return res.status(400).json({ success: false, message: 'Produce ID is required.' });
    }

    const qty = parseFloat(quantity_sold);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity sold must be a positive number.' });
    }

    // 1. Fetch the produce document from MongoDB
    const produce = await Produce.findOne({ produce_id });
    if (!produce) {
      return res.status(404).json({ success: false, message: `Produce ${produce_id} not found.` });
    }

    // 2. Check stock availability
    if (produce.available_quantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${produce.name}. Only ${produce.available_quantity} kg available (requested ${qty} kg).`,
      });
    }

    // 3. Determine selling price
    const unitPrice = (price_per_kg !== undefined && !isNaN(parseFloat(price_per_kg)))
      ? parseFloat(price_per_kg)
      : produce.price_per_kg;

    const totalAmount = parseFloat((qty * unitPrice).toFixed(2));

    // 4. Generate next sale_id
    const lastSale = await Sale.findOne().sort({ sale_id: -1 }).lean();
    const nextSaleId = lastSale ? lastSale.sale_id + 1 : 1;

    // 5. Insert sale document into MongoDB sales collection
    const newSale = await Sale.create({
      sale_id: nextSaleId,
      produce_id,
      produce_name: produce.name,
      category: produce.category,
      quantity_sold: qty,
      price_per_kg: unitPrice,
      total_amount: totalAmount,
      sale_date: new Date(),
    });

    // 6. Decrement available_quantity in produce collection
    const newStock = parseFloat((produce.available_quantity - qty).toFixed(2));
    produce.available_quantity = newStock;
    await produce.save();

    return res.status(201).json({
      success: true,
      message: `Sale recorded! ${qty} kg of ${produce.name} sold for ₹${totalAmount.toLocaleString('en-IN')}.`,
      data: {
        sale: newSale.toObject(),
        remaining_stock: newStock,
      },
    });
  } catch (err) {
    console.error('Record sale error:', err);
    return res.status(500).json({ success: false, message: 'Server error recording sale.' });
  }
}

// GET /api/sales - List all sales with optional filters
async function getAllSales(req, res) {
  try {
    const { produce_id, limit = 50, sort = 'newest' } = req.query;

    let filter = {};
    if (produce_id && produce_id !== 'all') {
      filter.produce_id = produce_id;
    }

    let sortOption = { sale_date: -1 }; // default newest
    if (sort === 'oldest') sortOption = { sale_date: 1 };
    if (sort === 'amount_desc') sortOption = { total_amount: -1 };

    const maxLimit = Math.min(parseInt(limit, 10) || 50, 200);

    const data = await Sale.find(filter).sort(sortOption).limit(maxLimit).lean();

    // Calculate aggregate totals
    const totalRevenue = data.reduce((acc, s) => acc + (s.total_amount || 0), 0);
    const totalKgSold = data.reduce((acc, s) => acc + (s.quantity_sold || 0), 0);

    return res.status(200).json({
      success: true,
      count: data.length,
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      total_kg_sold: parseFloat(totalKgSold.toFixed(2)),
      data,
    });
  } catch (err) {
    console.error('Sales fetch error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving sales.' });
  }
}

// GET /api/sales/dashboard-summary - Aggregated dashboard metrics
async function getDashboardSummary(req, res) {
  try {
    // 1. Fetch all produce
    const produceList = await Produce.find().lean();

    // 2. Fetch all sales (most recent first)
    const salesList = await Sale.find().sort({ sale_date: -1 }).lean();

    // 3. Fetch categories
    const catList = await Category.find().lean();

    // Aggregate metrics
    const totalProduce = produceList.length;
    const totalInventoryKg = produceList.reduce((acc, p) => acc + (p.available_quantity || 0), 0);
    const totalRevenue = salesList.reduce((acc, s) => acc + (s.total_amount || 0), 0);
    const totalSalesCount = salesList.length;

    // Low stock items (<= 20 kg)
    const lowStockItems = produceList.filter((p) => p.available_quantity > 0 && p.available_quantity <= 20);

    // Recent 6 sales
    const recentSales = salesList.slice(0, 6);

    // Top selling produce by total kg sold
    const produceSalesMap = {};
    salesList.forEach((s) => {
      const pid = s.produce_id;
      if (!produceSalesMap[pid]) {
        produceSalesMap[pid] = {
          produce_id: pid,
          name: s.produce_name || pid,
          category: s.category || 'General',
          total_kg: 0,
          total_revenue: 0,
          sales_count: 0,
        };
      }
      produceSalesMap[pid].total_kg += s.quantity_sold || 0;
      produceSalesMap[pid].total_revenue += s.total_amount || 0;
      produceSalesMap[pid].sales_count += 1;
    });

    const topSelling = Object.values(produceSalesMap)
      .sort((a, b) => b.total_kg - a.total_kg)
      .slice(0, 5);

    // Category breakdown
    const categoryCounts = {};
    catList.forEach((c) => { categoryCounts[c.category_name] = 0; });
    produceList.forEach((p) => {
      const catName = p.category || 'Other';
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalProduce,
        totalInventoryKg: Math.round(totalInventoryKg * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalSalesCount,
        lowStockCount: lowStockItems.length,
      },
      lowStockItems,
      recentSales,
      topSelling,
      categoryCounts,
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    return res.status(500).json({ success: false, message: 'Failed to compute dashboard metrics.' });
  }
}

module.exports = { recordSale, getAllSales, getDashboardSummary };

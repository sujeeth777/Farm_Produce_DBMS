const Produce = require('../models/Produce');
const Sale = require('../models/Sale');
const Category = require('../models/Category');

// GET /api/produce - List all produce with filters, search, and sorting
async function getAllProduce(req, res) {
  try {
    const { category_id, search, stock_status, sort = 'name_asc' } = req.query;

    let filter = {};

    // Filter by category
    if (category_id && category_id !== 'all') {
      filter.category_id = parseInt(category_id, 10);
    }

    // Search by name or produce_id
    if (search && search.trim() !== '') {
      const term = search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { produce_id: { $regex: term, $options: 'i' } },
      ];
    }

    // Filter by stock status
    if (stock_status === 'low') {
      filter.available_quantity = { $gt: 0, $lte: 20 };
    } else if (stock_status === 'out') {
      filter.available_quantity = { $lte: 0 };
    } else if (stock_status === 'in_stock') {
      filter.available_quantity = { $gt: 0 };
    }

    // Determine sort order
    let sortOption = { name: 1 }; // default A-Z
    switch (sort) {
      case 'name_desc':     sortOption = { name: -1 }; break;
      case 'price_asc':     sortOption = { price_per_kg: 1 }; break;
      case 'price_desc':    sortOption = { price_per_kg: -1 }; break;
      case 'stock_asc':     sortOption = { available_quantity: 1 }; break;
      case 'stock_desc':    sortOption = { available_quantity: -1 }; break;
      case 'newest':        sortOption = { createdAt: -1 }; break;
    }

    const data = await Produce.find(filter).sort(sortOption).lean();

    // Enrich with status fields
    const enrichedData = data.map((item) => {
      let status = 'In Stock';
      let statusColor = 'green';
      if (item.available_quantity <= 0) {
        status = 'Out of Stock'; statusColor = 'red';
      } else if (item.available_quantity <= 20) {
        status = 'Low Stock'; statusColor = 'amber';
      }
      return {
        ...item,
        categories: { category_id: item.category_id, category_name: item.category },
        status,
        statusColor,
      };
    });

    return res.status(200).json({
      success: true,
      count: enrichedData.length,
      data: enrichedData,
    });
  } catch (err) {
    console.error('Produce fetch error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching produce.' });
  }
}

// GET /api/produce/:id - Get single produce by ID
async function getProduceById(req, res) {
  try {
    const { id } = req.params;
    const produce = await Produce.findOne({ produce_id: id }).lean();

    if (!produce) {
      return res.status(404).json({ success: false, message: `Produce ${id} not found.` });
    }

    // Fetch recent sales for this item
    const recent_sales = await Sale.find({ produce_id: id })
      .sort({ sale_date: -1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        ...produce,
        categories: { category_id: produce.category_id, category_name: produce.category },
        recent_sales,
      },
    });
  } catch (err) {
    console.error('Produce by ID error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// Helper: auto-generate next produce_id
async function generateNextProduceId() {
  const allItems = await Produce.find({}, { produce_id: 1 }).lean();
  let maxNum = 0;
  for (const item of allItems) {
    const match = item.produce_id.match(/P(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  return `P${String(maxNum + 1).padStart(3, '0')}`;
}

// POST /api/produce - Create new produce
async function createProduce(req, res) {
  try {
    let { produce_id, name, category_id, category, price_per_kg, available_quantity } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Produce name is required.' });
    }
    if (!category_id) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }

    const price = parseFloat(price_per_kg);
    const quantity = parseFloat(available_quantity);
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ success: false, message: 'Valid price per kg (>= 0) is required.' });
    }
    if (isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ success: false, message: 'Valid quantity (>= 0) is required.' });
    }

    // Auto-generate ID if not provided
    if (!produce_id || !produce_id.trim()) {
      produce_id = await generateNextProduceId();
    } else {
      produce_id = produce_id.trim().toUpperCase();
      const existing = await Produce.findOne({ produce_id });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Produce ID ${produce_id} already exists. Leave blank to auto-generate.`,
        });
      }
    }

    // Resolve category name
    if (!category) {
      const catDoc = await Category.findOne({ category_id: parseInt(category_id, 10) }).lean();
      category = catDoc ? catDoc.category_name : 'General';
    }

    const newProduce = await Produce.create({
      produce_id,
      name: name.trim(),
      category_id: parseInt(category_id, 10),
      category,
      price_per_kg: price,
      available_quantity: quantity,
    });

    return res.status(201).json({
      success: true,
      message: `${newProduce.name} (${produce_id}) added to inventory!`,
      data: {
        ...newProduce.toObject(),
        categories: { category_id: newProduce.category_id, category_name: newProduce.category },
      },
    });
  } catch (err) {
    console.error('Create produce error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to create produce.' });
  }
}

// PUT /api/produce/:id - Update produce
async function updateProduce(req, res) {
  try {
    const { id } = req.params;
    const { name, category_id, category, price_per_kg, available_quantity } = req.body;

    const updates = {};
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
      updates.name = name.trim();
    }
    if (category_id !== undefined) {
      updates.category_id = parseInt(category_id, 10);
      if (category) {
        updates.category = category;
      } else {
        const catDoc = await Category.findOne({ category_id: updates.category_id }).lean();
        if (catDoc) updates.category = catDoc.category_name;
      }
    }
    if (price_per_kg !== undefined) {
      const price = parseFloat(price_per_kg);
      if (isNaN(price) || price < 0) return res.status(400).json({ success: false, message: 'Price must be >= 0.' });
      updates.price_per_kg = price;
    }
    if (available_quantity !== undefined) {
      const qty = parseFloat(available_quantity);
      if (isNaN(qty) || qty < 0) return res.status(400).json({ success: false, message: 'Quantity must be >= 0.' });
      updates.available_quantity = qty;
    }

    const updated = await Produce.findOneAndUpdate(
      { produce_id: id },
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: `Produce ${id} not found.` });
    }

    return res.status(200).json({
      success: true,
      message: `${updated.name} updated successfully!`,
      data: {
        ...updated,
        categories: { category_id: updated.category_id, category_name: updated.category },
      },
    });
  } catch (err) {
    console.error('Update produce error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update produce.' });
  }
}

// DELETE /api/produce/:id - Delete produce
async function deleteProduce(req, res) {
  try {
    const { id } = req.params;

    // Check for linked sales
    const linkedSales = await Sale.countDocuments({ produce_id: id });
    if (linkedSales > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete ${id}: ${linkedSales} sales record(s) are linked. Set quantity to 0 to archive instead.`,
      });
    }

    const deleted = await Produce.findOneAndDelete({ produce_id: id }).lean();
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Produce ${id} not found.` });
    }

    return res.status(200).json({
      success: true,
      message: `Produce ${id} deleted from MongoDB.`,
      data: deleted,
    });
  } catch (err) {
    console.error('Delete produce error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete produce.' });
  }
}

// GET /api/categories - Fetch all categories
async function getAllCategories(req, res) {
  try {
    const data = await Category.find().sort({ category_id: 1 }).lean();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load categories.' });
  }
}

module.exports = {
  getAllProduce,
  getProduceById,
  createProduce,
  updateProduce,
  deleteProduce,
  getAllCategories,
};

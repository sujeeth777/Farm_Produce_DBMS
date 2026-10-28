const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./db");

const Category = require("../models/Category");
const Produce = require("../models/Produce");
const Sale = require("../models/Sale");
const User = require("../models/User");

const seedDatabase = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    console.log("");
    console.log("======================================");
    console.log("Starting FarmHub database seed...");
    console.log("======================================");
    console.log("");

    // -----------------------------------------
    // CLEAR EXISTING FARMHUB DATA
    // -----------------------------------------

    console.log("Clearing existing FarmHub data...");

    await Sale.deleteMany({});
    await Produce.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});

    console.log("Existing FarmHub data cleared.");
    console.log("");

    // -----------------------------------------
    // CATEGORIES
    // -----------------------------------------

    console.log("Creating categories...");

    const categories = await Category.insertMany([
      {
        category_id: 1,
        category_name: "Vegetables"
      },
      {
        category_id: 2,
        category_name: "Fruits"
      },
      {
        category_id: 3,
        category_name: "Grains"
      },
      {
        category_id: 4,
        category_name: "Pulses"
      }
    ]);

    console.log(`${categories.length} categories created.`);
    console.log("");

    // -----------------------------------------
    // PRODUCE
    // -----------------------------------------

    console.log("Creating produce records...");

    const produces = await Produce.insertMany([
      {
        produce_id: "P001",
        name: "Tomato",
        category_id: 1,
        category: "Vegetables",
        price_per_kg: 40,
        available_quantity: 90
      },
      {
        produce_id: "P002",
        name: "Potato",
        category_id: 1,
        category: "Vegetables",
        price_per_kg: 30,
        available_quantity: 130
      },
      {
        produce_id: "P003",
        name: "Onion",
        category_id: 1,
        category: "Vegetables",
        price_per_kg: 35,
        available_quantity: 120
      },
      {
        produce_id: "P004",
        name: "Carrot",
        category_id: 1,
        category: "Vegetables",
        price_per_kg: 50,
        available_quantity: 80
      },
      {
        produce_id: "P005",
        name: "Cabbage",
        category_id: 1,
        category: "Vegetables",
        price_per_kg: 32,
        available_quantity: 65
      },
      {
        produce_id: "P006",
        name: "Apple",
        category_id: 2,
        category: "Fruits",
        price_per_kg: 120,
        available_quantity: 90
      },
      {
        produce_id: "P007",
        name: "Banana",
        category_id: 2,
        category: "Fruits",
        price_per_kg: 60,
        available_quantity: 200
      },
      {
        produce_id: "P008",
        name: "Mango",
        category_id: 2,
        category: "Fruits",
        price_per_kg: 100,
        available_quantity: 75
      },
      {
        produce_id: "P009",
        name: "Rice",
        category_id: 3,
        category: "Grains",
        price_per_kg: 65,
        available_quantity: 225
      },
      {
        produce_id: "P010",
        name: "Wheat",
        category_id: 3,
        category: "Grains",
        price_per_kg: 45,
        available_quantity: 180
      },
      {
        produce_id: "P011",
        name: "Corn",
        category_id: 3,
        category: "Grains",
        price_per_kg: 40,
        available_quantity: 100
      },
      {
        produce_id: "P012",
        name: "Green Gram",
        category_id: 4,
        category: "Pulses",
        price_per_kg: 110,
        available_quantity: 75
      },
      {
        produce_id: "P013",
        name: "Black Gram",
        category_id: 4,
        category: "Pulses",
        price_per_kg: 105,
        available_quantity: 60
      }
    ]);

    console.log(`${produces.length} produce records created.`);
    console.log("");

    // -----------------------------------------
    // USERS
    // -----------------------------------------

    console.log("Creating users...");

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      name: "FarmHub Administrator",
      email: "admin@farmhub.com",
      password: hashedPassword,
      role: "admin",
      farm_name: "Green Valley Farm"
    });

    await User.create({
      name: "FarmHub Farmer",
      email: "farmer@farmhub.com",
      password: hashedPassword,
      role: "farmer",
      farm_name: "Green Valley Farm"
    });

    await User.create({
      name: "FarmHub Manager",
      email: "manager@farmhub.com",
      password: hashedPassword,
      role: "manager",
      farm_name: "Green Valley Farm"
    });

    console.log("3 users created.");
    console.log("");

    // -----------------------------------------
    // SAMPLE SALES
    // -----------------------------------------

    console.log("Creating sample sales...");

    const sampleSales = [
      {
        sale_id: 1,
        produce_id: "P001",
        produce_name: "Tomato",
        category: "Vegetables",
        quantity_sold: 10,
        price_per_kg: 40,
        total_amount: 400
      },
      {
        sale_id: 2,
        produce_id: "P002",
        produce_name: "Potato",
        category: "Vegetables",
        quantity_sold: 20,
        price_per_kg: 30,
        total_amount: 600
      },
      {
        sale_id: 3,
        produce_id: "P009",
        produce_name: "Rice",
        category: "Grains",
        quantity_sold: 25,
        price_per_kg: 65,
        total_amount: 1625
      },
      {
        sale_id: 4,
        produce_id: "P007",
        produce_name: "Banana",
        category: "Fruits",
        quantity_sold: 15,
        price_per_kg: 60,
        total_amount: 900
      }
    ];

    await Sale.insertMany(sampleSales);

    console.log(`${sampleSales.length} sample sales created.`);
    console.log("");

    // -----------------------------------------
    // FINAL SUMMARY
    // -----------------------------------------

    const categoryCount = await Category.countDocuments();
    const produceCount = await Produce.countDocuments();
    const saleCount = await Sale.countDocuments();
    const userCount = await User.countDocuments();

    const totalStock = await Produce.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$available_quantity"
          }
        }
      }
    ]);

    const totalSales = await Sale.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$total_amount"
          }
        }
      }
    ]);

    console.log("======================================");
    console.log("FarmHub database seeded successfully!");
    console.log("======================================");
    console.log("");

    console.log(`Database: farmhub`);
    console.log(`Categories: ${categoryCount}`);
    console.log(`Produce: ${produceCount}`);
    console.log(`Sales: ${saleCount}`);
    console.log(`Users: ${userCount}`);
    console.log(
      `Total available stock: ${totalStock[0]?.total || 0} kg`
    );
    console.log(
      `Total sales value: ₹${totalSales[0]?.total || 0}`
    );

    console.log("");
    console.log("Demo accounts:");
    console.log("--------------------------------------");
    console.log("Admin");
    console.log("Email: admin@farmhub.com");
    console.log("Password: Admin@123");
    console.log("");
    console.log("Farmer");
    console.log("Email: farmer@farmhub.com");
    console.log("Password: Admin@123");
    console.log("");
    console.log("Manager");
    console.log("Email: manager@farmhub.com");
    console.log("Password: Admin@123");
    console.log("--------------------------------------");
    console.log("");

    process.exit(0);

  } catch (error) {
    console.error("");
    console.error("======================================");
    console.error("FarmHub database seeding failed!");
    console.error("======================================");
    console.error("");
    console.error(error);
    console.error("");

    process.exit(1);
  }
};

seedDatabase();
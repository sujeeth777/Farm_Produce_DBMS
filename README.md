# 🌱 Farm Produce DBMS — Full Stack MERN Application

**IA3 Assessment Project — Full Stack Web Application**

A complete Farm Produce Inventory & Sales Management System built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) with **Bootstrap** for responsive UI design.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js 18, React Router, Bootstrap 5, Bootstrap Icons, Axios |
| **Backend** | Node.js, Express.js 5 |
| **Database** | MongoDB (Mongoose ODM) |
| **Build Tool** | Vite |

---

## ✨ Features

### CRUD Operations (Create, Read, Update, Delete)
- **Create**: Add new farm produce items with auto-generated IDs
- **Read**: Browse all inventory with search, category filters, stock level filters, and sorting
- **Update**: Edit produce details (name, category, price, quantity) via modal dialogs; quick restock
- **Delete**: Remove produce items with referential integrity checks (blocks deletion if sales exist)

### Sales & Billing (Point of Sale)
- Record customer sales with live stock deduction
- Dynamic produce selection with real-time availability display
- Auto-calculated bill totals (price × quantity)
- Prevents overselling (validates stock before processing)
- Full historical sales ledger with filtering and sorting

### Dashboard Analytics
- KPI cards: Total Produce, Inventory Weight, Revenue, Transactions
- Low-stock warning banners
- Recent transactions table
- Top-selling crops ranking
- Category distribution progress bars

### Authentication
- User registration and login (stored in MongoDB)
- JWT token-based session management
- Demo 1-click login for evaluation

---

## 📁 Project Structure

```
Farm_Produce_DBMS/
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB/Mongoose connection
│   │   └── seed.js             # Auto-seed initial data
│   ├── controllers/
│   │   ├── authController.js   # Login, register, demo credentials
│   │   ├── produceController.js # CRUD for produce & categories
│   │   └── salesController.js  # Sales recording & dashboard metrics
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT token verify middleware
│   ├── models/
│   │   ├── Category.js         # Mongoose schema for categories
│   │   ├── Produce.js          # Mongoose schema for produce
│   │   ├── Sale.js             # Mongoose schema for sales
│   │   └── User.js             # Mongoose schema for users
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth/* endpoints
│   │   ├── produceRoutes.js    # /api/produce/* endpoints
│   │   └── salesRoutes.js      # /api/sales/* endpoints
│   ├── .env                    # Environment variables
│   ├── package.json
│   └── server.js               # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeleteModal.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProduceModal.jsx
│   │   │   └── StockModal.jsx
│   │   ├── pages/
│   │   │   ├── AddProduce.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ProduceList.jsx
│   │   │   └── SalesPoint.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios API client
│   │   ├── App.jsx             # React Router setup
│   │   ├── index.css           # Custom styles
│   │   └── main.jsx            # Entry point
│   ├── dist/                   # Production build output
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── database/
│   └── mongo-init.js           # MongoDB shell seed script
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (download: https://nodejs.org)
- **MongoDB** Community Server (download: https://www.mongodb.com/try/download/community)
  - Or the server will auto-start an embedded MongoDB if `mongodb-memory-server` is installed

### 1. Clone the Repository
```bash
git clone https://github.com/sujeeth777/Farm_Produce_DBMS.git
cd Farm_Produce_DBMS
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies & Build
```bash
cd ../frontend
npm install
npm run build
```

### 4. Configure Environment
Create `backend/.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/farm_produce_db
PORT=5000
JWT_SECRET=farmhub-ia3-secret-key-2026
```

### 5. Start MongoDB
```bash
# In a separate terminal (if using local MongoDB):
mongod
```

### 6. Start the Application
```bash
cd backend
npm start
```

### 7. Open in Browser
Navigate to **http://localhost:5000**

The database is **automatically seeded** with 6 categories, 15 produce items, and 8 sales records on first run.

---

## 📡 REST API Endpoints

### Produce (CRUD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/produce` | List all produce (search, filter, sort) |
| GET | `/api/produce/:id` | Get single produce by ID |
| POST | `/api/produce` | Create new produce item |
| PUT | `/api/produce/:id` | Update produce details |
| DELETE | `/api/produce/:id` | Delete produce item |
| GET | `/api/categories` | List all categories |

### Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sales` | List sales ledger |
| POST | `/api/sales` | Record new sale (deducts stock) |
| GET | `/api/sales/dashboard-summary` | Dashboard KPIs & analytics |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/register` | Create account |
| GET | `/api/auth/me` | Get current user |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health & DB status |

---

## 📊 MongoDB Collections

### `categories`
```json
{ "category_id": 1, "category_name": "Vegetable" }
```

### `produces`
```json
{
  "produce_id": "P001",
  "name": "Tomato",
  "category_id": 1,
  "category": "Vegetable",
  "price_per_kg": 40,
  "available_quantity": 105
}
```

### `sales`
```json
{
  "sale_id": 1,
  "produce_id": "P001",
  "produce_name": "Tomato",
  "category": "Vegetable",
  "quantity_sold": 15,
  "price_per_kg": 40,
  "total_amount": 600,
  "sale_date": "2026-10-28T11:00:00.000Z"
}
```

### `users`
```json
{
  "name": "Ramesh Patel",
  "email": "farmer@farmhub.com",
  "password": "<hashed>",
  "role": "farmer",
  "farm_name": "Green Valley Farm"
}
```

---

## 🔐 Demo Login Credentials

| Email | Password | Role |
|-------|----------|------|
| farmer@farmhub.com | Password123! | Farm Manager |
| admin@farmhub.com | Password123! | Inventory Director |

---

## 📝 License

Academic project for IA3 assessment. Built by Sujeeth.

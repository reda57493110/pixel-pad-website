const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('pixel_pad.db');

// Initialize database tables
db.serialize(() => {
  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    description TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_email TEXT,
    notes TEXT,
    total_amount REAL NOT NULL,
    payment_method TEXT DEFAULT 'COD',
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Order items table
  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);

  // Users table (for admin)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert sample products
  const sampleProducts = [
    {
      name: 'Gaming PC - Intel i7, RTX 4070',
      category: 'Desktop',
      price: 1299.99,
      stock: 5,
      description: 'High-performance gaming desktop with Intel i7 processor and RTX 4070 graphics card.',
      image: '/images/gaming-pc.jpg'
    },
    {
      name: 'MacBook Pro 14" M3',
      category: 'Laptop',
      price: 1999.99,
      stock: 3,
      description: 'Apple MacBook Pro with M3 chip, 14-inch display, perfect for professionals.',
      image: '/images/macbook-pro.jpg'
    },
    {
      name: 'Dell XPS 13',
      category: 'Laptop',
      price: 1199.99,
      stock: 7,
      description: 'Ultra-thin laptop with stunning display and excellent performance.',
      image: '/images/dell-xps.jpg'
    },
    {
      name: 'Gaming Mouse - Logitech G502',
      category: 'Accessories',
      price: 79.99,
      stock: 15,
      description: 'High-precision gaming mouse with customizable buttons and RGB lighting.',
      image: '/images/gaming-mouse.jpg'
    },
    {
      name: 'Mechanical Keyboard - Corsair K95',
      category: 'Accessories',
      price: 199.99,
      stock: 8,
      description: 'Premium mechanical keyboard with Cherry MX switches and RGB backlighting.',
      image: '/images/mechanical-keyboard.jpg'
    },
    {
      name: 'Monitor - ASUS 27" 4K',
      category: 'Accessories',
      price: 399.99,
      stock: 12,
      description: '27-inch 4K monitor with excellent color accuracy and fast refresh rate.',
      image: '/images/4k-monitor.jpg'
    }
  ];

  // Check if products exist, if not insert sample data
  db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO products (name, category, price, stock, description, image) VALUES (?, ?, ?, ?, ?, ?)");
      sampleProducts.forEach(product => {
        stmt.run(product.name, product.category, product.price, product.stock, product.description, product.image);
      });
      stmt.finalize();
    }
  });

  // Create default admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.run("INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", 
    ['admin', 'pixelpad77@gmail.com', hashedPassword, 'admin']);
});

// Routes

// Get all products
app.get('/api/products', (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM products';
  let params = [];

  if (category && category !== 'all') {
    query += ' WHERE category = ?';
    params.push(category);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(row);
  });
});

// Get categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM products ORDER BY category', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.category));
  });
});

// Create order
app.post('/api/orders', (req, res) => {
  const { customer, items, total } = req.body;
  
  db.run('INSERT INTO orders (customer_name, customer_phone, customer_address, customer_email, notes, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
    [customer.name, customer.phone, customer.address, customer.email, customer.notes, total],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const orderId = this.lastID;
      
      // Insert order items
      const stmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
      items.forEach(item => {
        stmt.run(orderId, item.id, item.quantity, item.price);
      });
      stmt.finalize();
      
      res.json({ orderId, message: 'Order placed successfully' });
    });
});

// Get all orders (admin)
app.get('/api/orders', (req, res) => {
  db.all(`
    SELECT o.*, 
           GROUP_CONCAT(p.name || ' (x' || oi.quantity || ')') as products
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Order status updated successfully' });
  });
});

// Admin login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });
});

// Serve static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PIXEL PAD server running on port ${PORT}`);
});

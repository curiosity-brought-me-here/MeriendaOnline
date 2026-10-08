import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "meriendaonline"
});

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Custom error message for database errors
const dbErrorMessage = "Det är inte dig, det är databasens issue. Ta det lugnt. Sjunga lite karaoke och försök igen senare.";

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const [products] = await db.query("SELECT * FROM products");
    res.json(products);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: dbErrorMessage });
  }
});

// Get single product by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const [products] = await db.query("SELECT * FROM products WHERE id = ?", [productId]);

    if (products.length === 0) {
      return res.status(404).json({ error: "Produkten hittades inte. Sorry." });
    }

    res.json(products[0]);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: dbErrorMessage });
  }
});

// Create new order
app.post("/api/orders", async (req, res) => {
  try {
    const { name, email, mobile, delivery_address, items } = req.body;

    // 1. Basic validation
    if (!name || !email || !items || items.length === 0) {
      return res.status(400).json({
        error: "Åh nej, du missade lite information. Du måste verkligen vara hungrig. Dubbelkolla gärna och försök igen."
      });
    }

    // 2. Insert customer into 'customers' table
    const [customerResult] = await db.query(
      "INSERT INTO customers (name, email, mobile, delivery_address) VALUES (?, ?, ?, ?)",
      [name, email, mobile, delivery_address]
    );
    const customerId = customerResult.insertId;

    // 3. Calculate total amount and insert into 'orders' table
    let totalAmount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      totalAmount += Number(item.unit_price) * Number(item.quantity);
    }

    const [orderResult] = await db.query(
      "INSERT INTO orders (customer_id, total_amount) VALUES (?, ?)",
      [customerId, totalAmount]
    );

    // Get the newly created order's ID
    const orderId = orderResult.insertId;

    // 4. Insert each purchased item into 'order_items' table
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.unit_price]
      );
    }

    // 5. Return status 201 Created and the orderId
    res.status(201).json({ message: "Order skapad!", orderId: orderId });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: dbErrorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
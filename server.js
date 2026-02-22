const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ================== DATA (TEMP STORAGE) ==================
let users = [];
let books = [
  { id: 1, title: "Harry Potter", author: "J.K Rowling", price: 450 },
  { id: 2, title: "Atomic Habits", author: "James Clear", price: 300 },
  { id: 3, title: "The Alchemist", author: "Paulo Coelho", price: 280 },
  { id: 4, title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", price: 350 }
];
let carts = {};
let orders = [];

// ================== ROUTES ==================

// Register
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  let existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ message: "User already exists" });
  }

  let user = { id: users.length + 1, name, email, password };
  users.push(user);

  res.json({ message: "Registered successfully", user });
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  let user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful", user });
});

// Get all books
app.get("/books", (req, res) => {
  res.json(books);
});

// Add to cart
app.post("/cart", (req, res) => {
  const { userId, bookId } = req.body;

  if (!carts[userId]) {
    carts[userId] = [];
  }

  let book = books.find(b => b.id === bookId);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  carts[userId].push(book);
  res.json({ message: "Added to cart", cart: carts[userId] });
});

// View cart
app.get("/cart/:userId", (req, res) => {
  const userId = req.params.userId;
  res.json(carts[userId] || []);
});

// Place order
app.post("/order", (req, res) => {
  const { userId } = req.body;

  let userCart = carts[userId];
  if (!userCart || userCart.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  let total = userCart.reduce((sum, b) => sum + b.price, 0);

  let order = {
    id: orders.length + 1,
    userId,
    items: userCart,
    total,
    date: new Date().toLocaleString()
  };

  orders.push(order);
  carts[userId] = [];

  res.json({ message: "Order placed", order });
});

// View orders
app.get("/orders/:userId", (req, res) => {
  const userId = req.params.userId;
  let userOrders = orders.filter(o => o.userId == userId);
  res.json(userOrders);
});

// ================== START SERVER ==================
const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
// target-account-matching-api/index.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'SECRET_KEY';
const dotenv = require('dotenv')
dotenv.config()

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schemas
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const companySchema = new mongoose.Schema({
  name: String,
  matchScore: Number,
  status: {
    type: String,
    enum: ['Prospect', 'Target', 'Not Interested'],
    default: 'Prospect',
  },
});

const User = mongoose.model('User', userSchema);
const Company = mongoose.model('Company', companySchema);

// Auth Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token required' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

// Routes

// Register (Optional)
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, password: hashed });
  res.json({ message: 'User registered' });
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token });
});

// Get accounts
app.get('/accounts', authMiddleware, async (req, res) => {
  const companies = await Company.find();
  res.json(companies);
});

// Update status
app.post('/accounts/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  await Company.findByIdAndUpdate(id, { status });
  res.json({ message: 'Status updated' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    console.log(`[REGISTER] New user: ${user.email} (role: ${user.role})`);

    res.status(201).json({ msg: 'User registered successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    res.status(500).json({ msg: 'Server error during registration' });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log(`[LOGIN] User logged in: ${user.email} (role: ${user.role})`);

    res.json({
      token,
      role: user.role,
      userId: user._id
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ msg: 'Server error during login' });
  }
};

module.exports = { registerUser, loginUser };

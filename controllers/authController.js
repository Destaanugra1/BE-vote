const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabaseClient');
const { hashPassword, comparePassword } = require('../utils/hash');

exports.register = async (req, res) => {
  const { npm, password } = req.body;
  try {
    // Cek apakah user sudah ada
    const { data: existingUser, error: queryError } = await supabase
      .from('users')
      .select('id')
      .eq('npm', npm);

    if (queryError) throw queryError;

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashed = await hashPassword(password);

    // Insert user baru
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ npm, password_hash: hashed, role: 'user' }]);
    if (insertError) throw insertError;

    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { npm, password } = req.body;
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('npm', npm)
      .single();

    if (error) throw error;

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({
      token,
      user: {
        id: user.id,
        npm: user.npm,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

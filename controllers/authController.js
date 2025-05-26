const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabaseClient');
const { hashPassword, comparePassword } = require('../utils/hash');

exports.register = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${email},username.eq.${username}`);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashed = await hashPassword(password);
    const { data, error } = await supabase.from('users').insert([{ email, username, password_hash: hashed }]);
    if (error) throw error;

    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

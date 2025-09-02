// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/user');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  createUser(name, email, hashedPassword, (err) => {
    if (err) return res.status(400).json({ message: 'Error al registrar' });
    res.status(201).json({ message: 'Usuario creado' });
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  findUserByEmail(email, async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ message: 'Credenciales inválidas' });

    const user = results[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, 'secret_key', { expiresIn: '1h' });
    res.json({ token, name: user.name, role: user.role });
  });
});

module.exports = router;
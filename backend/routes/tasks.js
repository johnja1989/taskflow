const express = require('express');
const jwt = require('jsonwebtoken');
const { createTask, getTasksByUserId, updateTaskStatus, deleteTask } = require('../models/task');
const connection = require('../database/connection');

const router = express.Router();

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Acceso denegado' });

  jwt.verify(token, 'secret_key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
};

// POST /api/tasks - Crear tarea (usuario normal)
router.post('/', authenticate, (req, res) => {
  const { title, description, due_date, priority, status } = req.body;

  if (!title || !status) {
    return res.status(400).json({ message: 'Título y estado son obligatorios' });
  }

  const safePriority = ['baja', 'media', 'alta'].includes(priority) ? priority : 'media';
  const safeStatus = ['pendiente', 'en_proceso', 'completada'].includes(status) ? status : 'pendiente';

  createTask(
    req.user.id,
    title,
    description,
    due_date,
    safePriority,
    safeStatus,
    (err) => {
      if (err) {
        console.error('Error al crear tarea:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }
      res.status(201).json({ message: 'Tarea creada' });
    }
  );
});

// GET /api/tasks - Ver solo mis tareas
router.get('/', authenticate, (req, res) => {
  getTasksByUserId(req.user.id, (err, tasks) => {
    if (err) {
      console.error('Error al obtener tareas:', err);
      return res.status(500).json({ message: 'Error al obtener tareas' });
    }
    res.json(tasks);
  });
});

// GET /api/admin/tasks - Ver TODAS las tareas (solo admin)
router.get('/admin/tasks', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado: permisos de administrador requeridos' });
  }

  const sql = `
    SELECT u.name as creator, u.email, t.* 
    FROM tasks t
    JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC
  `;

  connection.query(sql, (err, tasks) => {
    if (err) {
      console.error('Error al obtener tareas de todos los usuarios:', err);
      return res.status(500).json({ message: 'Error al obtener tareas' });
    }
    res.json(tasks);
  });
});

// POST /api/admin/users - Crear usuario (solo admin)
router.post('/admin/users', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  const { name, email, password } = req.body;
  const hashedPassword = require('bcrypt').hashSync(password, 10); // Sync para no usar async aquí

  const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
  connection.query(sql, [name, email, hashedPassword, 'user'], (err) => {
    if (err) return res.status(400).json({ message: 'Error al crear usuario' });
    res.status(201).json({ message: 'Usuario creado por administrador' });
  });
});

// PUT /api/tasks/:id/status
router.put('/:id/status', authenticate, (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: 'Estado es requerido' });
  updateTaskStatus(req.params.id, status, (err) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar estado' });
    res.json({ message: 'Estado actualizado' });
  });
});

// DELETE /api/tasks/:id
router.delete('/:id', authenticate, (req, res) => {
  deleteTask(req.params.id, (err) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar tarea' });
    res.json({ message: 'Tarea eliminada' });
  });
});

module.exports = router;
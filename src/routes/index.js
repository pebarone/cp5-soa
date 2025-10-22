// src/routes/index.js
const express = require('express');
const guestRoutes = require('./guest.routes');
const roomRoutes = require('./room.routes');
const reservationRoutes = require('./reservation.routes');

const router = express.Router();

// Rota raiz da API (opcional)
router.get('/', (req, res) => {
    res.json({ message: 'Bem-vindo à API de Reserva de Hotel!' });
});

// Monta as rotas dos recursos
router.use('/guests', guestRoutes);
router.use('/rooms', roomRoutes);
router.use('/reservations', reservationRoutes);

module.exports = router;
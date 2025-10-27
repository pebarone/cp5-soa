// src/routes/index.js
const express = require('express');
const path = require('path');
const guestRoutes = require('./guest.routes');
const roomRoutes = require('./room.routes');
const reservationRoutes = require('./reservation.routes');

const router = express.Router();

// Rota raiz da API (opcional)
router.get('/', (req, res) => {
    res.json({ message: 'Bem-vindo à API de Reserva de Hotel!' });
});

// Rota para download da Postman Collection
router.get('/postman-collection', (req, res) => {
    const collectionPath = path.join(__dirname, '../config/postman-collection.json');
    res.download(collectionPath, 'hotel-api.postman_collection.json', (err) => {
        if (err) {
            console.error('Erro ao enviar arquivo:', err);
            res.status(500).json({ error: 'Erro ao baixar a collection' });
        }
    });
});

// Monta as rotas dos recursos
router.use('/guests', guestRoutes);
router.use('/rooms', roomRoutes);
router.use('/reservations', reservationRoutes);

module.exports = router;
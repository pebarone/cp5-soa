// test/controllers/guest.controller.test.js
const request = require('supertest');
const express = require('express');
const guestController = require('../../src/controllers/guest.controller');
const guestService = require('../../src/services/guest.service');
const { GuestResponseDTO } = require('../../src/dtos/guest.dto');
const errorHandler = require('../../src/middlewares/errorHandler');

// Mock the service
jest.mock('../../src/services/guest.service');

// Setup a minimal express app for testing the controller
const app = express();
app.use(express.json());
app.post('/guests', guestController.create);
app.get('/guests', guestController.findAll);
app.get('/guests/:id', guestController.findById);
app.put('/guests/:id', guestController.update);
app.delete('/guests/:id', guestController.delete);
app.use(errorHandler);

describe('GuestController', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /guests', () => {
        it('should create a guest and return 201', async () => {
            const mockGuest = { id: 'some-uuid', fullName: 'John Doe', email: 'john@test.com' };
            guestService.createGuest.mockResolvedValue(mockGuest);

            const res = await request(app)
                .post('/guests')
                .send({ fullName: 'John Doe', email: 'john@test.com' });

            expect(res.status).toBe(201);
            expect(res.body).toEqual(new GuestResponseDTO(mockGuest));
            expect(guestService.createGuest).toHaveBeenCalled();
        });
    });

    describe('GET /guests', () => {
        it('should return a list of guests and 200', async () => {
            const mockGuests = [
                { id: 'uuid-1', fullName: 'John Doe', email: 'john@test.com' },
                { id: 'uuid-2', fullName: 'Jane Doe', email: 'jane@test.com' },
            ];
            guestService.getAllGuests.mockResolvedValue(mockGuests);

            const res = await request(app).get('/guests');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockGuests.map(g => new GuestResponseDTO(g)));
        });
    });

    describe('GET /guests/:id', () => {
        it('should return a single guest and 200', async () => {
            const mockGuest = { id: 'uuid-1', fullName: 'John Doe', email: 'john@test.com' };
            guestService.getGuestById.mockResolvedValue(mockGuest);

            const res = await request(app).get('/guests/uuid-1');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(new GuestResponseDTO(mockGuest));
        });

        it('should return 404 if guest not found', async () => {
            guestService.getGuestById.mockRejectedValue({ name: 'NotFoundError', message: 'Not Found', statusCode: 404 });

            const res = await request(app).get('/guests/non-existent-uuid');

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /guests/:id', () => {
        it('should update a guest and return 200', async () => {
            const updatedGuest = { id: 'uuid-1', fullName: 'Johnathan Doe', email: 'john.d@test.com' };
            guestService.updateGuest.mockResolvedValue(updatedGuest);

            const res = await request(app)
                .put('/guests/uuid-1')
                .send({ fullName: 'Johnathan Doe', email: 'john.d@test.com' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(new GuestResponseDTO(updatedGuest));
        });
    });

    describe('DELETE /guests/:id', () => {
        it('should delete a guest and return 204', async () => {
            guestService.deleteGuest.mockResolvedValue(undefined); // delete service doesn't return content

            const res = await request(app).delete('/guests/uuid-1');

            expect(res.status).toBe(204);
        });
    });
});

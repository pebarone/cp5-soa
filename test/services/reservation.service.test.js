// test/services/reservation.service.test.js
const reservationService = require('../../src/services/reservation.service');
const reservationRepository = require('../../src/repositories/reservation.repository');
const roomRepository = require('../../src/repositories/room.repository');
const guestRepository = require('../../src/repositories/guest.repository');
const { v4: uuidv4 } = require('uuid');
const Reservation = require('../../src/models/reservation.model');
const Room = require('../../src/models/room.model');
const Guest = require('../../src/models/guest.model');

// Mock repositories and uuid
jest.mock('../../src/repositories/reservation.repository');
jest.mock('../../src/repositories/room.repository');
jest.mock('../../src/repositories/guest.repository');
jest.mock('uuid', () => ({ v4: jest.fn() }));

describe('ReservationService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createReservation', () => {
        it('should create a reservation successfully', async () => {
            const reservationData = {
                guestId: 'guest-uuid',
                roomId: 'room-uuid',
                checkinExpected: new Date('2025-12-01'),
                checkoutExpected: new Date('2025-12-05'),
            };
            const mockGuest = new Guest('guest-uuid', 'John Doe', 'john.doe@example.com', '12345678901');
            const mockRoom = new Room('room-uuid', 101, 'STANDARD', 2, 100, 'ATIVO');
            const mockReservation = new Reservation('res-uuid', ...Object.values(reservationData));

            guestRepository.findById.mockResolvedValue(mockGuest);
            roomRepository.findById.mockResolvedValue(mockRoom);
            reservationRepository.findConflictingReservations.mockResolvedValue([]);
            reservationRepository.create.mockResolvedValue(mockReservation);
            uuidv4.mockReturnValue('res-uuid');

            const result = await reservationService.createReservation(reservationData);

            expect(result).toBe(mockReservation);
            expect(guestRepository.findById).toHaveBeenCalledWith(reservationData.guestId);
            expect(roomRepository.findById).toHaveBeenCalledWith(reservationData.roomId);
            expect(reservationRepository.findConflictingReservations).toHaveBeenCalled();
            expect(reservationRepository.create).toHaveBeenCalled();
        });

        it('should throw NotFoundError if guest not found', async () => {
            const reservationData = {
                guestId: 'non-existent-guest-uuid',
                roomId: 'room-uuid',
                checkinExpected: new Date('2025-12-01'),
                checkoutExpected: new Date('2025-12-05'),
            };
            guestRepository.findById.mockResolvedValue(null);
            await expect(reservationService.createReservation(reservationData)).rejects.toThrow('Hóspede não encontrado');
        });

        it('should throw ConflictError if room is not available', async () => {
            const reservationData = {
                guestId: 'guest-uuid',
                roomId: 'room-uuid',
                checkinExpected: new Date('2025-12-01'),
                checkoutExpected: new Date('2025-12-05'),
            };
            const mockGuest = new Guest('guest-uuid', 'John Doe', 'john.doe@example.com', '12345678901');
            const mockRoom = new Room('room-uuid', 101, 'STANDARD', 2, 100, 'ATIVO');

            guestRepository.findById.mockResolvedValue(mockGuest);
            roomRepository.findById.mockResolvedValue(mockRoom);
            reservationRepository.findConflictingReservations.mockResolvedValue([{}]); // Simulate conflict

            await expect(reservationService.createReservation(reservationData)).rejects.toThrow('O quarto não está disponível para o período solicitado.');
        });
    });

    describe('cancelReservation', () => {
        it('should cancel a reservation successfully', async () => {
            const mockReservation = new Reservation('res-uuid', 'guest-uuid', 'room-uuid', new Date(), new Date(), Reservation.STATUS.CREATED);
            reservationRepository.findById.mockResolvedValue(mockReservation);
            reservationRepository.updateStatus.mockResolvedValue({ ...mockReservation, status: Reservation.STATUS.CANCELED });

            const result = await reservationService.cancelReservation('res-uuid');

            expect(result.status).toBe(Reservation.STATUS.CANCELED);
            expect(reservationRepository.updateStatus).toHaveBeenCalledWith('res-uuid', Reservation.STATUS.CANCELED);
        });

        it('should throw ConflictError if reservation status is not CREATED', async () => {
            const mockReservation = new Reservation('res-uuid', 'guest-uuid', 'room-uuid', new Date(), new Date(), Reservation.STATUS.CHECKED_IN);
            reservationRepository.findById.mockResolvedValue(mockReservation);

            await expect(reservationService.cancelReservation('res-uuid')).rejects.toThrow("Não é possível cancelar uma reserva com status 'CHECKED_IN'");
        });
    });

    // Add more tests for checkIn, checkOut, etc.
});

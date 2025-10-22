// test/repositories/room.repository.test.js
const roomRepository = require('../../src/repositories/room.repository');
const { execute } = require('../../src/config/database');
const Room = require('../../src/models/room.model');
const Reservation = require('../../src/models/reservation.model');

// Mocking the database module
jest.mock('../../src/config/database', () => ({
    execute: jest.fn(),
}));

describe('RoomRepository', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new room and return it', async () => {
            const roomData = {
                id: 'test-uuid',
                number: 101,
                type: Room.TYPES.STANDARD,
                capacity: 2,
                pricePerNight: 150,
                status: Room.STATUS.ATIVO,
            };

            execute.mockResolvedValue({ rowsAffected: 1 });

            const result = await roomRepository.create(roomData);

            expect(execute).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    id: roomData.id,
                    room_number: roomData.number,
                    type: roomData.type,
                    capacity: roomData.capacity,
                    price_per_night: roomData.pricePerNight,
                    status: roomData.status
                }),
                { autoCommit: true }
            );
            expect(result).toBeInstanceOf(Room);
            expect(result.id).toBe(roomData.id);
        });
    });

    describe('findById', () => {
        it('should return a room when found', async () => {
            const mockRoomRow = {
                ID: 'test-uuid',
                NUMBER: 101,
                TYPE: Room.TYPES.STANDARD,
                CAPACITY: 2,
                PRICE_PER_NIGHT: 150,
                STATUS: Room.STATUS.ATIVO,
            };
            execute.mockResolvedValue({ rows: [mockRoomRow] });

            const result = await roomRepository.findById('test-uuid');

            expect(execute).toHaveBeenCalledWith(expect.any(String), { id: 'test-uuid' });
            expect(result).toBeInstanceOf(Room);
            expect(result.id).toBe(mockRoomRow.ID);
        });

        it('should return null when room not found', async () => {
            execute.mockResolvedValue({ rows: [] });

            const result = await roomRepository.findById('non-existent-uuid');

            expect(result).toBeNull();
        });
    });

    describe('findAll', () => {
        it('should return an array of rooms', async () => {
            const mockRoomRows = [
                { ID: 'uuid-1', NUMBER: 101, TYPE: 'STANDARD', CAPACITY: 2, PRICE_PER_NIGHT: 100, STATUS: 'ATIVO' },
                { ID: 'uuid-2', NUMBER: 102, TYPE: 'DELUXE', CAPACITY: 3, PRICE_PER_NIGHT: 200, STATUS: 'ATIVO' },
            ];
            execute.mockResolvedValue({ rows: mockRoomRows });

            const result = await roomRepository.findAll();

            expect(execute).toHaveBeenCalledWith(expect.any(String));
            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBe(2);
            expect(result[0]).toBeInstanceOf(Room);
        });
    });

    describe('update', () => {
        it('should update a room and return the updated room', async () => {
            const roomData = {
                type: Room.TYPES.DELUXE,
                capacity: 3,
                pricePerNight: 200,
                status: Room.STATUS.INATIVO,
            };
            const mockUpdatedRoomRow = {
                ID: 'test-uuid',
                NUMBER: 101,
                TYPE: Room.TYPES.DELUXE,
                CAPACITY: 3,
                PRICE_PER_NIGHT: 200,
                STATUS: Room.STATUS.INATIVO,
            };

            // Mock the update call
            execute.mockResolvedValueOnce({ rowsAffected: 1 });
            // Mock the findById call within the update method
            execute.mockResolvedValueOnce({ rows: [mockUpdatedRoomRow] });


            const result = await roomRepository.update('test-uuid', roomData);

            expect(execute).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE'),
                expect.objectContaining({
                    id: 'test-uuid',
                    type: roomData.type,
                    capacity: roomData.capacity,
                    price_per_night: roomData.pricePerNight,
                    status: roomData.status
                }),
                { autoCommit: true }
            );
            expect(result).toBeInstanceOf(Room);
            expect(result.status).toBe(Room.STATUS.INATIVO);
        });

        it('should return null if room to update is not found', async () => {
            execute.mockResolvedValue({ rowsAffected: 0 });

            const result = await roomRepository.update('non-existent-uuid', {});

            expect(result).toBeNull();
        });
    });

    describe('delete', () => {
        it('should return the number of rows affected', async () => {
            execute.mockResolvedValue({ rowsAffected: 1 });

            const result = await roomRepository.delete('test-uuid');

            expect(execute).toHaveBeenCalledWith(expect.stringContaining('DELETE'), { id: 'test-uuid' }, { autoCommit: true });
            expect(result).toBe(1);
        });
    });

    describe('updateStatus', () => {
        it('should update the status of a room', async () => {
            execute.mockResolvedValue({ rowsAffected: 1 });

            const result = await roomRepository.updateStatus('test-uuid', Room.STATUS.INATIVO);

            expect(execute).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE RESERVAS_ROOMS SET status'),
                { new_status: Room.STATUS.INATIVO, id: 'test-uuid' },
                { autoCommit: true }
            );
            expect(result).toBe(1);
        });
    });
});

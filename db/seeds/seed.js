// db/seeds/seed.js

const API_URL = 'https://cp5-soa-684499909473.southamerica-east1.run.app/api';

async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    return response.json();
}

const guestsData = [
    { fullName: 'Ana Silva', document: '07609833053', email: 'ana.silva@example.com', phone: '11999991111' },
    { fullName: 'Bruno Souza', document: '39832278058', email: 'bruno.souza@example.com', phone: '21988882222' },
    { fullName: 'Carlos Pereira', document: '89318187009', email: 'carlos.pereira@example.com', phone: '31977773333' },
    { fullName: 'Daniela Almeida', document: '55910279033', email: 'daniela.almeida@example.com', phone: '41966664444' },
    { fullName: 'Eduardo Lima', document: '59994142020', email: 'eduardo.lima@example.com', phone: '51955555555' },
    { fullName: 'Fernanda Costa', document: '44524099034', email: 'fernanda.costa@example.com', phone: '61944446666' },
    { fullName: 'Gabriel Martins', document: '76873000094', email: 'gabriel.martins@example.com', phone: '71933337777' },
    { fullName: 'Heloisa Ribeiro', document: '73154432078', email: 'heloisa.ribeiro@example.com', phone: '81922228888' },
    { fullName: 'Igor Santos', document: '15626940065', email: 'igor.santos@example.com', phone: '91911119999' },
    { fullName: 'Juliana Oliveira', document: '45649398070', email: 'juliana.oliveira@example.com', phone: '11998765432' }
];

const roomsData = [
    { number: 101, type: 'STANDARD', capacity: 1, pricePerNight: 250.00, status: 'ATIVO' },
    { number: 102, type: 'STANDARD', capacity: 1, pricePerNight: 260.00, status: 'ATIVO' },
    { number: 201, type: 'DELUXE', capacity: 2, pricePerNight: 380.00, status: 'ATIVO' },
    { number: 202, type: 'DELUXE', capacity: 2, pricePerNight: 390.00, status: 'ATIVO' },
    { number: 301, type: 'SUITE', capacity: 4, pricePerNight: 520.00, status: 'ATIVO' },
    { number: 302, type: 'SUITE', capacity: 4, pricePerNight: 530.00, status: 'INATIVO' },
    { number: 103, type: 'STANDARD', capacity: 1, pricePerNight: 200.00, status: 'ATIVO' },
    { number: 203, type: 'DELUXE', capacity: 2, pricePerNight: 350.00, status: 'ATIVO' },
    { number: 401, type: 'SUITE', capacity: 5, pricePerNight: 600.00, status: 'ATIVO' },
    { number: 104, type: 'STANDARD', capacity: 1, pricePerNight: 255.00, status: 'INATIVO' }
];

async function seed() {
    try {
        console.log('Starting seed process...');

        // Note: This script assumes you will clear the database manually before running.
        // For example, by running your migration script to drop and recreate tables.
        // If you run this multiple times without clearing, you'll get errors for duplicate unique fields (like document/email).

        console.log('--- Seeding Guests ---');
        const createdGuests = [];
        for (const guest of guestsData) {
            try {
                const newGuest = await postData(`${API_URL}/guests`, guest);
                console.log('Created guest:', newGuest.fullName);
                createdGuests.push(newGuest);
            } catch (error) {
                console.error(`Failed to create guest ${guest.fullName}:`, error.message);
            }
        }

        console.log('\n--- Seeding Rooms ---');
        const createdRooms = [];
        for (const room of roomsData) {
            try {
                const newRoom = await postData(`${API_URL}/rooms`, room);
                console.log('Created room:', newRoom.number);
                createdRooms.push(newRoom);
            } catch (error) {
                console.error(`Failed to create room ${room.number}:`, error.message);
            }
        }

        if (createdGuests.length === 0 || createdRooms.length === 0) {
            console.error('\nCould not create guests or rooms, aborting reservation seeding.');
            return;
        }

        console.log('\n--- Seeding Reservations ---');
        const reservationsData = [
            { guestId: createdGuests[0].id, roomId: createdRooms[0].id, checkinExpected: '2025-11-10', checkoutExpected: '2025-11-15' },
            { guestId: createdGuests[1].id, roomId: createdRooms[2].id, checkinExpected: '2025-12-01', checkoutExpected: '2025-12-05' },
            { guestId: createdGuests[2].id, roomId: createdRooms[4].id, checkinExpected: '2026-01-20', checkoutExpected: '2026-01-22' },
            { guestId: createdGuests[3].id, roomId: createdRooms[1].id, checkinExpected: '2026-02-10', checkoutExpected: '2026-02-18' },
            { guestId: createdGuests[4].id, roomId: createdRooms[7].id, checkinExpected: '2026-03-05', checkoutExpected: '2026-03-10' },
            { guestId: createdGuests[5].id, roomId: createdRooms[6].id, checkinExpected: '2026-04-01', checkoutExpected: '2026-04-07' },
            { guestId: createdGuests[6].id, roomId: createdRooms[8].id, checkinExpected: '2026-05-15', checkoutExpected: '2026-05-20' },
            { guestId: createdGuests[7].id, roomId: createdRooms[3].id, checkinExpected: '2026-06-20', checkoutExpected: '2026-06-25' },
            { guestId: createdGuests[8].id, roomId: createdRooms[0].id, checkinExpected: '2026-07-01', checkoutExpected: '2026-07-03' },
            { guestId: createdGuests[9].id, roomId: createdRooms[2].id, checkinExpected: '2026-08-10', checkoutExpected: '2026-08-12' }
        ];

        for (const reservation of reservationsData) {
            try {
                const newReservation = await postData(`${API_URL}/reservations`, reservation);
                console.log(`Created reservation for guest ${newReservation.guestId}`);
            } catch (error) {
                console.error(`Failed to create reservation for guest ${reservation.guestId}:`, error.message);
            }
        }

        console.log('\nSeed process finished!');

    } catch (error) {
        console.error('\nAn error occurred during the seed process:', error);
    }
}

seed();
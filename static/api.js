// API Manager - Centralized HTTP Communication
class API {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            // Handle 204 No Content
            if (response.status === 204) {
                return null;
            }

            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.message || data.error || 'Erro na requisição',
                    errors: data.errors || []
                };
            }

            return data;
        } catch (error) {
            if (error.status) {
                throw error;
            }
            throw {
                status: 0,
                message: 'Erro de conexão com o servidor',
                errors: []
            };
        }
    }

    // Generic CRUD methods
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Guests API
class GuestsAPI extends API {
    constructor() {
        super('/api');
    }

    async getAll() {
        return this.get('/guests');
    }

    async getById(id) {
        return this.get(`/guests/${id}`);
    }

    async create(guestData) {
        return this.post('/guests', guestData);
    }

    async update(id, guestData) {
        return this.put(`/guests/${id}`, guestData);
    }

    async delete(id) {
        return super.delete(`/guests/${id}`);
    }
}

// Rooms API
class RoomsAPI extends API {
    constructor() {
        super('/api');
    }

    async getAll(filters = {}) {
        const queryParams = new URLSearchParams();
        
        if (filters.availableFrom) queryParams.append('availableFrom', filters.availableFrom);
        if (filters.availableTo) queryParams.append('availableTo', filters.availableTo);
        if (filters.capacity) queryParams.append('capacity', filters.capacity);
        
        const query = queryParams.toString();
        return this.get(`/rooms${query ? `?${query}` : ''}`);
    }

    async getById(id) {
        return this.get(`/rooms/${id}`);
    }

    async create(roomData) {
        return this.post('/rooms', roomData);
    }

    async update(id, roomData) {
        return this.put(`/rooms/${id}`, roomData);
    }

    async activate(id) {
        return this.patch(`/rooms/${id}/activate`);
    }

    async deactivate(id) {
        return this.patch(`/rooms/${id}/deactivate`);
    }
}

// Reservations API
class ReservationsAPI extends API {
    constructor() {
        super('/api');
    }

    async getAll(filters = {}) {
        const queryParams = new URLSearchParams();
        
        if (filters.guestId) queryParams.append('guestId', filters.guestId);
        if (filters.roomId) queryParams.append('roomId', filters.roomId);
        
        const query = queryParams.toString();
        return this.get(`/reservations${query ? `?${query}` : ''}`);
    }

    async getById(id) {
        return this.get(`/reservations/${id}`);
    }

    async create(reservationData) {
        return this.post('/reservations', reservationData);
    }

    async update(id, reservationData) {
        return this.put(`/reservations/${id}`, reservationData);
    }

    async cancel(id) {
        return this.patch(`/reservations/${id}/cancel`);
    }

    async checkIn(id) {
        return this.patch(`/reservations/${id}/check-in`);
    }

    async checkOut(id) {
        return this.patch(`/reservations/${id}/check-out`);
    }
}

// Export API instances
export const guestsAPI = new GuestsAPI();
export const roomsAPI = new RoomsAPI();
export const reservationsAPI = new ReservationsAPI();

// Reservations Module
import { reservationsAPI, guestsAPI, roomsAPI, getErrorMessage } from './api.js';
import { showToast, showModal, closeModal, showLoading, hideLoading } from './app.js';

// Status que correspondem ao backend
const RESERVATION_STATUS = {
    CREATED: 'CREATED',
    CHECKED_IN: 'CHECKED_IN',
    CHECKED_OUT: 'CHECKED_OUT',
    CANCELED: 'CANCELED'
};

// Labels amigáveis para exibição
const STATUS_LABELS = {
    'CREATED': 'Pendente',
    'CHECKED_IN': 'Check-in',
    'CHECKED_OUT': 'Check-out',
    'CANCELED': 'Cancelada'
};

/**
 * Parseia uma entrada de data para um objeto Date em timezone local.
 * Aceita string no formato YYYY-MM-DD (ou ISO) ou um objeto Date.
 * Evita problemas de conversão UTC que podem resultar no dia anterior.
 * @param {string | Date | null | undefined} dateInput - String ou Date
 * @returns {Date|null} Objeto Date ou null se inválido
 */
function parseLocalDate(dateInput) {
    if (!dateInput) return null;
    
    // Se já for Date válido, normaliza para ano/mês/dia no timezone local
    if (dateInput instanceof Date) {
        if (isNaN(dateInput.getTime())) return null;
        return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
    }
    
    // Garante que vamos operar apenas sobre strings
    if (typeof dateInput !== 'string') return null;
    
    // Extrai apenas a parte da data se for ISO completo
    const datePart = dateInput.split('T')[0];
    
    // Valida formato YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(datePart)) return null;
    
    const [year, month, day] = datePart.split('-').map(Number);
    // Cria Date em timezone local (mês é 0-indexed)
    const date = new Date(year, month - 1, day);
    
    // Valida se a data é válida
    if (isNaN(date.getTime())) return null;
    
    // Valida se os valores correspondem (evita datas como 2023-02-30)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return null;
    }
    
    return date;
}

export function renderReservationsPage() {
    const content = `
        <div class="page-header">
            <div>
                <h1 class="page-title">Reservas</h1>
                <p class="page-subtitle">Gerencie as reservas do hotel</p>
            </div>
            <button class="btn btn-primary" id="add-reservation-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Nova Reserva
            </button>
        </div>

        <div class="filters">
            <h3 class="filters-title">Filtrar Reservas</h3>
            <form id="filter-form" class="form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Hóspede</label>
                        <select class="form-select" name="guestId" id="filter-guest">
                            <option value="">Todos os hóspedes</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Quarto</label>
                        <select class="form-select" name="roomId" id="filter-room">
                            <option value="">Todos os quartos</option>
                        </select>
                    </div>
                </div>
                <div class="form-actions" style="justify-content: flex-start;">
                    <button type="submit" class="btn btn-primary">Filtrar</button>
                    <button type="button" class="btn btn-secondary" id="clear-filters-btn">Limpar</button>
                </div>
            </form>
        </div>

        <div class="card">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Hóspede</th>
                            <th>Quarto</th>
                            <th>Check-in</th>
                            <th>Check-out</th>
                            <th>Status</th>
                            <th class="text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="reservations-table-body">
                        <tr>
                            <td colspan="6" class="text-center">
                                <div class="spinner"></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('page-content').innerHTML = content;
    
    // Event Listeners
    document.getElementById('add-reservation-btn').addEventListener('click', () => openReservationModal());
    document.getElementById('filter-form').addEventListener('submit', handleFilter);
    document.getElementById('clear-filters-btn').addEventListener('click', () => {
        document.getElementById('filter-form').reset();
        loadReservations();
    });
    
    // Load filter options and reservations
    loadFilterOptions();
    loadReservations();
}

async function loadReservations(filters = {}) {
    try {
        const reservations = await reservationsAPI.getAll(filters);
        renderReservationsTable(reservations);
    } catch (error) {
        showToast(getErrorMessage(error), 'error');
        renderReservationsTable([]);
    }
}

async function loadFilterOptions() {
    try {
        const [guests, rooms] = await Promise.all([
            guestsAPI.getAll(),
            roomsAPI.getAll()
        ]);
        
        const guestSelect = document.getElementById('filter-guest');
        const roomSelect = document.getElementById('filter-room');
        
        // Populate guest filter
        guests.forEach(guest => {
            const option = document.createElement('option');
            option.value = guest.id;
            option.textContent = `${guest.fullName} - ${guest.document}`;
            guestSelect.appendChild(option);
        });
        
        // Populate room filter
        rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = `Quarto ${room.number} - ${room.type}`;
            roomSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar opções de filtro:', error);
    }
}

function handleFilter(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const filters = {};
    
    if (formData.get('guestId')) filters.guestId = formData.get('guestId');
    if (formData.get('roomId')) filters.roomId = formData.get('roomId');
    
    loadReservations(filters);
}

function renderReservationsTable(reservations) {
    const tbody = document.getElementById('reservations-table-body');
    
    if (reservations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <h3>Nenhuma reserva encontrada</h3>
                        <p>Crie a primeira reserva para começar</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = reservations.map(reservation => `
        <tr>
            <td><strong>${reservation.guest?.fullName || 'N/A'}</strong></td>
            <td>Quarto ${reservation.room?.number || 'N/A'}</td>
            <td>${formatDate(reservation.checkinExpected)}</td>
            <td>${formatDate(reservation.checkoutExpected)}</td>
            <td>
                <span class="badge badge-${getStatusColor(reservation.status)}">${STATUS_LABELS[reservation.status] || reservation.status}</span>
            </td>
            <td class="text-right">
                <div class="flex gap-1" style="justify-content: flex-end;">
                    <button class="btn btn-sm btn-ghost" onclick="viewReservation('${reservation.id}')" title="Visualizar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    
                    ${reservation.status === RESERVATION_STATUS.CREATED ? `
                        <button class="btn btn-sm btn-ghost" onclick="editReservation('${reservation.id}')" title="Editar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    ` : ''}
                    
                    ${reservation.status === RESERVATION_STATUS.CREATED ? `
                        <button class="btn btn-sm btn-success" onclick="performCheckIn('${reservation.id}')" title="Check-in">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </button>
                    ` : ''}
                    
                    ${reservation.status === RESERVATION_STATUS.CHECKED_IN ? `
                        <button class="btn btn-sm btn-warning" onclick="performCheckOut('${reservation.id}')" title="Check-out">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </button>
                    ` : ''}
                    
                    ${reservation.status !== RESERVATION_STATUS.CANCELED && reservation.status !== RESERVATION_STATUS.CHECKED_OUT ? `
                        <button class="btn btn-sm btn-danger" onclick="cancelReservation('${reservation.id}')" title="Cancelar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function getStatusColor(status) {
    const colors = {
        'CREATED': 'warning',
        'CHECKED_IN': 'success',
        'CHECKED_OUT': 'secondary',
        'CANCELED': 'danger'
    };
    return colors[status] || 'secondary';
}

function formatDate(dateString) {
    const date = parseLocalDate(dateString);
    if (!date) return '-';
    return date.toLocaleDateString('pt-BR');
}

async function openReservationModal(reservation = null) {
    const isEdit = !!reservation;
    const title = isEdit ? 'Editar Reserva' : 'Nova Reserva';
    
    try {
        showLoading();
        
        // Load guests and rooms for dropdowns
        const [guests, rooms] = await Promise.all([
            guestsAPI.getAll(),
            roomsAPI.getAll()
        ]);
        
        const modalContent = `
            <form id="reservation-form" class="form">
                ${!isEdit ? `
                    <div class="form-group">
                        <label class="form-label required">Hóspede</label>
                        <select class="form-select" name="guestId" required>
                            <option value="">Selecione um hóspede...</option>
                            ${guests.map(guest => `
                                <option value="${guest.id}" ${reservation?.guestId === guest.id ? 'selected' : ''}>
                                    ${guest.fullName} - ${guest.document}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label required">Quarto</label>
                        <select class="form-select" name="roomId" required>
                            <option value="">Selecione um quarto...</option>
                            ${rooms.filter(r => r.status === 'ATIVO').map(room => `
                                <option value="${room.id}" ${reservation?.roomId === room.id ? 'selected' : ''}>
                                    Quarto ${room.number} - ${room.type} (${room.capacity} pessoas) - R$ ${parseFloat(room.pricePerNight).toFixed(2)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                ` : ''}
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Check-in Previsto</label>
                        <input type="date" class="form-input" name="checkinExpected" 
                               value="${reservation?.checkinExpected?.split('T')[0] || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label required">Check-out Previsto</label>
                        <input type="date" class="form-input" name="checkoutExpected" 
                               value="${reservation?.checkoutExpected?.split('T')[0] || ''}" required>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-btn">Cancelar</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Criar'}</button>
                </div>
            </form>
        `;

        showModal(title, modalContent);

        document.getElementById('cancel-btn').addEventListener('click', closeModal);
        document.getElementById('reservation-form').addEventListener('submit', (e) => {
            e.preventDefault();
            handleReservationSubmit(e.target, reservation?.id);
        });
    } catch (error) {
        showToast(getErrorMessage(error), 'error');
    } finally {
        hideLoading();
    }
}

async function handleReservationSubmit(form, reservationId = null) {
    const formData = new FormData(form);
    const reservationData = {
        checkinExpected: formData.get('checkinExpected'),
        checkoutExpected: formData.get('checkoutExpected'),
    };

    if (!reservationId) {
        reservationData.guestId = formData.get('guestId');
        reservationData.roomId = formData.get('roomId');
    }

    try {
        showLoading();
        
        if (reservationId) {
            await reservationsAPI.update(reservationId, reservationData);
            showToast('Reserva atualizada com sucesso!', 'success');
        } else {
            await reservationsAPI.create(reservationData);
            showToast('Reserva criada com sucesso!', 'success');
        }
        
        closeModal();
        loadReservations();
    } catch (error) {
        showToast(getErrorMessage(error), 'error');
    } finally {
        hideLoading();
    }
}

window.viewReservation = async function(id) {
    try {
        showLoading();
        const reservation = await reservationsAPI.getById(id);
        
        const modalContent = `
            <div class="form">
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <div>
                        <span class="badge badge-${getStatusColor(reservation.status)}" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
                            ${STATUS_LABELS[reservation.status] || reservation.status}
                        </span>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Hóspede</label>
                        <p style="font-weight: 600;">${reservation.guest?.fullName || 'N/A'}</p>
                        <p class="text-muted" style="font-size: 0.875rem;">${reservation.guest?.email || ''}</p>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Quarto</label>
                        <p style="font-weight: 600;">Quarto ${reservation.room?.number || 'N/A'}</p>
                        <p class="text-muted" style="font-size: 0.875rem;">${reservation.room?.type || ''}</p>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Check-in Previsto</label>
                        <p>${formatDate(reservation.checkinExpected)}</p>
                        ${reservation.checkinAt ? `<p class="text-muted" style="font-size: 0.875rem;">Realizado em: ${new Date(reservation.checkinAt).toLocaleString('pt-BR')}</p>` : ''}
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Check-out Previsto</label>
                        <p>${formatDate(reservation.checkoutExpected)}</p>
                        ${reservation.checkoutAt ? `<p class="text-muted" style="font-size: 0.875rem;">Realizado em: ${new Date(reservation.checkoutAt).toLocaleString('pt-BR')}</p>` : ''}
                    </div>
                </div>
                
                ${reservation.room?.pricePerNight ? `
                    <div class="form-group">
                        <label class="form-label">Valor Estimado</label>
                        <p style="font-size: 1.5rem; font-weight: 600; color: var(--color-success);">
                            R$ ${calculateTotal(reservation)}
                        </p>
                        <p class="text-muted" style="font-size: 0.875rem;">
                            ${calculateNights(reservation.checkinExpected, reservation.checkoutExpected)} noite(s) × R$ ${parseFloat(reservation.room.pricePerNight).toFixed(2)}
                        </p>
                    </div>
                ` : ''}
                
                <div class="form-group">
                    <label class="form-label">ID da Reserva</label>
                    <p class="text-muted" style="font-family: monospace; font-size: 0.875rem;">${reservation.id}</p>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Fechar</button>
                    ${reservation.status === RESERVATION_STATUS.CREATED ? `
                        <button type="button" class="btn btn-primary" onclick="editReservation('${reservation.id}')">Editar</button>
                    ` : ''}
                </div>
            </div>
        `;
        
        showModal('Detalhes da Reserva', modalContent);
    } catch (error) {
        showToast(getErrorMessage(error), 'error');
    } finally {
        hideLoading();
    }
};

function calculateNights(checkin, checkout) {
    const start = parseLocalDate(checkin);
    const end = parseLocalDate(checkout);
    
    if (!start || !end) return 1;
    
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays); // Mínimo de 1 diária
}

function calculateTotal(reservation) {
    const nights = calculateNights(reservation.checkinExpected, reservation.checkoutExpected);
    const total = nights * parseFloat(reservation.room.pricePerNight);
    return total.toFixed(2);
}

window.editReservation = async function(id) {
    try {
        showLoading();
        const reservation = await reservationsAPI.getById(id);
        await openReservationModal(reservation);
    } catch (error) {
        showToast(getErrorMessage(error), 'error');
    } finally {
        hideLoading();
    }
};

window.cancelReservation = async function(id) {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) {
        return;
    }

    try {
        showLoading();
        await reservationsAPI.cancel(id);
        showToast('Reserva cancelada com sucesso!', 'success');
        loadReservations();
    } catch (error) {
        showToast(getErrorMessage(error), 'error');
    } finally {
        hideLoading();
    }
};

window.performCheckIn = async function(id) {
    if (!confirm('Confirmar check-in para esta reserva?')) {
        return;
    }

    try {
        showLoading();
        await reservationsAPI.checkIn(id);
        showToast('Check-in realizado com sucesso!', 'success');
        loadReservations();
    } catch (error) {
        showToast(getErrorMessage(error), 'error');
    } finally {
        hideLoading();
    }
};

window.performCheckOut = async function(id) {
    if (!confirm('Confirmar check-out para esta reserva?')) {
        return;
    }

    try {
        showLoading();
        await reservationsAPI.checkOut(id);
        showToast('Check-out realizado com sucesso!', 'success');
        loadReservations();
    } catch (error) {
        showToast(getErrorMessage(error), 'error');
    } finally {
        hideLoading();
    }
};

// Rooms Module
import { roomsAPI, getErrorMessage } from './api.js';
import { showToast, showModal, closeModal, showLoading, hideLoading } from './app.js';

const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE'];
const ROOM_STATUS = ['ATIVO', 'INATIVO'];

export function renderRoomsPage() {
    const content = `
        <div class="page-header">
            <div>
                <h1 class="page-title">Quartos</h1>
                <p class="page-subtitle">Gerencie os quartos do hotel</p>
            </div>
            <button class="btn btn-primary" id="add-room-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Novo Quarto
            </button>
        </div>

        <div class="filters">
            <h3 class="filters-title">Filtrar Disponibilidade</h3>
            <form id="filter-form" class="form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Data Inicial</label>
                        <input type="date" class="form-input" name="availableFrom" id="filter-from">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Data Final</label>
                        <input type="date" class="form-input" name="availableTo" id="filter-to">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Capacidade Mínima</label>
                        <input type="number" class="form-input" name="capacity" id="filter-capacity" min="1" placeholder="Ex: 2">
                    </div>
                </div>
                <div class="form-actions" style="justify-content: flex-start;">
                    <button type="submit" class="btn btn-primary">Filtrar</button>
                    <button type="button" class="btn btn-secondary" id="clear-filters-btn">Limpar</button>
                </div>
            </form>
        </div>

        <div class="grid grid-3" id="rooms-grid">
            <div class="card">
                <div class="flex-center" style="min-height: 200px;">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('page-content').innerHTML = content;
    
    // Event Listeners
    document.getElementById('add-room-btn').addEventListener('click', () => openRoomModal());
    document.getElementById('filter-form').addEventListener('submit', handleFilter);
    document.getElementById('clear-filters-btn').addEventListener('click', () => {
        document.getElementById('filter-form').reset();
        loadRooms();
    });
    
    // Load rooms
    loadRooms();
}

async function loadRooms(filters = {}) {
    try {
        const rooms = await roomsAPI.getAll(filters);
        renderRoomsGrid(rooms);
    } catch (error) {
        showToast(getErrorMessage(error), 'error');
        renderRoomsGrid([]);
    }
}

function handleFilter(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const filters = {};
    
    if (formData.get('availableFrom')) filters.availableFrom = formData.get('availableFrom');
    if (formData.get('availableTo')) filters.availableTo = formData.get('availableTo');
    if (formData.get('capacity')) filters.capacity = formData.get('capacity');
    
    loadRooms(filters);
}

function renderRoomsGrid(rooms) {
    const grid = document.getElementById('rooms-grid');
    
    if (rooms.length === 0) {
        grid.innerHTML = `
            <div class="card" style="grid-column: 1 / -1;">
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <h3>Nenhum quarto encontrado</h3>
                    <p>Adicione quartos ou ajuste os filtros</p>
                </div>
            </div>
        `;
        return;
    }

    grid.innerHTML = rooms.map(room => `
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">Quarto ${room.number}</div>
                    <span class="badge badge-${getStatusColor(room.status)}">${room.status}</span>
                </div>
            </div>
            
            <div style="margin: 1rem 0;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    <span>${room.type}</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Capacidade: ${room.capacity}</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <span style="font-size: 1.25rem; font-weight: 600;">R$ ${parseFloat(room.pricePerNight).toFixed(2)}</span>
                    <span class="text-muted" style="font-size: 0.875rem;">/noite</span>
                </div>
            </div>
            
            <div class="card-actions" style="margin-top: 1rem; gap: 0.5rem;">
                <button class="btn btn-sm btn-ghost" onclick="viewRoom('${room.id}')" title="Visualizar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
                <button class="btn btn-sm btn-ghost" onclick="editRoom('${room.id}')" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                ${room.status === 'INATIVO' 
                    ? `<button class="btn btn-sm btn-success" onclick="toggleRoomStatus('${room.id}', 'activate')" title="Ativar">Ativar</button>`
                    : `<button class="btn btn-sm btn-warning" onclick="toggleRoomStatus('${room.id}', 'deactivate')" title="Desativar">Desativar</button>`
                }
            </div>
        </div>
    `).join('');
}

function getStatusColor(status) {
    const colors = {
        'ATIVO': 'success',
        'INATIVO': 'secondary'
    };
    return colors[status] || 'secondary';
}

function openRoomModal(room = null) {
    const isEdit = !!room;
    const title = isEdit ? 'Editar Quarto' : 'Novo Quarto';
    
    const modalContent = `
        <form id="room-form" class="form">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label required">Número do Quarto</label>
                    <input type="number" class="form-input" name="number" value="${room?.number || ''}" required min="1" ${isEdit ? 'readonly' : ''}>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Tipo</label>
                    <select class="form-select" name="type" required>
                        <option value="">Selecione...</option>
                        ${ROOM_TYPES.map(type => `
                            <option value="${type}" ${room?.type === type ? 'selected' : ''}>${type}</option>
                        `).join('')}
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label required">Capacidade</label>
                    <input type="number" class="form-input" name="capacity" value="${room?.capacity || ''}" required min="1">
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Preço por Noite</label>
                    <input type="number" class="form-input" name="pricePerNight" value="${room?.pricePerNight || ''}" required min="0" step="0.01">
                </div>
            </div>
            
            ${isEdit ? `
                <div class="form-group">
                    <label class="form-label required">Status</label>
                    <select class="form-select" name="status" required>
                        ${ROOM_STATUS.map(status => `
                            <option value="${status}" ${room?.status === status ? 'selected' : ''}>${status}</option>
                        `).join('')}
                    </select>
                </div>
            ` : ''}
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="cancel-btn">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Criar'}</button>
            </div>
        </form>
    `;

    showModal(title, modalContent);

    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    document.getElementById('room-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleRoomSubmit(e.target, room?.id);
    });
}

async function handleRoomSubmit(form, roomId = null) {
    const formData = new FormData(form);
    const roomData = {
        number: parseInt(formData.get('number')),
        type: formData.get('type'),
        capacity: parseInt(formData.get('capacity')),
        pricePerNight: parseFloat(formData.get('pricePerNight')),
    };

    if (roomId) {
        roomData.status = formData.get('status');
    }

    try {
        showLoading();
        
        if (roomId) {
            await roomsAPI.update(roomId, roomData);
            showToast('Quarto atualizado com sucesso!', 'success');
        } else {
            await roomsAPI.create(roomData);
            showToast('Quarto criado com sucesso!', 'success');
        }
        
        closeModal();
        loadRooms();
    } catch (error) {
        showToast(getErrorMessage(error), 'error');
    } finally {
        hideLoading();
    }
}

window.viewRoom = async function(id) {
    try {
        showLoading();
        const room = await roomsAPI.getById(id);
        
        const modalContent = `
            <div class="form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Número</label>
                        <p style="font-size: 1.5rem; font-weight: 700;">${room.number}</p>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <span class="badge badge-${getStatusColor(room.status)}">${room.status}</span>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <p>${room.type}</p>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Capacidade</label>
                        <p>${room.capacity} pessoa(s)</p>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Preço por Noite</label>
                    <p style="font-size: 1.5rem; font-weight: 600; color: var(--color-success);">R$ ${parseFloat(room.pricePerNight).toFixed(2)}</p>
                </div>
                
                <div class="form-group">
                    <label class="form-label">ID</label>
                    <p class="text-muted" style="font-family: monospace; font-size: 0.875rem;">${room.id}</p>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Fechar</button>
                    <button type="button" class="btn btn-primary" onclick="editRoom('${room.id}')">Editar</button>
                </div>
            </div>
        `;
        
        showModal('Detalhes do Quarto', modalContent);
    } catch (error) {
        showToast(getErrorMessage(error), 'error');
    } finally {
        hideLoading();
    }
};

window.editRoom = async function(id) {
    try {
        showLoading();
        const room = await roomsAPI.getById(id);
        openRoomModal(room);
    } catch (error) {
        showToast(getErrorMessage(error), 'error');
    } finally {
        hideLoading();
    }
};

window.toggleRoomStatus = async function(id, action) {
    const actionText = action === 'activate' ? 'ativar' : 'desativar';
    
    if (!confirm(`Tem certeza que deseja ${actionText} este quarto?`)) {
        return;
    }

    try {
        showLoading();
        
        if (action === 'activate') {
            await roomsAPI.activate(id);
            showToast('Quarto ativado com sucesso!', 'success');
        } else {
            await roomsAPI.deactivate(id);
            showToast('Quarto desativado com sucesso!', 'success');
        }
        
        loadRooms();
    } catch (error) {
        showToast(getErrorMessage(error), 'error');
    } finally {
        hideLoading();
    }
};

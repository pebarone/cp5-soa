// Guests Module
import { guestsAPI } from './api.js';
import { showToast, showModal, closeModal, showLoading, hideLoading } from './app.js';

export function renderGuestsPage() {
    const content = `
        <div class="page-header">
            <div>
                <h1 class="page-title">Hóspedes</h1>
                <p class="page-subtitle">Gerencie os hóspedes do hotel</p>
            </div>
            <button class="btn btn-primary" id="add-guest-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Novo Hóspede
            </button>
        </div>

        <div class="card">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nome Completo</th>
                            <th>Documento</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th class="text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="guests-table-body">
                        <tr>
                            <td colspan="5" class="text-center">
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
    document.getElementById('add-guest-btn').addEventListener('click', () => openGuestModal());
    
    // Load guests
    loadGuests();
}

async function loadGuests() {
    try {
        const guests = await guestsAPI.getAll();
        renderGuestsTable(guests);
    } catch (error) {
        showToast(error.message, 'error');
        renderGuestsTable([]);
    }
}

function renderGuestsTable(guests) {
    const tbody = document.getElementById('guests-table-body');
    
    if (guests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <h3>Nenhum hóspede cadastrado</h3>
                        <p>Adicione o primeiro hóspede para começar</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = guests.map(guest => `
        <tr>
            <td><strong>${guest.fullName}</strong></td>
            <td>${guest.document}</td>
            <td>${guest.email}</td>
            <td>${guest.phone || '-'}</td>
            <td class="text-right">
                <div class="flex gap-1" style="justify-content: flex-end;">
                    <button class="btn btn-sm btn-ghost" onclick="viewGuest('${guest.id}')" title="Visualizar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-ghost" onclick="editGuest('${guest.id}')" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteGuest('${guest.id}')" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openGuestModal(guest = null) {
    const isEdit = !!guest;
    const title = isEdit ? 'Editar Hóspede' : 'Novo Hóspede';
    
    const modalContent = `
        <form id="guest-form" class="form">
            <div class="form-group">
                <label class="form-label required">Nome Completo</label>
                <input type="text" class="form-input" name="fullName" value="${guest?.fullName || ''}" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label required">Documento</label>
                    <input type="text" class="form-input" name="document" value="${guest?.document || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Telefone</label>
                    <input type="tel" class="form-input" name="phone" value="${guest?.phone || ''}" placeholder="(00) 00000-0000">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label required">Email</label>
                <input type="email" class="form-input" name="email" value="${guest?.email || ''}" required>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="cancel-btn">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Criar'}</button>
            </div>
        </form>
    `;

    showModal(title, modalContent);

    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    document.getElementById('guest-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleGuestSubmit(e.target, guest?.id);
    });
}

async function handleGuestSubmit(form, guestId = null) {
    const formData = new FormData(form);
    const guestData = {
        fullName: formData.get('fullName'),
        document: formData.get('document'),
        email: formData.get('email'),
        phone: formData.get('phone') || undefined,
    };

    try {
        showLoading();
        
        if (guestId) {
            await guestsAPI.update(guestId, guestData);
            showToast('Hóspede atualizado com sucesso!', 'success');
        } else {
            await guestsAPI.create(guestData);
            showToast('Hóspede criado com sucesso!', 'success');
        }
        
        closeModal();
        loadGuests();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

window.viewGuest = async function(id) {
    try {
        showLoading();
        const guest = await guestsAPI.getById(id);
        
        const modalContent = `
            <div class="form">
                <div class="form-group">
                    <label class="form-label">Nome Completo</label>
                    <p style="font-size: 1.125rem; font-weight: 600;">${guest.fullName}</p>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Documento</label>
                        <p>${guest.document}</p>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Telefone</label>
                        <p>${guest.phone || '-'}</p>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <p>${guest.email}</p>
                </div>
                
                <div class="form-group">
                    <label class="form-label">ID</label>
                    <p class="text-muted" style="font-family: monospace; font-size: 0.875rem;">${guest.id}</p>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Fechar</button>
                    <button type="button" class="btn btn-primary" onclick="editGuest('${guest.id}')">Editar</button>
                </div>
            </div>
        `;
        
        showModal('Detalhes do Hóspede', modalContent);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
};

window.editGuest = async function(id) {
    try {
        showLoading();
        const guest = await guestsAPI.getById(id);
        openGuestModal(guest);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
};

window.deleteGuest = async function(id) {
    if (!confirm('Tem certeza que deseja excluir este hóspede?')) {
        return;
    }

    try {
        showLoading();
        await guestsAPI.delete(id);
        showToast('Hóspede excluído com sucesso!', 'success');
        loadGuests();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
};

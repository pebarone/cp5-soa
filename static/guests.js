// Guests Module
import { guestsAPI, getErrorMessage } from './api.js';
import { showToast, showModal, closeModal, showLoading, hideLoading } from './app.js';

let allGuests = [];
let searchTimeout;

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

        <!-- Search Bar -->
        <div class="filters">
            <div class="search-box">
                <input 
                    type="text" 
                    id="guest-search" 
                    class="form-input" 
                    placeholder="🔍 Buscar por nome, email ou documento..."
                    autocomplete="off"
                />
                <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
            </div>
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
    
    // Search with debounce
    const searchInput = document.getElementById('guest-search');
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterGuests(e.target.value);
        }, 300);
    });
    
    // Load guests
    loadGuests();
}

async function loadGuests() {
    // Show skeleton loader
    renderSkeletonLoader();
    
    try {
        const guests = await guestsAPI.getAll();
        allGuests = guests;
        renderGuestsTable(guests);
    } catch (error) {
        showToast(getErrorMessage(error), 'error');
        renderGuestsTable([]);
    }
}

function renderSkeletonLoader() {
    const tbody = document.getElementById('guests-table-body');
    const skeletonRows = Array(5).fill(0).map(() => `
        <tr class="table-skeleton">
            <td><div class="skeleton-line" style="width: 60%;"></div></td>
            <td><div class="skeleton-line" style="width: 80%;"></div></td>
            <td><div class="skeleton-line" style="width: 70%;"></div></td>
            <td><div class="skeleton-line" style="width: 50%;"></div></td>
            <td>
                <div class="flex gap-1" style="justify-content: flex-end;">
                    <div class="skeleton-circle"></div>
                    <div class="skeleton-circle"></div>
                    <div class="skeleton-circle"></div>
                </div>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = skeletonRows;
}

function filterGuests(searchTerm) {
    if (!searchTerm) {
        renderGuestsTable(allGuests);
        return;
    }
    
    const filtered = allGuests.filter(guest => {
        const searchLower = searchTerm.toLowerCase();
        return (
            guest.fullName.toLowerCase().includes(searchLower) ||
            guest.email.toLowerCase().includes(searchLower) ||
            guest.document.includes(searchTerm) ||
            (guest.phone && guest.phone.includes(searchTerm))
        );
    });
    
    renderGuestsTable(filtered);
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
            <td>${formatDocument(guest.document)}</td>
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

/**
 * Formata CPF: 000.000.000-00
 */
function formatCPF(value) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
}

/**
 * Formata CNPJ: 00.000.000/0000-00
 */
function formatCNPJ(value) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
        return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
}

/**
 * Formata CPF ou CNPJ automaticamente
 */
function formatDocument(value) {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 11) {
        // CPF
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
        // CNPJ
        return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
}

/**
 * Valida CPF
 */
function isValidCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

/**
 * Valida CNPJ
 */
function isValidCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    
    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    
    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;
    
    return true;
}

/**
 * Valida CPF ou CNPJ
 */
function validateDocument(value) {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length === 11) {
        return isValidCPF(numbers);
    } else if (numbers.length === 14) {
        return isValidCNPJ(numbers);
    }
    
    return false;
}

function openGuestModal(guest = null) {
    const isEdit = !!guest;
    const title = isEdit ? 'Editar Hóspede' : 'Novo Hóspede';
    
    // Formata o documento se existir (para exibição)
    const formattedDocument = guest?.document ? formatDocument(guest.document) : '';
    
    const modalContent = `
        <form id="guest-form" class="form">
            <div class="form-group">
                <label class="form-label required">Nome Completo</label>
                <input type="text" class="form-input" name="fullName" value="${guest?.fullName || ''}" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label required">Documento (CPF ou CNPJ)</label>
                    <input type="text" class="form-input" id="document-input" name="document" value="${formattedDocument}" required placeholder="000.000.000-00 ou 00.000.000/0000-00" maxlength="18">
                    <small class="form-hint" style="display: block; margin-top: 0.25rem; color: var(--color-text-muted); font-size: 0.875rem;">Digite apenas números, a formatação será aplicada automaticamente</small>
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

    // Adiciona formatação automática ao campo de documento
    const documentInput = document.getElementById('document-input');
    documentInput.addEventListener('input', (e) => {
        const cursorPos = e.target.selectionStart;
        const oldLength = e.target.value.length;
        e.target.value = formatDocument(e.target.value);
        const newLength = e.target.value.length;
        const diff = newLength - oldLength;
        e.target.setSelectionRange(cursorPos + diff, cursorPos + diff);
    });

    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    document.getElementById('guest-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Valida o documento antes de enviar
        const documentValue = documentInput.value;
        if (!validateDocument(documentValue)) {
            showToast('CPF ou CNPJ inválido. Verifique o documento digitado.', 'error');
            return;
        }
        
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
        showToast(getErrorMessage(error), 'error');
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
                        <p>${formatDocument(guest.document)}</p>
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
        showToast(getErrorMessage(error), 'error');
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
        showToast(getErrorMessage(error), 'error');
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
        showToast(getErrorMessage(error), 'error');
    } finally {
        hideLoading();
    }
};

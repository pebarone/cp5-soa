// src/utils/dateUtils.js

/**
 * Converte uma entrada de data para um objeto Date em horário local (apenas data).
 * Aceita string no formato 'YYYY-MM-DD' (ou ISO com tempo) ou um objeto Date.
 * Retorna null se o formato for inválido ou a data inexistente.
 * @param {string | Date | null | undefined} dateInput - A data como string ou Date.
 * @returns {Date | null} O objeto Date correspondente (yyyy-mm-dd no timezone local) ou null.
 */
function parseDateString(dateInput) {
    console.log('[parseDateString] Input:', dateInput, 'Type:', typeof dateInput, 'Constructor:', dateInput?.constructor?.name);
    
    if (!dateInput) return null;

    // Se já for Date válido, normaliza para ano/mês/dia no timezone local
    if (dateInput instanceof Date) {
        if (isNaN(dateInput.getTime())) return null;
        return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
    }

    // Garante que vamos operar apenas sobre strings
    if (typeof dateInput !== 'string') {
        console.log('[parseDateString] Input is not a string, returning null');
        return null;
    }

    // Se a string incluir um horário (padrão ISO), pegue apenas a parte da data.
    const datePart = dateInput.split('T')[0];

    // Regex para validar o formato YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(datePart)) return null;

    // Extrai ano, mês e dia da string
    const [year, month, day] = datePart.split('-').map(Number);
    
    // Cria a data em horário local (sem timezone)
    // Mês é 0-indexed no JavaScript, então subtraímos 1
    const date = new Date(year, month - 1, day);

    // Verifica se a data criada é válida
    if (isNaN(date.getTime())) {
        return null; // Data inválida
    }

    // Verifica se a data criada corresponde aos valores fornecidos
    // (protege contra datas como 2023-02-30 que seriam convertidas para 2023-03-02)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return null;
    }

    return date;
}

/**
 * Formata uma data para o padrão YYYY-MM-DD usando o timezone local.
 * Aceita Date ou uma string já no formato YYYY-MM-DD (nesse caso, retorna a própria string).
 * @param {Date | string | null | undefined} date - O objeto Date ou string.
 * @returns {string | null} A string no formato YYYY-MM-DD ou null para entradas inválidas.
 */
function formatDateToString(date) {
    console.log('[formatDateToString] Input:', date, 'Type:', typeof date, 'Constructor:', date?.constructor?.name);
    
    if (!date) return null;

    // Se já for string, valida e normaliza via parseDateString
    if (typeof date === 'string') {
        const parsed = parseDateString(date);
        if (!parsed) return null;
        const year = parsed.getFullYear();
        const month = (parsed.getMonth() + 1).toString().padStart(2, '0');
        const day = parsed.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.log('[formatDateToString] Input is not a valid Date, returning null');
        return null;
    }
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const result = `${year}-${month}-${day}`;
    console.log('[formatDateToString] Result:', result);
    return result;
}


/**
 * Calcula o número de diárias entre duas datas.
 * Considera que a estadia mínima é de 1 diária.
 * Compara apenas a parte da data (ignora horas).
 * @param {Date | null} checkinDate - Data/hora de início.
 * @param {Date | null} checkoutDate - Data/hora de fim.
 * @returns {number} O número de diárias (mínimo 1) ou 0 se as datas forem inválidas/invertidas.
 */
function calculateNights(checkinDate, checkoutDate) {
    if (!(checkinDate instanceof Date) || !(checkoutDate instanceof Date) || isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
        return 0; // Retorna 0 se as datas forem inválidas
    }

    // Cria novas datas apenas com ano, mês e dia em UTC para evitar problemas de fuso/DST
    const startUTC = Date.UTC(checkinDate.getUTCFullYear(), checkinDate.getUTCMonth(), checkinDate.getUTCDate());
    const endUTC = Date.UTC(checkoutDate.getUTCFullYear(), checkoutDate.getUTCMonth(), checkoutDate.getUTCDate());

    // Calcula a diferença em milissegundos
    const diffTime = endUTC - startUTC;

    // Se a diferença for negativa ou zero (checkout no mesmo dia ou antes do checkin), retorna 0 diárias (ou 1 se preferir cobrar mesmo assim)
    // Pelo cálculo do PDF (max(1, dias)), mesmo checkin=checkout resultaria em 1 diária.
    if (diffTime < 0) return 0; // Check-out antes do check-in não conta.

    // Converte a diferença de milissegundos para dias
    // Math.ceil garante que qualquer fração de dia conte como um dia inteiro de estadia
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Garante o mínimo de 1 diária se o período for válido (checkout >= checkin)
    // Se diffDays for 0 (mesmo dia), retorna 1.
    return Math.max(1, diffDays);
}


module.exports = {
    parseDateString,
    formatDateToString,
    calculateNights
};
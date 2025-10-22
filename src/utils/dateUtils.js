// src/utils/dateUtils.js

/**
 * Converte uma string no formato 'YYYY-MM-DD' para um objeto Date em horário local.
 * Retorna null se o formato for inválido ou a data inexistente.
 * @param {string | null | undefined} dateString - A string de data.
 * @returns {Date | null} O objeto Date correspondente ou null.
 */
function parseDateString(dateString) {
    if (!dateString) return null;

    // Regex simples para validar o formato YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return null;

    // Extrai ano, mês e dia da string
    const [year, month, day] = dateString.split('-').map(Number);
    
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
 * @param {Date | null | undefined} date - O objeto Date.
 * @returns {string | null} A string no formato YYYY-MM-DD ou null.
 */
function formatDateToString(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return null;
    }
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
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
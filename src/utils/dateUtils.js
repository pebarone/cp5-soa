// src/utils/dateUtils.js

/**
 * Converte uma string no formato 'YYYY-MM-DD' para um objeto Date em UTC.
 * Retorna null se o formato for inválido ou a data inexistente.
 * @param {string | null | undefined} dateString - A string de data.
 * @returns {Date | null} O objeto Date correspondente em UTC ou null.
 */
function parseDateString(dateString) {
    if (!dateString) return null;

    // Regex simples para validar o formato YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return null;

    // Cria a data adicionando 'T00:00:00Z' para interpretar como UTC
    // Isso evita problemas com fuso horário local que podem mudar o dia.
    const date = new Date(dateString + 'T00:00:00Z');

    // Verifica se a data criada é válida e corresponde ao input
    // (new Date('invalid-string') não lança erro, mas retorna Invalid Date)
    if (isNaN(date.getTime())) {
        return null; // Data inválida (ex: '2023-02-30')
    }

     // Extra confirmação: Reformatar a data UTC para YYYY-MM-DD e comparar com a string original
     // Isso pega casos como '2023-02-29' que podem ser válidos se interpretados localmente
     // mas não necessariamente correspondem à intenção UTC do YYYY-MM-DD puro.
     const year = date.getUTCFullYear();
     const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
     const day = date.getUTCDate().toString().padStart(2, '0');
     if (`${year}-${month}-${day}` !== dateString) {
         //console.warn(`Data string '${dateString}' resultou em data UTC inválida ou diferente.`);
         return null; // A data criada não corresponde exatamente ao input (ex: dia inválido)
     }


    return date;
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
    if (!(checkinDate instanceof Date) || !(checkoutDate instanceof Date) || isNaN(checkinDate) || isNaN(checkoutDate)) {
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
    calculateNights
};
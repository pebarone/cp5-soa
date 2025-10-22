// test/utils/dateUtils.test.js
const { parseDateString, formatDateToString } = require('../../src/utils/dateUtils');

describe('dateUtils', () => {
    describe('parseDateString', () => {
        it('parses YYYY-MM-DD string to Date', () => {
            const d = parseDateString('2025-12-31');
            expect(d).toBeInstanceOf(Date);
            expect(d.getFullYear()).toBe(2025);
            expect(d.getMonth()).toBe(11); // 0-indexed
            expect(d.getDate()).toBe(31);
        });

        it('returns null for invalid string', () => {
            expect(parseDateString('2025-13-01')).toBeNull();
            expect(parseDateString('not-a-date')).toBeNull();
        });

        it('normalizes Date input', () => {
            const src = new Date('2025-10-22T15:45:00');
            const d = parseDateString(src);
            expect(d).toBeInstanceOf(Date);
            expect(d.getFullYear()).toBe(2025);
            expect(d.getMonth()).toBe(9);
            expect(d.getDate()).toBe(22);
            // ensure time truncated (00:00 local)
            expect(d.getHours()).toBe(0);
        });

        it('returns null for non-string/non-Date', () => {
            // numbers, objects
            expect(parseDateString(1700000000000)).toBeNull();
            expect(parseDateString({})).toBeNull();
        });
    });

    describe('formatDateToString', () => {
        it('formats Date to YYYY-MM-DD', () => {
            const d = new Date(2025, 0, 5); // Jan 5, 2025
            expect(formatDateToString(d)).toBe('2025-01-05');
        });

        it('passes through valid YYYY-MM-DD string', () => {
            expect(formatDateToString('2025-11-09')).toBe('2025-11-09');
        });

        it('returns null for invalid inputs', () => {
            expect(formatDateToString('2025-13-01')).toBeNull();
            expect(formatDateToString(null)).toBeNull();
            expect(formatDateToString({})).toBeNull();
        });
    });
});

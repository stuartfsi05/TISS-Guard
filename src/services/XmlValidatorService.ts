import { XMLParser } from 'fast-xml-parser';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    message: string;
}

const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true, // Remove namespaces (ans: -> tag) to simplify finding tags
});


import { AppSettings, DEFAULT_SETTINGS } from './StorageService';

export const validateTiss = (xmlContent: string, settings: AppSettings = DEFAULT_SETTINGS): ValidationResult => {
    const errors: string[] = [];
    try {
        const jsonObj = parser.parse(xmlContent);

        // Helper to find a key recursively because the TISS structure is deep
        // and we don't know the exact root tag name quickly (mensagemTISS, etc)
        const findAllValues = (obj: any, keyToFind: string): any[] => {
            let results: any[] = [];
            if (typeof obj !== 'object' || obj === null) return results;

            if (keyToFind in obj) {
                results.push(obj[keyToFind]);
            }

            for (const key of Object.keys(obj)) {
                results = results.concat(findAllValues(obj[key], keyToFind));
            }
            return results;
        };

        // 1. Validate 'numeroGuiaPrestador' existence (Always Mandatory)
        const numeroGuiaValues = findAllValues(jsonObj, 'numeroGuiaPrestador');
        if (numeroGuiaValues.length === 0 || numeroGuiaValues.some(v => String(v).trim() === '')) {
            errors.push('Tag <numeroGuiaPrestador> não encontrada ou está vazia.');
        }

        // 2. Validate 'dataAtendimento' (Must not be in the future)
        if (settings.checkFutureDates) {
            const dateValues = findAllValues(jsonObj, 'dataAtendimento'); // Format usually YYYY-MM-DD
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            dateValues.forEach(dateStr => {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime()) && date > today) {
                    errors.push(`Data de atendimento futura detectada: ${dateStr}`);
                }
            });
        }

        // 3. Validate Monetary Values (Must not be negative)
        if (settings.checkNegativeValues) {
            // Common tags: valorTotal, valorTotalGeral, valorProcessado
            const moneyTags = ['valorTotal', 'valorTotalGeral', 'valorProcessado', 'valorLiberado'];
            moneyTags.forEach(tag => {
                const values = findAllValues(jsonObj, tag);
                values.forEach(val => {
                    const num = parseFloat(String(val));
                    if (!isNaN(num) && num < 0) {
                        errors.push(`Valor monetário negativo detectado na tag <${tag}>: ${val}`);
                    }
                });
            });
        }

        if (errors.length > 0) {
            return {
                isValid: false,
                errors: errors,
                message: 'Falha na validação',
            };
        }

        return {
            isValid: true,
            errors: [],
            message: 'Arquivo TISS válido.',
        };
    } catch (e) {
        return {
            isValid: false,
            errors: ['Erro ao ler o arquivo XML. Formato inválido.'],
            message: 'Erro de Parse',
        };
    }
};

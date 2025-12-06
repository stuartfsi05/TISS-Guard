import { AppSettings } from './StorageService';
import { ValidationError } from './XmlValidatorService';

// --- Strategy Interface ---
export interface TissRule {
    id: string;
    description: string;
    settingKey?: keyof AppSettings; // Optional: Link to a specific setting toggle
    validate(jsonObj: any): ValidationError[];
}

// --- Utils ---
// Extracting helper to make rules standalone
const findAllValues = (obj: any, keyToFind: string): { value: any, path: string }[] => {
    let results: { value: any, path: string }[] = [];
    if (typeof obj !== 'object' || obj === null) return results;

    if (keyToFind in obj) {
        results.push({ value: obj[keyToFind], path: keyToFind });
    }

    for (const key of Object.keys(obj)) {
        const childResults = findAllValues(obj[key], keyToFind);
        results = results.concat(childResults.map(r => ({ ...r, path: `${key} > ${r.path}` })));
    }
    return results;
};

// --- Concrete Strategies ---

export const TussFormatRule: TissRule = {
    id: 'TUSS_FORMAT_ERROR',
    description: 'Valida se códigos TUSS possuem 8 dígitos numéricos',
    validate: (jsonObj: any) => {
        // ... (existing code) ...
        const errors: ValidationError[] = [];
        const codeTags = ['codigoProcedimento', 'codigoTabela', 'codigoTermo', 'codigo'];

        codeTags.forEach(tag => {
            const hits = findAllValues(jsonObj, tag);
            hits.forEach(hit => {
                const valStr = String(hit.value).trim();
                if (valStr && valStr.length > 0) {
                    if (!/^\d{8}$/.test(valStr)) {
                        errors.push({
                            code: 'TUSS_FORMAT_ERROR',
                            message: `Erro TUSS: O código "${valStr}" em <${tag}> deve ter exatamente 8 dígitos numéricos.`,
                            location: hit.path
                        });
                    }
                }
            });
        });
        return errors;
    }
};

export const MissingGuiaRule: TissRule = {
    id: 'CRITICAL_MISSING_GUIA',
    description: 'Verifica a existência do número da guia',
    validate: (jsonObj: any) => {
        // ... (existing code) ...
        const numeroGuiaHits = findAllValues(jsonObj, 'numeroGuiaPrestador');
        const hasValidGuia = numeroGuiaHits.some(hit => String(hit.value).trim() !== '');

        if (!hasValidGuia) {
            return [{
                code: 'CRITICAL_MISSING_GUIA',
                message: 'Erro Crítico: A guia não possui número identificador do prestador.',
                location: 'numeroGuiaPrestador'
            }];
        }
        return [];
    }
};

export const FutureDateRule: TissRule = {
    id: 'DATE_FUTURE_ERROR',
    description: 'Impede datas de atendimento no futuro',
    settingKey: 'checkFutureDates',
    validate: (jsonObj: any) => {
        // ... (existing code) ...
        const errors: ValidationError[] = [];
        const dateTags = ['dataAtendimento', 'dataExecucao', 'dataEmissao'];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        dateTags.forEach(tag => {
            const hits = findAllValues(jsonObj, tag);
            hits.forEach(hit => {
                const dateStr = String(hit.value);
                const date = new Date(dateStr);
                if (!isNaN(date.getTime()) && date > today) {
                    errors.push({
                        code: 'DATE_FUTURE_ERROR',
                        message: `Erro de Data: O procedimento com ${tag} (${dateStr}) consta com data futura.`,
                        location: hit.path
                    });
                }
            });
        });
        return errors;
    }
};

export const NegativeValueRule: TissRule = {
    id: 'FINANCIAL_ZERO_OR_NEGATIVE',
    description: 'Impede valores monetários negativos ou zerados',
    settingKey: 'checkNegativeValues',
    validate: (jsonObj: any) => {
        // ... (existing code) ...
        const errors: ValidationError[] = [];
        const moneyTags = ['valorTotal', 'valorTotalGeral', 'valorProcessado', 'valorLiberado', 'valorApresentado'];

        moneyTags.forEach(tag => {
            const hits = findAllValues(jsonObj, tag);
            hits.forEach(hit => {
                const valStr = String(hit.value).replace(',', '.');
                const num = parseFloat(valStr);

                if (!isNaN(num) && num <= 0) {
                    errors.push({
                        code: 'FINANCIAL_ZERO_OR_NEGATIVE',
                        message: `Erro Financeiro: O valor na tag <${tag}> (${hit.value}) não pode ser zero ou negativo.`,
                        location: hit.path
                    });
                }
            });
        });
        return errors;
    }
};

// --- Registry ---
export const CORE_RULES: TissRule[] = [
    MissingGuiaRule,
    FutureDateRule,
    NegativeValueRule,
    TussFormatRule
];

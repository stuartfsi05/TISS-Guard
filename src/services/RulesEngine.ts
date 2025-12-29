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
    id: 'TUSS_FORMATO_INVALIDO',
    description: 'Verifica se os códigos da tabela possuem 8 dígitos numéricos.',
    validate: (jsonObj: any) => {
        const errors: ValidationError[] = [];
        const hits = findAllValues(jsonObj, 'codigoTabela');

        hits.forEach(hit => {
            const val = String(hit.value);
            if (!/^\d{8}$/.test(val)) {
                errors.push({
                    code: 'FORMATO_TUSS_INVALIDO',
                    message: `Código '${val}' inválido. Deve ter 8 dígitos. (Local: ${hit.path})`
                });
            }
        });
        return errors;
    }
};

export const MissingGuiaRule: TissRule = {
    id: 'GUIA_AUSENTE',
    description: 'Verifica se o número da guia está presente em guias de consulta/SP/SADT.',
    validate: (jsonObj: any) => {
        const errors: ValidationError[] = [];
        // Heuristic: If we are deep inside a guide structure, we expect a number
        const hits = findAllValues(jsonObj, 'numeroGuiaPrestador');

        // Simpler check for now:
        hits.forEach(hit => {
            if (!hit.value || String(hit.value).trim() === '') {
                errors.push({
                    code: 'NM_GUIA_VAZIO',
                    message: `Número da guia em branco. (Local: ${hit.path})`
                });
            }
        });

        return errors;
    }
};

export const FutureDateRule: TissRule = {
    id: 'DATA_FUTURA',
    description: 'Impede o envio de procedimentos com data de execução futura.',
    validate: (jsonObj: any) => {
        const errors: ValidationError[] = [];
        const dateFields = ['dataAtendimento', 'dataExecucao', 'dataRealizacao'];

        const today = new Date();
        today.setHours(23, 59, 59, 999); // Allow anytime today

        dateFields.forEach(field => {
            const hits = findAllValues(jsonObj, field);
            hits.forEach(hit => {
                const parts = String(hit.value).split('-'); // YYYY-MM-DD
                if (parts.length === 3) {
                    const dateVal = new Date(hit.value);
                    if (dateVal > today) {
                        errors.push({
                            code: 'DATA_FUTURA_DETECTADA',
                            message: `A data ${hit.value} não pode ser futura. (Local: ${hit.path})`
                        });
                    }
                }
            });
        });

        return errors;
    }
};

export const NegativeValueRule: TissRule = {
    id: 'VALOR_NEGATIVO',
    description: 'Verifica se existem valores monetários negativos.',
    validate: (jsonObj: any) => {
        const errors: ValidationError[] = [];
        const valueFields = ['valorTotal', 'valorProcessado', 'valorLiberado', 'valorGlosa'];

        valueFields.forEach(field => {
            const hits = findAllValues(jsonObj, field);
            hits.forEach(hit => {
                const val = parseFloat(hit.value);
                if (val < 0) {
                    errors.push({
                        code: 'VALOR_NEGATIVO',
                        message: `Valor monetário inválido (${val}). (Local: ${hit.path})`
                    });
                }
            });
        });

        return errors;
    }
};

// --- New Rules for Enterprise Hardening ---

// 1. TISS Version Check (Priority 9)
// The <padrao> tag is critical. Old versions (e.g. 3.02) have different schemas.
export const TissVersionRule: TissRule = {
    id: 'TISS_VERSION_VIGENTE',
    description: 'Verifica a versão do padrão TISS no arquivo.',
    validate: (jsonObj: any) => {
        const errors: ValidationError[] = [];
        // Helper to find the version tag deep in the object
        const findVersion = (obj: any): string | null => {
            if (!obj) return null;
            // Common tag names for version
            if (obj.padrao) return obj.padrao;
            if (obj['ans:padrao']) return obj['ans:padrao'];

            if (typeof obj === 'object') {
                for (const key in obj) {
                    const res = findVersion(obj[key]);
                    if (res) return res;
                }
            }
            return null;
        };

        const version = findVersion(jsonObj);

        if (!version) {
            errors.push({
                code: 'VERSAO_NAO_ENCONTRADA',
                message: 'Não foi possível identificar a versão do padrão TISS no arquivo (Tag <padrao> ausente).'
            });
            return errors;
        }

        // TISS Version Policy (Mock: Accept only > 3.05.00)
        // In a real scenario, this would check against a list of valid dates/versions from ANS.
        const numericVersion = parseFloat(version.replace(/\./g, '')); // 3.05.00 -> 30500
        const MIN_VERSION = 30500; // 3.05.00

        if (numericVersion < MIN_VERSION) {
            errors.push({
                code: 'TISS_VERSAO_OBSOLETA',
                message: `A versão TISS ${version} está obsoleta. A ANS exige no mínimo 3.05.00.`
            });
        }

        return errors;
    }
};

// 2. TUSS Table Validation Mock (Priority 3)
// Stub for validating if a procedure code actually exists in the official table.
export const TussValidationRule: TissRule = {
    id: 'TUSS_VALIDATION',
    description: 'Valida se códigos TUSS existem na tabela vigente.',
    validate: (jsonObj: any) => {
        // Mock Database of Valid Codes (Stub)
        // In production, this would be an IndexedDB lookup.
        // const MOCK_VALID_TUSS = new Set([
        //     '10101012', '40304361', '31309059', '60000755'
        // ]);

        const errors: ValidationError[] = [];
        const codes = findAllValues(jsonObj, 'codigoTabela'); // Find all procedure codes

        codes.forEach(hit => {
            const code = String(hit.value);
            // Only validate if it looks like a TUSS code (8 digits)
            if (/^\d{8}$/.test(code)) {
                // If we had a full DB, we would check strictly.
                // For now, we just simulate the LOGIC structure.
                // console.log(`[RulesEngine] Checking TUSS Code: ${code}`);

                // UNCOMMENT TO TEST STRICT VALIDATION:
                // if (!MOCK_VALID_TUSS.has(code)) {
                //     errors.push({
                //         code: 'TUSS_INEXISTENTE',
                //         message: `O código TUSS ${code} não foi encontrado na tabela vigente ou foi descontinuado.`
                //     });
                // }
            }
        });

        return errors;
    }
};

// --- Registry ---
export const CORE_RULES: TissRule[] = [
    TissVersionRule,     // Critical: Check version first
    TussFormatRule,      // Syntax check
    TussValidationRule,  // Semantic check (Stub)
    MissingGuiaRule,
    FutureDateRule,
    NegativeValueRule
];

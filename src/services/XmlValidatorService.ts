import { XMLParser } from 'fast-xml-parser';
import { AppSettings, DEFAULT_SETTINGS } from './StorageService';

export interface ValidationError {
    code: string;
    message: string;
    location?: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    message: string;
}

const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
});

export const validateTiss = (xmlContent: string, settings: AppSettings = DEFAULT_SETTINGS): ValidationResult => {
    const errors: ValidationError[] = [];

    try {
        const jsonObj = parser.parse(xmlContent);

        // Helper recursive finder
        const findAllValues = (obj: any, keyToFind: string): { value: any, path: string }[] => {
            let results: { value: any, path: string }[] = [];
            if (typeof obj !== 'object' || obj === null) return results;

            if (keyToFind in obj) {
                results.push({ value: obj[keyToFind], path: keyToFind });
            }

            for (const key of Object.keys(obj)) {
                const childResults = findAllValues(obj[key], keyToFind);
                // Prepend parent key to path for context (optional, simple for now)
                results = results.concat(childResults.map(r => ({ ...r, path: `${key} > ${r.path}` })));
            }
            return results;
        };

        // 1. Regra de Integridade (Campo Obrigatório)
        // Verifique se a tag numeroGuiaPrestador existe e não está vazia.
        const numeroGuiaHits = findAllValues(jsonObj, 'numeroGuiaPrestador');
        const hasValidGuia = numeroGuiaHits.some(hit => String(hit.value).trim() !== '');

        if (!hasValidGuia) {
            errors.push({
                code: 'CRITICAL_MISSING_GUIA',
                message: 'Erro Crítico: A guia não possui número identificador do prestador.',
                location: 'numeroGuiaPrestador'
            });
        }

        // 2. Regra Temporal (Viagem no Tempo)
        if (settings.checkFutureDates) {
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
        }

        // 3. Regra Financeira (Valor Positivo)
        // Verifique se algum valor é menor ou igual a zero.
        if (settings.checkNegativeValues) {
            const moneyTags = ['valorTotal', 'valorTotalGeral', 'valorProcessado', 'valorLiberado', 'valorApresentado'];
            moneyTags.forEach(tag => {
                const hits = findAllValues(jsonObj, tag);
                hits.forEach(hit => {
                    // Replace comma with dot if pt-BR format, though TISS XML usually uses dot.
                    // Safe approach: just parse.
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
        }

        if (errors.length > 0) {
            return {
                isValid: false,
                errors: errors,
                message: 'Falha na validação TISS',
            };
        }

        return {
            isValid: true,
            errors: [],
            message: 'Arquivo TISS válido e íntegro.',
        };

    } catch (e) {
        return {
            isValid: false,
            errors: [{
                code: 'XML_PARSE_ERROR',
                message: 'O arquivo não é um XML válido ou está corrompido.',
            }],
            message: 'Erro de Leitura',
        };
    }
};

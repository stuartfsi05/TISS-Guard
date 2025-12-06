import { XMLParser } from 'fast-xml-parser';
import { AppSettings, DEFAULT_SETTINGS } from './StorageService';
import { CORE_RULES } from './RulesEngine';

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

export const parseXml = (content: string) => parser.parse(content);

export const validateTiss = (xmlContent: string, settings: AppSettings = DEFAULT_SETTINGS): ValidationResult => {
    let errors: ValidationError[] = [];

    try {
        const jsonObj = parser.parse(xmlContent);

        // --- Orchestrator Logic ---
        CORE_RULES.forEach(rule => {
            // Check if rule is enabled in settings
            // Mapping:
            // "DATE_FUTURE_ERROR" -> settings.checkFutureDates
            // "FINANCIAL_ZERO_OR_NEGATIVE" -> settings.checkNegativeValues
            // "CRITICAL_MISSING_GUIA" -> Always Enabled (Core Integrity)

            let isEnabled = true; // Default for Critical Rules
            if (rule.id === 'DATE_FUTURE_ERROR') isEnabled = settings.checkFutureDates;
            if (rule.id === 'FINANCIAL_ZERO_OR_NEGATIVE') isEnabled = settings.checkNegativeValues;

            if (isEnabled) {
                const ruleErrors = rule.validate(jsonObj);
                errors = errors.concat(ruleErrors);
            }
        });

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

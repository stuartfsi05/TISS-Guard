import { XMLParser } from 'fast-xml-parser';
import { CORE_RULES } from './RulesEngine';
import { AppSettings } from '../types';
import type { ValidationResult, ValidationError } from './XmlValidatorService';

const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
});

// Worker Message Handler
self.onmessage = async (e: MessageEvent) => {
    const { xmlContent, settings } = e.data as { xmlContent: string, settings: AppSettings };

    try {
        const result = await validateTissInWorker(xmlContent, settings);
        self.postMessage(result);
    } catch (error) {
        self.postMessage({
            isValid: false,
            errors: [{ code: 'WORKER_ERROR', message: 'Erro interno no processador.' }],
            message: 'Erro Interno'
        } as ValidationResult);
    }
};

const validateTissInWorker = async (xmlContent: string, settings: AppSettings): Promise<ValidationResult> => {
    let errors: ValidationError[] = [];
    try {
        // Heavy Parsing
        const jsonObj = parser.parse(xmlContent);

        // Run Rules
        for (const rule of CORE_RULES) {
            if (rule.settingKey && !settings[rule.settingKey]) {
                continue;
            }
            // Await async rules (DB lookups)
            const res = rule.validate(jsonObj);
            const ruleErrors = res instanceof Promise ? await res : res;
            errors = errors.concat(ruleErrors);
        }

        if (errors.length > 0) {
            return { isValid: false, errors, message: 'Falha na validação TISS' };
        }
        return { isValid: true, errors: [], message: 'Estrutura TISS Válida' };

    } catch (e) {
        return {
            isValid: false,
            errors: [{ code: 'XML_PARSE_ERROR', message: 'O arquivo não é um XML válido.' }],
            message: 'Erro de Leitura'
        };
    }
};

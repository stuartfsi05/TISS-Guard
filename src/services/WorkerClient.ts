import { AppSettings } from '../types';
import type { ValidationResult } from './XmlValidatorService';

export const runWorkerValidation = (xmlContent: string, settings: AppSettings): Promise<ValidationResult> => {
    return new Promise((resolve, reject) => {
        // Vite magic for worker import
        const worker = new Worker(new URL('./xml.worker.ts', import.meta.url), { type: 'module' });

        worker.onmessage = (e) => {
            resolve(e.data);
            worker.terminate();
        };

        worker.onerror = (e) => {
            console.error('Worker Error:', e);
            reject(e);
            worker.terminate();
        };

        worker.postMessage({ xmlContent, settings });
    });
};

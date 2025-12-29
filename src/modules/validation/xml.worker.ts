// TISS Guard - XML Stream Worker
// Implements "Split-and-Parse" strategy for low memory footprint validation.

import { XMLParser } from 'fast-xml-parser';
import { validateTiss, ValidationError } from './XmlValidatorService'; // Reusing logic but slightly adapted
import { AppSettings, DEFAULT_SETTINGS } from '../../types';

// Setup Parser
const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true
});

// Polyfill/Type for FileReaderSync (Available in Worker, missing in standard lib.dom.d.ts)
declare class FileReaderSync {
    readAsText(blob: Blob, encoding?: string): string;
}

// Stream Processor
const processFileInChunks = async (file: File, settings: AppSettings) => {
    const reader = new FileReaderSync();
    const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks
    let offset = 0;
    let buffer = '';
    const errors: ValidationError[] = [];

    // 2. Loop Chunks
    while (offset < file.size) {
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        const text = reader.readAsText(slice, 'ISO-8859-1'); // Defaulting to Latin1 for safety involved in TISS
        buffer += text;

        // Regex to find complete tags commonly used for Guides
        const guideRegex = /<(guia[\w-]+)>([\s\S]*?)<\/\1>/g;

        let match;
        while ((match = guideRegex.exec(buffer)) !== null) {
            const [fullTag] = match; // unused vars removed

            // We have a full guide string! Parse it.
            try {
                // Parse isolated chunk
                const guideJson = parser.parse(fullTag);

                // Validate
                const result = await validateTiss(guideJson, settings);

                if (!result.isValid) {
                    errors.push(...result.errors);
                }
            } catch (e) {
                console.error('Chunk Parse Error', e);
            }
        }

        // Reset Logic (Simplified for prototype)
        // If buffer gets too large, we should trim it.
        if (buffer.length > CHUNK_SIZE * 2) {
            buffer = buffer.slice(buffer.length - 2000); // Keep tail
        }

        offset += CHUNK_SIZE;
        self.postMessage({ type: 'progress', progress: (offset / file.size) * 100 });
    }

    return errors;
};

self.onmessage = async (e: MessageEvent) => {
    const { type, payload, settings } = e.data;

    if (type === 'VALIDATE_FILE') {
        try {
            let result;

            if (payload instanceof File && payload.size > 1024 * 1024 * 30) {
                // > 30MB triggers Stream Mode
                const errors = await processFileInChunks(payload, settings || DEFAULT_SETTINGS);
                result = {
                    isValid: errors.length === 0,
                    errors: errors,
                    message: errors.length === 0 ? 'Estrutura TISS Válida (Stream)' : 'Erros detectados'
                };
            } else {
                // Classic Mode
                let content = '';
                if (payload instanceof File) {
                    const reader = new FileReaderSync();
                    content = reader.readAsText(payload, 'ISO-8859-1');
                } else {
                    content = payload;
                }
                result = await validateTiss(content, settings);
            }

            self.postMessage({ type: 'result', result });
        } catch (err: any) {
            self.postMessage({
                type: 'error',
                error: { code: 'WORKER_ERROR', message: err.message }
            });
        }
    }
};

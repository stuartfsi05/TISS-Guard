
// --- Form Filler Service (RPA) ---

export interface FormMapping {
    tissField: string; // The key in our parsed JSON
    domSelectors: string[]; // Possible IDs/Names in the HTML
}

// Common TISS fields to DOM mappings (Heuristics)
const HEURISTIC_MAP: FormMapping[] = [
    {
        tissField: 'numeroGuiaPrestador',
        domSelectors: ['#numeroGuia', '[name="numeroGuia"]', '#nr_guia', '[name*="guia"]']
    },
    {
        tissField: 'dataAtendimento',
        domSelectors: ['#dataAtendimento', '[name="dataAtendimento"]', '.date-mask', '[type="date"]']
    },
    {
        tissField: 'valorTotal',
        domSelectors: ['#valorTotal', '[name="valorTotal"]', '.money-mask']
    }
];

// Helper to find value in parsed XML object
const findValue = (obj: any, key: string): string | null => {
    if (typeof obj !== 'object' || obj === null) return null;
    if (key in obj) return String(obj[key]);

    for (const k of Object.keys(obj)) {
        const val = findValue(obj[k], key);
        if (val) return val;
    }
    return null;
};

export const FormFiller = {
    fill: (jsonObj: any) => {
        console.log('🤖 [TISS Guard RPA] Starting Auto-Fill...');
        let filledCount = 0;

        HEURISTIC_MAP.forEach(mapping => {
            const value = findValue(jsonObj, mapping.tissField);
            if (value) {
                // Try to find a matching input in the DOM
                for (const selector of mapping.domSelectors) {
                    const input = document.querySelector(selector) as HTMLInputElement;
                    if (input && !input.readOnly && !input.disabled) {
                        // Fill it
                        input.value = value;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                        input.style.backgroundColor = '#d1fae5'; // Highlight success (Green)
                        console.log(`✅ Filled ${mapping.tissField} -> ${selector}`);
                        filledCount++;
                        break; // Stop looking for this field once filled
                    }
                }
            }
        });

        if (filledCount > 0) {
            alert(`TISS Guard: ${filledCount} campos preenchidos automaticamente!`);
        } else {
            console.log('⚠️ [TISS Guard RPA] No matching fields found on this page.');
        }
    }
};

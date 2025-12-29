
// --- Form Filler Service (RPA: Heuristic Engine) ---

export interface FormMapping {
    tissField: string;
    labels: string[]; // Text visible to the user (e.g., "Número da Guia", "Carteirinha")
    fallbackSelectors: string[]; // Legacy IDs as backup
}

const HEURISTIC_MAP: FormMapping[] = [
    {
        tissField: 'numeroGuiaPrestador',
        labels: ['Número da Guia', 'Nr. Guia', 'Guia do Prestador'],
        fallbackSelectors: ['#numeroGuia', '[name="numeroGuia"]', '#nr_guia']
    },
    {
        tissField: 'dataAtendimento',
        labels: ['Data do Atendimento', 'Data Execução', 'Data Realização'],
        fallbackSelectors: ['#dataAtendimento', '[name="dataAtendimento"]', '.date-mask']
    },
    {
        tissField: 'codigoBeneficiario',
        labels: ['Carteira', 'Carteirinha', 'Código do Beneficiário', 'Matrícula'],
        fallbackSelectors: ['#carteirinha', '#matricula', '[name="codigoBeneficiario"]']
    },
    {
        tissField: 'valorTotal',
        labels: ['Valor Total', 'Valor Geral', 'Total da Conta'],
        fallbackSelectors: ['#valorTotal', '[name="valorTotal"]']
    }
];

// Helper: Find input by associated label text
const findInputByLabel = (labelTextCandidates: string[]): HTMLInputElement | null => {
    // 1. Get all label elements
    const labels = Array.from(document.querySelectorAll('label'));

    for (const candidate of labelTextCandidates) {
        const normalizedCandidate = candidate.toLowerCase();

        // Find a label that contains the candidate text
        const matchingLabel = labels.find(l =>
            l.textContent?.toLowerCase().includes(normalizedCandidate)
        );

        if (matchingLabel) {
            console.log(`[Heuristic] Found label for "${candidate}"`);

            // Strategy A: 'for' attribute
            const forId = matchingLabel.getAttribute('for');
            if (forId) {
                const input = document.getElementById(forId);
                if (input && input instanceof HTMLInputElement) return input;
            }

            // Strategy B: Nested input
            const nestedInput = matchingLabel.querySelector('input');
            if (nestedInput) return nestedInput;

            // Strategy C: Proximity (Input is the next sibling or close by)
            // This is risky but useful for sloppy HTML
            let next = matchingLabel.nextElementSibling;
            while (next) {
                if (next instanceof HTMLInputElement) return next;
                if (next.querySelector('input')) return next.querySelector('input');
                next = next.nextElementSibling;
                // Don't search too far
                if (next && matchingLabel.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_DISCONNECTED) break;
            }
        }
    }
    return null;
};

// Helper: Find TISS value in XML object
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
        console.log('🤖 [TISS Guard RPA] Starting Heuristic Auto-Fill...');
        let filledCount = 0;

        HEURISTIC_MAP.forEach(mapping => {
            const value = findValue(jsonObj, mapping.tissField);
            if (!value) return;

            // 1. Try Heuristic (Label-based)
            let targetInput = findInputByLabel(mapping.labels);

            // 2. Fallback to selectors if heuristic fails
            if (!targetInput) {
                for (const selector of mapping.fallbackSelectors) {
                    const el = document.querySelector(selector);
                    if (el instanceof HTMLInputElement) {
                        targetInput = el;
                        break;
                    }
                }
            }

            if (targetInput && !targetInput.readOnly && !targetInput.disabled) {
                // Determine if it needs human-like typing simulation
                targetInput.focus();
                targetInput.value = value;

                // Trigger events for reactive frameworks (React, Vue, Angular)
                const events = ['input', 'change', 'blur'];
                events.forEach(e => targetInput?.dispatchEvent(new Event(e, { bubbles: true })));

                // Visual Feedback
                targetInput.style.transition = 'all 0.5s';
                targetInput.style.backgroundColor = '#dcfce7'; // Tailwind green-100
                targetInput.style.border = '2px solid #22c55e'; // Tailwind green-500

                console.log(`✅ Filled field [${mapping.tissField}] with value "${value}"`);
                filledCount++;
            }
        });

        if (filledCount > 0) {
            // Non-intrusive toast instead of Alert
            const toast = document.createElement('div');
            toast.textContent = `TISS Guard: ${filledCount} campos preenchidos.`;
            Object.assign(toast.style, {
                position: 'fixed', bottom: '20px', right: '20px',
                padding: '12px 24px', backgroundColor: '#0f172a', color: 'white',
                borderRadius: '8px', zIndex: '99999', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
            });
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 4000);
        } else {
            console.log('⚠️ [TISS Guard RPA] No fields matched.');
        }
    }
};

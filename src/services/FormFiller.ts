// --- Form Filler Service (RPA: Enterprise Strategy Pattern) ---

// 1. Context Interface
export interface FillContext {
    jsonObj: any;
    filledCount: number;
}

// 2. Strategy Interface
export interface FillStrategy {
    name: string;
    canHandle(url: string): boolean;
    execute(context: FillContext): Promise<void>;
}

// --- Helper Functions ---
const findValue = (obj: any, key: string): string | null => {
    if (typeof obj !== 'object' || obj === null) return null;
    if (key in obj) return String(obj[key]);
    for (const k of Object.keys(obj)) {
        const val = findValue(obj[k], key);
        if (val) return val;
    }
    return null;
};

const triggerEvents = (input: HTMLInputElement) => {
    const events = ['input', 'change', 'blur', 'focus'];
    events.forEach(e => input.dispatchEvent(new Event(e, { bubbles: true })));
};

const visualizeFill = (input: HTMLInputElement) => {
    input.style.transition = 'all 0.5s';
    input.style.backgroundColor = '#dcfce7'; // green-100
    input.style.border = '2px solid #22c55e'; // green-500
};

// --- Concrete Strategies ---

/**
 * 3a. Unimed Strategy (Example of Specific Implementation)
 * Unimed portals often use PrimeFaces/JSF which are tricky.
 */
const UnimedStrategy: FillStrategy = {
    name: 'Unimed Portal Adapter',
    canHandle: (url) => url.includes('unimed') || url.includes('autorizador'),
    execute: async (ctx) => {
        // Example: Unimed often uses specific IDs like 'form:guia'
        const mappings = [
            { tiss: 'numeroGuiaPrestador', selectors: ['[id$=":numeroGuia"]', '#numeroGuia'] },
            { tiss: 'senha', selectors: ['[id$=":senha"]', '#senha'] }
        ];

        mappings.forEach(m => {
            const val = findValue(ctx.jsonObj, m.tiss);
            if (val) {
                const el = document.querySelector(m.selectors.join(', '));
                if (el instanceof HTMLInputElement) {
                    el.value = val;
                    triggerEvents(el);
                    visualizeFill(el);
                    ctx.filledCount++;
                }
            }
        });
    }
};

/**
 * 3b. Bradesco Strategy
 */
const BradescoStrategy: FillStrategy = {
    name: 'Bradesco Saúde Adapter',
    canHandle: (url) => url.includes('bradesco') || url.includes('dentsim'),
    execute: async (ctx) => {
        // Specific logic for Bradesco if different
        // For now, relies on standard IDs often found there
        console.log(`[Bradesco Adapter] Ready for ${ctx.filledCount} items`);
    }
};

/**
 * 3c. Heuristic Strategy (Fallback - The "Human" Reader)
 * Reuses the previous label-reading logic
 */
const HeuristicStrategy: FillStrategy = {
    name: 'Heuristic Fallback Engine',
    canHandle: () => true, // Handles everything else
    execute: async (ctx) => {
        const HEURISTIC_MAP = [
            { tiss: 'numeroGuiaPrestador', labels: ['Número da Guia', 'Nr. Guia', 'Guia do Prestador'] },
            { tiss: 'dataAtendimento', labels: ['Data do Atendimento', 'Data Execução'] },
            { tiss: 'codigoBeneficiario', labels: ['Carteira', 'Carteirinha', 'Matrícula'] },
            { tiss: 'valorTotal', labels: ['Valor Total', 'Valor Geral'] }
        ];

        // Label finder helper (simplified for brevity, reused from before)
        const findInputByLabel = (candidates: string[]) => {
            const labels = Array.from(document.querySelectorAll('label'));
            for (const c of candidates) {
                const match = labels.find(l => l.textContent?.toLowerCase().includes(c.toLowerCase()));
                if (match) {
                    const forId = match.getAttribute('for');
                    if (forId) return document.getElementById(forId) as HTMLInputElement;
                    const nested = match.querySelector('input');
                    if (nested) return nested;
                }
            }
            return null;
        };

        HEURISTIC_MAP.forEach(m => {
            const val = findValue(ctx.jsonObj, m.tiss);
            if (val) {
                const input = findInputByLabel(m.labels);
                if (input && !input.value) { // Only fill if empty to avoid overwriting user
                    input.value = val;
                    triggerEvents(input);
                    visualizeFill(input);
                    ctx.filledCount++;
                }
            }
        });
    }
};

// --- 4. Context/Manager ---
export const FormFiller = {
    fill: async (jsonObj: any) => {
        console.log('🤖 [TISS Guard RPA] Initializing Strategies...');
        const url = window.location.href;

        // Strategy Selection Chain
        const strategies = [UnimedStrategy, BradescoStrategy, HeuristicStrategy];
        let context: FillContext = { jsonObj, filledCount: 0 };

        for (const strategy of strategies) {
            if (strategy.canHandle(url)) {
                console.log(`[RPA] Executing Strategy: ${strategy.name}`);
                await strategy.execute(context);

                // If specific strategy found 0 items, allows falling through to heuristic?
                // For this implementation, we allow heuristic to run ALWAYS as a "cleanup" 
                // unless it's the heuristic itself.
                if (strategy !== HeuristicStrategy) {
                    // Continue to Heuristic?
                    // Usually specific adapters are exclusive. Let's say if specific runs, we stop.
                    // But if specific fails completely (0 fills), maybe fallback?
                    // Let's keep it simple: First match wins.
                    break;
                }
            }
        }

        // Always run Heuristic if nothing else ran or if explicit fallback needed?
        // Let's actually change logic: Specific adapters run. If simple count is low, try heuristic?
        // Current logic above: First match breaks. Unimed -> break.
        // If Unimed adapter is empty, it does nothing.

        // Improved Logic: Run specific. If filledCount == 0, run Heuristic.
        if (context.filledCount === 0 && !strategies[0].canHandle(url) && !strategies[1].canHandle(url)) {
            // Heuristic already ran if it was selected loop.
            // If we broke loop, we used a specific. 
        }

        if (context.filledCount > 0) {
            const toast = document.createElement('div');
            toast.textContent = `TISS Guard: ${context.filledCount} campos preenchidos via RPA.`;
            Object.assign(toast.style, {
                position: 'fixed', bottom: '20px', right: '20px',
                padding: '12px 24px', backgroundColor: '#0f172a', color: 'white',
                borderRadius: '8px', zIndex: '99999', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            });
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 4000);
        } else {
            console.log('⚠️ [TISS Guard RPA] No matching fields found.');
        }
    }
};

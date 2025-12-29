// --- Form Filler Service (RPA: Enterprise Strategy Pattern) ---

// 1. Context Interface
export interface FillContext {
    jsonObj: any;
    filledCount: number;
    failures: { field: string, value: string, reason: string }[];
}

// 2. Strategy Interface
export interface FillStrategy {
    name: string;
    canHandle(url: string): boolean;
    execute(context: FillContext): Promise<void>;
}

// Recipe Interfaces
interface ActionRecipe {
    field: string;
    selectors: string[];
}
interface PortalRecipe {
    portal: string;
    matches: string[];
    actions: ActionRecipe[];
}

// Import Recipes
import unimedRecipe from '../config/recipes/unimed.json';
import bradescoRecipe from '../config/recipes/bradesco.json';

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

// --- Generic Recipe Strategy ---
class RecipeStrategy implements FillStrategy {
    name: string;
    recipe: PortalRecipe;

    constructor(recipe: PortalRecipe) {
        this.name = recipe.portal;
        this.recipe = recipe;
    }

    canHandle(url: string): boolean {
        return this.recipe.matches.some(match => {
            if (match.includes('*')) {
                const regex = new RegExp(match.replace('*', '.*'));
                return regex.test(url);
            }
            return url.includes(match);
        });
    }

    async execute(ctx: FillContext): Promise<void> {
        console.log(`[RPA] Executing Recipe: ${this.name}`);

        for (const action of this.recipe.actions) {
            const val = findValue(ctx.jsonObj, action.field);
            if (val) {
                let filled = false;
                // Try selectors in order
                for (const selector of action.selectors) {
                    const el = document.querySelector(selector);
                    if (el instanceof HTMLInputElement) {
                        el.value = val;
                        triggerEvents(el);
                        visualizeFill(el);
                        ctx.filledCount++;
                        filled = true;
                        break; // Found and filled, move to next field
                    }
                }

                if (!filled) {
                    ctx.failures.push({
                        field: action.field,
                        value: val,
                        reason: `Nenhum seletor encontrou o campo na página. (Tentou: ${action.selectors.join(', ')})`
                    });
                }
            } else {
                // Value not in XML? We don't consider this a failure unless strict mode.
            }
        }
    }
}

// Instantiate Concrete Strategies from JSON
const UnimedStrategy = new RecipeStrategy(unimedRecipe as PortalRecipe);
const BradescoStrategy = new RecipeStrategy(bradescoRecipe as PortalRecipe);

// --- Heuristic Strategy (Fallback) ---
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
        let context: FillContext = { jsonObj, filledCount: 0, failures: [] };

        for (const strategy of strategies) {
            if (strategy.canHandle(url)) {
                console.log(`[RPA] Executing Strategy: ${strategy.name}`);
                await strategy.execute(context);

                // If a recipe claims "matches", we stop there
                if (strategy !== HeuristicStrategy) {
                    break;
                }
            }
        }

        if (context.filledCount > 0) {
            const failureMsg = context.failures.length > 0
                ? `\n⚠️ ${context.failures.length} campos não encontrados.`
                : '';

            const toast = document.createElement('div');
            toast.innerText = `TISS Guard: ${context.filledCount} campos preenchidos.${failureMsg}`;

            Object.assign(toast.style, {
                position: 'fixed', bottom: '20px', right: '20px',
                padding: '12px 24px', backgroundColor: context.failures.length > 0 ? '#431418' : '#0f172a',
                color: 'white', borderLeft: context.failures.length > 0 ? '4px solid #ef4444' : '4px solid #22c55e',
                borderRadius: '8px', zIndex: '99999', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                fontFamily: 'system-ui', fontSize: '14px', lineHeight: '1.5'
            });

            // Allow click to see details
            if (context.failures.length > 0) {
                toast.style.cursor = 'pointer';
                toast.title = "Clique para ver detalhes no Console";
                toast.onclick = () => {
                    console.table(context.failures);
                    alert(`Campos não encontrados:\n${context.failures.map(f => `- ${f.field}: ${f.reason}`).join('\n')}`);
                };
            }

            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 8000);
        } else {
            console.log('⚠️ [TISS Guard RPA] No matching fields found.');
        }
    }
};

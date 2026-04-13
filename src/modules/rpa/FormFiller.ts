import { DomLocator, SemanticTarget } from "./DomLocator";
import recipeSemantic from "./recipes/recipe-semantic.json";

/**
 * Context object tracking the state of form filling operations.
 * @interface FillContext
 * @property {any} jsonObj - The JSON parsed from the TISS XML.
 * @property {number} filledCount - Number of fields successfully filled.
 * @property {Array<{ field: string, value: string, reason: string }>} failures - Track failed fill attempts.
 */
export interface FillContext {
  jsonObj: any;
  filledCount: number;
  failures: { field: string; value: string; reason: string }[];
}

/**
 * Strategy interface to handle different form generation techniques.
 * @interface FillStrategy
 */
export interface FillStrategy {
  name: string;
  canHandle(url: string): boolean;
  execute(context: FillContext): Promise<void>;
}

interface ActionRecipe {
  field: string;
  target: SemanticTarget;
}

interface PortalRecipe {
  portal: string;
  matches: string[];
  actions: ActionRecipe[];
}

const findValue = (obj: any, key: string): string | null => {
  if (typeof obj !== "object" || obj === null) return null;
  if (key in obj) return String(obj[key]);
  for (const k of Object.keys(obj)) {
    const val = findValue(obj[k], key);
    if (val) return val;
  }
  return null;
};

const triggerEvents = (input: HTMLInputElement) => {
  const events = ["input", "change", "blur", "focus"];
  events.forEach((e) => input.dispatchEvent(new Event(e, { bubbles: true })));
};

/**
 * Force setting the native value bypassing Virtual DOM constraints, ensuring React/Angular pick it up.
 * @param {HTMLInputElement} element - The input element to fill.
 * @param {string} value - The intended value of the field.
 */
const setNativeValue = (element: HTMLInputElement, value: string) => {
  const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(
    prototype,
    "value",
  )?.set;

  if (valueSetter && valueSetter !== prototypeValueSetter) {
    valueSetter.call(element, value);
  } else if (prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new Event("input", { bubbles: true }));
};

const visualizeFill = (input: HTMLInputElement) => {
  input.style.transition = "all 0.5s";
  input.style.backgroundColor = "#dcfce7";
  input.style.border = "2px solid #22c55e";
};

class RecipeStrategy implements FillStrategy {
  name: string;

  private recipe: PortalRecipe;

  constructor(recipe: PortalRecipe) {
    this.name = recipe.portal;
    this.recipe = recipe;
  }

  canHandle(url: string): boolean {
    return this.recipe.matches.some((match) => {
      if (match.includes("*")) {
        const regex = new RegExp(match.replace("*", ".*"));
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
        const el = DomLocator.locateInput(action.target);
        if (el) {
          setNativeValue(el, val);
          triggerEvents(el);
          visualizeFill(el);
          ctx.filledCount += 1;
        } else {
          ctx.failures.push({
            field: action.field,
            value: val,
            reason: `Nenhum alvo semântico encontrou o campo na página. (Alvo: ${JSON.stringify(
              action.target,
            )})`,
          });
        }
      }
    }
  }
}

const semanticStrategy = new RecipeStrategy(recipeSemantic as PortalRecipe);

const heuristicStrategy: FillStrategy = {
  name: "Heuristic Fallback Engine",
  canHandle: () => true,
  execute: async (ctx) => {
    const heuristicMap = [
      {
        tiss: "numeroGuiaPrestador",
        labels: ["Número da Guia", "Nr. Guia", "Guia do Prestador"],
      },
      {
        tiss: "dataAtendimento",
        labels: ["Data do Atendimento", "Data Execução"],
      },
      {
        tiss: "codigoBeneficiario",
        labels: ["Carteira", "Carteirinha", "Matrícula"],
      },
      { tiss: "valorTotal", labels: ["Valor Total", "Valor Geral"] },
    ];

    const findInputByLabel = (candidates: string[]) => {
      const labels = Array.from(document.querySelectorAll("label"));
      for (const c of candidates) {
        const match = labels.find((l) =>
          l.textContent?.toLowerCase().includes(c.toLowerCase()),
        );
        if (match) {
          const forId = match.getAttribute("for");
          if (forId) return document.getElementById(forId) as HTMLInputElement;
          const nested = match.querySelector("input");
          if (nested) return nested;
        }
      }
      return null;
    };

    heuristicMap.forEach((m) => {
      const val = findValue(ctx.jsonObj, m.tiss);
      if (val) {
        const input = findInputByLabel(m.labels);
        if (input && !input.value) {
          setNativeValue(input, val);
          triggerEvents(input);
          visualizeFill(input);
          ctx.filledCount += 1;
        }
      }
    });
  },
};

/**
 * Main form filling orchestrator managing standard operations and strategy fallbacks.
 * @class FormFiller
 */
export const FormFiller = {
  /**
   * Attempts to fill form fields present on the page based on the parsed XML standard data.
   * @param {any} jsonObj - Parsed structured data to attempt filling into the active form.
   */
  fill: async (jsonObj: any) => {
    console.log("🤖 [TISS Guard RPA] Initializing Strategies...");
    const url = window.location.href;

    const strategies = [semanticStrategy, heuristicStrategy];
    const context: FillContext = { jsonObj, filledCount: 0, failures: [] };

    for (const strategy of strategies) {
      if (strategy.canHandle(url)) {
        console.log(`[RPA] Executing Strategy: ${strategy.name}`);
        await strategy.execute(context);

        if (strategy !== heuristicStrategy) {
          break;
        }
      }
    }

    if (context.filledCount > 0) {
      const failureMsg =
        context.failures.length > 0
          ? `\n⚠️ ${context.failures.length} campos não encontrados.`
          : "";

      const toast = document.createElement("div");
      toast.innerText = `TISS Guard: ${context.filledCount} campos preenchidos.${failureMsg}`;

      Object.assign(toast.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: "12px 24px",
        backgroundColor: context.failures.length > 0 ? "#431418" : "#0f172a",
        color: "white",
        borderLeft:
          context.failures.length > 0
            ? "4px solid #ef4444"
            : "4px solid #22c55e",
        borderRadius: "8px",
        zIndex: "99999",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        fontFamily: "system-ui",
        fontSize: "14px",
        lineHeight: "1.5",
      });

      if (context.failures.length > 0) {
        toast.style.cursor = "pointer";
        toast.title = "Clique para ver detalhes no Console";
        toast.onclick = () => {
          console.table(context.failures);
          alert(
            `Campos não encontrados:\n${context.failures.map((f) => `- ${f.field}: ${f.reason}`).join("\n")}`,
          );
        };
      }

      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 8000);
    } else {
      console.log("⚠️ [TISS Guard RPA] No matching fields found.");
    }
  },
};

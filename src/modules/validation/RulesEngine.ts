import { AppSettings } from "../../types";
import { ValidationError } from "./XmlValidatorService";
import { REQUIRED_STRUCTURE } from "./SchemaDefinitions";
import { TussDatabaseService } from "../../modules/data/TussDatabaseService";
import { getVersionStatus } from "../../modules/config/VersionMatrix";

/**
 * Represents a validation policy within the TISS Guard engine.
 * @interface TissRule
 * @property {string} id - Unique identifier for the rule.
 * @property {string} description - Human-readable explanation of what the rule validates.
 * @property {keyof AppSettings} [settingKey] - Optional link to a user setting that can toggle this rule.
 */
export interface TissRule {
  id: string;
  description: string;
  settingKey?: keyof AppSettings;
  /**
   * Executes the validation logic against a parsed XML object.
   * @param {any} jsonObj - The un-typed object representation of the TISS XML payload.
   * @returns {Promise<ValidationError[]> | ValidationError[]} An array of validation errors. Empty array if valid.
   */
  validate(jsonObj: any): Promise<ValidationError[]> | ValidationError[];
}
// ... (imports) ...
// (Import moved to top)

// ... (existing helper and rules) ...

// 2. TUSS Table Validation Mock (Priority 3 -> Critical Real DB)
export const TussValidationRule: TissRule = {
  id: "TUSS_VALIDATION",
  description: "Valida se códigos TUSS existem na tabela vigente (IndexedDB).",
  validate: async (jsonObj: any) => {
    const errors: ValidationError[] = [];
    const hits = findAllValues(jsonObj, "codigoTabela");

    // Ensure DB is ready
    await TussDatabaseService.init();

    // We can do this in parallel for performance
    const checks = hits.map(async (hit) => {
      const code = String(hit.value);
      // Only validate if it looks like a TUSS code (8 digits)
      if (/^\d{8}$/.test(code)) {
        const exists = await TussDatabaseService.checkCodeExists(code);
        if (!exists) {
          // Check if the table is empty (user hasn't imported yet)
          const count = await TussDatabaseService.getCount();
          if (count > 0) {
            errors.push({
              code: "TUSS_INEXISTENTE",
              message: `O código TUSS ${code} não foi encontrado na tabela local. (Local: ${hit.path})`,
            });
          }
        }
      }
    });

    await Promise.all(checks);
    return errors;
  },
};

/**
 * Recursively searches a deep JSON object for all occurrences of a specific key.
 *
 * @param {any} obj - The object to search within.
 * @param {string} keyToFind - The key name to locate.
 * @returns {Array<{ value: any; path: string }>} A list of found values mapped to their dot-notation path.
 */
const findAllValues = (
  obj: any,
  keyToFind: string,
): { value: any; path: string }[] => {
  let results: { value: any; path: string }[] = [];
  if (typeof obj !== "object" || obj === null) return results;

  if (keyToFind in obj) {
    results.push({ value: obj[keyToFind], path: keyToFind });
  }

  for (const key of Object.keys(obj)) {
    const childResults = findAllValues(obj[key], keyToFind);
    results = results.concat(
      childResults.map((r) => ({ ...r, path: `${key} > ${r.path}` })),
    );
  }
  return results;
};

// Start: Deep Validation Engine
export const createDependencyRule = (
  id: string,
  description: string,
  condition: (json: any) => boolean,
  validateFn: (json: any) => ValidationError[],
): TissRule => ({
  id,
  description,
  validate: (json) => {
    if (condition(json)) {
      return validateFn(json);
    }
    return [];
  },
});
// End: Deep Validation Engine

// --- Concrete Strategies ---

export const TussFormatRule: TissRule = {
  id: "TUSS_FORMATO_INVALIDO",
  description: "Verifica se os códigos da tabela possuem 8 dígitos numéricos.",
  validate: (jsonObj: any) => {
    const errors: ValidationError[] = [];
    const hits = findAllValues(jsonObj, "codigoTabela");

    hits.forEach((hit) => {
      const val = String(hit.value);
      if (!/^\d{8}$/.test(val)) {
        errors.push({
          code: "FORMATO_TUSS_INVALIDO",
          message: `Código '${val}' inválido. Deve ter 8 dígitos. (Local: ${hit.path})`,
        });
      }
    });
    return errors;
  },
};

export const MissingGuiaRule: TissRule = {
  id: "GUIA_AUSENTE",
  description:
    "Verifica se o número da guia está presente em guias de consulta/SP/SADT.",
  validate: (jsonObj: any) => {
    const errors: ValidationError[] = [];
    // Heuristic: If we are deep inside a guide structure, we expect a number
    const hits = findAllValues(jsonObj, "numeroGuiaPrestador");

    // Simpler check for now:
    hits.forEach((hit) => {
      if (!hit.value || String(hit.value).trim() === "") {
        errors.push({
          code: "NM_GUIA_VAZIO",
          message: `Número da guia em branco. (Local: ${hit.path})`,
        });
      }
    });

    return errors;
  },
};

export const FutureDateRule: TissRule = {
  id: "DATA_FUTURA",
  description: "Impede o envio de procedimentos com data de execução futura.",
  validate: (jsonObj: any) => {
    const errors: ValidationError[] = [];
    const dateFields = ["dataAtendimento", "dataExecucao", "dataRealizacao"];

    const today = new Date();
    today.setHours(23, 59, 59, 999); // Allow anytime today

    dateFields.forEach((field) => {
      const hits = findAllValues(jsonObj, field);
      hits.forEach((hit) => {
        const parts = String(hit.value).split("-"); // YYYY-MM-DD
        if (parts.length === 3) {
          const dateVal = new Date(hit.value);
          if (dateVal > today) {
            errors.push({
              code: "DATA_FUTURA_DETECTADA",
              message: `A data ${hit.value} não pode ser futura. (Local: ${hit.path})`,
            });
          }
        }
      });
    });

    return errors;
  },
};

export const NegativeValueRule: TissRule = {
  id: "VALOR_NEGATIVO",
  description: "Verifica se existem valores monetários negativos.",
  validate: (jsonObj: any) => {
    const errors: ValidationError[] = [];
    const valueFields = [
      "valorTotal",
      "valorProcessado",
      "valorLiberado",
      "valorGlosa",
    ];

    valueFields.forEach((field) => {
      const hits = findAllValues(jsonObj, field);
      hits.forEach((hit) => {
        const val = parseFloat(hit.value);
        if (val < 0) {
          errors.push({
            code: "VALOR_NEGATIVO",
            message: `Valor monetário inválido (${val}). (Local: ${hit.path})`,
          });
        }
      });
    });

    return errors;
  },
};

// --- New Rules for Enterprise Hardening ---

// 1. TISS Version Check (Priority 9)
// The <padrao> tag is critical. Old versions (e.g. 3.02) have different schemas.
// (Import moved to top)

// ...

export const TissVersionRule: TissRule = {
  id: "TISS_VERSION_VIGENTE",
  description: "Verifica a versão do padrão TISS no arquivo.",
  validate: (jsonObj: any) => {
    const errors: ValidationError[] = [];
    // Helper to find the version tag deep in the object
    const findVersion = (obj: any): string | null => {
      if (!obj) return null;
      // Common tag names for version
      if (obj.padrao) return obj.padrao;
      if (obj["ans:padrao"]) return obj["ans:padrao"];

      if (typeof obj === "object") {
        for (const key in obj) {
          const res = findVersion(obj[key]);
          if (res) return res;
        }
      }
      return null;
    };

    const version = findVersion(jsonObj);

    if (!version) {
      errors.push({
        code: "VERSAO_NAO_ENCONTRADA",
        message:
          "Não foi possível identificar a versão do padrão TISS no arquivo (Tag <padrao> ausente).",
      });
      return errors;
    }

    const status = getVersionStatus(version);

    if (!status.isValid) {
      errors.push({
        code: "TISS_VERSAO_OBSOLETA",
        message: status.message || `A versão TISS ${version} está obsoleta.`,
      });
    }

    return errors;
  },
};

// 2. TUSS Table Validation Mock (Priority 3)
// Stub for validating if a procedure code actually exists in the official table.

// (Import moved to top)

// ...

// 3. Structural/Schema Validation (Priority 3 -> Critical)
// Checks if the XML has the mandatory TISS hierarchy (message -> header -> body)
export const StructureRule: TissRule = {
  id: "ESTRUTURA_INVALIDA",
  description:
    "Verifica a integridade estrutural básica do XML (Schema Lógico).",
  validate: (jsonObj: any) => {
    const errors: ValidationError[] = [];

    // 1. Check Root
    let rootKey = "";
    for (const key of REQUIRED_STRUCTURE.root) {
      if (key in jsonObj) {
        rootKey = key;
        break;
      }
    }

    if (!rootKey) {
      errors.push({
        code: "TAG_RAIZ_AUSENTE",
        message:
          "Tag raiz <mensagemTISS> não encontrada. O arquivo não parece ser um XML TISS.",
      });
      return errors; // Abort further checks
    }

    const root = jsonObj[rootKey];

    // 2. Check Header
    let headerKey = "";
    for (const key of REQUIRED_STRUCTURE.header) {
      if (key in root) {
        headerKey = key;
        break;
      }
    }

    if (!headerKey) {
      errors.push({
        code: "CABECALHO_AUSENTE",
        message: "Tag <cabecalho> é obrigatória.",
      });
    } else {
      // Check mandatory properties inside header
      const header = root[headerKey];
      REQUIRED_STRUCTURE.headerFields.forEach((field) => {
        let found = false;
        // Simple check: exact match or namespaced match (ans:field)
        if (field in header || `ans:${field}` in header) found = true;

        if (!found) {
          errors.push({
            code: "CAMPO_CABECALHO_AUSENTE",
            message: `Campo obrigatório <${field}> ausente no cabeçalho.`,
          });
        }
      });
    }

    // 3. Check Body Presence (Prestador, Operadora, etc)
    let bodyFound = false;
    for (const key of REQUIRED_STRUCTURE.body) {
      if (key in root) {
        bodyFound = true;
        break;
      }
    }

    if (!bodyFound) {
      errors.push({
        code: "CORPO_TISS_AUSENTE",
        message:
          "Nenhum corpo de mensagem identificado (ex: prestadorParaOperadora).",
      });
    }

    return errors;
  },
};

// 3. Conditional Rule Example: Dependency Rule
export const IndicationRule = createDependencyRule(
  "INDICACAO_CLINICA_OBRIGATORIA",
  "Exige indicação clínica para exames (Tipo 05).",
  (json) => {
    const types = findAllValues(json, "tipoAtendimento");
    return types.some((t) => String(t.value) === "05");
  },
  (json) => {
    const errors: ValidationError[] = [];
    const indications = findAllValues(json, "indicacaoClinica");
    if (indications.length === 0) {
      errors.push({
        code: "INDICACAO_CLINICA_AUSENTE",
        message: "Para exames (Tipo 05), a indicação clínica é obrigatória.",
      });
    }
    return errors;
  },
);

/**
 * REGRA 1: Cardinalidade Cabecalho
 * Base Legal: XSD ct_guiaCabecalho -> <element name="registroANS" type="ans:st_registroANS"/>
 */
export const RuleRegistroANSConfirmacao: TissRule = createDependencyRule(
  "TISS_CARDINALITY_REGISTRO_ANS",
  "Garante que toda guia submetida possua a identificação da operadora (Registro ANS) populada.",
  (json) => findAllValues(json, "ct_guiaCabecalho").length > 0,
  (json) => {
    const errors: ValidationError[] = [];
    const cabecalhos = findAllValues(json, "ct_guiaCabecalho");
    cabecalhos.forEach((cab) => {
      const registros = findAllValues(cab.value, "registroANS");
      if (registros.length === 0) {
        errors.push({
          code: "REGISTRO_ANS_AUSENTE",
          message:
            "Falha estrutural: 'registroANS' ausente em 'ct_guiaCabecalho'.",
        });
      }
    });
    return errors;
  },
);

/**
 * REGRA 2: Cardinalidade Beneficiário
 * Base Legal: XSD ct_beneficiarioDados -> <element name="numeroCarteira" type="ans:st_texto20"/>
 */
export const RuleCarteiraBeneficiarioCardinalidade: TissRule =
  createDependencyRule(
    "TISS_CARDINALITY_CARTEIRA_BENEFICIARIO",
    "Garante que a carteirinha do beneficiário nunca seja omitida nos blocos de beneficiário da guia.",
    (json) => findAllValues(json, "ct_beneficiarioDados").length > 0,
    (json) => {
      const errors: ValidationError[] = [];
      const beneficiarios = findAllValues(json, "ct_beneficiarioDados");
      beneficiarios.forEach((ben) => {
        const carteiras = findAllValues(ben.value, "numeroCarteira");
        if (
          carteiras.length === 0 ||
          String(carteiras[0].value).trim() === ""
        ) {
          errors.push({
            code: "CARTEIRA_BENEFICIARIO_AUSENTE",
            message: `Falha estrutural: Nó 'numeroCarteira' é obrigatório para o beneficiário. (Local: ${ben.path})`,
          });
        }
      });
      return errors;
    },
  );

/**
 * REGRA 3: Limite Máximo de Caracteres em Chaves (Carteira)
 * Base Legal: XSD st_texto20 (Referenciado em ct_beneficiarioDados -> numeroCarteira)
 */
export const RuleCarteiraMaxLengthRestricao: TissRule = {
  id: "TISS_MAXLENGTH_TEXTO20_CARTEIRA",
  description:
    "Verifica se todas as entradas de carteira no payload respeitam o limite físico de 20 caracteres.",
  validate: (jsonObj: any) => {
    const errors: ValidationError[] = [];
    const carteiras = findAllValues(jsonObj, "numeroCarteira");
    carteiras.forEach((hit) => {
      if (String(hit.value).length > 20) {
        errors.push({
          code: "MAXLENGTH_EXCEDED_CARTEIRA",
          message: `Rejeição de Parsing: 'numeroCarteira' (${hit.value}) excede limite de 20 caracteres. (Local: ${hit.path})`,
        });
      }
    });
    return errors;
  },
};

/**
 * REGRA 4: Limite Máximo de Caracteres em Chaves (Guia Prestador)
 * Base Legal: XSD st_texto20 (Referenciado em ct_guiaCabecalho -> numeroGuiaPrestador)
 */
export const RuleGuiaPrestadorMaxLengthRestricao: TissRule = {
  id: "TISS_MAXLENGTH_TEXTO20_GUIA_PRESTADOR",
  description:
    "Garante a restrição no tamanho do ID inserido pelo prestador para evitar quebras no banco.",
  validate: (jsonObj: any) => {
    const errors: ValidationError[] = [];
    const guias = findAllValues(jsonObj, "numeroGuiaPrestador");
    guias.forEach((hit) => {
      if (String(hit.value).length > 20) {
        errors.push({
          code: "MAXLENGTH_EXCEDED_GUIA_PRESTADOR",
          message: `Rejeição estrutural: 'numeroGuiaPrestador' (${hit.value}) excede 20 caracteres. (Local: ${hit.path})`,
        });
      }
    });
    return errors;
  },
};

/**
 * REGRA 5: Enumeração e Domínio Restrito (Recém Nascido)
 * Base Legal: XSD ct_beneficiarioDados -> <element name="atendimentoRN" type="ans:dm_simNao"/>
 */
export const RuleAtendimentoRNDominioEnum: TissRule = {
  id: "TISS_DOMAIN_SIMNAO_ATENDIMENTORN",
  description: "Valida um domínio estrito baseado em Yes/No (S ou N).",
  validate: (jsonObj: any) => {
    const errors: ValidationError[] = [];
    const marcadoresRN = findAllValues(jsonObj, "atendimentoRN");
    const allowedDomans = ["S", "N"];

    marcadoresRN.forEach((hit) => {
      const valor = String(hit.value).toUpperCase();
      if (!allowedDomans.includes(valor)) {
        errors.push({
          code: "DOMAIN_VIOLATION_ATENDIMENTORN",
          message: `Violação de Domínio Estrito: 'atendimentoRN' esperava 'S' ou 'N', mas recebeu '${hit.value}'. (Local: ${hit.path})`,
        });
      }
    });
    return errors;
  },
};

// --- Registry ---
export const CORE_RULES: TissRule[] = [
  TissVersionRule,
  StructureRule,
  TussFormatRule,
  TussValidationRule,
  IndicationRule,
  MissingGuiaRule,
  FutureDateRule,
  NegativeValueRule,
  // --- XSD Strict Rules ---
  RuleRegistroANSConfirmacao,
  RuleCarteiraBeneficiarioCardinalidade,
  RuleCarteiraMaxLengthRestricao,
  RuleGuiaPrestadorMaxLengthRestricao,
  RuleAtendimentoRNDominioEnum,
];

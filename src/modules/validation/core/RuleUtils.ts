import { ValidationError } from "../XmlValidatorService";
import { TissRule } from "./TissRule";

/**
 * Recursively searches a deep JSON object for all occurrences of a specific key.
 *
 * @param {any} obj - The object to search within.
 * @param {string} keyToFind - The key name to locate.
 * @returns {Array<{ value: any; path: string }>} A list of found values mapped to their dot-notation path.
 */
export const findAllValues = (
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

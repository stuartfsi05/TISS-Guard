/**
 * Represents the semantic criteria for mapping and finding a DOM element.
 * @interface SemanticTarget
 * @property {string} [ariaLabel] - Matches the `aria-label` attribute on the element.
 * @property {string} [nameAttribute] - Matches the `name` attribute on the element.
 * @property {string} [labelText] - Searches for a `<label>` containing this text to find its associated input.
 * @property {string[]} [cssFallback] - A list of fallback CSS selectors if semantic targets fail.
 */
export interface SemanticTarget {
  ariaLabel?: string;
  nameAttribute?: string;
  labelText?: string;
  cssFallback?: string[];
}

/**
 * Utility to locate DOM elements based on semantic definitions.
 * @class DomLocator
 */
export const DomLocator = {
  /**
   * Executes a chain of responsibility to locate an input field in a fragile or unpredictable DOM.
   * Uses semantic attributes first, labels second, and pure CSS selectors as a fallback.
   *
   * @param {SemanticTarget} target - The semantic criteria used to locate the input.
   * @returns {HTMLInputElement | null} The resolved HTML input element, or null if not found.
   */
  locateInput(target: SemanticTarget): HTMLInputElement | null {
    if (target.nameAttribute) {
      const el = document.querySelector(
        `input[name="${target.nameAttribute}"]`,
      );
      if (el instanceof HTMLInputElement) return el;
    }

    if (target.ariaLabel) {
      const el = document.querySelector(
        `input[aria-label="${target.ariaLabel}"]`,
      );
      if (el instanceof HTMLInputElement) return el;
    }

    if (target.labelText) {
      const lowerLabel = target.labelText.toLowerCase();
      const xpath = `//label[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ', 'abcdefghijklmnopqrstuvwxyzáéíóúàèìòùâêîôûãõç'), '${lowerLabel}')]`;

      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null,
      );

      for (let i = 0; i < result.snapshotLength; i += 1) {
        const labelElement = result.snapshotItem(i) as HTMLLabelElement;

        const forId = labelElement.getAttribute("for");
        if (forId) {
          const el = document.getElementById(forId);
          if (el instanceof HTMLInputElement) return el;
        }

        const nestedInput = labelElement.querySelector("input");
        if (nestedInput instanceof HTMLInputElement) return nestedInput;
      }
    }

    if (target.cssFallback && target.cssFallback.length > 0) {
      for (const selector of target.cssFallback) {
        const el = document.querySelector(selector);
        if (el instanceof HTMLInputElement) return el;
      }
    }

    return null;
  },
};

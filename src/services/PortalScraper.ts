
// --- Interface for Portal Adapters ---
export interface PortalAdapter {
    name: string;
    // Returns true if this adapter handles the current URL
    canHandle(url: string): boolean;
    // Returns a list of error messages found on the page
    scrapeErrors(): string[];
}

// --- Generic Adapter (Fallback) ---
// Looks for common error classes used in Bootstrap, Material UI, etc.
const GenericAdapter: PortalAdapter = {
    name: 'Generic',
    canHandle: (_url: string) => true, // Fallback handles everything
    scrapeErrors: () => {
        const errors: string[] = [];

        // Common selectors for error messages
        const selectors = [
            '.alert-danger',
            '.error-message',
            '.invalid-feedback',
            '[role="alert"]',
            '.toast-error'
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                // Ensure it's visible
                const style = window.getComputedStyle(el);
                if (style.display !== 'none' && style.visibility !== 'hidden' && el.textContent) {
                    const text = el.textContent.trim();
                    if (text.length > 0 && !errors.includes(text)) {
                        errors.push(text);
                    }
                }
            });
        });

        return errors;
    }
};

// --- Unimed Adapter (Example Skeleton) ---
// Would target specific specific Unimed classes
const UnimedAdapter: PortalAdapter = {
    name: 'Unimed',
    canHandle: (url: string) => url.includes('unimed') || url.includes('autorizador'),
    scrapeErrors: () => {
        const errors: string[] = [];
        // Example Unimed specific selector (hypothetical)
        document.querySelectorAll('.msg-erro, .ui-messages-error-summary').forEach(el => {
            if (el.textContent) errors.push(el.textContent.trim());
        });
        return errors;
    }
};

// --- Manager ---
export const PortalScraper = {
    getAdapter: (): PortalAdapter => {
        const url = window.location.href;

        // Priority List
        if (UnimedAdapter.canHandle(url)) return UnimedAdapter;

        return GenericAdapter;
    },

    scan: (): string[] => {
        const adapter = PortalScraper.getAdapter();
        console.log(`[TISS Guard] Scanning with adapter: ${adapter.name}`);
        return adapter.scrapeErrors();
    }
};

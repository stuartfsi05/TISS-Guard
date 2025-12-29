// Secure Storage Facade
// In a real enterprise environment, this would use WebCrypto API to encrypt specific keys before saving to chrome.storage.local.
// For now, it provides the clean interface and a clear location for audit.

// For now, it provides the clean interface and a clear location for audit.

// Basic Base64 Obfuscation for "Security by Obscurity" (Phase 1)
// Real encryption requires user password derivation (PBKDF2), which is UX heavy.
const encrypt = (data: string): string => {
    return btoa(data); // Placeholder for crypto.subtle.encrypt
};

const decrypt = (data: string): string => {
    try {
        return atob(data);
    } catch {
        return '';
    }
};

export const SecureStorage = {
    // Save PII (Encrypted)
    setItem: async (key: string, value: any) => {
        const str = JSON.stringify(value);
        const secret = encrypt(str);
        // We use a prefix to identify secure items in local storage
        await chrome.storage.local.set({ [`SEC_${key}`]: secret });
    },

    // Retrieve PII
    getItem: async <T>(key: string): Promise<T | null> => {
        const store = await chrome.storage.local.get([`SEC_${key}`]);
        const secret = store[`SEC_${key}`];
        if (!secret) return null;

        try {
            const str = decrypt(secret);
            return JSON.parse(str) as T;
        } catch (e) {
            console.error('SecureStorage Decryption Failed', e);
            return null;
        }
    },

    // Sanitize/Wipe sensitive data
    clearSecrets: async () => {
        const all = await chrome.storage.local.get(null);
        const keysToRemove = Object.keys(all).filter(k => k.startsWith('SEC_'));
        if (keysToRemove.length > 0) {
            await chrome.storage.local.remove(keysToRemove);
        }
    }
};

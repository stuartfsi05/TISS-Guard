export interface AppSettings {
    checkFutureDates: boolean;
    checkNegativeValues: boolean;
    isPremium: boolean;
    theme: 'light' | 'dark' | 'system';
    usage: {
        count: number;
        lastReset: string; // YYYY-MM format
    };
}

import * as jose from 'jose';
import { PUBLIC_LICENSE_KEY } from '../constants/LicenseKey';

export const DEFAULT_SETTINGS: AppSettings = {
    checkFutureDates: true,
    checkNegativeValues: true,
    isPremium: false,
    theme: 'light',
    usage: {
        count: 0,
        lastReset: new Date().toISOString().slice(0, 7), // "2023-10"
    },
};

export const StorageService = {
    getSettings: async (): Promise<AppSettings> => {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
            return DEFAULT_SETTINGS;
        }

        const result = await chrome.storage.local.get(['settings']);
        let settings = result.settings || DEFAULT_SETTINGS;

        // Ensure usage object exists (migration)
        if (!settings.usage) {
            settings = { ...settings, usage: DEFAULT_SETTINGS.usage };
        }

        // Monthly Reset Check
        const currentMonth = new Date().toISOString().slice(0, 7);
        if (settings.usage.lastReset !== currentMonth) {
            settings.usage.count = 0;
            settings.usage.lastReset = currentMonth;
            await chrome.storage.local.set({ settings }); // Auto-save reset
        }

        return settings;
    },

    saveSettings: async (settings: AppSettings): Promise<void> => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            await chrome.storage.local.set({ settings });
        }
    },

    incrementUsage: async (): Promise<void> => {
        const settings = await StorageService.getSettings();
        settings.usage.count += 1;
        await StorageService.saveSettings(settings);
    },

    canValidate: async (): Promise<boolean> => {
        const settings = await StorageService.getSettings();
        if (settings.isPremium) return true;
        return settings.usage.count < 3;
    },

    setPremiumStatus: async (token: string): Promise<boolean> => {
        try {
            // Import Key efficiently
            const publicKey = await jose.importSPKI(PUBLIC_LICENSE_KEY, 'ES256');

            // Verify Token
            const { payload } = await jose.jwtVerify(token, publicKey, {
                algorithms: ['ES256']
            });

            // Check specific claims if needed (e.g., expiration is checked automatically by jose)
            if (payload.type === 'pro') {
                const settings = await StorageService.getSettings();
                settings.isPremium = true;
                await StorageService.saveSettings(settings);
                return true;
            }
            return false;
        } catch (e: any) {
            console.error("Validação de licença falhou:", e);
            // Temporary Debug: Show error to user
            if (typeof alert !== 'undefined') alert(`Erro Técnico na Validação: ${e.message}`);
            return false;
        }
    }
};

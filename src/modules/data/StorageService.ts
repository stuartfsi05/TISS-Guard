import { AppSettings, DEFAULT_SETTINGS } from '../../types';
export type { AppSettings };
export { DEFAULT_SETTINGS };

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

        // Force Premium for everyone
        settings.isPremium = true;

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
        // Always allowed
        return true;
    }
};

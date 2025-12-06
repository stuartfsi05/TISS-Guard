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
        // Simulating API verification
        if (token === 'PRO_USER_2025') {
            const settings = await StorageService.getSettings();
            settings.isPremium = true;
            await StorageService.saveSettings(settings);
            return true;
        }
        return false;
    }
};

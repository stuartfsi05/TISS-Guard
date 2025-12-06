export interface AppSettings {
    checkFutureDates: boolean;
    checkNegativeValues: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
    checkFutureDates: true,
    checkNegativeValues: true,
};

export const StorageService = {
    getSettings: async (): Promise<AppSettings> => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            const result = await chrome.storage.local.get(['settings']);
            return result.settings || DEFAULT_SETTINGS;
        }
        return DEFAULT_SETTINGS;
    },

    saveSettings: async (settings: AppSettings): Promise<void> => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            await chrome.storage.local.set({ settings });
        }
    }
};

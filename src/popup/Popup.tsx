import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { validateTiss, ValidationResult } from '../services/XmlValidatorService';
import { StorageService, AppSettings, DEFAULT_SETTINGS } from '../services/StorageService';
import './index.css';

const Popup = () => {
    const [activeTab, setActiveTab] = useState<'verify' | 'settings'>('verify');
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [isHoveringFile, setIsHoveringFile] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = () => {
        StorageService.getSettings().then((s) => {
            setSettings(s);
        });
    };

    const handleSettingChange = (key: keyof AppSettings) => {
        const newSettings = { ...settings, [key]: !settings[key as keyof AppSettings] };
        setSettings(newSettings);
        StorageService.saveSettings(newSettings);
    };

    const toggleTheme = () => {
        const newTheme: 'light' | 'dark' = settings.theme === 'dark' ? 'light' : 'dark';
        const newSettings = { ...settings, theme: newTheme };
        setSettings(newSettings);
        StorageService.saveSettings(newSettings);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        const validation = validateTiss(text, settings);
        setResult(validation);

        await StorageService.incrementUsage();
        loadSettings();
    };

    const isDark = settings.theme === 'dark';

    return (
        <div className={`w-[400px] h-[600px] flex flex-col font-sans transition-colors duration-500 overflow-hidden relative
            ${isDark ? 'bg-[#0B1121] text-slate-100' : 'bg-[#F1F5F9] text-slate-800'}`}>

            {/* Background Gradients - Static & Subtle */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className={`absolute -top-20 -left-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-[80px] opacity-25
                    ${isDark ? 'bg-indigo-900/60' : 'bg-blue-300/60'}`}></div>
                <div className={`absolute top-0 -right-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-[80px] opacity-25
                    ${isDark ? 'bg-violet-900/60' : 'bg-purple-300/60'}`}></div>
            </div>

            {/* Header */}
            <header className={`px-6 py-5 z-20 relative transition-all duration-300 backdrop-blur-xl border-b shadow-sm
                ${isDark ? 'bg-[#1e293b]/70 border-slate-700/60 shadow-black/20' : 'bg-white/80 border-slate-200/80 shadow-slate-200/50'}`}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <img
                                src="/icons/icon48.png"
                                alt="Logo"
                                className="relative w-10 h-10 rounded-xl shadow-md"
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                TISS Guard
                            </h1>
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 border backdrop-blur-sm shadow-sm
                            ${isDark
                                ? 'bg-slate-800/80 border-slate-600 text-amber-400 hover:bg-slate-700 hover:text-amber-300 shadow-black/30'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 shadow-slate-200'}`}
                        title={isDark ? "Modo Claro" : "Modo Escuro"}
                    >
                        {isDark ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                        )}
                    </button>
                </div>

                {/* Tabs */}
                <div className={`flex p-1.5 rounded-xl relative transition-all border
                    ${isDark ? 'bg-[#0f172a] border-slate-700/80' : 'bg-slate-100 border-slate-200/80 shadow-inner'}`}>
                    <div
                        className={`absolute top-1.5 bottom-1.5 rounded-lg transition-all duration-300 ease-out z-0 shadow
                        ${isDark
                                ? 'bg-slate-700 border border-slate-600 shadow-black/40'
                                : 'bg-white border border-slate-200/60 shadow-slate-200'}`}
                        style={{
                            left: activeTab === 'verify' ? '6px' : '50%',
                            width: 'calc(50% - 9px)',
                            transform: activeTab === 'settings' ? 'translateX(3px)' : 'translateX(0)'
                        }}
                    />
                    <button
                        onClick={() => setActiveTab('verify')}
                        className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors duration-200 z-10 relative
                            ${activeTab === 'verify'
                                ? (isDark ? 'text-white' : 'text-blue-700')
                                : (isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                    >
                        Verificar
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors duration-200 z-10 relative
                            ${activeTab === 'settings'
                                ? (isDark ? 'text-white' : 'text-blue-700')
                                : (isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                    >
                        Opções
                    </button>
                </div>
            </header>

            <main className="flex-grow p-6 overflow-y-auto custom-scrollbar relative z-10">
                {activeTab === 'verify' && (
                    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div
                            className="relative group cursor-pointer"
                            onMouseEnter={() => setIsHoveringFile(true)}
                            onMouseLeave={() => setIsHoveringFile(false)}
                        >
                            <input
                                type="file"
                                accept=".xml"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                            />

                            {/* Hover Border Highlight */}
                            <div className={`absolute -inset-[1px] bg-blue-500/30 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-300`}></div>

                            <div className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300
                                ${isHoveringFile
                                    ? (isDark ? 'border-transparent bg-[#1e293b] scale-[1.01] shadow-2xl' : 'border-transparent bg-white scale-[1.01] shadow-xl')
                                    : (isDark ? 'border-slate-700/60 bg-[#1e293b]/50 hover:bg-[#1e293b]' : 'border-slate-300/80 bg-white/60 hover:bg-white shadow-sm')}
                                `}>
                                <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 text-3xl transition-transform duration-300
                                    ${isDark
                                        ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white border border-slate-600 shadow-black/40'
                                        : 'bg-gradient-to-br from-blue-50 to-white text-blue-600 border border-blue-100 shadow-blue-100'}`}>
                                    📂
                                </div>
                                <h3 className={`font-bold text-lg mb-1 transition-colors ${isHoveringFile ? 'text-blue-600' : (isDark ? 'text-slate-200' : 'text-slate-700')}`}>
                                    Arraste seu XML
                                </h3>
                                <p className={`text-xs font-medium tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    ou clique para selecionar
                                </p>
                            </div>
                        </div>

                        {result && (
                            <div className={`mt-6 rounded-2xl p-0.5 relative animate-in zoom-in-95 duration-500 shadow-xl
                                ${result.isValid
                                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/20'
                                    : 'bg-gradient-to-br from-red-400 to-rose-500 shadow-red-500/20'
                                }`}>
                                <div className={`rounded-[14px] p-5 h-full backdrop-blur-3xl
                                    ${isDark ? 'bg-[#0f172a]' : 'bg-white'}`}>

                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg shrink-0
                                            ${result.isValid
                                                ? (isDark ? 'bg-emerald-500/10 text-emerald-400 shadow-emerald-900/20' : 'bg-emerald-50 text-emerald-600 shadow-emerald-100')
                                                : (isDark ? 'bg-red-500/10 text-red-400 shadow-red-900/20' : 'bg-red-50 text-red-600 shadow-red-100')
                                            }`}>
                                            {result.isValid ? "✓" : "!"}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-lg leading-tight mb-0.5 ${result.isValid
                                                ? (isDark ? 'text-emerald-400' : 'text-slate-800')
                                                : (isDark ? 'text-red-400' : 'text-slate-800')
                                                }`}>
                                                {result.message}
                                            </h3>
                                            {result.isValid && <p className={`text-xs font-bold uppercase tracking-wider opacity-90 ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>Validado com sucesso</p>}
                                        </div>
                                    </div>

                                    {!result.isValid && (
                                        <div className={`rounded-xl p-0.5 overflow-hidden border
                                            ${isDark ? 'bg-slate-900/50 border-red-900/30' : 'bg-red-50/30 border-red-100'}`}>
                                            <ul className="max-h-[220px] overflow-y-auto custom-scrollbar p-3 space-y-2.5">
                                                {result.errors.map((error, index) => (
                                                    <li key={index} className="flex gap-3 text-sm items-start group">
                                                        <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] mt-0.5 tracking-wider border shrink-0
                                                            ${isDark ? 'bg-red-950/40 text-red-400 border-red-900/40' : 'bg-white text-red-600 border-red-100 shadow-sm'}`}>
                                                            {error.code}
                                                        </span>
                                                        <span className={`leading-snug font-medium text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                            {error.message}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                        <h2 className={`text-[10px] font-extrabold uppercase tracking-[0.2em] pl-1 mb-2 opacity-70 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Regras de Validação</h2>

                        {[
                            { key: 'checkFutureDates', label: 'Datas Futuras', desc: 'Bloquear procedimentos com data maior que hoje' },
                            { key: 'checkNegativeValues', label: 'Valores Negativos', desc: 'Alertar se houver valores totais abaixo de zero' }
                        ].map((item) => (
                            <div key={item.key} className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] shadow-sm
                                ${isDark
                                    ? 'bg-[#1e293b]/60 border-slate-700/60 hover:bg-[#1e293b] hover:border-slate-600 hover:shadow-black/20'
                                    : 'bg-white border-slate-200/80 hover:border-blue-200 hover:shadow-md'
                                }`}>
                                <div className="pr-4">
                                    <span className={`font-bold block text-sm mb-0.5 ${isDark ? 'text-slate-200 group-hover:text-white' : 'text-slate-800 group-hover:text-blue-900'}`}>{item.label}</span>
                                    <span className={`text-[11px] leading-relaxed block font-medium ${isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-600'}`}>{item.desc}</span>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings[item.key as keyof AppSettings] as boolean}
                                        onChange={() => handleSettingChange(item.key as keyof AppSettings)}
                                    />
                                    <div className={`w-11 h-6 rounded-full peer transition-all duration-300 border
                                        ${isDark
                                            ? 'bg-slate-800 border-slate-600 peer-focus:ring-2 peer-focus:ring-indigo-500/40 peer-checked:bg-indigo-600 peer-checked:border-indigo-500'
                                            : 'bg-slate-200 border-slate-300 peer-focus:ring-2 peer-focus:ring-blue-400/30 peer-checked:bg-blue-600 peer-checked:border-blue-500'}`}></div>
                                    <div className="absolute top-1 left-1 bg-white rounded-full h-4 w-4 transition-all duration-300 peer-checked:translate-x-full shadow-sm"></div>
                                </label>
                            </div>
                        ))}

                        <div className={`mt-4  text-center opacity-60`}>
                            <p className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                Versão 1.0.0
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* Privacy Assurance Footer */}
            <div className={`text-[10px] font-medium text-center py-3 border-t backdrop-blur-xl z-20 relative
                ${isDark ? 'border-slate-800/80 text-slate-500 bg-[#0B1121]/80' : 'border-slate-200/80 text-slate-400 bg-white/80'}`}>
                <p className="flex items-center justify-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-emerald-500' : 'bg-emerald-500'}`}></span>
                    Processamento Local • Seguro
                </p>
            </div>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>,
);

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { validateTiss, ValidationResult } from '../services/XmlValidatorService';
import { StorageService, AppSettings, DEFAULT_SETTINGS } from '../services/StorageService';
import './index.css';

const Popup = () => {
    const [activeTab, setActiveTab] = useState<'verify' | 'settings' | 'upgrade'>('verify');
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [licenseKey, setLicenseKey] = useState('');
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

        const can = await StorageService.canValidate();
        if (!can) {
            setActiveTab('upgrade');
            return;
        }

        const text = await file.text();
        const validation = validateTiss(text, settings);
        setResult(validation);

        await StorageService.incrementUsage();
        loadSettings();
    };

    const handleActivateLicense = async () => {
        if (licenseKey.trim().startsWith('TISS-PRO-') && licenseKey.trim().length > 10) {
            const success = await StorageService.setPremiumStatus('PRO_USER_2025');
            if (success) {
                alert('Licença Ativada! Obrigado.');
                loadSettings();
                setActiveTab('verify');
            }
        } else {
            alert('Erro (v2): Assinatura Digital Inválida. Verifique se a extensão foi recarregada.');
        }
    };

    const usagePercent = settings.isPremium ? 100 : (settings.usage.count / 3) * 100;
    const isDark = settings.theme === 'dark';

    return (
        <div className={`w-[400px] h-[600px] flex flex-col font-sans transition-colors duration-300 ${isDark ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f8fafc] text-slate-800'}`}>
            {/* Header */}
            <header className={`border-b px-6 py-5 shadow-sm z-20 relative transition-all duration-300 ${isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                        <img
                            src="/icons/icon48.png"
                            alt="Logo"
                            className="w-9 h-9 rounded-xl shadow-lg shadow-blue-500/30 transform transition-transform hover:rotate-12"
                        />
                        <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            TISS Guard
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-full transition-all duration-300 active:scale-90 border ${isDark ? 'hover:bg-slate-700 text-amber-400 bg-slate-800 border-slate-700' : 'hover:bg-slate-50 text-slate-600 bg-white border-slate-200 shadow-sm'}`}
                            title={isDark ? "Modo Claro" : "Modo Escuro"}
                        >
                            {isDark ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                            )}
                        </button>
                        <div className={`text-[11px] font-bold px-3 py-1 rounded-full border tracking-wide uppercase shadow-sm ${settings.isPremium
                            ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200'
                            : isDark ? 'bg-slate-800 text-slate-300 border-slate-600' : 'bg-white text-slate-700 border-slate-300'
                            }`}>
                            {settings.isPremium ? 'Pro' : 'Free'}
                        </div>
                    </div>
                </div>

                {/* Usage Bar (Free Only) */}
                {!settings.isPremium && (
                    <div className={`mb-5 p-4 rounded-xl border transition-colors ${isDark ? 'bg-[#0f172a] border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <div className={`flex justify-between text-xs font-semibold mb-2.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            <span>Uso Mensal</span>
                            <span className={settings.usage.count >= 3 ? 'text-red-500 font-bold' : (isDark ? 'text-slate-200' : 'text-slate-800')}>
                                {settings.usage.count}/3
                            </span>
                        </div>
                        <div className={`w-full rounded-full h-2 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                            <div
                                className={`h-full rounded-full transition-all duration-500 ease-out ${settings.usage.count >= 3 ? 'bg-red-500' : 'bg-blue-600'}`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className={`flex p-1.5 rounded-2xl relative transition-colors border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                    <div
                        className={`absolute top-1.5 bottom-1.5 rounded-xl transition-all duration-300 ease-in-out z-0 border
                        ${isDark ? 'bg-slate-800 border-slate-600 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}
                        style={{
                            left: activeTab === 'verify' || activeTab === 'upgrade' ? '6px' : '50%',
                            width: 'calc(50% - 9px)',
                            transform: activeTab === 'settings' ? 'translateX(6px)' : 'translateX(0)'
                        }}
                    />
                    <button
                        onClick={() => setActiveTab('verify')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors duration-200 z-10 relative ${activeTab === 'verify' || activeTab === 'upgrade'
                            ? (isDark ? 'text-white' : 'text-blue-700')
                            : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
                            }`}
                    >
                        Verificar
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors duration-200 z-10 relative ${activeTab === 'settings'
                            ? (isDark ? 'text-white' : 'text-blue-700')
                            : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
                            }`}
                    >
                        Opções
                    </button>
                </div>
            </header>

            <main className="flex-grow p-6 overflow-y-auto custom-scrollbar relative">
                {activeTab === 'verify' && (
                    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {!settings.isPremium && settings.usage.count >= 3 ? (
                            <div className="flex flex-col items-center justify-center flex-grow text-center">
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-pulse ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                                    <span className="text-5xl">🔒</span>
                                </div>
                                <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Limite Atingido</h2>
                                <p className={`mb-10 max-w-[280px] leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    Você atingiu o limite mensal gratuito. Desbloqueie validações ilimitadas agora.
                                </p>
                                <button
                                    onClick={() => setActiveTab('upgrade')}
                                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Desbloquear Tudo
                                </button>
                            </div>
                        ) : (
                            <>
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
                                    <div className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300
                                        ${isHoveringFile
                                            ? (isDark ? 'border-blue-500 bg-slate-800/80 scale-[1.01]' : 'border-blue-500 bg-blue-50/80 scale-[1.01]')
                                            : (isDark ? 'border-slate-600 bg-[#1e293b]' : 'border-slate-300 bg-white')}
                                        `}>
                                        <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-5 text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6
                                            ${isDark ? 'bg-slate-700 text-white border border-slate-600' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                            📂
                                        </div>
                                        <p className={`font-bold text-lg mb-1 transition-colors ${isHoveringFile ? 'text-blue-500' : (isDark ? 'text-slate-200' : 'text-slate-700')}`}>
                                            Solte seu XML aqui
                                        </p>
                                        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ou clique para buscar</p>
                                    </div>
                                </div>

                                {result && (
                                    <div className={`mt-8 rounded-2xl p-6 border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 
                                        ${result.isValid
                                            ? (isDark ? 'bg-green-950/30 border-green-800' : 'bg-white border-green-200 shadow-green-100')
                                            : (isDark ? 'bg-red-950/30 border-red-800' : 'bg-white border-red-200 shadow-red-100')
                                        }`}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border ${result.isValid
                                                ? (isDark ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-100 text-green-700 border-green-200')
                                                : (isDark ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-red-100 text-red-700 border-red-200')
                                                }`}>
                                                {result.isValid ? "✓" : "!"}
                                            </div>
                                            <div>
                                                <h3 className={`font-bold text-lg leading-tight ${result.isValid
                                                    ? (isDark ? 'text-green-400' : 'text-green-700')
                                                    : (isDark ? 'text-red-400' : 'text-red-700')
                                                    }`}>
                                                    {result.message}
                                                </h3>
                                                {result.isValid && <p className={`text-sm mt-0.5 font-medium ${isDark ? 'text-green-500/80' : 'text-green-600/80'}`}>Estrutura verificada com sucesso</p>}
                                            </div>
                                        </div>

                                        {!result.isValid && (
                                            <div className={`rounded-xl p-4 mt-2 max-h-[220px] overflow-y-auto custom-scrollbar border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                                <ul className="space-y-3">
                                                    {result.errors.map((error, index) => (
                                                        <li key={index} className="flex gap-3 text-sm items-start">
                                                            <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] mt-0.5 tracking-wider border ${isDark ? 'bg-red-900/30 text-red-300 border-red-800' : 'bg-white text-red-700 border-red-200 shadow-sm'}`}>
                                                                {error.code}
                                                            </span>
                                                            <span className={`leading-snug font-medium ${isDark ? 'text-red-200' : 'text-slate-700'}`}>{error.message}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className={`text-xs font-bold uppercase tracking-widest pl-1 mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Opções de Validação</h2>

                        {[
                            { key: 'checkFutureDates', label: 'Datas Futuras', desc: 'Bloquear procedimentos com data futura' },
                            { key: 'checkNegativeValues', label: 'Valores Negativos', desc: 'Alertar valores totais menores que zero' }
                        ].map((item) => (
                            <div key={item.key} className={`flex items-center justify-between p-5 rounded-2xl border transition-all hover:scale-[1.01] shadow-sm
                                ${isDark
                                    ? 'bg-[#1e293b] border-slate-700 hover:border-slate-600'
                                    : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-md'
                                }`}>
                                <div className="pr-4">
                                    <span className={`font-bold block text-sm mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.label}</span>
                                    <span className={`text-xs leading-relaxed block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</span>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings[item.key as keyof AppSettings] as boolean}
                                        onChange={() => handleSettingChange(item.key as keyof AppSettings)}
                                    />
                                    <div className={`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 transition-colors border
                                        ${isDark ? 'bg-slate-700 border-slate-600 peer-checked:bg-blue-600 peer-checked:border-blue-600' : 'bg-slate-200 border-slate-300 peer-checked:bg-blue-600 peer-checked:border-blue-600'}`}></div>
                                    <div className="absolute top-0.5 left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-all peer-checked:translate-x-full peer-checked:border-white shadow-sm"></div>
                                </label>
                            </div>
                        ))}

                        {!settings.isPremium ? (
                            <div className={`mt-8 p-8 rounded-3xl border text-center relative overflow-hidden group shadow-lg
                                ${isDark
                                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
                                    : 'bg-white border-slate-100'
                                }`}>
                                <div className={`absolute inset-0 opacity-10 ${isDark ? 'bg-blue-900' : 'bg-blue-50'}`}></div>
                                <div className="absolute top-0 right-0 p-3 opacity-10 transform translate-x-3 -translate-y-3 group-hover:scale-110 transition-transform">
                                    <span className="text-8xl">🚀</span>
                                </div>
                                <h3 className={`font-bold text-lg mb-2 relative ${isDark ? 'text-white' : 'text-blue-900'}`}>Upgrade para Pro</h3>
                                <p className={`text-sm mb-6 max-w-[200px] mx-auto relative font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Remova limites e tenha prioridade no suporte.</p>
                                <button
                                    onClick={() => setActiveTab('upgrade')}
                                    className="w-full relative py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Ver Planos
                                </button>
                            </div>
                        ) : (
                            <div className={`mt-6 p-6 rounded-2xl border text-center shadow-md
                                ${isDark
                                    ? 'bg-[#1e293b] border-green-900/50'
                                    : 'bg-white border-green-100'
                                }`}>
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-green-500/40 shadow-lg">
                                    🌟
                                </div>
                                <p className={`text-base font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>Membro Premium</p>
                                <p className={`text-xs mt-1 font-medium ${isDark ? 'text-green-500/80' : 'text-green-600/80'}`}>Sua conta está ativa e sem limites.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'upgrade' && (
                    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6 pt-2">
                        <button
                            onClick={() => setActiveTab('verify')}
                            className={`absolute top-6 left-0 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                            title="Voltar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>

                        <span className="text-xs font-bold tracking-wider text-blue-500 uppercase mb-2 block">Premium</span>
                        <h2 className={`text-3xl font-extrabold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Sem Limites.
                        </h2>
                        <p className={`text-sm mb-8 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Desbloqueie todo o potencial do TISS Guard.</p>

                        <div className={`rounded-3xl shadow-2xl border overflow-hidden mb-8 relative transform hover:scale-[1.01] transition-transform duration-500
                            ${isDark ? 'bg-[#1e293b] border-slate-700 shadow-black/40' : 'bg-white border-slate-200 shadow-blue-100'}`}>
                            <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                            <div className="p-8">
                                <div className="text-center mb-6">
                                    <p className={`text-sm font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Plano Mensal</p>
                                    <div className="flex justify-center items-baseline gap-1">
                                        <span className={`text-xl font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>R$</span>
                                        <span className={`text-6xl font-extrabold tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>89</span>
                                        <div className="text-left flex flex-col justify-end">
                                            <span className={`text-2xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>,90</span>
                                        </div>
                                    </div>
                                    <p className={`text-xs font-medium uppercase tracking-wide mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Cobrado mensalmente</p>
                                </div>

                                <ul className="text-left space-y-4 mb-8 pl-4 border-t border-b py-6 border-dashed border-slate-200 dark:border-slate-700">
                                    {['Validações Ilimitadas', 'Todas as Regras de TISS', 'Acesso Prioritário', 'Atualizações Inclusas'].map((feat, i) => (
                                        <li key={i} className={`flex items-center gap-3 text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                            <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                                <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <a
                                    href="https://www.asaas.com/c/kohhqsb099d2bg2e"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase tracking-wide"
                                >
                                    Assinar Mensalmente
                                </a>
                                <p className={`text-[10px] uppercase tracking-wide mt-4 font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Processamento seguro via Asaas</p>
                            </div>
                        </div>
                        <div className={`border-t pt-8 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-4 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Possui um código?</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={licenseKey}
                                    onChange={(e) => setLicenseKey(e.target.value)}
                                    placeholder="Cole sua chave de licença aqui..."
                                    className={`flex-1 px-4 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition font-medium
                                        ${isDark ? 'bg-[#0f172a] border-slate-700 text-white placeholder-slate-600' : 'bg-white border-slate-300 placeholder-slate-400 text-slate-900'}`}
                                />
                                <button
                                    onClick={handleActivateLicense}
                                    className={`px-6 py-2 text-white rounded-xl font-bold text-sm shadow hover:shadow-lg active:scale-95 transition-all 
                                        ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-800 hover:bg-slate-900'}`}
                                >
                                    Ativar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>,
);

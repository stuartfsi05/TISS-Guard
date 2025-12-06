import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { validateTiss, ValidationResult } from '../services/XmlValidatorService';
import { StorageService, AppSettings, DEFAULT_SETTINGS } from '../services/StorageService';
import './index.css';

const Popup = () => {
    const [activeTab, setActiveTab] = useState<'verify' | 'settings' | 'upgrade'>('verify');
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = () => {
        StorageService.getSettings().then((s) => {
            setSettings(s);
            // Auto redirect if free limit reached
            if (!s.isPremium && s.usage.count >= 3) {
                // Don't force redirect immediately on load, but UI will show lock
            }
        });
    };

    const handleSettingChange = (key: keyof AppSettings) => {
        // Prevent changing bools if wrong key, but here we only have bools at top level
        // Actually we need to be careful not to overwrite usage object
        const newSettings = { ...settings, [key]: !settings[key as keyof AppSettings] };
        // We might need a better way to Partial update, but simply copying full object works
        setSettings(newSettings);
        StorageService.saveSettings(newSettings);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // The Gate
        const can = await StorageService.canValidate();
        if (!can) {
            setActiveTab('upgrade'); // Redirect to upgrade
            return;
        }

        const text = await file.text();
        const validation = validateTiss(text, settings);
        setResult(validation);

        // Count usage
        await StorageService.incrementUsage();
        loadSettings(); // Refresh UI count
    };

    const handleUpgradeParams = async () => {
        const success = await StorageService.setPremiumStatus('PRO_USER_2025');
        if (success) {
            alert('Conta Premium Ativada! Obrigado.');
            loadSettings();
            setActiveTab('verify');
        }
    };

    const usagePercent = settings.isPremium ? 100 : (settings.usage.count / 3) * 100;

    return (
        <div className="w-[400px] min-h-[550px] bg-slate-50 flex flex-col font-sans">
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold text-blue-600">TISS Guard</h1>
                    <div className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-500">
                        {settings.isPremium ? '💎 PRO' : '🆓 FREE'}
                    </div>
                </div>

                {/* Usage Bar (Only for Free) */}
                {!settings.isPremium && (
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Usos este mês:</span>
                            <span className={settings.usage.count >= 3 ? 'text-red-600 font-bold' : ''}>
                                {settings.usage.count} / 3
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all ${settings.usage.count >= 3 ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 mt-4 text-sm font-medium text-slate-500">
                    <button
                        onClick={() => setActiveTab('verify')}
                        className={`pb-1 border-b-2 ${activeTab === 'verify' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-slate-700'}`}
                    >
                        Verificar
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-1 border-b-2 ${activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-slate-700'}`}
                    >
                        Configurações
                    </button>
                </div>
            </header>

            <main className="flex-grow p-6 flex flex-col gap-4">

                {activeTab === 'verify' && (
                    <>
                        {!settings.isPremium && settings.usage.count >= 3 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-8">
                                <div className="text-4xl">🔒</div>
                                <h2 className="text-lg font-bold text-slate-800">Limite Gratuito Atingido</h2>
                                <p className="text-sm text-slate-600">
                                    Você utilizou suas 3 validações gratuitas este mês.
                                    Faça o upgrade para continuar protegendo suas guias.
                                </p>
                                <button
                                    onClick={() => setActiveTab('upgrade')}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-blue-700 transition"
                                >
                                    Quero ser PRO
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Selecione o arquivo XML
                                    </label>
                                    <input
                                        type="file"
                                        accept=".xml"
                                        onChange={handleFileUpload}
                                        className="block w-full text-sm text-slate-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100
                                        cursor-pointer"
                                    />
                                </div>

                                {result && (
                                    <div className={`rounded-md p-4 border ${result.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-3 h-3 rounded-full ${result.isValid ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <h3 className={`font-bold ${result.isValid ? 'text-green-800' : 'text-red-800'}`}>
                                                {result.message}
                                            </h3>
                                        </div>

                                        {!result.isValid && (
                                            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                                {result.errors.map((error, index) => (
                                                    <li key={index}>
                                                        <span className="font-semibold">[{error.code}]</span> {error.message}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {result.isValid && (
                                            <p className="text-sm text-green-700">O arquivo possui a estrutura básica correta.</p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {activeTab === 'settings' && (
                    <div className="flex flex-col gap-3">
                        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Regras Ativas</h2>

                        <label className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
                            <input
                                type="checkbox"
                                checked={settings.checkFutureDates}
                                onChange={() => handleSettingChange('checkFutureDates')}
                                className="w-5 h-5 text-blue-600 rounded"
                            />
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-800">Verificar Datas Futuras</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
                            <input
                                type="checkbox"
                                checked={settings.checkNegativeValues}
                                onChange={() => handleSettingChange('checkNegativeValues')}
                                className="w-5 h-5 text-blue-600 rounded"
                            />
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-800">Verificar Valores Negativos</span>
                            </div>
                        </label>

                        {!settings.isPremium && (
                            <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-100 text-center">
                                <p className="text-sm text-blue-800 mb-2">Você está no plano Gratuito.</p>
                                <button
                                    onClick={() => setActiveTab('upgrade')}
                                    className="text-xs font-bold text-blue-600 hover:underline"
                                >
                                    Fazer Upgrade
                                </button>
                            </div>
                        )}
                        {settings.isPremium && (
                            <div className="mt-4 p-4 bg-green-50 rounded border border-green-100 text-center">
                                <p className="text-sm text-green-800 font-bold">Você é Premium! 🌟</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'upgrade' && (
                    <div className="text-center space-y-4">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold mb-2">TISS Guard PRO</h2>
                            <p className="text-blue-100 mb-4">Validações ilimitadas e suporte prioritário.</p>
                            <div className="text-3xl font-bold mb-2">R$ 29,90 <span className="text-sm font-normal">/mês</span></div>
                        </div>

                        <p className="text-sm text-slate-600">
                            Para fins de teste, clique abaixo para simular o pagamento aprovado.
                        </p>

                        <button
                            onClick={handleUpgradeParams}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold shadow hover:bg-green-700 transition"
                        >
                            Simular Pagamento (Stripe Bypass)
                        </button>

                        <button
                            onClick={() => setActiveTab('verify')}
                            className="text-sm text-slate-500 hover:underline"
                        >
                            Voltar
                        </button>
                    </div>
                )}

            </main>

            <footer className="mt-auto py-4 text-center text-xs text-slate-400 border-t border-slate-100">
                TISS Guard v1.3.0 (Freemium)
            </footer>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>,
);

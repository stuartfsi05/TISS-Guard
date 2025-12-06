import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { validateTiss, ValidationResult } from '../services/XmlValidatorService';
import { StorageService, AppSettings, DEFAULT_SETTINGS } from '../services/StorageService';
import './index.css';

const Popup = () => {
    const [activeTab, setActiveTab] = useState<'verify' | 'settings'>('verify');
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        StorageService.getSettings().then(setSettings);
    }, []);

    const handleSettingChange = (key: keyof AppSettings) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        StorageService.saveSettings(newSettings);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        const validation = validateTiss(text, settings);
        setResult(validation);
    };

    return (
        <div className="w-[400px] min-h-[500px] bg-slate-50 flex flex-col font-sans">
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <h1 className="text-xl font-bold text-blue-600">TISS Guard</h1>
                <div className="flex gap-4 mt-2 text-sm font-medium text-slate-500">
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
                                <span className="text-xs text-slate-500">Alerta se a data de atendimento for maior que hoje</span>
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
                                <span className="text-xs text-slate-500">Alerta se houver valores monetários menores que zero</span>
                            </div>
                        </label>
                    </div>
                )}

            </main>

            <footer className="mt-auto py-4 text-center text-xs text-slate-400 border-t border-slate-100">
                TISS Guard v1.2.0
            </footer>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>,
);

import { TussFormatRule, MissingGuiaRule, FutureDateRule, NegativeValueRule } from './RulesEngine';

export const runSelfTest = () => {
    console.group('🛡️ TISS Guard Self-Diagnostic');
    let passed = 0;
    let failed = 0;

    const assert = (ruleName: string, description: string, isValid: boolean) => {
        if (isValid) {
            console.log(`✅ [${ruleName}] ${description}`);
            passed++;
        } else {
            console.error(`❌ [${ruleName}] ${description}`);
            failed++;
        }
    };

    // 1. Test TUSS Format Rule
    // Mocking finding values approach for simplicity as findValue is internal or we just pass the structure knowing how the rule works
    // Actually, the rule uses findAllValues which traverse the object.

    // TUSS - Should Fail
    const tussFailResult = TussFormatRule.validate({ guia: { dados: { procedimento: { codigoProcedimento: '123' } } } });
    assert('TUSS', 'Should detect invalid 3-digit code', tussFailResult.length > 0);

    // TUSS - Should Pass
    const tussPassResult = TussFormatRule.validate({ guia: { dados: { procedimento: { codigoProcedimento: '10101012' } } } });
    assert('TUSS', 'Should accept valid 8-digit code', tussPassResult.length === 0);

    // 2. Test Missing Guia Rule
    const missingGuiaResult = MissingGuiaRule.validate({ guia: {} });
    assert('Guia', 'Should detect missing guia number', missingGuiaResult.length > 0);

    const presentGuiaResult = MissingGuiaRule.validate({ numeroGuiaPrestador: '123456' });
    assert('Guia', 'Should accept present guia number', presentGuiaResult.length === 0);

    // 3. Test Negative Values
    const negativeResult = NegativeValueRule.validate({ valorTotal: '-50.00' });
    assert('Finance', 'Should block negative values', negativeResult.length > 0);

    // 4. Test Future Date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateStr = futureDate.toISOString().split('T')[0];
    const futureResult = FutureDateRule.validate({ dataAtendimento: dateStr });
    assert('Date', 'Should block future dates', futureResult.length > 0);

    console.log(`\nDiagnostic Complete. Passed: ${passed} | Failed: ${failed}`);
    console.groupEnd();
    return failed === 0;
};

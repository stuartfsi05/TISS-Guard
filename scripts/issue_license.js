import * as jose from 'jose';
import fs from 'fs';

async function issueLicense() {
    const args = process.argv.slice(2);
    const clientName = args[0] || 'Cliente Teste';

    console.log(`🎫 Emitindo licença para: ${clientName}`);

    try {
        if (!fs.existsSync('private.key')) {
            throw new Error("Arquivo 'private.key' não encontrado! Rode 'node scripts/generate_keys.js' primeiro.");
        }

        const privateKeyPEM = fs.readFileSync('private.key', 'utf8');
        const privateKey = await jose.importPKCS8(privateKeyPEM, 'ES256');

        const jwt = await new jose.SignJWT({ 'type': 'pro', 'name': clientName })
            .setProtectedHeader({ alg: 'ES256' })
            .setIssuedAt()
            .setSubject(clientName)
            .setExpirationTime('10y')
            .sign(privateKey);

        console.log("\n✅ Licença Gerada com Sucesso:");
        console.log("---------------------------------------------------------------");
        console.log(jwt);
        console.log("---------------------------------------------------------------");
        console.log("Copie o token acima e envie para o cliente ativar.");

    } catch (e) {
        console.error("❌ Erro ao emitir licença:", e.message);
    }
}

issueLicense().catch(console.error);

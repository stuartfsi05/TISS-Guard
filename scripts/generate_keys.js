import * as jose from 'jose';
import fs from 'fs';

async function generateKeys() {
    console.log("🔐 Gerando par de chaves ECDSA P-256 (ES256)...");

    const { publicKey, privateKey } = await jose.generateKeyPair('ES256', {
        extractable: true
    });

    // Private Key (PKCS8) -> Salvar em arquivo seguro
    const privateKeyPKCS8 = await jose.exportPKCS8(privateKey);
    fs.writeFileSync('private.key', privateKeyPKCS8);
    console.log("\n✅ Private Key salva em 'private.key' (NÃO COMITE ESTE ARQUIVO!)");

    // Public Key (SPKI) -> Imprimir para copiar para o código
    const publicKeySPKI = await jose.exportSPKI(publicKey);
    console.log("\n📢 Public Key (Copie o conteúdo abaixo para src/constants/LicenseKey.ts):");
    console.log("---------------------------------------------------------------");
    console.log(publicKeySPKI);
    console.log("---------------------------------------------------------------");

    // Adicionar ao .gitignore se ainda não estiver
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (!gitignore.includes('private.key')) {
        fs.appendFileSync('.gitignore', '\nprivate.key\n');
        console.log("✅ 'private.key' adicionado ao .gitignore");
    }
}

generateKeys().catch(console.error);

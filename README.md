# 🛡️ TISS Guard - O Escudo do Faturamento Médico

> **"Elimine as glosas antes que elas aconteçam."**

O **TISS Guard** é uma ferramenta de inteligência artificial que blinda clínicas e hospitais contra perdas financeiras. Ele atua como um "auditor digital" que vive dentro do seu navegador, validando arquivos e preenchendo formulários automaticamente nos portais das operadoras (Unimed, Bradesco, Amil, etc.).

---

## 🌟 Por que usar o TISS Guard?

### 1. 🔍 Auditoria em Tempo Real
Ao tentar enviar um arquivo XML no site da operadora, o TISS Guard intercepta o arquivo **antes do upload ser concluído**. Ele verifica mais de 50 regras de negócio (datas futuras, códigos errados, valores negativos) e bloqueia o envio se houver erros, impedindo que você seja glosado semanas depois.

### 2. 🤖 Robô Preenchedor (RPA)
Cansado de digitar guias manualmente?
*   Clique no botão flutuante **"🤖 Preencher TISS"**.
*   Selecione o arquivo XML gerado pelo seu sistema.
*   **Mágica:** O robô identifica os campos na tela da operadora e preenche tudo automaticamente em segundos.

### 3. 🔒 Segurança Militar (Processamento Local)
Diferente de sistemas em nuvem, o TISS Guard opera **100% no seu computador**.
*   Os dados dos pacientes **NUNCA** saem da sua máquina.
*   Conformidade total com a **LGPD** e normas da ANS.
*   Validação TUSS rigorosa (8 dígitos) para garantir conformidade.

---

## 🚀 Como Instalar (Passo a Passo)

Como esta é uma ferramenta exclusiva corporativa, a instalação é manual e simples:

1.  **Baixe o Projeto:** Faça o download do arquivo ZIP e extraia em uma pasta (ex: `Área de Trabalho/TISS Guard`).
2.  **Abra o Chrome:** Digite `chrome://extensions` na barra de endereços.
3.  **Modo Desenvolvedor:** Ative a chavinha "Modo do desenvolvedor" no canto superior direito.
4.  **Carregar:** Clique no botão **"Carregar sem compactação"** (Load Unpacked).
5.  **Selecione:** Escolha a pasta `dist` que está dentro da pasta que você baixou.

🎉 **Pronto!** O ícone de escudo azul aparecerá no seu navegador.

---

## 📖 Guia de Uso

### 1. Ativando sua Licença
Ao abrir a extensão pela primeira vez, você verá o painel de bloqueio.
1.  Insira sua **Chave de Licença** (fornecida pelo administrador).
2.  Clique em **"Ativar"**.
3.  O sistema validará a assinatura digitalmente (funciona até sem internet!).

### 2. Validando Arquivos (O Escudo)
Basta navegar até o portal da operadora (ex: site da Unimed) e tentar anexar um arquivo XML.
*   ✅ **Se o arquivo estiver correto:** O upload segue normalmente.
*   ⛔ **Se houver erros:** Um alerta vermelho aparecerá na tela listando o que precisa ser corrigido.

### 3. Usando o Robô (RPA)
Em páginas de formulário (digitação de guia):
1.  Procure o botão azul **"🤖 Preencher TISS"** no canto inferior direito.
2.  Clique e escolha o XML da guia.
3.  Veja os campos serem preenchidos magicamente (eles ficarão verdes ✅).

---

## ❓ Perguntas Frequentes (FAQ)

**P: Meus dados são enviados para algum servidor?**
**R:** Não. O TISS Guard processa tudo localmente na memória do seu navegador. Veja o selo "Processamento 100% Local" no rodapé da extensão.

**P: O que acontece se eu tentar enviar um arquivo gigante?**
**R:** O sistema possui um "Circuit Breaker" de segurança. Se o arquivo for maior que 50MB, o processamento é interrompido para não travar seu computador.

**P: A validação TUSS é atualizada?**
**R:** Sim. O TISS Guard verifica se os códigos de procedimentos possuem estritamente 8 dígitos numéricos, conforme padrão TUSS/ANS vigente.

---

## 📞 Suporte

Precisa de ajuda ou quer relatar um bug?
Entre em contato com a equipe de engenharia do **Projeto Antigravity**.

---
*Versão 1.0.0 (Dezembro/2025)*
*Build: Stable | Engine: v2.0*

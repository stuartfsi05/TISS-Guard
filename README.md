# TISS Guard - Sistema de Auditoria e Automação Médica

**Versão da Documentação:** 1.0.2 (Atualizada em Dezembro/2025)

O **TISS Guard** é a ferramenta oficial para garantir a qualidade do faturamento médico. Este manual técnico e operacional guia você passo a passo na instalação, uso e manutenção do sistema.

---

## 🎯 O que o sistema faz?

O sistema atua como uma camada de inteligência sobre o navegador Google Chrome, oferecendo duas funcionalidades automáticas:

### 1. 🛡️ O Auditor (Validação XML em Tempo Real)
*   **O Problema:** Guias enviadas com erros (datas futuras, códigos inexistentes) geram glosas e atrasam o pagamento em meses.
*   **A Solução:** O TISS Guard intercepta silenciosamente o arquivo XML no momento em que você o anexa no portal da operadora (upload). Ele "lê" o arquivo em milissegundos antes que ele chegue ao servidor do convênio.
*   **O Resultado:** Se houver erros, o envio é **bloqueado**. Uma janela de alerta vermelha aparece sobre a tela listando exatamente qual linha do arquivo está errada (ex: *"Linha 45: Código TUSS deve ter 8 dígitos"*).

### 2. 🤖 O Autômato (RPA / Preenchimento de Guias)
*   **O Problema:** Digitar guias manualmente em portais é repetitivo, lento e propenso a erros de digitação.
*   **A Solução:** O sistema injeta um botão flutuante **"🤖 Preencher TISS"** diretamente na página do formulário da operadora.
*   **O Resultado:** Ao clicar neste botão e selecionar o arquivo XML do seu computador, o "robô" assume o controle do mouse e teclado, digitando todos os dados (Carteirinha, Nome, Procedimentos, Valores) nos campos corretos do site em questão de segundos.

---

## ⚙️ Guia de Instalação (Usuário Final)

*Tempo estimado: 2 minutos.*

> **Nota:** Se você recebeu apenas o código-fonte, veja a seção "Para Desenvolvedores" no final deste documento primeiro.

1.  **Obter o arquivo:** Localize a pasta `dist` (distribuição) fornecida pela equipe de TI. Salve-a em um local seguro (ex: `C:\Sistemas\TissGuard`).
2.  **Acessar Extensões:** No Chrome, digite `chrome://extensions` na barra de endereço.
3.  **Modo Desenvolvedor:** Ative a chave **"Modo do desenvolvedor"** no canto superior direito.
4.  **Instalar:** Clique no botão **"Carregar sem compactação"** (Load Unpacked).
5.  **Selecionar:** Na janela que abrir, selecione a pasta `dist` que você salvou.

✅ **Sucesso:** O ícone de um escudo azul aparecerá na barra de ferramentas do navegador.

---

## 📖 Manual de Operação

### 1️⃣ Ativação Inicial
Ao clicar no ícone do escudo pela primeira vez, uma tela de segurança pedirá sua **Chave de Licença**. Insira o código alfanumérico fornecido. O sistema validará a assinatura digitalmente e liberará o uso.

### 2️⃣ Procedimento de Validação (Dia a Dia)
Não é necessária nenhuma ação ativa. Trabalhe normalmente.
*   **Cenário A (Arquivo Correto):** Você anexa o XML. O site do convênio carrega a barra de progresso. O envio ocorre. O TISS Guard permanece silente.
*   **Cenário B (Arquivo com Erro):** Você anexa o XML. Imediatamente, uma caixa de diálogo bloqueia a tela. O envio é cancelado. A lista de erros é exibida.
    *   *Ação:* Corrija o arquivo no seu sistema de gestão e tente anexar novamente.

### 3️⃣ Procedimento de Automação
*   Navegue até a tela onde você normalmente digitaria os dados da guia.
*   Procure no canto inferior direito da tela um botão azul flutuante escrito **"Preencher TISS"**.
*   Clique nele. Uma janela de seleção de arquivos do Windows abrirá.
*   Selecione o XML da guia correspondente.
*   **Observe:** Os campos do site começarão a ser preenchidos sozinhos. Os campos preenchidos com sucesso piscarão em verde para confirmação visual.

---

## ❓ Perguntas Frequentes (Troubleshooting)

**"O sistema diz que o XML é inválido, mas o convênio aceitou."**
O TISS Guard é configurado com regras **mais estritas** que alguns convênios para evitar auditorias posteriores.
*   *Exemplo Comum:* Códigos TUSS com pontos (`10.10.10.12`). A norma oficial exige apenas números (`10101012`). O TISS Guard exigirá a correção para garantir conformidade total.

**"O botão de preenchimento sumiu."**
O botão só aparece se o sistema detectar que a página atual é um formulário médico conhecido. Se estiver na página correta, tecle `F5` para recarregar.

---

## 👨‍💻 Para Desenvolvedores (Área Técnica)

Se você baixou este repositório do GitHub e precisa compilar a extensão:

### Stack Tecnológica
*   **Core:** React 18, TypeScript.
*   **Build:** Vite 5 (CRXJS Plugin).
*   **Crypto:** Biblioteca `jose` (ECDSA P-256) para licenciamento.

### Comandos de Instalação
1.  **Instalar Dependências:**
    ```bash
    npm install
    ```
2.  **Rodar Localmente (HMR):**
    ```bash
    npm run dev
    ```
3.  **Compilar para Produção:**
    ```bash
    npm run build
    ```
    *Este comando gerará a pasta `/dist` que deve ser carregada no Chrome.*

### Estrutura do Projeto
*   `src/content`: Scripts injetados nas páginas (RPA, Scraper).
*   `src/popup`: Interface do painel de controle (React).
*   `src/services`: Lógica de negócio (RulesEngine, Validator, Crypto).

---
*© 2025 TISS Guard - Engenharia de Dados em Saúde.*

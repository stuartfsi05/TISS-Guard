# 🛡️ TISS Guard - Validador Inteligente de Guias Médicas

**Elimine glosas e erros de faturamento antes do envio.**

O **TISS Guard** é uma extensão para Google Chrome que blinda seu processo de faturamento. Ele age como um auditor em tempo real para arquivos XML TISS, analisando erros de estrutura, datas e valores no exato momento em que você anexa o arquivo no portal da operadora ou via análise manual.

---

## ✨ Funcionalidades Principais

*   **🔍 Validação Automática (Gatekeeper):** Ao fazer upload de um XML em qualquer site, o TISS Guard intercepta e valida o arquivo instantaneamente.
*   **🚫 Bloqueio de Guias Inválidas:** Impede o envio de arquivos com erros críticos, evitando retrabalho e glosas futuras.
*   **🌓 Modo Escuro e Alto Contraste:** Interface moderna que se adapta à sua preferência e oferece máxima legibilidade em qualquer ambiente.
*   **💰 Regras de Negócio TISS:**
    *   Verificação de IDs obrigatórios.
    *   Bloqueio de datas de atendimento futuras.
    *   Alerta para valores monetários negativos.

---

## 💎 Planos e Preços

O TISS Guard opera no modelo **Freemium**. Você pode testar e usar com limites ou desbloquear todo o potencial.

### 🆓 Plano Gratuito
*   Ideal para testes e baixo volume.
*   **Limite:** 3 validações completas por mês.
*   Acesso a todas as regras de validação.

### 🏆 Plano PRO
*   **Valor:** R$ 89,90 / mês.
*   **Validações ILIMITADAS.**
*   Acesso prioritário a atualizações de regras TISS.
*   Suporte técnico dedicado.

> **Como assinar?** Quando seu limite expirar, uma tela de bloqueio aparecerá com um link direto para o checkout seguro via Asaas. Após o pagamento, você receberá uma chave de licença (`TISS-PRO-XXXX`) para ativar instantaneamente no painel.

---

## 🚀 Como Instalar

Como esta é uma ferramenta exclusiva/privada, a instalação é feita manualmente no navegador Chrome:

1.  **Baixe o Projeto:** Faça o download do arquivo ZIP deste repositório e extraia em uma pasta conhecida (ex: Área de Trabalho).
2.  **Acesse as Extensões:** Digite `chrome://extensions` na barra de endereços.
3.  **Modo Desenvolvedor:** Ative a chave "Modo do desenvolvedor" no canto superior direito.
4.  **Carregar:** Clique em **"Carregar sem compactação"** (Load Unpacked) e selecione a pasta `dist` dentro do projeto extraído.

**Pronto!** O escudo azul do TISS Guard aparecerá na sua barra de extensões.

---

## 📖 Como Usar

### 1. No Portal da Operadora (Automático)
Basta anexar seu arquivo XML normalmente.
*   **Se válido:** O fluxo segue sem interrupções.
*   **Se inválido:** Uma janela de alerta vermelha aparece detalhando os erros. Você pode "Limpar o Arquivo" para corrigir e tentar novamente.

### 2. Validação Manual (Painel)
Clique no ícone da extensão para abrir o painel de controle de luxo:
*   **Aba Verificar:** Arraste e solte seu XML ou clique para buscar. Veja o relatório na hora.
*   **Aba Opções:** Configure regras específicas (ex: desativar verificação de datas futuras) e gerencie sua assinatura.
*   **Tema:** Clique no ícone de Sol/Lua no topo para alternar entre Modo Claro (Alto Contraste) e Modo Escuro.

---

## 🛠️ Para Desenvolvedores

Stack tecnológica utilizada na construção deste projeto:

*   **Core:** React 18, TypeScript, Vite 5.
*   **Estilização:** Tailwind CSS (com Design System customizado para High Contrast).
*   **Extensão:** Manifest V3, Shadow DOM (para injeção isolada de CSS), Chrome Storage API.
*   **Build System:** CRXJS Vite Plugin.

### Comandos de Build
```bash
# Instalar dependências
npm install

# Rodar em modo de desenvolvimento (com HMR)
npm run dev

# Compilar para produção (gera pasta /dist)
npm run build
```

---
© 2025 TISS Guard. Feito para simplificar a saúde suplementar.

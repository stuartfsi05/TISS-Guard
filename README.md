# TISS Guard - Validador de Arquivos TISS

Uma extensão para Google Chrome simples e poderosa para faturistas médicos. Valida arquivos XML TISS localmente antes do envio, prevenindo glosas por erros de preenchimento.

## Funcionalidades
- ⚡ **Validação Local**: Seus arquivos nunca saem do seu computador.
- 🚫 **Bloqueio de Erros**: Intercepta uploads com falhas.
- ⚙️ **Configurável**: Ative ou desative regras conforme sua necessidade.
- 🛡️ **Seguro**: Execução isolada via Shadow DOM.

## Regras Implementadas
1. **Tag Obrigatória**: `<numeroGuiaPrestador>` não pode estar vazia.
2. **Datas**: Nenhuma data de atendimento pode ser futura.
3. **Valores**: Nenhuma tag monetária (`valorTotal`, etc) pode ser negativa.

## Instalação (Desenvolvimento)
1. Clone este repositório.
2. Instale dependências: `npm install`
3. Gere o build: `npm run build`
4. Carregue a pasta `dist` em `chrome://extensions`.

## Tecnologias
- React + TypeScript
- Vite + CRXJS
- TailwindCSS
- Fast XML Parser

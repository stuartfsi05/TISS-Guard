# 🛡️ TISS Guard - O Guardião das Guias Médicas

**Evite glosas e erros de preenchimento antes mesmo de enviar o arquivo.**

O **TISS Guard** é uma extensão inteligente para Google Chrome que age como um "corretor automático" para arquivos XML TISS. Ele verifica seus arquivos no exato momento em que você tenta fazer o upload no site da operadora, impedindo que guias com erros (como datas futuras ou valores negativos) sejam enviadas.

---

## ✨ O que ele faz por você?

1.  **🔍 Validação Automática**: Ao selecionar um arquivo XML em qualquer site, o TISS Guard o analisa em milissegundos.
2.  **🚫 Bloqueio de Segurança**: Se houver erros, o upload é bloqueado e uma tela vermelha te avisa o que corrigir.
3.  **✅ Validação Manual**: Você também pode clicar no ícone da extensão para validar um arquivo avulso sem estar em um site.
4.  **⚙️ Personalizável**: Você escolhe quais regras quer ativar ou desativar.

---

## 🚀 Como Instalar (Passo a Passo)

Como esta ferramenta é um projeto privado/local, você a instala manualmente no Chrome. É super simples:

1.  **Baixe o Projeto**: Clique no botão verde **Code** acima e depois em **Download ZIP**. Extraia a pasta no seu computador.
    *   *Nota: Se você é desenvolvedor, pode clonar e gerar o build (veja seção técnica abaixo).*
    
2.  **Abra as Extensões do Chrome**:
    *   Digite `chrome://extensions` na barra de endereço do navegador.
    *   Ou clique no ícone de quebra-cabeça 🧩 -> Gerenciar Extensões.

3.  **Ative o Modo Desenvolvedor**:
    *   No canto superior direito da tela de extensões, ligue a chave **"Modo do desenvolvedor"**.

4.  **Carregue o TISS Guard**:
    *   Clique no botão **"Carregar sem compactação"** (Load Unpacked).
    *   Selecione a pasta `dist` que está dentro do projeto que você baixou.
    
**Pronto!** O ícone do TISS Guard aparecerá na sua barra de tarefas. 🎉

---

## 📖 Guia de Uso

### Modo Automático (No seu dia a dia)
1.  Acesse o site da operadora ou portal onde você envia as guias.
2.  Clique no botão de upload do site e selecione seu **XML TISS**.
3.  **Se estiver tudo certo:** O arquivo carrega normalmente. Você nem notará a extensão.
4.  **Se houver erro:** Um alerta vermelho aparecerá na tela listando os problemas.
    *   **Botão "Limpar Arquivo":** Remove o arquivo inválido para você escolher outro.
    *   **Botão "Ignorar (Manter)":** Fecha o alerta e permite enviar o arquivo mesmo com erro (use com cautela!).

### Modo Manual (Checagem rápida)
1.  Clique no ícone do **TISS Guard** na barra do navegador.
2.  Na aba **Verificar**, clique em "Selecione o arquivo XML".
3.  O resultado aparecerá instantaneamente: Verde (Válido) ou Vermelho (Com erros).

### Configurações
Quer desativar alguma regra?
1.  Abra a extensão (clique no ícone).
2.  Vá na aba **Configurações**.
3.  Marque ou desmarque as opções:
    *   **Verificar Datas Futuras**: Impede datas de atendimento maiores que hoje.
    *   **Verificar Valores Negativos**: Impede valores monetários (R$) abaixo de zero.
    *   *Suas preferências ficam gravadas automaticamente!*

---

## 🤓 Área Técnica (Para Desenvolvedores)

Se você quiser modificar o código fonte:

### Tecnologias
*   React + TypeScript + Vite
*   TailwindCSS (Estilização)
*   Manifest V3 + Shadow DOM (Isolamento total)

### Comandos
```bash
# Instalar dependências
npm install

# Rodar servidor local (HMR)
npm run dev

# Gerar versão de produção (pasta /dist)
npm run build
```

---
Feito com ❤️ para facilitar a vida do faturamento médico.

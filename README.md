# TISS Guard - Auditoria e Automação de Faturamento 🛡️

> **Eficiência e Conformidade.** O TISS Guard é uma extensão gratuita projetada para eliminar glosas e automatizar processos manuais no faturamento médico (Padrão TISS/ANS).

---

## 📋 Sobre o Projeto

O envio de arquivos TISS com inconsistências é a principal causa de glosas e atrasos no pagamento por parte das operadoras (Unimed, Bradesco, SulAmérica, etc.).

O **TISS Guard** atua como uma camada de segurança local no seu navegador. Ele audita os arquivos XML em tempo real, garantindo que estejam 100% em conformidade com as regras da ANS antes do envio. Além disso, elimina a digitação manual através de sua funcionalidade de automação inteligente.

---

## ✨ Principais Funcionalidades

### 1. Auditoria Preventiva (Validação XML)
Evite o "vaivém" de arquivos. O sistema analisa a estrutura do seu XML instantaneamente e bloqueia o envio caso detecte:
*   Datas futuras ou inválidas.
*   Valores negativos ou inconsistentes.
*   Códigos TUSS fora do padrão (8 dígitos).
*   Ausência de guias ou dados obrigatórios.

### 2. Automação de Preenchimento (RPA)
Reduza o trabalho manual. O sistema identifica formulários nos portais das operadoras e injeta um botão **"Preencher TISS"**. Ao selecionar seu arquivo, o TISS Guard preenche automaticamente todos os campos do site, eliminando erros de digitação e economizando horas de trabalho.

### 3. Privacidade e Segurança Local
Diferente de validadores online, o TISS Guard opera **exclusivamente no seu computador**. Seus dados e os dados dos seus pacientes nunca saem da sua máquina. O processamento é offline e seguro.

---

## 🚀 Como Instalar

*O TISS Guard é uma extensão para Google Chrome e navegadores compatíveis.*

1.  **Localize o Projeto**: Tenha a pasta do `TISS Guard` salva em seu computador.
2.  **Acesse as Extensões**: No navegador, digite `chrome://extensions` na barra de endereço e tecle Enter.
3.  **Ative o Modo Desenvolvedor**: No canto superior direito da tela, ative a chave **"Modo do desenvolvedor"**.
4.  **Carregue a Extensão**:
    *   Clique no botão **"Carregar sem compactação"** (Load Unpacked).
    *   Selecione a pasta `dist` que está dentro da pasta do projeto `TISS Guard`.

✅ **Concluído:** O ícone do escudo azul aparecerá na sua barra de ferramentas.

---

## � Guia de Utilização

### Validando um Arquivo (Drag & Drop)
Para garantir que um arquivo está pronto para envio:
1.  Clique no ícone do **TISS Guard**.
2.  Arraste o arquivo XML para a área indicada ou clique para selecionar.
3.  **Feedback Imediato**:
    *   **Sucesso (Verde)**: Arquivo validado e pronto para o portal.
    *   **Atenção (Vermelho)**: Lista detalhada de correções necessárias.

### Utilizando a Automação (No Portal)
1.  Acesse a página de digitação de guias no site da operadora.
2.  Localize o botão flutuante **"Preencher TISS"** (injetado automaticamente pelo sistema).
3.  Selecione o arquivo XML correspondente.
4.  O sistema preencherá os campos da tela automaticamente.

---

## ⚙️ Configurações Avançadas

No painel da extensão, acesse a aba **"OPÇÕES"** para personalizar as regras de auditoria:
*   [x] **Bloquear Datas Futuras**: Impede procedimentos com data superior à atual.
*   [x] **Alertar Valores Negativos**: Monitora inconsistências financeiras nos totais.

---

## 👨‍� Informações Técnicas

Projeto de código aberto (FOSS), construído com tecnologias modernas para garantir performance e segurança.

*   **Tecnologias**: React 18, TypeScript, TailwindCSS, Vite.
*   **Build**: Para gerar uma nova versão de produção, execute:
    ```bash
    npm install && npm run build
    ```

*Desenvolvido para fortalecer a gestão em saúde suplementar.*

# TISS Guard - Auditoria e Automação de Faturamento 🛡️

> **Eficiência e Conformidade.** O TISS Guard é uma extensão gratuita projetada para eliminar glosas e automatizar processos manuais no faturamento médico (Padrão TISS/ANS).

---

## 📋 Sobre o Projeto

*   **Validação Inteligente:** Verifica regras de negócio da ANS (TISS 3.05+), integridade estrutural e consistência de dados.
*   **Relatórios de Auditoria:** Gera comprovantes em texto (log) para cada arquivo validado (Download).
*   **Suporte Enterprise:** Compatível com arquivos **ISO-8859-1** (ERPs Legados) e UTF-8.
*   **RPA Resiliente:** Preenchimento automático que "lê" a tela do portal (Unimed, Bradesco, etc.) usando heurística avançada.
*   **Local-First:** Seus dados nunca saem do computador. Proteção total LGPD.

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

### 3. Privacidade e Segurança Local (LGPD / HIPAA)
**Arquitetura Local-First**: Diferente de validadores online, o TISS Guard opera **exclusivamente no seu computador**.
> 🔒 **Aviso de Privacidade:** Nenhum dado de paciente, médico ou conta médica trafega pela internet ou sai da sua máquina. O processamento é 100% offline, garantindo conformidade total com a LGPD.

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

*Desenvolvido para fortalecer a gestão em saúde suplementar.*

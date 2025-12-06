# TISS Guard - Auditoria e Automação de Faturamento TISS

O **TISS Guard** é uma solução corporativa para navegadores que auditam arquivos TISS (XML) em tempo real e automatiza o preenchimento de guias nos portais das operadoras de saúde.

Desenvolvido para clínicas, hospitais e faturistas, o sistema atua preventivamente para garantir a conformidade com as normas da ANS e eliminar erros que causam glosas financeiras.

---

## 📋 Funcionalidades Principais

### 1. Auditoria de Arquivos (Validação)
O sistema intercepta arquivos XML no momento do upload no portal da operadora e realiza uma varredura completa contra regras de negócio:
*   **Padrão TUSS:** Verifica se os códigos de procedimentos possuem estritamente 8 dígitos.
*   **Regras Financeiras:** Bloqueia guias com valores zerados ou negativos.
*   **Consistência Temporal:** Impede o envio de guias com datas futuras.
*   **Integridade:** Valida a presença de campos obrigatórios (ex: Número da Guia).

### 2. Automação de Preenchimento (RPA)
A funcionalidade de **Preenchimento Automático** elimina a digitação manual de guias nos sites das operadoras.
*   O sistema identifica formulários web compatíveis.
*   Lê os dados do seu arquivo XML local.
*   Preenche os campos correspondentes (Guia, Data, Valor, etc.) na tela em segundos.

### 3. Privacidade e Segurança (LGPD)
O TISS Guard opera sob o princípio de **Processamento Local**.
*   **Sigilo de Dados:** Todas as validações ocorrem na memória do computador do usuário. Nenhum dado de paciente ou faturamento é enviado para servidores externos.
*   **Licenciamento Seguro:** Utiliza assinaturas digitais criptográficas (ES256) para ativação offline.

---

## ⚙️ Guia de Instalação

O TISS Guard é uma extensão de uso restrito e deve ser instalada manualmente no Google Chrome:

1.  **Baixe o Arquivo:** Faça o download do pacote da extensão (ZIP) e extraia em uma pasta de sua preferência.
2.  **Acesse o Gerenciador de Extensões:** No Chrome, digite `chrome://extensions` na barra de endereço.
3.  **Ative o Modo Desenvolvedor:** Ligue a chave "Modo do desenvolvedor" no canto superior direito da tela.
4.  **Carregue a Extensão:** Clique no botão **"Carregar sem compactação"** (Load Unpacked).
5.  **Selecione a Pasta:** Navegue e selecione a pasta `dist` localizada dentro dos arquivos extraídos.

O ícone do TISS Guard aparecerá na barra de ferramentas do navegador.

---

## 📖 Manual de Operação

### Ativação da Licença
1.  Clique no ícone da extensão.
2.  No primeiro acesso, insira sua **Chave de Licença Corporativa**.
3.  Clique em **"Ativar"**. O painel de controle será liberado.

### Como Validar um Arquivo TISS
O processo é automático e integrado ao seu fluxo de trabalho:
1.  Acesse o portal da operadora de saúde (ex: Unimed, Bradesco).
2.  Faça o upload do arquivo XML normalmente.
3.  O TISS Guard analisará o arquivo instantaneamente:
    *   **Arquivo Válido:** O processo segue sem interrupções.
    *   **Arquivo Inválido:** Um alerta será exibido na tela listando as inconsistências que precisam ser corrigidas antes do envio.

### Como Usar o Preenchimento Automático
1.  Em páginas de digitação de guias, localize o botão flutuante **"Preencher TISS"** no canto inferior da tela.
2.  Clique no botão e selecione o arquivo XML desejado em seu computador.
3.  O sistema preencherá os campos do formulário automaticamente.
4.  Verifique os dados e prossiga com a confirmação no portal.

---

## 📞 Suporte Técnico

Para dúvidas sobre regras de validação ou suporte técnico:
*   **Versão:** 1.0.0
*   **Documentação Técnica:** Consulte a pasta `docs/` no repositório.

---
*© 2025 TISS Guard. Conformidade ANS e Segurança de Dados.*

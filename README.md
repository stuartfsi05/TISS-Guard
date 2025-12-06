# TISS Guard - Sistema de Auditoria e Automação Médica

**Versão da Documentação:** 1.0.1 (Atualizada em Dezembro/2025)

O **TISS Guard** é a ferramenta oficial [Nome da Instituição/Cliente] para garantir a qualidade do faturamento médico. Este manual guia você passo a passo na instalação e uso do sistema.

---

## 🎯 O que o sistema faz?

O sistema possui duas funções principais que operam automaticamente no seu navegador Chrome:

1.  **🛡️ O Auditor (Validação de XML):**
    *   **Função:** Impede erros antes do envio.
    *   **Como funciona:** Quando você anexa um arquivo XML no site da operadora, o sistema verifica datas, valores e códigos TUSS *antes* de finalizar o envio. Se houver erro, ele bloqueia e te avisa.

2.  **🤖 O Autômato (Preenchimento de Guias):**
    *   **Função:** Digita a guia para você.
    *   **Como funciona:** Um botão "Preencher TISS" aparece na tela. Você clica, escolhe o arquivo, e o sistema preenche todos os campos do formulário sozinho.

---

## ⚙️ Guia de Instalação (Primeiro Acesso)

*Tempo estimado: 2 minutos.*

Como esta é uma ferramenta interna de segurança, ela não está na loja pública do Chrome. Siga os passos:

1.  **Baixar:** Faça o download da pasta do sistema (arquivo `.zip`) e extraia na sua Área de Trabalho.
2.  **Abrir Extensões:** No navegador Chrome, digite `chrome://extensions` na barra de endereço (lá em cima) e dê Enter.
3.  **Ativar Modo Desenvolvedor:** No canto superior direito da tela, ative a chave **"Modo do desenvolvedor"**.
4.  **Carregar:** Clique no botão cinza **"Carregar sem compactação"** (ou *Load Unpacked*).
5.  **Selecionar:** Escolha a pasta `dist` que está dentro da pasta que você baixou.

✅ **Sucesso:** O ícone de escudo azul aparecerá ao lado da barra de endereços.

---

## 📖 Como Usar no Dia a Dia

### 1️⃣ Ativando o Sistema
*   Clique no ícone de escudo azul.
*   Insira a **Chave de Licença** fornecida pelo seu supervisor.
*   Clique em **Ativar**. (Isso é feito apenas uma vez).

### 2️⃣ Para Validar Arquivos (Auditoria)
Não é necessário clicar em nada. O sistema trabalha sozinho.
1.  Acesse o portal da operadora (ex: Unimed, Bradesco).
2.  Faça o upload do seu arquivo XML de faturamento.
3.  **Observe a tela:**
    *   **Nenhum alerta:** O arquivo está perfeito. Prossiga.
    *   **🚨 Alerta Vermelho:** O sistema encontrou erros (ex: "Código TUSS incorreto" ou "Data Futura"). Corrija o arquivo no seu sistema de gestão e tente novamente.

### 3️⃣ Para Preencher Guias (Automação/RPA)
Use esta função quando precisar digitar uma guia manualmente no site.
1.  Entre na tela de digitação de guia do portal.
2.  Procure o botão flutuante **"🤖 Preencher TISS"** no canto inferior direito.
3.  Clique nele e selecione o arquivo XML da guia em seu computador.
4.  Aguarde o preenchimento automático (os campos ficarão verdes).
5.  Confira os dados e clique em "Salvar/Enviar" no site da operadora.

---

## ❓ Ajuda e Solução de Problemas

**"O botão do robô não aparece."**
*   Verifique se você está na página correta de digitação de guia.
*   Atualize a página (F5).
*   Certifique-se de que a extensão está ativa (ícone azul, não cinza).

**"O sistema diz que o código TUSS está errado, mas está certo."**
*   O TISS Guard exige estritamente **8 dígitos numéricos**.
*   Exemplo Correto: `10101012`
*   Exemplo Errado: `10.10.10.12` (pontos) ou `1010101` (7 dígitos).

**"Meus dados são seguros?"**
*   Sim. O sistema processa tudo **localmente** no seu computador. Nenhuma informação do paciente sai da sua máquina. Estamos em conformidade com a LGPD.

---

## 📞 Suporte
Em caso de dúvidas técnicas ou erros persistentes, abra um chamado para a TI informando a mensagem de erro apresentada.

*TISS Guard v1.0.1 - Tecnologia a favor do faturamento.*

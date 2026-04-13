# TISS Guard 🛡️

**Auditoria Inteligente e Automação de Faturamento Médico (Padrão TISS/ANS)**

O **TISS Guard** é uma extensão de navegador profissional focada em eliminar glosas e modernizar a rotina de faturistas. Em fração de segundos, o sistema valida seus arquivos XML contra as complexas exigências da ANS e ainda automatiza a digitação de guias nos portais das operadoras. 

Tudo isso rodando de forma 100% offline no seu computador, garantindo confidencialidade e alinhamento total com a LGPD.

---

## 🎯 Por que utilizar o TISS Guard?

Para clínicas, consultórios e faturistas, o processo de auditoria de arquivos XML é exaustivo e suscetível ao olho humano. Erros estruturais ou lógicos (como dados faltantes, limites de caracteres excedidos e numerações inválidas) são as principais causas de devoluções e glosas. 

O TISS Guard atua em duas frentes vitais:

1. **Prevenção (The Guard):** Verifica a saúde do seu arquivo antes do envio.
2. **Eficiência (The RPA):** Lê o XML aprovado e preenche a tela do convênio por você. 

---

## ✨ Principais Funcionalidades

### 1. Motor de Validação XSD e Regras de Negócio
Seu XML não passa apenas por uma leitura superficial. A extensão embarca um poderoso motor de validação que detecta:
- Falhas na estrutura exigida pela TISS (versão 3.05+).
- Estouro de limite de caracteres em campos chaves (ex: carteirinha excedendo 20 dígitos).
- Domínios inválidos (ex: indicador de recém-nascido fora do padrão "S" ou "N").
- Restrições de contexto e lógicas preventivas (datas futuras, valores negativos).
  
> *Os relatórios de falha foram desenhados para humanos: o sistema traduz os códigos engessados da ANS em ações corretivas simples, apontando o que você deve arrumar no sistema gerador.*

### 2. Automação Inteligente de Interface (RPA Semantic System)
Acabou a cópia e cola. O sistema identifica visualmente formulários de operadoras parceiras ou portais genéricos:
- **Dicionário Semântico Integrado:** A extensão escaneia o site da operadora buscando onde digitar informações críticas do paciente e da consulta.
- **Painel de Feedback Persistente:** Se a automação notar que o site não tem um campo (ou que a operadora mudou de layout repentinamente), um card flutuante evidenciará quais dados precisam ser digitados à mão pelo usuário, garantindo uma revisão final sem suposições.

### 3. Execução Local com Proteção Concorrente (Web Workers)
Processar arquivos hospitalares pesados no navegador causaria lentidão extrema. A arquitetura do TISS Guard conta com _Web Workers_, rodando o processamento pesado numa ramificação segura para que o seu Chrome não trave, permitindo validações fluidas. A privacidade é absoluta: a internet não é usada no tratamento do XML.

---

## 🚀 Como Instalar a Extensão (Passo a Passo)

A instalação utiliza o modo desenvolvedor e leva apenas alguns segundos!

1. **Baixe ou clone este repositório** para uma pasta segura em seu computador.
2. Abra o Google Chrome (ou derivados como Edge, Brave, etc.) e digite na barra de endereços: `chrome://extensions`.
3. No canto superior direito desta tela, habilite a chave chamada **"Modo do desenvolvedor"**.
4. Três novos botões aparecerão. Clique em **"Carregar sem compactação"** *(Load unpacked)*.
5. Selecione a pasta `dist` (que está dentro do diretório do projeto TISS Guard que você baixou).

✅ **Pronto!** O ícone azul do escudo do TISS Guard aparecerá ao lado da barra de tarefas do seu navegador (clique na peça de quebra-cabeça para fixá-lo).

---

## 📘 Guia de Utilização na Prática

### Realizando a Auditoria do XML (Drag & Drop)
Antes de enviar o seu lote no site da operadora, passe no validador para ter certeza de que será pago:
1. Abra o popup do **TISS Guard** (clicando no ícone do escudo azul).
2. Arraste o arquivo XML do seu sistema para a área central da interface do popup. 
3. **Resultado Imediato:**
   - **Luz Verde (Aprovado):** Estrutura TISS garantida e pronta para envio.
   - **Luz Vermelha (Reprovado):** O popup mostrará uma listagem didática contendo a respectiva **Ação Necessária** a ser feita (o que e onde arrumar no cadastro do paciente/guia do seu ERP).
4. Clicando no botão inferior, você pode baixar o *Relatório de Validação* (.txt) detalhado para anexar ou compartilhar com sua equipe de TI.

### Utilizando a Automação no Portal do Convênio (RPA)
1. Certifique-se de estar na tela correta de digitação manual de guias dentro do portal da operadora (em seu navegador).
2. Observe se o botão roxo flutuante **"Preencher TISS"** apareceu no canto direito inferior da tela (isso indica que a extensão reconheceu a página para você).
3. Ao clicar no botão roxo, selecione o mesmo arquivo XML recém-validado.
4. Fique à vontade e observe os campos piscarem em verde; o formulário será totalmente automatizado. Caso a operadora exija um campo que a extensão não tenha achado, um forte painel vermelho e impossível de ser ignorado o alertará para prosseguir com digitação manual, permitindo total previsibilidade.

---

## ⚙️ Configurações e Preferências 
O formato visual da aplicação é customizável. No app da extensão, na aba **OPÇÕES**, você encontrará parâmetros para alterar temas entre Claro e Escuro, e opções extras para ativar ou desativar monitoramento estrito de guias com Datas Futuras ou Valores Inconsistentes.

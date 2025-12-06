import { validateTiss } from '../services/XmlValidatorService';
import { StorageService } from '../services/StorageService';
import { PortalScraper } from '../services/PortalScraper';
import { runSelfTest } from '../services/RulesEngine.test';

// Expose diagnostic for audit
(window as any).tissGuardDiag = runSelfTest;

console.log('TISS Guard Content Script Active. Run window.tissGuardDiag() to test rules.');

const HOST_ID = 'tiss-guard-host';

// Styles for the injected modal - Scoped for Shadow DOM
const modalStyles = `
  :host {
    all: initial;
    z-index: 2147483647; /* Max Z-Index */
    position: fixed;
    top: 20px;
    right: 20px;
    font-family: system-ui, -apple-system, sans-serif;
  }
  
  .tiss-guard-modal {
    width: 350px;
    background: white;
    border-left: 5px solid #ef4444;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    padding: 16px;
    border-radius: 6px;
    display: none;
    flex-direction: column;
    gap: 12px;
    animation: slideIn 0.3s ease-out;
    border: 1px solid #e5e7eb;
  }

  .tiss-guard-modal.visible {
    display: flex;
  }

  @keyframes slideIn {
    from { transform: translateX(120%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .title {
    font-weight: 700;
    color: #b91c1c;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .error-list {
    margin: 0;
    padding-left: 20px;
    color: #b91c1c;
    font-size: 14px;
    max-height: 200px;
    overflow-y: auto;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 4px;
  }

  button {
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: background-color 0.2s;
  }

  .btn-clear {
    background-color: #fee2e2;
    color: #991b1b;
  }
  .btn-clear:hover {
    background-color: #fecaca;
  }

  .btn-ignore {
    background-color: #f3f4f6;
    color: #374151;
  }
  .btn-ignore:hover {
    background-color: #e5e7eb;
  }
`;

// Helper to Create Shadow Host
const createShadowHost = () => {
  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement('div');
    host.id = HOST_ID;
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });

    // Inject Styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = modalStyles;
    shadow.appendChild(styleSheet);

    // Create Container
    const container = document.createElement('div');
    container.className = 'tiss-guard-modal';
    container.innerHTML = `
            <div class="title">
                ⚠️ Falha na validação TISS
            </div>
            <ul class="error-list"></ul>
            <div class="actions">
                <button class="btn-ignore" id="btn-ignore">Ignorar (Manter)</button>
                <button class="btn-clear" id="btn-clear">Limpar Arquivo</button>
            </div>
        `;
    shadow.appendChild(container);
  }
  return host.shadowRoot!;
};

const showErrors = (errors: string[], targetInput: HTMLInputElement) => {
  const shadow = createShadowHost();
  const modal = shadow.querySelector('.tiss-guard-modal') as HTMLElement;
  const list = shadow.querySelector('.error-list') as HTMLElement;
  const btnClear = shadow.querySelector('#btn-clear') as HTMLButtonElement;
  const btnIgnore = shadow.querySelector('#btn-ignore') as HTMLButtonElement;

  if (!modal || !list) return;

  // Reset previous listeners
  const newBtnClear = btnClear.cloneNode(true);
  const newBtnIgnore = btnIgnore.cloneNode(true);
  btnClear.parentNode?.replaceChild(newBtnClear, btnClear);
  btnIgnore.parentNode?.replaceChild(newBtnIgnore, btnIgnore);

  // Populate errors
  list.innerHTML = ''; // Clear existing
  errors.forEach(err => {
    const li = document.createElement('li');
    li.textContent = err;
    list.appendChild(li);
  });
  modal.classList.add('visible');

  // Action: Clear Input
  newBtnClear.addEventListener('click', () => {
    targetInput.value = ''; // Clear file
    modal.classList.remove('visible');
  });

  // Action: Ignore (Just close modal, keep file)
  newBtnIgnore.addEventListener('click', () => {
    modal.classList.remove('visible');
  });
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // Basic check to see if it might be an XML (by name or type)
  if (!file.name.endsWith('.xml') && file.type !== 'text/xml') {
    return;
  }

  // Safety Check: 50MB Limit
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  if (file.size > MAX_SIZE) {
    showErrors(['⛔ Erro de Segurança', 'Arquivo excede o limite do navegador (50MB).', 'Reduza o arquivo antes de tentar novamente.'], target);
    return;
  }

  try {
    const text = await file.text();
    const can = await StorageService.canValidate();

    if (!can) {
      // Block Usage
      showErrors(['⚠️ Limite Gratuito Atingido!', 'Sua cota mensal de validações acabou.', 'Por favor, atualize para o plano TISS Guard PRO no ícone da extensão.'], target);
      return;
    }

    const settings = await StorageService.getSettings();
    const result = validateTiss(text, settings);

    // Count Usage if we actually ran a validation
    // (Optimistic: we count every specific attempt, or we could count only valid ones? Usually usage is usage)
    await StorageService.incrementUsage();

    if (!result.isValid) {
      // Alert the user
      // Map the ValidationError objects to strings for the simple display
      const errorStrings = result.errors.map(e => `${e.message}`);
      showErrors(errorStrings, target);
    } else {
      console.log('TISS Guard: Arquivo válido');
    }
  } catch (err) {
    console.error('TISS Guard Error:', err);
  }
};

// Monitor DOM for new inputs
const observeInputs = () => {
  // Attach to existing file inputs
  document.querySelectorAll('input[type="file"]').forEach(input => {
    if (!input.hasAttribute('data-tiss-guard')) {
      input.addEventListener('change', handleFileSelect);
      input.setAttribute('data-tiss-guard', 'true');
    }
  });

  // [Phase 2] Scan for Portal Errors
  // We debounce this to avoid spamming on every DOM change
  const errors = PortalScraper.scan();
  if (errors.length > 0) {
    // console.log('⚠️ [TISS Guard] Portal Error Detected:', errors); // Silenced for Production
  }
};

const observer = new MutationObserver(() => {
  observeInputs();
});

observer.observe(document.body, { childList: true, subtree: true });

// --- RPA: Floating Action Button ---
const injectRpaButton = () => {
  const shadow = createShadowHost(); // Reuse existing shadow root

  // Check if button already exists in shadow DOM to prevent duplicates
  if (shadow.querySelector('#btn-rpa-fab')) return;

  const btn = document.createElement('button');
  btn.id = 'btn-rpa-fab';
  btn.textContent = '🤖 Preencher TISS';
  btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2563eb;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 50px;
        font-weight: bold;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        z-index: 99999;
        font-family: inherit;
        transition: transform 0.2s;
    `;

  btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
  btn.onmouseout = () => btn.style.transform = 'scale(1)';

  // Hidden File Input for RPA
  const rpaInput = document.createElement('input');
  rpaInput.type = 'file';
  rpaInput.accept = '.xml';
  rpaInput.style.display = 'none';

  // Hook up click
  btn.onclick = () => rpaInput.click();

  // Hook up file selection
  rpaInput.onchange = async (e) => {
    const target = e.target as HTMLInputElement;
    if (!target.files?.[0]) return;

    const file = target.files[0];
    try {
      const text = await file.text();

      // 1. Validate First
      const settings = await StorageService.getSettings();
      const result = validateTiss(text, settings);

      if (!result.isValid) {
        // Show errors using existing mechanism but targeting the RPA input (virtual)
        // Or just Alert for now
        alert(`⚠️ Atenção: O arquivo contém erros!\n\n${result.errors.map(e => e.message).join('\n')}`);
        // return; // Optional: Stop or allow filling anyway? Let's allow but warn.
      }

      // 2. Parse & Fill
      const { parseXml } = await import('../services/XmlValidatorService'); // Dynamic import to ensure parser is available
      const jsonObj = parseXml(text);

      const { FormFiller } = await import('../services/FormFiller');
      FormFiller.fill(jsonObj);

    } catch (err) {
      console.error('RPA Error:', err);
      alert('Falha ao processar arquivo para preenchimento.');
    }
  };

  shadow.appendChild(btn);
};

// Initial run
observeInputs();
// Inject RPA Button (Delay slightly to ensure DOM is ready)
setTimeout(injectRpaButton, 1000);

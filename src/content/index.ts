import { validateTiss } from '../services/XmlValidatorService';
import { StorageService } from '../services/StorageService';

console.log('TISS Guard Content Script Active');

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
  list.innerHTML = errors.map(e => `<li>${e}</li>`).join('');
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

  try {
    const text = await file.text();
    const settings = await StorageService.getSettings();
    const result = validateTiss(text, settings);

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
  // Attach to existing
  document.querySelectorAll('input[type="file"]').forEach(input => {
    if (!input.hasAttribute('data-tiss-guard')) {
      input.addEventListener('change', handleFileSelect);
      input.setAttribute('data-tiss-guard', 'true');
    }
  });
};

const observer = new MutationObserver(() => {
  observeInputs();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial run
observeInputs();

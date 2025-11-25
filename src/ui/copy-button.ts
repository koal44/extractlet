import { h } from '../utils/dom';
import { repr } from '../utils/logging';


export function createCopyButton(
  copyText: string | (() => string),
  responseText: string | (() => string) = 'Copied!',
  hintText: string | (() => string) = 'Copy',
  opts: { doc?: Document; } = {},
): HTMLDivElement {
  const { doc = document } = opts;
  const response = h('span', { class: 'copybutton-response', __doc: doc });
  const iconPath = h('svg:path', {
    d: 'M4.16667 12.5H3.33333C2.89131 12.5 2.46738 12.3244 2.15482 12.0118C1.84226 11.6993 1.66667 11.2754 1.66667 10.8333V3.33332C1.66667 2.8913 1.84226 2.46737 2.15482 2.15481C2.46738 1.84225 2.89131 1.66666 3.33333 1.66666H10.8333C11.2754 1.66666 11.6993 1.84225 12.0118 2.15481C12.3244 2.46737 12.5 2.8913 12.5 3.33332V4.16666M9.16667 7.49999H16.6667C17.5871 7.49999 18.3333 8.24618 18.3333 9.16666V16.6667C18.3333 17.5871 17.5871 18.3333 16.6667 18.3333H9.16667C8.24619 18.3333 7.5 17.5871 7.5 16.6667V9.16666C7.5 8.24618 8.24619 7.49999 9.16667 7.49999Z',
    __doc: doc,
  });
  const icon = h('svg:svg', {
    class: 'copybutton-icon',
    viewBox: '0 0 20 20',
    role: 'img',
    'aria-label': 'copy',
    focusable: 'false',
    __doc: doc,
  }, iconPath);

  const button = h('button', { class: 'copybutton', __doc: doc }, icon);
  button.addEventListener('click', () => {
    void (async function() {
      const text = typeof copyText === 'function' ? copyText() : copyText;
      try {
        await navigator.clipboard.writeText(text);
        button.disabled = true;
        response.textContent = typeof responseText === 'function' ? responseText() : responseText;
        response.style.display = 'inline-block';
        setTimeout(() => {
          // Reset button to original state
          button.disabled = false;
          response.style.display = 'none';
        }, 1000);
      } catch (err) {
        alert('Failed to copy content.');
        console.error(`[xlet:button] Copy error: ${repr(err)}`);
      }
    })();
  });


  // set hint
  if (typeof hintText === 'string') {
    button.title = hintText;
  } else if (typeof hintText === 'function') {
    const updateTitle = () => { button.title = hintText(); };
    button.addEventListener('mouseenter', updateTitle);
    button.addEventListener('focus', updateTitle);
  }

  return h('div', { class: 'copybutton-wrapper', __doc: doc }, button, response);
}

export const copyButtonCss = /* css */ `
.copybutton-wrapper {
  font-size: var(--copybutton-size, 1em); /* scalable */
  --copybutton-color: #4ca5f2;
  --copybutton-bg: #f2f4f7;
  display: inline-flex;
}
#copybutton-hidden-ta {
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
}
.copybutton-response {
  display: none;
  color: var(--copybutton-color);
  background-color: var(--copybutton-bg);
  border: 0.05em solid currentColor;
  border-radius: 0.3em;
  padding: 0.2em 0.4em;
  font-size: 0.75em;
  align-content: center;
  margin-left: 0.25em;
}
.copybutton {
  font-size: inherit;
  cursor: pointer;
  margin: 0;
  padding: 0.3em 0.4em;
  background-color: var(--copybutton-bg);
  border: 0.08em solid currentColor;
  border-radius: 0.3em;
  color: var(--copybutton-color);
  transition: background-color 0.1s linear;
}
.copybutton-icon {
  width: 1em;
  height: 1em;
  fill: none;
  display: block;
}
.copybutton-icon path {
  stroke: currentColor;
  stroke-width: 0.08em;
  stroke-linecap: round;
  stroke-linejoin: round;
}
`;

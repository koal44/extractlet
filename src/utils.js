export function log(...args) {
  const DEBUG = typeof process !== 'undefined' && process.env.DEBUG === 'true';
  const JSONIFY_STRINGS = true;
  const ESCAPE_WS = false;
  const INDENT = 2;
  const VERBOSE_NODES = true;

  if (!DEBUG) return;

  function nodeSummary(node) {
    if (!node) return String(node);
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        return ['<', node.tagName.toLowerCase(), node.id ? `#${node.id}` : '',
          node.className ? '.' + String(node.className).trim().replace(/\s+/g, '.') : '', '>'
        ].join('');
      case Node.TEXT_NODE:
        return `#text "${node.textContent?.slice(0, 40) ?? ''}"`;
      case Node.COMMENT_NODE:
        return `<!-- ${node.textContent?.slice(0, 40) ?? ''} -->`;
      default:
        return `[${node.nodeName} type=${node.nodeType}]`;
    }
  }

  for (const arg of args) {
    let out;

    if (typeof arg === 'string') {
      out = JSONIFY_STRINGS ? JSON.stringify(arg).slice(1, -1) : arg;
    } else if (arg && typeof arg === 'object' && typeof arg.nodeType === 'number') {
      out = VERBOSE_NODES && arg.outerHTML ? arg.outerHTML : nodeSummary(arg);
    } else {
      try {
        out = JSON.stringify(arg, null, INDENT);
      } catch (err) {
        out = `[Unserializable object: ${err.message}]`;
      }
    }

    if (ESCAPE_WS && typeof out === 'string') {
      out = out.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    }
    console.log(out);
  }
}


export function h(tag, attrs = {}, ...children) {
  let node;

  if (typeof tag === 'string' && tag.startsWith('svg:')) {
    node = document.createElementNS('http://www.w3.org/2000/svg', tag.slice(4));
  } else {
    node = document.createElement(tag);
  }

  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  children.forEach(child => {
    if (typeof child === 'string') {
      node.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      node.appendChild(child);
    }
  });
  return node;
}

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function injectCss(css, { id = undefined, doc = document } = {}) {
  if (id && doc.getElementById(id)) return;

  const style = doc.createElement('style');
  style.textContent = css;
  if (id) style.id = id;
  style.type = 'text/css';
  doc.head.appendChild(style);
}

export function createMultiToggle({ initState = 0, onToggle = undefined, labels = ['a', 'b'], labelSide = 'right' } = {}) {
  if (!Array.isArray(labels) || labels.length === 0) {
    throw new Error('multi-toggle requires at least one label');
  }
  const checkbox = h('input', { type: 'checkbox', class: 'multi-toggle-checkbox', 'aria-label': 'Toggle view mode' });
  const slider = h('span', { class: 'multi-toggle-slider' });
  const switchBody = h('label', { class: 'multi-toggle-switchbody' }, checkbox, slider);
  const stateLabel = h('span', { class: `multi-toggle-label-${labelSide}` }, labels[initState]);
  const wrapper = labelSide === 'left'
    ? h('div', { class: 'multi-toggle' }, stateLabel, switchBody)
    : h('div', { class: 'multi-toggle' }, switchBody, stateLabel);

  const setState = (newState) => {
    state = newState;
    const knobProgress = labels.length === 1 ? 0 : newState / (labels.length - 1);
    wrapper.style.setProperty('--knob-progress', `${knobProgress}`);
    stateLabel.textContent = labels[newState];
    onToggle?.(newState);
  };

  let state = initState;
  setState(state);

  checkbox.addEventListener('change', () => {
    setState((state + 1) % labels.length);
  });

  return wrapper;
}

export const multiToggleCss = /* css */ `
.multi-toggle {
  --track-width: 50px;
  --track-height: 22px;
  --knob-size: 16px;
  --knob-offset: calc((var(--track-height) - var(--knob-size)) / 2);
  --knob-range: calc(var(--track-width) - var(--knob-size) - var(--knob-offset) * 2);
  --knob-progress: 0;
}
.multi-toggle-switchbody {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  width: var(--track-width);
  height: var(--track-height);
}
.multi-toggle-checkbox {
  opacity: 0;
  width: 0;
  height: 0;
}
.multi-toggle-slider {
  position: absolute;
  cursor: pointer;
  background-color: #a3a9b3;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: 0.2s;
  border-radius: var(--track-height);
}
.multi-toggle-slider:before {
  position: absolute;
  content: "";
  height: var(--knob-size);
  width: var(--knob-size);
  left: var(--knob-offset);
  bottom: var(--knob-offset);
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}
.multi-toggle-slider::before {
  transform: translateX(calc(var(--knob-range) * var(--knob-progress)));
}
.multi-toggle-label-left,
.multi-toggle-label-right {
  display: inline-block;
  font-size: 0.9em;
  vertical-align: middle;
}
.multi-toggle-label-left {
  margin-right: 0.7em;
}
.multi-toggle-label-right {
  margin-left: 0.7em;
}
`;

export const copyButtonCss = /* css */ `
.copybutton {
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
  border: 1px solid currentColor;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 15px;
  align-content: center;
  margin-left: 5px;
}
.copybutton button {
  cursor: pointer;
  margin-left: 20px;
  padding: 6px 8px;
  background-color: var(--copybutton-bg);
  border: 1px solid currentColor;
  border-radius: 6px;
  color: var(--copybutton-color);
  transition: background-color 0.1s linear;
}
.copybutton-icon {
  width: 20px;
  height: 20px;
  fill: none;
}
.copybutton-icon path {
  stroke: currentColor;
  stroke-width: 1.66667;
  stroke-linecap: round;
  stroke-linejoin: round;
}
`;

export function createCopyButton(doc, copyText, responseText = 'Copied!') {
  // hidden helper to hold the text to be copied
  let ta = doc.getElementById('copybutton-hidden-ta');
  if (!ta) {
    ta = h('textarea', { id: 'copybutton-hidden-ta' });
    doc.body.appendChild(ta);
  }

  const response = h('span', { class: 'copybutton-response' }, responseText);
  const iconPath = h('svg:path', {
    d: 'M4.16667 12.5H3.33333C2.89131 12.5 2.46738 12.3244 2.15482 12.0118C1.84226 11.6993 1.66667 11.2754 1.66667 10.8333V3.33332C1.66667 2.8913 1.84226 2.46737 2.15482 2.15481C2.46738 1.84225 2.89131 1.66666 3.33333 1.66666H10.8333C11.2754 1.66666 11.6993 1.84225 12.0118 2.15481C12.3244 2.46737 12.5 2.8913 12.5 3.33332V4.16666M9.16667 7.49999H16.6667C17.5871 7.49999 18.3333 8.24618 18.3333 9.16666V16.6667C18.3333 17.5871 17.5871 18.3333 16.6667 18.3333H9.16667C8.24619 18.3333 7.5 17.5871 7.5 16.6667V9.16666C7.5 8.24618 8.24619 7.49999 9.16667 7.49999Z',
  });
  const icon = h('svg:svg', {
    class: 'copybutton-icon',
    viewBox: '0 0 20 20',
    role: 'img',
    'aria-label': 'copy',
    focusable: 'false',
  }, iconPath);

  const button = h('button', {}, icon);
  button.addEventListener('click', function() {
    ta.value = typeof copyText === 'function' ? copyText() : copyText;
    ta.select();

    try {
      const successful = doc.execCommand('copy');
      if (successful) {
        button.disabled = true;
        response.style.display = 'inline-block';
        setTimeout(() => {
          // Reset button to original state
          button.disabled = false;
          response.style.display = 'none';
        }, 1000);
      } else {
        alert('Failed to copy content.');
      }
    } catch (err) {
      console.error('Copy error:', err);
    }
  });

  return h('div', { class: 'copybutton' }, button, response);
}
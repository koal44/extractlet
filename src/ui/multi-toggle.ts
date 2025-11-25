import { h, isDiv } from '../utils/dom';
import { warn } from '../utils/logging';
import { hasOfType, isFunction } from '../utils/typing';


export type MultiToggleDiv = HTMLDivElement & {
  init: () => void;
  setState: (newState: number, opts?: { silent?: boolean; }) => void;
  getLabels: () => readonly string[];
  getState: () => number;
}

export function isMultToggleDiv(x: unknown): x is MultiToggleDiv {
  return (
    isDiv(x) &&
    hasOfType(x, 'init', isFunction) &&
    hasOfType(x, 'setState', isFunction) &&
    hasOfType(x, 'getLabels', isFunction) &&
    hasOfType(x, 'getState', isFunction)
  );
}

export function createMultiToggle(
  {
    initState = 0,
    onToggle,
    labels = ['a', 'b'],
    labelSide = 'right',
  }: {
    initState?: number;
    onToggle?: (newState: number) => void;
    labels?: readonly string[];
    labelSide?: 'left' | 'right';
  } = {}
) {
  if (labels.length === 0) {
    throw new Error('multi-toggle requires at least one label');
  }
  const checkbox = h('input', { type: 'checkbox', class: 'multi-toggle-checkbox', 'aria-label': 'Toggle view mode' });
  const slider = h('span', { class: 'multi-toggle-slider' });
  const switchBody = h('label', { class: 'multi-toggle-switchbody' }, checkbox, slider);
  const stateLabel = h('span', { class: `multi-toggle-label-${labelSide}` }, labels[initState]);
  const wrapper = labelSide === 'left'
    ? h('div', { class: 'multi-toggle' }, stateLabel, switchBody) as MultiToggleDiv
    : h('div', { class: 'multi-toggle' }, switchBody, stateLabel) as MultiToggleDiv;

  const setState = (newState: number, opts: { silent?: boolean; } = {}): void => {
    if (newState < 0 || newState >= labels.length) {
      return warn(undefined, `[xlet:toggle] Invalid multi-toggle state: ${newState}`);
    }
    if (newState === state) return; // nothing to do
    state = newState;
    const knobProgress = labels.length === 1 ? 0 : newState / (labels.length - 1);
    wrapper.style.setProperty('--knob-progress', `${knobProgress}`);
    stateLabel.textContent = labels[newState];
    if (!opts.silent) onToggle?.(newState);
  };

  let state = -1;
  wrapper.init = () => { setState(initState, { silent: false }); };
  wrapper.setState = setState;
  wrapper.getLabels = () => labels;
  wrapper.getState = () => state;

  checkbox.addEventListener('change', () => {
    setState((state + 1) % labels.length);
  });

  // swallow specSynthetic activation clicks
  checkbox.addEventListener('click', (ev: MouseEvent | PointerEvent) => {
    if (ev.target === checkbox && ev.detail === 0) ev.stopPropagation();
  });

  // wrapper.init(); // auto initialize state

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

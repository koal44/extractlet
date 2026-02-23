import { h } from '../utils/dom';

export function attachStickyHeader(root: HTMLElement, toggle: HTMLElement): HTMLDivElement {
  const container = h('div', { class: 'view-toggle' }, toggle);
  root.appendChild(container);

  // set CSS var for anchor offset (used by :target scroll-margin-top)
  const hpx = Math.ceil(container.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--xlet-sticky-offset', `${hpx + 8}px`);

  return container;
}

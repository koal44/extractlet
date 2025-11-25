// import { annotateMathJax } from '../../src/annotate';

// function makeList(nodes: { el: Element; tex: string }[]) {
//   // sentinel node
//   const list: any = { next: null, prev: null, data: Symbol('sentinel') };
//   list.next = list.prev = list;

//   let tail = list;

//   for (const { el, tex } of nodes) {
//     const item = { math: tex, typesetRoot: el };
//     const link: any = { data: item, next: list, prev: tail };
//     tail.next = link;
//     list.prev = link;
//     tail = link;
//   }

//   return list;
// }

// it('annotateMathJax sets data-xlet-tex for each typesetRoot once', () => {
//   // create some fake mjx containers
//   const el1 = document.createElement('mjx-container');
//   const el2 = document.createElement('mjx-container');
//   document.body.append(el1, el2);

//   const list = makeList([
//     { el: el1, tex: 'E = mc^2' },
//     { el: el2, tex: '\\int_0^1 x^2 \\, dx' },
//   ]);

//   // install fake MathJax on this document's window
//   (document.defaultView as any).MathJax = {
//     startup: {
//       document: {
//         math: { list },
//       },
//     },
//   };

//   annotateMathJax(document);

//   expect(el1.getAttribute('data-xlet-tex')).toBe('E = mc^2');
//   expect(el2.getAttribute('data-xlet-tex')).toBe('\\int_0^1 x^2 \\, dx');
// });

// it('annotateMathJax does not overwrite existing data-xlet-tex', () => {
//   const el = document.createElement('mjx-container');
//   el.setAttribute('data-xlet-tex', 'ORIGINAL');
//   document.body.append(el);

//   const list = makeList([{ el, tex: 'NEW' }]);

//   (document.defaultView as any).MathJax = {
//     startup: { document: { math: { list } } },
//   };

//   annotateMathJax(document);

//   expect(el.getAttribute('data-xlet-tex')).toBe('ORIGINAL');
// });

// it('annotateMathJax dedupes when multiple MathItems share a typesetRoot', () => {
//   const el = document.createElement('mjx-container');
//   document.body.append(el);

//   const list = makeList([
//     { el, tex: 'first' },
//     { el, tex: 'second' }, // same root, different tex
//   ]);

//   (document.defaultView as any).MathJax = {
//     startup: { document: { math: { list } } },
//   };

//   annotateMathJax(document);

//   // define the semantics you want here:
//   // pick first, last, or assert we only touch it once
//   expect(el.getAttribute('data-xlet-tex')).toBe('first');
// });

import { isDoc, isElement, isNode, isNodeList } from './dom';
import {
  isArray, isBigInt, isBoolean, isDate, isError, isErrorEvent, isEvent,
  isFunction, isMap, isNumber, isObjectRecord, isPromise, isRegExp,
  isSet, isString, isSymbol, isURL,
} from './typing';

type LogOptions = {
  isDebug?: boolean;
  indent?: number;
  escapeWhitespace?: boolean;
  jsonifyStrings?: boolean;
  verboseNodes?: boolean;
}

export const lOpts: LogOptions =
  { isDebug: true, indent: 2, escapeWhitespace: true, jsonifyStrings: true, verboseNodes: true };

export function log(...args: unknown[]): void {
  const LogOptsKeys = ['isDebug', 'indent', 'escapeWhitespace', 'jsonifyStrings', 'verboseNodes'];
  const lastArg = args[args.length - 1];
  let opts: LogOptions = {};
  if (
    lastArg
    && typeof lastArg === 'object'
    && !Array.isArray(lastArg)
    && Object.keys(lastArg).length > 0
    && Object.keys(lastArg).every((key) => LogOptsKeys.includes(key))
  ) {
    opts = args.pop() as LogOptions;
  }

  const isDebug = (opts.isDebug === true) || (typeof process !== 'undefined' && process.env.DEBUG === 'true');
  const indent = opts.indent ?? 2;
  const escapeWhiteSpace = opts.escapeWhitespace ?? false;
  const jsonifyStrings = opts.jsonifyStrings ?? true;
  const verboseNodes = opts.verboseNodes ?? false;

  if (!isDebug) {
    return;
  }

  for (const arg of args) {
    let out;

    if (typeof arg === 'string') {
      out = jsonifyStrings ? JSON.stringify(arg).slice(1, -1) : arg;
    //} else if (arg && typeof arg === 'object' && typeof arg.nodeType === 'number') {
    } else if (isNode(arg)) {
      out = nodeSummary(arg);
    } else {
      try {
        out = JSON.stringify(arg, null, indent);
      } catch (err) {
        out = `[Unserializable object: ${err instanceof Error ? err.message : String(err)}]`;
      }
    }

    if (escapeWhiteSpace && typeof out === 'string') {
      out = out.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    }

    console.log(out); // eslint-disable-line no-restricted-properties
  }

  function nodeSummary(node: Node): string {
    if (verboseNodes && isElement(node)) {
      return node.outerHTML;
    }
    switch (node.nodeType) {
      case Node.ELEMENT_NODE: {
        let { tagName: tag, id, className: cls } = node as Element;
        tag = tag.toLowerCase();
        id = id ? `#${id}` : '';
        cls = cls ? `.${cls.trim().replace(/\s+/g, '.')}` : '';
        return `<${tag}${id}${cls}>`;
      }
      case Node.TEXT_NODE:
        return `#text "${node.textContent?.slice(0, 40) ?? ''}"`;
      case Node.COMMENT_NODE:
        return `<!-- ${node.textContent?.slice(0, 40) ?? ''} -->`;
      default:
        return `[${node.nodeName} type=${node.nodeType}]`;
    }
  }
}

// summarize unknown values for logging
export function repr(obj: unknown, max = 80): string {
  let out: string;
  try {
    if (obj === undefined) { out = 'undefined'; }
    else if (obj === null) { out = 'null'; }
    else if (isError(obj)) { out = `Error: ${obj.message}`; }
    else if (isErrorEvent(obj)) { out = `ErrorEvent: ${obj.message}`; }
    else if (isDate(obj)) { out = obj.toISOString(); }
    else if (isBigInt(obj)) { out = `${obj}n`; }
    else if (isSymbol(obj)) { out = String(obj); }
    else if (isFunction(obj)) { out = `function ${obj.name || '<anonymous>'}()`; }
    else if (isString(obj)) { out = obj; }
    else if (isNumber(obj)) { out = String(obj); }
    else if (isBoolean(obj)) { out = String(obj); }
    else if (isArray(obj)) { out = `Array(len=${obj.length})`; }
    else if (isMap(obj)) { out = `Map(size=${obj.size})`; }
    else if (isSet(obj)) { out = `Set(size=${obj.size})`; }
    else if (isPromise(obj)) { out = 'Promise'; }
    else if (isURL(obj)) { out = `URL(${obj.href})`; }
    else if (isRegExp(obj)) { out = obj.toString(); }
    else if (isEvent(obj)) { out = `Event(type=${obj.type})`; }
    else if (isDoc(obj)) { out = `Document(title="${obj.title}")`; }
    else if (isNodeList(obj)) { out = `NodeList(len=${obj.length})`; }
    else if (isElement(obj)) {
      const tag = obj.tagName.toLowerCase();
      const id = obj.id ? `#${obj.id}` : '';
      out = `<${tag}${id}>`;
    }
    else if (isNode(obj)) {
      out = obj.nodeType === Node.COMMENT_NODE
        ? 'CommentNode'
        : `[${obj.nodeName} type=${obj.nodeType}]`;
    }
    else if (isObjectRecord(obj)) {
      const ctor = obj.constructor.name;
      const name = ctor && ctor !== 'Object' ? ctor : 'Object';
      const content = `${name}(${Object.keys(obj).join(',')}`;
      out = `${content.length + 1 > max ? `${content.slice(0, max - 2)  }…` : content})`;
    }
    else { out = typeof obj; }
  } catch {
    return '<uninspectable>';
  }

  return out.length > max ? `${out.slice(0, max - 1)}…` : out;
}

export function warn<T>(val: T, ...args: Parameters<typeof console.warn>): T {
  console.warn(...args);
  return val;
}

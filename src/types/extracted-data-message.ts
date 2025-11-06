import type { SEResult } from '../sites/se.js';
import type { WikiResult } from '../sites/wiki.js';
import type { HubResult } from '../sites/hub.js';
import { hasOfType, isNonEmptyString, isNumber, isObjectRecord } from '../typing.js';

export type ExtractedDataMessage =
  | { type: 'hubResult'; result: HubResult; timestamp: number; }
  | { type: 'wikiResult'; result: WikiResult; timestamp: number; }
  | { type: 'seResult'; result: SEResult; timestamp: number; };

const ALLOWED_TYPES = new Set(['hubResult', 'wikiResult', 'seResult']);

export function isExtractedDataMessage(msg: unknown): msg is ExtractedDataMessage {
  if (!isObjectRecord(msg)) return false;

  if (!hasOfType(msg, 'type', isNonEmptyString)) return false;
  if (!ALLOWED_TYPES.has(msg.type)) return false;

  if (!hasOfType(msg, 'result', isObjectRecord)) return false;
  if (!hasOfType(msg, 'timestamp', isNumber)) return false;

  return true;
}

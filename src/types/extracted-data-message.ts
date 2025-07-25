import { SEResult } from '../se.js';
import { WikiResult } from '../wiki.js';

export type ExtractedDataMessage =
  | { type: 'wikiResult'; result: WikiResult, timestamp: number }
  | { type: 'seResult'; result: SEResult, timestamp: number };

export function isExtractedDataMessage(msg: any): msg is ExtractedDataMessage {
  if (typeof msg !== 'object' || msg === null) return false;
  if (msg.type !== 'wikiResult' && msg.type !== 'seResult') return false;
  if (typeof msg.result !== 'object' || msg.result === null) return false;
  if (typeof msg.timestamp !== 'number' || !Number.isFinite(msg.timestamp)) return false;
  return true;
}
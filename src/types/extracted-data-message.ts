import { SEResult } from '../se.js';
import { WikiResult } from '../wiki.js';
import { HubResult } from '../hub.js';

export type ExtractedDataMessage =
  | { type: 'hubResult'; result: HubResult, timestamp: number }
  | { type: 'wikiResult'; result: WikiResult, timestamp: number }
  | { type: 'seResult'; result: SEResult, timestamp: number };

export function isExtractedDataMessage(msg: any): msg is ExtractedDataMessage {
  if (typeof msg !== 'object' || msg === null) return false;
  if (msg.type !== 'wikiResult' && msg.type !== 'seResult' && msg.type !== 'hubResult') return false;
  if (typeof msg.result !== 'object' || msg.result === null) return false;
  if (typeof msg.timestamp !== 'number' || !Number.isFinite(msg.timestamp)) return false;
  return true;
}
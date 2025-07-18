import { SEResult } from '../se.js';
import { WikiResult } from '../wiki.js';

export type ExtractletMessage =
  | { type: 'wikiResult'; result: WikiResult }
  | { type: 'seResult'; result: SEResult }
  | { type: 'getLatestResult' };

export function isExtractletMessage(msg: any): msg is ExtractletMessage {
  return msg && (
    msg.type === 'wikiResult' ||
    msg.type === 'seResult' ||
    msg.type === 'getLatestResult'
  );
}
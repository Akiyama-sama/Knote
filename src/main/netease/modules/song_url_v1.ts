/**
 * Song stream URL (v1 endpoint, `level` instead of a raw bitrate).
 *
 * levels: standard / exhigh / lossless / hires / jyeffect / sky / jymaster.
 * Response: `{ code, data: [{ id, url, br, level, freeTrialInfo, ... }] }`
 * - url == null: VIP / unavailable
 * - freeTrialInfo != null: 30s trial fragment only
 */

import { createOption } from '../core/option';
import type { NeteaseModule } from '../core/types';

const songUrlV1: NeteaseModule = async (query, request) => {
  const data: Record<string, unknown> = {
    ids: `[${String(query.id ?? query.ids)}]`,
    level: String(query.level ?? 'exhigh'),
    encodeType: 'flac'
  };
  if (data.level === 'sky') {
    data.immerseType = 'c51';
  }
  // The player-url endpoint is the one NetEase risk-gates hardest: plain eapi requests get
  // answered with business code -460 for logged-in accounts, which the renderer surfaces as a
  // bogus "无法播放歌曲" modal. Send it through the android xeapi channel like upstream
  // SPlayer-Next does; the guest registration module already exercises that transport.
  return request('/api/song/enhance/player/url/v1', data, createOption(query, 'xeapi'));
};

export default songUrlV1;

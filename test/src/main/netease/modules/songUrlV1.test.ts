import { describe, expect, test, vi } from 'vitest';

import songUrlV1 from '../../../../../src/main/netease/modules/song_url_v1';

/**
 * Regression guard for the "-460 无法播放歌曲" bug: the player-url endpoint must go out through
 * the android xeapi channel. Plain eapi requests to it are risk-blocked with business code -460,
 * which the renderer turns into a bogus unplayable-song modal. Upstream SPlayer-Next sends this
 * exact endpoint with `createOption(query, "xeapi")`.
 */
describe('song_url_v1 module', () => {
  test('sends the request through the xeapi channel', async () => {
    const request = vi.fn(async () => ({ status: 200, body: { code: 200 }, cookie: [] }));

    await songUrlV1({ id: 123, level: 'standard' }, request as never);

    expect(request).toHaveBeenCalledTimes(1);
    const [uri, data, option] = request.mock.calls[0];
    expect(uri).toBe('/api/song/enhance/player/url/v1');
    expect(data).toMatchObject({ ids: '[123]', level: 'standard', encodeType: 'flac' });
    expect(option.crypto).toBe('xeapi');
  });

  test('defaults to exhigh and keeps sky immersive params', async () => {
    const request = vi.fn(async () => ({ status: 200, body: { code: 200 }, cookie: [] }));

    await songUrlV1({ id: 9, level: 'sky' }, request as never);

    const [, data] = request.mock.calls[0];
    expect(data).toMatchObject({ level: 'sky', immerseType: 'c51' });
  });
});

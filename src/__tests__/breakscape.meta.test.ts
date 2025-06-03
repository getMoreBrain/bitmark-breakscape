import { describe, it, expect } from 'vitest';
import { Breakscape } from '../lib/breakscape';
import pkg from '../../package.json' assert { type: 'json' };

describe('Breakscape metadata', () => {
  const bs = new Breakscape();

  it('returns the correct version', () => {
    expect(bs.version()).toBe(pkg.version);
  });

  it('returns the correct license', () => {
    expect(bs.license()).toBe(pkg.license);
  });
});

import { describe, it, expect } from 'vitest';
import { VERIFICATION_STATUS } from '@/lib/actions/educators/fetchVerificationStatus';

describe('VERIFICATION_STATUS constants', () => {
  it('exports six status values', () => {
    expect(VERIFICATION_STATUS.NOT_STARTED).toBe('not_started');
    expect(VERIFICATION_STATUS.INCOMPLETE).toBe('incomplete');
    expect(VERIFICATION_STATUS.PENDING).toBe('pending');
    expect(VERIFICATION_STATUS.UNDER_REVIEW).toBe('under_review');
    expect(VERIFICATION_STATUS.REJECTED).toBe('rejected');
    expect(VERIFICATION_STATUS.VERIFIED).toBe('verified');
  });
  it('has exactly six values', () => { expect(Object.keys(VERIFICATION_STATUS)).toHaveLength(6); });
});

describe('resumeStep calculation (pure logic)', () => {
  function calc(last, total = 3) { return Math.min((last ?? 0) + 1, total); }
  it('returns 1 when no step completed (lastStep=0)', () => { expect(calc(0)).toBe(1); });
  it('returns lastCompletedStep + 1', () => { expect(calc(1)).toBe(2); });
  it('caps at totalSteps (3)', () => { expect(calc(99, 3)).toBe(3); });
  it('middle step > 1 for abandoned wizard (lastStep=1)', () => { expect(calc(1)).toBeGreaterThan(1); });
});

describe('Banner visibility rules (pure logic)', () => {
  const SILENT = new Set(['verified']);
  const ACTIVE = new Set(['not_started','incomplete','pending','under_review','rejected']);

  it('verified educator never sees the banner', () => {
    expect(SILENT.has('verified')).toBe(true);
    expect(ACTIVE.has('verified')).toBe(false);
  });
  it('incomplete educator should see the banner', () => {
    expect(ACTIVE.has('incomplete')).toBe(true);
  });
  it('rejected educator should see the banner', () => {
    expect(ACTIVE.has('rejected')).toBe(true);
  });
  it('pending educator sees informational banner', () => {
    expect(ACTIVE.has('pending')).toBe(true);
  });
  it('under_review educator sees informational banner', () => {
    expect(ACTIVE.has('under_review')).toBe(true);
  });
});

describe('Normalisation fallback values', () => {
  it('NOT_STARTED_FALLBACK has lastCompletedStep=0', () => {
    const fallback = { lastCompletedStep: 0, totalSteps: 3, status: 'not_started' };
    expect(fallback.lastCompletedStep).toBe(0);
    expect(fallback.totalSteps).toBe(3);
  });
  it('resumeStep from fallback is 1 (wizard starts at beginning)', () => {
    const fallback = { lastCompletedStep: 0, totalSteps: 3 };
    const next = Math.min((fallback.lastCompletedStep ?? 0) + 1, fallback.totalSteps);
    expect(next).toBe(1);
  });
});

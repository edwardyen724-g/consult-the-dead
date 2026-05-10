import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import {
  canRedo,
  canUndo,
  commitHistory,
  createHistoryState,
  redoHistory,
  resetHistory,
  undoHistory,
} from './history';

describe('history primitives', () => {
  it('creates an empty reversible state around the initial present value', () => {
    const history = createHistoryState({ stage: 'start' });

    assert.deepEqual(history, {
      past: [],
      present: { stage: 'start' },
      future: [],
    });
    assert.equal(canUndo(history), false);
    assert.equal(canRedo(history), false);
  });

  it('commits new present values by pushing the previous present into past and clearing future', () => {
    const initial = createHistoryState({ stage: 'start' });
    const afterFirstCommit = commitHistory(initial, { stage: 'draft' });
    const afterSecondCommit = commitHistory(afterFirstCommit, { stage: 'final' });

    assert.deepEqual(afterFirstCommit, {
      past: [{ stage: 'start' }],
      present: { stage: 'draft' },
      future: [],
    });
    assert.deepEqual(afterSecondCommit, {
      past: [{ stage: 'start' }, { stage: 'draft' }],
      present: { stage: 'final' },
      future: [],
    });
  });

  it('treats an identical present value as a no-op commit', () => {
    const initial = createHistoryState('same');
    const committed = commitHistory(initial, 'same');

    assert.equal(committed, initial);
  });

  it('undoes and redoes across the full stack without mutating previous snapshots', () => {
    const first = createHistoryState('start');
    const second = commitHistory(first, 'middle');
    const third = commitHistory(second, 'end');

    const afterUndo = undoHistory(third);
    const afterSecondUndo = undoHistory(afterUndo);
    const afterRedo = redoHistory(afterSecondUndo);

    assert.deepEqual(afterUndo, {
      past: ['start'],
      present: 'middle',
      future: ['end'],
    });
    assert.deepEqual(afterSecondUndo, {
      past: [],
      present: 'start',
      future: ['middle', 'end'],
    });
    assert.deepEqual(afterRedo, {
      past: ['start'],
      present: 'middle',
      future: ['end'],
    });

    assert.equal(canUndo(first), false);
    assert.equal(canRedo(first), false);
    assert.equal(canUndo(third), true);
    assert.equal(canRedo(third), false);
  });

  it('no-ops when undo or redo is not possible and reset clears history', () => {
    const initial = createHistoryState('start');
    const afterReset = resetHistory('fresh');

    assert.equal(undoHistory(initial), initial);
    assert.equal(redoHistory(initial), initial);
    assert.deepEqual(afterReset, {
      past: [],
      present: 'fresh',
      future: [],
    });
  });
});

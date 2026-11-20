import { expect, test } from 'vitest';
import { commitGraph } from '../src/features/workspace/commitGraph';

const node = (sha: string, parents: string[]) => ({ sha, parents, message: sha, author: 'Author', date: '' });

test('keeps genuine merge lanes and reconnects shared ancestors across pages', () => {
  const pageOne = [node('merge', ['left', 'right']), node('left', ['base'])];
  const pending = commitGraph(pageOne);
  expect(pending[0].edges.filter(edge => edge.part === 'outgoing').map(edge => edge.to)).toEqual([0, 1]);
  const rows = commitGraph([...pageOne, node('base', []), node('right', ['base'])]);
  expect(rows.map(row => row.commit.sha)).toEqual(['merge', 'left', 'right', 'base']);
  const mergeBack = rows[2].edges.find(edge => edge.part === 'outgoing');
  expect(mergeBack?.to).toBe(rows[3].lane);
  expect(mergeBack?.from).not.toBe(mergeBack?.to);
});

test('linear history never fabricates a second lane', () => {
  const rows = commitGraph([node('newest', ['oldest']), node('oldest', [])]);
  expect(rows.map(row => row.width)).toEqual([1, 1]);
  expect(rows[1].edges).toEqual([{ from: 0, to: 0, part: 'incoming', color: 0 }]);
});

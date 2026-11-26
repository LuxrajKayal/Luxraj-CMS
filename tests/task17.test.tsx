import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';
import type { MemberHome, MemberRequest, MemberTask } from '../supabase/functions/_shared/member-contracts';
import { MemberLayout, MemberProfilePage, MemberTasksPage, MemberWorkstation } from '../src/features/people/MemberWorkspace';
import { AdminAccountPanel } from '../src/features/people/AdminAccountPanel';
import { AdminTasks } from '../src/features/people/AdminTasks';

const memberRequest = vi.hoisted(() => vi.fn());
vi.mock('../src/features/workspace/api', async original => ({
  ...await original<typeof import('../src/features/workspace/api')>(), memberRequest,
}));
vi.mock('../src/core/auth/AuthProvider', () => ({
  useAuth: () => ({ session: { user: { id: 'm1', email: 'member@example.test' }, access_token: 'session' }, loading: false }),
}));
vi.mock('../src/features/website-controls/ControlRunner', () => ({
  ControlRunner: () => <p>Existing HTML sandbox running</p>,
  controlInput: vi.fn(),
}));

const task: MemberTask = { id: 'TSK-25-11-2026-16-33', user_id: 'm1', task_type: 'Check work', description: 'Review source files',
  status: 'returned', comment: 'Add an example', created_at: '2026-11-25T11:03:00Z', submission_id: 'previous',
  active_review: null, commit_sha: null, commit_repository: null, commit_branch: null };
const home: MemberHome = {
  profile: { user_id: 'm1', full_name: 'Fixture Member', birth_date: '1990-01-01', gender: 'Unspecified',
    qualifications: 'Example', description: 'Fixture', role: 'advisor', disabled: false, picture_state: 'unset',
    pending_picture: null, approved_picture_url: null, picture_comment: '' },
  apps: [{ id: 'app', name: 'Fixture app' }], tasks: [task],
  drafts: [{ id: 'work', name: 'output.bin', mime: '', created_at: '2026-11-25T11:03:00Z' }],
};
const account = { id: 'm1', email: 'member@example.test', profile: home.profile };
afterEach(() => { cleanup(); memberRequest.mockReset(); });

function open(path: string) {
  render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route element={<MemberLayout />}>
      <Route path="/member/profile" element={<MemberProfilePage />} />
      <Route path="/member/workstation" element={<MemberWorkstation />} />
      <Route path="/member/tasks" element={<MemberTasksPage />} />
    </Route>
  </Routes></MemoryRouter>);
}

test('restricted workspace shows read-only profile, disables unassigned workstation and preserves assigned tasks', async () => {
  memberRequest.mockResolvedValue({ ...home, apps: [] });
  open('/member/profile');
  const field = await screen.findByLabelText<HTMLInputElement>('Full name');
  expect(field.readOnly).toBe(true);
  expect(screen.getByLabelText<HTMLInputElement>('User role').value).toBe('Advisor');
  expect(screen.queryByRole('link', { name: 'Workstation' })).toBeNull();
  expect(screen.queryByRole('link', { name: 'Repositories' })).toBeNull();
  fireEvent.click(screen.getByRole('link', { name: 'Tasks' }));
  expect(await screen.findByText('Returned for Correction')).toBeTruthy();
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Submit for Review' }).disabled).toBe(true);
});

test('a role member resubmits private draft IDs under the original task ID', async () => {
  let updatedHome: MemberHome=home;
  memberRequest.mockImplementation(async (request: MemberRequest) => {
    if (request.action === 'member_home') return updatedHome;
    if (request.action === 'member_progress') { updatedHome={...home,tasks:[{...task,status:request.status}],links:request.files.map(file_id=>({task_id:task.id,file_id}))};return {saved:true}; }
    if (request.action === 'member_submit') return { id: 'next-submission' };
    throw new Error('Unexpected request');
  });
  open('/member/tasks');
  fireEvent.change(await screen.findByRole('combobox', { name: 'Task ID' }), { target: { value: task.id } });
  fireEvent.click(screen.getByRole('checkbox', { name: /output.bin/ }));
  fireEvent.click(screen.getByRole('button', {name:'Mark Finished'}));
  await waitFor(()=>expect(screen.getByRole<HTMLButtonElement>('button',{name:'Submit for Review'}).disabled).toBe(false));
  fireEvent.click(screen.getByRole('button', { name: 'Submit for Review' }));
  await screen.findByText(task.id + ' submitted for review.');
  expect(memberRequest).toHaveBeenCalledWith({ action: 'member_submit', taskId: task.id, files: ['work'] });
});

test('manually created accounts can be assigned a profile without showing a password', async () => {
  const finish = vi.fn();
  memberRequest.mockResolvedValue({ id: 'm1' });
  render(<MemoryRouter><AdminAccountPanel account={{ ...account, profile: null }} finished={finish} /></MemoryRouter>);
  expect(screen.queryByLabelText('Assigned password')).toBeNull();
  const updates = { 'Full name': 'Manual Member', 'Date of birth': '1990-01-01', Gender: 'Unspecified', 'Educational qualifications': 'Example' };
  for (const [label, value] of Object.entries(updates)) fireEvent.change(screen.getByLabelText(label), { target: { value } });
  fireEvent.change(screen.getByLabelText('User role'), { target: { value: 'developer' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save account' }));
  await waitFor(() => expect(finish).toHaveBeenCalledOnce());
  expect(memberRequest).toHaveBeenCalledWith({ action: 'people_save', id: 'm1', fields: {
    full_name: 'Manual Member', birth_date: '1990-01-01', gender: 'Unspecified',
    qualifications: 'Example', description: '', role: 'developer', email: 'member@example.test',
  } });
});

test('Admins open submission files in Website Controls and can return, reject or terminate', async () => {
  let state = { ...task, status: 'submitted' as MemberTask['status'] };
  memberRequest.mockImplementation(async (request: MemberRequest) => {
    if (request.action === 'people_tasks') return { tasks: [state], submissions: [{
      id: task.submission_id, task_id: task.id, user_id: task.user_id, role: 'advisor',
      full_name: 'Fixture Member', created_at: task.created_at, seen: false, files: home.drafts,
    }] };
    if (request.action === 'people_decide') {
      state = { ...state, status: request.decision, comment: request.comment };
      return { saved: true };
    }
    throw new Error('Unexpected request');
  });
  render(<MemoryRouter><AdminTasks accounts={[account]} /></MemoryRouter>);
  const link = await screen.findByRole('link', { name: 'Open as Website Controls input' });
  expect(link.getAttribute('href')).toBe('/website-controls?submission=previous&file=work');
  const taskCard = screen.getByRole('heading', { name: /Submitted for Review/ }).closest('article')!;
  expect(within(taskCard).queryByRole('button', { name: /complete/i })).toBeNull();
  expect(within(taskCard).getByRole('button', { name: 'Reject' })).toBeTruthy();
  expect(within(taskCard).getByRole('button', { name: 'Terminate' })).toBeTruthy();
  fireEvent.change(within(taskCard).getByRole('textbox'), { target: { value: 'Add sources' } });
  fireEvent.click(within(taskCard).getByRole('button', { name: 'Return for Correction' }));
  await screen.findByText('Returned for Correction');
  expect(memberRequest).toHaveBeenCalledWith({ action: 'people_decide', taskId: task.id, submissionId: 'previous',
    decision: 'returned', comment: 'Add sources' });
});

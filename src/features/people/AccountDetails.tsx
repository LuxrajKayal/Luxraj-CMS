import type { MemberFields } from '../../../supabase/functions/_shared/member-contracts';
import { memberRoles } from '../../../supabase/functions/_shared/member-contracts';

export const roleName = { author: 'Author', developer: 'Developer', advisor: 'Advisor' };

export function AccountDetails({ fields, update }: { fields: MemberFields; update?(fields: MemberFields): void }) {
  function change<K extends keyof MemberFields>(key: K, value: MemberFields[K]) {
    update?.({ ...fields, [key]: value });
  }
  return <div className="people-fields">
    <label>Full name<input value={fields.full_name} readOnly={!update} required maxLength={150}
      onChange={event => change('full_name', event.target.value)} /></label>
    <label>Date of birth<input type="date" value={fields.birth_date} readOnly={!update} required
      onChange={event => change('birth_date', event.target.value)} /></label>
    <label>Gender<input value={fields.gender} readOnly={!update} required maxLength={100}
      onChange={event => change('gender', event.target.value)} /></label>
    <label>Educational qualifications<textarea value={fields.qualifications} readOnly={!update} required maxLength={2000}
      onChange={event => change('qualifications', event.target.value)} /></label>
    <label>User role{update ? <select value={fields.role} onChange={event => change('role', event.target.value as MemberFields['role'])}>
      {memberRoles.map(role => <option key={role} value={role}>{roleName[role]}</option>)}
    </select> : <input readOnly value={roleName[fields.role]} />}</label>
    <label>User description<textarea value={fields.description} readOnly={!update} maxLength={4000}
      onChange={event => change('description', event.target.value)} /></label>
    <label>Login email<input type="email" value={fields.email} readOnly={!update} required maxLength={254}
      onChange={event => change('email', event.target.value)} /></label>
  </div>;
}

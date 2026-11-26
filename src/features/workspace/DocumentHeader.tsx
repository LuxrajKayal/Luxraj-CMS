import { FileCode2, History, Lock, Pencil, Save, X } from 'lucide-react';

export function DocumentHeader({filename,dirty,readOnly,busy,canSave,canEdit=true,canReload=true,onToggle,onSave,onReload,onClose}:{
 filename:string;dirty:boolean;readOnly:boolean;busy:boolean;canSave:boolean;canEdit?:boolean;canReload?:boolean;
 onToggle():void;onSave():void;onReload():void;onClose?():void;
}){
 return <div className="ide-document-header">
  <div className="ide-document-tab"><FileCode2 size={16} aria-hidden="true"/><strong title={filename}>{filename.split('/').at(-1)}</strong>
  {dirty&&<span className="ide-dirty-mark" aria-hidden="true">●</span>}
  {onClose&&<button type="button" disabled={busy} aria-label="Close current file" title="Close file (unsaved edits are retained)" onClick={onClose}><X size={15} aria-hidden="true"/></button>}</div>
  <div className="ide-document-actions">
   <button type="button" disabled={busy||!canEdit} onClick={onToggle} title={readOnly?'Enable editing':'Read-only mode'}>{readOnly?<Pencil size={16} aria-hidden="true"/>:<Lock size={16} aria-hidden="true"/>}{readOnly?'Enable editing':'Read-only mode'}</button>
   <button type="button" disabled={busy||!canSave} onClick={onSave}><Save size={16} aria-hidden="true"/>Save draft</button>
   <button type="button" disabled={busy||!canReload} onClick={onReload}><History size={16} aria-hidden="true"/>Reopen saved draft</button>
  </div>
 </div>;
}

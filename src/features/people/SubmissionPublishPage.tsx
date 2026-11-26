import {lazy,Suspense,useEffect,useState} from 'react';
import {Link} from 'react-router';
import {DocumentHeader} from '../workspace/DocumentHeader';
import {decodeBytes,encodeBytes,filePath,sha256} from '../../../supabase/functions/_shared/file-bytes';
import {maxFileBytes,type FileInspection,type FilePayload} from '../../../supabase/functions/_shared/workspace-contracts';
import type {MemberOutput} from '../../../supabase/functions/_shared/member-contracts';
import {CompareFiles} from '../file-manager/FileComparison';
import {RepositoryFilePicker} from '../website-controls/RepositoryFilePicker';
import {useEditBuffers} from '../workspace/EditBuffers';
import {memberRequest,workspaceRequest,workspaceError} from '../workspace/api';
import {memberFile} from './memberFiles';
import '../website-controls/website-controls.css';

const MonacoSource=lazy(()=>import('../workspace/MonacoViews').then(m=>({default:m.MonacoSource})));
export function submittedText(file:MemberOutput):string|null{
  if(file.contents===null||file.size>1024*1024)return null;
  try{const value=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(decodeBytes(file.contents));
    return /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)?null:value;
  }catch{return null;}
}
export function submissionTarget(params:URLSearchParams){
 const submission=params.get('submission'),file=params.get('file');
 return submission&&file?{submission,file}:null;
}
export function SubmittedDraftEditor({submission,file,scope,onClose,onSaved,onName}:{submission:string;file:string;scope:{repositoryId:number;branch:string};onClose():void;onSaved(path:string):void;onName(name:string):void}){
  const {buffers,put,remove,positions,putPosition,editing,setEditing}=useEditBuffers();
  const [record,setRecord]=useState<{file:MemberOutput;taskId:string}>();
  useEffect(()=>{if(record)onName(record.file.name);},[record,onName]);
  const [error,setError]=useState(''),[busy,setBusy]=useState(''),[notice,setNotice]=useState('');
  const [destination,setDestination]=useState(''),[picker,setPicker]=useState(false);
  const [inspected,setInspected]=useState<{key:string;target:FileInspection;proposed:FilePayload}>();
  const [saved,setSaved]=useState(false);
  const [savedSource,setSavedSource]=useState('');
  const [showDestination,setShowDestination]=useState(false);
  const recoveryKey=JSON.stringify(['submission',submission,file]);
  const buffer=buffers[recoveryKey];
  const originalText=record?submittedText(record.file):null;
  const source=saved?savedSource:buffer?.source??originalText??'';
  const readOnly=!editing[recoveryKey]||saved;
  const key=JSON.stringify([scope,destination,source]);
  const validInspection=inspected?.key===key?inspected:undefined;
  useEffect(()=>{
    const controller=new AbortController();
    if(!submission||!file){setError('Select a submitted file in Pending Reviews.');return;}
    memberRequest({action:'people_submission_file',submissionId:submission,fileId:file},controller.signal).then(async r=>{
      await memberFile(r.file);
      if(!controller.signal.aborted){setRecord(r);setDestination(r.file.name);}
    }).catch(f=>{if(!controller.signal.aborted)setError(f instanceof Error&&['invalid_submission_path','submission_editor_unsupported','submission_editor_conflict','submission_size'].includes(f.message)?f.message:workspaceError(f));});
    return()=>controller.abort();
  },[submission,file]);
  function edit(value:string){
    if(readOnly||busy)return;
    if(value===originalText)remove(recoveryKey);
    else put(recoveryKey,{source:value,commit:record?.file.sha256??'',revision:null});
    setInspected(undefined);
  }
  async function inspect(){
    if(!scope||!record||busy)return;
    setError('');setNotice('');setInspected(undefined);setBusy('Inspecting destination…');
    try{
      const path=destination.split('/');
      if(!destination||!filePath(path))throw new Error('invalid_submission_path');
      if(originalText===null)throw new Error('submission_editor_unsupported');
      if(buffers[JSON.stringify([scope.repositoryId,scope.branch,destination])])throw new Error('submission_editor_conflict');
      const bytes=source!==originalText?new TextEncoder().encode(source):decodeBytes(record.file.contents!);
      if(bytes.length>maxFileBytes||(bytes.length>1024*1024))throw new Error('submission_size');
      const proposed={size:bytes.length,mime:record.file.mime,sha256:await sha256(bytes),contents:encodeBytes(bytes)};
      const root=await workspaceRequest({action:'file_manager_tree',...scope,path:[],includeExecutables:true});
      const target=await workspaceRequest({action:'file_inspect',...scope,path,commit:root.commit});
      setInspected({key,target,proposed});
    }catch(f){setError(f instanceof Error&&['invalid_submission_path','submission_editor_unsupported','submission_editor_conflict','submission_size'].includes(f.message)?f.message:workspaceError(f));}finally{setBusy('');}
  }
  async function stage(){
    if(!scope||!validInspection||!record||busy||saved)return;
    setError('');setBusy('Saving task-linked draft…');
    try{
      if(buffers[JSON.stringify([scope.repositoryId,scope.branch,destination])])throw new Error('submission_editor_conflict');
      const {target,proposed}=validInspection;
      await workspaceRequest({action:'file_save',...scope,path:destination.split('/'),commit:target.commit,originalBlob:target.original?.blob??null,
        size:proposed.size,mime:proposed.mime,sha256:proposed.sha256!,contents:proposed.contents!,
        origin:'member_submission',submissionId:submission,submissionFileId:file});
      setSavedSource(source);remove(recoveryKey,buffer);setShowDestination(false);
      setSaved(true);onSaved(destination);setNotice('Task-linked draft saved. Confirm its commit in Source Control to complete '+record.taskId+'.');
    }catch(f){setError(f instanceof Error&&['invalid_submission_path','submission_editor_unsupported','submission_editor_conflict','submission_size'].includes(f.message)?f.message:workspaceError(f));}finally{setBusy('');}
  }
  const localErrors:Record<string,string>={invalid_submission_path:'Enter a valid repository destination path.',submission_editor_unsupported:'This file is not supported by Code Editor. Use File Manager.',submission_editor_conflict:'Resolve unsaved Code Editor changes at this destination first.',submission_size:'The file exceeds the supported editor or upload size.'};
  const message=localErrors[error]??error;

  return <>
    {!record?<><p role={error?'alert':'status'}>{message||'Loading immutable submitted file…'}</p><button type="button" onClick={onClose}>Close submitted file</button></>:<>
      <DocumentHeader filename={record.file.name} dirty={!!buffer} readOnly={readOnly} busy={!!busy}
        canSave={!saved&&originalText!==null} canEdit={!saved&&originalText!==null} canReload={!saved}
        onToggle={()=>setEditing(recoveryKey,readOnly)} onSave={()=>setShowDestination(true)}
        onReload={()=>{if(buffer&&!window.confirm('Discard unsaved edits and reopen the original submission?'))return;remove(recoveryKey);setInspected(undefined);setError('');}} onClose={onClose}/>
      <div className="ide-document-path"><nav aria-label="Document path"><span>Submitted files / {record.file.name}</span><span>{record.taskId}</span></nav><span className="ide-document-state" role="status">{busy||(saved?'Draft saved · '+destination:buffer?'Unsaved changes':'Original submitted file')}</span></div>
      {error&&<p className="workspace-alert" role="alert">{message}</p>}
      {notice&&<p className="workspace-notice" role="status">{notice} <Link to="/source-control">Review and commit</Link></p>}
      {originalText===null?<p>Binary, invalid UTF-8 or over 1 MiB. <Link to={'/file-manager?'+new URLSearchParams({submission,file})}>Open in File Manager</Link></p>:
        <Suspense fallback={<p role="status">Loading editor…</p>}><MonacoSource path={record.file.name} source={source} readOnly={readOnly||!!busy} onChange={edit} initialPosition={positions[recoveryKey]} onPositionChange={p=>putPosition(recoveryKey,p)}/></Suspense>}
      {showDestination&&!saved&&<section className="ide-submission-destination" aria-label="Publishing destination">
        <div className="workspace-actions"><strong>Save draft to repository</strong><button type="button" disabled={!!busy} onClick={()=>setShowDestination(false)}>Cancel</button></div>
        <p>Choose the final path on the selected branch. The original submission remains unchanged.</p>
        <label>Destination path<input value={destination} disabled={!!busy} onChange={e=>{setDestination(e.target.value);setInspected(undefined);}}/></label>
        <div className="workspace-actions"><button type="button" disabled={!!busy} onClick={()=>setPicker(true)}>Browse destination</button><button type="button" disabled={!!busy||!destination} onClick={()=>void inspect()}>Inspect destination</button></div>
        {validInspection&&<><CompareFiles path={destination} original={validInspection.target.original} proposed={validInspection.proposed}/><button type="button" disabled={!!busy} onClick={()=>void stage()}>Save Draft for Commit</button></>}
        {picker&&<RepositoryFilePicker scope={scope} label="Choose publishing destination" destination={destination} onCancel={()=>setPicker(false)} onPick={paths=>{setDestination(paths[0]);setInspected(undefined);setPicker(false);}}/>}
      </section>}
    </>}
  </>;
}

import {lazy,Suspense,useEffect,useState} from 'react';
import {Link,useSearchParams} from 'react-router';
import {decodeBytes,encodeBytes,filePath,sha256} from '../../../supabase/functions/_shared/file-bytes';
import {maxFileBytes,type FileInspection,type FilePayload} from '../../../supabase/functions/_shared/workspace-contracts';
import type {MemberOutput} from '../../../supabase/functions/_shared/member-contracts';
import {ModuleTopbar} from '../../shared/ui/ModuleChrome';
import {FileWorkspacePicker} from '../file-manager/FileDestination';
import {CompareFiles,FileSide} from '../file-manager/FileComparison';
import {RepositoryFilePicker} from '../website-controls/RepositoryFilePicker';
import {useWorkspace} from '../workspace/WorkspaceLayout';
import {useEditBuffers} from '../workspace/EditBuffers';
import {memberRequest,workspaceRequest,workspaceError} from '../workspace/api';
import {memberFile} from './memberFiles';
import './people.css';

const MonacoSource=lazy(()=>import('../workspace/MonacoViews').then(m=>({default:m.MonacoSource})));
export function submittedText(file:MemberOutput):string|null{
  if(file.contents===null||file.size>1024*1024)return null;
  try{const value=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(decodeBytes(file.contents));
    return /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)?null:value;
  }catch{return null;}
}
export default function SubmissionPublishPage({editor=false}:{editor?:boolean}){
  const [params]=useSearchParams();
  const submission=params.get('submission')??'',file=params.get('file')??'';
  return <SubmissionFile key={JSON.stringify([submission,file,editor])} {...{submission,file,editor}} prepare={params.get('prepare')==='1'}/>;
}
function SubmissionFile({submission,file,editor,prepare}:{submission:string;file:string;editor:boolean;prepare:boolean}){
  const {workspace:{selection,repositories},saving}=useWorkspace();
  const {buffers,put,remove}=useEditBuffers();
  const [record,setRecord]=useState<{file:MemberOutput;taskId:string}>();
  const [error,setError]=useState(''),[busy,setBusy]=useState(''),[notice,setNotice]=useState('');
  const [destination,setDestination]=useState(''),[picker,setPicker]=useState(false);
  const [inspected,setInspected]=useState<{key:string;target:FileInspection;proposed:FilePayload}>();
  const [saved,setSaved]=useState(false);
  const recoveryKey=JSON.stringify(['submission',submission,file]);
  const buffer=buffers[recoveryKey];
  const originalText=record?submittedText(record.file):null;
  const source=buffer?.source??originalText??'';
  const scope=selection?.branch?{repositoryId:selection.repositoryId,branch:selection.branch}:null;
  const key=JSON.stringify([scope,destination,editor?source:null]);
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
    if(value===originalText)remove(recoveryKey);
    else put(recoveryKey,{source:value,commit:record?.file.sha256??'',revision:null});
    setInspected(undefined);
  }
  async function inspect(){
    if(!scope||!record||busy||saving)return;
    setError('');setNotice('');setInspected(undefined);setBusy('Inspecting destination…');
    try{
      const path=destination.split('/');
      if(!destination||!filePath(path))throw new Error('invalid_submission_path');
      if(editor&&originalText===null)throw new Error('submission_editor_unsupported');
      if(buffers[JSON.stringify([scope.repositoryId,scope.branch,destination])])throw new Error('submission_editor_conflict');
      const bytes=editor&&source!==originalText?new TextEncoder().encode(source):decodeBytes(record.file.contents!);
      if(bytes.length>maxFileBytes||(editor&&bytes.length>1024*1024))throw new Error('submission_size');
      const proposed={size:bytes.length,mime:record.file.mime,sha256:await sha256(bytes),contents:encodeBytes(bytes)};
      const root=await workspaceRequest({action:'file_manager_tree',...scope,path:[],includeExecutables:true});
      const target=await workspaceRequest({action:'file_inspect',...scope,path,commit:root.commit});
      setInspected({key,target,proposed});
    }catch(f){setError(f instanceof Error&&['invalid_submission_path','submission_editor_unsupported','submission_editor_conflict','submission_size'].includes(f.message)?f.message:workspaceError(f));}finally{setBusy('');}
  }
  async function stage(){
    if(!scope||!validInspection||!record||busy||saving||saved)return;
    setError('');setBusy('Saving task-linked draft…');
    try{
      if(buffers[JSON.stringify([scope.repositoryId,scope.branch,destination])])throw new Error('submission_editor_conflict');
      const {target,proposed}=validInspection;
      await workspaceRequest({action:'file_save',...scope,path:destination.split('/'),commit:target.commit,originalBlob:target.original?.blob??null,
        size:proposed.size,mime:proposed.mime,sha256:proposed.sha256!,contents:proposed.contents!,
        origin:'member_submission',submissionId:submission,submissionFileId:file});
      if(editor)remove(recoveryKey);
      setSaved(true);setNotice('Task-linked draft saved. Confirm its commit in Source Control to complete '+record.taskId+'.');
    }catch(f){setError(f instanceof Error&&['invalid_submission_path','submission_editor_unsupported','submission_editor_conflict','submission_size'].includes(f.message)?f.message:workspaceError(f));}finally{setBusy('');}
  }
  const localErrors:Record<string,string>={invalid_submission_path:'Enter a valid repository destination path.',submission_editor_unsupported:'This file is not supported by Code Editor. Use File Manager.',submission_editor_conflict:'Resolve unsaved Code Editor changes at this destination first.',submission_size:'The file exceeds the supported editor or upload size.'};
  const message=localErrors[error]??error;
  const repo=repositories.find(r=>r.id===scope?.repositoryId);
  return <div className="module-stack"><ModuleTopbar title={editor?'Code Editor — Submitted draft':prepare?'Prepare for Commit':'File Manager — Submitted draft'}><FileWorkspacePicker disabled={!!busy||saved}/></ModuleTopbar>
    <div className="module-body people-page">
      <div className="people-toolbar"><Link to={'/pending-reviews?submission='+encodeURIComponent(submission)}>Back to Pending Reviews</Link>{saved&&<Link to="/source-control">Review and commit in Source Control</Link>}</div>
      {error&&<p role="alert">{message}</p>}{busy&&<p role="status">{busy}</p>}{notice&&<p role="status">{notice}</p>}
      {!record&&!error&&<p role="status">Loading immutable submitted file…</p>}
      {record&&<><section className="people-panel"><h2>{record.file.name}</h2><p><strong>Task ID:</strong> {record.taskId} · Original submission remains unchanged.</p>
        {editor?<>{originalText===null?<p>This file is binary, invalid UTF-8 or exceeds the 1 MiB editor limit. <Link to={'/file-manager/submission?'+paramsFor(submission,file)}>Open in File Manager</Link></p>:
          <><p>{buffer?'Unsaved changes (retained in this browser session)':'Original submitted text'}</p><div style={{height:'min(55vh, 32rem)',minHeight:'16rem'}}><Suspense fallback={<p role="status">Loading Code Editor…</p>}><MonacoSource path={record.file.name} source={source} readOnly={!!busy||saved} onChange={edit}/></Suspense></div>{buffer&&!saved&&<button type="button" disabled={!!busy} onClick={()=>edit(originalText)}>Discard editor changes</button>}</>}</>:<FileSide name="Submitted file" path={record.file.name} value={record.file}/>}
      </section>
      {(!editor||originalText!==null)&&!saved&&<section className="people-panel"><h2>Publishing destination</h2><p>{repo&&scope?repo.name+' / '+scope.branch:'Select a repository and branch above.'}</p>
        <label>Destination path<input value={destination} disabled={!!busy||saving} onChange={e=>{setDestination(e.target.value);setInspected(undefined);}}/></label>
        <div className="people-toolbar"><button type="button" disabled={!scope||!!busy||saving} onClick={()=>setPicker(true)}>Browse destination</button><button type="button" disabled={!scope||!!busy||saving||!destination} onClick={()=>void inspect()}>Inspect destination</button></div>
        {validInspection&&<><CompareFiles path={destination} original={validInspection.target.original} proposed={validInspection.proposed}/><button className="people-primary" type="button" disabled={!!busy||saving} onClick={()=>void stage()}>Save Draft for Commit</button></>}
        {picker&&scope&&<RepositoryFilePicker scope={scope} label="Choose publishing destination" destination={destination} onCancel={()=>setPicker(false)} onPick={paths=>{setDestination(paths[0]);setInspected(undefined);setPicker(false);}}/>}
      </section>}</>}
    </div></div>;
}
function paramsFor(submission:string,file:string){return new URLSearchParams({submission,file}).toString();}

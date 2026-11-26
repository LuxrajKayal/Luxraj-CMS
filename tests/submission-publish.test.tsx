import {cleanup,fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import {MemoryRouter,Route,Routes} from 'react-router';
import {afterEach,beforeEach,expect,test,vi} from 'vitest';
import {webcrypto} from 'node:crypto';
import {encodeBytes,sha256} from '../supabase/functions/_shared/file-bytes';
import {CodeEditorPage} from '../src/features/workspace/CodeEditorPage';
import FileManagerPage from '../src/features/file-manager/FileManagerPage';
import {EditBuffers} from '../src/features/workspace/EditBuffers';
const requests=vi.hoisted(()=>({member:vi.fn(),workspace:vi.fn()}));
vi.mock('../src/core/auth/AuthProvider',()=>({useAuth:()=>({session:{user:{id:'owner-submission-test'}}})}));
vi.mock('../src/features/workspace/api',()=>({memberRequest:requests.member,workspaceRequest:requests.workspace,workspaceError:(error:Error)=>error.message}));
vi.mock('../src/features/workspace/WorkspaceLayout',()=>({useWorkspace:()=>({workspace:{selection:{repositoryId:7,branch:'test'},repositories:[{id:7,name:'owner/site'}],branches:['test']},saving:false,select:vi.fn(),refresh:vi.fn()}),BranchPicker:()=>null}));
vi.mock('../src/features/workspace/MonacoViews',()=>({MonacoSource:({source,readOnly,onChange}:{source:string;readOnly:boolean;onChange(value:string):void})=><textarea aria-label="Monaco source" value={source} readOnly={readOnly} onChange={e=>onChange(e.target.value)}/>,MonacoDiff:()=>null}));
beforeEach(()=>{vi.stubGlobal('crypto',webcrypto);sessionStorage.clear();});
afterEach(()=>{cleanup();vi.resetAllMocks();vi.unstubAllGlobals();sessionStorage.clear();});
const taskId='TSK-25-11-2026-16-33';
const head='a'.repeat(40);
async function fixture(name:string,bytes:Uint8Array,mime:string){
 const file={id:'file-a',name,size:bytes.length,sha256:await sha256(bytes),mime,contents:encodeBytes(bytes)};
 requests.member.mockResolvedValue({file,taskId});
 let saved:object|undefined;
 requests.workspace.mockImplementation(async(req:{action:string;path?:string[];sha256?:string;contents?:string;size?:number;mime?:string})=>{
   if(req.action==='tree'||req.action==='file_manager_tree')return {commit:head,entries:[{name:'index.html',kind:'file'}]};
   if(req.action==='open_draft')return {current:{source:'<h1>Existing</h1>',blob:'b'.repeat(40),commit:head},draft:null};
   if(req.action==='file_inspect')return {commit:head,original:null};
   if(req.action==='changes')return {files:saved?[saved]:[],maximumFiles:20};
   if(req.action==='file_drafts')return {drafts:saved?[saved]:[]};
   if(req.action==='file_save'){saved={path:req.path!.join('/'),revision:'saved-revision',file:true,taskId,origin:'member_submission',originalBlob:null,committedSha:null,sha256:req.sha256,mime:req.mime,size:req.size,updatedAt:''};return {draft:saved};}
   if(req.action==='diff')return {kind:'file',revision:'saved-revision'};
   if(req.action==='file_comparison')return {draft:saved,original:null,proposed:{size:bytes.length,sha256:file.sha256,mime:file.mime,contents:file.contents}};
   throw Error('Unexpected action '+req.action);
 });
 return file;
}
function open(path:string){
 return render(<MemoryRouter initialEntries={[path]}><EditBuffers><Routes><Route path="/code-editor" element={<CodeEditorPage/>}/><Route path="/file-manager" element={<FileManagerPage/>}/></Routes></EditBuffers></MemoryRouter>);
}
test('submitted JSON opens in the actual Code Editor with Explorer and native controls, then saves its edited bytes with task association',async()=>{
 const initial='{"title":"Author draft"}';
 const changed='{"title":"Reviewed draft"}';
 await fixture('article.json',new TextEncoder().encode(initial),'application/json');
 open('/code-editor?submission=sub-a&file=file-a');
 expect(await screen.findByRole('navigation',{name:'Editor activity'})).toBeTruthy();
 expect(screen.getByRole('button',{name:'File explorer'})).toBeTruthy();
 const text=await screen.findByRole<HTMLTextAreaElement>('textbox',{name:'Monaco source'});
 expect(text.value).toBe(initial);
 expect(text.readOnly).toBe(true);
 expect(screen.getByText(taskId)).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Enable editing'}));
 fireEvent.change(text,{target:{value:changed}});
 // Repository browsing remains available without losing the submitted document.
 fireEvent.click(await screen.findByRole('button',{name:'index.html'}));
 await waitFor(()=>expect(screen.getByRole<HTMLTextAreaElement>('textbox',{name:'Monaco source'}).value).toBe('<h1>Existing</h1>'));
 fireEvent.click(screen.getByRole('button',{name:'article.json'}));
 expect(screen.getByRole<HTMLTextAreaElement>('textbox',{name:'Monaco source'}).value).toBe(changed);
 fireEvent.click(screen.getByRole('button',{name:'Save draft'}));
 fireEvent.change(screen.getByLabelText('Destination path'),{target:{value:'articles/article.json'}});
 fireEvent.click(screen.getByRole('button',{name:'Inspect destination'}));
 const save=await screen.findByRole('button',{name:'Save Draft for Commit'});
 expect(requests.workspace.mock.calls.some(([req])=>req.action==='file_save')).toBe(false);
 fireEvent.click(save);
 const bytes=new TextEncoder().encode(changed);
 await waitFor(async()=>expect(requests.workspace).toHaveBeenCalledWith({action:'file_save',repositoryId:7,branch:'test',path:['articles','article.json'],commit:head,originalBlob:null,size:bytes.length,mime:'application/json',sha256:await sha256(bytes),contents:encodeBytes(bytes),origin:'member_submission',submissionId:'sub-a',submissionFileId:'file-a'}));
 await screen.findByRole('button',{name:/articles\/article.json/});
 expect(requests.workspace.mock.calls.some(([req])=>req.action==='confirm_commit')).toBe(false);
});
test('submitted binary enters the real File Manager upload queue and stages exact bytes with Task ID',async()=>{
 const bytes=Uint8Array.of(0,128,255,12);
 const file=await fixture('asset.dat',bytes,'application/octet-stream');
 open('/file-manager?submission=sub-a&file=file-a&prepare=1');
 const queue=await screen.findByRole('region',{name:'Upload queue'});
 expect(within(queue).getByText('Submitted draft · '+taskId)).toBeTruthy();
 expect(screen.getByLabelText('Upload files')).toBeTruthy();
 expect(screen.getByRole('region',{name:'Destination folder'})).toBeTruthy();
 fireEvent.change(within(queue).getByLabelText('Destination filename'),{target:{value:'reviewed.dat'}});
 fireEvent.click(within(queue).getByRole('button',{name:'Inspect reviewed.dat'}));
 fireEvent.click(await within(queue).findByRole('button',{name:'Save Draft'}));
 await screen.findByText('1 of 1 file drafts saved. Review saved files in Source Control.');
 expect(requests.workspace).toHaveBeenCalledWith({action:'file_save',repositoryId:7,branch:'test',path:['reviewed.dat'],commit:head,originalBlob:null,size:bytes.length,mime:file.mime,sha256:file.sha256,contents:file.contents,origin:'member_submission',submissionId:'sub-a',submissionFileId:'file-a'},expect.any(AbortSignal));
 expect(screen.queryByRole('region',{name:'Upload queue'})).toBeNull();
 expect(requests.workspace.mock.calls.some(([req])=>req.action==='confirm_commit')).toBe(false);
});

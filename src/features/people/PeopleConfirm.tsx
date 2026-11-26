import {useState,useRef,useEffect} from 'react';
export function usePeopleConfirm(){
 const [question,setQuestion]=useState<{message:string;resolve:(answer:boolean)=>void}>();
 const dialog=useRef<HTMLDialogElement>(null);
 const pending=useRef<typeof question>(undefined);
 useEffect(()=>()=>pending.current?.resolve(false),[]);
 useEffect(()=>{if(question&&dialog.current){const el=dialog.current;if(typeof el.showModal==='function')el.showModal();else el.setAttribute('open','');}},[question]);
 function confirm(message:string){pending.current?.resolve(false);return new Promise<boolean>(resolve=>{const next={message,resolve};pending.current=next;setQuestion(next);});}
 function answer(value:boolean){question?.resolve(value);pending.current=undefined;setQuestion(undefined);}
 const confirmation=question?<dialog ref={dialog} className="people-confirm" aria-label="Confirm action" onCancel={e=>{e.preventDefault();answer(false);}}><h2>Confirm action</h2><p>{question.message}</p><div className="people-toolbar"><button type="button" autoFocus onClick={()=>answer(false)}>Cancel</button><button type="button" className="people-danger" onClick={()=>answer(true)}>Confirm</button></div></dialog>:null;
 return {confirm,confirmation};
}

'use client';
import {useRef,useEffect,useId,type ReactNode} from 'react';
import {X} from './Icons';
export default function Modal({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}){
  const ref=useRef<HTMLDialogElement>(null),headingRef=useRef<HTMLHeadingElement>(null),titleId=useId();
  useEffect(()=>{
    const dialog=ref.current,previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    if(dialog&&!dialog.open)dialog.showModal();
    headingRef.current?.focus({preventScroll:true});
    return()=>{dialog?.close();if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[]);
  // Native modal dialogs contain keyboard focus, including disabled fieldsets and radio groups.
  return <dialog ref={ref} className="modal-dialog interaction-modal" aria-labelledby={titleId} onCancel={e=>{e.preventDefault();onClose();}}>
    <div className="modal"><div className="modal-head"><h2 id={titleId} ref={headingRef} tabIndex={-1}>{title}</h2><button type="button" className="icon-button" aria-label="닫기" onClick={onClose}><X size={20} aria-hidden="true"/></button></div>{children}</div>
  </dialog>;
}

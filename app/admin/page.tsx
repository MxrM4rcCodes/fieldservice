"use client";
import { useEffect, useState } from "react"; import Link from "next/link";
export default function Admin() { const [d,setD]=useState<any>(null); const [err,setErr]=useState(""); const [msg,setMsg]=useState("");
 const [lessonEdit,setLessonEdit]=useState<any>({id:"",title:"",summary:""}); const [qform,setQform]=useState<any>({lessonSlug:"day-1-cgs-oris-field-service",prompt:"",choices:["","","",""],answer:0,explanation:"",reviewHint:""});
 const [card,setCard]=useState<any>({term:"",definition:"",category:"Printer Hardware"}); const [refEdit,setRefEdit]=useState<any>({id:"",title:"",note:""});
 function load(){ fetch("/api/admin").then(async r=>{ const j=await r.json(); if(!r.ok) return setErr(j.error||"Admin access denied"); setD(j); }); }
 useEffect(load,[]);
 async function post(body:any){ const res=await fetch("/api/admin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); const j=await res.json(); if(!res.ok) return setMsg(j.error||"Failed"); setMsg("Saved. Revision recorded."); load(); }
 if(err) return (<div><h1>Content Administration</h1><p role="alert" style={{color:"#FF8A8A"}}>{err}</p><p className="muted">This area is admin-only and enforced on the server (not merely hidden). <Link href="/dashboard">Back to Dashboard</Link></p></div>);
 if(!d) return <p>Loading admin…</p>;
 return (<div><h1>Content Administration</h1><p className="muted">Admin-only, server-enforced. Every change writes a content revision. Learners cannot reach this API (403) — see Tests.</p>{msg&&<p role="status" style={{color:"#3ECF8E"}}>{msg}</p>}
 <p className="small">Content: {d.lessons.length} lessons · {d.questionCount} quiz questions · {d.cardCount} flashcards · {d.scenarios.length} scenarios · {d.userCount} user accounts</p>
 <section className="card" style={{padding:16}}><h2 style={{marginTop:0}}>Edit a lesson (title / summary)</h2>
  <select className="input" value={lessonEdit.id} onChange={e=>{ const l=d.lessons.find((x:any)=>x.id===e.target.value); setLessonEdit(l?{id:l.id,title:l.title,summary:l.summary}:{id:"",title:"",summary:""}); }}><option value="">Select lesson…</option>{d.lessons.map((l:any)=><option key={l.id} value={l.id}>Day {l.day}: {l.title}</option>)}</select>
  <label className="small">Title<input className="input" value={lessonEdit.title} onChange={e=>setLessonEdit({...lessonEdit,title:e.target.value})}/></label>
  <label className="small">Summary<textarea className="input" rows={3} value={lessonEdit.summary} onChange={e=>setLessonEdit({...lessonEdit,summary:e.target.value})}/></label>
  <button className="btn" disabled={!lessonEdit.id} onClick={()=>post({action:"updateLesson",...lessonEdit})}>Save lesson edit</button></section>
 <section className="card" style={{padding:16,marginTop:12}}><h2 style={{marginTop:0}}>Add a quiz question</h2>
  <label className="small">Lesson slug<input className="input" value={qform.lessonSlug} onChange={e=>setQform({...qform,lessonSlug:e.target.value})}/></label>
  <label className="small">Prompt<input className="input" value={qform.prompt} onChange={e=>setQform({...qform,prompt:e.target.value})}/></label>
  {qform.choices.map((c:string,i:number)=>(<label key={i} className="small">Choice {i+1} {i===qform.answer?"(correct)":""}<input className="input" value={c} onChange={e=>{const ch=[...qform.choices];ch[i]=e.target.value;setQform({...qform,choices:ch});}}/></label>))}
  <label className="small">Correct choice index (0–3)<input className="input" type="number" min={0} max={3} value={qform.answer} onChange={e=>setQform({...qform,answer:+e.target.value})}/></label>
  <label className="small">Explanation<textarea className="input" rows={2} value={qform.explanation} onChange={e=>setQform({...qform,explanation:e.target.value})}/></label>
  <button className="btn" onClick={()=>post({action:"addQuestion",...qform})}>Add question</button></section>
 <section className="card" style={{padding:16,marginTop:12}}><h2 style={{marginTop:0}}>Add a flashcard</h2>
  <label className="small">Term<input className="input" value={card.term} onChange={e=>setCard({...card,term:e.target.value})}/></label>
  <label className="small">Definition<textarea className="input" rows={2} value={card.definition} onChange={e=>setCard({...card,definition:e.target.value})}/></label>
  <label className="small">Category<input className="input" value={card.category} onChange={e=>setCard({...card,category:e.target.value})}/></label>
  <button className="btn" onClick={()=>post({action:"addCard",...card})}>Add flashcard</button></section>
 <section className="card" style={{padding:16,marginTop:12}}><h2 style={{marginTop:0}}>Source references</h2>
  {d.refs.map((r:any)=>(<p key={r.id} className="small"><button className="btn2" onClick={()=>setRefEdit({id:r.id,title:r.title,note:r.note})}>Edit</button> <strong>{r.title}</strong> — {r.note}</p>))}
  <label className="small">Title<input className="input" value={refEdit.title} onChange={e=>setRefEdit({...refEdit,title:e.target.value})}/></label>
  <label className="small">Note<textarea className="input" rows={2} value={refEdit.note} onChange={e=>setRefEdit({...refEdit,note:e.target.value})}/></label>
  <button className="btn" disabled={!refEdit.id} onClick={()=>post({action:"updateRef",...refEdit})}>Save reference</button></section>
 <section className="card" style={{padding:16,marginTop:12}}><h2 style={{marginTop:0}}>Content revision history</h2>{d.revisions.length? d.revisions.map((r:any)=><p key={r.id} className="small">{new Date(r.created_at).toLocaleString()} · {r.entity} · {r.summary}</p>) : <p className="muted">No revisions yet.</p>}</section>
 <section className="card" style={{padding:16,marginTop:12}}><h2 style={{marginTop:0}}>Scenario structure (read-only overview)</h2><p className="small">Scenario nodes/choices are seeded from versioned content files (lib/content/scenarios.ts) and executed by the server engine; edit them in code review so branching stays test-covered. {d.scenarios.map((s:any)=>s.title).join(" · ")}</p></section></div>); }

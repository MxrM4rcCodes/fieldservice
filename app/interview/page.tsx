"use client";
import { useEffect, useMemo, useState } from "react"; import Link from "next/link";
import { RUBRIC } from "@/lib/scoring";
export default function Interview() {
 const [data,setData]=useState<any>(null); const [cat,setCat]=useState("All"); const [idx,setIdx]=useState(0); const [response,setResponse]=useState(""); const [scores,setScores]=useState<Record<string,number>>(Object.fromEntries(RUBRIC.map(r=>[r,3]))); const [feedback,setFeedback]=useState<any>(null); const [showModel,setShowModel]=useState(false); const [mock,setMock]=useState(false);
 useEffect(()=>{ fetch("/api/interview").then(r=>r.json()).then(setData); },[]);
 const questions = useMemo(()=>{ if(!data) return []; if(mock) return data.questions.filter((_:any,i:number)=>i%2===0).slice(0,8); return cat==="All"?data.questions:data.questions.filter((qq:any)=>qq.category===cat); },[data,cat,mock]);
 const qq = questions[Math.min(idx,Math.max(0,questions.length-1))];
 async function save(){ if(!qq) return; const res=await fetch("/api/interview",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({questionId:qq.id,response,selfScores:scores})}); const j=await res.json(); if(!res.ok) return alert(j.error||"Could not save"); setFeedback(j); fetch("/api/interview").then(r=>r.json()).then(setData); }
 if(!data) return <p>Loading Interview Studio…</p>;
 return (<div><h1>Interview Studio</h1>
 <p className="muted">Technical, behavioral, and customer-facing practice with follow-ups and model answers. Scoring is a <strong>transparent self-assessment rubric + rule-based feedback — not AI</strong> (no AI evaluation service is configured; nothing here pretends otherwise). Describe transferable experience honestly; never invent printer-repair history.</p>
 <div className="no-print" style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>{["All","Technical","Behavioral","Customer-facing"].map(c=><button key={c} className="btn2" aria-pressed={cat===c&&!mock} onClick={()=>{setCat(c);setMock(false);setIdx(0);setFeedback(null);}}>{c}</button>)}
 <button className="btn" aria-pressed={mock} onClick={()=>{setMock(true);setIdx(0);setFeedback(null);setResponse("");}}>Start Full Mock Interview (8 mixed questions)</button></div>
 {qq ? (<section className="card" style={{padding:18}}><p className="small" style={{color:"#2DD4BF"}}>{mock?`Mock question ${idx+1} of ${questions.length} · `:""}{qq.category}</p>
 <h2 style={{marginTop:4}}>{qq.prompt}</h2><p className="small muted"><strong>Likely follow-up:</strong> {qq.follow_up}</p>
 <label className="small">Your response (answer as if speaking — aim 60–90 seconds)<textarea className="input" rows={7} value={response} onChange={e=>setResponse(e.target.value)} placeholder="Situation → actions (safety, evidence, tests) → verification → documentation → customer communication…"/></label>
 <h3>Self-assessment rubric (1–5)</h3>{RUBRIC.map(r=>(<label key={r} className="small" style={{display:"block"}}>{r}: <strong>{scores[r]}</strong><input type="range" min={1} max={5} value={scores[r]} style={{width:"60%"}} onChange={e=>setScores({...scores,[r]:+e.target.value})} aria-label={r}/></label>))}
 <p style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="btn" onClick={save}>Save response & get feedback</button><button className="btn2" onClick={()=>setShowModel(!showModel)}>{showModel?"Hide model answer":"Show model answer"}</button>
 <button className="btn2" disabled={idx<=0} onClick={()=>{setIdx(idx-1);setFeedback(null);setResponse("");}}>← Previous</button><button className="btn2" disabled={idx>=questions.length-1} onClick={()=>{setIdx(idx+1);setFeedback(null);setResponse("");}}>Next →</button></p>
 {showModel && <div className="card" style={{padding:12}}><strong>Model answer (structure, not script):</strong><p className="small">{qq.model}</p></div>}
 {feedback && <div role="status" className="card" style={{padding:12,borderColor:"#3ECF8E"}}><strong>{feedback.feedbackKind}</strong><ul>{feedback.feedback.map((f:string)=><li key={f} className="small">{f}</li>)}</ul></div>}
 </section>) : <p>No questions in this filter.</p>}
 <section className="card" style={{padding:18,marginTop:14}}><h2 style={{marginTop:0}}>Practice history (saved to your account)</h2>
 {data.attempts.length? data.attempts.map((a:any)=>{ const q=data.questions.find((x:any)=>x.id===a.question_id); return (<details key={a.id} style={{marginBottom:8}}><summary>{q?.prompt||"Question"} <span className="muted small">· {new Date(a.created_at).toLocaleString()} · avg { (Object.values(a.selfScores).reduce((s:number,v:any)=>s+Number(v),0)/5).toFixed(1) }/5</span></summary><p className="small">{a.response}</p><ul>{a.feedback.map((f:string)=><li key={f} className="small">{f}</li>)}</ul></details>); }) : <p className="muted">Nothing saved yet — your Day 13–14 readiness depends on this history existing.</p>}
 <p className="small"><Link href="/course/day-13-interview-preparation">Day 13: interview preparation</Link> · <Link href="/course/day-1-cgs-oris-field-service">Day 1: your 60–90s introduction</Link></p></section></div>); }

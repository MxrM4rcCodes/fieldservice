"use client";
import { useEffect, useState } from "react"; import { useParams } from "next/navigation"; import Link from "next/link";
const DIMS = ["safety","evidence","hypothesis","leastInvasive","interpretation","verification","documentation","communication"];
export default function Runner() {
 const { id: slug } = useParams<{ id: string }>(); const [state, setState] = useState<any>(null); const [reveal, setReveal] = useState(""); const [err, setErr] = useState("");
 async function start() { const res = await fetch("/api/scenarios", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action:"start", slug }) }); const j = await res.json(); if (!res.ok) return setErr(j.error||"Could not start"); setState(j); setReveal(""); }
 useEffect(()=>{ start(); }, [slug]);
 async function choose(choiceId: string) { const res = await fetch("/api/scenarios", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action:"choose", runId: state.runId, choiceId }) }); const j = await res.json(); if (!res.ok) return setErr(j.error||"Choice failed"); setReveal(j.reveal||""); setState(j); window.scrollTo({top:0}); }
 if (err) return <p role="alert">{err} <button className="btn2" onClick={start}>Retry</button></p>;
 if (!state) return <p>Loading scenario…</p>;
 const s = state.scores || {}; const finished = state.status === "finished";
 return (<div><p className="small"><Link href="/simulator">← All scenarios</Link></p>
  {state.scenario && <><h1>{state.scenario.title}</h1><p><em>{state.scenario.complaint}</em></p><p className="muted">{state.scenario.context}</p></>}
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
   <section className="card" style={{padding:18}} aria-live="polite"><p className="small" style={{color:"#2DD4BF",margin:0}}>{state.node?.kind?.toUpperCase()}</p><h2 style={{marginTop:4}}>{state.node?.title}</h2><p style={{lineHeight:1.65}}>{state.node?.body}</p>
    {reveal && <p className="small" style={{borderLeft:"3px solid #F5B544",paddingLeft:10}}><strong>Result revealed:</strong> {reveal}</p>}
    {!finished && <div style={{display:"grid",gap:8}}>{state.choices.map((c:any)=><button key={c.id} className="btn2" style={{textAlign:"left"}} onClick={()=>choose(c.id)}>{c.label}</button>)}</div>}
    {finished && <div><p role="status"><strong>Scenario complete.</strong></p><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="btn2" onClick={start}>Replay scenario</button><Link className="btn" href={`/tickets?scenario=${slug}`}>Generate service ticket from this case →</Link><Link className="btn2" href="/simulator">All scenarios</Link></div></div>}
   </section>
   <aside className="card" style={{padding:18}} aria-label="Diagnostic score"><h2 style={{marginTop:0}}>Diagnostic score <span className="small muted">(live, server-recorded)</span></h2>
    {DIMS.map(dim=>(<div key={dim} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between"}}><span className="small" style={{textTransform:"capitalize"}}>{dim}</span><span className="small">{s[dim]??0}</span></div><div style={{background:"#0B1220",borderRadius:6,height:9}}><div style={{width:Math.max(0,Math.min(100,s[dim]??0))+"%",background:(s[dim]??0)<0?"#FF5C5C":"#2DD4BF",height:9,borderRadius:6}}/></div></div>))}
    {state.grade && <p><strong>Overall: {state.grade.total}/100 — {state.grade.label}</strong>{s.safety<0 && <span style={{color:"#FF8A8A"}}> Safety penalty applied: an unsafe choice was recorded. Review Day 3.</span>}</p>}
    <p className="small muted">Every choice is stored as a scenario event on your account. Unsupported assumptions, unsafe decisions, and unnecessary part replacements reduce these scores.</p></aside>
  </div></div>); }

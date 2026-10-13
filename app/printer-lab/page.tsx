"use client";
import { useState } from "react"; import Link from "next/link";
import { SUBSYSTEMS, SYMPTOMS } from "@/lib/content/diagrams";
export default function PrinterLab() {
 const [sel, setSel] = useState(SUBSYSTEMS[5]); const [symptom, setSymptom] = useState<string|null>(null); const [zoom, setZoom] = useState(1);
 const causing = symptom ? SUBSYSTEMS.filter(s => s.causes.includes(symptom)) : [];
 return (<div><h1>Printer Anatomy Lab</h1>
 <p className="muted"><strong>Conceptual educational model</strong> rebuilt from the supplied Industrial Printer Architecture diagram — not an OEM schematic. Technologies vary by model: never assume every printer shares printheads, ink, or curing. Click a subsystem, or use Trace the Fault.</p>
 <section className="card no-print" style={{padding:14,marginBottom:12}} aria-label="Trace the fault"><h2 style={{marginTop:0}}>Trace the Fault</h2>
  <p className="small muted">Pick a symptom — subsystems that can cause it light up. This generates hypotheses, not verdicts: the linked scenario proves the point that identical symptoms have different causes.</p>
  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{SYMPTOMS.map(s=><button key={s.id} className="btn2" aria-pressed={symptom===s.id} style={symptom===s.id?{borderColor:"#F5B544",color:"#F5B544"}:{}} onClick={()=>setSymptom(symptom===s.id?null:s.id)}>{s.label}</button>)}
  <button className="btn2" onClick={()=>setZoom(z=>Math.min(2.2,z+0.2))}>Zoom +</button><button className="btn2" onClick={()=>setZoom(z=>Math.max(.6,z-0.2))}>Zoom −</button><button className="btn2" onClick={()=>setZoom(1)}>Reset</button><button className="btn" onClick={()=>window.print()}>Print diagram</button></div>
  {symptom && <p role="status" className="small">Candidate subsystems: <strong>{causing.map(c=>c.label).join(" · ")||"— use the decision tree for this symptom class"}</strong>. Next: <Link href="/troubleshooting">Troubleshooting Decision Tree</Link> · <Link href="/simulator">Diagnostic Simulator</Link></p>}</section>
 <div className="card" style={{padding:10,overflow:"auto"}}>
 <svg viewBox="0 0 1180 430" style={{width:"100%",minWidth:820}} role="group" aria-label="Industrial printer subsystem diagram">
  <g transform={`scale(${zoom})`}>
  <text x={20} y={28} fill="#A9BAD3" fontSize={13} fontWeight={700}>JOB & CONTROL</text><text x={20} y={168} fill="#A9BAD3" fontSize={13} fontWeight={700}>INK PATH</text><text x={20} y={308} fill="#A9BAD3" fontSize={13} fontWeight={700}>MEDIA & OUTPUT</text>
  {SUBSYSTEMS.map(s => { const hot = symptom ? s.causes.includes(symptom) : false; return (<g key={s.id} tabIndex={0} role="button" aria-label={s.label} onClick={()=>setSel(s)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();setSel(s);}}} style={{cursor:"pointer",opacity: symptom&&!hot?0.35:1}}>
   <rect x={s.x} y={s.y} width={170} height={56} rx={12} fill={hot?"#3A2E12":sel.id===s.id?"#173A34":"#16263F"} stroke={hot?"#F5B544":"#2DD4BF"} strokeWidth={hot||sel.id===s.id?3:1.5}/>
   <text x={s.x+85} y={s.y+24} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={700}>{s.label.split(" & ")[0]}</text>
   <text x={s.x+85} y={s.y+40} textAnchor="middle" fill="#A9BAD3" fontSize={9}>{s.label.split(" & ")[1]||"subsystem"}</text></g>); })}
  </g></svg></div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14,marginTop:14}}>
  <nav className="card no-print" style={{padding:16}} aria-label="Subsystems list"><h2 style={{marginTop:0}}>Subsystems</h2>{SUBSYSTEMS.map(s=><p key={s.id} style={{margin:"5px 0"}}><button className="btn2" onClick={()=>setSel(s)}>{s.label}</button></p>)}</nav>
  <section className="card" style={{padding:16}} aria-live="polite"><h2 style={{marginTop:0}}>{sel.label}</h2>
   <p><strong>Function:</strong> {sel.fn}</p><p><strong>Common failure symptoms:</strong> {sel.symptoms}</p><p><strong>Observable evidence:</strong> {sel.evidence}</p>
   <p><strong>Safe diagnostic considerations:</strong> {sel.safe}</p><p><strong>Relationships:</strong> {sel.links}</p>
   <div className="card" style={{padding:12}}><strong>Practice question:</strong> {sel.question}<p className="small" style={{marginBottom:0}}>Work it through in the <Link href="/troubleshooting">decision tree</Link>, then test yourself in the <Link href="/simulator">simulator</Link> or <Link href="/course/day-5-inkjet-troubleshooting">Day 5 troubleshooting lesson</Link>.</p></div>
  </section></div></div>); }

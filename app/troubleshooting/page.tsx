"use client";
import { useState } from "react"; import Link from "next/link";
import { DECISION_STEPS } from "@/lib/content/diagrams";
const CASES = [
 { id:"banding", label:"Horizontal banding", hint:"Pattern first: regular spacing → advance/motion; fixed thin line → nozzle/channel. Start with the sample + nozzle check.", link:"/simulator" },
 { id:"color", label:"Color mismatch", hint:"Localize: source/proof vs print, old vs new substrate. Measure Delta E; don't open the printer first.", link:"/color-lab" },
 { id:"job", label:"Job will not print", hint:"Capture error text, walk workstation → queue → RIP → controller, establish scope (one vs all).", link:"/simulator" },
 { id:"scan", label:"Scanning artifacts", hint:"Inspect raw scan data. Defect in data = capture-side (optics/references/calibration).", link:"/metis" },
 { id:"curing", label:"Curing / adhesion problems", hint:"Split with a reference substrate before touching curing settings or parts.", link:"/simulator" },
 { id:"strike", label:"Head-strike risk", hint:"Ticking near print zone = stop the job. Flatness, vacuum hold, clearance — media layer first.", link:"/simulator" },
 { id:"intermittent", label:"Intermittent faults", hint:"Timestamped logs, correlation with jobs/media/environment, controlled reproduction. No hopeful part swaps.", link:"/simulator" },
];
export default function Troubleshooting() {
 const [step, setStep] = useState(DECISION_STEPS[0]); const [gate, setGate] = useState<string|null>(null); const [c, setC] = useState(CASES[0]);
 return (<div><h1>Troubleshooting Decision Tree</h1>
 <p className="muted">Rebuilt and improved from the supplied Field Service Troubleshooting flowchart. The loop matters: a contradictory test result sends you back to hypothesis formation (step 5), not forward to a lucky fix.</p>
 <section className="card" style={{padding:16,borderColor:"#FF5C5C"}} aria-label="Safety gate exercise"><h2 style={{marginTop:0,color:"#FF8A8A"}}>Safety gate — try it</h2>
  <p>You arrive: burning smell, and a cover interlock has been taped down. What do you do?</p>
  <div style={{display:"flex",gap:8,flexWrap:"wrap"}} className="no-print">
   <button className="btn2" onClick={()=>setGate("bad")}>Open the cover and find the smell fast</button>
   <button className="btn2" onClick={()=>setGate("ok")}>Stop, keep clear, shut down safely, make safe within authorization, escalate & document</button></div>
  {gate==="bad" && <p role="alert" style={{color:"#FF8A8A"}}><strong>Exercise stopped.</strong> Unknown energy + defeated interlock + possible electrical fault: opening up is how technicians get hurt. Review <Link href="/course/day-3-equipment-safety">Day 3 Safety</Link>, then choose the safe response.</p>}
  {gate==="ok" && <p role="status" style={{color:"#3ECF8E"}}><strong>Correct.</strong> That is exactly Scenario 10. <Link href="/simulator">Run it in the simulator →</Link></p>}</section>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14,marginTop:14}}>
  <div><div className="card" style={{padding:12}} role="list" aria-label="Decision steps">{DECISION_STEPS.map((s,i)=>(<div key={s.id} role="listitem"><button className="btn2" style={{width:"100%",textAlign:"left",margin:"4px 0",borderColor:step.id===s.id?s.color:undefined,color:step.id===s.id?s.color:undefined}} onClick={()=>setStep(s)} aria-current={step.id===s.id}>{s.label}</button>{i<DECISION_STEPS.length-1 && <div aria-hidden style={{textAlign:"center",color:"#5B7CA6"}}>↓</div>}</div>))}
   <p className="small muted">↩ If a test contradicts your hypothesis at step 7, return to step 5 (Isolate) — the simulator grades this loop.</p>
   <button className="btn no-print" onClick={()=>window.print()}>Print decision tree</button></div></div>
  <div><section className="card" style={{padding:16}} aria-live="polite"><h2 style={{marginTop:0,color:step.color}}>{step.label}</h2><p style={{lineHeight:1.65}}>{step.body}</p></section>
  <section className="card" style={{padding:16,marginTop:12}}><h2 style={{marginTop:0}}>Guided symptom entry points</h2>
   <div style={{display:"flex",gap:8,flexWrap:"wrap"}} className="no-print">{CASES.map(x=><button key={x.id} className="btn2" aria-pressed={c.id===x.id} onClick={()=>setC(x)}>{x.label}</button>)}</div>
   <p><strong>{c.label}:</strong> {c.hint}</p><p><Link className="btn2" href={c.link}>Practice this in context →</Link> <Link href="/course/day-5-inkjet-troubleshooting">Day 5 lesson</Link></p></section></div>
 </div></div>); }

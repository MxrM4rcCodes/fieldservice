"use client";
import { useEffect, useState } from "react"; import Link from "next/link";
export default function Simulator() { const [list, setList] = useState<any[]>([]);
 useEffect(()=>{ fetch("/api/scenarios").then(r=>r.json()).then(setList); },[]);
 return (<div><h1>Branching Diagnostic Simulator</h1>
 <p className="muted">A real scenario engine: each case has a hidden underlying fault. Test results are revealed only after you choose the test, unsafe/premature choices change the branch, and scoring rewards safety, evidence, least-invasive testing, interpretation, verification, documentation, and communication. Not every case is solved by replacing a part — one is solved by stopping.</p>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))",gap:12}}>{list.map((s,i)=>(<article key={s.id} className="card" style={{padding:16}}>
  <p className="small" style={{color:"#F5B544",margin:0}}>SCENARIO {i+1} · {s.difficulty} · {s.competency}</p><h2 style={{margin:"6px 0"}}>{s.title}</h2>
  <p className="small"><em>{s.complaint}</em></p><p className="small muted">{s.context}</p>
  <p className="small">{s.my_status==="finished"?"✓ Finished (replay to improve)":s.my_status==="in_progress"?"▶ In progress":"Not started"}</p>
  <Link className="btn" href={`/simulator/${s.slug}`}>{s.my_status==="in_progress"?"Continue scenario":"Start scenario"}</Link></article>))}</div></div>); }

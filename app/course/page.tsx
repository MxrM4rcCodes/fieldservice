"use client";
import { useEffect, useState } from "react"; import Link from "next/link";
export default function Course() { const [ls, setLs] = useState<any[]>([]);
 useEffect(() => { fetch("/api/lessons").then(r=>r.json()).then(setLs); }, []);
 return (<div><h1>Full 14-Day Technical Course</h1><p className="muted">≈90 minutes per day. Teach first, assess second: every day has objectives, three+ teaching sections, a field example, interactive practice links, a 5-question knowledge check with explanations, and a printable reference.</p>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>{ls.map(l => (
  <article key={l.id} className="card" style={{padding:16}}><p className="small" style={{color:"#2DD4BF",margin:0}}>DAY {l.day} · {l.minutes} MIN · {l.competency}</p>
  <h2 style={{margin:"6px 0"}}><Link href={`/course/${l.slug}`}>{l.title}</Link></h2><p className="small muted">{l.summary}</p>
  <div style={{background:"#0B1220",borderRadius:8,height:10}}><div style={{width:(l.progress.percent||0)+"%",background:l.progress.status==="completed"?"#3ECF8E":"#2DD4BF",height:10,borderRadius:8}}/></div>
  <p className="small">{l.progress.status==="completed"?"✓ Completed":l.progress.status==="in_progress"?`In progress · ${l.progress.percent}%`:"Not started"}</p></article>))}</div></div>); }

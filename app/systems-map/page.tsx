"use client";
import { useMemo, useState } from "react"; import Link from "next/link";
import { MAP_NODES, PATHWAYS } from "@/lib/content/diagrams";
export default function SystemsMap() {
 const [sel, setSel] = useState(MAP_NODES[0]); const [path, setPath] = useState("digital"); const [zoom, setZoom] = useState(1); const [pan, setPan] = useState({ x: 0, y: 0 });
 const active = useMemo(() => new Set(PATHWAYS[path].nodes), [path]);
 const edges: [string, string][] = [["artwork","metis"],["artwork","color"],["metis","color"],["color","rip"],["artwork","rip"],["rip","printer"],["printer","inspect"],["inspect","color"],["inspect","rip"]];
 const byId = Object.fromEntries(MAP_NODES.map(n => [n.id, n]));
 return (<div><h1>Interactive Systems Map</h1>
 <p className="muted">Artwork → optional METIS capture → color/proofing → RIP → printer → inspection & measurement, with feedback loops. Conceptual educational model rebuilt from the supplied workflow diagram — not a manufacturer schematic. Select a pathway, click any node, zoom/pan, or use the keyboard list.</p>
 <div className="no-print" style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
  {Object.entries(PATHWAYS).map(([k, v]) => <button key={k} className="btn2" aria-pressed={path===k} style={path===k?{borderColor:"#2DD4BF",color:"#2DD4BF"}:{}} onClick={()=>setPath(k)}>{v.label}</button>)}
 </div>
 <div className="no-print" style={{display:"flex",gap:8,marginBottom:10}}><button className="btn2" onClick={()=>setZoom(z=>Math.min(2.5,z+0.2))}>Zoom +</button><button className="btn2" onClick={()=>setZoom(z=>Math.max(0.5,z-0.2))}>Zoom −</button><button className="btn2" onClick={()=>{setZoom(1);setPan({x:0,y:0});}}>Reset view</button><button className="btn2" onClick={()=>setPan(p=>({x:p.x+40,y:p.y}))}>Pan ←</button><button className="btn2" onClick={()=>setPan(p=>({x:p.x-40,y:p.y}))}>Pan →</button><button className="btn" onClick={()=>window.print()}>Print / export (browser print)</button></div>
 <div className="card" style={{padding:10,overflow:"auto"}}>
 <svg viewBox="0 0 1180 380" style={{width:"100%",minWidth:760}} role="group" aria-label="CGS ORIS imaging and printing workflow diagram">
  <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
  {edges.map(([a,b]) => { const A=byId[a],B=byId[b]; const on = active.has(a)&&active.has(b); return <line key={a+b} x1={A.x+70} y1={A.y+22} x2={B.x+70} y2={B.y+22} stroke={on?"#2DD4BF":"#33465F"} strokeWidth={on?3:1.5} strokeDasharray={a==="inspect"?"6 4":"0"} markerEnd="url(#arr)"/>; })}
  <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#5B7CA6"/></marker></defs>
  {MAP_NODES.map(n => (<g key={n.id} tabIndex={0} role="button" aria-label={`${n.label}. ${n.does}`} onClick={()=>setSel(n)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSel(n);}}} style={{cursor:"pointer",opacity: active.has(n.id)?1:0.35}}>
    <rect x={n.x} y={n.y} width={150} height={52} rx={12} fill={sel.id===n.id?"#173A34":"#16263F"} stroke={n.color} strokeWidth={sel.id===n.id?3:2}/>
    <text x={n.x+75} y={n.y+22} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={700}>{n.label.split(" / ")[0]}</text>
    <text x={n.x+75} y={n.y+38} textAnchor="middle" fill="#A9BAD3" fontSize={9}>{n.label.split(" / ")[1]||"workflow stage"}</text></g>))}
  <text x={990} y={290} fill="#3ECF8E" fontSize={11}>- - measured feedback: adjust profile / RIP / printer state</text>
  </g></svg></div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14,marginTop:14}}>
  <nav className="card no-print" style={{padding:16}} aria-label="Diagram nodes (keyboard accessible list)"><h2 style={{marginTop:0}}>Nodes</h2>{MAP_NODES.map(n=><p key={n.id} style={{margin:"6px 0"}}><button className="btn2" onClick={()=>setSel(n)} aria-current={sel.id===n.id}>{n.label}</button></p>)}</nav>
  <section className="card" style={{padding:16}} aria-live="polite"><h2 style={{marginTop:0,color:sel.color}}>{sel.label}</h2>
   <p><strong>What it does:</strong> {sel.does}</p><p><strong>Inputs:</strong> {sel.inputs}<br/><strong>Outputs:</strong> {sel.outputs}</p>
   <p><strong>Main components:</strong> {sel.components}</p><p><strong>Relevant products:</strong> {sel.products}</p>
   <p><strong>Common failures:</strong> {sel.failures}</p><p><strong>Diagnostic questions:</strong> {sel.questions}</p>
   <p className="small muted"><strong>Related lessons:</strong> {sel.related} · <Link href="/course">open course</Link><br/><strong>Source-confidence note:</strong> functional/workflow level from public product information and the supplied conceptual diagram; application-dependent connections are not mandatory integrations.</p></section>
 </div></div>); }

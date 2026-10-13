"use client";
import { useState } from "react"; import Link from "next/link";
const PRODUCTS = [
 { name:"COLOR TUNER", job:"Color tuning & proofing", body:"Centers on tuning color output in proofing workflows so proofs match an agreed reference before production commits.", need:"proofs-match", signals:"Proof doesn't match the press/reference; approval bottleneck." },
 { name:"PRESS MATCHER", job:"Cross-device matching & normalization", body:"Matching/normalizing output across presses or devices so the same job stays consistent wherever it runs.", need:"cross-device", signals:"Same job looks different on device A vs B." },
 { name:"X GAMUT", job:"Extended-gamut printing", body:"Expands the process ink set (beyond CMYK) to reproduce more spot/brand colors without a dedicated ink per color.", need:"extended-gamut", signals:"Too many spot inks; brand colors out of CMYK gamut." },
 { name:"FLEX PACK", job:"Flexo & packaging workflows", body:"Serves flexographic/packaging production needs, where substrates, spot colors, and repeatability dominate.", need:"packaging", signals:"Packaging/flexo workflow requirements." },
 { name:"CERTIFIED & EVALUATE", job:"Measurement-based certification & evaluation", body:"Verifies output against standards/tolerances with instrument measurement — certification and ongoing evaluation.", need:"certify", signals:"Must prove output meets a standard; audit/tolerance evidence needed." },
 { name:"CxF TOOLBOX / CLOUD", job:"Spectral color data (CxF)", body:"Works with CxF spectral definitions of spot/brand colors so color intent is exchanged unambiguously across suppliers.", need:"spectral", signals:"Brand color must be defined exactly across sites/suppliers." },
];
const NEEDS = [ ["proofs-match","Our proofs don't match the reference/press"], ["cross-device","The same job prints differently on two devices"], ["extended-gamut","We run too many dedicated spot-color inks"], ["packaging","We produce flexo packaging work"], ["certify","We must prove output meets a standard"], ["spectral","A brand color must be identical across suppliers"] ] as const;
export default function Oris() { const [pick, setPick] = useState<Record<string,string>>({}); const [done, setDone] = useState(false);
 const correct = NEEDS.filter(([id]) => { const p = PRODUCTS.find(x=>x.need===id); return pick[id]===p?.name; }).length;
 return (<div><h1>ORIS Product Explorer</h1>
 <p className="muted">What each product is generally for — at functional level, from public product information. Version-specific features are intentionally not invented. Field-service angle: you install, configure, and troubleshoot these workflows on site (Day 8).</p>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>{PRODUCTS.map(p=>(<article key={p.name} className="card" style={{padding:16}}><h2 style={{marginTop:0,color:"#5B9BFF"}}>{p.name}</h2><p><strong>{p.job}</strong></p><p className="small">{p.body}</p><p className="small muted">Customer signal: {p.signals}</p></article>))}</div>
 <section className="card" style={{padding:18,marginTop:14}}><h2 style={{marginTop:0}}>Customer-needs matching exercise</h2>
  {NEEDS.map(([id,label])=>(<div key={id} style={{marginBottom:10}}><label className="small"><strong>{label}</strong><select className="input" value={pick[id]||""} onChange={e=>setPick({...pick,[id]:e.target.value})}><option value="">Choose the best-fit ORIS product…</option>{PRODUCTS.map(p=><option key={p.name} value={p.name}>{p.name}</option>)}</select></label>
  {done && <p className="small" style={{color: pick[id]===PRODUCTS.find(x=>x.need===id)?.name ? "#3ECF8E":"#FF8A8A",margin:"3px 0"}}>{pick[id]===PRODUCTS.find(x=>x.need===id)?.name?"✓ Correct match":"✗ Best fit: "+PRODUCTS.find(x=>x.need===id)?.name}</p>}</div>))}
  <button className="btn" onClick={()=>setDone(true)}>Check matches</button> {done && <p role="status"><strong>{correct}/{NEEDS.length} correct.</strong> Diagnose the need before naming the tool — Day 8 teaches this mapping. <Link href="/course/day-8-oris-software">Review Day 8</Link></p>}
 </section></div>); }

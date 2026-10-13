"use client";
import { useMemo, useState } from "react"; import Link from "next/link";
const dE76=(a:number[],b:number[])=>Math.sqrt(a.reduce((s,v,i)=>s+(v-b[i])**2,0));
function Mixer({mode}:{mode:"rgb"|"cmyk"}){ const [v,setV]=useState([180,60,120]); const color = mode==="rgb"?`rgb(${v[0]},${v[1]},${v[2]})`:`rgb(${255-v[0]},${255-v[1]},${255-v[2]})`; const bg = mode==="rgb"?"#000":"#fff";
 return <div><div style={{background:bg,borderRadius:10,padding:8}}><div role="img" aria-label={`${mode} mixed color swatch (illustration only)`} style={{height:70,borderRadius:8,background:color}}/></div>
 {v.map((x,i)=>(<label key={i} className="small" style={{display:"block"}}>{mode==="rgb"?["Red","Green","Blue"][i]:["Cyan","Magenta","Yellow"][i]}: {x}<input type="range" min={0} max={255} value={x} style={{width:"100%"}} onChange={e=>{const n=[...v];n[i]=+e.target.value;setV(n);}}/></label>))}</div>; }
export default function ColorLab(){ const [pair,setPair]=useState<[number[],number[]]>([[55,20,30],[58,18,27]]); const [sub,setSub]=useState<"white"|"warm"|"grey">("white"); const de=useMemo(()=>dE76(pair[0],pair[1]),[pair]);
 const SUBS: Record<string,{bg:string;label:string}>={white:{bg:"#FFFFFF",label:"Bright white stock"},warm:{bg:"#E8D9B8",label:"Warm uncoated stock"},grey:{bg:"#B9BDC2",label:"Grey recycled board"}};
 return (<div><h1>Color Science Lab</h1>
 <p className="muted">Interactive demonstrations — with an honest limit: <strong>browser-rendered color is device-dependent and unmeasured. These swatches illustrate concepts; they can never verify a color match. Only instrument measurement (Lab / Delta E) does that.</strong></p>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14}}>
  <section className="card" style={{padding:16}}><h2 style={{marginTop:0}}>Additive RGB (light)</h2><Mixer mode="rgb"/><p className="small muted">Displays emit light: channels add toward white. Same RGB numbers differ per display — device-dependent.</p></section>
  <section className="card" style={{padding:16}}><h2 style={{marginTop:0}}>Subtractive CMYK (ink)</h2><Mixer mode="cmyk"/><p className="small muted">Approximation of ink absorbing light on white (minus K). Real output depends on printer, ink, and substrate — characterization captures that.</p></section>
  <section className="card" style={{padding:16}}><h2 style={{marginTop:0}}>CIELAB + Delta E calculator</h2>
   {[0,1].map(side=>(<div key={side}><p className="small" style={{margin:"4px 0"}}>Color {side+1} (L*, a*, b*)</p>{pair[side].map((x,i)=>(<input key={i} className="input" style={{width:76,marginRight:6}} type="number" value={x} aria-label={`Color ${side+1} ${["L","a","b"][i]}`} onChange={e=>{const p:typeof pair=[[pair[0][0],pair[0][1],pair[0][2]],[pair[1][0],pair[1][1],pair[1][2]]];p[side][i]=+e.target.value;setPair(p);}}/>))}</div>))}
   <p><strong>ΔE*ab ≈ {de.toFixed(2)}</strong> <span className="small muted">{de<1?"— below typical just-noticeable difference":de<3?"— small; may pass a commercial tolerance":"— clearly visible; investigate profile/state/substrate"}</span></p>
   <p className="small muted">Try: same values with +5 L* (lighter substrate effect). Delta E is computed from measurements, never from screen appearance.</p></section>
  <section className="card" style={{padding:16}}><h2 style={{marginTop:0}}>Gamut comparison (conceptual)</h2>
   <svg viewBox="0 0 260 190" style={{width:"100%"}} role="img" aria-label="Conceptual gamut comparison: display RGB larger, CMYK smaller, extended gamut between">
    <polygon points="130,15 245,165 15,165" fill="none" stroke="#5B9BFF" strokeWidth={2}/><polygon points="130,55 205,160 55,160" fill="none" stroke="#F5B544" strokeWidth={2}/><polygon points="130,35 228,163 32,163" fill="none" stroke="#3ECF8E" strokeWidth={2} strokeDasharray="5 4"/>
    <text x={130} y={182} textAnchor="middle" fill="#A9BAD3" fontSize={10}>blue: display RGB · amber: CMYK · green dashed: extended gamut</text></svg>
   <p className="small muted">A vivid RGB brand color outside the CMYK polygon cannot be printed as-is: remap (rendering intent), spot color, or extended-gamut (<Link href="/oris">X GAMUT</Link>).</p></section>
  <section className="card" style={{padding:16}}><h2 style={{marginTop:0}}>Substrate influence</h2>
   <div style={{display:"flex",gap:8}} className="no-print">{(Object.keys(SUBS) as any[]).map(k=><button key={k} className="btn2" aria-pressed={sub===k} onClick={()=>setSub(k)}>{SUBS[k].label}</button>)}</div>
   <div style={{background:SUBS[sub].bg,borderRadius:10,padding:10,marginTop:8}}><div style={{height:56,borderRadius:8,background:"rgba(30,110,200,0.85)"}}/><p className="small" style={{color:"#111",margin:"6px 0 0"}}>Identical ink film on {SUBS[sub].label.toLowerCase()} (illustration). This is why media changes require media-appropriate profiles — <Link href="/simulator/scn-3-color-substrate">Scenario 3</Link>.</p></div></section>
  <section className="card" style={{padding:16}}><h2 style={{marginTop:0}}>Calibration vs characterization</h2>
   <ol className="small" style={{lineHeight:1.8}}><li><strong>Stabilize (calibrate):</strong> return the device to a known state.</li><li><strong>Measure (characterize):</strong> build/update the ICC profile of that state.</li><li><strong>Verify:</strong> measure output vs reference (Delta E, tolerances).</li></ol>
   <p className="small muted">White point, spot colors & spectral (CxF) data, and evaluation workflows: <Link href="/course/day-7-color-science">Day 7 lesson</Link> · <Link href="/oris">ORIS Explorer</Link> · <Link href="/print">printable color reference</Link>.</p></section>
 </div></div>); }

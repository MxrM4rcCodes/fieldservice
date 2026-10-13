"use client";
import Link from "next/link"; import { usePathname, useRouter } from "next/navigation"; import { useState } from "react";
const LINKS = [["/dashboard","Dashboard"],["/bootcamp","Bootcamp"],["/course","14-Day Course"],["/systems-map","Systems Map"],["/printer-lab","Printer Lab"],["/color-lab","Color Lab"],["/troubleshooting","Troubleshooting"],["/simulator","Simulator"],["/metis","METIS"],["/oris","ORIS"],["/flashcards","Flashcards"],["/interview","Interview Studio"],["/tickets","Service Tickets"],["/print","Print Center"]];
export default function Nav({ user }: { user: { name: string; email: string; role: string } }) {
  const path = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false);
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); }
  return (<header className="no-print" style={{borderBottom:"1px solid #22314D",background:"#0E1729",position:"sticky",top:0,zIndex:40}}>
    <div style={{maxWidth:1240,margin:"0 auto",padding:"10px 16px",display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
      <Link href="/dashboard" style={{color:"#fff",textDecoration:"none",fontWeight:800,letterSpacing:.3}}>CGS ORIS <span style={{color:"#2DD4BF"}}>FIELD SERVICE ACADEMY</span></Link>
      <button className="btn2" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Close menu" : "Menu"}</button>
      <span className="small muted" style={{marginLeft:"auto"}}>{user.name} · {user.role}{user.role==="admin" && <> · <Link href="/admin">Admin</Link></>}</span>
      <button className="btn2" onClick={logout}>Sign out</button>
    </div>
    {open && <nav aria-label="Main" style={{maxWidth:1240,margin:"0 auto",padding:"0 16px 12px",display:"flex",gap:8,flexWrap:"wrap"}}>
      {LINKS.map(([h,l]) => <Link key={h} href={h} onClick={()=>setOpen(false)} className="btn2" style={path===h?{borderColor:"#2DD4BF",color:"#2DD4BF",textDecoration:"none"}:{textDecoration:"none"}}>{l}</Link>)}
    </nav>}
    <div style={{maxWidth:1240,margin:"0 auto",padding:"0 16px 8px"}} className="small muted">Learn the Systems. Diagnose the Faults. Master the Workflow. · Independent educational app — not affiliated with or endorsed by CGS ORIS, METIS, or Platinum Technologies.</div>
  </header>);
}

import "./globals.css";
import Nav from "@/components/Nav";
import { currentUser } from "@/lib/auth";
export const metadata = { title: "CGS ORIS Field Service Academy", description: "Learn the Systems. Diagnose the Faults. Master the Workflow." };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (<html lang="en"><body>
    {user && <Nav user={user} />}
    <main style={{ maxWidth: 1240, margin: "0 auto", padding: "22px 16px 64px" }}>{children}</main>
    <footer className="no-print" style={{maxWidth:1240,margin:"0 auto",padding:"0 16px 28px"}}><p className="small muted">Independent educational application for interview preparation and technical study. Not affiliated with or endorsed by CGS ORIS, METIS, or Platinum Technologies. Diagrams are conceptual educational models, not manufacturer schematics. Always follow current manufacturer documentation and your authorization in the field.</p></footer>
  </body></html>);
}

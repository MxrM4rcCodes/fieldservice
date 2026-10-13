import { describe, it, expect } from "vitest";
import { assertOwner } from "@/lib/auth";
const owner = { id: "u1", role: "learner" } as any; const other = { id: "u2", role: "learner" } as any; const admin = { id: "a1", role: "admin" } as any;
describe("ownership guard (user isolation)", () => {
  it("allows the owner", () => { expect(() => assertOwner({ user_id: "u1" }, owner)).not.toThrow(); });
  it("blocks another learner changing an ID (403)", () => { try { assertOwner({ user_id: "u1" }, other); expect.unreachable(); } catch (e: any) { expect(e.status).toBe(403); } });
  it("404s missing records instead of leaking existence", () => { try { assertOwner(null, other); expect.unreachable(); } catch (e: any) { expect(e.status).toBe(404); } });
  it("allows admin oversight", () => { expect(() => assertOwner({ user_id: "u1" }, admin)).not.toThrow(); });
});

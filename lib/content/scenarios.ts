// Branching diagnostic simulator scenarios. Each has a hidden fault state; test results are
// revealed only after the test is chosen. Not every scenario is solved by replacing a part.
export type Fx = Partial<Record<"safety"|"evidence"|"hypothesis"|"leastInvasive"|"interpretation"|"verification"|"documentation"|"communication", number>>;
export type SChoice = { label: string; next: string; reveal: string; effects: Fx };
export type SNode = { kind: "brief"|"decision"|"result"|"end"; title: string; body: string; choices: SChoice[] };
export type Scenario = { slug: string; title: string; complaint: string; context: string; competency: string; difficulty: string; equipment: string; nodes: Record<string, SNode>; start: string };

const end = (title: string, body: string): SNode => ({ kind: "end", title, body, choices: [] });
const VERIFY_OK = "Verification passed under controlled conditions. Document evidence, tests, actions, and results in the service ticket, confirm acceptance with the customer, and set any follow-up. Use 'Generate service ticket' below — it will be prefilled from this case.";
export const SCENARIOS: Scenario[] = [
{ slug:"scn-1-banding-nozzles", title:"Banding caused by missing/deflected nozzles", complaint:"'Light bands across our prints since yesterday.'", context:"UV flatbed (conceptual model), same media as usual, no recent media/profile change. Production is waiting.", competency:"Hardware, Diagnostics & Safety", difficulty:"Core", equipment:"Industrial UV-LED flatbed printer (conceptual)", start: "start",
 nodes:{
  start:{kind:"brief",title:"Customer report",body:"Banding appeared yesterday. Nothing 'changed' according to the operator, but the printer sat idle over a long weekend. What first?",choices:[
   {label:"Ask what changed + inspect a sample print closely",next:"evidence",reveal:"Sample shows thin, irregular light lines, worst in cyan. Idle weekend noted.",effects:{evidence:15,communication:10}},
   {label:"Order a replacement printhead",next:"badpart",reveal:"Parts desk asks for diagnostic justification — you have none yet.",effects:{leastInvasive:-20,hypothesis:-10}},
   {label:"Re-profile the printer immediately",next:"evidence",reveal:"Profile won't fix irregular physical lines; sample inspection was skipped time.",effects:{hypothesis:-10,evidence:-5}}]},
  evidence:{kind:"decision",title:"Gather evidence",body:"Irregular thin lines, color-specific. Hidden fault: several nozzles dropped out / deflected after the idle weekend. Choose a test.",choices:[
   {label:"Run a nozzle check pattern",next:"nozzle_bad",reveal:"Nozzle check: multiple missing jets in cyan, a few deflected. Hypothesis supported.",effects:{evidence:15,interpretation:15,leastInvasive:10}},
   {label:"Print a media-advance test first",next:"advance_ok",reveal:"Advance test is clean and regular — spacing does not match the complaint pattern.",effects:{evidence:5,interpretation:5}},
   {label:"Swap ink cartridges",next:"advance_ok",reveal:"No change to the defect pattern.",effects:{leastInvasive:-10}}]},
  advance_ok:{kind:"result",title:"Result: advance is fine",body:"Evidence now points back to the imaging channel. Next?",choices:[
   {label:"Run the nozzle check you skipped",next:"nozzle_bad",reveal:"Nozzle check confirms missing/deflected cyan jets.",effects:{evidence:10,interpretation:10}},
   {label:"Replace the printhead now",next:"badpart",reveal:"Still no recovery attempt or verification evidence.",effects:{leastInvasive:-20}}]},
  nozzle_bad:{kind:"decision",title:"Interpret: nozzle dropout",body:"Missing/deflected jets confirmed. Least-invasive authorized path?",choices:[
   {label:"Perform authorized nozzle-recovery/maintenance routine, then re-check",next:"recovered",reveal:"After the authorized routine, nozzle check is complete and even.",effects:{leastInvasive:15,verification:10}},
   {label:"Replace the printhead immediately",next:"badpart",reveal:"Head replacement authorized only after recovery failure is documented.",effects:{leastInvasive:-20,hypothesis:-5}}]},
  recovered:{kind:"decision",title:"Verify before you declare victory",body:"Nozzle check clean. How do you close this out?",choices:[
   {label:"Print the customer's failing job + a control pattern; compare to pre-fix sample",next:"success",reveal:"Banding absent on both. Customer confirms acceptance.",effects:{verification:20,communication:10}},
   {label:"Tell the customer it's fixed and leave",next:"weak_end",reveal:"No verification print was made. If it recurs, you have no baseline.",effects:{verification:-15}}]},
  badpart:end("Premature part replacement","You moved to replace an expensive component without evidence or a recovery attempt. Restart the scenario: gather the sample, run the nozzle check, attempt authorized recovery, and verify with a controlled print."),
  weak_end:end("Unverified repair","The fault may be fixed, but nothing was proven or baselined. Field standard: controlled verification print + documented before/after evidence. Restart and finish properly."),
  success:end("Case resolved — nozzle dropout recovered", VERIFY_OK) } },

{ slug:"scn-2-banding-clean-nozzle", title:"Banding despite a clean nozzle check", complaint:"'Bands every few centimetres — but your nozzle check is perfect.'", context:"Hybrid printer, defect is strikingly regular. Hidden fault: media-advance / feed inconsistency, not the printhead.", competency:"Hardware, Diagnostics & Safety", difficulty:"Core", equipment:"Industrial hybrid printer (conceptual)", start: "start",
 nodes:{
  start:{kind:"brief",title:"Customer report",body:"Regular banding, clean nozzle check (customer shows you the pattern — it is genuinely complete). First move?",choices:[
   {label:"Measure the band spacing and compare it to feed/advance periodicity; print an advance test",next:"advance_bad",reveal:"Bands repeat at a fixed interval matching the media-advance cycle. Advance test reproduces it.",effects:{evidence:15,hypothesis:15,interpretation:10}},
   {label:"Replace the printhead — banding means heads",next:"badpart",reveal:"The clean nozzle check already argues against this, and the regularity argues for motion/feed.",effects:{hypothesis:-15,leastInvasive:-20}},
   {label:"Increase ink density to hide the bands",next:"advance_bad",reveal:"Masking attempt: bands remain, ink use rises, adhesion risk grows.",effects:{hypothesis:-10}}]},
  advance_bad:{kind:"decision",title:"Subsystem isolated: media advance",body:"Now inspect the feed path within your authorization: media loading, feed consistency, obvious obstructions/contamination, vacuum hold.",choices:[
   {label:"Inspect media path/feed and vacuum hold; correct loading issue found; re-run advance test",next:"verify",reveal:"A loading/feed inconsistency is corrected. Advance test now prints evenly.",effects:{leastInvasive:15,evidence:10}},
   {label:"Escalate immediately without any inspection",next:"weak_end",reveal:"Escalation is valid when needed — but basic authorized inspection was skipped, and the fault was findable.",effects:{leastInvasive:-5,evidence:-10}}]},
  verify:{kind:"decision",title:"Verify",body:"Advance test clean. Close-out?",choices:[
   {label:"Reprint customer's banded job; measure/inspect with customer",next:"success",reveal:"Banding gone on the real job. Customer accepts.",effects:{verification:20,communication:10}},
   {label:"Leave — test pattern was fine",next:"weak_end",reveal:"Test patterns verify subsystems; the customer's job verifies the repair.",effects:{verification:-10}}]},
  badpart:end("Wrong subsystem","A clean nozzle check does not rule out every head issue — but perfectly regular spacing is a periodicity fingerprint. Measure spacing, run an advance test, and let evidence choose the subsystem."),
  weak_end:end("Incomplete close-out","Diagnosis was reachable but verification/escalation discipline slipped. Restart and finish with a customer-job verification."),
  success:end("Case resolved — media-advance fault", VERIFY_OK) } },

{ slug:"scn-3-color-substrate", title:"Color mismatch after changing substrate", complaint:"'Same file, new board stock — colors are wrong.'", context:"Color shifted after a substrate change. Printer mechanically sound. Hidden fault: media/profile state, not hardware.", competency:"Color Science & ORIS", difficulty:"Core", equipment:"Industrial flatbed printer + ORIS workflow (conceptual)", start: "start",
 nodes:{
  start:{kind:"brief",title:"Customer report",body:"Color wrong since the board stock changed. File unchanged, approved proof exists. First step?",choices:[
   {label:"Print the same file on the previous (reference) substrate and compare",next:"split",reveal:"On the old substrate the color matches the approved proof. Printer and file are exonerated; media/profile layer is implicated.",effects:{evidence:20,hypothesis:15,interpretation:15}},
   {label:"Clean/replace printheads",next:"badpart",reveal:"No imaging defect evidence exists; this is a color-state complaint.",effects:{leastInvasive:-20,hypothesis:-10}},
   {label:"Tell the customer color is subjective",next:"weak_end",reveal:"Dismissive and unmeasured. The customer has an approved proof — measure against it.",effects:{communication:-20}}]},
  split:{kind:"decision",title:"Localize: new-substrate state",body:"Old stock = correct. What corrects the new stock?",choices:[
   {label:"Confirm correct media setting/profile for the new substrate; calibrate (stabilize) then verify with measurement against the proof",next:"verify",reveal:"Correct media profile applied after stabilization; measured values move within agreed tolerance.",effects:{evidence:10,interpretation:15,leastInvasive:10}},
   {label:"Randomly try other profiles until it 'looks right'",next:"verify",reveal:"Trial-and-error profiles risk ink-limit/adhesion side effects and no measured endpoint.",effects:{hypothesis:-10,interpretation:-5}}]},
  verify:{kind:"decision",title:"Verify with instrument, not eyeballs",body:"How do you prove the match?",choices:[
   {label:"Measure printed patches vs approved proof (Delta E vs agreed tolerance) under controlled viewing; record values",next:"success",reveal:"Measured differences within tolerance. Values recorded in the ticket; customer approves under agreed lighting.",effects:{verification:20,documentation:10}},
   {label:"Hold it up to the window and agree it looks close",next:"weak_end",reveal:"Uncontrolled light + no measurement = the next dispute is already scheduled.",effects:{verification:-15}}]},
  badpart:end("Hardware reflex","No defect evidence pointed at printheads. The controlled substrate comparison localized this in one print. Restart and run the split test."),
  weak_end:end("Unmeasured conclusion","Color disputes are settled by measurement under agreed conditions, not adjectives. Restart and verify with Delta E against the approved proof."),
  success:end("Case resolved — media/profile state corrected", VERIFY_OK) } },

{ slug:"scn-4-job-stuck-rip", title:"Job stuck in the RIP / print queue", complaint:"'The job has sat in the queue for an hour. Printer shows ready.'", context:"Single workstation submits; printer internal test page prints fine. Hidden fault: RIP/queue-layer stall on this job.", competency:"Hardware, Diagnostics & Safety", difficulty:"Core", equipment:"RIP workstation + industrial printer (conceptual)", start: "start",
 nodes:{
  start:{kind:"brief",title:"Customer report",body:"Job stuck an hour; printer ready. Discipline first:",choices:[
   {label:"Capture the exact queue/RIP status and error text (screenshot/note) before clearing anything",next:"inspect",reveal:"RIP log shows the job stalled during processing with a specific error entry — preserved.",effects:{evidence:20,documentation:10}},
   {label:"Reboot printer, RIP PC, and router in one go",next:"weak_end",reveal:"Everything restarts; the job clears — and so does every trace of why. It recurs next week.",effects:{evidence:-15,interpretation:-10}},
   {label:"Delete the job and tell them to resend",next:"inspect",reveal:"Resent job stalls at the same stage. (Error text was never captured.)",effects:{evidence:-5}}]},
  inspect:{kind:"decision",title:"Walk the job path",body:"Printer internal test page prints. Other (small) jobs process. This job: large, with features the RIP is choking on. Test:",choices:[
   {label:"Submit a known-good reference job, then re-submit the problem job watching RIP stages",next:"isolated",reveal:"Reference job prints end-to-end. Problem job stalls at the same RIP stage → job/RIP layer localized.",effects:{evidence:15,interpretation:15}},
   {label:"Reinstall the printer driver on every PC",next:"isolated",reveal:"Hours later, nothing changed for this job. Scope was never established.",effects:{leastInvasive:-10}}]},
  isolated:{kind:"decision",title:"Act at the right layer",body:"Job/RIP layer isolated. Resolution path?",choices:[
   {label:"Correct the job/RIP-side cause (file/RIP setting per the captured error), resubmit, watch it complete to the printer",next:"success",reveal:"Job processes, prints, and matches the reference for content. Queue healthy.",effects:{verification:15,communication:10}},
   {label:"Escalate to engineering as a printer fault",next:"weak_end",reveal:"Escalation misdirected: evidence says printer is healthy. Include evidence or expect it back.",effects:{communication:-10,interpretation:-10}}]},
  weak_end:end("Evidence destroyed / misdirected","Reboot-first and mis-layered escalation both fail the same way: no preserved evidence, no localization. Restart: capture the error, walk the path, use the reference job."),
  success:end("Case resolved — RIP/queue-layer fault", VERIFY_OK) } },

{ slug:"scn-5-curing-adhesion", title:"Inconsistent curing / adhesion", complaint:"'Ink scratches off some boards, fine on others.'", context:"Mixed results on the customer's board. Hidden fault: substrate condition/surface inconsistency, not lamp output.", competency:"Hardware, Diagnostics & Safety", difficulty:"Intermediate", equipment:"UV-LED flatbed printer (conceptual)", start: "start",
 nodes:{
  start:{kind:"brief",title:"Customer report",body:"Adhesion inconsistent board-to-board. First test?",choices:[
   {label:"Run the same job/settings on your known reference substrate",next:"split",reveal:"Reference substrate: adhesion passes consistently. Suspicion moves to the customer's material/condition.",effects:{evidence:20,hypothesis:15}},
   {label:"Increase curing energy to maximum",next:"split",reveal:"Some boards still fail; others now show heat effects. Masking, not diagnosis.",effects:{hypothesis:-10,safety:-5}},
   {label:"Replace the curing lamp",next:"badpart",reveal:"No output measurement or reference test justifies a lamp yet.",effects:{leastInvasive:-20}}]},
  split:{kind:"decision",title:"Split result: media-side likely",body:"Investigate the material: storage condition, surface contamination/consistency, correct side, batch variation — with the customer.",choices:[
   {label:"Compare failing vs passing boards (batch, storage, surface prep) and test a conditioned sample",next:"verify",reveal:"Failures cluster on cold-stored, inconsistently prepared stock. Conditioned sample passes.",effects:{evidence:15,interpretation:15,communication:10}},
   {label:"Insist the printer is fine and leave",next:"weak_end",reveal:"Probably true — and completely unproven to the customer. Bring the comparison evidence.",effects:{communication:-15,verification:-10}}]},
  verify:{kind:"decision",title:"Verify + prevent recurrence",body:"Close-out?",choices:[
   {label:"Adhesion-test conditioned customer stock together; agree storage/prep guidance; document",next:"success",reveal:"Customer reproduces the pass/fail split themselves. Guidance documented; follow-up agreed.",effects:{verification:20,documentation:10,communication:10}},
   {label:"Quietly adjust settings so it 'mostly works'",next:"weak_end",reveal:"Undocumented drift: next shift rediscovers the fault.",effects:{documentation:-15}}]},
  badpart:end("Unjustified part","Curing components are replaced on evidence (reference-substrate split, output checks), not on a complaint pattern that already points at material variation."),
  weak_end:end("Unproven conclusion","The split test is powerful only when the customer sees the evidence and the prevention is documented. Restart and finish the verification together."),
  success:end("Case resolved — substrate condition identified", VERIFY_OK) } },

{ slug:"scn-6-metis-artifacts", title:"METIS scan with lighting/calibration artifacts", complaint:"'Scans have a streak and a color cast — and prints reproduce both.'", context:"Décor material scanning. Hidden fault: capture-side (optics/reference/calibration state). The printer is innocent.", competency:"METIS Scanning", difficulty:"Intermediate", equipment:"METIS material scanner (conceptual family model)", start: "start",
 nodes:{
  start:{kind:"brief",title:"Customer report",body:"Streak + cast in scans, faithfully printed. Split test first:",choices:[
   {label:"Inspect the raw scan data (zoomed) before anything downstream",next:"indata",reveal:"Streak sits at fixed coordinates in the data; cast is global. Defect exists at capture → scanner side.",effects:{evidence:20,interpretation:15}},
   {label:"Service the printer that printed the streak",next:"badpart",reveal:"The printer reproduced data faithfully. Wrong machine.",effects:{hypothesis:-15,leastInvasive:-15}},
   {label:"Re-profile the printer to compensate",next:"indata",reveal:"Profiling around bad capture embeds the artifact in every future job.",effects:{hypothesis:-10}}]},
  indata:{kind:"decision",title:"Capture-side isolation",body:"Fixed-position streak + global cast. Least-invasive checks?",choices:[
   {label:"Inspect/clean optical path & reference surfaces per authorization; run calibration against reference; rescan test material",next:"verify",reveal:"Reference inspection finds contamination; calibration restores neutrality. Streak gone on rescan.",effects:{leastInvasive:15,evidence:10,interpretation:10}},
   {label:"Replace the sensor assembly",next:"badpart",reveal:"No evidence indicts the sensor; references/calibration were never checked.",effects:{leastInvasive:-20}}]},
  verify:{kind:"decision",title:"Verify the capture chain",body:"Rescan clean. Final proof?",choices:[
   {label:"Rescan the original material; compare data + a proof print against the pre-fix artifact samples",next:"success",reveal:"Data clean, proof clean, customer confirms the décor match.",effects:{verification:20,communication:10}},
   {label:"Declare fixed from the calibration screen",next:"weak_end",reveal:"Calibration passing ≠ the customer's material scanning correctly. Verify with their material.",effects:{verification:-10}}]},
  badpart:end("Wrong machine / unjustified part","Localize where the defect first exists. It was in the data. Restart: raw-data inspection, reference/calibration checks, rescan verification."),
  weak_end:end("Unverified capture fix","Verify with the customer's actual material and a proof — calibration screens alone don't close cases."),
  success:end("Case resolved — capture calibration/optics restored", VERIFY_OK) } },

{ slug:"scn-7-head-strike-risk", title:"Head-strike risk from substrate irregularity", complaint:"'We hear a ticking near the print zone on this thick stock.'", context:"Thick, slightly warped rigid stock. Hidden risk: media flatness/clearance — a head strike can destroy printheads. Safety-adjacent: treat seriously.", competency:"Hardware, Diagnostics & Safety", difficulty:"Intermediate", equipment:"Industrial flatbed printer (conceptual)", start: "start",
 nodes:{
  start:{kind:"brief",title:"Customer report",body:"Ticking near print zone on warped thick stock. Printer still running. First action?",choices:[
   {label:"Stop the job safely; do not let it 'finish the sheet'",next:"inspect",reveal:"Job stopped. A head strike can destroy heads and scatter debris — stopping was the repair-saving move.",effects:{safety:25,evidence:5}},
   {label:"Let it finish; inspect afterward",next:"strike",reveal:"The ticking becomes a strike mid-sheet.",effects:{safety:-25}},
   {label:"Increase print speed so it passes faster",next:"strike",reveal:"Faster carriage + raised media edge = worse impact.",effects:{safety:-20,hypothesis:-10}}]},
  inspect:{kind:"decision",title:"Assess media & hold-down",body:"Job safely stopped. Evidence: board edges curl upward; vacuum hold marginal on this stock. Next?",choices:[
   {label:"Check media flatness, vacuum/substrate hold, and clearance setup for this material; test with flat, correctly held stock",next:"verify",reveal:"Flat stock with correct hold-down runs silently with proper clearance.",effects:{evidence:15,hypothesis:15,leastInvasive:10}},
   {label:"Raise the carriage and run the same warped boards",next:"verify",reveal:"Clearance workaround on warped stock: strike risk reduced, print quality and root cause unaddressed; customer still feeding warped boards.",effects:{safety:-5,hypothesis:-5}}]},
  verify:{kind:"decision",title:"Verify + set the operating rule",body:"Close-out?",choices:[
   {label:"Test-print at production settings; agree media-flatness acceptance guidance with customer; document",next:"success",reveal:"Silent run, good output, written media guidance left with the operator.",effects:{verification:20,communication:10,documentation:10}},
   {label:"Resume the job queue without discussion",next:"weak_end",reveal:"Next warped board is already on the pallet.",effects:{communication:-10,verification:-5}}]},
  strike:end("Head strike","Continuing to run with an audible warning converted a media problem into hardware damage. Restart: stopping the job is the first diagnostic act when strike risk is reported."),
  weak_end:end("Risk left behind","The immediate sheet survived; the condition that causes strikes remains. Verify at production settings and leave a media acceptance rule."),
  success:end("Case resolved — strike risk removed at the media layer", VERIFY_OK) } },

{ slug:"scn-8-recurring-fault", title:"Recurring fault after an earlier service visit", complaint:"'Third time with this banding. Last tech said it was fixed.'", context:"Prior tickets are thin: 'cleaned, OK' with no patterns. Hidden fault: the recurring cause was never isolated; evidence discipline is the repair.", competency:"Customer Support & Documentation", difficulty:"Advanced", equipment:"Industrial printer (conceptual), prior service history available", start: "start",
 nodes:{
  start:{kind:"brief",title:"Customer report (frustrated)",body:"Third visit, same complaint. Your first resource?",choices:[
   {label:"Read both prior tickets critically, then acknowledge the frustration and explain your evidence plan",next:"audit",reveal:"Prior tickets show cleaning + 'OK' — no nozzle patterns, no advance tests, no verification prints. Nothing was actually isolated.",effects:{evidence:15,communication:15,documentation:10}},
   {label:"Apologize and promise 'we'll replace parts until it's right'",next:"audit",reveal:"Well-meant promise, no method. Customer has heard promises twice.",effects:{communication:-5,hypothesis:-5}},
   {label:"Blame the previous technician to the customer",next:"audit",reveal:"Customer notes the comment. So will your manager.",effects:{communication:-20}}]},
  audit:{kind:"decision",title:"Rebuild the evidence base",body:"Run the full banding workup now: sample analysis, nozzle check, advance/spacing test, change history.",choices:[
   {label:"Complete workup: pattern points to periodic advance error the cleaning masked",next:"verify",reveal:"Nozzle check acceptable; perfectly regular spacing + advance test reproduce the fault → feed/advance cause, finally isolated.",effects:{evidence:20,interpretation:15,hypothesis:10}},
   {label:"Clean the heads again (it worked twice before)",next:"weak_end",reveal:"It 'worked' twice the way a coin flip works. Banding returns within days — visit four.",effects:{hypothesis:-15}}]},
  verify:{kind:"decision",title:"Prove it differently this time",body:"Feed/advance cause corrected within authorization. What makes this visit the last one?",choices:[
   {label:"Before/after patterns attached to ticket; customer-job verification; written note of what differed from prior visits; follow-up check scheduled",next:"success",reveal:"Customer watches their job print clean and sees the evidence file. Follow-up confirms stability.",effects:{verification:20,documentation:20,communication:15}},
   {label:"Ticket: 'Fixed banding.' Leave quickly",next:"weak_end",reveal:"Fourth ticket identical to the first three — including the outcome.",effects:{documentation:-20}}]},
  weak_end:end("The recurrence cycle","Repeating an unverified action produces recurring faults and recurring visits. Restart: audit prior evidence, isolate with tests, and document proof."),
  success:end("Case resolved — root cause isolated, recurrence broken", VERIFY_OK) } },

{ slug:"scn-9-network-interruption", title:"Network communication interruption", complaint:"'Printer vanishes mid-job, then comes back. Jobs die halfway.'", context:"Multiple workstations affected intermittently. Printer internal tests always pass. Hidden fault: shared network path interruption — coordinate, don't reconfigure.", competency:"Hardware, Diagnostics & Safety", difficulty:"Intermediate", equipment:"Site network + RIP + printer (conceptual)", start: "start",
 nodes:{
  start:{kind:"brief",title:"Customer report",body:"Intermittent dropouts, all workstations, internal tests fine. Establish scope first:",choices:[
   {label:"Document scope/timing log: which stations, times, job sizes; confirm printer-side internal test + local job path",next:"scope",reveal:"All stations affected at scattered times; printer healthy standalone → shared-path hypothesis leads.",effects:{evidence:20,hypothesis:15}},
   {label:"Replace the printer's network interface settings with your guesses",next:"weak_end",reveal:"Unilateral network changes on a customer site, without scope or coordination.",effects:{communication:-15,safety:-5}},
   {label:"Replace printheads (jobs 'die halfway')",next:"badpart",reveal:"Imaging hardware does not explain multi-station network dropouts.",effects:{hypothesis:-20,leastInvasive:-15}}]},
  scope:{kind:"decision",title:"Shared-layer investigation",body:"Next step respects ownership boundaries:",choices:[
   {label:"Bring the timed evidence log to customer IT; agree monitored test window and any infrastructure checks they own",next:"verify",reveal:"IT finds an intermittent infrastructure fault on the shared path; monitored test reproduces then clears after their correction.",effects:{communication:20,evidence:10,interpretation:10}},
   {label:"Re-cable the customer's office yourself over lunch",next:"verify",reveal:"It happens to help — and any future fault is now yours, undocumented and unauthorized.",effects:{communication:-10,documentation:-10}}]},
  verify:{kind:"decision",title:"Verify & close",body:"Path corrected by its owners. Verify end-to-end:",choices:[
   {label:"Run sustained multi-station job set in the agreed window; log results; ticket records scope evidence and IT actions",next:"success",reveal:"Jobs complete from all stations across the window. Ticket shows scope, owners, and verification.",effects:{verification:20,documentation:15}},
   {label:"Send one small job; declare victory",next:"weak_end",reveal:"Intermittent faults laugh at single small tests. Verify across time and stations.",effects:{verification:-15}}]},
  badpart:end("Wrong layer entirely","Scope evidence (all stations, healthy standalone printer) excluded imaging hardware immediately. Restart and log scope first."),
  weak_end:end("Boundary/verification failure","Either unauthorized changes or a token test. Intermittents require timed evidence, owner coordination, and sustained verification."),
  success:end("Case resolved — shared network path fault, coordinated fix", VERIFY_OK) } },

{ slug:"scn-10-unsafe-condition", title:"Unsafe equipment condition — shutdown & escalation", complaint:"'There's a burning smell and the cover interlock has been taped down.'", context:"Unknown energy state, defeated safety device, possible electrical fault. Hidden requirement: this scenario is NOT solved by diagnosis heroics.", competency:"Hardware, Diagnostics & Safety", difficulty:"Core — safety gate", equipment:"Industrial printer, condition unknown", start: "start",
 nodes:{
  start:{kind:"brief",title:"Arrival: unsafe condition reported",body:"Burning smell; an interlock is taped down; fault history unknown. Your move?",choices:[
   {label:"Stop: keep people clear, shut down via normal/emergency means as appropriate, do not open energized areas",next:"isolate",reveal:"Machine stopped, area cleared. Nobody reaches inside an unknown-energy machine.",effects:{safety:30}},
   {label:"Open the cover quickly to find the smell before it gets worse",next:"unsafe",reveal:"You reached into a defeated-interlock machine with a possible electrical fault and unknown energy state.",effects:{safety:-40}},
   {label:"Remove the tape and run a test print to reproduce the smell",next:"unsafe",reveal:"Re-energizing a suspected electrical fault to 'reproduce' it is how small faults become fires and injuries.",effects:{safety:-35}}]},
  isolate:{kind:"decision",title:"Make safe within authorization",body:"Machine stopped. Next, within your training/authorization only:",choices:[
   {label:"Isolate energy per LOTO principles if authorized (isolate, lock/tag, verify), restore the interlock question to a proper repair path, escalate to supervisor/engineering and inform the customer",next:"verify",reveal:"Condition secured, interlock defeat documented as a finding, escalation opened with facts.",effects:{safety:25,documentation:15,communication:15}},
   {label:"Leave it stopped but unreported so the customer can restart later",next:"weak_end",reveal:"An undocumented unsafe machine is a restart — and an injury — waiting for the next shift.",effects:{safety:-20,documentation:-15}}]},
  verify:{kind:"decision",title:"Verify the safe state & hand over",body:"Close this case correctly:",choices:[
   {label:"Written handover: condition found, actions taken, do-not-operate instruction, escalation reference, and who authorizes return to service",next:"success",reveal:"Customer acknowledges the do-not-operate instruction. Return to service belongs to the authorized repair path.",effects:{verification:20,documentation:20,communication:10}},
   {label:"Verbally mention 'probably don't use it' and close the ticket as 'smell — resolved'",next:"weak_end",reveal:"'Resolved' is false and the instruction is unenforceable. Document the real state.",effects:{documentation:-20,safety:-10}}]},
  unsafe:end("STOP — unsafe action","This was the safety gate scenario: defeated interlock + burning smell + unknown energy. The correct service action is stop, make safe within authorization, escalate, and document. Restart and choose the safe path."),
  weak_end:end("Unsafe condition left ambiguous","Stopping was right; failing to secure, report, and document hands the hazard to the next person. Restart and complete the safe handover."),
  success:end("Case closed correctly — hazard secured & escalated", "You did not 'fix' the printer, and that is the correct outcome: condition secured, documented, escalated, with an explicit do-not-operate handover. Return to service follows the authorized repair path. " + VERIFY_OK) } },
];

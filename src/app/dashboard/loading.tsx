/** Streamed instantly while the server loadInstance() read resolves, so the OS
 *  shell appears at once instead of a blank page. Static, non-interactive. */
export default function DashboardLoading() {
  return (
    <div className="os-desktop h-screen [height:100dvh] w-screen overflow-hidden flex flex-col text-[var(--text)]" aria-busy="true">
      <div className="h-8 shrink-0 bg-[var(--bg-card)] border-b-2 border-[var(--border)]" />
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-display text-[9px] uppercase text-[var(--text-muted)] blink">AIFOREVERYONE.OS_</span>
        </div>
      </div>
      <div className="h-9 shrink-0 bg-[var(--bg-card)] border-t-2 border-[var(--border)]" />
    </div>
  );
}

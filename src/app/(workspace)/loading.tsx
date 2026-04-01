export default function WorkspaceLoading() {
  return (
    <div className="grid gap-4">
      <div className="app-surface h-40 animate-pulse rounded-[2rem] border border-white/5" />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="app-surface h-[26rem] animate-pulse rounded-[2rem] border border-white/5" />
        <div className="app-surface h-[26rem] animate-pulse rounded-[2rem] border border-white/5" />
      </div>
    </div>
  );
}

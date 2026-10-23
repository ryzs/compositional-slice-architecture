export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="spinner" role="status">
      <div className="spinner-ring" />
      <span>{label}</span>
    </div>
  );
}

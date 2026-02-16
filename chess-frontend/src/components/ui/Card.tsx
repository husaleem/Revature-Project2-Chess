export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm">
      {children}
    </div>
  );
}
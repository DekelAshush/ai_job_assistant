type Props = {
  name: string;
  initials: string;
  status?: string | null;
};

export default function UserInfo({ name, initials, status }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500 text-xl font-bold text-white">
        {initials}
      </div>
      <div className="leading-tight">
        <div className="text-base font-semibold text-white">{name}</div>
        <div className="text-sm font-medium text-emerald-400">{status ?? ""}</div>
      </div>
    </div>
  );
}

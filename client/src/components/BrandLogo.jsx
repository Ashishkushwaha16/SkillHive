const BrandLogo = ({ compact = false }) => {
  return (
    <div className="inline-flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 via-sky-600 to-cyan-500 text-sm font-black tracking-tight text-white shadow-[0_10px_30px_-10px_rgba(2,132,199,0.7)]">
        SH
      </div>
      {!compact ? (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Skill Exchange
          </p>
          <p className="text-xl font-black text-slate-950">SkillHive</p>
        </div>
      ) : null}
    </div>
  );
};

export default BrandLogo;

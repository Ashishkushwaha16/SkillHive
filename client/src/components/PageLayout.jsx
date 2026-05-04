const PageLayout = ({ title, subtitle, children }) => {
  return (
    <section className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-4 sm:py-10 md:py-14">
      <div className="mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-slate-50/60 to-white p-4 sm:p-6 shadow-[0_12px_34px_-12px_rgba(0,0,0,0.1)]">
        <div className="inline-flex rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-100/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
          SkillHive
        </div>
        <h1 className="mt-3 sm:mt-4 text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-950 via-slate-800 to-blue-900 bg-clip-text text-transparent">{title}</h1>
        {subtitle ? <p className="mt-2 sm:mt-3 max-w-3xl text-xs sm:text-base text-slate-600 leading-7">{subtitle}</p> : null}
        <div className="mt-4 h-px w-full bg-gradient-to-r from-blue-100 via-slate-100 to-transparent" />
      </div>
      {children}
    </section>
  );
};

export default PageLayout;

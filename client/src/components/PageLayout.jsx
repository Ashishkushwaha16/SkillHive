const PageLayout = ({ title, subtitle, children }) => {
  return (
    <section className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-4 sm:py-10 md:py-14">
      <div className="mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl border border-white/70 bg-white/70 p-4 sm:p-6 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.18)] backdrop-blur">
        <div className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
          SkillHive
        </div>
        <h1 className="mt-3 sm:mt-4 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950">{title}</h1>
        {subtitle ? <p className="mt-2 sm:mt-3 max-w-3xl text-xs sm:text-base text-slate-600">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
};

export default PageLayout;

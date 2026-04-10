const PageLayout = ({ title, subtitle, children }) => {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-7">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-3xl text-slate-600">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
};

export default PageLayout;

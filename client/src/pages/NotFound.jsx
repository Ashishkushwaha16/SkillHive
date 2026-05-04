import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-red-100 to-red-200">
        <span className="text-5xl font-black text-red-600">404</span>
      </div>
      <h1 className="mt-6 text-5xl font-black text-slate-950">Page not found</h1>
      <p className="mt-4 max-w-xl text-lg text-slate-600 leading-7">
        The page you are looking for does not exist or may have been moved.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_8px_20px_-4px_rgba(37,99,235,0.4)] active:scale-95"
        >
          Go to Home
        </Link>
        <Link
          to="/help"
          className="rounded-lg border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-blue-500 hover:bg-blue-50"
        >
          Open Help Centre
        </Link>
      </div>
    </section>
  );
};

export default NotFound;

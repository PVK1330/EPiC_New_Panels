import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
        <h1 className="text-5xl font-black text-secondary mb-2">404</h1>
        <p className="text-lg font-black text-secondary">Page Not Found</p>
        <p className="text-sm font-bold text-gray-500 mt-2">
          The page you are trying to open does not exist or was moved.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-white hover:bg-primary-dark transition"
          >
            Go Home
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;


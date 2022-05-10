import { Form, Link, Outlet, useLocation } from "@remix-run/react";
import classnames from "classnames";
import { useUser } from "~/utils";

export default function EntriesPage() {
  const user = useUser();
  const location = useLocation();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Tracker</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>
      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link
            to=""
            className={classnames("block p-4 text-xl", {
              "bg-yellow-500 font-bold text-white":
                location.pathname === "/entries",
            })}
          >
            Home
          </Link>
          <hr />
          <Link
            to="calendar"
            className={classnames("block p-4 text-xl", {
              "bg-yellow-500 font-bold text-white":
                location.pathname === "/entries/calendar",
            })}
          >
            Calendar
          </Link>
          <hr />
          <Link
            to="new"
            className={classnames("block p-4 text-xl", {
              "bg-yellow-500 font-bold text-white":
                location.pathname === "/entries/new",
            })}
          >
            + New Entry
          </Link>
        </div>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

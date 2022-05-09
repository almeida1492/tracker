import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import { getEntries } from "~/models/entry.server";
import { requireUserId } from "~/session.server";

type TLoaderData = {
  entries: Awaited<ReturnType<typeof getEntries>>;
};

const getTotalLoggedHours = (entries: TLoaderData["entries"]) => {
  return entries.reduce((acc, entry) => {
    acc = acc + entry.duration / 3600;
    return acc;
  }, 0);
};

export const loader: LoaderFunction = async ({ request }) => {
  //TODO: load only current week entries
  const userId = await requireUserId(request);
  const entries = await getEntries({ userId });
  return json<TLoaderData>({ entries });
};

export default function EntriesIndexPage() {
  const data = useLoaderData() as TLoaderData;
  const totalLoggedHours = getTotalLoggedHours(data.entries);
  return (
    <>
      <br />
      <div className="align-center flex justify-center">
        <div className="text-center">
          You logged
          <div className="text-3xl font-bold">{`${totalLoggedHours} out of 40`}</div>
          hours this week
        </div>
      </div>
      <br />
      <hr />
      <br />
      <h1 className="text-3xl font-bold">Current week</h1>
      <br />
      {data.entries.length === 0 ? (
        <p className="p-4">No entries yet</p>
      ) : (
        <ol>
          {data.entries.map((entry) => {
            const date = new Date(entry.date);
            return (
              <li key={entry.id}>
                <NavLink
                  className={({ isActive }) =>
                    `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                  }
                  to={entry.id}
                >
                  <div className="flex justify-between">
                    <p>
                      <b>{date.toDateString()}</b> | {entry.task}{" "}
                      {entry.isSubmitted && "✅"}
                    </p>
                    <p>⏱ {entry.duration / 3600}h</p>
                  </div>
                </NavLink>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}

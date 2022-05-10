import { NavLink } from "@remix-run/react";
import type { FC } from "react";
import type { getEntries } from "~/models/entry.server";

interface IProps {
  entries: Awaited<ReturnType<typeof getEntries>>;
}

export const EntriesList: FC<IProps> = ({ entries }) => {
  return (
    <ol>
      {entries.map((entry) => {
        const date = new Date(entry.date);
        return (
          <li key={entry.id}>
            <NavLink
              className={({ isActive }) =>
                `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
              }
              to={`/entries/${entry.id}`}
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
  );
};

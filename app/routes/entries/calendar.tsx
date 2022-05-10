import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { EntriesList } from "~/components/entriesList";
import type { Entry } from "~/models/entry.server";
import { getEntries } from "~/models/entry.server";
import { requireUserId } from "~/session.server";

type TLoaderData = {
  entriesByDate: Record<
    string,
    {
      totals: Pick<Entry, "duration" | "isSubmitted">;
      entries: Awaited<ReturnType<typeof getEntries>>;
    }
  >;
};

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const entries = await getEntries({ userId });

  const entriesByDate = entries.reduce((acc, entry) => {
    const date = new Date(entry.date).toDateString();
    if (acc[date]) {
      acc[date].totals.duration += entry.duration;
      if (acc[date].totals.isSubmitted)
        acc[date].totals.isSubmitted = entry.isSubmitted;
    } else {
      acc[date] = {
        totals: {
          duration: entry.duration,
          isSubmitted: entry.isSubmitted,
        },
        entries: [],
      };
    }
    acc[date].entries.push(entry);
    return acc;
  }, {} as TLoaderData["entriesByDate"]);

  return json<TLoaderData>({ entriesByDate });
};

export default function CalendarPage() {
  const data = useLoaderData() as TLoaderData;
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  return (
    <div>
      <Calendar
        selectable
        localizer={localizer}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        views={["month"]}
        onSelectSlot={(slotInfo) =>
          setSelectedDate(slotInfo.start.toDateString())
        }
        dayPropGetter={(date) => {
          if (date.toDateString() === selectedDate) {
            return {
              style: { backgroundColor: "#90CAF9" },
            };
          }
          return {};
        }}
        components={{
          month: {
            dateHeader: (props) => {
              const key = props.date.toDateString();
              const dateInfo = data.entriesByDate[key];
              return (
                <div style={{ cursor: "pointer" }}>
                  <div>{props.label}</div>
                  <br />
                  {dateInfo && (
                    <div>
                      {dateInfo.totals.isSubmitted && "✅"} ⏱{" "}
                      {dateInfo.totals.duration / 3600}h
                    </div>
                  )}
                </div>
              );
            },
          },
        }}
      />
      <br />
      {data.entriesByDate[selectedDate] ? (
        <>
          <h2 className="text-3xl font-bold">Entries</h2>
          <br />
          <EntriesList entries={data.entriesByDate[selectedDate].entries} />
        </>
      ) : (
        <div className="text-center font-bold">
          No entries for the selected date yet
        </div>
      )}
    </div>
  );
}

import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import React, { useState } from "react";
import { createEntry } from "~/models/entry.server";
import { requireUserId } from "~/session.server";

type TFieldName = "date" | "task" | "duration" | "notes";

type TActionData = {
  errors?: Partial<Record<TFieldName, string>>;
};

const getDurationInMs = (value: string): number => {
  const durationElements = value.split(":").map((element) => Number(element));
  return durationElements[0] * 3600 + durationElements[1] * 60;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const date = formData.get("date");
  const task = formData.get("task");
  const duration = formData.get("duration");
  const notes = formData.get("notes") as string;

  if (typeof date !== "string" || date.length === 0) {
    return json<TActionData>(
      { errors: { date: "Date is required" } },
      { status: 400 }
    );
  }
  if (typeof task !== "string" || task.length === 0) {
    return json<TActionData>(
      { errors: { task: "Task is required" } },
      { status: 400 }
    );
  }
  if (typeof duration !== "string" || duration.length === 0) {
    return json<TActionData>(
      { errors: { duration: "Duration is required" } },
      { status: 400 }
    );
  }

  await createEntry({
    date: new Date(date),
    task,
    duration: getDurationInMs(duration),
    notes,
    userId,
  });

  return json<TActionData>({ errors: {} }, { status: 201 });
};

export default function NewEntryPage() {
  const currentDate = React.useMemo(() => new Date(), []);

  const actionData = useActionData<TActionData>();

  const formRef = React.useRef<HTMLFormElement>(null);
  const dateRef = React.useRef<HTMLInputElement>(null);
  const taskRef = React.useRef<HTMLInputElement>(null);
  const durationRef = React.useRef<HTMLInputElement>(null);
  const notesRef = React.useRef<HTMLTextAreaElement>(null);

  const [displayActionFeedback, setDisplayActionFeedback] = useState(false);

  React.useEffect(() => {
    taskRef.current?.focus();
  }, []);

  React.useEffect(() => {
    if (actionData?.errors && Object.keys(actionData.errors).length === 0) {
      setDisplayActionFeedback(true);
      formRef.current?.reset();
      taskRef.current?.focus();
      setTimeout(() => setDisplayActionFeedback(false), 3000);
    } else if (actionData?.errors?.date) {
      dateRef.current?.focus();
    } else if (actionData?.errors?.task) {
      taskRef.current?.focus();
    } else if (actionData?.errors?.duration) {
      durationRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      ref={formRef}
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <h1 className="text-3xl font-bold">New Entry</h1>
      <hr />
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Date: </span>
          <input
            ref={dateRef}
            name="date"
            type="date"
            defaultValue={currentDate.toLocaleDateString("en-CA")}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.date ? true : undefined}
            aria-errormessage={
              actionData?.errors?.date ? "date-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.date && (
          <div className="pt-1 text-red-700" id="date-error">
            {actionData.errors.date}
          </div>
        )}
      </div>
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Task: </span>
          <input
            ref={taskRef}
            name="task"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.task ? true : undefined}
            aria-errormessage={
              actionData?.errors?.task ? "task-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.task && (
          <div className="pt-1 text-red-700" id="task-error">
            {actionData.errors.task}
          </div>
        )}
      </div>
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Duration: </span>
          <input
            ref={durationRef}
            name="duration"
            type="time"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.duration ? true : undefined}
            aria-errormessage={
              actionData?.errors?.duration ? "duration-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.duration && (
          <div className="pt-1 text-red-700" id="duration-error">
            {actionData.errors.duration}
          </div>
        )}
      </div>
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Notes: </span>
          <textarea
            ref={notesRef}
            name="notes"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            rows={8}
          />
        </label>
      </div>
      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>

      {displayActionFeedback && (
        <p className="rounded bg-slate-600 py-2 px-4 text-center text-white">
          Successfully created an entry! ✅
        </p>
      )}
    </Form>
  );
}

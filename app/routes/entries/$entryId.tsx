import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { deleteEntry, getEntry, updateEntry } from "~/models/entry.server";
import type { Entry } from "~/models/entry.server";
import { requireUserId } from "~/session.server";

type TLoaderData = {
  entry: Entry;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.entryId, "entryId not found");

  const entry = await getEntry({ userId, id: params.entryId });

  if (!entry) {
    throw new Response("Not Found", { status: 404 });
  }

  return json<TLoaderData>({ entry });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.entryId, "entryId not found");

  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  if (_action === "switch_status" && typeof values.isSubmitted === "string") {
    await updateEntry({
      id: params.entryId,
      data: { isSubmitted: !JSON.parse(values.isSubmitted) },
    });
    return null;
  }

  if (_action === "delete") {
    await deleteEntry({ userId, id: params.entryId });
    return redirect("/entries");
  }
};

export default function EntryDetailsPage() {
  const data = useLoaderData<TLoaderData>();

  const date = new Date(data.entry.date);

  return (
    <>
      <h3 className="text-2xl font-bold">
        {date.toDateString()} {data.entry.isSubmitted && "✅"}
      </h3>
      <p className="py-6">
        Task: <b>{data.entry.task}</b>
        <br />
        Duration: <b>{data.entry.duration / 3600}h</b>
        {data.entry.notes && `Notes: ${data.entry.notes}`}
      </p>
      <hr className="my-4" />
      <div className="flex justify-between">
        <Form method="post">
          <input
            type="hidden"
            name="isSubmitted"
            value={String(data.entry.isSubmitted)}
          />
          <button
            type="submit"
            className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            name="_action"
            value="switch_status"
          >
            {data.entry.isSubmitted ? "Mark as pending" : "Mark as submitted"}
          </button>
        </Form>
        <Form method="post">
          <button
            type="submit"
            className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            name="_action"
            value="delete"
          >
            Delete
          </button>
        </Form>
      </div>
    </>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Entry not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

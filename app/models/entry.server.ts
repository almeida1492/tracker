import type { User, Entry } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Entry } from "@prisma/client";

export function getEntry({
  id,
  userId,
}: Pick<Entry, "id"> & {
  userId: User["id"];
}) {
  return prisma.entry.findFirst({
    where: { id, userId },
  });
}

export function getEntries({ userId }: { userId: User["id"] }) {
  return prisma.entry.findMany({
    where: { userId },
    select: {
      id: true,
      date: true,
      task: true,
      duration: true,
      isSubmitted: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function createEntry({
  date,
  task,
  duration,
  notes,
  userId,
}: Pick<Entry, "date" | "task" | "duration" | "notes"> & {
  userId: User["id"];
}) {
  return prisma.entry.create({
    data: {
      date,
      task,
      duration,
      notes,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteEntry({
  id,
  userId,
}: Pick<Entry, "id"> & { userId: User["id"] }) {
  return prisma.entry.deleteMany({
    where: { id, userId },
  });
}

export function updateEntry({
  id,
  data,
}: Pick<Entry, "id"> & {
  data: Partial<
    Pick<Entry, "date" | "task" | "duration" | "isSubmitted" | "notes">
  >;
}) {
  return prisma.entry.update({
    where: { id },
    data,
  });
}

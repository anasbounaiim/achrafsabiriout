import { mkdir, readFile, writeFile } from "fs/promises";
import { cookies } from "next/headers";
import path from "path";

const initialCount = 12346;
const dataDirectory = path.join(process.cwd(), "data");
const votesFile = path.join(dataDirectory, "votes.json");
const votedCookie = "sabiri_out_voted";

let writeQueue = Promise.resolve();

async function readCount() {
  try {
    const file = await readFile(votesFile, "utf8");
    const data = JSON.parse(file);

    if (Number.isFinite(data.count)) {
      return data.count;
    }
  } catch {
  }

  await saveCount(initialCount);
  return initialCount;
}

async function saveCount(count) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(votesFile, JSON.stringify({ count }, null, 2), "utf8");
}

export async function GET() {
  const count = await readCount();
  const cookieStore = await cookies();

  return Response.json({
    count,
    voted: cookieStore.get(votedCookie)?.value === "true",
  });
}

export async function POST() {
  const cookieStore = await cookies();

  if (cookieStore.get(votedCookie)?.value === "true") {
    const count = await readCount();

    return Response.json({ count, voted: true }, { status: 409 });
  }

  writeQueue = writeQueue.then(async () => {
    const count = (await readCount()) + 1;
    await saveCount(count);
    return count;
  });

  const count = await writeQueue;
  cookieStore.set(votedCookie, "true", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return Response.json({ count, voted: true });
}

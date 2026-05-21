import { createWorker, getWorkers } from "../../../lib/workers";
import { getCurrentUserWithRole } from "../../../lib/auth";
import { Role } from "../../../generated/prisma/enums";
import { createWorkerSchema } from "../../../schemas/workers/create-worker.schema";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function getAuthedUser() {
  return getCurrentUserWithRole(await headers());
}

export async function GET() {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === Role.USER) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const workers = await getWorkers();
    return NextResponse.json(workers);
  } catch {
    return NextResponse.json({ error: "Failed to fetch workers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = createWorkerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
  }

  try {
    const worker = await createWorker(parsed.data, await headers());
    return NextResponse.json(worker, { status: 201 });
  } catch (err: unknown) {
    console.log(typeof err === "object" && err !== null && "body" in err ? (err as { body: unknown }).body : err);
    const isUniqueViolation =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002";
    if (isUniqueViolation) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create worker" }, { status: 500 });
  }
}

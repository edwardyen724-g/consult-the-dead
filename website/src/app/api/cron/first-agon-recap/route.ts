import { runFirstAgonRecapCron } from "@/lib/cron/first-agon-recap";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  return runFirstAgonRecapCron(request);
}

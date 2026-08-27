import { checkDifyReachable, isDifyConfigured } from "@/lib/assistant/dify-client";

export async function GET(): Promise<Response> {
  const configured = isDifyConfigured();
  const reachable = configured ? await checkDifyReachable() : false;
  return Response.json({
    configured,
    reachable,
  });
}

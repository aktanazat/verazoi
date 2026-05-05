import { Container, getContainer } from "@cloudflare/containers";

interface Env {
  BACKEND: DurableObjectNamespace;
  RATE_LIMIT_KV: KVNamespace;
  ENV: string;
  JWT_SECRET: string;
  ANTHROPIC_API_KEY: string;
  FRONTEND_ORIGIN: string;
  CORS_ORIGINS: string;
  DATABASE_URL: string;
}

const PUBLIC_LIMIT = 100;
const AUTH_LIMIT = 300;

export class VerazoiBackend extends Container<Env> {
  defaultPort = 8000;
  sleepAfter = "5m";

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.envVars = {
      ENV: env.ENV,
      JWT_SECRET: env.JWT_SECRET,
      ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
      FRONTEND_ORIGIN: env.FRONTEND_ORIGIN,
      CORS_ORIGINS: env.CORS_ORIGINS,
      DATABASE_URL: env.DATABASE_URL,
      REDIS_URL: "",
    };
  }
}

async function rateLimit(env: Env, identity: string, limit: number): Promise<boolean> {
  const window = Math.floor(Date.now() / 60000);
  const key = `rl:${identity}:${window}`;
  const raw = await env.RATE_LIMIT_KV.get(key);
  const count = raw ? parseInt(raw, 10) + 1 : 1;
  await env.RATE_LIMIT_KV.put(key, String(count), { expirationTtl: 90 });
  return count <= limit;
}

function identityFromRequest(req: Request): { id: string; authed: boolean } {
  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) return { id: `tok:${auth.slice(7, 24)}`, authed: true };
  const ip = req.headers.get("cf-connecting-ip") || "unknown";
  return { id: `ip:${ip}`, authed: false };
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname !== "/health") {
      const { id, authed } = identityFromRequest(req);
      const allowed = await rateLimit(env, id, authed ? AUTH_LIMIT : PUBLIC_LIMIT);
      if (!allowed) {
        return new Response(JSON.stringify({ detail: "Rate limit exceeded" }), {
          status: 429,
          headers: { "content-type": "application/json", "retry-after": "60" },
        });
      }
    }

    const container = getContainer(env.BACKEND);
    return container.fetch(req);
  },
};

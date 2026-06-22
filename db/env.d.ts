interface CloudflareEnv {
  AI: Ai;
  INVOICE_BUCKET: R2Bucket;
  DB: D1Database;
}

declare module '@cloudflare/next-on-pages' {
  import { RequestContext } from 'cloudflare:workers';
  export function getRequestContext(): {
    env: CloudflareEnv;
    ctx: ExecutionContext;
  };
}
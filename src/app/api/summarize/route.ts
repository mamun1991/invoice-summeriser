import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

// Force this route to run on Cloudflare's serverless edge infrastructure
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse the request body from the frontend
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid payload. "text" is required.' },
        { status: 400 }
      );
    }

    // 2. Fetch the Cloudflare Environment bindings
    const { env } = getRequestContext();

    if (!env.AI) {
      return NextResponse.json(
        { error: 'AI binding not found. Ensure wrangler.toml is configured correctly.' },
        { status: 500 }
      );
    }

    // 3. Command the LLaMA 3.1 AI model (Free tier execution)
    const aiResponse = (await env.AI.run('@cf/mistral/mistral-7b-instruct-v0.2-lora', {
      messages: [
        {
          role: 'system',
          content: 'You are an expert executive assistant. Summarize the provided document or text clearly. Use clean bullet points for key takeaways and a short concluding sentence.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
    })) as { response: string };

    // 4. Return the AI's output cleanly back to the client
    return NextResponse.json({
      success: true,
      summary: aiResponse.response,
    });

  } catch (error: any) {
    console.error("AI execution error:", error);
    return NextResponse.json(
      { error: `Backend crash: ${error.message || error.toString()}` },
      { status: 500 }
    );
  }
}
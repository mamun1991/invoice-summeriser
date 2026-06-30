import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid payload. "text" is required.' },
        { status: 400 }
      );
    }

    // 🛑 Prevent timeouts & memory crashes by limiting text length
    // LLaMA 3.1 8B can struggle/timeout on free tier with massive inputs.
    // 5000 characters is roughly 1000-1200 words (a safe limit for quick summaries).
    const safeText = text.length > 5000 ? text.substring(0, 5000) + '...' : text;

    const { env } = getRequestContext();

    if (!env.AI) {
      return NextResponse.json(
        { error: 'AI binding not found. Ensure wrangler.toml is configured.' },
        { status: 500 }
      );
    }

    // 🚀 Updated model ID to the canonical Cloudflare name
    const aiResponse = (await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'You are an expert executive assistant. Summarize the provided document or text clearly. Use clean bullet points for key takeaways and a short concluding sentence.',
        },
        {
          role: 'user',
          content: safeText, // Use the truncated text here
        },
      ],
    })) as { response: string };

    return NextResponse.json({
      success: true,
      summary: aiResponse.response,
    });

  } catch (error: any) {
    // If it STILL crashes, these logs will appear in `npx wrangler tail`
    console.error("AI execution error details:", error);
    
    return NextResponse.json(
      { error: `Backend error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
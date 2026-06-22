import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { toEmail, context } = await request.json();

    if (!toEmail || !context) {
      return NextResponse.json({ error: 'Missing email or context' }, { status: 400 });
    }

    // 1. Fetch Cloudflare Bindings
    const { env } = getRequestContext();

    // 2. Command the LLaMA AI to draft the email
    const aiResponse = (await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'You are an executive assistant. Write a short, highly professional email based on the context provided by the user. Do not include subject lines, just the email body. Keep it under 3 paragraphs.'
        },
        {
          role: 'user',
          content: context
        }
      ]
    })) as { response: string };

    const emailBody = aiResponse.response;

    // 3. Send the generated email using the Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'AI Agent <onboarding@resend.dev>', // Resend provides this free testing email address
        to: toEmail,
        subject: 'Automated Update',
        text: emailBody
      })
    });

    if (!resendResponse.ok) {
      throw new Error('Failed to send email via Resend API');
    }

    return NextResponse.json({ 
      success: true, 
      generatedBody: emailBody 
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Agent failed to process email' },
      { status: 500 }
    );
  }
}
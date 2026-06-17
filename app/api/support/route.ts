import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { tools, runTool, ToolName } from '@/lib/support-tools';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are the EMLAKIE support assistant. EMLAKIE is a rental listing platform at emlakie.com where landlords post rental listings and tenants browse and send inquiries.

Your job is to help landlords and tenants with technical issues on the website. You have tools to look up their account data in the database and fix issues directly.

When a user reports a problem:
1. Use your tools to look up their data (always start by looking up their listings or inquiries using their email)
2. Diagnose what's wrong
3. Fix it directly if you can (e.g. publish a draft listing, fix a field)
4. Give them a clear, friendly, concise response explaining what you found and what you did

Guidelines:
- Always be warm and helpful, like a knowledgeable customer support agent
- If you fix something, tell them exactly what you fixed
- If you can't fix it automatically, give them clear step-by-step instructions
- Keep responses concise — 2-4 sentences is usually enough
- Don't expose internal IDs or technical jargon in your final response
- If the user doesn't provide their email, ask for it before proceeding
- Common issues: listing not showing up (usually draft status), not receiving emails, can't find their inquiry, want to cancel an alert`;

export async function POST(req: NextRequest) {
  const { message, email } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 });
  }

  const userMessage = email
    ? `User email: ${email}\n\nUser message: ${message}`
    : message;

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage },
  ];

  let response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM,
    tools: tools as unknown as Anthropic.Tool[],
    messages,
  });

  // Agentic loop — keep running until Claude stops using tools
  while (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    );

    const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
      toolUseBlocks.map(async (block) => ({
        type: 'tool_result' as const,
        tool_use_id: block.id,
        content: await runTool(block.name as ToolName, block.input as Record<string, unknown>),
      }))
    );

    messages.push({ role: 'assistant', content: response.content });
    messages.push({ role: 'user', content: toolResults });

    response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM,
      tools: tools as unknown as Anthropic.Tool[],
      messages,
    });
  }

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
  const answer = textBlock?.text ?? 'I was unable to process your request. Please try again.';

  return NextResponse.json({ answer });
}

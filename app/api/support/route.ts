import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { tools, runTool, ToolName } from '@/lib/support-tools';


const SYSTEM = `You are the EMLAKIE technical support assistant. EMLAKIE is a rental listing platform at emlakie.com where landlords post rental listings and tenants browse and send inquiries.

Your ONLY job is to help users with technical issues related to using the EMLAKIE website. You have tools to look up account data and fix issues directly.

STRICT SCOPE — only respond to questions about:
- Using features on the website (listings, photos, inquiries, saved searches, alerts, filters, map, account)
- Technical problems (listing not showing, emails not arriving, can't upload, form errors)
- How-to questions about the site's functionality

REFUSE all other questions with a short, polite message. This includes:
- Who owns, founded, or runs EMLAKIE
- Company information, headquarters, investors, revenue, employees
- Personal information about any individual
- Legal, financial, or business questions
- Pricing disputes or refund requests
- Anything unrelated to using the website

When refusing, say: "I'm only able to help with technical questions about using the EMLAKIE website. For other inquiries, please use our contact page."

When a user reports a technical problem:
1. Use your tools to look up their data (always start with their email)
2. Diagnose what's wrong
3. Fix it directly if you can
4. Give a clear, friendly, concise response — what you found and what you did

Guidelines:
- Warm and helpful tone, like a knowledgeable support agent
- Never reveal internal IDs, database details, or technical jargon
- Keep responses to 2-4 sentences
- If no email provided and it's needed, ask for it first
- Never speculate about the company, its owners, or any individuals`;

export async function POST(req: NextRequest) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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

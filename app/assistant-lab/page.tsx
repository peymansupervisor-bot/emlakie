/**
 * /assistant-lab — OpenAI Realtime validation lab.
 *
 * Access requires:
 *   ENABLE_AI_ASSISTANT=true
 *   ASSISTANT_LAB_ENABLED=true
 *
 * Returns 404 when either flag is missing or false.
 * Not linked from any navigation, sitemap, or footer.
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import LabClient from './LabClient';

export const metadata: Metadata = {
  title: 'Assistant Lab · Internal · Emlakie',
  description: 'Internal OpenAI Realtime validation lab. Not for public use.',
  robots: { index: false, follow: false },
};

export default function AssistantLabPage() {
  const assistantEnabled = process.env.ENABLE_AI_ASSISTANT === 'true';
  const labEnabled = process.env.ASSISTANT_LAB_ENABLED === 'true';

  if (!assistantEnabled || !labEnabled) {
    notFound();
  }

  return <LabClient />;
}

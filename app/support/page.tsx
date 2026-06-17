import type { Metadata } from 'next';
import SupportChat from '@/components/SupportChat';

export const metadata: Metadata = {
  title: 'Support | EMLAKIE',
  description: 'Get help with your EMLAKIE account. Our AI support agent can diagnose and fix issues instantly.',
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900">How can we help?</h1>
        <p className="mt-3 text-gray-500">
          Describe your issue and our support agent will look into it and fix it right away.
        </p>
      </div>
      <SupportChat />
    </div>
  );
}

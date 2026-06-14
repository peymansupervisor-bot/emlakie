import { redirect } from 'next/navigation';

// Payments removed — Emlakie is free for landlords
export default function PaymentsPage() {
  redirect('/landlord');
}

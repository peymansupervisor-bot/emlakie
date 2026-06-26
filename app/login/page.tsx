import { redirect } from 'next/navigation';

// Legacy phone-OTP passwordless login has been removed. Emlakie now uses
// email/password + OAuth (see /landlord/login and components/SignInModal).
// This route is kept as a permanent redirect so any bookmarked or indexed
// /login links land on the current sign-in page instead of a 404.
export default function LoginRedirect() {
  redirect('/landlord/login');
}

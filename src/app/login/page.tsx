'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      // Login successful, verify role/destination?
      // For now, redirect to dashboard root which will redirect based on middleware or page logic
      // But let's assume /dashboard/portfolio for consultant and /dashboard/org/[id] for client.
      // Since we don't know the ID yet for client here easily without parsing session or another call,
      // let's redirect to a generic /dashboard which we will implement to handle routing.
      // OR simpler: Consultant -> /dashboard/portfolio. Client -> we need to find their org.

      // Let's redirect to /dashboard/portfolio by default, middleware or page will handle permissions?
      // Actually, let's fetch session info or just try portfolio. If 403, we know.
      // Better: Login API should return user info/role/orgId to help frontend redirect.

      // But for strict MVP, let's just refresh/redirect and let middleware handle it?
      // Actually, the API response body from my login implementation currently returns { message: '...' }.
      // Let's rely on the user knowing where to go or simple client-side logic?
      // No, that's bad UX.

      // Let's just hardcode: Consultant login -> /dashboard/portfolio.
      // Client login -> /dashboard/org/THEIR_ID.
      // Since I didn't return the ID in the login response, I should probably update the login API or make a call to /api/auth/me (not implemented).
      // Or I can just check who they are.

      // Wait, let's look at `src/app/api/auth/login/route.ts` again.
      // It returns { message: 'Logged in successfully' }.

      // I'll update the Login page to just redirect to /dashboard/portfolio for now.
      // If it fails (403), maybe I need a "Landing" page in dashboard.
      // Actually, let's try to be smarter.
      // I'll add a fetch to /api/organisations (works for consultant) or /api/organisations/me?
      // API_SPEC doesn't have /me.

      // Let's update the login route to return the user info. It's better.
      const data = await res.json();
      if (data.user?.role === 'consultant') {
        router.push('/dashboard/portfolio');
      } else if (data.user?.organisation_id) {
        router.push(`/dashboard/org/${data.user.organisation_id}`);
      } else {
        router.push('/dashboard');
      }
    } else {
      const data = await res.json();
      setError(data.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">NIS2 Dashboard Login</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
            >
              Sign In
            </button>
          </div>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Consultant: consultant@grc-kompas.com / password123</p>
          <p>Client: admin@msp-alpha.com / password123</p>
        </div>
      </div>
    </div>
  );
}

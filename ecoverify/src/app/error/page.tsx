// app/auth/error.tsx
'use client';
import { useSearchParams } from 'next/navigation';

const ErrorPage = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div>
      <h1>Authentication Error</h1>
      {error && <p>{error}</p>}
    </div>
  );
};

export default ErrorPage;

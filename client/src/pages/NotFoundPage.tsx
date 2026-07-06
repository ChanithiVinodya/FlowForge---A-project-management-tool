import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-9xl font-bold text-primary opacity-20">404</h1>
      <h2 className="text-2xl font-bold mt-4">Page not found</h2>
      <p className="text-muted-foreground mt-2">The page you are looking for doesn't exist.</p>
      <Link to="/" className="mt-8 text-primary hover:underline font-medium">
        Go back home
      </Link>
    </div>
  );
};

export default NotFoundPage;

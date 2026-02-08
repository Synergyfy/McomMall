// app/(public)/layout.tsx
import React from 'react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="overflow-y-auto"
      style={{ height: '100vh', paddingTop: '4rem' }}
    >
      {children}
    </main>
  );
}

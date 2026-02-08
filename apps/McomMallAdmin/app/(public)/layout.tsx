'use client';
import React from 'react';
import { usePathname } from 'next/navigation';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  return (
    <main
      className="overflow-y-auto"
      style={{
        height: '100vh',
        paddingTop: isLoginPage ? '0' : '4rem'
      }}
    >
      {children}
    </main>
  );
}

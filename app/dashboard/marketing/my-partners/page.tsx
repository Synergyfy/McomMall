'use client';

import React from 'react';
import { useGetMyAcceptedPartners } from '@/service/partnerships/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function MyPartnersPage() {
  const { data: partners, isLoading, isError } = useGetMyAcceptedPartners();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading partners.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Partners</h1>
      <Card>
        <CardHeader>
          <CardTitle>Accepted Partners</CardTitle>
          <CardDescription>A list of businesses you have partnered with.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {partners?.length ? partners.map(partner => (
            <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={partner.profilePictureUrl} />
                  <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{partner.name}</p>
                  <p className="text-sm text-muted-foreground">{partner.email}</p>
                </div>
              </div>
            </div>
          )) : <p>You have no accepted partners yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
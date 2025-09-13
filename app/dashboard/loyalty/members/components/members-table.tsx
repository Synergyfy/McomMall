'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useGetParticipants } from '@/service/promotions/hook';

export function MembersTable() {
  const {
    data: participants,
    isLoading,
    isError,
  } = useGetParticipants();

  if (isLoading) return <p>Loading members...</p>;
  if (isError) return <p>Error loading members.</p>;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      <p className="text-gray-600 mb-4">
        Members are customers who have signed up for your rewards program.
      </p>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-blue-950">
              <TableRow>
                <TableHead className="text-white font-bold">Member</TableHead>
                <TableHead className="text-white font-bold">Email</TableHead>
                <TableHead className="text-white font-bold">Promotion</TableHead>
                <TableHead className="text-white font-bold">Points Earned</TableHead>
                <TableHead className="text-white font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants && participants.length > 0 ? (
                participants.map((participant) => (
                  <TableRow
                    key={participant.id}
                    className="odd:bg-white even:bg-yellow-50/50 hover:bg-gray-100"
                  >
                    <TableCell className="font-medium">
                      {participant.user.name}
                    </TableCell>
                    <TableCell>{participant.user.email}</TableCell>
                    <TableCell>{participant.promotion.name}</TableCell>
                    <TableCell>{participant.pointsEarned}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

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
import { Participant } from '@/service/promotions/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { User, Award, Info } from 'lucide-react';

export function MembersTable() {
  const {
    data: participants,
    isLoading,
    isError,
  } = useGetParticipants();
  const [selectedParticipant, setSelectedParticipant] =
    React.useState<Participant | null>(null);

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
                <TableHead className="text-white font-bold">
                  Promotion
                </TableHead>
                <TableHead className="text-white font-bold">
                  Points Earned
                </TableHead>
                <TableHead className="text-white font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants && participants.length > 0 ? (
                participants.map(participant => (
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
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedParticipant(participant)}
                        >
                          View details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => console.log('Add points clicked')}
                        >
                          + Add points
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-600 hover:bg-red-50 hover:text-orange-700"
                          onClick={() =>
                            console.log('Subtract points clicked')
                          }
                        >
                          - Subtract points
                        </Button>
                      </div>
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

      <Dialog
        open={!!selectedParticipant}
        onOpenChange={isOpen => !isOpen && setSelectedParticipant(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          {selectedParticipant && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedParticipant.user.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedParticipant.user.email}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <User className="h-5 w-5 text-gray-500" />
                  <span>
                    Participant ID: #{selectedParticipant.id.slice(0, 8)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Award className="h-5 w-5 text-gray-500" />
                  <span>
                    Points Earned:{' '}
                    <strong>{selectedParticipant.pointsEarned}</strong>
                  </span>
                </div>
                <hr />
                <h4 className="font-semibold">Promotion Details</h4>
                <div className="flex items-center gap-4">
                  <Info className="h-5 w-5 text-gray-500" />
                  <span>
                    <strong>{selectedParticipant.promotion.name}</strong>
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedParticipant.promotion.description}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

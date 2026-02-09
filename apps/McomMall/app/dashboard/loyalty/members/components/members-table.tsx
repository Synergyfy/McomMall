'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  useGetParticipants,
  useUpdateParticipantPoints,
} from '@/service/promotions/hook';
import { Participant } from '@/service/promotions/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Award, Info, Search, MoreHorizontal, Plus, Minus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

type EditState = {
  participant: Participant;
  action: 'add' | 'subtract';
};

export function MembersTable() {
  const {
    data: participants,
    isLoading,
    isError,
  } = useGetParticipants();
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [editingState, setEditingState] = useState<EditState | null>(null);
  const [pointsAmount, setPointsAmount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const updatePointsMutation = useUpdateParticipantPoints();

  const handleUpdatePoints = () => {
    if (!editingState) return;

    const amount = editingState.action === 'add' ? pointsAmount : -pointsAmount;

    updatePointsMutation.mutate(
      { participantId: editingState.participant.id, amount },
      {
        onSuccess: () => {
          toast.success('Points updated successfully!');
          setEditingState(null);
          setPointsAmount(0);
        },
        onError: (error) => {
          toast.error(`Failed to update points: ${error.message}`);
        },
      }
    );
  };

  const filteredParticipants = participants?.filter(p => 
    p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">
        Error loading members. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground">Manage your loyal customers and their rewards.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Active Promotion</TableHead>
                <TableHead>Points Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants && filteredParticipants.length > 0 ? (
                filteredParticipants.map((participant) => (
                  <TableRow key={participant.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {participant.user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{participant.user.name}</div>
                          <div className="text-xs text-muted-foreground">{participant.user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {participant.promotion.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-semibold">
                        <Award className="h-4 w-4 text-orange-500" />
                        {participant.pointsEarned.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedParticipant(participant)}>
                            <User className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setEditingState({ participant, action: 'add' })}>
                            <Plus className="mr-2 h-4 w-4 text-green-600" /> Add Points
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingState({ participant, action: 'subtract' })}>
                            <Minus className="mr-2 h-4 w-4 text-red-600" /> Deduct Points
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No members found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Details Modal */}
      <Dialog open={!!selectedParticipant} onOpenChange={(isOpen) => !isOpen && setSelectedParticipant(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedParticipant && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {selectedParticipant.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">{selectedParticipant.user.name}</DialogTitle>
                    <DialogDescription>{selectedParticipant.user.email}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Card className="bg-muted/30 border-none shadow-none">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Award className="h-5 w-5" />
                      <span className="font-medium">Total Points</span>
                    </div>
                    <span className="text-2xl font-bold text-foreground">{selectedParticipant.pointsEarned.toLocaleString()}</span>
                  </CardContent>
                </Card>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Campaign</h4>
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-semibold">{selectedParticipant.promotion.name}</div>
                      <p className="text-sm text-muted-foreground mt-1">{selectedParticipant.promotion.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground pt-2">
                  Participant ID: <span className="font-mono">{selectedParticipant.id}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Points Modal */}
      <Dialog open={!!editingState} onOpenChange={(isOpen) => !isOpen && setEditingState(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {editingState && (
            <>
              <DialogHeader>
                <DialogTitle>{editingState.action === 'add' ? 'Add Points' : 'Deduct Points'}</DialogTitle>
                <DialogDescription>
                  Adjusting balance for <span className="font-medium text-foreground">{editingState.participant.user.name}</span>.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="points">Points Amount</Label>
                  <div className="relative">
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      value={pointsAmount || ''}
                      onChange={(e) => setPointsAmount(Number(e.target.value))}
                      placeholder="0"
                      className="pl-9 text-lg font-semibold"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {editingState.action === 'add' ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm p-3 bg-muted/30 rounded-md">
                  <span className="text-muted-foreground">Current Balance:</span>
                  <span className="font-medium">{editingState.participant.pointsEarned}</span>
                </div>
                <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-md border">
                  <span className="font-medium">New Balance:</span>
                  <span className="font-bold">
                    {editingState.action === 'add' 
                      ? editingState.participant.pointsEarned + pointsAmount 
                      : Math.max(0, editingState.participant.pointsEarned - pointsAmount)}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingState(null)}>Cancel</Button>
                <Button 
                  onClick={handleUpdatePoints} 
                  disabled={updatePointsMutation.isPending || pointsAmount <= 0}
                  className={editingState.action === 'subtract' ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  {updatePointsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirm Adjustment
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Campaign } from '../types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

interface CampaignsTableProps {
  campaigns: Campaign[];
  isLoading: boolean;
  isError: boolean;
}

const StatusBadge = ({ status }: { status: Campaign['status'] }) => {
  const variant = {
    active: 'default',
    paused: 'secondary',
    ended: 'destructive',
  }[status] as 'default' | 'secondary' | 'destructive';

  const color = {
    active: 'bg-green-500',
    paused: 'bg-yellow-500',
    ended: 'bg-red-500',
  }[status];

  return (
    <Badge variant={variant} className="capitalize flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`}></span>
      {status}
    </Badge>
  );
};

export const CampaignsTable = ({
  campaigns,
  isLoading,
  isError,
}: CampaignsTableProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50 text-lg">
          <TableRow>
            <TableHead className="w-[250px]">Listing</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden lg:table-cell">Start Date</TableHead>
            <TableHead className="hidden md:table-cell">Budget</TableHead>
            <TableHead className="hidden lg:table-cell">Placements</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-lg">
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Loading campaigns...
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-red-500">
                Error fetching campaigns.
              </TableCell>
            </TableRow>
          ) : campaigns.length > 0 ? (
            campaigns.map(campaign => (
              <TableRow key={campaign.id} className="p-2">
                <TableCell className="font-medium">
                  {campaign.listingName}
                </TableCell>
                <TableCell>
                  <StatusBadge status={campaign.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell uppercase">
                  {campaign.type}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {format(campaign.startDate, 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col gap-1">
                    <span>
                      {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                    </span>
                    <Progress
                      value={(campaign.spent / campaign.budget) * 100}
                      className="h-2"
                    />
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {campaign.placements.map(p => (
                      <Badge key={p} variant="outline" className="capitalize">
                        {p.replace('_', ' ')}
                      </Badge>
                    ))}
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
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      {campaign.status === 'active' && (
                        <DropdownMenuItem>
                          <Pause className="mr-2 h-4 w-4" /> Pause
                        </DropdownMenuItem>
                      )}
                      {campaign.status === 'paused' && (
                        <DropdownMenuItem>
                          <Play className="mr-2 h-4 w-4" /> Resume
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No campaigns found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Proposal = {
  id: string;
  offeredItem: string;
  requestedItem: string;
  status: "pending" | "accepted" | "declined";
  message?: string;
};

export default function ManageProposalsPage() {
  // 🔹 Mock data (replace with API call later)
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: "1",
      offeredItem: "Old MacBook Air",
      requestedItem: "iPad Pro",
      status: "pending",
      message: "Would you be interested in this trade?",
    },
    {
      id: "2",
      offeredItem: "Gaming Chair",
      requestedItem: "Standing Desk",
      status: "accepted",
    },
  ]);

  const handleAction = (id: string, action: "accept" | "decline") => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: action === "accept" ? "accepted" : "declined" }
          : p
      )
    );

    toast.success(`Proposal ${action === "accept" ? "accepted" : "declined"}!`);
  };

  return (
    <section className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Manage Exchange Proposals
      </h1>

      {proposals.length === 0 ? (
        <p className="text-center text-muted-foreground">No proposals found.</p>
      ) : (
        proposals.map((proposal) => (
          <Card key={proposal.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>
                  {proposal.offeredItem} → {proposal.requestedItem}
                </span>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    proposal.status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : proposal.status === "declined"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {proposal.status.toUpperCase()}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              {proposal.message && (
                <p className="text-sm text-muted-foreground mb-4">
                  "{proposal.message}"
                </p>
              )}
              {proposal.status === "pending" && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAction(proposal.id, "accept")}
                    variant="default"
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleAction(proposal.id, "decline")}
                    variant="destructive"
                  >
                    Decline
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </section>
  );
}

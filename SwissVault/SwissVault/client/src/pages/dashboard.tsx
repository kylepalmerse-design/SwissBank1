import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type User } from "@shared/schema";
import { Header } from "@/components/header";
import { AccountCard } from "@/components/account-card";
import { TransferModal } from "@/components/transfer-modal";
import { formatCurrency, getGreeting } from "@/lib/utils-format";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  if (!user && !isLoading) {
    setLocation("/login");
    return null;
  }

  const totalWealth = user?.accounts.reduce((sum, acc) => sum + acc.balance, 0) || 0;

  const handleTransfer = (accountId: string) => {
    setSelectedAccountId(accountId);
    setTransferModalOpen(true);
  };

  const handleViewTransactions = (accountId: string) => {
    setLocation(`/transactions?account=${accountId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userName={user?.name} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-48" />
            </>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" data-testid="text-greeting">
                {getGreeting()}, {user?.name.split(" ")[0]}
              </h1>
              <p className="text-muted-foreground" data-testid="text-total-wealth">
                Your total wealth: <span className="font-semibold text-foreground">{formatCurrency(totalWealth)}</span>
              </p>
            </>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Accounts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-md" />
                ))}
              </>
            ) : (
              user?.accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onTransfer={handleTransfer}
                  onViewTransactions={handleViewTransactions}
                />
              ))
            )}
          </div>
        </div>

        {user && (
          <TransferModal
            open={transferModalOpen}
            onOpenChange={setTransferModalOpen}
            accounts={user.accounts}
            defaultAccountId={selectedAccountId}
          />
        )}
      </main>
    </div>
  );
}

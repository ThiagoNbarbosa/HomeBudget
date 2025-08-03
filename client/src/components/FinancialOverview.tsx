import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FinancialOverviewProps {
  householdId: string;
}

export default function FinancialOverview({ householdId }: FinancialOverviewProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: [`/api/households/${householdId}/analytics`],
    enabled: !!householdId,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) return false;
      return failureCount < 3;
    },
  });

  if (isLoading) {
    return (
      <section className="px-4 py-6 bg-gradient-to-br from-purple-brand to-violet-700">
        <div className="text-center text-white mb-6">
          <p className="text-sm opacity-90">Saldo Atual</p>
          <Skeleton className="h-8 w-32 mx-auto mb-2 bg-white/20" />
          <Skeleton className="h-4 w-24 mx-auto bg-white/20" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 bg-white/20" />
          <Skeleton className="h-24 bg-white/20" />
        </div>
      </section>
    );
  }

  const currentBalance = analytics?.currentBalance || 0;
  const totalIncome = analytics?.totalIncome || 0;
  const totalExpenses = analytics?.totalExpenses || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  return (
    <section className="px-4 py-6 bg-gradient-to-br from-purple-brand to-violet-700">
      <div className="text-center text-white mb-6">
        <p className="text-sm opacity-90">Saldo Atual</p>
        <h2 className="text-3xl font-bold">{formatCurrency(currentBalance)}</h2>
        <p className="text-sm opacity-75 mt-1">Atualizado agora</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Receitas</p>
              <p className="text-white text-lg font-semibold">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-brand/20 rounded-lg flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-green-brand" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <span className="text-green-300 text-xs">Este mês</span>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Gastos</p>
              <p className="text-white text-lg font-semibold">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-brand/20 rounded-lg flex items-center justify-center">
              <ArrowDown className="w-5 h-5 text-yellow-brand" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <span className="text-yellow-300 text-xs">Este mês</span>
          </div>
        </div>
      </div>
    </section>
  );
}

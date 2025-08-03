import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecentTransactionsProps {
  householdId: string;
}

export default function RecentTransactions({ householdId }: RecentTransactionsProps) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: [`/api/households/${householdId}/transactions?limit=5`],
    enabled: !!householdId,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) return false;
      return failureCount < 3;
    },
  });

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numAmount);
  };

  if (isLoading) {
    return (
      <section className="px-4 py-6 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transações Recentes</h3>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Transações Recentes</h3>
        <Button variant="link" size="sm" className="text-purple-brand p-0">
          Ver todas
        </Button>
      </div>
      
      <div className="space-y-3">
        {transactions && transactions.length > 0 ? (
          transactions.map((transaction: any) => (
            <Card key={transaction.id} className="shadow-sm border border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${transaction.category.color}20` }}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(transaction.date), "d 'de' MMMM, HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      por {transaction.user.firstName}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowUp className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">
                Nenhuma transação encontrada
              </h4>
              <p className="text-sm text-gray-500">
                Suas transações recentes aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}

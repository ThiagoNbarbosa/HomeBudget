import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNavigation from "@/components/BottomNavigation";
import AddTransactionDialog from "@/components/AddTransactionDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Transactions() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Não autorizado",
        description: "Você foi desconectado. Fazendo login novamente...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Get current household
  const { data: household } = useQuery({
    queryKey: ["/api/households/current"],
    enabled: isAuthenticated,
  });

  // Get transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/households", household?.id, "transactions"],
    enabled: !!household?.id,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) return false;
      return failureCount < 3;
    },
  });

  if (isLoading || !household) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-brand mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Transações</h1>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              size="sm"
              className="bg-purple-brand hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>
      </header>

      {/* Transactions List */}
      <div className="p-4">
        {transactionsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-purple-brand" />
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction: any) => (
              <Card key={transaction.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === "income" 
                          ? "bg-green-100" 
                          : "bg-red-100"
                      }`}>
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
                          {transaction.category.name} • {format(new Date(transaction.date), "d 'de' MMMM, HH:mm", { locale: ptBR })}
                        </p>
                        <p className="text-xs text-gray-400">
                          por {transaction.user.firstName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === "income" 
                          ? "text-green-600" 
                          : "text-red-600"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}R$ {parseFloat(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowUp className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma transação encontrada
              </h3>
              <p className="text-gray-500 mb-6">
                Comece adicionando sua primeira receita ou gasto.
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-purple-brand hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Transação
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AddTransactionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        householdId={household.id}
      />

      <BottomNavigation />
    </div>
  );
}

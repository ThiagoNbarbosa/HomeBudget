import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Target } from "lucide-react";

export default function Goals() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  // Get budget goals
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: [`/api/households/${household?.id}/budgets`],
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
          <h1 className="text-xl font-bold text-gray-900">Metas & Orçamentos</h1>
        </div>
      </header>

      {/* Goals List */}
      <div className="p-4">
        {budgetsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-purple-brand" />
          </div>
        ) : budgets && budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.map((budget: any) => {
              const spent = parseFloat(budget.spent || "0");
              const limit = parseFloat(budget.monthlyLimit);
              const percentage = Math.min((spent / limit) * 100, 100);
              const remaining = Math.max(limit - spent, 0);
              
              return (
                <Card key={budget.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${budget.category.color}20` }}
                        >
                          <i 
                            className={`${budget.category.icon} text-lg`}
                            style={{ color: budget.category.color }}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {budget.category.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {budget.transactionCount} transações
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          R$ {spent.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          de R$ {limit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <Progress 
                      value={percentage} 
                      className="h-2 mb-2"
                    />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {percentage.toFixed(1)}% usado
                      </span>
                      <span className={`text-xs ${remaining > 0 ? "text-green-600" : "text-red-600"}`}>
                        {remaining > 0 ? `R$ ${remaining.toFixed(2)} restante` : "Orçamento excedido"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma meta definida
              </h3>
              <p className="text-gray-500">
                As metas de orçamento aparecerão aqui quando você começar a definir limites para suas categorias.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}

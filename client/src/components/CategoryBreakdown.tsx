import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface CategoryBreakdownProps {
  householdId: string;
}

export default function CategoryBreakdown({ householdId }: CategoryBreakdownProps) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: budgets, isLoading } = useQuery({
    queryKey: [`/api/households/${householdId}/budgets?month=${currentMonth}&year=${currentYear}`],
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
          <h3 className="text-lg font-semibold text-gray-900">Gastos por Categoria</h3>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  const expenseBudgets = budgets?.filter((budget: any) => budget.category.type === "expense") || [];

  return (
    <section className="px-4 py-6 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Gastos por Categoria</h3>
        <Button variant="link" size="sm" className="text-purple-brand p-0">
          Detalhes
        </Button>
      </div>
      
      <div className="space-y-4">
        {expenseBudgets.length > 0 ? (
          expenseBudgets.map((budget: any) => {
            const spent = parseFloat(budget.spent || "0");
            const limit = parseFloat(budget.monthlyLimit);
            const percentage = Math.min((spent / limit) * 100, 100);
            const remaining = Math.max(limit - spent, 0);
            
            return (
              <Card key={budget.id} className="shadow-sm border border-gray-100">
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
                        {formatCurrency(spent)}
                      </p>
                      <p className="text-sm text-gray-500">
                        de {formatCurrency(limit)}
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
                      {remaining > 0 ? `${formatCurrency(remaining)} restante` : "Orçamento excedido"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-chart-pie text-2xl text-gray-400" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">
                Nenhum orçamento definido
              </h4>
              <p className="text-sm text-gray-500">
                Defina orçamentos para suas categorias para acompanhar seus gastos.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}

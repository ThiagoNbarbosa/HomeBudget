import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3,
  Calendar,
  Target
} from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Analytics() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Fetch household data
  const { data: household } = useQuery({
    queryKey: ["/api/households/current"],
  });

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: [`/api/households/${household?.id}/analytics`],
    enabled: !!household?.id,
  });

  // Fetch transactions for detailed analysis
  const { data: transactions } = useQuery({
    queryKey: [`/api/households/${household?.id}/transactions`],
    enabled: !!household?.id,
  });

  // Fetch budget goals
  const { data: budgets } = useQuery({
    queryKey: [`/api/households/${household?.id}/budgets`],
    enabled: !!household?.id,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  if (!user || !household) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  const analyticsData = analytics as any;
  const totalIncome = analyticsData?.totalIncome || 0;
  const totalExpenses = analyticsData?.totalExpenses || 0;
  const balance = totalIncome - totalExpenses;
  const categorySpending = analyticsData?.categorySpending || [];

  // Calculate month-over-month growth
  const previousMonthAnalytics = analyticsData?.previousMonth || { totalIncome: 0, totalExpenses: 0 };
  const incomeGrowth = previousMonthAnalytics.totalIncome > 0 
    ? ((totalIncome - previousMonthAnalytics.totalIncome) / previousMonthAnalytics.totalIncome) * 100 
    : 0;
  const expenseGrowth = previousMonthAnalytics.totalExpenses > 0 
    ? ((totalExpenses - previousMonthAnalytics.totalExpenses) / previousMonthAnalytics.totalExpenses) * 100 
    : 0;

  // Top spending categories
  const topCategories = (categorySpending as any[])
    .filter((cat: any) => cat.type === 'expense')
    .sort((a: any, b: any) => parseFloat(b.total) - parseFloat(a.total))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-slate-600 hover:text-slate-800 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="text-center flex-1">
              <h1 className="text-xl font-semibold text-slate-800">Analytics</h1>
              <p className="text-sm text-slate-500 mt-1">
                {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>

            <div className="w-9" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando dados...</p>
          </div>
        ) : (
          <>
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              {/* Balance Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Saldo do Mês</h3>
                    <div className={`text-3xl font-bold mb-2 ${
                      balance >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {formatCurrency(balance)}
                    </div>
                    <p className="text-sm text-slate-600">
                      {balance >= 0 ? 'Você está no positivo!' : 'Gastos superiores às receitas'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Income & Expenses */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-1">Receitas</p>
                        <p className="font-semibold text-slate-800 text-sm">
                          {formatCurrency(totalIncome)}
                        </p>
                        {incomeGrowth !== 0 && (
                          <p className={`text-xs ${incomeGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {incomeGrowth > 0 ? '+' : ''}{incomeGrowth.toFixed(1)}% vs mês anterior
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-red-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-1">Gastos</p>
                        <p className="font-semibold text-slate-800 text-sm">
                          {formatCurrency(totalExpenses)}
                        </p>
                        {expenseGrowth !== 0 && (
                          <p className={`text-xs ${expenseGrowth > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {expenseGrowth > 0 ? '+' : ''}{expenseGrowth.toFixed(1)}% vs mês anterior
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Top Spending Categories */}
            {topCategories.length > 0 && (
              <div className="mb-8">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-slate-800">
                      <PieChart className="w-5 h-5" />
                      <span>Principais Categorias de Gastos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {topCategories.map((category: any, index: number) => {
                      const percentage = totalExpenses > 0 ? (parseFloat(category.total) / totalExpenses) * 100 : 0;
                      return (
                        <div key={category.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{category.icon}</span>
                              <div>
                                <p className="font-medium text-slate-800 text-sm">{category.name}</p>
                                <p className="text-xs text-slate-500">{percentage.toFixed(1)}% do total</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-800 text-sm">
                              {formatCurrency(parseFloat(category.total))}
                            </p>
                            <div className="w-20 bg-slate-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-gradient-to-r from-red-500 to-red-600 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Budget Goals Progress */}
            {budgets && (budgets as any[]).length > 0 && (
              <div className="mb-8">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-slate-800">
                      <Target className="w-5 h-5" />
                      <span>Progresso das Metas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(budgets as any[]).map((budget: any) => {
                      const spent = parseFloat(budget.spent || "0");
                      const limit = parseFloat(budget.monthlyLimit);
                      const percentage = Math.min((spent / limit) * 100, 100);
                      
                      return (
                        <div key={budget.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span>{budget.category.icon}</span>
                              <span className="font-medium text-slate-800 text-sm">
                                {budget.category.name}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500">
                                {formatCurrency(spent)} de {formatCurrency(limit)}
                              </p>
                              <p className={`text-xs font-medium ${
                                percentage > 80 ? 'text-red-600' : 
                                percentage > 60 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {percentage.toFixed(0)}%
                              </p>
                            </div>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                percentage > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                percentage > 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                'bg-gradient-to-r from-green-500 to-green-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium text-slate-800 text-sm mb-2">Análise Detalhada</h3>
                  <p className="text-xs text-slate-600 mb-4">
                    Visualize gráficos detalhados e relatórios completos dos seus gastos
                  </p>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                    Em breve
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Empty State */}
            {!analyticsData || (totalIncome === 0 && totalExpenses === 0) && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-700 mb-2">Sem dados ainda</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                  Comece adicionando algumas transações para ver suas análises financeiras aqui.
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white rounded-xl"
                >
                  Adicionar Transação
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
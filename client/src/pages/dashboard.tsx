import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar,
  Home,
  BarChart3,
  User,
  Settings
} from "lucide-react";
import AddTransactionDialog from "@/components/AddTransactionDialog";
import AddShoppingItemDialog from "@/components/AddShoppingItemDialog";
import BottomNavigation from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isShoppingDialogOpen, setIsShoppingDialogOpen] = useState(false);

  // Fetch household data
  const { data: household } = useQuery({
    queryKey: ["/api/households/current"],
  });

  // Fetch analytics data
  const { data: analytics } = useQuery({
    queryKey: [`/api/households/${household?.id}/analytics`],
    enabled: !!household?.id,
  });

  // Fetch recent transactions
  const { data: transactions } = useQuery({
    queryKey: [`/api/households/${household?.id}/transactions`],
    enabled: !!household?.id,
  });

  // Fetch shopping items
  const { data: shoppingItems } = useQuery({
    queryKey: [`/api/households/${household?.id}/shopping`],
    enabled: !!household?.id,
  });

  // Fetch budget data
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

  const currentBalance = (analytics as any)?.currentBalance || 0;
  const totalIncome = (analytics as any)?.totalIncome || 0;
  const totalExpenses = (analytics as any)?.totalExpenses || 0;
  const recentTransactions = (transactions as any[])?.slice(0, 3) || [];
  const upcomingPurchases = (shoppingItems as any[])?.filter(item => !item.purchased).slice(0, 3) || [];
  const activeBudgets = (budgets as any[])?.slice(0, 2) || [];

  if (!user || !household) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-40">
        <div className="px-6 py-4">
          {/* Brand */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-light text-slate-800 tracking-tight">
              <span className="font-semibold text-blue-900">TTMS</span>
            </h1>
            <p className="text-sm text-slate-500 font-light">
              Track • Target • Manage • Succeed
            </p>
          </div>

          {/* Greeting & Balance */}
          <div className="text-center">
            <h2 className="text-lg font-light text-slate-700 mb-2">
              Olá, <span className="font-medium text-slate-800">{user.firstName}</span>
            </h2>
            <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-4 text-white">
              <p className="text-sm font-light opacity-90 mb-1">Saldo Atual</p>
              <p className="text-2xl font-semibold tracking-tight">
                {formatCurrency(currentBalance)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <section className="px-6 py-6">
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200"
            onClick={() => setIsTransactionDialogOpen(true)}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-medium text-slate-800 text-sm">Nova Transação</h3>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200"
            onClick={() => setIsShoppingDialogOpen(true)}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-medium text-slate-800 text-sm">Adicionar Compra</h3>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Financial Overview */}
      <section className="px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Resumo Financeiro</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-1">Receitas</p>
                  <p className="font-semibold text-slate-800 text-sm truncate">
                    {formatCurrency(totalIncome)}
                  </p>
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
                  <p className="font-semibold text-slate-800 text-sm truncate">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Transações Recentes</h3>
          <Button variant="link" size="sm" className="text-blue-700 p-0 font-medium">
            Ver todas
          </Button>
        </div>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction: any) => (
              <Card key={transaction.id} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        transaction.type === "income" 
                          ? "bg-gradient-to-br from-green-100 to-green-200" 
                          : "bg-gradient-to-br from-red-100 to-red-200"
                      }`}>
                        {transaction.type === "income" ? (
                          <ArrowUpRight className="w-5 h-5 text-green-700" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-700" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(transaction.date), "d 'de' MMM", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${
                        transaction.type === "income" ? "text-green-700" : "text-red-700"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}{formatCurrency(parseFloat(transaction.amount))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Nenhuma transação recente</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Budget Progress */}
      {activeBudgets.length > 0 && (
        <section className="px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Progresso de Metas</h3>
            <Button variant="link" size="sm" className="text-blue-700 p-0 font-medium">
              Ver metas
            </Button>
          </div>
          <div className="space-y-3">
            {activeBudgets.map((budget: any) => {
              const spent = parseFloat(budget.spent || "0");
              const limit = parseFloat(budget.monthlyLimit);
              const percentage = Math.min((spent / limit) * 100, 100);
              
              return (
                <Card key={budget.id} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${budget.category.color}20` }}
                        >
                          <i 
                            className={`${budget.category.icon} text-sm`}
                            style={{ color: budget.category.color }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">
                            {budget.category.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          {formatCurrency(spent)} de {formatCurrency(limit)}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: percentage > 80 ? '#ef4444' : percentage > 60 ? '#f59e0b' : '#10b981'
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Shopping List Preview */}
      {upcomingPurchases.length > 0 && (
        <section className="px-6 py-4 pb-24">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Próximas Compras</h3>
            <Button 
              variant="link" 
              size="sm" 
              className="text-blue-700 p-0 font-medium"
              onClick={() => navigate("/shopping")}
            >
              Ver lista
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingPurchases.map((item: any) => (
              <Card key={item.id} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        item.priority === 'high' ? 'bg-red-500' :
                        item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                        <p className="text-xs text-slate-500">
                          {item.estimatedPriceMin && item.estimatedPriceMax 
                            ? `${formatCurrency(parseFloat(item.estimatedPriceMin))}-${formatCurrency(parseFloat(item.estimatedPriceMax))}`
                            : "Preço não definido"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Bottom spacing for navigation */}
      <div className="h-24" />

      {/* Dialogs */}
      <AddTransactionDialog 
        isOpen={isTransactionDialogOpen} 
        onClose={() => setIsTransactionDialogOpen(false)}
        householdId={household?.id || ""}
      />
      <AddShoppingItemDialog 
        isOpen={isShoppingDialogOpen} 
        onClose={() => setIsShoppingDialogOpen(false)}
        householdId={household?.id || ""}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
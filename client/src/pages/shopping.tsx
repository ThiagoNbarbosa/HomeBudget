import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShoppingCart, 
  Plus, 
  Check, 
  X, 
  ArrowLeft,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import AddShoppingItemDialog from "@/components/AddShoppingItemDialog";
import BottomNavigation from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Shopping() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch household data
  const { data: household } = useQuery({
    queryKey: ["/api/households/current"],
  });

  // Fetch shopping items
  const { data: shoppingItems, isLoading } = useQuery({
    queryKey: [`/api/households/${household?.id}/shopping`],
    enabled: !!household?.id,
  });

  // Mark as purchased mutation
  const markPurchasedMutation = useMutation({
    mutationFn: async ({ itemId, purchased }: { itemId: string; purchased: boolean }) => {
      const response = await apiRequest("PATCH", `/api/shopping/${itemId}`, { 
        purchased,
        purchasedDate: purchased ? new Date().toISOString() : null 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/households", household?.id, "shopping"] });
      toast({
        title: "Item atualizado!",
        description: "Status do item foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar item. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(amount));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Indefinida';
    }
  };

  if (!user || !household) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando lista de compras...</p>
        </div>
      </div>
    );
  }

  const pendingItems = (shoppingItems as any[])?.filter(item => !item.purchased) || [];
  const completedItems = (shoppingItems as any[])?.filter(item => item.purchased) || [];

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
              <h1 className="text-xl font-semibold text-slate-800">Lista de Compras</h1>
              <p className="text-sm text-slate-500 mt-1">
                {pendingItems.length} pendente{pendingItems.length !== 1 ? 's' : ''} • {completedItems.length} concluído{completedItems.length !== 1 ? 's' : ''}
              </p>
            </div>

            <Button
              onClick={() => setIsDialogOpen(true)}
              size="sm"
              className="bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white rounded-xl"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando itens...</p>
          </div>
        ) : (
          <>
            

            {/* Pending Items */}
            {pendingItems.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Itens Pendentes ({pendingItems.length})
                </h2>
                <div className="space-y-3">
                  {pendingItems.map((item: any) => (
                    <Card key={item.id} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`w-3 h-3 rounded-full ${getPriorityColor(item.priority)}`} />
                              <h3 className="font-medium text-slate-800 text-sm">{item.name}</h3>
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                {getPriorityLabel(item.priority)}
                              </span>
                            </div>
                            
                            {(item.estimatedPriceMin || item.estimatedPriceMax) && (
                              <p className="text-sm text-slate-600 mb-2">
                                Preço estimado: {' '}
                                {item.estimatedPriceMin && item.estimatedPriceMax 
                                  ? `${formatCurrency(item.estimatedPriceMin)} - ${formatCurrency(item.estimatedPriceMax)}`
                                  : item.estimatedPriceMin 
                                    ? `a partir de ${formatCurrency(item.estimatedPriceMin)}`
                                    : `até ${formatCurrency(item.estimatedPriceMax)}`
                                }
                              </p>
                            )}

                            {item.url && (
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-blue-700 hover:text-blue-800 mb-2"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Ver produto
                              </a>
                            )}

                            <div className="flex items-center space-x-3 mt-3">
                              <Button
                                onClick={() => markPurchasedMutation.mutate({ itemId: item.id, purchased: true })}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-7"
                                disabled={markPurchasedMutation.isPending}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Comprado
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Items */}
            {completedItems.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <Check className="w-5 h-5 mr-2 text-green-600" />
                  Itens Concluídos ({completedItems.length})
                </h2>
                <div className="space-y-3">
                  {completedItems.map((item: any) => (
                    <Card key={item.id} className="border-0 shadow-sm bg-green-50/80 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                              <h3 className="font-medium text-slate-700 text-sm line-through">{item.name}</h3>
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                            
                            {item.purchasedPrice && (
                              <p className="text-sm text-green-700 font-medium mb-1">
                                Comprado por: {formatCurrency(item.purchasedPrice)}
                              </p>
                            )}

                            {item.purchasedDate && (
                              <p className="text-xs text-slate-500">
                                Comprado em: {new Date(item.purchasedDate).toLocaleDateString('pt-BR')}
                              </p>
                            )}

                            <div className="flex items-center space-x-3 mt-3">
                              <Button
                                onClick={() => markPurchasedMutation.mutate({ itemId: item.id, purchased: false })}
                                size="sm"
                                variant="outline"
                                className="text-xs px-3 py-1 h-7 border-slate-300"
                                disabled={markPurchasedMutation.isPending}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Desfazer
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {pendingItems.length === 0 && completedItems.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-700 mb-2">Lista vazia</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                  Sua lista de compras está vazia. Adicione alguns itens para começar a organizar suas compras.
                </p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Item
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Item Dialog */}
      <AddShoppingItemDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        householdId={household?.id || ""}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
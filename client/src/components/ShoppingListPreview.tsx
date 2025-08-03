import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Check } from "lucide-react";
import AddShoppingItemDialog from "./AddShoppingItemDialog";

interface ShoppingListPreviewProps {
  householdId: string;
}

export default function ShoppingListPreview({ householdId }: ShoppingListPreviewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: shoppingItems, isLoading } = useQuery({
    queryKey: [`/api/households/${householdId}/shopping`],
    enabled: !!householdId,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) return false;
      return failureCount < 3;
    },
  });

  const formatCurrency = (amount: string | number | null) => {
    if (!amount) return "";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numAmount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 border-red-100 text-red-700";
      case "medium":
        return "bg-yellow-50 border-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-50 border-green-100 text-green-700";
      default:
        return "bg-gray-50 border-gray-100 text-gray-700";
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta prioridade";
      case "medium":
        return "Média prioridade";
      case "low":
        return "Baixa prioridade";
      default:
        return "Prioridade";
    }
  };

  if (isLoading) {
    return (
      <section className="px-4 py-6 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Compras</h3>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="w-6 h-6 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  // Show only unpurchased items, sorted by priority
  const unpurchasedItems = shoppingItems?.filter((item: any) => !item.purchased) || [];
  const sortedItems = unpurchasedItems
    .sort((a: any, b: any) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - 
             priorityOrder[a.priority as keyof typeof priorityOrder];
    })
    .slice(0, 3); // Show only first 3 items

  return (
    <>
      <section className="px-4 py-6 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Compras</h3>
          <Button variant="link" size="sm" className="text-purple-brand p-0">
            Ver lista completa
          </Button>
        </div>
        
        <div className="space-y-3">
          {sortedItems.length > 0 ? (
            sortedItems.map((item: any) => {
              const priceRange = item.estimatedPriceMin && item.estimatedPriceMax
                ? `${formatCurrency(item.estimatedPriceMin)}-${formatCurrency(item.estimatedPriceMax)}`
                : "Preço não definido";

              return (
                <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${getPriorityColor(item.priority)}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getPriorityDot(item.priority)}`} />
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {getPriorityLabel(item.priority)} • {priceRange}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-600">
                    <Check className="w-5 h-5" />
                  </Button>
                </div>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shopping-cart text-2xl text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Lista vazia
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Adicione itens à sua lista de compras para organizá-los por prioridade.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="w-full mt-4 bg-purple-brand hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Item
        </Button>
      </section>

      <AddShoppingItemDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        householdId={householdId}
      />
    </>
  );
}

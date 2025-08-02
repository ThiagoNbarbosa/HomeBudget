import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import FinancialOverview from "@/components/FinancialOverview";
import QuickActions from "@/components/QuickActions";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import ShoppingListPreview from "@/components/ShoppingListPreview";
import RecentTransactions from "@/components/RecentTransactions";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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
  const { data: household, isLoading: householdLoading } = useQuery({
    queryKey: ["/api/households/current"],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) return false;
      return failureCount < 3;
    },
  });

  // Create household mutation
  const createHouseholdMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await apiRequest("POST", "/api/households", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/households/current"] });
      toast({
        title: "Casa criada!",
        description: "Sua casa foi criada com sucesso.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Erro",
        description: "Erro ao criar casa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleCreateHousehold = () => {
    const householdName = `Casa de ${user?.firstName || "Usuário"}`;
    createHouseholdMutation.mutate({ name: householdName });
  };

  if (isLoading || householdLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-brand mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!household) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-purple-brand rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Bem-vindo ao TTMS!
            </h2>
            <p className="text-gray-600 mb-6">
              Para começar, vamos criar sua casa financeira onde você e seu parceiro(a) 
              poderão gerenciar as finanças juntos.
            </p>
            <Button
              onClick={handleCreateHousehold}
              disabled={createHouseholdMutation.isPending}
              className="w-full bg-purple-brand hover:bg-purple-700"
            >
              {createHouseholdMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                "Criar Minha Casa"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <FinancialOverview householdId={household.id} />
      <QuickActions householdId={household.id} />
      <CategoryBreakdown householdId={household.id} />
      <ShoppingListPreview householdId={household.id} />
      <RecentTransactions householdId={household.id} />
      <BottomNavigation />
    </div>
  );
}

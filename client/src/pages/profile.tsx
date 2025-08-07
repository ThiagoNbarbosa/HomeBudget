import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Loader2, 
  LogOut, 
  Users, 
  Settings,
  Bell,
  DollarSign,
  Trash2,
  Download,
  AlertTriangle,
  ShieldCheck
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Profile() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

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

  // Get household members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: [`/api/households/${household?.id}/members`],
    enabled: !!household?.id,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) return false;
      return failureCount < 3;
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Reset application data mutation
  const resetAppMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/households/${household?.id}/reset`);
      return response;
    },
    onSuccess: () => {
      // Clear all queries cache
      queryClient.clear();
      
      toast({
        title: "Aplicativo resetado!",
        description: "Todos os dados foram removidos com sucesso.",
      });
      
      // Refresh the page to reload clean state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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
      } else {
        toast({
          title: "Erro",
          description: "Erro ao resetar o aplicativo. Tente novamente.",
          variant: "destructive",
        });
      }
    },
  });

  // Export data mutation
  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", `/api/households/${household?.id}/export`);
      return response.json();
    },
    onSuccess: (data) => {
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ttms-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Dados exportados!",
        description: "Backup dos seus dados foi baixado com sucesso.",
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
      } else {
        toast({
          title: "Erro",
          description: "Erro ao exportar dados. Tente novamente.",
          variant: "destructive",
        });
      }
    },
  });

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  };

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
          <h1 className="text-xl font-bold text-gray-900">Perfil</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* User Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback className="bg-purple-brand text-white text-lg">
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
                <Badge variant="secondary" className="mt-2">
                  Membro ativo
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Household Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Minha Casa</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-900">{household.name}</p>
                <p className="text-sm text-gray-500">
                  Criada em {new Date(household.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>

              {/* Members */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Membros</h4>
                {membersLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-500">Carregando membros...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {members?.map((member: any) => (
                      <div key={member.id} className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.profileImageUrl} />
                          <AvatarFallback className="bg-green-brand text-white text-sm">
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                            {member.id === user?.id && " (Você)"}
                          </p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Configurações</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notification Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Notificações</span>
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    Notificações gerais
                  </Label>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="budget-alerts" className="text-sm font-medium">
                      Alertas de orçamento
                    </Label>
                    <p className="text-xs text-gray-500">Receba alertas quando se aproximar do limite</p>
                  </div>
                  <Switch
                    id="budget-alerts"
                    checked={budgetAlerts}
                    onCheckedChange={setBudgetAlerts}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Data Management */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Gerenciar Dados</span>
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      Backup automático
                    </Label>
                    <p className="text-xs text-gray-500">Backup semanal dos seus dados</p>
                  </div>
                  <Switch
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => exportDataMutation.mutate()}
                  disabled={exportDataMutation.isPending}
                >
                  {exportDataMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Exportar dados
                </Button>
              </div>
            </div>

            <Separator />

            {/* Invite Partner */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                <Users className="w-4 h-4 mr-2" />
                Convidar Parceiro(a)
                <Badge variant="secondary" className="ml-auto">Em breve</Badge>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span>Zona de Perigo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-red-800 mb-2">Resetar Aplicativo</h4>
                <p className="text-sm text-red-600 mb-4">
                  Esta ação irá remover permanentemente todos os dados: transações, metas de orçamento, 
                  lista de compras e configurações. Esta ação não pode ser desfeita.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Resetar Todos os Dados
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center space-x-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Tem certeza absoluta?</span>
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p className="font-medium">Esta ação irá remover permanentemente:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Todas as transações de receitas e gastos</li>
                          <li>Todas as metas de orçamento configuradas</li>
                          <li>Toda a lista de compras</li>
                          <li>Histórico de analytics e relatórios</li>
                          <li>Configurações personalizadas</li>
                        </ul>
                        <p className="text-red-600 font-medium mt-3">
                          Esta ação não pode ser desfeita. Recomendamos fazer um backup antes.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => resetAppMutation.mutate()}
                        disabled={resetAppMutation.isPending}
                      >
                        {resetAppMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Resetando...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sim, resetar tudo
                          </>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardContent className="p-6">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}

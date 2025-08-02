import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartLine, Users, Target, ShoppingCart } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-brand to-violet-700 flex flex-col">
      {/* Header */}
      <header className="p-6 text-center">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ChartLine className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">TTMS</h1>
        <p className="text-white/80 text-lg">Track, Target, Manage, Succeed</p>
        <p className="text-white/60 mt-2">Controle financeiro colaborativo para casais</p>
      </header>

      {/* Features */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto space-y-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-brand rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Colaborativo</h3>
              <p className="text-white/70 text-sm">
                Gerencie as finanças do casal em tempo real com sincronização automática
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-brand rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-gray-800" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Metas & Orçamentos</h3>
              <p className="text-white/70 text-sm">
                Defina metas por categoria e acompanhe o progresso mensalmente
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Lista Inteligente</h3>
              <p className="text-white/70 text-sm">
                Organize compras por prioridade e compare preços historicamente
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="p-6">
        <Button
          onClick={() => window.location.href = '/api/login'}
          className="w-full bg-white text-purple-brand hover:bg-gray-100 font-semibold py-4 text-lg"
        >
          Começar Agora
        </Button>
        <p className="text-white/60 text-center text-sm mt-4">
          Entre com sua conta para começar a gerenciar suas finanças
        </p>
      </div>
    </div>
  );
}

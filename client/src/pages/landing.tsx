import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Settings, ShoppingCart } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-8">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-slate-800 tracking-tight">
            <span className="font-semibold text-blue-900">TTMS</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-slate-600 font-light">
            Track • Target • Manage • Succeed
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-slate-800 mb-6 leading-tight">
              Controle Financeiro
              <br />
              <span className="text-blue-900 font-medium">Familiar Inteligente</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
              Gerencie suas finanças familiares com elegância e simplicidade. 
              Uma ferramenta completa para casais que desejam alcançar suas metas financeiras juntos.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Gestão Familiar */}
            <Card className="group p-8 text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <User className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                Gestão Familiar
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Sincronize gastos e receitas entre todos os membros da família. 
                Transparência total nas finanças domésticas.
              </p>
            </Card>

            {/* Controle Inteligente */}
            <Card className="group p-8 text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Settings className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                Controle Inteligente
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Defina metas, monitore orçamentos e receba insights personalizados 
                para otimizar seus gastos mensais.
              </p>
            </Card>

            {/* Lista de Compras */}
            <Card className="group p-8 text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                Planejamento de Compras
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Organize listas de compras colaborativas com estimativas de preço 
                e controle de prioridades familiares.
              </p>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="px-12 py-4 text-lg font-medium bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Começar Agora
            </Button>
            <p className="mt-4 text-sm text-slate-500">
              Acesso gratuito com sua conta Replit
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-12 pt-8">
        <div className="container mx-auto px-6 text-center">
          <blockquote className="text-xl md:text-2xl font-light text-slate-700 italic leading-relaxed">
            "Família é onde começa o planejamento e floresce o sucesso."
          </blockquote>
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              © 2025 TTMS - Sistema de Gestão Financeira Familiar
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
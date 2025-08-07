import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ShoppingCart, Target, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/shopping", icon: ShoppingCart, label: "Compras" },
    { path: "/goals", icon: Target, label: "Metas" },
    { path: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-slate-200/50 px-6 py-3 z-40 shadow-lg">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center py-2 px-3 h-auto rounded-xl transition-all duration-300",
                isActive 
                  ? "text-blue-700 bg-blue-50" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}

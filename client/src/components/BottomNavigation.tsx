import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowUpDown, Target, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/transactions", icon: ArrowUpDown, label: "Transações" },
    { path: "/goals", icon: Target, label: "Metas" },
    { path: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
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
                "flex flex-col items-center py-2 px-3 h-auto",
                isActive ? "text-purple-brand" : "text-gray-400 hover:text-gray-600"
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

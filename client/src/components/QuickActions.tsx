import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import AddTransactionDialog from "./AddTransactionDialog";
import AddShoppingItemDialog from "./AddShoppingItemDialog";

interface QuickActionsProps {
  householdId: string;
}

export default function QuickActions({ householdId }: QuickActionsProps) {
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">("income");
  const [isShoppingDialogOpen, setIsShoppingDialogOpen] = useState(false);

  const handleAddIncome = () => {
    setTransactionType("income");
    setIsTransactionDialogOpen(true);
  };

  const handleAddExpense = () => {
    setTransactionType("expense");
    setIsTransactionDialogOpen(true);
  };

  const handleOpenShoppingList = () => {
    setIsShoppingDialogOpen(true);
  };

  return (
    <>
      <section className="px-4 py-4 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ações Rápidas</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={handleAddIncome}
            variant="outline"
            className="flex flex-col items-center p-4 h-auto bg-green-50 border-green-100 hover:bg-green-100 text-gray-700"
          >
            <div className="w-12 h-12 bg-green-brand rounded-lg flex items-center justify-center mb-2">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium">Receita</span>
          </Button>
          
          <Button
            onClick={handleAddExpense}
            variant="outline"
            className="flex flex-col items-center p-4 h-auto bg-red-50 border-red-100 hover:bg-red-100 text-gray-700"
          >
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-2">
              <Minus className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium">Gasto</span>
          </Button>
          
          <Button
            onClick={handleOpenShoppingList}
            variant="outline"
            className="flex flex-col items-center p-4 h-auto bg-yellow-50 border-yellow-100 hover:bg-yellow-100 text-gray-700"
          >
            <div className="w-12 h-12 bg-yellow-brand rounded-lg flex items-center justify-center mb-2">
              <ShoppingCart className="w-6 h-6 text-gray-800" />
            </div>
            <span className="text-sm font-medium">Compras</span>
          </Button>
        </div>
      </section>

      <AddTransactionDialog
        isOpen={isTransactionDialogOpen}
        onClose={() => setIsTransactionDialogOpen(false)}
        householdId={householdId}
        defaultType={transactionType}
      />

      <AddShoppingItemDialog
        isOpen={isShoppingDialogOpen}
        onClose={() => setIsShoppingDialogOpen(false)}
        householdId={householdId}
      />
    </>
  );
}

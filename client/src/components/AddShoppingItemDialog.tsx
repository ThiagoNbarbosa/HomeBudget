import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const shoppingItemSchema = z.object({
  name: z.string().min(1, "Nome do item é obrigatório"),
  estimatedPriceMin: z.string().optional(),
  estimatedPriceMax: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  url: z.string().optional(),
  householdId: z.string(),
});

type ShoppingItemForm = z.infer<typeof shoppingItemSchema>;

interface AddShoppingItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  householdId: string;
}

export default function AddShoppingItemDialog({
  isOpen,
  onClose,
  householdId,
}: AddShoppingItemDialogProps) {
  const { toast } = useToast();

  const form = useForm<ShoppingItemForm>({
    resolver: zodResolver(shoppingItemSchema),
    defaultValues: {
      name: "",
      estimatedPriceMin: "",
      estimatedPriceMax: "",
      priority: "medium",
      url: "",
      householdId,
    },
  });

  // Create shopping item mutation
  const createItemMutation = useMutation({
    mutationFn: async (data: ShoppingItemForm) => {
      const response = await apiRequest("POST", "/api/shopping", {
        ...data,
        estimatedPriceMin: data.estimatedPriceMin ? parseFloat(data.estimatedPriceMin) : null,
        estimatedPriceMax: data.estimatedPriceMax ? parseFloat(data.estimatedPriceMax) : null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/households", householdId, "shopping"] });
      
      toast({
        title: "Item adicionado!",
        description: "O item foi adicionado à sua lista de compras.",
      });
      
      form.reset();
      onClose();
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
        description: "Erro ao adicionar item. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ShoppingItemForm) => {
    createItemMutation.mutate(data);
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return priority;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Item à Lista</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Item</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Micro-ondas, Tênis..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full" />
                          <span>Alta</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                          <span>Média</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <span>Baixa</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedPriceMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Mín. (R$)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          R$
                        </span>
                        <Input
                          type="text"
                          placeholder="0,00"
                          className="pl-10"
                          value={field.value ? 
                            parseFloat(field.value).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }) : ''
                          }
                          onChange={(e) => {
                            let value = e.target.value;
                            
                            // Remove tudo que não é dígito
                            value = value.replace(/\D/g, '');
                            
                            // Se vazio, define como vazio
                            if (!value) {
                              field.onChange('');
                              return;
                            }
                            
                            // Converte para centavos (divide por 100)
                            const numericValue = parseInt(value, 10) / 100;
                            
                            // Salva o valor numérico para o formulário
                            field.onChange(numericValue.toString());
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedPriceMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Máx. (R$)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          R$
                        </span>
                        <Input
                          type="text"
                          placeholder="0,00"
                          className="pl-10"
                          value={field.value ? 
                            parseFloat(field.value).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }) : ''
                          }
                          onChange={(e) => {
                            let value = e.target.value;
                            
                            // Remove tudo que não é dígito
                            value = value.replace(/\D/g, '');
                            
                            // Se vazio, define como vazio
                            if (!value) {
                              field.onChange('');
                              return;
                            }
                            
                            // Converte para centavos (divide por 100)
                            const numericValue = parseInt(value, 10) / 100;
                            
                            // Salva o valor numérico para o formulário
                            field.onChange(numericValue.toString());
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link do Produto (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createItemMutation.isPending}
                className="flex-1 bg-purple-brand hover:bg-purple-700"
              >
                {createItemMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  "Adicionar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

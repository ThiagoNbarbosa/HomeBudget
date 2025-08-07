import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const incomeSubtypes = [
  { value: "contra_cheque", label: "Valor contra cheque" },
  { value: "fgts", label: "Valor FGTS" },
  { value: "descontos", label: "Valor descontos" },
  { value: "extra", label: "Extra" },
] as const;

const transactionSchema = z.object({
  description: z.string().optional(),
  amount: z.string().optional(),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  householdId: z.string(),
  // Salary specific fields
  valorContraCheque: z.string().optional(),
  valorFGTS: z.string().optional(),
  valorDescontos: z.string().optional(),
  extra: z.string().optional(),
}).refine((data) => {
  const selectedCategoryName = "Salário"; // This will be checked in the component
  if (selectedCategoryName === "Salário") {
    return (data.valorContraCheque && parseFloat(data.valorContraCheque) > 0);
  }
  return data.description && data.description.trim().length > 0 && data.amount && parseFloat(data.amount) > 0;
}, {
  message: "Preencha os campos obrigatórios",
  path: ["description"],
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface AddTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  householdId: string;
  defaultType?: "income" | "expense";
}

export default function AddTransactionDialog({
  isOpen,
  onClose,
  householdId,
  defaultType = "expense",
}: AddTransactionDialogProps) {
  const { toast } = useToast();

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: "",
      type: defaultType,
      categoryId: "",
      householdId,
      valorContraCheque: "",
      valorFGTS: "",
      valorDescontos: "",
      extra: "",
    },
  });

  // Get categories
  const { data: categories } = useQuery({
    queryKey: [`/api/households/${householdId}/categories`],
    enabled: !!householdId && isOpen,
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionForm) => {
      const response = await apiRequest("POST", "/api/transactions", {
        ...data,
        amount: parseFloat(data.amount),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/households/${householdId}/transactions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/households/${householdId}/analytics`] });
      queryClient.invalidateQueries({ queryKey: [`/api/households/${householdId}/budgets`] });
      
      toast({
        title: "Transação adicionada!",
        description: "Sua transação foi registrada com sucesso.",
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
        description: "Erro ao adicionar transação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransactionForm) => {
    const selectedCategory = (categories as any[])?.find(cat => cat.id === data.categoryId);
    let finalAmount: number;
    let finalDescription: string;
    
    if (selectedCategory?.name === 'Salário') {
      const contraCheque = parseFloat(data.valorContraCheque || "0");
      const fgts = parseFloat(data.valorFGTS || "0");
      const descontos = parseFloat(data.valorDescontos || "0");
      finalAmount = contraCheque + fgts - descontos;
      
      // Build description from salary components
      const parts = [];
      if (contraCheque > 0) parts.push(`Contra cheque: ${formatCurrency(contraCheque)}`);
      if (fgts > 0) parts.push(`FGTS: ${formatCurrency(fgts)}`);
      if (descontos > 0) parts.push(`Descontos: ${formatCurrency(descontos)}`);
      if (data.extra) parts.push(`Extra: ${data.extra}`);
      
      finalDescription = `Salário - ${parts.join(', ')}`;
    } else {
      finalAmount = parseFloat(data.amount || "0");
      finalDescription = data.description || "";
    }
    
    createTransactionMutation.mutate({
      ...data,
      amount: finalAmount.toString(),
      description: finalDescription,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const watchedType = form.watch("type");
  const watchedCategoryId = form.watch("categoryId");
  const filteredCategories = (categories as any[])?.filter((cat: any) => cat.type === watchedType) || [];
  const selectedCategory = (categories as any[])?.find(cat => cat.id === watchedCategoryId);
  const isSalaryCategory = selectedCategory?.name === 'Salário';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Adicionar {watchedType === "income" ? "Receita" : "Gasto"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("categoryId", ""); // Reset category when type changes
                      // Reset salary fields
                      form.setValue("valorContraCheque", "");
                      form.setValue("valorFGTS", "");
                      form.setValue("valorDescontos", "");
                      form.setValue("extra", "");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Gasto</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset salary fields when category changes
                        form.setValue("valorContraCheque", "");
                        form.setValue("valorFGTS", "");
                        form.setValue("valorDescontos", "");
                        form.setValue("extra", "");
                      }} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center space-x-2">
                              <span>{category.icon}</span>
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isSalaryCategory && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Supermercado, Conta de luz..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Salary-specific fields */}
            {isSalaryCategory && (
              <>
                <FormField
                  control={form.control}
                  name="valorContraCheque"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor contra cheque (R$)</FormLabel>
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
                              value = value.replace(/\D/g, '');
                              if (!value) {
                                field.onChange('');
                                return;
                              }
                              const numericValue = parseInt(value, 10) / 100;
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
                  name="valorFGTS"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor FGTS (R$)</FormLabel>
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
                              value = value.replace(/\D/g, '');
                              if (!value) {
                                field.onChange('');
                                return;
                              }
                              const numericValue = parseInt(value, 10) / 100;
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
                  name="valorDescontos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor descontos (R$)</FormLabel>
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
                              value = value.replace(/\D/g, '');
                              if (!value) {
                                field.onChange('');
                                return;
                              }
                              const numericValue = parseInt(value, 10) / 100;
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
                  name="extra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extra (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Bonus, Vale alimentação..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {!isSalaryCategory && (
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
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
                            
                            // Se vazio, define como 0
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
            )}

            {/* Total calculation display for salary */}
            {isSalaryCategory && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <FormLabel className="text-blue-800 font-medium">Total Calculado</FormLabel>
                <div className="text-2xl font-semibold text-blue-900 mt-2">
                  {(() => {
                    const contraCheque = parseFloat(form.watch("valorContraCheque") || "0");
                    const fgts = parseFloat(form.watch("valorFGTS") || "0");
                    const descontos = parseFloat(form.watch("valorDescontos") || "0");
                    const total = contraCheque + fgts - descontos;
                    return new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(total);
                  })()}
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Contra cheque + FGTS - Descontos
                </p>
              </div>
            )}



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
                disabled={createTransactionMutation.isPending}
                className="flex-1 bg-purple-brand hover:bg-purple-700"
              >
                {createTransactionMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

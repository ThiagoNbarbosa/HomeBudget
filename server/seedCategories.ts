import { storage } from './storage';
import { categories } from '@shared/schema';

const DEFAULT_CATEGORIES = [
  // Expense categories
  { name: 'Casa & Moradia', icon: '🏠', color: '#8B5CF6', type: 'expense' },
  { name: 'Alimentação', icon: '🛒', color: '#10B981', type: 'expense' },
  { name: 'Transporte', icon: '🚗', color: '#F59E0B', type: 'expense' },
  { name: 'Contas Básicas', icon: '💡', color: '#EF4444', type: 'expense' },
  { name: 'Saúde', icon: '⚕️', color: '#EC4899', type: 'expense' },
  { name: 'Educação', icon: '📚', color: '#3B82F6', type: 'expense' },
  { name: 'Vestuário', icon: '👕', color: '#F97316', type: 'expense' },
  { name: 'Lazer & Entretenimento', icon: '🎬', color: '#8B5CF6', type: 'expense' },
  { name: 'Cuidados Pessoais', icon: '💅', color: '#EC4899', type: 'expense' },
  { name: 'Outros', icon: '📦', color: '#6B7280', type: 'expense' },
  
  // Income categories
  { name: 'Salário', icon: '💰', color: '#10B981', type: 'income' },
  { name: 'Freelance', icon: '💼', color: '#3B82F6', type: 'income' },
  { name: 'Investimentos', icon: '📈', color: '#8B5CF6', type: 'income' },
  { name: 'Vendas', icon: '🛍️', color: '#F59E0B', type: 'income' },
  { name: 'Outras Receitas', icon: '💎', color: '#10B981', type: 'income' },
];

export async function seedDefaultCategories(householdId: string) {
  try {
    // Check if categories already exist for this household
    const existingCategories = await storage.getHouseholdCategories(householdId);

    if (existingCategories.length > 0) {
      console.log(`Categories already exist for household ${householdId}`);
      return existingCategories;
    }

    // Insert default categories
    const insertedCategories = [];
    for (const cat of DEFAULT_CATEGORIES) {
      const category = await storage.createCategory({
        ...cat,
        householdId,
        type: cat.type as 'income' | 'expense',
      });
      insertedCategories.push(category);
    }
    
    console.log(`Seeded ${insertedCategories.length} default categories for household ${householdId}`);
    return insertedCategories;
  } catch (error) {
    console.error('Error seeding default categories:', error);
    throw error;
  }
}
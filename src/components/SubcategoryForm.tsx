
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Category, Subcategory } from '@/types/category';
import { Loader2 } from 'lucide-react';

interface SubcategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory?: Subcategory | null;
  categoryId?: number | null;
  categories: Category[];
  onSave: () => void;
}

export function SubcategoryForm({ 
  isOpen, 
  onClose, 
  subcategory, 
  categoryId, 
  categories, 
  onSave 
}: SubcategoryFormProps) {
  const [formData, setFormData] = useState<Partial<Subcategory>>({
    Name: '',
    Description: '',
    CategoryId: categoryId || 0,
    MercadoLivreCategoryId: '',
    MercadoLivreCategoryName: '',
    Is_active: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mercadoLivreCategories, setMercadoLivreCategories] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (subcategory) {
      setFormData(subcategory);
    } else {
      setFormData({
        Name: '',
        Description: '',
        CategoryId: categoryId || 0,
        MercadoLivreCategoryId: '',
        MercadoLivreCategoryName: '',
        Is_active: true,
      });
    }
  }, [subcategory, categoryId]);

  useEffect(() => {
    if (isOpen) {
      loadMercadoLivreCategories();
    }
  }, [isOpen]);

  const loadMercadoLivreCategories = async () => {
    try {
      const data = await apiService.getMercadoLivreCategories();
      setMercadoLivreCategories(data);
    } catch (error) {
      console.log('Erro ao carregar categorias do Mercado Livre:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.Name?.trim() || !formData.CategoryId) {
      toast({
        title: "Erro de validação",
        description: "Nome da subcategoria e categoria são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await apiService.saveSubcategory(formData as Subcategory);
      
      toast({
        title: subcategory ? "Subcategoria atualizada" : "Subcategoria criada",
        description: subcategory 
          ? "A subcategoria foi atualizada com sucesso." 
          : "A subcategoria foi criada com sucesso.",
      });
      
      onSave();
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar subcategoria",
        description: "Não foi possível salvar a subcategoria.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMercadoLivreCategoryChange = (value: string) => {
    const selectedCategory = mercadoLivreCategories.find(cat => cat.id === value);
    setFormData(prev => ({
      ...prev,
      MercadoLivreCategoryId: value,
      MercadoLivreCategoryName: selectedCategory?.name || ''
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {subcategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={formData.CategoryId?.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, CategoryId: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.Id} value={category.Id!.toString()}>
                    {category.Name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.Name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, Name: e.target.value }))}
              placeholder="Nome da subcategoria"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.Description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, Description: e.target.value }))}
              placeholder="Descrição da subcategoria"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ml-category">Categoria do Mercado Livre</Label>
            <Select
              value={formData.MercadoLivreCategoryId || ''}
              onValueChange={handleMercadoLivreCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria do ML" />
              </SelectTrigger>
              <SelectContent>
                {mercadoLivreCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.MercadoLivreCategoryName && (
              <p className="text-sm text-muted-foreground">
                Selecionado: {formData.MercadoLivreCategoryName}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.Is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, Is_active: checked }))}
            />
            <Label htmlFor="is_active">Subcategoria ativa</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

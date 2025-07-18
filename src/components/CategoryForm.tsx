
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
import { Category } from '@/types/category';
import { Loader2 } from 'lucide-react';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSave: () => void;
}

export function CategoryForm({ isOpen, onClose, category, onSave }: CategoryFormProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    Name: '',
    Parent_Id: null,
    Is_Final: true,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({
        Name: '',
        Parent_Id: null,
        Is_Final: true,
      });
    }
  }, [category]);

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.Name?.trim()) {
      toast({
        title: "Erro de validação",
        description: "Nome da categoria é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await apiService.saveCategory(formData as Category);
      
      toast({
        title: category ? "Categoria atualizada" : "Categoria criada",
        description: category 
          ? "A categoria foi atualizada com sucesso." 
          : "A categoria foi criada com sucesso.",
      });
      
      onSave();
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar categoria",
        description: "Não foi possível salvar a categoria.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableParentCategories = categories.filter(cat => 
    cat.Id !== category?.Id && !cat.Is_Final
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.Name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, Name: e.target.value }))}
              placeholder="Nome da categoria"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Categoria Pai</Label>
            <Select
              value={formData.Parent_Id?.toString() || ''}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                Parent_Id: value ? parseInt(value) : null 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria pai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma (categoria raiz)</SelectItem>
                {availableParentCategories.map((cat) => (
                  <SelectItem key={cat.Id} value={cat.Id!.toString()}>
                    {cat.Name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_final"
              checked={formData.Is_Final}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, Is_Final: checked }))}
            />
            <Label htmlFor="is_final">Categoria final (permite produtos)</Label>
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

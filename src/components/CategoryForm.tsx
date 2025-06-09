
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
    Description: '',
    Is_active: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({
        Name: '',
        Description: '',
        Is_active: true,
      });
    }
  }, [category]);

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
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.Description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, Description: e.target.value }))}
              placeholder="Descrição da categoria"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.Is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, Is_active: checked }))}
            />
            <Label htmlFor="is_active">Categoria ativa</Label>
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

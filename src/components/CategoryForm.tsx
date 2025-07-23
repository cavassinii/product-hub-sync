import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiService } from '@/services/api';
import { Category } from '@/types/category';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Info, FolderTree } from 'lucide-react';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  category?: Category | null;
  parentId?: number | null;
}

export function CategoryForm({ isOpen, onClose, onSave, category, parentId }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    parent_id: parentId || null as number | null,
    is_final: false,
  });
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const fetchAndSet = async () => {
        await loadCategories();
        if (category) {
          setFormData({
            id: category.id,
            name: category.name,
            parent_id: category.parent_id,
            is_final: category.is_final,
          });
        } else {
          setFormData({
            id: 0,
            name: '',
            parent_id: parentId || null,
            is_final: false,
          });
        }
      };
      fetchAndSet();
    }
  }, [isOpen, category, parentId]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getCategories();
      setAllCategories(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome da categoria.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const categoryData = {
        id: formData.id,
        name: formData.name.trim(),
        parent_id: parentId || null,
        is_final: formData.is_final,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await apiService.saveCategory(categoryData as Category);

      toast({
        title: category ? "Categoria atualizada" : "Categoria criada",
        description: category 
          ? "A categoria foi atualizada com sucesso." 
          : "A nova categoria foi criada com sucesso.",
      });

      onSave();
    } catch (error) {
      toast({
        title: "Erro ao salvar categoria",
        description: "Não foi possível salvar a categoria.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const availableParentCategories = allCategories.filter(cat => 
    !cat.is_final && cat.id !== formData.id
  );

  const getParentCategoryPath = (categoryId: number | null): string => {
    if (!categoryId) return '';
    
    const category = allCategories.find(cat => cat.id === categoryId);
    if (!category) return '';
    
    const path = [category.name];
    let currentParentId = category.parent_id;
    
    while (currentParentId) {
      const parentCategory = allCategories.find(cat => cat.id === currentParentId);
      if (!parentCategory) break;
      path.unshift(parentCategory.name);
      currentParentId = parentCategory.parent_id;
    }
    
    return path.join(' > ');
  };

  const selectedParentPath = getParentCategoryPath(formData.parent_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FolderTree className="h-5 w-5" />
            <span>{category ? 'Editar Categoria' : 'Nova Categoria'}</span>
          </DialogTitle>
          <DialogDescription>
            {category 
              ? 'Edite as informações da categoria selecionada.'
              : 'Crie uma nova categoria para organizar seus produtos.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preview da hierarquia atual */}
          {selectedParentPath && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Hierarquia:</p>
                  <p className="text-sm text-muted-foreground">{selectedParentPath} &gt; <strong>{formData.name || 'Nova categoria'}</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* Nome da categoria */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Categoria *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome da categoria"
              required
            />
          </div>

          {/* Categoria pai (apenas exibição, não editável) */}
          <div className="space-y-2">
            <Label>Categoria Pai</Label>
            <Input
              value={getParentCategoryPath(formData.parent_id) || 'Nenhuma (categoria raiz)'}
              readOnly
              disabled
              className="bg-muted/50 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              A categoria pai é definida pela listagem atual e não pode ser alterada aqui.
            </p>
          </div>

          {/* Categoria final */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="is_final" className="text-sm font-medium">
                É uma categoria final?
              </Label>
              <p className="text-xs text-muted-foreground">
                Categorias finais podem ser usadas nos produtos. Categorias intermediárias servem apenas para organização.
              </p>
            </div>
            <Switch
              id="is_final"
              checked={formData.is_final}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_final: checked }))}
            />
          </div>

          {/* Explicações dos tipos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary">Intermediária</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Usada apenas para organizar outras categorias. Pode ter subcategorias.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="default">Final</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Pode ser atribuída aos produtos. Não pode ter subcategorias.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {category ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
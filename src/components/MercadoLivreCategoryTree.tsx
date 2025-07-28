import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, Search, Package, Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';
import { MercadoLivreCategory } from '@/types/marketplace';
import { useToast } from '@/hooks/use-toast';

interface MercadoLivreCategoryTreeProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  categoryId?: number; // NOVO: id da categoria interna
  onLinked?: () => void | Promise<void>; // NOVO
  linkedMlId?: string; // NOVO: mlId já vinculado
}

interface TreeNodeProps {
  category: MercadoLivreCategory;
  level: number;
  onSelect: (category: MercadoLivreCategory) => void;
  searchTerm: string;
}

function TreeNode({ category, level, onSelect, searchTerm }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  
  const matchesSearch = !searchTerm || 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.mlId.toLowerCase().includes(searchTerm.toLowerCase());
    
  const hasMatchingChildren = category.children?.some(child => 
    child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.mlId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hasMatchingDescendants(child, searchTerm)
  );

  if (!matchesSearch && !hasMatchingChildren) {
    return null;
  }

  return (
    <div className="w-full">
      <div 
        className={`flex items-center space-x-2 py-2 px-3 hover:bg-accent rounded-md cursor-pointer ${
          level > 0 ? `ml-${level * 4}` : ''
        }`}
        style={{ marginLeft: level * 16 }}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6" />
        )}
        
        <div className="flex-1 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium">{category.name}</p>
            <p className="text-xs text-muted-foreground">{category.mlId}</p>
          </div>
          {/* Alteração: Só permitir selecionar categorias finais (sem filhos) */}
          {!hasChildren && (
            <Button
              size="sm"
              onClick={() => onSelect(category)}
              className="ml-2"
            >
              Selecionar
            </Button>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="space-y-1">
          {category.children!.map((child) => (
            <TreeNode
              key={child.mlId}
              category={child}
              level={level + 1}
              onSelect={onSelect}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function hasMatchingDescendants(category: MercadoLivreCategory, searchTerm: string): boolean {
  if (!category.children) return false;
  
  return category.children.some(child => 
    child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.mlId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hasMatchingDescendants(child, searchTerm)
  );
}

export function MercadoLivreCategoryTree({ 
  isOpen, 
  onClose, 
  categoryName,
  categoryId,
  onLinked,
  linkedMlId, // NOVO
}: MercadoLivreCategoryTreeProps) {
  const [categoryTree, setCategoryTree] = useState<MercadoLivreCategory | MercadoLivreCategory[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MercadoLivreCategory | null>(null);
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false); // Para loading do botão

  useEffect(() => {
    if (isOpen) {
      console.log('MercadoLivreCategoryTree modal opened');
      setCategoryTree(null); // Limpa a árvore sempre que abrir
      setIsLoading(true);    // Mostra loading imediatamente
      setSelectedCategory(null); // Limpa seleção anterior
      loadCategoryTree();
    }
  }, [isOpen]);

  // Seleção automática da categoria vinculada
  useEffect(() => {
    if (categoryTree && linkedMlId) {
      const findCategoryByMlId = (cat: MercadoLivreCategory | MercadoLivreCategory[], mlId: string): MercadoLivreCategory | null => {
        if (Array.isArray(cat)) {
          for (const c of cat) {
            const found = findCategoryByMlId(c, mlId);
            if (found) return found;
          }
          return null;
        }
        if (cat.mlId === mlId) return cat;
        if (cat.children) {
          for (const child of cat.children) {
            const found = findCategoryByMlId(child, mlId);
            if (found) return found;
          }
        }
        return null;
      };
      const found = findCategoryByMlId(categoryTree, linkedMlId);
      if (found) setSelectedCategory(found);
    }
  }, [categoryTree, linkedMlId]);

  const loadCategoryTree = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching ML category tree...');
      const data = await apiService.getMercadoLivreCategoryTree();
      setCategoryTree(data);
      console.log('ML category tree loaded:', data);
    } catch (error) {
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar as categorias do Mercado Livre.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCategory = (mlCategory: MercadoLivreCategory) => {
    setSelectedCategory(mlCategory);
  };

  const handleConfirmSelection = async () => {
    if (!selectedCategory || !categoryId) {
      console.warn('handleConfirmSelection: selectedCategory or categoryId is missing', { selectedCategory, categoryId });
      toast({
        title: "Seleção inválida",
        description: "Selecione uma categoria do Mercado Livre e tente novamente.",
        variant: "destructive",
      });
      return;
    }
    setIsConfirming(true);
    console.debug('Iniciando requisição saveCategoryChannel', {
      category_channel_id: selectedCategory.mlId,
      category_id: categoryId,
      channel_id: 1,
      selectedCategory,
    });
    try {
      const response = await apiService.saveCategoryChannel({
        category_channel_id: selectedCategory.mlId, // ou outro valor se necessário
        category_id: categoryId,
        channel_id: 1, // ou CHANNELS.MERCADO_LIVRE, se definido
      });
      console.debug('saveCategoryChannel: sucesso', response);
      toast({
        title: "Vínculo criado com sucesso",
        description: `Categoria vinculada ao Mercado Livre.`,
      });
      if (onLinked) await onLinked(); // CHAME O CALLBACK AQUI!
      setSelectedCategory(null);
      onClose();
    } catch (error) {
      console.error('saveCategoryChannel: erro', error);
      toast({
        title: "Erro ao vincular categoria",
        description: "Não foi possível vincular a categoria ao marketplace.",
        variant: "destructive",
      });
      // Feche o modal mesmo em caso de erro, se desejar:
      onClose();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-yellow-500" />
            <span>Categorias do Mercado Livre</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Selecione uma categoria do Mercado Livre para vincular à categoria "{categoryName}"
          </p>
        </DialogHeader>

        {selectedCategory && (
          <div className="bg-accent rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Categoria selecionada:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory.name} ({selectedCategory.mlId})
                </p>
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                  Cancelar Seleção
                </Button>
                <Button onClick={handleConfirmSelection} disabled={isConfirming}>
                  {isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Vínculo"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar categoria ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="flex-1 border rounded-md">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">
                  Carregando categorias do Mercado Livre...
                </p>
              </div>
            </div>
          ) : categoryTree ? (
            <div className="p-4 space-y-1">
              {Array.isArray(categoryTree)
                ? categoryTree.map((cat) => (
                    <TreeNode
                      key={cat.mlId}
                      category={cat}
                      level={0}
                      onSelect={handleSelectCategory}
                      searchTerm={searchTerm}
                    />
                  ))
                : (
                    <TreeNode
                      category={categoryTree}
                      level={0}
                      onSelect={handleSelectCategory}
                      searchTerm={searchTerm}
                    />
                  )
              }
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                Nenhuma categoria encontrada
              </p>
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <Badge variant="outline">Apenas categorias finais podem ser selecionadas</Badge>
          </div>
          <p>Selecione uma categoria para continuar</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
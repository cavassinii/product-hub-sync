import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Plus, Search, Edit, Trash2, FolderOpen, ArrowLeft, Link2, CheckCircle, Package } from 'lucide-react';
import { apiService } from '@/services/api';
import { Category } from '@/types/category';
import { CategoryChannel, MercadoLivreCategory, CHANNELS } from '@/types/marketplace';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CategoryForm } from '@/components/CategoryForm';
import { MarketplaceSelectionModal } from '@/components/MarketplaceSelectionModal';
import { MercadoLivreCategoryTree } from '@/components/MercadoLivreCategoryTree';

interface BreadcrumbItem {
  id: number;
  name: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Marketplace integration states
  const [categoryChannels, setCategoryChannels] = useState<Map<number, CategoryChannel>>(new Map());
  const [isMarketplaceModalOpen, setIsMarketplaceModalOpen] = useState(false);
  const [isMercadoLivreTreeOpen, setIsMercadoLivreTreeOpen] = useState(false);
  const [selectedCategoryForMarketplace, setSelectedCategoryForMarketplace] = useState<Category | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [allCategories, currentParentId, searchTerm]);

  useEffect(() => {
    if (filteredCategories.length > 0) {
      loadCategoryChannels();
    }
  }, [filteredCategories]);

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

  const loadCategoryChannels = async () => {
    try {
      const channelsMap = new Map<number, CategoryChannel>();
      
      for (const category of filteredCategories) {
        const channel = await apiService.getCategoryChannel(category.id, CHANNELS.MERCADO_LIVRE);
        if (channel) {
          channelsMap.set(category.id, channel);
        }
      }
      
      setCategoryChannels(channelsMap);
    } catch (error) {
      console.error('Erro ao carregar vínculos de marketplace:', error);
    }
  };

  const filterCategories = () => {
    let filtered = allCategories.filter(category => 
      category.parent_id === currentParentId
    );
    
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCategories(filtered);
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await apiService.deleteCategory(id);
      setAllCategories(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Categoria removida",
        description: "A categoria foi removida com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover categoria",
        description: "Não foi possível remover a categoria.",
        variant: "destructive",
      });
    }
  };

  const handleNavigateToSubcategories = (category: Category) => {
    if (category.is_final) return;
    
    setCurrentParentId(category.id);
    setBreadcrumbs(prev => [...prev, { id: category.id, name: category.name }]);
    setSearchTerm('');
  };

  const handleNavigateBack = () => {
    if (breadcrumbs.length === 0) return;
    
    const newBreadcrumbs = [...breadcrumbs];
    newBreadcrumbs.pop();
    setBreadcrumbs(newBreadcrumbs);
    
    if (newBreadcrumbs.length === 0) {
      setCurrentParentId(null);
    } else {
      setCurrentParentId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    }
    setSearchTerm('');
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Clicou em "Categorias" (raiz)
      setCurrentParentId(null);
      setBreadcrumbs([]);
    } else {
      // Clicou em uma categoria específica
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      setCurrentParentId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    }
    setSearchTerm('');
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleFormSave = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    loadCategories();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getSubcategoriesCount = (categoryId: number) => {
    return allCategories.filter(cat => cat.parent_id === categoryId).length;
  };

  const getCurrentLevelName = () => {
    if (breadcrumbs.length === 0) return 'Categorias Principais';
    return `Subcategorias de "${breadcrumbs[breadcrumbs.length - 1].name}"`;
  };

  const handleLinkMarketplace = (category: Category) => {
    setSelectedCategoryForMarketplace(category);
    setIsMarketplaceModalOpen(true);
  };

  // Ajuste: ao selecionar o marketplace, feche o modal de seleção e abra o da árvore
  const handleSelectMarketplace = (channelId: number) => {
    if (channelId === CHANNELS.MERCADO_LIVRE && selectedCategoryForMarketplace) {
      setIsMarketplaceModalOpen(false);
      setTimeout(() => setIsMercadoLivreTreeOpen(true), 0); // Garante que o modal anterior feche antes de abrir o novo
    }
  };

  // Remova ou simplifique este handler:
  // const handleSelectMercadoLivreCategory = async (mlCategory: MercadoLivreCategory) => { ... }

  // NOVA FUNÇÃO para passar ao modal:
  const handleConfirmLinkToMercadoLivre = async (mlCategory: MercadoLivreCategory) => {
    if (!selectedCategoryForMarketplace) return;

    if (!selectedCategoryForMarketplace.is_final) {
      toast({
        title: "Apenas categorias finais podem ser vinculadas",
        description: `A categoria "${selectedCategoryForMarketplace.name}" não é uma categoria final. Selecione uma categoria final para criar o vínculo.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await apiService.saveCategoryChannel({
        category_channel_id: mlCategory.mlId, // Vazio para criar novo
        category_id: selectedCategoryForMarketplace.id,
        channel_id: CHANNELS.MERCADO_LIVRE,
      });

      toast({
        title: "Vínculo criado com sucesso",
        description: `Categoria "${selectedCategoryForMarketplace.name}" foi vinculada ao Mercado Livre.`,
      });

      await loadCategoryChannels();
      await loadCategories(); // <-- Adicione esta linha para recarregar a lista de categorias

      setIsMercadoLivreTreeOpen(false);
      setSelectedCategoryForMarketplace(null);
    } catch (error) {
      toast({
        title: "Erro ao vincular categoria",
        description: "Não foi possível vincular a categoria ao marketplace.",
        variant: "destructive",
      });
    }
  };

  const isLinkedToMercadoLivre = (categoryId: number) => {
    return categoryChannels.has(categoryId);
  };

  return (
    <>
      <CardHeader>
        <div className="space-y-4">
          {/* Breadcrumb Navigation */}
          {breadcrumbs.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNavigateBack}
                className="flex items-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
              
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        handleBreadcrumbClick(-1);
                      }}
                    >
                      Categorias
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumbs.map((item, index) => (
                    <div key={item.id} className="flex items-center">
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage>{item.name}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleBreadcrumbClick(index);
                            }}
                          >
                            {item.name}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="text-2xl font-bold">{getCurrentLevelName()}</CardTitle>
              <p className="text-muted-foreground">
                {breadcrumbs.length === 0 
                  ? 'Gerencie as categorias principais dos produtos' 
                  : 'Gerencie as subcategorias'
                }
              </p>
            </div>
            <Button 
              onClick={handleCreateCategory}
              className="gradient-primary border-0 hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome da categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Categories Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Marketplaces</TableHead>
                  <TableHead>Subcategorias</TableHead>
                  <TableHead>Atualizado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada neste nível'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => {
                    const subcategoriesCount = getSubcategoriesCount(category.id);
                    
                    return (
                      <TableRow key={category.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{category.name}</p>
                            {!category.is_final && subcategoriesCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {subcategoriesCount} sub
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.is_final ? "default" : "secondary"}>
                            {category.is_final ? 'Final' : 'Intermediária'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {isLinkedToMercadoLivre(category.id) ? (
                              <button
                                type="button"
                                className="flex items-center space-x-1 text-green-600 hover:underline focus:outline-none"
                                title="Editar vínculo com o Mercado Livre"
                                onClick={() => {
                                  setSelectedCategoryForMarketplace(category);
                                  setIsMercadoLivreTreeOpen(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">ML</span>
                              </button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (!category.is_final) {
                                    toast({
                                      title: "Apenas categorias finais podem ser vinculadas",
                                      description: `A categoria "${category.name}" não é uma categoria final. Selecione uma categoria final para criar o vínculo.`,
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  handleLinkMarketplace(category);
                                }}
                                className="flex items-center space-x-1 text-muted-foreground hover:text-primary"
                                disabled={!category.is_final}
                              >
                                <Link2 className="h-4 w-4" />
                                <span className="text-sm">Vincular</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {category.is_final ? (
                            <span className="text-muted-foreground">-</span>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigateToSubcategories(category)}
                              className="flex items-center space-x-1 text-primary hover:text-primary"
                            >
                              <FolderOpen className="h-4 w-4" />
                              <span>{subcategoriesCount} subcategorias</span>
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(category.updated_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir a categoria "{category.name}"? 
                                    Esta ação não pode ser desfeita e todas as subcategorias também serão removidas.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary */}
        {!isLoading && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Mostrando {filteredCategories.length} categorias neste nível
            </p>
            <p>
              {filteredCategories.filter(c => c.is_final).length} finais • {filteredCategories.filter(c => !c.is_final).length} intermediárias
            </p>
          </div>
        )}
      </CardContent>

      {/* Category Form Modal */}
      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleFormSave}
        category={editingCategory}
        parentId={currentParentId}
      />

      {/* Marketplace Selection Modal */}
      <MarketplaceSelectionModal
        isOpen={isMarketplaceModalOpen}
        onClose={() => {
          setIsMarketplaceModalOpen(false);
          // Não limpe selectedCategoryForMarketplace aqui!
        }}
        onSelectMarketplace={handleSelectMarketplace}
        categoryName={selectedCategoryForMarketplace?.name || ''}
      />

      {/* Mercado Livre Category Tree Modal */}
      <MercadoLivreCategoryTree
        isOpen={isMercadoLivreTreeOpen && !!selectedCategoryForMarketplace}
        onClose={() => {
          setIsMercadoLivreTreeOpen(false);
          setSelectedCategoryForMarketplace(null); // Limpe aqui, ao fechar o modal da árvore
        }}
        categoryName={selectedCategoryForMarketplace?.name || ''}
        categoryId={selectedCategoryForMarketplace?.id}
        onLinked={async () => {
          await loadCategories();
          await loadCategoryChannels();
        }}
        linkedMlId={
          selectedCategoryForMarketplace && categoryChannels.get(selectedCategoryForMarketplace.id)?.category_channel_id
            ? categoryChannels.get(selectedCategoryForMarketplace.id)?.category_channel_id
            : undefined
        }
      />
    </>
  );
}
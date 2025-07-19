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
import { Plus, Search, Edit, Trash2, FolderOpen, ArrowLeft } from 'lucide-react';
import { apiService } from '@/services/api';
import { Category } from '@/types/category';
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
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [allCategories, currentParentId, searchTerm]);

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
                  <TableHead>Subcategorias</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
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
                        <TableCell>{formatDate(category.created_at)}</TableCell>
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
    </>
  );
}
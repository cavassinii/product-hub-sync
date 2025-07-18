
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
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
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

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter(category =>
      category.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getCategories();
      setCategories(data);
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

  const handleDeleteCategory = async (id: number) => {
    try {
      await apiService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.Id !== id));
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getParentCategoryName = (parentId?: number | null) => {
    if (!parentId) return 'Categoria raiz';
    const parent = categories.find(cat => cat.Id === parentId);
    return parent ? parent.Name : 'Categoria não encontrada';
  };

  const buildCategoryHierarchy = () => {
    const hierarchy: Category[] = [];
    const categoryMap = new Map<number, Category>();
    
    // First pass: create a map of all categories
    categories.forEach(cat => {
      if (cat.Id) {
        categoryMap.set(cat.Id, { ...cat, children: [] });
      }
    });
    
    // Second pass: build the hierarchy
    categoryMap.forEach(cat => {
      if (cat.Parent_Id && categoryMap.has(cat.Parent_Id)) {
        const parent = categoryMap.get(cat.Parent_Id);
        if (parent && !parent.children) {
          parent.children = [];
        }
        parent?.children?.push(cat);
      } else {
        hierarchy.push(cat);
      }
    });
    
    return hierarchy;
  };

  return (
    <>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">Gestão de Categorias</CardTitle>
            <p className="text-muted-foreground">
              Gerencie as categorias dos produtos
            </p>
          </div>
          <Button 
            onClick={() => setShowCategoryForm(true)}
            className="gradient-primary border-0 hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
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
                  <TableHead>Categoria Pai</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.Id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <p className="font-medium">{category.Name}</p>
                      </TableCell>
                      <TableCell>
                        {getParentCategoryName(category.Parent_Id)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.Is_Final ? "default" : "secondary"}>
                          {category.Is_Final ? 'Final' : 'Intermediária'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(category.Created_At)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowCategoryForm(true);
                            }}
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
                                  Tem certeza que deseja excluir a categoria "{category.Name}"? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCategory(category.Id!)}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary */}
        {!isLoading && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Mostrando {filteredCategories.length} de {categories.length} categorias
            </p>
            <p>
              {categories.filter(c => c.Is_Final).length} finais • {categories.filter(c => !c.Is_Final).length} intermediárias
            </p>
          </div>
        )}
      </CardContent>

      <CategoryForm
        isOpen={showCategoryForm}
        onClose={() => {
          setShowCategoryForm(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSave={loadCategories}
      />
    </>
  );
}

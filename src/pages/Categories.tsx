
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
import { Plus, Search, Edit, Trash2, FolderOpen } from 'lucide-react';
import { apiService } from '@/services/api';
import { Category, Subcategory } from '@/types/category';
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
import { SubcategoryForm } from '@/components/SubcategoryForm';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = categories.filter(category =>
      category.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [categoriesData, subcategoriesData] = await Promise.all([
        apiService.getCategories(),
        apiService.getSubcategories()
      ]);
      setCategories(categoriesData);
      setSubcategories(subcategoriesData);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
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

  const handleDeleteSubcategory = async (id: number) => {
    try {
      await apiService.deleteSubcategory(id);
      setSubcategories(prev => prev.filter(s => s.Id !== id));
      toast({
        title: "Subcategoria removida",
        description: "A subcategoria foi removida com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover subcategoria",
        description: "Não foi possível remover a subcategoria.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getCategorySubcategories = (categoryId: number) => {
    return subcategories.filter(sub => sub.CategoryId === categoryId);
  };

  return (
    <>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">Gestão de Categorias</CardTitle>
            <p className="text-muted-foreground">
              Gerencie categorias e subcategorias
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowCategoryForm(true)}
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
                  <TableHead>Categoria</TableHead>
                  <TableHead>Subcategorias</TableHead>
                  <TableHead>Status</TableHead>
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
                  filteredCategories.map((category) => {
                    const categorySubcategories = getCategorySubcategories(category.Id!);
                    return (
                      <TableRow key={category.Id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div>
                            <p className="font-medium">{category.Name}</p>
                            {category.Description && (
                              <p className="text-sm text-muted-foreground">{category.Description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {categorySubcategories.map((sub) => (
                              <Badge key={sub.Id} variant="outline" className="text-xs">
                                {sub.Name}
                              </Badge>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCategoryForSub(category.Id!);
                                setShowSubcategoryForm(true);
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Adicionar
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.Is_active ? "default" : "secondary"}>
                            {category.Is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(category.Created_at)}</TableCell>
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
              Mostrando {filteredCategories.length} de {categories.length} categorias
            </p>
            <p>
              {categories.filter(c => c.Is_active).length} ativas • {categories.filter(c => !c.Is_active).length} inativas
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
        onSave={loadData}
      />

      <SubcategoryForm
        isOpen={showSubcategoryForm}
        onClose={() => {
          setShowSubcategoryForm(false);
          setSelectedSubcategory(null);
          setSelectedCategoryForSub(null);
        }}
        subcategory={selectedSubcategory}
        categoryId={selectedCategoryForSub}
        categories={categories}
        onSave={loadData}
      />
    </>
  );
}

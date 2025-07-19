import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/types/category';
import { Loader2, ArrowLeft, FolderTree, Folder, FileText } from 'lucide-react';

export default function CategoryForm() {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    parent_id: null,
    is_final: true,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // Resetar formulário ao entrar em modo criação
  useEffect(() => {
    if (!isEditing) {
      setFormData({
        name: '',
        parent_id: null,
        is_final: true,
      });
    }
  }, [isEditing]);

  // Carrega categorias apenas uma vez
  useEffect(() => {
    loadCategories();
  }, []);

  // Carrega dados da categoria se for edição
  useEffect(() => {
    if (isEditing && id) {
      loadCategory(Number(id));
    }
  }, [isEditing, id]);

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const data: any = await apiService.getCategories();
      const list = Array.isArray(data)
        ? data
        : (data && Array.isArray(data.data) ? data.data : []);
      setCategories(list);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar as categorias disponíveis.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadCategory = async (categoryId: number) => {
    try {
      const category = await apiService.getCategory(categoryId);
      setFormData(category);
    } catch (error) {
      console.error('Erro ao carregar categoria:', error);
      toast({
        title: "Erro ao carregar categoria",
        description: "Não foi possível carregar os dados da categoria.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast({
        title: "Erro de validação",
        description: "Nome da categoria é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const categoryData = {
        ...formData,
        id: isEditing ? Number(id) : 0,
      } as Category;

      await apiService.saveCategory(categoryData);

      toast({
        title: isEditing ? "Categoria atualizada" : "Categoria criada",
        description: isEditing
          ? "A categoria foi atualizada com sucesso."
          : "A categoria foi criada com sucesso.",
      });

      navigate('/categories');
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

  const handleCancel = () => {
    navigate('/categories');
  };

  const availableParentCategories = categories.filter(cat =>
    Number.isInteger(cat.id) && !cat.is_final && (!formData.id || cat.id !== formData.id)
  );

  // Corrigido: sempre retorna string ou ""
  const parentValue = formData.parent_id != null ? String(formData.parent_id) : "";
  const validParentIds = availableParentCategories.map(cat => String(cat.id));
  const safeParentValue = validParentIds.includes(parentValue) ? parentValue : "";
  console.log('availableParentCategories', availableParentCategories);
  console.log('parentValue', parentValue);
  console.log('safeParentValue', safeParentValue);

  const getParentCategoryName = (parentId?: number | null) => {
    if (!parentId) return null;
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : 'Categoria não encontrada';
  };

  const getCategoryIcon = (isFinal: boolean) => {
    return isFinal ? FileText : Folder;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Categorias
        </Button>

        <div className="flex items-center space-x-3">
          <FolderTree className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Atualize os dados da categoria' : 'Crie uma nova categoria para organizar seus produtos'}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Informações da Categoria</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome da Categoria */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome da Categoria *
              </Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome da categoria"
                required
                className="h-11"
              />
            </div>

            {/* Categoria Pai */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="parent" className="text-sm font-medium">
                  Categoria Pai (Opcional)
                </Label>
                <Badge variant="outline" className="text-xs">
                  Organização Hierárquica
                </Badge>
              </div>
              
              {isLoadingCategories ? (
                <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Carregando categorias disponíveis...</span>
                </div>
              ) : (
                <>
                  <Select
                    value={safeParentValue}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      parent_id: value ? parseInt(value) : null
                    }))}
                    disabled={isLoadingCategories}
                  >
                    <SelectTrigger className="h-12 border-2 hover:border-primary/50 transition-colors">
                      <SelectValue>
                        {safeParentValue ? (
                          <div className="flex items-center space-x-2">
                            <Folder className="h-4 w-4 text-primary" />
                            <span>{availableParentCategories.find(cat => String(cat.id) === safeParentValue)?.name}</span>
                            <Badge variant="secondary" className="text-xs">Intermediária</Badge>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <FolderTree className="h-4 w-4" />
                            <span>Selecione uma categoria pai</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="" className="py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <FolderTree className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Categoria Raiz</div>
                            <div className="text-xs text-muted-foreground">Esta será uma categoria de nível superior</div>
                          </div>
                        </div>
                      </SelectItem>
                      
                      {availableParentCategories.length === 0 ? (
                        <div className="p-4 text-center">
                          <Folder className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Nenhuma categoria intermediária disponível</p>
                          <p className="text-xs text-muted-foreground mt-1">Crie primeiro categorias intermediárias para usá-las como pai</p>
                        </div>
                      ) : (
                        availableParentCategories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)} className="py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                                <Folder className="h-4 w-4 text-secondary-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{cat.name}</div>
                                <div className="text-xs text-muted-foreground">Categoria intermediária • Pode ter subcategorias</div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                Intermediária
                              </Badge>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                        <span className="text-blue-600 text-xs font-medium">i</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-blue-800 font-medium">Como funciona a hierarquia?</p>
                        <ul className="text-xs text-blue-700 mt-1 space-y-1">
                          <li>• <strong>Categoria Raiz:</strong> Nível superior, sem categoria pai</li>
                          <li>• <strong>Subcategoria:</strong> Pertence a uma categoria intermediária</li>
                          <li>• <strong>Apenas categorias intermediárias</strong> podem ser selecionadas como pai</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Preview da Hierarquia */}
            {formData.parent_id && (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <Label className="text-sm font-medium mb-2 block">
                  Hierarquia da Categoria
                </Label>
                <div className="flex items-center space-x-2 text-sm">
                  <FolderTree className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {getParentCategoryName(formData.parent_id)}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">
                    {formData.name || 'Nova categoria'}
                  </span>
                </div>
              </div>
            )}

            {/* Tipo da Categoria */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="is_final" className="text-sm font-medium">
                    Tipo da Categoria
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Define se esta categoria pode conter produtos ou outras categorias
                  </p>
                </div>
                <Switch
                  id="is_final"
                  checked={!!formData.is_final}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_final: checked }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border-2 transition-colors ${formData.is_final ? 'border-primary bg-primary/5' : 'border-muted bg-muted/30'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Categoria Final</span>
                    {formData.is_final && (
                      <Badge variant="default" className="ml-auto">Selecionada</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Permite adicionar produtos diretamente
                  </p>
                </div>

                <div className={`p-4 rounded-lg border-2 transition-colors ${!formData.is_final ? 'border-primary bg-primary/5' : 'border-muted bg-muted/30'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Folder className="h-4 w-4" />
                    <span className="font-medium">Categoria Intermediária</span>
                    {!formData.is_final && (
                      <Badge variant="default" className="ml-auto">Selecionada</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Permite criar subcategorias
                  </p>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-24"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-32"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  isEditing ? 'Atualizar' : 'Criar'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

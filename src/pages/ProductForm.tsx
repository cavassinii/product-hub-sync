import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, ChevronRight, ArrowLeft as BackIcon, Tag, Search } from 'lucide-react';
import { apiService } from '@/services/api';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { Brand } from '@/types/brand';
import { Category } from '@/types/category';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Função para formatar valor monetário para exibição
function formatCurrency(value: number | string) {
  if (typeof value === 'string') value = value.replace(/[^\d]/g, '');
  const num = Number(value) / 100;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Função para tratar input do usuário e manter apenas números
function parseCurrencyInput(input: string) {
  // Remove tudo que não for número
  const onlyNums = input.replace(/\D/g, '');
  return onlyNums;
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id && id !== 'new';

  const [formData, setFormData] = useState<Product>({
    id: 0,
    sku: '',
    title: '',
    description: '',
    reference: '',
    url_image1: '',
    url_image2: '',
    url_image3: '',
    url_image4: '',
    url_image5: '',
    ncm: '',
    cest: '',
    color: '',
    size: '',
    category_id: 0,
    brand_id: 0,
    weight_gross: 0,
    weight_net: 0,
    width: 0,
    height: 0,
    unit: '',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    cost_price: 0,
    sale_price: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryPath, setCategoryPath] = useState<Category[]>([]);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadProduct();
    }
    loadBrands();
    loadCategories();
  }, [id, isEditing]);

  const loadProduct = async () => {
    if (!id || id === 'new') return;
    
    try {
      setIsLoadingProduct(true);
      const product = await apiService.getProduct(Number(id));
      setFormData(product);
    } catch (error) {
      toast({
        title: "Erro ao carregar produto",
        description: "Não foi possível carregar os dados do produto.",
        variant: "destructive",
      });
      navigate('/products');
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const loadBrands = async () => {
    try {
      const data = await apiService.getBrands();
      setBrands(data);
    } catch {}
  };

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiService.saveProduct(formData);
      toast({
        title: isEditing ? "Produto atualizado" : "Produto criado",
        description: `O produto "${formData.title}" foi ${isEditing ? 'atualizado' : 'criado'} com sucesso.`,
      });
      navigate('/products');
    } catch (error) {
      toast({
        title: "Erro ao salvar produto",
        description: "Não foi possível salvar o produto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Product) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'weight_gross' || field === 'weight_net' || field === 'width' || field === 'height' || field === 'cost_price' || field === 'sale_price'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSwitchChange = (field: keyof Product) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  // Função para buscar as categorias filhas de uma categoria
  const getChildren = (parent_id: number | null) => {
    return categories.filter(cat => cat.parent_id === parent_id);
  };

  // Função para abrir o modal e resetar o caminho
  const openCategoryModal = () => {
    setCategoryPath([]);
    setShowCategoryModal(true);
  };

  // Função para navegar para uma categoria filha
  const handleCategoryClick = (cat: Category) => {
    setCategoryPath(prev => [...prev, cat]);
  };

  // Função para voltar um nível
  const handleBack = () => {
    setCategoryPath(prev => prev.slice(0, -1));
  };

  // Função para ir para uma categoria específica no breadcrumb
  const handleBreadcrumbClick = (index: number) => {
    setCategoryPath(prev => prev.slice(0, index + 1));
  };

  // Função para selecionar a categoria final
  const handleSelectFinalCategory = (cat: Category) => {
    setFormData(prev => ({ ...prev, category_id: cat.id }));
    setCategoryPath([]);
    setShowCategoryModal(false);
    toast({
      title: "Categoria selecionada",
      description: `Categoria "${cat.name}" foi selecionada com sucesso.`,
    });
  };

  // Função para exibir o caminho da categoria
  const getCategoryPathLabel = () => {
    if (!formData.category_id) return 'Nenhuma categoria selecionada';
    let path: string[] = [];
    let current = categories.find(c => c.id === formData.category_id);
    while (current) {
      path.unshift(current.name);
      current = current.parent_id ? categories.find(c => c.id === current.parent_id) : undefined;
    }
    return path.join(' > ');
  };

  // Função para obter categorias do nível atual
  const getCurrentLevelCategories = () => {
    const currentParentId = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1].id : null;
    return getChildren(currentParentId);
  };

  // Função para abrir o modal de marcas
  const openBrandModal = () => {
    setBrandSearch('');
    setShowBrandModal(true);
  };

  // Função para selecionar uma marca
  const handleSelectBrand = (brand: Brand) => {
    setFormData(prev => ({ ...prev, brand_id: brand.id }));
    setShowBrandModal(false);
    toast({
      title: 'Marca selecionada',
      description: `Marca "${brand.name}" foi selecionada com sucesso.`,
    });
  };

  // Função para exibir o nome da marca selecionada
  const getSelectedBrandName = () => {
    if (!formData.brand_id) return 'Selecione uma marca';
    const brand = brands.find(b => b.id === formData.brand_id);
    return brand ? brand.name : 'Selecione uma marca';
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/products')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <CardTitle className="text-2xl font-bold">
              {isEditing ? 'Editar Produto' : 'Novo Produto'}
            </CardTitle>
            <p className="text-muted-foreground">
              {isEditing ? `Editando: ${formData.title}` : 'Preencha os dados do novo produto'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={handleInputChange('sku')}
                  placeholder="Código SKU único"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Referência</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={handleInputChange('reference')}
                  placeholder="Referência do produto"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleInputChange('title')}
                placeholder="Nome do produto"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="Descrição detalhada do produto"
                rows={4}
                required
              />
            </div>
          </div>

          {/* Imagens */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Imagens</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="space-y-2">
                  <Label htmlFor={`image${num}`}>Imagem {num} {num === 1 && '*'}</Label>
                  <Input
                    id={`image${num}`}
                    value={formData[`url_image${num}` as keyof Product] as string}
                    onChange={handleInputChange(`url_image${num}` as keyof Product)}
                    placeholder={`URL da imagem ${num}`}
                    type="url"
                    required={num === 1}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Categorização */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Categorização</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand_id">Marca *</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-3"
                  onClick={openBrandModal}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">
                        {formData.brand_id ? getSelectedBrandName() : 'Selecione uma marca'}
                      </div>
                      <div className="text-xs text-muted-foreground">Clique para alterar</div>
                    </div>
                  </div>
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-3"
                  onClick={openCategoryModal}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">
                        {formData.category_id ? getCategoryPathLabel() : 'Selecione uma categoria'}
                      </div>
                      <div className="text-xs text-muted-foreground">Clique para alterar</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Modal de seleção de categoria */}
          <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Selecionar Categoria
                </DialogTitle>
                
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <button
                    type="button"
                    onClick={() => setCategoryPath([])}
                    className="hover:text-foreground transition-colors px-2 py-1 rounded"
                  >
                    Início
                  </button>
                  {categoryPath.map((cat, index) => (
                    <div key={cat.id} className="flex items-center gap-1">
                      <ChevronRight className="h-3 w-3" />
                      <button
                        type="button"
                        onClick={() => handleBreadcrumbClick(index)}
                        className="hover:text-foreground transition-colors px-2 py-1 rounded"
                      >
                        {cat.name}
                      </button>
                    </div>
                  ))}
                </div>
              </DialogHeader>

              <Separator />

              {/* Botão Voltar */}
              {categoryPath.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="w-fit flex items-center gap-2"
                >
                  <BackIcon className="h-4 w-4" />
                  Voltar
                </Button>
              )}

              {/* Lista de categorias */}
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-2">
                  {getCurrentLevelCategories().length > 0 ? (
                    getCurrentLevelCategories().map(cat => (
                      <div 
                        key={cat.id} 
                        className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{cat.name}</h4>
                              {cat.is_final ? (
                                <Badge variant="default" className="text-xs">
                                  Final
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Categoria
                                </Badge>
                              )}
                            </div>
                            {cat.is_final && (
                              <p className="text-xs text-muted-foreground">
                                Esta categoria pode receber produtos
                              </p>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            {cat.is_final ? (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleSelectFinalCategory(cat)}
                                className="bg-primary hover:bg-primary/90"
                              >
                                Selecionar
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleCategoryClick(cat)}
                                className="flex items-center gap-1"
                              >
                                Ver subcategorias
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-medium text-muted-foreground">Nenhuma categoria encontrada</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {categoryPath.length > 0 
                          ? "Esta categoria não possui subcategorias." 
                          : "Nenhuma categoria foi cadastrada ainda."
                        }
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* Modal de seleção de marca */}
          <Dialog open={showBrandModal} onOpenChange={setShowBrandModal}>
            <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Selecionar Marca
                </DialogTitle>
              </DialogHeader>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar marca pelo nome..."
                  value={brandSearch}
                  onChange={e => setBrandSearch(e.target.value)}
                  className="pl-10 h-11"
                  autoFocus
                />
              </div>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-2">
                  {brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase())).length > 0 ? (
                    brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase())).map(brand => (
                      <div
                        key={brand.id}
                        className={`border border-border rounded-lg p-3 flex items-center justify-between hover:bg-accent/50 transition-colors ${formData.brand_id === brand.id ? 'bg-accent/30' : ''}`}
                      >
                        <span className="font-medium">{brand.name}</span>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSelectBrand(brand)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Selecionar
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma marca encontrada
                    </div>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* Preços */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Preços</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_price">Preço de Custo</Label>
                <Input
                  id="cost_price"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9,.]*"
                  value={formatCurrency(Math.round((formData.cost_price || 0) * 100))}
                  onChange={e => {
                    const raw = parseCurrencyInput(e.target.value);
                    const floatValue = Number(raw) / 100;
                    setFormData(prev => ({ ...prev, cost_price: floatValue }));
                  }}
                  placeholder="0,00"
                  maxLength={15}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale_price">Preço de Venda</Label>
                <Input
                  id="sale_price"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9,.]*"
                  value={formatCurrency(Math.round((formData.sale_price || 0) * 100))}
                  onChange={e => {
                    const raw = parseCurrencyInput(e.target.value);
                    const floatValue = Number(raw) / 100;
                    setFormData(prev => ({ ...prev, sale_price: floatValue }));
                  }}
                  placeholder="0,00"
                  maxLength={15}
                />
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Características</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={handleInputChange('color')}
                  placeholder="Cor do produto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Tamanho</Label>
                <Input
                  id="size"
                  value={formData.size}
                  onChange={handleInputChange('size')}
                  placeholder="Tamanho do produto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade *</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={handleInputChange('unit')}
                  placeholder="Ex: UN, KG, M, etc."
                  required
                />
              </div>
            </div>
          </div>

          {/* Medidas e Peso */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Medidas e Peso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight_gross">Peso Bruto (kg)</Label>
                <Input
                  id="weight_gross"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9,.]*"
                  value={formatCurrency(Math.round((formData.weight_gross || 0) * 100))}
                  onChange={e => {
                    const raw = parseCurrencyInput(e.target.value);
                    const floatValue = Number(raw) / 100;
                    setFormData(prev => ({ ...prev, weight_gross: floatValue }));
                  }}
                  placeholder="0,00"
                  maxLength={15}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight_net">Peso Líquido (kg)</Label>
                <Input
                  id="weight_net"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9,.]*"
                  value={formatCurrency(Math.round((formData.weight_net || 0) * 100))}
                  onChange={e => {
                    const raw = parseCurrencyInput(e.target.value);
                    const floatValue = Number(raw) / 100;
                    setFormData(prev => ({ ...prev, weight_net: floatValue }));
                  }}
                  placeholder="0,00"
                  maxLength={15}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Largura (cm)</Label>
                <Input
                  id="width"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9,.]*"
                  value={formatCurrency(Math.round((formData.width || 0) * 100))}
                  onChange={e => {
                    const raw = parseCurrencyInput(e.target.value);
                    const floatValue = Number(raw) / 100;
                    setFormData(prev => ({ ...prev, width: floatValue }));
                  }}
                  placeholder="0,00"
                  maxLength={15}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9,.]*"
                  value={formatCurrency(Math.round((formData.height || 0) * 100))}
                  onChange={e => {
                    const raw = parseCurrencyInput(e.target.value);
                    const floatValue = Number(raw) / 100;
                    setFormData(prev => ({ ...prev, height: floatValue }));
                  }}
                  placeholder="0,00"
                  maxLength={15}
                />
              </div>
            </div>
          </div>

          {/* Informações Fiscais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informações Fiscais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ncm">NCM</Label>
                <Input
                  id="ncm"
                  value={formData.ncm}
                  onChange={handleInputChange('ncm')}
                  placeholder="Código NCM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cest">CEST</Label>
                <Input
                  id="cest"
                  value={formData.cest}
                  onChange={handleInputChange('cest')}
                  placeholder="Código CEST"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Status</h3>
            <div className="flex items-center space-x-3">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={handleSwitchChange('is_active')}
              />
              <Label htmlFor="is_active" className="font-medium">
                Produto ativo
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/products')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="gradient-primary border-0 hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Salvando...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Atualizar' : 'Criar'} Produto
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );
}

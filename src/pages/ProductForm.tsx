import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { apiService } from '@/services/api';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { Brand } from '@/types/brand';
import { Category } from '@/types/category';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

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
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryPath, setCategoryPath] = useState<Category[]>([]);

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
      [field]: field === 'weight_gross' || field === 'weight_net' || field === 'width' || field === 'height'
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
  const getChildren = (parentId: number | null) => {
    return categories.filter(cat => cat.parent_Id === parentId);
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

  // Função para selecionar a categoria final
  const handleSelectFinalCategory = (cat: Category) => {
    setFormData(prev => ({ ...prev, category_id: cat.id }));
    setCategoryPath([]);
    setShowCategoryModal(false);
  };

  // Função para exibir o caminho da categoria
  const getCategoryPathLabel = () => {
    if (!formData.category_id) return 'Nenhuma categoria selecionada';
    let path: string[] = [];
    let current = categories.find(c => c.id === formData.category_id);
    while (current) {
      path.unshift(current.name);
      current = current.parent_Id ? categories.find(c => c.id === current.parent_Id) : undefined;
    }
    return path.join(' > ');
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
                <select
                  id="brand_id"
                  value={formData.brand_id || ''}
                  onChange={e => setFormData(prev => ({ ...prev, brand_id: Number(e.target.value) }))}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Selecione uma marca</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <button
                  type="button"
                  className="w-full border rounded px-3 py-2 text-left bg-white hover:bg-gray-50"
                  onClick={openCategoryModal}
                >
                  {getCategoryPathLabel()}
                </button>
              </div>
            </div>
          </div>

          {/* Modal de seleção de categoria */}
          <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Selecione a categoria</DialogTitle>
                {categoryPath.length > 0 && (
                  <button type="button" onClick={handleBack} className="absolute left-4 top-4 text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" /> Voltar
                  </button>
                )}
              </DialogHeader>
              <div className="space-y-2">
                {getChildren(categoryPath.length > 0 ? categoryPath[categoryPath.length - 1].id : null).map(cat => (
                  <div key={cat.id} className="flex items-center justify-between border rounded px-3 py-2 mb-2">
                    <span>{cat.name}</span>
                    {cat.is_Final ? (
                      <button
                        type="button"
                        className="text-primary font-semibold"
                        onClick={() => handleSelectFinalCategory(cat)}
                      >
                        Selecionar
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-gray-500"
                        onClick={() => handleCategoryClick(cat)}
                      >
                        Ver subcategorias
                      </button>
                    )}
                  </div>
                ))}
                {getChildren(categoryPath.length > 0 ? categoryPath[categoryPath.length - 1].id : null).length === 0 && (
                  <div className="text-center text-muted-foreground">Nenhuma subcategoria encontrada.</div>
                )}
              </div>
            </DialogContent>
          </Dialog>

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
                  type="number"
                  step="0.01"
                  value={formData.weight_gross}
                  onChange={handleInputChange('weight_gross')}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight_net">Peso Líquido (kg)</Label>
                <Input
                  id="weight_net"
                  type="number"
                  step="0.01"
                  value={formData.weight_net}
                  onChange={handleInputChange('weight_net')}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Largura (cm)</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.01"
                  value={formData.width}
                  onChange={handleInputChange('width')}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  value={formData.height}
                  onChange={handleInputChange('height')}
                  placeholder="0.00"
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

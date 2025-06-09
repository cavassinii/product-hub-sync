
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

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id && id !== 'new';

  const [formData, setFormData] = useState<Product>({
    Sku: '',
    Title: '',
    Description: '',
    Reference: '',
    Url_image1: '',
    Url_image2: '',
    Url_image3: '',
    Url_image4: '',
    Url_image5: '',
    Ncm: '',
    Cest: '',
    Color: '',
    Size: '',
    Category1: '',
    Category2: '',
    Category3: '',
    Brand: '',
    Weight_gross: 0,
    Weight_net: 0,
    Width: 0,
    Height: 0,
    Unit: '',
    Is_active: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadProduct();
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiService.saveProduct(formData);
      toast({
        title: isEditing ? "Produto atualizado" : "Produto criado",
        description: `O produto "${formData.Title}" foi ${isEditing ? 'atualizado' : 'criado'} com sucesso.`,
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
      [field]: field === 'Weight_gross' || field === 'Weight_net' || field === 'Width' || field === 'Height'
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
              {isEditing ? `Editando: ${formData.Title}` : 'Preencha os dados do novo produto'}
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
                  value={formData.Sku}
                  onChange={handleInputChange('Sku')}
                  placeholder="Código SKU único"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Referência</Label>
                <Input
                  id="reference"
                  value={formData.Reference}
                  onChange={handleInputChange('Reference')}
                  placeholder="Referência do produto"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.Title}
                onChange={handleInputChange('Title')}
                placeholder="Nome do produto"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.Description}
                onChange={handleInputChange('Description')}
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
                    value={formData[`Url_image${num}` as keyof Product] as string}
                    onChange={handleInputChange(`Url_image${num}` as keyof Product)}
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
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  value={formData.Brand}
                  onChange={handleInputChange('Brand')}
                  placeholder="Marca do produto"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category1">Categoria Principal *</Label>
                <Input
                  id="category1"
                  value={formData.Category1}
                  onChange={handleInputChange('Category1')}
                  placeholder="Categoria principal"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category2">Categoria Secundária</Label>
                <Input
                  id="category2"
                  value={formData.Category2}
                  onChange={handleInputChange('Category2')}
                  placeholder="Categoria secundária"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category3">Categoria Terciária</Label>
                <Input
                  id="category3"
                  value={formData.Category3}
                  onChange={handleInputChange('Category3')}
                  placeholder="Categoria terciária"
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
                  value={formData.Color}
                  onChange={handleInputChange('Color')}
                  placeholder="Cor do produto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Tamanho</Label>
                <Input
                  id="size"
                  value={formData.Size}
                  onChange={handleInputChange('Size')}
                  placeholder="Tamanho do produto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade *</Label>
                <Input
                  id="unit"
                  value={formData.Unit}
                  onChange={handleInputChange('Unit')}
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
                  value={formData.Weight_gross}
                  onChange={handleInputChange('Weight_gross')}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight_net">Peso Líquido (kg)</Label>
                <Input
                  id="weight_net"
                  type="number"
                  step="0.01"
                  value={formData.Weight_net}
                  onChange={handleInputChange('Weight_net')}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Largura (cm)</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.01"
                  value={formData.Width}
                  onChange={handleInputChange('Width')}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  value={formData.Height}
                  onChange={handleInputChange('Height')}
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
                  value={formData.Ncm}
                  onChange={handleInputChange('Ncm')}
                  placeholder="Código NCM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cest">CEST</Label>
                <Input
                  id="cest"
                  value={formData.Cest}
                  onChange={handleInputChange('Cest')}
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
                checked={formData.Is_active}
                onCheckedChange={handleSwitchChange('Is_active')}
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


import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { Plus, Search, Eye, Trash2, ExternalLink } from 'lucide-react';
import { apiService } from '@/services/api';
import { Product } from '@/types/product';
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
import { MercadoLivrePopup } from '@/components/MercadoLivrePopup';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showMercadoLivrePopup, setShowMercadoLivrePopup] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.Sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.Brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getProducts();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar a lista de produtos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await apiService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.Id !== id));
      toast({
        title: "Produto removido",
        description: "O produto foi removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover produto",
        description: "Não foi possível remover o produto.",
        variant: "destructive",
      });
    }
  };

  const handleOpenMercadoLivrePopup = (product: Product) => {
    setSelectedProduct(product);
    setShowMercadoLivrePopup(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">Gestão de Produtos</CardTitle>
            <p className="text-muted-foreground">
              Gerencie seus produtos do e-commerce
            </p>
          </div>
          <Link to="/products/new">
            <Button className="gradient-primary border-0 hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por título, SKU ou marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Products Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.Id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {product.Url_image1 && (
                            <img
                              src={product.Url_image1}
                              alt={product.Title}
                              className="w-10 h-10 rounded-md object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <p className="font-medium">{product.Title}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {product.Description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.Sku}</TableCell>
                      <TableCell>{product.Brand}</TableCell>
                      <TableCell>{product.Category1}</TableCell>
                      <TableCell>
                        <Badge variant={product.Is_active ? "default" : "secondary"}>
                          {product.Is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(product.Created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link to={`/products/${product.Id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenMercadoLivrePopup(product)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4" />
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
                                  Tem certeza que deseja excluir o produto "{product.Title}"? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProduct(product.Id!)}
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
              Mostrando {filteredProducts.length} de {products.length} produtos
            </p>
            <p>
              {products.filter(p => p.Is_active).length} ativos • {products.filter(p => !p.Is_active).length} inativos
            </p>
          </div>
        )}
      </CardContent>

      {selectedProduct && (
        <MercadoLivrePopup
          product={selectedProduct}
          isOpen={showMercadoLivrePopup}
          onClose={() => {
            setShowMercadoLivrePopup(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </>
  );
}

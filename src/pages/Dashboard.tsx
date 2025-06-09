
import { useState, useEffect } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BarChart3, Package, TrendingUp, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { apiService } from '@/services/api';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getProducts();
      setProducts(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active).length;
  const inactiveProducts = products.filter(p => !p.is_active).length;
  const recentProducts = products.filter(p => {
    if (!p.created_at) return false;
    const createdDate = new Date(p.created_at);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdDate >= sevenDaysAgo;
  }).length;

  const stats = [
    {
      title: "Total de Produtos",
      value: totalProducts,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Produtos Ativos",
      value: activeProducts,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Produtos Inativos",
      value: inactiveProducts,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Novos (7 dias)",
      value: recentProducts,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl font-bold">Dashboard</CardTitle>
            <p className="text-muted-foreground">
              Visão geral dos seus produtos e integrações
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <Card key={stat.title} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Products by Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status dos Produtos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Produtos Ativos</span>
                      </div>
                      <Badge variant="default">{activeProducts}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-sm">Produtos Inativos</span>
                      </div>
                      <Badge variant="secondary">{inactiveProducts}</Badge>
                    </div>
                    {totalProducts > 0 && (
                      <div className="pt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(activeProducts / totalProducts) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {((activeProducts / totalProducts) * 100).toFixed(1)}% dos produtos estão ativos
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Integrações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ExternalLink className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium">Mercado Livre</span>
                      </div>
                      <Badge variant="outline">Disponível</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ExternalLink className="h-5 w-5 text-orange-600" />
                        <span className="font-medium">Shopee</span>
                      </div>
                      <Badge variant="outline">Em breve</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Products */}
            {recentProducts > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Produtos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {products
                      .filter(p => {
                        if (!p.created_at) return false;
                        const createdDate = new Date(p.created_at);
                        const sevenDaysAgo = new Date();
                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                        return createdDate >= sevenDaysAgo;
                      })
                      .slice(0, 5)
                      .map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {product.url_image1 && (
                              <img
                                src={product.url_image1}
                                alt={product.title}
                                className="w-10 h-10 rounded-md object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <p className="font-medium">{product.title}</p>
                              <p className="text-sm text-muted-foreground">{product.brand}</p>
                            </div>
                          </div>
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </CardContent>
    </>
  );
}

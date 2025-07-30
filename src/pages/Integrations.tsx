import { useState, useEffect } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, RefreshCw, DollarSign } from 'lucide-react';
import { apiService } from '@/services/api';
import { ProductIntegration, CHANNEL_NAMES } from '@/types/marketplace';
import { useToast } from '@/hooks/use-toast';

export default function Integrations() {
  const [integrations, setIntegrations] = useState<ProductIntegration[]>([]);
  const [filteredIntegrations, setFilteredIntegrations] = useState<ProductIntegration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedIntegrations, setSelectedIntegrations] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  useEffect(() => {
    if (integrations.length > 0) {
      let filtered = integrations;

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(integration =>
          integration.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          integration.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          integration.product_Channel_Id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filter by channel
      if (selectedChannel !== 'all') {
        filtered = filtered.filter(integration =>
          integration.channel_Id === parseInt(selectedChannel)
        );
      }

      setFilteredIntegrations(filtered);
    } else {
      setFilteredIntegrations([]);
    }
  }, [integrations, searchTerm, selectedChannel]);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getIntegratedProducts();
      setIntegrations(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar integrações",
        description: "Não foi possível carregar a lista de produtos integrados.",
        variant: "destructive",
      });
      setIntegrations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectIntegration = (integrationId: number, checked: boolean) => {
    if (checked) {
      setSelectedIntegrations(prev => [...prev, integrationId]);
    } else {
      setSelectedIntegrations(prev => prev.filter(id => id !== integrationId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIntegrations(filteredIntegrations.map(i => i.product_Id));
    } else {
      setSelectedIntegrations([]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChannelName = (channelId: number) => {
    return CHANNEL_NAMES[channelId as keyof typeof CHANNEL_NAMES] || `Canal ${channelId}`;
  };

  return (
    <>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">Integrações</CardTitle>
            <p className="text-muted-foreground">
              Gerencie produtos integrados com marketplaces
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por produto, SKU ou código no canal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por marketplace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os marketplaces</SelectItem>
              <SelectItem value="1">Mercado Livre</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={loadIntegrations}
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Actions Sidebar */}
        {selectedIntegrations.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">
                    {selectedIntegrations.length} produto(s) selecionado(s)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sincronizar Estoque
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Sincronizar Preço
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Integrations Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        filteredIntegrations.length > 0 &&
                        selectedIntegrations.length === filteredIntegrations.length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Marketplace</TableHead>
                  <TableHead>Código no Canal</TableHead>
                  <TableHead>Data de Integração</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIntegrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      {searchTerm || selectedChannel !== 'all' 
                        ? 'Nenhuma integração encontrada com os filtros aplicados' 
                        : 'Nenhum produto integrado'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIntegrations.map((integration) => (
                    <TableRow key={`integration-${integration.product_Id}-${integration.channel_Id}`} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <Checkbox
                          checked={selectedIntegrations.includes(integration.product_Id)}
                          onCheckedChange={(checked) => 
                            handleSelectIntegration(integration.product_Id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {integration.product.url_image1 && (
                            <img
                              src={integration.product.url_image1}
                              alt={integration.product.title}
                              className="w-10 h-10 rounded-md object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <p className="font-medium">{integration.product.title}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {integration.product.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{integration.product.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getChannelName(integration.channel_Id)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{integration.product_Channel_Id}</TableCell>
                      <TableCell className="text-sm">{formatDate(integration.created_At)}</TableCell>
                      <TableCell>
                        <Badge variant={integration.product.is_active ? "default" : "secondary"}>
                          {integration.product.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
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
              Mostrando {filteredIntegrations.length} de {integrations.length} integrações
            </p>
            <p>
              {integrations.filter(i => i.product.is_active).length} ativos • {integrations.filter(i => !i.product.is_active).length} inativos
            </p>
          </div>
        )}
      </CardContent>
    </>
  );
}
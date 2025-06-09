
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types/product';
import { Loader2, ExternalLink } from 'lucide-react';

interface MercadoLivrePopupProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function MercadoLivrePopup({ product, isOpen, onClose }: MercadoLivrePopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendToMercadoLivre = async () => {
    try {
      setIsLoading(true);
      await apiService.sendProductToMercadoLivre(product.Id!);
      
      toast({
        title: "Produto enviado com sucesso!",
        description: `O produto "${product.Title}" foi enviado ao Mercado Livre.`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao enviar produto",
        description: "Não foi possível enviar o produto ao Mercado Livre.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Enviar ao Mercado Livre
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja enviar este produto ao Mercado Livre?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {product.Url_image1 && (
                <img
                  src={product.Url_image1}
                  alt={product.Title}
                  className="w-16 h-16 rounded-md object-cover"
                />
              )}
              <div>
                <h4 className="font-medium">{product.Title}</h4>
                <p className="text-sm text-muted-foreground">SKU: {product.Sku}</p>
                <p className="text-sm text-muted-foreground">Marca: {product.Brand}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSendToMercadoLivre} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar ao ML'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

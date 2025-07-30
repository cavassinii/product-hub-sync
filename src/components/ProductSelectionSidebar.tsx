import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Send, Loader2 } from 'lucide-react';
import { MarketplaceSelectionModal } from './MarketplaceSelectionModal';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProductSelectionSidebarProps {
  selectedProductIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductSelectionSidebar({ 
  selectedProductIds, 
  onClose, 
  onSuccess 
}: ProductSelectionSidebarProps) {
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const handleSendProducts = () => {
    setShowMarketplaceModal(true);
  };

  const handleMarketplaceSelect = async (channelId: number) => {
    setShowMarketplaceModal(false);
    setShowLoadingModal(true);
    setIsPublishing(true);

    try {
      if (channelId === 1) { // Mercado Livre
        await apiService.publishProductsToMercadoLivre(selectedProductIds);
        
        toast({
          title: "Produtos enviados com sucesso!",
          description: `${selectedProductIds.length} produto(s) foram enviados ao Mercado Livre.`,
        });
        
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar produtos",
        description: "Não foi possível enviar os produtos ao marketplace.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
      setShowLoadingModal(false);
      onClose();
    }
  };

  return (
    <>
      {/* Floating Sidebar */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
        <Card className="w-80 shadow-lg border-primary/20">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Produtos Selecionados</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {selectedProductIds.length} produto(s) selecionado(s)
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={handleSendProducts}
                className="w-full gradient-primary border-0 hover:opacity-90 transition-opacity"
                disabled={selectedProductIds.length === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Produtos
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Marketplace Selection Modal */}
      <MarketplaceSelectionModal
        isOpen={showMarketplaceModal}
        onClose={() => setShowMarketplaceModal(false)}
        onSelectMarketplace={handleMarketplaceSelect}
        categoryName={`${selectedProductIds.length} produto(s)`}
      />

      {/* Loading Modal */}
      <Dialog open={showLoadingModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Enviando produtos
            </DialogTitle>
            <DialogDescription>
              Aguarde enquanto os produtos são enviados ao marketplace...
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Processando {selectedProductIds.length} produto(s)
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
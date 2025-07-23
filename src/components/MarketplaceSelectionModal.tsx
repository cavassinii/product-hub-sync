import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface MarketplaceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMarketplace: (channelId: number) => void;
  categoryName: string;
}

const marketplaces = [
  {
    id: 1,
    name: 'Mercado Livre',
    icon: Package,
    color: 'bg-yellow-500',
    description: 'Vincular categoria ao Mercado Livre'
  }
];

export function MarketplaceSelectionModal({ 
  isOpen, 
  onClose, 
  onSelectMarketplace, 
  categoryName 
}: MarketplaceSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular Marketplace</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Selecione o marketplace para vincular a categoria "{categoryName}"
          </p>
        </DialogHeader>
        
        <div className="space-y-3">
          {marketplaces.map((marketplace) => (
            <Card key={marketplace.id} className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-0"
                  onClick={() => {
                    onSelectMarketplace(marketplace.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${marketplace.color}`}>
                      <marketplace.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{marketplace.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {marketplace.description}
                      </p>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { Product } from '@/types/product';

interface IntegrationDropdownProps {
  product: Product;
  onMercadoLivreClick: (product: Product) => void;
  onShopeeClick: (product: Product) => void;
}

export function IntegrationDropdown({ product, onMercadoLivreClick, onShopeeClick }: IntegrationDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
          <ExternalLink className="h-4 w-4 mr-1" />
          Integrar
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onMercadoLivreClick(product)}>
          <ExternalLink className="h-4 w-4 mr-2 text-yellow-600" />
          Enviar para Mercado Livre
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShopeeClick(product)}>
          <ExternalLink className="h-4 w-4 mr-2 text-orange-600" />
          Enviar para Shopee
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Brand } from '@/types/brand';
import { Loader2 } from 'lucide-react';

interface BrandFormProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: Brand | null;
  onSave: () => void;
}

export function BrandForm({ isOpen, onClose, brand, onSave }: BrandFormProps) {
  const [formData, setFormData] = useState<Partial<Brand>>({
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (brand) {
      setFormData(brand);
    } else {
      setFormData({
        name: '',
      });
    }
  }, [brand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast({
        title: "Erro de validação",
        description: "Nome da marca é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await apiService.saveBrand(formData as Brand);
      
      toast({
        title: brand ? "Marca atualizada" : "Marca criada",
        description: brand 
          ? "A marca foi atualizada com sucesso." 
          : "A marca foi criada com sucesso.",
      });
      
      onSave();
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar marca",
        description: "Não foi possível salvar a marca.",
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
          <DialogTitle>
            {brand ? 'Editar Marca' : 'Nova Marca'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome da marca"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

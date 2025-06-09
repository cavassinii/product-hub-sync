import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, LogIn } from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { LoginRequest } from '@/types/auth';

export default function Login() {
  const [formData, setFormData] = useState<LoginRequest>({
    Organization: '',
    User: '',
    Password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.login(formData);
      setAuthenticated(true);
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${formData.User}`,
      });
      // Redireciona apenas após o login bem-sucedido
      navigate('/');
    } catch (error: any) {
      // Tratamento específico para erro 401 (Unauthorized)
      if (error?.response?.status === 401) {
        toast({
          title: "Falha na autenticação",
          description: error.response.data || "Usuário ou senha inválidos.",
          variant: "destructive",
        });
      } else {
        // Tratamento para outros tipos de erro
        toast({
          title: "Erro no login",
          description: "Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
      // Garantir que o usuário não seja redirecionado em caso de erro
      setAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md gradient-card border-0 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 gradient-primary rounded-full flex items-center justify-center">
            <Store className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">E-Commerce Hub</CardTitle>
            <CardDescription className="text-muted-foreground">
              Acesse sua plataforma de gestão integrada
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Organização</Label>
              <Input
                id="organization"
                type="text"
                placeholder="Nome da organização"
                value={formData.Organization}
                onChange={handleInputChange('Organization')}
                required
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user">Usuário</Label>
              <Input
                id="user"
                type="text"
                placeholder="Seu usuário"
                value={formData.User}
                onChange={handleInputChange('User')}
                required
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={formData.Password}
                onChange={handleInputChange('Password')}
                required
                className="h-11"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full h-11 gradient-primary border-0 hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Entrando...
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

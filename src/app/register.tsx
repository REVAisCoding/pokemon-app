import { AuthFormScreen } from '@/components/auth/auth-form-screen';
import { useAuth } from '@/contexts/auth-context';

export default function RegisterScreen() {
  const { signUp } = useAuth();

  return (
    <AuthFormScreen
      mode="register"
      title="Criar conta"
      subtitle="Cadastre-se para salvar sua coleção na nuvem com Supabase."
      submitLabel="Cadastrar"
      alternatePrompt="Já tem uma conta?"
      alternateHref="/login"
      alternateLabel="Entrar"
      onSubmit={signUp}
    />
  );
}

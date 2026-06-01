import { AuthFormScreen } from '@/components/auth/auth-form-screen';
import { useAuth } from '@/contexts/auth-context';

export default function LoginScreen() {
  const { signIn } = useAuth();

  return (
    <AuthFormScreen
      mode="login"
      title="Entrar"
      subtitle="Acesse sua conta para sincronizar a coleção entre dispositivos."
      submitLabel="Entrar"
      alternatePrompt="Ainda não tem conta?"
      alternateHref="/register"
      alternateLabel="Criar conta"
      onSubmit={signIn}
    />
  );
}

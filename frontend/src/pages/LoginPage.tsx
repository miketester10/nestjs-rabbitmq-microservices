import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { authApi, LoginResponse } from "../api/auth.api";
import Button from "../components/Button";
import Input from "../components/Input";
import Verify2FAModal from "../components/Verify2FAModal";
import ResendVerificationEmailModal from "../components/ResendVerificationEmailModal";
import { handleError } from "../api/error";
import { useAuthStore } from "../store/auth.store";
import { loginSchema, LoginFormData } from "../schemas/validation.schemas";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setTokens, setIsAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showResendEmailModal, setShowResendEmailModal] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const email = watch("email");
  const isUnverifiedEmailError = error?.includes("Completare la verifica email per accedere.");

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (apiResponse: LoginResponse) => {
      if (apiResponse.otpRequired) {
        // Se richiede 2FA, salva solo accessToken temporaneo e mostra il modal
        setTokens(apiResponse.accessToken);
        setShow2FAModal(true);
      } else {
        // Altrimenti, salva accessToken + refreshToken e vai alla dashboard
        setTokens(apiResponse.accessToken, apiResponse.refreshToken);
        setIsAuthenticated(true);
        navigate("/dashboard");
      }
    },
    onError: (err: Error) => {
      const errorMessage = handleError(err);
      setError(errorMessage);
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    await loginMutation.mutateAsync(data);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-8">
            <div>
              <h2 className="text-center text-3xl font-extrabold text-gray-900">Accedi al tuo account</h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Oppure{" "}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  registrati per un nuovo account
                </Link>
              </p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && !isUnverifiedEmailError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
              {isUnverifiedEmailError && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded space-y-3">
                  <p className="font-medium">{error}</p>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm">Non hai ricevuto l'email di verifica o il link è scaduto?</p>
                    <Button type="button" variant="secondary" onClick={() => setShowResendEmailModal(true)} className="w-full">
                      Richiedi nuova email di verifica
                    </Button>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
                <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                    Password dimenticata?
                  </Link>
                </div>
              </div>
              <div>
                <Button type="submit" className="w-full" isLoading={loginMutation.isPending}>
                  Accedi
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Verify2FAModal isOpen={show2FAModal} onClose={() => setShow2FAModal(false)} />
      <ResendVerificationEmailModal isOpen={showResendEmailModal} onClose={() => setShowResendEmailModal(false)} initialEmail={email} onSuccess={() => setError(null)} />
    </>
  );
}

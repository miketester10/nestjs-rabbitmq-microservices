import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { authApi, LoginDto, LoginResponse } from "../api/auth.api";
import Button from "../components/Button";
import Input from "../components/Input";
import Verify2FAModal from "../components/Verify2FAModal";
import { handleError } from "../api/error";
import { useAuthStore } from "../store/auth.store";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setTokens, setIsAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [show2FAModal, setShow2FAModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>();

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

  const onSubmit = async (data: LoginDto) => {
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
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                {...register("email", {
                  required: "Email obbligatoria",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email non valida",
                  },
                })}
                error={errors.email?.message}
              />
              <Input
                label="Password"
                type="password"
                {...register("password", {
                  required: "Password obbligatoria",
                  minLength: {
                    value: 6,
                    message: "La password deve essere di almeno 6 caratteri",
                  },
                })}
                error={errors.password?.message}
              />
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
    </>
  );
}

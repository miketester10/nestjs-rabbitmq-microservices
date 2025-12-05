import { Link } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi, Login2FAResponse } from "../api/auth.api";
import { OtpDto } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import Button from "../components/Button";
import Input from "../components/Input";
import { handleError } from "../api/error";

export default function TwoFactorVerifyPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { setTokens, setIsAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpDto>();

  const verify2FAMutation = useMutation({
    mutationFn: authApi.verify2faCode,
    onSuccess: (apiResponse: Login2FAResponse) => {
      setTokens(apiResponse.accessToken, apiResponse.refreshToken);
      setIsAuthenticated(true);
      navigate("/dashboard");
    },
    onError: (err: Error) => {
      const errorMessage = handleError(err);
      setError(errorMessage);
    },
  });

  const onSubmit = async (data: OtpDto) => {
    setError(null);
    await verify2FAMutation.mutateAsync(data.code);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Verifica Autenticazione a Due Fattori</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Inserisci il codice a 6 cifre dalla tua app di autenticazione</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
          <div>
            <Input
              label="Codice OTP"
              {...register("code", {
                required: "Codice OTP obbligatorio",
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: "Il codice OTP deve contenere esattamente 6 numeri",
                },
              })}
              error={errors.code?.message}
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={verify2FAMutation.isPending}>
              Verifica
            </Button>
          </div>
          <div className="text-center">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500" onClick={() => logout()}>
              Torna al login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

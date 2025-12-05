import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { OtpDto } from "../api/auth.api";
import Button from "../components/Button";
import Input from "../components/Input";
import { handleError } from "../api/error";
import { useAuthStore } from "../store/auth.store";

export default function Setup2FAPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (user?.is2faEnabled) {
    navigate("/dashboard");
  }

  const {
    data: setupData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["2fa-setup"],
    queryFn: authApi.initiate2faSetup,
    enabled: !user?.is2faEnabled,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpDto>();

  const confirm2FAMutation = useMutation({
    mutationFn: authApi.confirm2faSetup,
    onSuccess: async (apiResponse: string) => {
      // Invalida e rifà il fetch della query del profilo (pagina Dashboard) per aggiornare i dati come 2FA abilitato oppure no
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSuccess(apiResponse);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    },
    onError: (err: Error) => {
      const errorMessage = handleError(err);
      setError(errorMessage);
    },
  });

  const onSubmit = async (data: OtpDto) => {
    setError(null);
    setSuccess(null);
    await confirm2FAMutation.mutateAsync(data.code);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Configura Autenticazione a Due Fattori</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Scansiona il QR code con un'app di autenticazione come Google Authenticator</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {queryError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">Errore durante il caricamento della configurazione 2FA</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

          {setupData && (
            <div className="space-y-6">
              <div className="text-center">
                <img src={setupData.qrcode} alt="QR Code 2FA" className="mx-auto border-2 border-gray-300 rounded-lg" />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Codice segreto (backup):</strong>
                </p>
                <p className="text-xs font-mono text-gray-800 break-all">{setupData.secret}</p>
              </div>
              <p className="text-sm text-gray-600 text-center">Dopo aver scansionato il QR code, inserisci il codice a 6 cifre generato dall'app per completare la configurazione.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <Button type="submit" className="w-full" isLoading={confirm2FAMutation.isPending}>
                  Verifica e Abilita 2FA
                </Button>
              </form>
            </div>
          )}

          <div className="mt-4 text-center">
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>
              Annulla
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

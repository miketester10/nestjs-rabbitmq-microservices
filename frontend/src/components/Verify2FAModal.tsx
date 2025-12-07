import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi, Login2FAResponse } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import Button from "./Button";
import Input from "./Input";
import { handleError } from "../api/error";
import { otpSchema, OtpFormData } from "../schemas/validation.schemas";

interface Verify2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Verify2FAModal({ isOpen, onClose }: Verify2FAModalProps) {
  const navigate = useNavigate();
  const { setTokens, setIsAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const verify2FAMutation = useMutation({
    mutationFn: authApi.verify2faCode,
    onSuccess: (apiResponse: Login2FAResponse) => {
      setTokens(apiResponse.accessToken, apiResponse.refreshToken);
      setIsAuthenticated(true);
      onClose();
      navigate("/dashboard");
    },
    onError: (err: Error) => {
      let errorMessage = handleError(err);
      if (errorMessage.includes("Unauthorized")) errorMessage = "E' trascorso troppo tempo. Esegui nuovamente il login.";
      setError(errorMessage);
    },
  });

  const onSubmit = async (data: OtpFormData) => {
    setError(null);
    await verify2FAMutation.mutateAsync(data.code);
  };

  const handleClose = () => {
    setError(null);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Verifica Autenticazione a Due Fattori</h3>
          <p className="text-sm text-gray-600 mb-4">Inserisci il codice a 6 cifre dalla tua app di autenticazione per completare il login.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>}
            <Input label="Codice OTP" {...register("code")} error={errors.code?.message} placeholder="000000" maxLength={6} />
            <div className="flex space-x-3">
              <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
                Torna al login
              </Button>
              <Button type="submit" variant="primary" isLoading={verify2FAMutation.isPending} className="flex-1">
                Verifica
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

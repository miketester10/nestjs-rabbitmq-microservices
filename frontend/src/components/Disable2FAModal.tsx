import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import Button from "./Button";
import Input from "./Input";
import { handleError } from "../api/error";
import { otpSchema, OtpFormData } from "../schemas/forms.schema";

interface Disable2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Disable2FAModal({ isOpen, onClose }: Disable2FAModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const disable2FAMutation = useMutation({
    mutationFn: authApi.disable2fa,
    onSuccess: () => {
      // Invalida e rifà il fetch della query del profilo (pagina Dashboard) per aggiornare i dati come 2FA abilitato oppure no
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      onClose();
    },
    onError: (err: Error) => {
      const errorMessage = handleError(err);
      setError(errorMessage);
    },
  });

  const onSubmit = async (data: OtpFormData) => {
    setError(null);
    await disable2FAMutation.mutateAsync(data.code);
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">Disabilita Autenticazione a Due Fattori</h3>
          <p className="text-sm text-gray-600 mb-4">Inserisci il codice OTP dalla tua app di autenticazione per disabilitare 2FA.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>}
            <Input label="Codice OTP" {...register("code")} error={errors.code?.message} placeholder="000000" maxLength={6} />
            <div className="flex space-x-3">
              <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
                Annulla
              </Button>
              <Button type="submit" variant="danger" isLoading={disable2FAMutation.isPending} className="flex-1">
                Disabilita
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

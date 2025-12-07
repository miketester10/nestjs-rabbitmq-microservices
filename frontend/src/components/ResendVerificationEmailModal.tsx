import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { userApi } from "../api/user.api";
import Button from "./Button";
import Input from "./Input";
import { handleError } from "../api/error";
import { emailSchema, EmailFormData } from "../schemas/validation.schemas";

interface ResendVerificationEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail: string;
  onSuccess: () => void;
}

export default function ResendVerificationEmailModal({ isOpen, onClose, initialEmail, onSuccess }: ResendVerificationEmailModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  // Aggiorna il campo email quando il modal si apre
  useEffect(() => {
    reset({ email: initialEmail });
  }, [reset, initialEmail]);

  const resendVerificationMutation = useMutation({
    mutationFn: userApi.resendVerificationEmail,
    onSuccess: (apiResponse: string) => {
      setSuccess(apiResponse);
      setTimeout(() => {
        handleCloseAfterSuccess();
      }, 4000);
    },
    onError: (err: Error) => {
      const errorMessage = handleError(err);
      setError(errorMessage);
      setSuccess(null);
    },
  });

  const onSubmit = async (data: EmailFormData) => {
    setError(null);
    setSuccess(null);
    await resendVerificationMutation.mutateAsync(data.email);
  };

  const handleCloseAfterSuccess = () => {
    setError(null);
    setSuccess(null);
    reset();
    onSuccess();
    onClose();
  };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Richiedi Nuova Email di Verifica</h3>
          <p className="text-sm text-gray-600 mb-4">Non hai ricevuto l'email di verifica o il link è scaduto? Inserisci la tua email per ricevere una nuova email di verifica.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">{success}</div>}
            <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
            <div className="flex space-x-3">
              <Button type="button" variant="secondary" onClick={handleClose} className="flex-1" disabled={resendVerificationMutation.isPending}>
                Annulla
              </Button>
              <Button type="submit" variant="primary" isLoading={resendVerificationMutation.isPending} className="flex-1">
                Invia Email
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

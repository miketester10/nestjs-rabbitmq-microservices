import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { userApi } from "../api/user.api";
import { useAuthStore } from "../store/auth.store";
import Button from "./Button";
import { handleError } from "../api/error";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { logout } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const deleteAccountMutation = useMutation({
    mutationFn: userApi.deleteAccount,
    onSuccess: () => {
      // Esegui il logout dopo l'eliminazione dell'account
      logout();
      onClose();
    },
    onError: (err: Error) => {
      const errorMessage = handleError(err);
      setError(errorMessage);
    },
  });

  const handleConfirm = async () => {
    setError(null);
    await deleteAccountMutation.mutateAsync();
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Elimina Account</h3>
          <p className="text-sm text-gray-600 mb-2">Sei sicuro di voler eliminare il tuo account?</p>
          <p className="text-sm text-red-600 mb-4 font-semibold">Questa azione è irreversibile e non potrai recuperare i tuoi dati.</p>
          <p className="text-sm text-gray-600 mb-4">Ti verrà inviata un'email di conferma dell'avvenuta eliminazione dell'account.</p>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm mb-4">{error}</div>}
          <div className="flex space-x-3">
            <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
              Annulla
            </Button>
            <Button type="button" variant="danger" onClick={handleConfirm} isLoading={deleteAccountMutation.isPending} className="flex-1">
              Conferma
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

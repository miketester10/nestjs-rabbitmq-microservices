import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import Button from "../components/Button";
import Input from "../components/Input";
import { handleError } from "../api/error";
import { resetPasswordSchema, ResetPasswordFormData } from "../schemas/validation.schemas";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordFormData) => {
      if (!token) throw new Error("Token di reset mancante");
      return authApi.resetPassword(data, token);
    },
    onSuccess: (apiResponse: string) => {
      setSuccess(apiResponse);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    },
    onError: (err: Error) => {
      const errorMessage = handleError(err);
      setError(errorMessage);
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    setSuccess(null);
    await resetPasswordMutation.mutateAsync(data);
  };

  if (!token || error?.includes("Token invalido o scaduto.")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Token Non Valido</h2>
              <p className="mt-2 text-sm text-gray-600 mb-4">Il token di reset password non è valido o è scaduto.</p>
              <Button onClick={() => navigate("/forgot-password")} variant="primary">
                Richiedi Nuovo Link
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-8">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">Reset Password</h2>
            <p className="mt-2 text-center text-sm text-gray-600">Inserisci la tua nuova password</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>}
            <div className="space-y-4">
              <Input label="Nuova Password" type="password" {...register("password")} error={errors.password?.message} />
              <Input label="Conferma Password" type="password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
            </div>
            <div>
              <Button type="submit" className="w-full" isLoading={resetPasswordMutation.isPending}>
                Reset Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

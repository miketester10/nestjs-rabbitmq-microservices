import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { EmailDto } from "../api/user.api";
import Button from "../components/Button";
import Input from "../components/Input";
import { handleError } from "../api/error";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailDto>();

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (apiResponse: string) => {
      setMessage(apiResponse);
    },
    onError: (err: Error) => {
      const errorMessage = handleError(err);
      setError(errorMessage);
    },
  });

  const onSubmit = async (data: EmailDto) => {
    setError(null);
    setMessage(null);
    await forgotPasswordMutation.mutateAsync(data.email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Password Dimenticata</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Inserisci la tua email per ricevere il link di reset password</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
          {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{message}</div>}
          <div>
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
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={forgotPasswordMutation.isPending}>
              Invia Link Reset
            </Button>
          </div>
          <div className="text-center">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Torna al login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

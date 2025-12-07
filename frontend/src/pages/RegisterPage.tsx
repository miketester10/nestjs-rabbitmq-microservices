import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { userApi } from "../api/user.api";
import Button from "../components/Button";
import Input from "../components/Input";
import { handleError } from "../api/error";
import { registerSchema, RegisterFormData } from "../schemas/forms.schema";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: userApi.register,
    onSuccess: (apiResponse: string) => {
      setSuccess(apiResponse);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    },
    onError: (err: Error) => {
      const errorMessage = handleError(err);
      setError(errorMessage);
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setSuccess(null);
    await registerMutation.mutateAsync(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-8">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">Crea un nuovo account</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Oppure{" "}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                accedi al tuo account esistente
              </Link>
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>}
            <div className="space-y-4">
              <Input label="Nome" {...register("firstName")} error={errors.firstName?.message} />
              <Input label="Cognome" {...register("lastName")} error={errors.lastName?.message} />
              <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
              <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
              <Input label="Conferma Password" type="password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
            </div>
            <div>
              <Button type="submit" className="w-full" isLoading={registerMutation.isPending}>
                Registrati
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

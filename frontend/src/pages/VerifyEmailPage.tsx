import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { userApi } from "../api/user.api";
import Button from "../components/Button";
import { handleError } from "../api/error";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasRun = useRef<boolean>(false);

  const verifyEmailMutation = useMutation({
    mutationFn: userApi.verifyEmail,
    onSuccess: (apiResponse: string) => {
      setError(null);
      setSuccess(apiResponse);
      setTimeout(() => {
        navigate("/login");
      }, 4000);
    },
    onError: (err: Error) => {
      setSuccess(null);
      const errorMessage = handleError(err);
      setError(errorMessage);
    },
  });

  useEffect(() => {
    if (hasRun.current) return; // Evita la doppia esecuzione dello useEffect in Strict Mode/Development
    hasRun.current = true;

    if (!token) {
      setError("Token di verifica mancante");
      return;
    }

    verifyEmailMutation.mutate(token);
  }, [token, verifyEmailMutation]);

  const showSuccess = success && !error;
  const showError = error && !success;
  const showLoading = !success && !error && verifyEmailMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {showSuccess && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">{success}</h2>
              <p className="mt-4 text-sm text-gray-500">Reindirizzamento al login...</p>
            </div>
          )}
          {showError && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Errore di Verifica</h2>
              <p className="mt-2 text-sm text-gray-600">{error}</p>
              <div className="mt-4">
                <Button onClick={() => navigate("/login")} variant="primary">
                  Vai al Login
                </Button>
              </div>
            </div>
          )}
          {showLoading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600">Verifica email in corso...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

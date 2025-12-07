import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { userApi, UserProfile } from "../api/user.api";
import { useAuthStore } from "../store/auth.store";
import Button from "../components/Button";
import Disable2FAModal from "../components/Disable2FAModal";
import DeleteAccountModal from "../components/DeleteAccountModal";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { logout, setUser, isAuthenticated } = useAuthStore();
  const [isDisable2FAModalOpen, setIsDisable2FAModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  const {
    data: profile,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: userApi.getProfile,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (profile) {
      // Aggiorna lo store con i dati dell'utente
      setUser({
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        is2faEnabled: profile.is2faEnabled,
      });
    }
  }, [profile, setUser]);

  // isLoading si attiva solo la prima volta che carichiamo i dati
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile || queryError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Errore nel caricamento della Dashboard.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mostra un overlay di caricamento quando si sta facendo il refetch dei dati */}
      {isFetching && !isLoading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  {profile.firstName} {profile.lastName}
                </span>
                <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
                  {isFetching ? "Aggiornamento..." : "Aggiorna"}
                </Button>
                <Button variant="secondary" onClick={() => logout()}>
                  Logout
                </Button>
                <Button variant="danger" onClick={() => setIsDeleteAccountModalOpen(true)}>
                  Elimina Account
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Profilo Utente</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Verificata</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.isVerified ? <span className="text-green-600">✓ Verificata</span> : <span className="text-red-600">✗ Non verificata</span>}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Autenticazione a Due Fattori</label>
                  <p className="mt-1 text-sm text-gray-900">{profile?.is2faEnabled ? <span className="text-green-600">✓ Abilitata</span> : <span className="text-red-600">✗ Disabilitata</span>}</p>
                </div>
                {!profile.is2faEnabled ? (
                  <div className="mt-4">
                    <Button onClick={() => navigate("/2fa/setup")} variant="primary">
                      Abilita 2FA
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <Button onClick={() => setIsDisable2FAModalOpen(true)} variant="danger">
                      Disabilita 2FA
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Disable2FAModal isOpen={isDisable2FAModalOpen} onClose={() => setIsDisable2FAModalOpen(false)} />
        <DeleteAccountModal isOpen={isDeleteAccountModalOpen} onClose={() => setIsDeleteAccountModalOpen(false)} />
      </div>
    </>
  );
}

import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/auth.store";

/**
 * URL base dell'API backend.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Estrae il metodo logout dallo store Zustand per utilizzarlo negli interceptor.
 *
 * Nota: usiamo `getState()` invece di `useAuthStore()` perché:
 * - `useAuthStore()` è un hook React e può essere usato solo dentro componenti React
 * - `getState()` è un metodo che può essere usato ovunque, anche fuori dai componenti
 * - Questo file è un modulo di configurazione axios, non un componente React
 */
const { logout } = useAuthStore.getState();

/**
 * Interfaccia per la risposta ricevuta dall'endpoint refresh-token.
 * La struttura della risposta è: { data: { accessToken: string, refreshToken: string } }
 */
interface RefreshTokenResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Interfaccia che estennde InternalAxiosRequestConfig ed include
 * la proprietà _retry per evitare loop infiniti durante il refresh del token.
 */
interface ExtendedInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Client axios configurato con baseURL e headers di default.
 * Questo client viene utilizzato per tutte le chiamate API dell'applicazione.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor per le richieste HTTP.
 *
 * Funzionalità:
 * - Aggiunge automaticamente l'access token presente nel localStorage all'header Authorization di ogni richiesta.
 * - Il token viene aggiunto nel formato "Bearer <token>".
 *
 * Questo permette di autenticare automaticamente tutte le richieste senza dover
 * specificare manualmente il token in ogni chiamata API.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Recupera accessToken dal localStorage, lo aggiunge all'header Authorization e restituisce la config aggiornata
    const accessToken = localStorage.getItem("accessToken");
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // In caso di errore durante la configurazione della richiesta, viene rigettata la promise con l'errore originale.
    return Promise.reject(error);
  }
);

/**
 * Interceptor per le risposte HTTP.
 *
 * Funzionalità:
 * - Gestisce automaticamente il refresh del token quando una richiesta riceve un errore 401 (Unauthorized).
 * - Se l'accessToken è scaduto:
 *   1. Tenta di ottenere nuovi token (accessToken e refreshToken), usando il refreshToken presente nel localStorage. (Se non è presente, esegue il logout)
 *   2. Salva i nuovi token nel localStorage
 *   3. Riprova la richiesta originale con il nuovo accessToken
 * - Se il refresh fallisce, viene eseguito il logout dell'utente.
 *
 * La proprietà _retry viene utilizzata per evitare loop infiniti nel caso
 * in cui anche il refresh token sia scaduto o invalido.
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Se la risposta è positiva, la restituisce senza modifiche
    return response;
  },
  async (error: AxiosError): Promise<AxiosResponse | AxiosError> => {
    const originalRequest = error.config as ExtendedInternalAxiosRequestConfig;

    // Verifica se l'errore è un 401 (Unauthorized) e se la richiesta non è già stata ritentata.
    // La proprietà _retry evita loop infiniti nel caso in cui anche il refresh token sia scaduto.
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Marca la richiesta come già ritentata per evitare loop infiniti
      originalRequest._retry = true;

      try {
        // Recupera refreshToken dal localStorage
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          // Tenta di ottenere i nuovi token usando il refreshToken
          const response: AxiosResponse<RefreshTokenResponse> = await axios.get(`${API_BASE_URL}/auth/refresh-token`, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Salva i nuovi token nel localStorage
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          // Aggiorna l'header Authorization della richiesta originale con il nuovo accessToken
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Riprova la richiesta originale con il nuovo accessToken
          return apiClient(originalRequest);
        } else {
          // Se non è presente un refreshToken nel localStorage, esegue il logout.
          console.warn("DOVREBBE ANDARE AL LOGIN PERCHE NON C'E' IL REFRESH TOKEN");
          logout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Se il refresh fallisce, esegue il logout.
        // Questo può accadere se anche il refresh token è scaduto o invalido, oppure per errore Too Many Requests all'endpoint di refresh-token.
        logout();
        console.warn("DOVREBBE ANDARE AL LOGIN PERCHE IL REFRESH TOKEN E' SCADUTO/INVALIDO");
        return Promise.reject(refreshError);
      }
    }

    // Se l'errore non è un 401 o la richiesta è già stata ritentata, rigetta la promise con l'errore originale
    console.log("RESTITUISCE L ERRORE ORIGINALE");
    return Promise.reject(error);
  }
);

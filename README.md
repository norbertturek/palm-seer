# 🔮 PalmSeer

**PalmSeer** to zaawansowana aplikacja internetowa do analizy chiromancji dłoni, wykorzystująca nowoczesną sztuczną inteligencję (Google Gemini 1.5). Aplikacja pozwala użytkownikom na wgranie zdjęcia dłoni i otrzymanie szczegółowej, spersonalizowanej interpretacji linii, wzgórz i kształtu dłoni.

## ✨ Kluczowe Funkcje

- **Analiza AI**: Wykorzystuje model Gemini 1.5 Flash do precyzyjnego rozpoznawania cech dłoni.
- **Szczegółowa Interpretacja**:
  - **Linie Główne**: Linia życia, serca, głowy, losu.
  - **Wzgórza**: Jowisza, Saturna, Apolla, Wenus, etc.
  - **Kształt Dłoni**: Żywioł (Ziemia, Ogień, Powietrze, Woda).
- **Profil Osobowości**: Generowanie profilu psychologicznego na podstawie dłoni.
- **Przepowiednie**: Prognozy dotyczące kariery, zdrowia i miłości.
- **Integracja Płatności**: System kredytów na analizy (opcjonalny).
- **Responsywny Design**: Nowoczesny interfejs UI/UX zbudowany z Shadcn UI i Tailwind CSS, działający na urządzeniach mobilnych i desktopowych.

## 🛠 Technologie

Projekt został zbudowany w oparciu o nowoczesny stos technologiczny:

- **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Backend / BaaS**: [Supabase](https://supabase.com/) (Baza danych, Auth, Edge Functions)
- **AI**: [Google Gemini API](https://ai.google.dev/)
- **State Management**: React Query

## 🚀 Instalacja i Uruchomienie

### Wymagania

- Node.js (v18+)
- npm / pnpm / bun
- Konto Supabase (do backendu)
- Klucz API Google AI (Gemini)

### Kroki Instalacyjne

1. **Sklonuj repozytorium:**

   ```bash
   git clone git@github.com:norbertturek/palm-seer.git
   cd palm-seer
   ```

2. **Zainstaluj zależności:**

   ```bash
   npm install
   ```

3. **Skonfiguruj zmienne środowiskowe:**

   Utwórz plik `.env` na podstawie `.env.example`:

   ```bash
   cp .env.example .env
   ```

   Uzupełnij brakujące klucze w pliku `.env` (Supabase URL, Anon Key).

   > **Uwaga:** Klucz `GOOGLE_API_KEY` powinien być skonfigurowany w zmiennych środowiskowych Supabase Edge Functions, a nie bezpośrednio w kliencie frontendowym (dla bezpieczeństwa).

4. **Uruchom wersję developerską:**

   ```bash
   npm run dev
   ```

   Aplikacja będzie dostępna pod adresem: `http://localhost:8080`

## 📦 Deployment

### Supabase Edge Functions

Aby wdrożyć funkcje backendowe (analiza dłoni):

```bash
supabase functions deploy analyze-palm --no-verify-jwt
supabase functions deploy validate-palm --no-verify-jwt
```

Upewnij się, że ustawiłeś sekret `GOOGLE_API_KEY` w panelu Supabase.

## 📄 Licencja

Projekt prywatny. Wszelkie prawa zastrzeżone.

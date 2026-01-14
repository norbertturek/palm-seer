# 🔮 PalmSeer

**PalmSeer** is an advanced web application for palmistry analysis powered by modern artificial intelligence (Google Gemini 1.5). The application allows users to upload a photo of their palm and receive a detailed, personalized interpretation of lines, mounts, and hand shape.

## ✨ Key Features

- **AI Analysis**: Utilizes the Gemini 1.5 Flash model for precise recognition of hand features.
- **Detailed Interpretation**:
  - **Major Lines**: Life Line, Heart Line, Head Line, Fate Line.
  - **Mounts**: Jupiter, Saturn, Apollo, Venus, etc.
  - **Hand Shape**: Element (Earth, Fire, Air, Water).
- **Personality Profile**: Generates a psychological profile based on palm features.
- **Predictions**: Forecasts regarding career, health, and love.
- **Payment Integration**: Credit system for analyses (optional).
- **Responsive Design**: Modern UI/UX built with Shadcn UI and Tailwind CSS, fully responsive on mobile and desktop devices.

## 🛠 Technology Stack

The project is built using a modern technology stack:

- **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Backend / BaaS**: [Supabase](https://supabase.com/) (Database, Auth, Edge Functions)
- **AI**: [Google Gemini API](https://ai.google.dev/)
- **State Management**: React Query

## 🚀 Installation and Setup

### Prerequisites

- Node.js (v18+)
- npm / pnpm / bun
- Supabase account (for backend)
- Google AI API Key (Gemini)

### Installation Steps

1. **Clone the repository:**

   ```bash
   git clone git@github.com:norbertturek/palm-seer.git
   cd palm-seer
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

   Fill in the missing keys in the `.env` file (Supabase URL, Anon Key).

   > **Note:** The `GOOGLE_API_KEY` should be configured in the Supabase Edge Functions environment variables, not directly in the frontend client (for security).

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   The application will be available at: `http://localhost:8080`

## 📦 Deployment

### Supabase Edge Functions

To deploy the backend functions (palm analysis):

```bash
supabase functions deploy analyze-palm --no-verify-jwt
supabase functions deploy validate-palm --no-verify-jwt
```

Make sure you have set the `GOOGLE_API_KEY` secret in your Supabase dashboard.

## 📄 License

Private project. All rights reserved.

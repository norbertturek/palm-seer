import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary">{t('notFound.title')}</h1>
        <p className="mb-8 text-xl text-muted-foreground">{t('notFound.description')}</p>
        <Link to="/">
          <Button variant="gold" size="lg">
            <Home className="h-4 w-4 mr-2" />
            {t('notFound.backHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

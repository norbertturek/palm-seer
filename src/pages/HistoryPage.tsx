import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, History, LogIn, Hand, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Analysis {
  id: string;
  image_url: string;
  signed_image_url?: string;
  additional_notes: string | null;
  analysis_result: any;
  created_at: string;
}

const HistoryPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchAnalyses();
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching analyses:", error);
      } else if (data) {
        // Generate signed URLs for each analysis image
        const analysesWithSignedUrls = await Promise.all(
          data.map(async (analysis) => {
            // Extract the file path from the stored URL
            const urlParts = analysis.image_url.split("/palm-images/");
            if (urlParts.length > 1) {
              const filePath = urlParts[1].split("?")[0]; // Remove any existing query params
              const { data: signedData } = await supabase.storage
                .from("palm-images")
                .createSignedUrl(filePath, 3600);
              return {
                ...analysis,
                signed_image_url: signedData?.signedUrl || analysis.image_url,
              };
            }
            return { ...analysis, signed_image_url: analysis.image_url };
          })
        );
        setAnalyses(analysesWithSignedUrls);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      i18n.language === 'en' ? 'en-US' : 'pl-PL',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Link>
            <h1 className="font-display text-3xl md:text-4xl text-gradient-gold mb-4">
              {t('history.title')}
            </h1>
            <p className="text-muted-foreground font-serif">
              {t('history.description')}
            </p>
          </div>
          
          {!user ? (
            // Not logged in state
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                  <History className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="font-display text-2xl mb-4">{t('history.loginRequired')}</h2>
                <p className="text-muted-foreground font-serif mb-8 max-w-md mx-auto">
                  {t('history.loginDescription')}
                </p>
                <Link to="/auth">
                  <Button variant="gold" size="lg" className="gap-2">
                    <LogIn className="h-5 w-5" />
                    {t('history.loginButton')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : analyses.length === 0 ? (
            // Logged in but no analyses
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                  <Hand className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="font-display text-2xl mb-4">{t('history.noAnalyses')}</h2>
                <p className="text-muted-foreground font-serif mb-8 max-w-md mx-auto">
                  {t('history.noAnalysesDescription')}
                </p>
                <Link to="/upload">
                  <Button variant="mystical" size="lg" className="gap-2">
                    <Hand className="h-5 w-5" />
                    {t('history.startFirst')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            // Logged in with analyses
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <AnalysisCard 
                  key={analysis.id} 
                  analysis={analysis}
                  formatDate={formatDate}
                  t={t}
                  onClick={() => navigate(`/analysis/${analysis.id}`, { state: { analysis: analysis.analysis_result, imageUrl: analysis.signed_image_url || analysis.image_url } })}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

interface AnalysisCardProps {
  analysis: Analysis;
  formatDate: (date: string) => string;
  t: (key: string) => string;
  onClick: () => void;
}

const AnalysisCard = ({ analysis, formatDate, t, onClick }: AnalysisCardProps) => (
  <Card 
    className="bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group"
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-center gap-6">
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
          <img 
            src={analysis.signed_image_url || analysis.image_url} 
            alt="Palm" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatDate(analysis.created_at)}
            </span>
          </div>
          <h3 className="font-display text-lg mb-1 group-hover:text-primary transition-colors">
            {t('history.analysisFromDate')}
          </h3>
          {analysis.analysis_result?.overview && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {analysis.analysis_result.overview}
            </p>
          )}
        </div>
        
        {/* Arrow */}
        <div className="text-muted-foreground group-hover:text-primary transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default HistoryPage;

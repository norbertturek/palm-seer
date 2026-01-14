import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import SampleAnalysis from "@/components/SampleAnalysis";
import { Button } from "@/components/ui/button";
import { Hand, ArrowLeft } from "lucide-react";

const SamplePage = () => {
  const { t } = useTranslation();

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
              {t('sample.title')}
            </h1>
            <p className="text-muted-foreground font-serif">
              {t('sample.description')}
            </p>
          </div>
          
          {/* Sample Analysis */}
          <SampleAnalysis />
          
          {/* CTA */}
          <div className="mt-12 text-center">
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-8">
              <h2 className="font-display text-2xl mb-4">{t('sample.cta.title')}</h2>
              <p className="text-muted-foreground mb-6 font-serif">
                {t('sample.cta.description')}
              </p>
              <Link to="/upload">
                <Button variant="mystical" size="xl" className="gap-2">
                  <Hand className="h-5 w-5" />
                  {t('sample.cta.button')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SamplePage;

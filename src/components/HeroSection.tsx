import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sparkles, Hand, Shield } from "lucide-react";
import logo from "@/assets/logo.png";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" style={{
          animationDelay: '2s'
        }} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 py-[30px]">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logo} alt="PalmSeer" className="h-24 w-24 animate-float glow-gold rounded-full" />
          </div>
          
          {/* Heading */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight">
            <span className="text-gradient-gold">{t('hero.title1')}</span>
            <br />
            <span className="text-foreground">{t('hero.title2')}</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 font-serif">
            {t('hero.subtitle')}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-16">
            <Link to="/sample">
              <Button variant="outline" size="xl" className="w-full sm:w-auto gap-2">
                <Sparkles className="h-5 w-5" />
                {t('hero.sampleButton')}
              </Button>
            </Link>
            <Link to="/upload">
              <Button variant="mystical" size="xl" className="w-full sm:w-auto gap-2">
                {t('hero.startButton')}
              </Button>
            </Link>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <FeatureCard 
              icon={<Hand className="h-6 w-6 text-primary" />} 
              title={t('features.validation.title')} 
              description={t('features.validation.description')} 
            />
            <FeatureCard 
              icon={<Sparkles className="h-6 w-6 text-primary" />} 
              title={t('features.analysis.title')} 
              description={t('features.analysis.description')} 
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6 text-primary" />} 
              title={t('features.privacy.title')} 
              description={t('features.privacy.description')} 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 hover:border-primary/50 transition-all duration-300 hover:glow-gold">
    <div className="flex flex-col items-center text-center gap-2">
      {icon}
      <h3 className="font-display text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default HeroSection;
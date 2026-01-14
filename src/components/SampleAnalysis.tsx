import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Brain, Star, TrendingUp, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

const SampleAnalysis = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <Card className="bg-card/80 backdrop-blur-sm border-primary/30 glow-gold">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="font-display text-3xl text-primary-foreground">87</span>
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <CardTitle className="font-display text-2xl text-gradient-gold">
            {t('sample.overallScore')}
          </CardTitle>
          <p className="text-muted-foreground font-serif">
            {t('sample.overallDescription')}
          </p>
        </CardHeader>
      </Card>

      {/* Palm Lines Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalysisCard
          icon={<Heart className="h-5 w-5" />}
          title={t('sample.heartLine.title')}
          score={92}
          description={t('sample.heartLine.description')}
          traits={t('sample.heartLine.traits')}
        />
        
        <AnalysisCard
          icon={<Brain className="h-5 w-5" />}
          title={t('sample.headLine.title')}
          score={85}
          description={t('sample.headLine.description')}
          traits={t('sample.headLine.traits')}
        />
        
        <AnalysisCard
          icon={<TrendingUp className="h-5 w-5" />}
          title={t('sample.lifeLine.title')}
          score={88}
          description={t('sample.lifeLine.description')}
          traits={t('sample.lifeLine.traits')}
        />
        
        <AnalysisCard
          icon={<Star className="h-5 w-5" />}
          title={t('sample.fateLine.title')}
          score={79}
          description={t('sample.fateLine.description')}
          traits={t('sample.fateLine.traits')}
        />
      </div>

      {/* Special Signs */}
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t('sample.specialSigns')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SignCard 
              name={t('sample.jupiterStar.name')} 
              meaning={t('sample.jupiterStar.meaning')}
            />
            <SignCard 
              name={t('sample.triangle.name')} 
              meaning={t('sample.triangle.meaning')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Future Predictions */}
      <Card className="bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl text-gradient-mystical">
            {t('sample.predictions')}
          </CardTitle>
        </CardHeader>
        <CardContent className="font-serif text-muted-foreground space-y-4">
          <p>{t('sample.careerPrediction')}</p>
          <p>{t('sample.relationshipPrediction')}</p>
          <p>{t('sample.talentPrediction')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

const AnalysisCard = ({ 
  icon, 
  title, 
  score, 
  description, 
  traits 
}: { 
  icon: React.ReactNode; 
  title: string; 
  score: number; 
  description: string; 
  traits: string;
}) => (
  <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          {title}
        </CardTitle>
        <div className="flex items-center gap-1">
          <span className="text-2xl font-display text-primary">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground mb-3 font-serif">{description}</p>
      <div className="flex flex-wrap gap-2">
        {traits.split(", ").map((trait) => (
          <Badge key={trait} variant="secondary" className="text-xs">
            {trait}
          </Badge>
        ))}
      </div>
    </CardContent>
  </Card>
);

const SignCard = ({ name, meaning }: { name: string; meaning: string }) => (
  <div className="p-4 rounded-lg bg-muted/30 border border-border">
    <h4 className="font-display text-sm text-primary mb-2">{name}</h4>
    <p className="text-xs text-muted-foreground font-serif">{meaning}</p>
  </div>
);

export default SampleAnalysis;

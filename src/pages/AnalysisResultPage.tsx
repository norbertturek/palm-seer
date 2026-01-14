import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Brain, Star, TrendingUp, Sparkles, HandMetal, Loader2, Activity, Compass, Lightbulb, Sun, MessageCircle, Mountain, Hand, User, Users, Briefcase, HeartPulse, Palette, Gem, Calendar, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface LineData {
  score?: number;
  description?: string;
  interpretation?: string;
  traits?: string[];
}

interface SpecialSign {
  name: string;
  meaning: string;
  location?: string;
}

interface MountData {
  strength?: string;
  meaning?: string;
}

interface AnalysisResult {
  overallScore?: number;
  overview?: string;
  lifeLine?: LineData;
  heartLine?: LineData;
  headLine?: LineData;
  fateLine?: LineData;
  sunLine?: LineData;
  mercuryLine?: LineData;
  mounts?: {
    jupiter?: MountData;
    saturn?: MountData;
    apollo?: MountData;
    mercury?: MountData;
    mars?: MountData;
    venus?: MountData;
    moon?: MountData;
  };
  handShape?: {
    type?: string;
    description?: string;
    fingerAnalysis?: string;
    proportions?: string;
  };
  personality?: {
    type?: string;
    element?: string;
    strengths?: string[];
    weaknesses?: string[];
    summary?: string;
  };
  relationships?: {
    loveStyle?: string;
    idealPartner?: string;
    challenges?: string;
    advice?: string;
  };
  career?: {
    idealJobs?: string[];
    talents?: string;
    path?: string;
    financialPotential?: string;
  };
  health?: {
    strengths?: string;
    areasOfConcern?: string;
    recommendations?: string;
    energyLevel?: string;
  };
  talents?: {
    hidden?: string[];
    artistic?: string;
    intellectual?: string;
    social?: string;
  };
  specialSigns?: SpecialSign[];
  predictions?: { 
    love?: string; 
    career?: string; 
    health?: string; 
    wealth?: string;
    spiritual?: string;
    shortTerm?: string;
    longTerm?: string;
  };
  luckyElements?: {
    numbers?: number[];
    days?: string[];
    colors?: string[];
    stones?: string[];
  };
  advice?: string;
  rawResponse?: boolean;
}

const AnalysisResultPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(location.state?.analysis || null);
  const [imageUrl, setImageUrl] = useState<string | null>(location.state?.imageUrl || null);
  const [isLoading, setIsLoading] = useState(!analysis);

  useEffect(() => {
    if (!analysis && id) {
      fetchAnalysis();
    }
  }, [id, analysis]);

  const fetchAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        navigate("/history");
        return;
      }

      setAnalysis(data.analysis_result as AnalysisResult);
      
      // Generate signed URL for the image
      const urlParts = data.image_url.split("/palm-images/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1].split("?")[0]; // Remove any existing query params
        const { data: signedData } = await supabase.storage
          .from("palm-images")
          .createSignedUrl(filePath, 3600);
        setImageUrl(signedData?.signedUrl || data.image_url);
      } else {
        setImageUrl(data.image_url);
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      navigate("/history");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground font-serif">Ładowanie analizy...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="font-display text-2xl mb-4">Nie znaleziono analizy</h1>
          <Link to="/history">
            <Button variant="gold">Powrót do historii</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/history" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" />
              Powrót do historii
            </Link>
          </div>

          {/* Overall Score Section */}
          <Card className="bg-gradient-to-br from-primary/20 to-accent/10 border-primary/30 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-primary">
                        {analysis.overallScore || 85}
                      </span>
                      <span className="text-sm text-primary">/100</span>
                    </div>
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-pulse" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="font-display text-2xl md:text-3xl text-gradient-gold mb-2">
                    Wynik ogólny analizy
                  </h1>
                  <p className="text-foreground/90 font-serif leading-relaxed">
                    {analysis.overview || "Twoja dłoń ujawnia wyjątkowy potencjał i głębię charakteru."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image */}
          {imageUrl && (
            <Card className="mb-8 overflow-hidden">
              <img 
                src={imageUrl} 
                alt="Analizowana dłoń" 
                className="w-full max-h-64 object-contain bg-muted"
              />
            </Card>
          )}

          {/* Hand Shape */}
          {analysis.handShape && (
            <>
              <SectionTitle icon={<Hand className="w-5 h-5 text-primary" />} title="Kształt dłoni" />
              <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border">
                <CardContent className="p-6 space-y-4">
                  {analysis.handShape.type && (
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        Typ: {analysis.handShape.type}
                      </Badge>
                    </div>
                  )}
                  {analysis.handShape.description && (
                    <p className="text-foreground/90 font-serif">{analysis.handShape.description}</p>
                  )}
                  {analysis.handShape.fingerAnalysis && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-display text-sm mb-2">Analiza palców</h4>
                      <p className="text-sm text-muted-foreground font-serif">{analysis.handShape.fingerAnalysis}</p>
                    </div>
                  )}
                  {analysis.handShape.proportions && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-display text-sm mb-2">Proporcje dłoni</h4>
                      <p className="text-sm text-muted-foreground font-serif">{analysis.handShape.proportions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Palm Lines Analysis */}
          <SectionTitle icon={<Activity className="w-5 h-5 text-primary" />} title="Analiza linii dłoni" />
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {analysis.heartLine && (
              <AnalysisCard 
                icon={<Heart className="h-5 w-5" />}
                title="Linia serca"
                score={analysis.heartLine.score}
                description={analysis.heartLine.description}
                interpretation={analysis.heartLine.interpretation}
                traits={analysis.heartLine.traits}
              />
            )}
            {analysis.headLine && (
              <AnalysisCard 
                icon={<Brain className="h-5 w-5" />}
                title="Linia głowy"
                score={analysis.headLine.score}
                description={analysis.headLine.description}
                interpretation={analysis.headLine.interpretation}
                traits={analysis.headLine.traits}
              />
            )}
            {analysis.lifeLine && (
              <AnalysisCard 
                icon={<Activity className="h-5 w-5" />}
                title="Linia życia"
                score={analysis.lifeLine.score}
                description={analysis.lifeLine.description}
                interpretation={analysis.lifeLine.interpretation}
                traits={analysis.lifeLine.traits}
              />
            )}
            {analysis.fateLine && (
              <AnalysisCard 
                icon={<Compass className="h-5 w-5" />}
                title="Linia losu"
                score={analysis.fateLine.score}
                description={analysis.fateLine.description}
                interpretation={analysis.fateLine.interpretation}
                traits={analysis.fateLine.traits}
              />
            )}
            {analysis.sunLine && (
              <AnalysisCard 
                icon={<Sun className="h-5 w-5" />}
                title="Linia słońca"
                score={analysis.sunLine.score}
                description={analysis.sunLine.description}
                interpretation={analysis.sunLine.interpretation}
                traits={analysis.sunLine.traits}
              />
            )}
            {analysis.mercuryLine && (
              <AnalysisCard 
                icon={<MessageCircle className="h-5 w-5" />}
                title="Linia Merkurego"
                score={analysis.mercuryLine.score}
                description={analysis.mercuryLine.description}
                interpretation={analysis.mercuryLine.interpretation}
                traits={analysis.mercuryLine.traits}
              />
            )}
          </div>

          {/* Mounts */}
          {analysis.mounts && Object.keys(analysis.mounts).length > 0 && (
            <>
              <SectionTitle icon={<Mountain className="w-5 h-5 text-primary" />} title="Wzgórza dłoni" />
              <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysis.mounts.jupiter && (
                      <MountCard name="Wzgórze Jowisza" mount={analysis.mounts.jupiter} />
                    )}
                    {analysis.mounts.saturn && (
                      <MountCard name="Wzgórze Saturna" mount={analysis.mounts.saturn} />
                    )}
                    {analysis.mounts.apollo && (
                      <MountCard name="Wzgórze Apollo" mount={analysis.mounts.apollo} />
                    )}
                    {analysis.mounts.mercury && (
                      <MountCard name="Wzgórze Merkurego" mount={analysis.mounts.mercury} />
                    )}
                    {analysis.mounts.mars && (
                      <MountCard name="Wzgórze Marsa" mount={analysis.mounts.mars} />
                    )}
                    {analysis.mounts.venus && (
                      <MountCard name="Wzgórze Wenus" mount={analysis.mounts.venus} />
                    )}
                    {analysis.mounts.moon && (
                      <MountCard name="Wzgórze Księżyca" mount={analysis.mounts.moon} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Personality */}
          {analysis.personality && (
            <>
              <SectionTitle icon={<User className="w-5 h-5 text-primary" />} title="Profil osobowości" />
              <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {analysis.personality.type && (
                      <Badge variant="secondary" className="text-sm">{analysis.personality.type}</Badge>
                    )}
                    {analysis.personality.element && (
                      <Badge variant="outline" className="text-sm">Żywioł: {analysis.personality.element}</Badge>
                    )}
                  </div>
                  {analysis.personality.summary && (
                    <p className="text-foreground/90 font-serif">{analysis.personality.summary}</p>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.personality.strengths && analysis.personality.strengths.length > 0 && (
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <h4 className="font-display text-sm mb-3 flex items-center gap-2">
                          <span className="text-primary">✓</span> Mocne strony
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.personality.strengths.map((strength, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">{strength}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {analysis.personality.weaknesses && analysis.personality.weaknesses.length > 0 && (
                      <div className="p-4 rounded-lg bg-muted/50 border border-border">
                        <h4 className="font-display text-sm mb-3 flex items-center gap-2">
                          <span className="text-muted-foreground">↑</span> Obszary do rozwoju
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.personality.weaknesses.map((weakness, index) => (
                            <Badge key={index} variant="outline" className="text-xs">{weakness}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Relationships */}
          {analysis.relationships && (
            <>
              <SectionTitle icon={<Users className="w-5 h-5 text-primary" />} title="Relacje i miłość" />
              <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.relationships.loveStyle && (
                      <InfoCard title="Styl miłosny" content={analysis.relationships.loveStyle} emoji="💕" />
                    )}
                    {analysis.relationships.idealPartner && (
                      <InfoCard title="Idealny partner" content={analysis.relationships.idealPartner} emoji="💑" />
                    )}
                    {analysis.relationships.challenges && (
                      <InfoCard title="Wyzwania" content={analysis.relationships.challenges} emoji="🔥" />
                    )}
                    {analysis.relationships.advice && (
                      <InfoCard title="Rada" content={analysis.relationships.advice} emoji="💡" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Career */}
          {analysis.career && (
            <>
              <SectionTitle icon={<Briefcase className="w-5 h-5 text-primary" />} title="Kariera i powołanie" />
              <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border">
                <CardContent className="p-6 space-y-4">
                  {analysis.career.idealJobs && analysis.career.idealJobs.length > 0 && (
                    <div>
                      <h4 className="font-display text-sm mb-3">Idealne zawody</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.career.idealJobs.map((job, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">{job}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.career.talents && (
                      <InfoCard title="Talenty zawodowe" content={analysis.career.talents} emoji="⭐" />
                    )}
                    {analysis.career.path && (
                      <InfoCard title="Ścieżka kariery" content={analysis.career.path} emoji="🛤️" />
                    )}
                    {analysis.career.financialPotential && (
                      <InfoCard title="Potencjał finansowy" content={analysis.career.financialPotential} emoji="💰" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Health */}
          {analysis.health && (
            <>
              <SectionTitle icon={<HeartPulse className="w-5 h-5 text-primary" />} title="Zdrowie" />
              <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border">
                <CardContent className="p-6">
                  {analysis.health.energyLevel && (
                    <div className="mb-4">
                      <Badge variant="secondary" className="text-sm">
                        Poziom energii: {analysis.health.energyLevel}
                      </Badge>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.health.strengths && (
                      <InfoCard title="Mocne strony" content={analysis.health.strengths} emoji="💪" />
                    )}
                    {analysis.health.areasOfConcern && (
                      <InfoCard title="Obszary uwagi" content={analysis.health.areasOfConcern} emoji="⚠️" />
                    )}
                    {analysis.health.recommendations && (
                      <InfoCard title="Zalecenia wellness" content={analysis.health.recommendations} emoji="🌿" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Talents */}
          {analysis.talents && (
            <>
              <SectionTitle icon={<Palette className="w-5 h-5 text-primary" />} title="Talenty i zdolności" />
              <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border">
                <CardContent className="p-6 space-y-4">
                  {analysis.talents.hidden && analysis.talents.hidden.length > 0 && (
                    <div>
                      <h4 className="font-display text-sm mb-3">Ukryte talenty</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.talents.hidden.map((talent, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">{talent}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid md:grid-cols-3 gap-4">
                    {analysis.talents.artistic && (
                      <InfoCard title="Artystyczne" content={analysis.talents.artistic} emoji="🎨" />
                    )}
                    {analysis.talents.intellectual && (
                      <InfoCard title="Intelektualne" content={analysis.talents.intellectual} emoji="🧠" />
                    )}
                    {analysis.talents.social && (
                      <InfoCard title="Społeczne" content={analysis.talents.social} emoji="🤝" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Special Signs */}
          {analysis.specialSigns && analysis.specialSigns.length > 0 && (
            <>
              <SectionTitle icon={<Star className="w-5 h-5 text-primary" />} title="Znaki specjalne" />
              <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.specialSigns.map((sign, index) => (
                      <SignCard key={index} name={sign.name} meaning={sign.meaning} location={sign.location} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Lucky Elements */}
          {analysis.luckyElements && (
            <>
              <SectionTitle icon={<Gem className="w-5 h-5 text-primary" />} title="Szczęśliwe elementy" />
              <Card className="mb-8 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {analysis.luckyElements.numbers && analysis.luckyElements.numbers.length > 0 && (
                      <div className="text-center p-4 rounded-lg bg-background/50">
                        <Hash className="w-6 h-6 text-primary mx-auto mb-2" />
                        <h4 className="font-display text-sm mb-2">Liczby</h4>
                        <p className="text-sm text-muted-foreground">{analysis.luckyElements.numbers.join(", ")}</p>
                      </div>
                    )}
                    {analysis.luckyElements.days && analysis.luckyElements.days.length > 0 && (
                      <div className="text-center p-4 rounded-lg bg-background/50">
                        <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                        <h4 className="font-display text-sm mb-2">Dni</h4>
                        <p className="text-sm text-muted-foreground">{analysis.luckyElements.days.join(", ")}</p>
                      </div>
                    )}
                    {analysis.luckyElements.colors && analysis.luckyElements.colors.length > 0 && (
                      <div className="text-center p-4 rounded-lg bg-background/50">
                        <Palette className="w-6 h-6 text-primary mx-auto mb-2" />
                        <h4 className="font-display text-sm mb-2">Kolory</h4>
                        <p className="text-sm text-muted-foreground">{analysis.luckyElements.colors.join(", ")}</p>
                      </div>
                    )}
                    {analysis.luckyElements.stones && analysis.luckyElements.stones.length > 0 && (
                      <div className="text-center p-4 rounded-lg bg-background/50">
                        <Gem className="w-6 h-6 text-primary mx-auto mb-2" />
                        <h4 className="font-display text-sm mb-2">Kamienie</h4>
                        <p className="text-sm text-muted-foreground">{analysis.luckyElements.stones.join(", ")}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Predictions */}
          {analysis.predictions && (
            <>
              <SectionTitle icon={<TrendingUp className="w-5 h-5 text-primary" />} title="Przepowiednie" />
              <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border">
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {analysis.predictions.love && (
                      <PredictionItem title="Miłość" content={analysis.predictions.love} emoji="💕" />
                    )}
                    {analysis.predictions.career && (
                      <PredictionItem title="Kariera" content={analysis.predictions.career} emoji="💼" />
                    )}
                    {analysis.predictions.health && (
                      <PredictionItem title="Zdrowie" content={analysis.predictions.health} emoji="🌿" />
                    )}
                    {analysis.predictions.wealth && (
                      <PredictionItem title="Finanse" content={analysis.predictions.wealth} emoji="💰" />
                    )}
                    {analysis.predictions.spiritual && (
                      <PredictionItem title="Rozwój duchowy" content={analysis.predictions.spiritual} emoji="🔮" />
                    )}
                  </div>
                  {(analysis.predictions.shortTerm || analysis.predictions.longTerm) && (
                    <div className="mt-6 grid md:grid-cols-2 gap-4">
                      {analysis.predictions.shortTerm && (
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                          <h4 className="font-display text-sm mb-2 flex items-center gap-2">
                            <span>📅</span> Najbliższe 12 miesięcy
                          </h4>
                          <p className="text-sm text-foreground/80 font-serif">{analysis.predictions.shortTerm}</p>
                        </div>
                      )}
                      {analysis.predictions.longTerm && (
                        <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                          <h4 className="font-display text-sm mb-2 flex items-center gap-2">
                            <span>🔭</span> Perspektywa 5 lat
                          </h4>
                          <p className="text-sm text-foreground/80 font-serif">{analysis.predictions.longTerm}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Advice */}
          {analysis.advice && (
            <Card className="bg-gradient-to-br from-accent/20 to-primary/10 border-accent/30 mb-8">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Rada na przyszłość
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-foreground/90 leading-relaxed italic">
                  "{analysis.advice}"
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/upload">
              <Button variant="mystical" size="lg" className="gap-2">
                <HandMetal className="h-5 w-5" />
                Nowa analiza
              </Button>
            </Link>
            <Link to="/history">
              <Button variant="outline" size="lg">
                Zobacz historię
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <h2 className="font-display text-xl mb-4 flex items-center gap-2">
    {icon}
    {title}
  </h2>
);

interface AnalysisCardProps {
  icon: React.ReactNode;
  title: string;
  score?: number;
  description?: string;
  interpretation?: string;
  traits?: string[];
}

const AnalysisCard = ({ icon, title, score, description, interpretation, traits }: AnalysisCardProps) => (
  <Card className="bg-card/80 backdrop-blur-sm border-border relative overflow-hidden">
    {score && (
      <div className="absolute top-3 right-3 bg-primary/20 rounded-full px-3 py-1">
        <span className="text-sm font-semibold text-primary">{score}/100</span>
      </div>
    )}
    <CardHeader className="pb-2">
      <CardTitle className="font-display text-lg flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          {icon}
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {interpretation && (
        <p className="text-sm font-serif">{interpretation}</p>
      )}
      {traits && traits.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {traits.map((trait, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {trait}
            </Badge>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const MountCard = ({ name, mount }: { name: string; mount: MountData }) => (
  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-display text-sm">{name}</h4>
      {mount.strength && (
        <Badge variant="outline" className="text-xs capitalize">{mount.strength}</Badge>
      )}
    </div>
    {mount.meaning && (
      <p className="text-sm text-muted-foreground font-serif">{mount.meaning}</p>
    )}
  </div>
);

const SignCard = ({ name, meaning, location }: { name: string; meaning: string; location?: string }) => (
  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
    <div className="flex items-center gap-2 mb-2">
      <Star className="w-4 h-4 text-primary" />
      <h4 className="font-display text-sm">{name}</h4>
    </div>
    <p className="text-sm text-muted-foreground font-serif mb-1">{meaning}</p>
    {location && (
      <p className="text-xs text-muted-foreground/70 italic">Lokalizacja: {location}</p>
    )}
  </div>
);

const InfoCard = ({ title, content, emoji }: { title: string; content: string; emoji: string }) => (
  <div className="p-4 rounded-lg bg-muted/50">
    <h4 className="font-display text-sm mb-1 flex items-center gap-2">
      <span>{emoji}</span>
      {title}
    </h4>
    <p className="text-sm text-muted-foreground font-serif">{content}</p>
  </div>
);

const PredictionItem = ({ title, content, emoji }: { title: string; content: string; emoji: string }) => (
  <div className="p-4 rounded-lg bg-muted/50">
    <h4 className="font-display text-sm mb-1 flex items-center gap-2">
      <span>{emoji}</span>
      {title}
    </h4>
    <p className="text-sm text-muted-foreground font-serif">{content}</p>
  </div>
);

export default AnalysisResultPage;
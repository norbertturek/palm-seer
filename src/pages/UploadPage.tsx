import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import ImageUpload from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Shield, Sparkles, AlertCircle, CheckCircle, Coins, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const UploadPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, refreshProfile, session } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle payment success/cancel
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success(t('upload.validationSuccess'));
      refreshProfile();
      // Clear URL params
      navigate("/upload", { replace: true });
    } else if (searchParams.get("canceled") === "true") {
      toast.info(t('upload.paymentError'));
      navigate("/upload", { replace: true });
    }
  }, [searchParams, navigate, refreshProfile, t]);

  const validatePalmImage = async (file: File) => {
    setIsValidating(true);
    setValidationError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const imageBase64 = await base64Promise;

      const response = await supabase.functions.invoke("validate-palm", {
        body: { imageBase64 },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;

      if (result.isPalm) {
        setIsValidated(true);
        toast.success(t('upload.validationSuccess'));
      } else {
        setValidationError(t('upload.validationFailed'));
      }
    } catch (error) {
      console.error("Validation error:", error);
      // Default to accepting on error
      setIsValidated(true);
      toast.info(t('upload.validatingImage'));
    } finally {
      setIsValidating(false);
    }
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setValidationError(null);
    setIsValidated(false);
    
    if (file) {
      validatePalmImage(file);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error(t('upload.loginRequired'));
      navigate("/auth");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const response = await supabase.functions.invoke("create-checkout", {
        body: { origin: window.location.origin },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { url } = response.data;
      if (url) {
        // Open in new tab for better compatibility
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(t('upload.paymentError'));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAnalysis = async () => {
    if (!user || !selectedImage) return;

    if (!profile || profile.analysis_credits < 1) {
      toast.error(t('upload.noCredits'));
      return;
    }

    setIsAnalyzing(true);

    try {
      // Upload image to storage
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("palm-images")
        .upload(fileName, selectedImage);

      if (uploadError) {
        throw new Error(t('upload.uploadError'));
      }

      // Get signed URL for private bucket (valid for 1 hour)
      const { data: urlData, error: signedUrlError } = await supabase.storage
        .from("palm-images")
        .createSignedUrl(fileName, 3600);

      if (signedUrlError || !urlData?.signedUrl) {
        throw new Error(t('upload.uploadError'));
      }

      const imageUrl = urlData.signedUrl;

      // Call analysis function with language parameter
      const response = await supabase.functions.invoke("analyze-palm", {
        body: { 
          imageUrl, 
          additionalNotes: notes,
          language: i18n.language // Pass current language
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { analysis, analysisId, remainingCredits } = response.data;

      // Navigate to results page
      navigate(`/analysis/${analysisId}`, { state: { analysis, imageUrl } });
      
      toast.success(t('upload.validationSuccess'));

      refreshProfile();
    } catch (error: any) {
      console.error("Analysis error:", error);
      if (error.message?.includes("402") || error.message?.includes("kredytów")) {
        toast.error(t('upload.noCredits'));
      } else {
        toast.error(t('upload.analysisError'));
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasCredits = profile && profile.analysis_credits > 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Link>
            <h1 className="font-display text-3xl md:text-4xl text-gradient-gold mb-4">
              {t('upload.title')}
            </h1>
            <p className="text-muted-foreground font-serif">
              {t('upload.description')}
            </p>
          </div>

          {/* Credits Display */}
          {user && (
            <Card className={`mb-6 ${hasCredits ? 'bg-primary/10 border-primary/30' : 'bg-muted/50 border-border'}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Coins className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-display text-sm">{t('upload.credits')}</p>
                    <p className="text-2xl font-bold text-primary">{profile?.analysis_credits || 0}</p>
                  </div>
                </div>
                {!hasCredits && (
                  <Button variant="gold" size="sm" onClick={handlePayment} disabled={isProcessingPayment}>
                    {isProcessingPayment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t('upload.buyCredits')
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Upload Section */}
          <ImageUpload
            onImageSelect={handleImageSelect}
            onNotesChange={setNotes}
            isValidating={isValidating}
            validationError={validationError}
            selectedImage={selectedImage}
          />
          
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-4 flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display text-sm mb-1">{t('upload.safePayment')}</h4>
                  <p className="text-xs text-muted-foreground">
                    Stripe
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-4 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display text-sm mb-1">{t('upload.quickAnalysis')}</h4>
                  <p className="text-xs text-muted-foreground">
                    AI
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Login/Credits warning */}
          {!user ? (
            <Card className="mt-6 bg-accent/10 border-accent/30">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display text-sm mb-1 text-accent-foreground">
                    {t('upload.notLoggedIn')}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    <Link to="/auth" className="text-primary hover:underline">{t('upload.loginButton')}</Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : hasCredits && isValidated ? (
            <Card className="mt-6 bg-primary/10 border-primary/30">
              <CardContent className="p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display text-sm mb-1 text-primary">
                    {t('upload.validationSuccess')}
                  </h4>
                </div>
              </CardContent>
            </Card>
          ) : null}
          
          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            {user && hasCredits ? (
              <Button
                variant="mystical"
                size="xl"
                className="w-full gap-2"
                disabled={!isValidated || isValidating || isAnalyzing}
                onClick={handleAnalysis}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('upload.analyzing')}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    {t('upload.startAnalysis')} ({t('upload.usesOneCredit')})
                  </>
                )}
              </Button>
            ) : user ? (
              <Button
                variant="mystical"
                size="xl"
                className="w-full gap-2"
                disabled={!isValidated || isValidating || isProcessingPayment}
                onClick={handlePayment}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    {t('upload.buyCredits')}
                  </>
                )}
              </Button>
            ) : (
              <Link to="/auth" className="block">
                <Button
                  variant="gold"
                  size="xl"
                  className="w-full gap-2"
                >
                  {t('upload.loginButton')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;

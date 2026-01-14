import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X, Camera, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import CameraModal from "@/components/CameraModal";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onNotesChange: (notes: string) => void;
  isValidating?: boolean;
  validationError?: string | null;
  selectedImage: File | null;
}

const ImageUpload = ({ 
  onImageSelect, 
  onNotesChange, 
  isValidating, 
  validationError,
  selectedImage 
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [notes, setNotes] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    onImageSelect(null as unknown as File);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    onNotesChange(e.target.value);
  };

  const openCamera = async () => {
    // Check if mediaDevices is available (camera access)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Brak dostępu do aparatu",
        description: "Twoja przeglądarka lub urządzenie nie obsługuje aparatu. Wybierz zdjęcie z galerii.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Request camera permission to check if it's available
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately - we just wanted to check permission
      stream.getTracks().forEach(track => track.stop());
      // If successful, open the camera modal
      setIsCameraOpen(true);
    } catch (error) {
      toast({
        title: "Brak dostępu do aparatu",
        description: "Nie udało się uzyskać dostępu do aparatu. Sprawdź uprawnienia w ustawieniach przeglądarki lub wybierz zdjęcie z galerii.",
        variant: "destructive",
      });
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleCameraCapture = (file: File) => {
    handleFile(file);
  };

  return (
    <div className="space-y-6">
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardContent className="p-6">
          <Label className="font-display text-lg mb-4 block">Zdjęcie dłoni</Label>
          
          {!preview ? (
            <div className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  "relative border-2 border-dashed rounded-lg p-6 transition-all duration-300",
                  isDragging 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium text-sm">
                      Przeciągnij zdjęcie tutaj
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG do 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={openCamera}
                >
                  <Camera className="h-4 w-4" />
                  Zrób zdjęcie
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={openFilePicker}
                >
                  <ImageIcon className="h-4 w-4" />
                  Wybierz z galerii
                </Button>
              </div>

              {/* Hidden input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Camera className="h-4 w-4" />
                <span>Najlepiej zdjęcie wewnętrznej strony lewej dłoni</span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={preview}
                alt="Podgląd zdjęcia dłoni"
                className="w-full max-h-80 object-contain rounded-lg border border-border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
              
              {isValidating && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Sprawdzanie zdjęcia...</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {validationError && (
            <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-destructive">{validationError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardContent className="p-6">
          <Label htmlFor="notes" className="font-display text-lg mb-4 block">
            Dodatkowe informacje (opcjonalne)
          </Label>
          <Textarea
            id="notes"
            placeholder="Możesz dodać informacje o swoim życiu, pytania lub obszary, które Cię szczególnie interesują..."
            value={notes}
            onChange={handleNotesChange}
            className="min-h-[120px] bg-input border-border focus:border-primary"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Te informacje pomogą AI lepiej spersonalizować Twoją analizę
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUpload;

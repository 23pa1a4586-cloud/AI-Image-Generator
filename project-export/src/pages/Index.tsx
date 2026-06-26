import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, Sparkles, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Please enter a prompt", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setImageUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: prompt.trim() },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        throw new Error("No image returned");
      }
    } catch (err: any) {
      toast({
        title: "Generation failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">AI Image Generator</h1>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Prompt Input */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <Textarea
                placeholder="Describe the image you want to create… e.g. 'A futuristic city at sunset with flying cars'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] resize-none text-base"
                disabled={isLoading}
              />
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full sm:w-auto"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles />
                    Generate Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm">Creating your image…</p>
                </div>
              )}

              {!isLoading && imageUrl && (
                <div className="relative group">
                  <img
                    src={imageUrl}
                    alt={prompt}
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {!isLoading && !imageUrl && (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                  <ImageIcon className="h-12 w-12" />
                  <p className="text-sm">Your generated image will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;

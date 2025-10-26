import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

export default function CreateBot() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    salutation: '',
    character_prompt: '',
    is_public: false,
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('salutation', formData.salutation);
      data.append('character_prompt', formData.character_prompt);
      data.append('ollama_model', 'darkidol-rp');
      data.append('is_public', String(formData.is_public));
      if (image) {
        data.append('image', image);
      }

      await apiClient.createBot(data);
      toast.success('Bot créé avec succès !');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du bot');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Créer un nouveau Bot</CardTitle>
              <CardDescription>
                Définissez la personnalité et l'apparence de votre bot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="image">Image du Bot (Portrait)</Label>
                  <div className="flex gap-4">
                    <div className="relative w-32 h-40 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors overflow-hidden group">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1 text-sm text-muted-foreground">
                      Cliquez pour télécharger une image au format portrait.
                      Recommandé : 512x768px
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nom du Bot *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Luna l'aventurière"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salutation">Salutation (Premier message) *</Label>
                  <Textarea
                    id="salutation"
                    placeholder="Ex: Bonjour ! Je suis Luna, prête pour l'aventure. Que veux-tu faire aujourd'hui ?"
                    value={formData.salutation}
                    onChange={(e) => setFormData({ ...formData, salutation: e.target.value })}
                    rows={3}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Ce message sera visible par les utilisateurs et envoyé automatiquement au début de chaque conversation
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="character_prompt">Arrière-plan du personnage *</Label>
                  <Textarea
                    id="character_prompt"
                    placeholder="Description détaillée du caractère, de la personnalité, de l'histoire, etc."
                    value={formData.character_prompt}
                    onChange={(e) => setFormData({ ...formData, character_prompt: e.target.value })}
                    rows={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Cette description guide le comportement du bot (non visible par les utilisateurs)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Modèle</Label>
                  <Input value="darkidol-rp" disabled />
                  <p className="text-xs text-muted-foreground">
                    Modèle actuellement disponible
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_public">Bot Public</Label>
                    <p className="text-xs text-muted-foreground">
                      Rendre ce bot accessible à tous les utilisateurs
                    </p>
                  </div>
                  <Switch
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Création...' : 'Créer le Bot'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

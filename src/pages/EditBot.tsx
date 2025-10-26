import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';

export default function EditBot() {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const { username } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    salutation: '',
    character_prompt: '',
    ollama_model: 'darkidol-rp',
    is_public: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [deleteImage, setDeleteImage] = useState(false);

  const { data: bot, isLoading } = useQuery({
    queryKey: ['bot', botId],
    queryFn: () => apiClient.getBot(Number(botId)),
    enabled: !!botId,
  });

  useEffect(() => {
    if (bot) {
      setFormData({
        name: bot.name,
        salutation: bot.salutation,
        character_prompt: bot.character_prompt,
        ollama_model: bot.ollama_model,
        is_public: bot.is_public,
      });
      if (bot.image_url) {
        setImagePreview(bot.image_url);
      }
    }
  }, [bot]);

  const updateBotMutation = useMutation({
    mutationFn: (data: FormData) => apiClient.updateBot(Number(botId), data),
    onSuccess: () => {
      toast.success('Bot modifié avec succès');
      navigate('/home');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la modification');
    },
  });

  const deleteBotMutation = useMutation({
    mutationFn: () => apiClient.deleteBot(Number(botId)),
    onSuccess: () => {
      toast.success('Bot supprimé avec succès');
      navigate('/home');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setDeleteImage(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setDeleteImage(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('salutation', formData.salutation);
    data.append('character_prompt', formData.character_prompt);
    data.append('ollama_model', formData.ollama_model);
    data.append('is_public', formData.is_public.toString());
    
    if (imageFile) {
      data.append('image', imageFile);
    }
    
    if (deleteImage) {
      data.append('delete_image', 'true');
    }

    updateBotMutation.mutate(data);
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bot ?')) {
      deleteBotMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Bot non trouvé</p>
        </div>
      </div>
    );
  }

  const canEdit = bot.creator_id === Number(localStorage.getItem('user_id')) || username === 'Admin';

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Vous n'avez pas la permission de modifier ce bot</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Modifier le Bot</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du Bot</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salutation">Salutation (Premier message)</Label>
                <Textarea
                  id="salutation"
                  value={formData.salutation}
                  onChange={(e) => setFormData({ ...formData, salutation: e.target.value })}
                  placeholder="Message d'accueil du bot..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="character_prompt">Arrière-plan (Character Prompt)</Label>
                <Textarea
                  id="character_prompt"
                  value={formData.character_prompt}
                  onChange={(e) => setFormData({ ...formData, character_prompt: e.target.value })}
                  placeholder="Description détaillée du personnage..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modèle</Label>
                <Input
                  id="model"
                  value={formData.ollama_model}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image du Bot (format portrait)</Label>
                <div className="flex items-start gap-4">
                  {imagePreview && !deleteImage && (
                    <div className="relative w-32 h-40 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Format recommandé : portrait (3:4)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                />
                <Label htmlFor="public" className="cursor-pointer">
                  Rendre le bot public
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={updateBotMutation.isPending}
                >
                  {updateBotMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Modification...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteBotMutation.isPending}
                >
                  {deleteBotMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Supprimer'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

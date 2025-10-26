import { Bot } from '@/lib/api';
import { apiClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Globe, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface BotCardProps {
  bot: Bot;
}

export function BotCard({ bot }: BotCardProps) {
  const navigate = useNavigate();
  const { username } = useAuth();
  
  const canEdit = username === 'Admin';

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-bot/${bot.id}`);
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all hover:scale-105 hover:glow-primary group"
      onClick={() => navigate(`/chat/${bot.id}`)}
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-muted">
        <img
          src={apiClient.getBotImageUrl(bot.image_filename)}
          alt={bot.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge variant={bot.is_public ? "default" : "secondary"} className="gap-1">
            {bot.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            {bot.is_public ? 'Public' : 'Privé'}
          </Badge>
        </div>
        {canEdit && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 truncate">{bot.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{bot.salutation}</p>
      </CardContent>
    </Card>
  );
}

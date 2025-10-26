import { Bot } from '@/lib/api';
import { apiClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BotCardProps {
  bot: Bot;
}

export function BotCard({ bot }: BotCardProps) {
  const navigate = useNavigate();

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all hover:scale-105 hover:glow-primary"
      onClick={() => navigate(`/chat/${bot.id}`)}
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-muted">
        <img
          src={apiClient.getBotImageUrl(bot.image_filename)}
          alt={bot.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={bot.is_public ? "default" : "secondary"} className="gap-1">
            {bot.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            {bot.is_public ? 'Public' : 'Privé'}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 truncate">{bot.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{bot.salutation}</p>
      </CardContent>
    </Card>
  );
}

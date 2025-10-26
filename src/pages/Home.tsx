import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { BotCard } from '@/components/BotCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function Home() {
  const [search, setSearch] = useState('');

  const { data: publicBots = [], isLoading: loadingPublic } = useQuery({
    queryKey: ['publicBots', search],
    queryFn: () => apiClient.getPublicBots(search),
  });

  const { data: myBots = [], isLoading: loadingMy } = useQuery({
    queryKey: ['myBots', search],
    queryFn: () => apiClient.getMyBots(search),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Découvrez des <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Personnages IA</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Chattez avec des bots créés par la communauté ou créez le vôtre
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher un bot..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          <Tabs defaultValue="public" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="public">Bots Publics</TabsTrigger>
              <TabsTrigger value="my">Mes Bots</TabsTrigger>
            </TabsList>

            <TabsContent value="public" className="mt-8">
              {loadingPublic ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : publicBots.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucun bot public trouvé</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {publicBots.map((bot) => (
                    <BotCard key={bot.id} bot={bot} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my" className="mt-8">
              {loadingMy ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : myBots.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Vous n'avez pas encore créé de bot</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {myBots.map((bot) => (
                    <BotCard key={bot.id} bot={bot} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

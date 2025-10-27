import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { ThinkingAnimation } from '@/components/ThinkingAnimation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient, Message } from '@/lib/api';
import { toast } from 'sonner';
import { Send, Undo2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Chat() {
  const { botId } = useParams<{ botId: string }>();
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: bot } = useQuery({
    queryKey: ['bot', botId],
    queryFn: () => apiClient.getBot(Number(botId)),
    enabled: !!botId,
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chatHistory', botId],
    queryFn: () => apiClient.getChatHistory(Number(botId)),
    enabled: !!botId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ botId, message }: { botId: number; message: string }) =>
      apiClient.sendMessage(botId, message),
    onMutate: async ({ message }) => {
      // Add user message optimistically
      const newMessage: Message = {
        sender: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      
      queryClient.setQueryData(['chatHistory', botId], (old: Message[] = []) => [...old, newMessage]);
    },
    onSuccess: (data) => {
      // Add bot response
      const botMessage: Message = {
        sender: 'bot',
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      
      queryClient.setQueryData(['chatHistory', botId], (old: Message[] = []) => [...old, botMessage]);
      setIsThinking(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'envoi du message');
      queryClient.invalidateQueries({ queryKey: ['chatHistory', botId] });
      setIsThinking(false);
    },
  });

  const deleteLastMessageMutation = useMutation({
    mutationFn: (botId: number) => apiClient.deleteLastMessage(botId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory', botId] });
      toast.success('Dernier échange supprimé');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    },
  });

  const handleSend = () => {
    if (!inputMessage.trim() || !botId || isThinking) return;

    setIsThinking(true);
    sendMessageMutation.mutate({ botId: Number(botId), message: inputMessage });
    setInputMessage('');
  };

  const handleDeleteLast = () => {
    if (!botId || messages.length === 0) return;
    deleteLastMessageMutation.mutate(Number(botId));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {bot && (
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={bot.image_url || '/placeholder.svg'} />
                <AvatarFallback>{bot.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{bot.name}</h2>
                <p className="text-sm text-muted-foreground">{bot.salutation}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {message.sender === 'bot' && bot && (
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={bot.image_url || '/placeholder.svg'} />
                    <AvatarFallback>{bot.name[0]}</AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>

                {message.sender === 'user' && (
                  <Avatar className="h-10 w-10 flex-shrink-0 bg-primary">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-3">
                {bot && (
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={bot.image_url || '/placeholder.svg'} />
                    <AvatarFallback>{bot.name[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div className="bg-card border border-border rounded-2xl">
                  <ThinkingAnimation />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex gap-2">
            {messages.length > 0 && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleDeleteLast}
                disabled={isThinking}
                title="Supprimer le dernier échange"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            )}
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Écrivez votre message..."
              disabled={isThinking}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isThinking || !inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

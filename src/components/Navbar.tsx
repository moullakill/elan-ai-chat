import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bot, LogOut, Plus, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Bot className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AIO Chatbot
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link to="/create-bot">
              <Plus className="h-4 w-4 mr-2" />
              Créer un Bot
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>
    </nav>
  );
}

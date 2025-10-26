const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface User {
  username: string;
}

export interface Bot {
  id: number;
  name: string;
  salutation: string;
  character_prompt: string;
  ollama_model: string;
  is_public: boolean;
  image_filename?: string;
  image_url?: string;
  creator_id: number;
}

export interface Message {
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
  id?: number;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  private getHeaders(isFormData = false): HeadersInit {
    const headers: HeadersInit = {};
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async register(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Registration failed');
    }
    
    return response.json();
  }

  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Login failed');
    }
    
    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async createBot(formData: FormData) {
    const response = await fetch(`${API_BASE_URL}/bots/create`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Bot creation failed');
    }
    
    return response.json();
  }

  async getPublicBots(search?: string): Promise<Bot[]> {
    const url = new URL(`${API_BASE_URL}/bots/public`);
    if (search) {
      url.searchParams.append('q', search);
    }
    
    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch public bots');
    }
    
    return response.json();
  }

  async getMyBots(search?: string): Promise<Bot[]> {
    const url = new URL(`${API_BASE_URL}/bots/mybots`);
    if (search) {
      url.searchParams.append('q', search);
    }
    
    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch my bots');
    }
    
    return response.json();
  }

  async getBot(id: number): Promise<Bot> {
    const response = await fetch(`${API_BASE_URL}/bots/${id}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch bot');
    }
    
    return response.json();
  }

  async getChatHistory(botId: number): Promise<Message[]> {
    const response = await fetch(`${API_BASE_URL}/chat/${botId}/history`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }
    
    return response.json();
  }

  async sendMessage(botId: number, message: string) {
    const response = await fetch(`${API_BASE_URL}/chat/${botId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to send message');
    }
    
    return response.json();
  }

  async deleteMessage(messageId: number) {
    const response = await fetch(`${API_BASE_URL}/chat/message/${messageId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to delete message');
    }
    
    return response.json();
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/settings`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    const data = await response.json();
    return { username: data.username || 'User' };
  }

  async deleteLastMessage(botId: number) {
    const response = await fetch(`${API_BASE_URL}/chat/${botId}/last_message`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to delete last message');
    }
    
    return response.json();
  }

  async deleteBot(botId: number) {
    const response = await fetch(`${API_BASE_URL}/bots/${botId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to delete bot');
    }
    
    return response.json();
  }

  async updateBot(botId: number, formData: FormData) {
    const response = await fetch(`${API_BASE_URL}/bots/${botId}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to update bot');
    }
    
    return response.json();
  }

  getBotImageUrl(filename?: string): string {
    if (!filename) return '/placeholder.svg';
    return `${API_BASE_URL}/uploads/bots/${filename}`;
  }
}

export const apiClient = new ApiClient();

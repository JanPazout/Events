import { User, Message, Event, EventResponse, AuthUser } from '../types';

const API_URL = 'http://localhost:3000/api';

export const api = {
  // Auth API
  register: async (email: string, password: string, nickname: string): Promise<{ token: string; user: AuthUser }> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nickname }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Chyba při registraci');
    }
    
    return response.json();
  },
  
  login: async (email: string, password: string): Promise<{ token: string; user: AuthUser }> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Chyba při přihlášení');
    }
    
    return response.json();
  },
  
  // Users API
  updateProfile: async (userData: Partial<AuthUser>): Promise<AuthUser> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Chyba při aktualizaci profilu');
    }
    
    return response.json();
  },
  
  getUsers: async (): Promise<AuthUser[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Chyba při načítání uživatelů');
    }
    
    return response.json();
  },
  
  // Events API
  createEvent: async (eventData: Omit<Event, 'id' | 'responses' | 'createdAt'>): Promise<Event> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(eventData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Chyba při vytváření události');
    }
    
    return response.json();
  },
  
  getEvents: async (): Promise<Event[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/events`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Chyba při načítání událostí');
    }
    
    return response.json();
  },
  
  respondToEvent: async (eventId: string, response: 'yes' | 'no'): Promise<EventResponse> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/events/${eventId}/respond`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ response }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Chyba při odpovídání na událost');
    }
    
    return res.json();
  },
};
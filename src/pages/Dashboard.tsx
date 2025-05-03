import React, { useState, useEffect } from 'react';
import { Plus, Calendar, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { api } from '../utils/api';
import { Event, AuthUser } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { subscribeToEvents } from '../utils/socket';

export const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const { user } = useAuth();
  
  // New event form state
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    time: '',
    description: '',
    invitedUsers: [] as string[]
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, usersData] = await Promise.all([
          api.getEvents(),
          api.getUsers()
        ]);
        
        setEvents(eventsData);
        setUsers(usersData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Chyba při načítání dat');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Subscribe to real-time event updates
    const unsubscribe = subscribeToEvents((eventType, data) => {
      if (eventType === 'created') {
        setEvents(prev => [...prev, data]);
      } else if (eventType === 'response') {
        setEvents(prev => 
          prev.map(event => 
            event.id === data.eventId 
              ? { 
                  ...event, 
                  responses: { 
                    ...event.responses, 
                    [data.userId]: data.response 
                  } 
                }
              : event
          )
        );
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) return;
      
      await api.createEvent({
        ...newEvent,
        createdBy: user.id
      });
      
      setShowNewEventForm(false);
      setNewEvent({
        name: '',
        date: '',
        time: '',
        description: '',
        invitedUsers: []
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Chyba při vytváření události');
      }
    }
  };
  
  const handleToggleInvite = (userId: string) => {
    setNewEvent(prev => {
      const invitedUsers = prev.invitedUsers.includes(userId)
        ? prev.invitedUsers.filter(id => id !== userId)
        : [...prev.invitedUsers, userId];
      
      return { ...prev, invitedUsers };
    });
  };
  
  const handleRespond = async (eventId: string, response: 'yes' | 'no') => {
    try {
      await api.respondToEvent(eventId, response);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Chyba při odpovídání na událost');
      }
    }
  };
  
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'PPPP', { locale: cs });
    } catch (error) {
      return dateStr;
    }
  };
  
  const getUserName = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.nickname : 'Neznámý uživatel';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Načítání...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Chyba! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rodinné události</h1>
        <button 
          onClick={() => setShowNewEventForm(!showNewEventForm)}
          className="btn-primary inline-flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Vytvořit událost
        </button>
      </div>
      
      {showNewEventForm && (
        <div className="card mb-8 animate-slide-in">
          <h2 className="text-lg font-medium mb-4">Nová událost</h2>
          <form onSubmit={handleCreateEvent}>
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Název události
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  className="input mt-1"
                />
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Datum
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  required
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="input mt-1"
                />
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  Čas
                </label>
                <input
                  type="time"
                  name="time"
                  id="time"
                  required
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="input mt-1"
                />
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Popis
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="input mt-1"
                />
              </div>
              
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pozvat uživatele
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {users.map(u => (
                    <div 
                      key={u.id} 
                      className={`
                        flex items-center p-3 rounded-md border cursor-pointer
                        ${newEvent.invitedUsers.includes(u.id) 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'}
                      `}
                      onClick={() => handleToggleInvite(u.id)}
                    >
                      <div className="flex-shrink-0">
                        {u.photoUrl ? (
                          <img 
                            src={u.photoUrl} 
                            alt={u.nickname}
                            className="h-10 w-10 rounded-full object-cover" 
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{u.nickname}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewEventForm(false)}
                className="btn-outline"
              >
                Zrušit
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Vytvořit událost
              </button>
            </div>
          </form>
        </div>
      )}
      
      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Žádné události</h3>
          <p className="text-gray-500 mt-1">
            Zatím nebyly vytvořeny žádné rodinné události. Vytvořte první!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map(event => {
            const isInvited = event.invitedUsers.includes(user?.id || '');
            const userResponse = user ? event.responses[user.id] : undefined;
            
            return (
              <div key={event.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">{event.name}</h3>
                  <div className="flex space-x-1">
                    {isInvited && (
                      <>
                        <button 
                          onClick={() => handleRespond(event.id, 'yes')}
                          className={`p-1.5 rounded-full ${
                            userResponse === 'yes' 
                              ? 'bg-green-100 text-green-700' 
                              : 'hover:bg-gray-100 text-gray-400'
                          }`}
                          title="Můžu přijít"
                        >
                          <ThumbsUp className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleRespond(event.id, 'no')}
                          className={`p-1.5 rounded-full ${
                            userResponse === 'no' 
                              ? 'bg-red-100 text-red-700' 
                              : 'hover:bg-gray-100 text-gray-400'
                          }`}
                          title="Nemůžu přijít"
                        >
                          <ThumbsDown className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                  {formatDate(event.date)}
                  <span className="mx-1">•</span>
                  {event.time}
                </div>
                
                {event.description && (
                  <p className="mt-3 text-gray-600 text-sm">{event.description}</p>
                )}
                
                <div className="mt-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Pozvaní ({event.invitedUsers.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {event.invitedUsers.map(userId => {
                      const response = event.responses[userId];
                      
                      return (
                        <div 
                          key={userId} 
                          className={`
                            text-xs px-2 py-1 rounded-full 
                            ${!response 
                              ? 'bg-gray-100 text-gray-600' 
                              : response === 'yes' 
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }
                          `}
                        >
                          {getUserName(userId)}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  Vytvořil(a): {getUserName(event.createdBy)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
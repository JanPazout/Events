import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Message } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage, subscribeToMessages } from '../utils/socket';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const unsubscribe = subscribeToMessages((newMessages) => {
      setMessages(prev => {
        // For initial messages, replace the entire array
        if (newMessages.length > 1) {
          return newMessages;
        }
        // For single new message, append to existing messages
        return [...prev, ...newMessages];
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;
    
    sendMessage(newMessage);
    setNewMessage('');
  };
  
  const formatTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'PPp', { locale: cs });
    } catch (error) {
      return '';
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Chat</h1>
      
      <div className="flex-1 bg-white rounded-t-lg shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Zatím zde nejsou žádné zprávy. Napište první!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isCurrentUser = message.userId === user?.id;
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`
                        max-w-xs md:max-w-md px-4 py-2 rounded-lg 
                        ${isCurrentUser 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-gray-100 text-gray-800'}
                      `}
                    >
                      {!isCurrentUser && (
                        <p className="text-xs font-medium mb-1">
                          {message.nickname}
                        </p>
                      )}
                      <p>{message.content}</p>
                      <p 
                        className={`
                          text-xs mt-1 text-right 
                          ${isCurrentUser ? 'text-primary-100' : 'text-gray-500'}
                        `}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <form onSubmit={handleSendMessage} className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Napište zprávu..."
              className="input flex-1"
            />
            <button
              type="submit"
              className="ml-3 btn-primary"
              disabled={newMessage.trim() === ''}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
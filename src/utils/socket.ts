import { io, Socket } from 'socket.io-client';
import { Message } from '../types';

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
  if (socket) return socket;
  
  socket = io('http://localhost:3000', {
    auth: {
      token
    }
  });
  
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const sendMessage = (content: string): void => {
  if (socket) {
    socket.emit('message', { content });
  }
};

export const subscribeToMessages = (callback: (messages: Message[]) => void): (() => void) => {
  if (!socket) return () => {};
  
  // Request initial messages
  socket.emit('get_messages');
  
  // Listen for initial messages
  socket.on('initial_messages', (messages: Message[]) => {
    callback(messages);
  });
  
  // Listen for new messages
  socket.on('new_message', (message: Message) => {
    callback([message]);
  });
  
  return () => {
    socket.off('initial_messages');
    socket.off('new_message');
  };
};

export const subscribeToEvents = (callback: (eventType: string, data: any) => void): (() => void) => {
  if (!socket) return () => {};
  
  socket.on('event_created', (data) => {
    callback('created', data);
  });
  
  socket.on('event_response', (data) => {
    callback('response', data);
  });
  
  return () => {
    socket.off('event_created');
    socket.off('event_response');
  };
};
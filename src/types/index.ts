export interface User {
  id: string;
  email: string;
  password: string; // Hashed password
  nickname: string;
  photoUrl: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  nickname: string;
  photoUrl: string;
}

export interface Message {
  id: string;
  userId: string;
  nickname: string;
  content: string;
  timestamp: string;
}

export interface Event {
  id: string;
  createdBy: string;
  name: string;
  date: string;
  time: string;
  description: string;
  invitedUsers: string[]; // User IDs
  responses: {
    [userId: string]: 'yes' | 'no';
  };
  createdAt: string;
}

export interface EventResponse {
  eventId: string;
  userId: string;
  response: 'yes' | 'no';
  respondedAt: string;
}
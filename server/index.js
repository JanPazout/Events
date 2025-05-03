import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'family-events-secret-key'; // In production, use a proper environment variable

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Data directory
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
fs.ensureDirSync(DATA_DIR);

// Ensure data files exist
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const EVENT_RESPONSES_FILE = path.join(DATA_DIR, 'event_responses.json');

// Initialize data files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeJsonSync(USERS_FILE, []);
}

if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeJsonSync(MESSAGES_FILE, []);
}

if (!fs.existsSync(EVENTS_FILE)) {
  fs.writeJsonSync(EVENTS_FILE, []);
}

if (!fs.existsSync(EVENT_RESPONSES_FILE)) {
  fs.writeJsonSync(EVENT_RESPONSES_FILE, []);
}

// Data access functions
const getUsers = () => {
  return fs.readJsonSync(USERS_FILE);
};

const saveUsers = (users) => {
  fs.writeJsonSync(USERS_FILE, users);
};

const getMessages = () => {
  return fs.readJsonSync(MESSAGES_FILE);
};

const saveMessages = (messages) => {
  fs.writeJsonSync(MESSAGES_FILE, messages);
};

const getEvents = () => {
  return fs.readJsonSync(EVENTS_FILE);
};

const saveEvents = (events) => {
  fs.writeJsonSync(EVENTS_FILE, events);
};

const getEventResponses = () => {
  return fs.readJsonSync(EVENT_RESPONSES_FILE);
};

const saveEventResponses = (responses) => {
  fs.writeJsonSync(EVENT_RESPONSES_FILE, responses);
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Chybí autentizační token' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Neplatný nebo expirovaný token' });
    }
    
    req.user = user;
    next();
  });
};

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'notifikace.rodina@gmail.com', // Replace with your Gmail
    pass: 'fkijanllzrzggzjp' // Replace with your app password
  }
});

// Helper functions
const findUserById = (userId) => {
  const users = getUsers();
  return users.find(user => user.id === userId);
};

const findUserByEmail = (email) => {
  const users = getUsers();
  return users.find(user => user.email === email);
};

const sanitizeUser = (user) => {
  // Remove password before sending user data to client
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

const sendEventInvitationEmail = async (event, invitedUser) => {
  try {
    const createdByUser = findUserById(event.createdBy);
    
    const mailOptions = {
      from: 'your-email@gmail.com', // Replace with your Gmail
      to: invitedUser.email,
      subject: `Pozvánka na událost: ${event.name}`,
      html: `
        <h1>Pozvánka na událost: ${event.name}</h1>
        <p>Byl(a) jste pozván(a) na rodinnou událost.</p>
        <p><strong>Datum:</strong> ${event.date}</p>
        <p><strong>Čas:</strong> ${event.time}</p>
        <p><strong>Vytvořil(a):</strong> ${createdByUser.nickname}</p>
        ${event.description ? `<p><strong>Popis:</strong> ${event.description}</p>` : ''}
        <p>Přihlaste se do aplikace a potvrďte svou účast.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${invitedUser.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// API Routes
// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    
    if (!email || !password || !nickname) {
      return res.status(400).json({ message: 'Všechna pole jsou povinná' });
    }
    
    // Check if user with this email already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Uživatel s tímto e-mailem již existuje' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      nickname,
      photoUrl: '',
      createdAt: new Date().toISOString()
    };
    
    // Save user
    const users = getUsers();
    users.push(newUser);
    saveUsers(users);
    
    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: sanitizeUser(newUser)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Chyba při registraci' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail a heslo jsou povinné' });
    }
    
    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Neplatné přihlašovací údaje' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Neplatné přihlašovací údaje' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Chyba při přihlášení' });
  }
});

// User routes
app.get('/api/users', authenticateToken, (req, res) => {
  try {
    const users = getUsers().map(sanitizeUser);
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Chyba při načítání uživatelů' });
  }
});

app.put('/api/users/profile', authenticateToken, (req, res) => {
  try {
    const { nickname, photoUrl } = req.body;
    const userId = req.user.id;
    
    // Update user
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Uživatel nenalezen' });
    }
    
    users[userIndex] = {
      ...users[userIndex],
      nickname: nickname || users[userIndex].nickname,
      photoUrl: photoUrl !== undefined ? photoUrl : users[userIndex].photoUrl
    };
    
    saveUsers(users);
    
    res.json(sanitizeUser(users[userIndex]));
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Chyba při aktualizaci profilu' });
  }
});

// Event routes
app.get('/api/events', authenticateToken, (req, res) => {
  try {
    const events = getEvents();
    res.json(events);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ message: 'Chyba při načítání událostí' });
  }
});

app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const { name, date, time, description, invitedUsers } = req.body;
    const createdBy = req.user.id;
    
    if (!name || !date || !time) {
      return res.status(400).json({ message: 'Název, datum a čas jsou povinné' });
    }
    
    // Create new event
    const newEvent = {
      id: uuidv4(),
      createdBy,
      name,
      date,
      time,
      description: description || '',
      invitedUsers: invitedUsers || [],
      responses: {},
      createdAt: new Date().toISOString()
    };
    
    // Save event
    const events = getEvents();
    events.push(newEvent);
    saveEvents(events);
    
    // Notify invited users by email
    const users = getUsers();
    for (const userId of newEvent.invitedUsers) {
      const invitedUser = users.find(u => u.id === userId);
      if (invitedUser) {
        await sendEventInvitationEmail(newEvent, invitedUser);
      }
    }
    
    // Emit event creation to all connected clients
    io.emit('event_created', newEvent);
    
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Chyba při vytváření události' });
  }
});

app.post('/api/events/:eventId/respond', authenticateToken, (req, res) => {
  try {
    const { eventId } = req.params;
    const { response } = req.body;
    const userId = req.user.id;
    
    if (!response || !['yes', 'no'].includes(response)) {
      return res.status(400).json({ message: 'Neplatná odpověď' });
    }
    
    // Update event with user response
    const events = getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      return res.status(404).json({ message: 'Událost nenalezena' });
    }
    
    // Check if user is invited
    if (!events[eventIndex].invitedUsers.includes(userId)) {
      return res.status(403).json({ message: 'Nejste pozváni na tuto událost' });
    }
    
    // Add response
    events[eventIndex].responses[userId] = response;
    saveEvents(events);
    
    // Save response to event_responses.json
    const eventResponse = {
      id: uuidv4(),
      eventId,
      userId,
      response,
      respondedAt: new Date().toISOString()
    };
    
    const responses = getEventResponses();
    responses.push(eventResponse);
    saveEventResponses(responses);
    
    // Emit event response to all connected clients
    io.emit('event_response', {
      eventId,
      userId,
      response
    });
    
    res.json(eventResponse);
  } catch (error) {
    console.error('Error responding to event:', error);
    res.status(500).json({ message: 'Chyba při odpovídání na událost' });
  }
});

// Socket.IO
io.use((socket, next) => {
  // Authenticate socket connections using JWT
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('authentication_error'));
  }
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('authentication_error'));
    }
    
    // Store user data in socket
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.id}`);
  
  // Send chat history when requested
  socket.on('get_messages', () => {
    const messages = getMessages();
    socket.emit('initial_messages', messages);
  });
  
  // Handle chat messages
  socket.on('message', async (data) => {
    try {
      const { content } = data;
      const user = findUserById(socket.user.id);
      
      if (!user || !content) return;
      
      const message = {
        id: uuidv4(),
        userId: user.id,
        nickname: user.nickname,
        content,
        timestamp: new Date().toISOString()
      };
      
      // Save message
      const messages = getMessages();
      messages.push(message);
      saveMessages(messages);
      
      // Broadcast to all connected clients
      io.emit('new_message', message);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
});

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
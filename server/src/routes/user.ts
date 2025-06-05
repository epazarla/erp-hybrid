import express, { Request, Response, NextFunction, Router, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import memoryDB from '../memory-db';

// JWT Secret - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Request body types
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: string;
}

// Response types
interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  [key: string]: unknown; // Allow additional properties
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const router: Router = express.Router();

// Register a new user
const registerHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  type RegisterResponse = {
    user: Omit<User, 'password'>;  // Changed from password_hash to password to match User interface
    token: string;
  };

  const sendResponse = (status: number, response: ApiResponse<RegisterResponse | null>): void => {
    res.status(status).json(response);
  };
  try {
    const { email, password, name, role } = req.body as RegisterRequest;
    
    // Input validation
    if (!email || !password || !name || !role) {
      return sendResponse(400, {
        success: false,
        message: 'Tüm alanlar zorunludur (email, şifre, isim, rol)'
      });
    }

    // Check if user already exists
    const existingUser = await memoryDB.getUserByEmail(email);
    if (existingUser) {
      return sendResponse(400, {
        success: false,
        message: 'Bu e-posta adresi zaten kullanılıyor'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await memoryDB.createUser(email, hashedPassword, name, role);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare response data matching the User interface
    const userResponse: Omit<User, 'password'> = {
      id: newUser.id,
      username: newUser.email, // Using email as username to match the User interface
      email: newUser.email,
      firstName: newUser.name.split(' ')[0],
      lastName: newUser.name.split(' ').slice(1).join(' '),
      role: newUser.role,
      createdAt: new Date(newUser.created_at),
      updatedAt: new Date(),
      lastLogin: undefined
    };

    const response: ApiResponse<RegisterResponse> = {
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: {
        user: userResponse,
        token
      }
    };

    sendResponse(201, response);
  } catch (error) {
    console.error('Register error:', error);
    next(error);
  }
};

// User login
const loginHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  type LoginResponse = {
    user: Omit<User, 'password'>;  // Changed from password_hash to password to match User interface
    token: string;
  };

  const sendResponse = (status: number, response: ApiResponse<LoginResponse | null>): void => {
    res.status(status).json(response);
  };
  
  try {
    const { email, password } = req.body as LoginRequest;

    // Input validation
    if (!email || !password) {
      return sendResponse(400, {
        success: false,
        message: 'E-posta ve şifre zorunludur',
        data: null
      });
    }

    // Find user by email
    const user = await memoryDB.getUserByEmail(email);
    if (!user) {
      return sendResponse(401, {
        success: false,
        message: 'Geçersiz e-posta veya şifre'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return sendResponse(401, {
        success: false,
        message: 'Geçersiz e-posta veya şifre'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare response data matching the User interface
    const userResponse: Omit<User, 'password'> = {
      id: user.id,
      username: user.email, // Using email as username to match the User interface
      email: user.email,
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ').slice(1).join(' '),
      role: user.role,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(),
      lastLogin: undefined
    };

    const response: ApiResponse<LoginResponse> = {
      success: true,
      message: 'Giriş başarılı',
      data: {
        user: userResponse,
        token
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// Get current user profile
const meHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  type MeResponse = {
    user: Omit<User, 'password'>;
  };

  const sendResponse = (status: number, response: ApiResponse<MeResponse | null>): void => {
    res.status(status).json(response);
  };
  
  try {
    // The auth middleware should attach the user to the request
    const userId = req.user?.id;
    if (!userId) {
      return sendResponse(401, {
        success: false,
        message: 'Yetkilendirme hatası',
        data: null
      });
    }

    // Get fresh user data from database
    const user = await memoryDB.getUserById(userId);
    if (!user) {
      return sendResponse(404, {
        success: false,
        message: 'Kullanıcı bulunamadı',
        data: null
      });
    }

    // Prepare response data matching the User interface
    const userResponse: Omit<User, 'password'> = {
      id: user.id,
      username: user.email, // Using email as username to match the User interface
      email: user.email,
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ').slice(1).join(' '),
      role: user.role,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(),
      lastLogin: undefined
    };

    const response: ApiResponse<MeResponse> = {
      success: true,
      message: 'Kullanıcı bilgileri başarıyla getirildi',
      data: { user: userResponse }
    };

    res.json(response);
  } catch (error) {
    console.error('Get profile error:', error);
    next(error);
  }
};

// Error handling middleware for user routes
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('User route error:', err);
  
  const response: ApiResponse = {
    success: false,
    message: 'Bir hata oluştu',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  };
  
  res.status(500).json(response);
});

// Define route handler types
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Register route handlers with proper typing and error handling
const wrapAsync = (fn: AsyncRequestHandler) => 
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Register routes with proper request/response types
router.post('/register', wrapAsync(registerHandler));
router.post('/login', wrapAsync(loginHandler));
router.get('/me', wrapAsync(meHandler));

export const userRouter = router;
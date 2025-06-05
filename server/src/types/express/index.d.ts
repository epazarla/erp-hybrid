import { User } from '../../models/User';

// Extend Express types
declare global {
  namespace Express {
    // Extend the Request interface
    interface Request {
      user?: User;
    }
    
    // Extend the Response interface if needed
    interface Response {
      // Add any custom response methods/properties here
    }
  }
}

// Re-export the types for convenience
export { Request, Response, NextFunction, Router, Application } from 'express';

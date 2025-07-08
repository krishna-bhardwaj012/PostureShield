# Posture Analysis Application

## Overview
This is a full-stack posture analysis application built with React (frontend) and Express.js (backend) that provides real-time posture monitoring and analysis. The application supports two analysis modes: squat form analysis and desk posture monitoring, with both real-time feedback and frame-by-frame analysis capabilities.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket for live posture feedback

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database serverless PostgreSQL
- **Real-time Features**: WebSocket server for pose data streaming
- **File Handling**: Multer for video upload processing
- **Session Management**: PostgreSQL-based session storage

### Data Storage Solutions
- **Primary Database**: PostgreSQL using Neon Database serverless
- **ORM**: Drizzle ORM with Zod validation schemas
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Session Storage**: PostgreSQL-based session storage with connect-pg-simple

## Key Components

### Database Schema
1. **Users Table**: Basic user management (id, username, password)
2. **Posture Analysis Sessions**: Session metadata including analysis mode, feedback type, duration, scores, and violation counts
3. **Pose Detection Frames**: Individual frame data with pose landmarks, analysis results, and violation details

### Frontend Components
1. **Video Input Component**: Handles webcam and file upload for pose detection
2. **Analysis Panel**: Configuration and real-time feedback display
3. **Pose Overlay**: Visual pose landmark rendering on video
4. **Session Stats**: Performance metrics and scoring display

### Backend Services
1. **Pose Analysis Service**: Core posture analysis logic with MediaPipe integration points
2. **Storage Service**: Database abstraction layer with in-memory fallback
3. **WebSocket Handler**: Real-time communication for pose data streaming

## Data Flow

### Real-time Analysis Flow
1. Video input (webcam/upload) captures frames
2. Client extracts pose data using MediaPipe (client-side)
3. Pose data sent via WebSocket to server
4. Server analyzes posture and calculates violations
5. Analysis results streamed back to client in real-time
6. Client updates UI with feedback and stores frame data

### Session Management Flow
1. Client creates analysis session via REST API
2. Server stores session metadata in PostgreSQL
3. Frame-by-frame data accumulated during analysis
4. Session statistics calculated and updated
5. Final session summary stored for reporting

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Query for state management
- **UI Components**: Extensive Radix UI component library for accessible components
- **Development Tools**: TypeScript, Vite, ESBuild for fast builds

### Database and Backend
- **Database**: Neon Database serverless PostgreSQL
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod for runtime type checking and validation
- **File Processing**: Multer for handling video uploads

### Pose Detection (Planned)
- **MediaPipe**: Google's pose detection library (integration points prepared)
- **WebSocket**: Native WebSocket for real-time communication

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with HMR
- **Backend**: tsx for TypeScript execution in development
- **Database**: Neon Database with connection string from environment variables

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Deployment**: Single Node.js process serving both API and static files
- **Database**: Drizzle Kit handles schema migrations via `db:push` command

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **REPL_ID**: Replit-specific configuration for development tools

### Key Architectural Decisions

1. **Monorepo Structure**: Combines frontend (`client/`), backend (`server/`), and shared code (`shared/`) in a single repository for easier development and deployment.

2. **Serverless Database**: Uses Neon Database for PostgreSQL hosting, avoiding the need for database server management while maintaining full SQL capabilities.

3. **Real-time Architecture**: WebSocket-based communication enables immediate posture feedback, crucial for effective posture training.

4. **Client-side Pose Detection**: Planned MediaPipe integration runs on client-side to reduce server load and improve responsiveness.

5. **Flexible Analysis Modes**: Supports both squat form analysis and desk posture monitoring with different violation criteria and scoring methods.

6. **Type Safety**: Full TypeScript implementation with shared types between client and server ensures data consistency.

7. **Component-based UI**: Leverages Shadcn/ui and Radix UI for accessible, customizable components that maintain design consistency.
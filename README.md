# Meridian - Peer Voting Platform

Meridian is a modern peer voting platform where users can create and join project teams, showcase their work, and participate in peer voting. Built with Next.js, Prisma, and BetterAuth.

## ✨ Features

### Core Functionality
- **User Authentication**: Secure email/password authentication with email verification via BetterAuth
- **Project Creation**: Submit projects with GitHub repo, demo links, images, and descriptions
- **Team Collaboration**: Join projects using unique 8-character join codes
- **Peer Voting**: Vote for up to 3 different projects (self-voting prevented)
- **Real-time Leaderboard**: Live rankings based on vote counts
- **Admin Panel**: Comprehensive admin tools for user and project management

### Security Features
- **Rate Limiting**: Prevents spam and abuse across all endpoints
- **Input Validation**: Zod-based schema validation for all user inputs
- **File Upload Security**: Secure image handling with type/size validation
- **CSRF Protection**: Built-in protection against cross-site request forgery
- **SQL Injection Prevention**: Prisma ORM provides automatic protection
- **XSS Prevention**: Input sanitization and Content Security Policy headers

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- GitHub OAuth App (optional, for GitHub authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meridian
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/meridian"
   BETTER_AUTH_SECRET="your-very-long-secure-random-string"
   GITHUB_CLIENT_ID="your-github-client-id" # Optional
   GITHUB_CLIENT_SECRET="your-github-client-secret" # Optional
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # (Optional) Seed with sample data
   npx prisma db seed
   ```

5. **Create Admin User**
   
   After running the application, you can create an admin user by updating the database directly:
   ```sql
   UPDATE "user" SET "isAdmin" = true WHERE "email" = 'your-email@example.com';
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the application.

## 🏗️ Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Pre-built accessible components
- **Lucide React**: Modern icon library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma**: Type-safe database ORM
- **PostgreSQL**: Production-ready database
- **BetterAuth**: Modern authentication library

### Security & Validation
- **Zod**: Runtime type validation
- **Rate Limiting**: Custom middleware
- **File Upload Security**: Type and size validation
- **Input Sanitization**: XSS prevention

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── projects/          # Project-related pages
│   └── voting/            # Voting and leaderboard
├── components/            # Reusable React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
│   ├── auth.ts           # BetterAuth configuration
│   ├── auth-client.ts    # Client-side auth
│   ├── utils.ts          # General utilities
│   └── validation.ts     # Input validation schemas
└── generated/            # Generated Prisma client
```

## 🔐 Security Features

### Authentication
- Email/password with secure hashing
- Email verification required
- Session management via BetterAuth
- Optional GitHub OAuth integration

### Input Validation
- All user inputs validated with Zod schemas
- SQL injection prevention via Prisma
- XSS prevention through input sanitization
- File upload type and size restrictions

### Rate Limiting
- API endpoints protected against abuse
- Different limits for different endpoint types
- IP-based tracking with sliding window

### Data Protection
- Secure file uploads with hash-based naming
- Environment variable configuration
- Security headers on all responses
- Admin-only routes protected

## 📊 Database Schema

### Core Models
- **User**: Authentication and profile data
- **Project**: Project submissions with metadata
- **ProjectMember**: Many-to-many user-project relationships
- **Vote**: User votes for projects (max 3 per user)

### Key Constraints
- Unique join codes for projects
- One vote per user per project
- Maximum 3 votes per user
- Email uniqueness enforced

## 🛡️ Admin Features

### User Management
- View all registered users
- Track user activity and voting patterns
- Manage admin privileges

### Project Oversight
- View all submitted projects
- Access project statistics and team information
- Monitor join codes and member counts

### Voting Analytics
- Real-time voting statistics
- Vote distribution analysis
- Recent voting activity tracking

### Data Export
- Export user and project data
- Voting results in CSV format
- Comprehensive analytics reports

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set:
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Secure random string (32+ characters)
- `GITHUB_CLIENT_ID/SECRET`: For GitHub OAuth (optional)
- `NEXT_PUBLIC_APP_URL`: Your application URL

### Database Migration
```bash
npx prisma migrate deploy
```

### Build Application
```bash
npm run build
npm start
```

## 🧪 Testing

### API Testing
All API endpoints include comprehensive error handling and validation. Test with tools like:
- Postman for manual testing
- Jest for unit tests
- Playwright for E2E tests

### Security Testing
- Input validation testing with malformed data
- Rate limiting verification
- File upload security testing
- Authentication flow testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section below
2. Review environment variable configuration
3. Ensure database connectivity
4. Check application logs for specific error messages

### Common Issues

**Database Connection Issues**
- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Ensure database exists and user has permissions

**Authentication Issues**
- Verify `BETTER_AUTH_SECRET` is set
- Check email configuration for verification emails
- Ensure GitHub OAuth credentials are correct (if using)

**File Upload Issues**
- Check file permissions in `public/uploads/` directory
- Verify file size limits in environment variables
- Ensure supported file types are configured

## 🔄 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npx prisma studio          # Open database GUI
npx prisma generate        # Regenerate Prisma client
npx prisma db push         # Push schema changes
npx prisma migrate dev     # Create and run migrations

# Code quality
npm run lint               # Run ESLint
npm run typecheck          # Run TypeScript compiler
```

---

Built with ❤️ using Next.js, Prisma, and BetterAuth

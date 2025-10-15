# 🚀 AiRafa Leads Dashboard

A futuristic, real-time leads dashboard for AI clinic consultants with glassmorphism design and smooth animations. Built with Next.js 14, TypeScript, Tailwind CSS, and Prisma with SQLite database.

## ✨ **Features**

- 🎨 **Futuristic Glassmorphism Design** - Modern dark theme with glass effects
- 📊 **Real-time Dashboard** - Live updates and notifications
- 📱 **Mobile Responsive** - Optimized for all screen sizes
- 🔄 **N8N Integration** - Webhook-based data sync from Google Sheets
- 🗄️ **Local Database** - SQLite with Prisma ORM
- 🎯 **Lead Management** - Track and manage leads with status updates
- 📈 **Analytics** - Comprehensive statistics and trends
- 🔐 **Token-based Auth** - Secure dashboard access

## 🏗️ **Architecture**

```
Google Sheets → N8N Webhook → API Endpoint → SQLite Database → Dashboard
```

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Set Up Database**
```bash
# Generate Prisma client
npm run db:generate

# Create database and tables
npm run db:push

# Seed with sample data
npm run db:seed
```

### **3. Start Development Server**
```bash
npm run dev
```

### **4. Access Dashboard**
Open [http://localhost:3000/dashboard/demo-token-123](http://localhost:3000/dashboard/demo-token-123)

## 📊 **Sample Data**

The seeded database includes:
- **1 Clinic**: Dr. Smith's Aesthetic Clinic
- **1 Dashboard Token**: `demo-token-123`
- **6 Sample Leads** with different statuses and treatments

## 🔧 **Database Management**

```bash
# View database in Prisma Studio
npm run db:studio

# Reset database and reseed
npm run db:reset

# Generate Prisma client after schema changes
npm run db:generate
```

## 🔗 **N8N Integration**

### **Webhook Endpoint**
```
POST /api/webhook/leads
Content-Type: application/json
x-webhook-secret: your-webhook-secret-here

{
  "session_id": "unique-session-id",
  "clinic_id": "clinic-001",
  "name": "Lead Name",
  "phone": "+1234567890",
  "treatment_id": "botox",
  "message": "Lead message",
  "email": "lead@example.com",
  "status": "New",
  "notes": "Additional notes"
}
```

### **N8N Workflow Setup**
1. **Google Sheets Trigger** - Monitor for new rows
2. **Data Transformation** - Format data for API
3. **HTTP Request** - Send to webhook endpoint
4. **Error Handling** - Retry on failure

See [N8N Integration Guide](docs/n8n-integration-guide.md) for detailed setup.

## 📁 **Project Structure**

```
src/
├── app/
│   ├── api/
│   │   ├── webhook/leads/     # N8N webhook endpoint
│   │   ├── validate-token/    # Token validation
│   │   ├── leads/            # Leads CRUD
│   │   ├── clinic/           # Clinic data
│   │   └── stats/            # Statistics
│   ├── dashboard/[token]/    # Dashboard page
│   └── globals.css           # Global styles
├── components/
│   └── dashboard/            # Dashboard components
├── hooks/
│   └── useRealTimeData.ts    # Real-time data hook
├── lib/
│   ├── database.ts           # Prisma client
│   ├── databaseService.ts    # Database operations
│   ├── types.ts              # TypeScript types
│   └── constants.ts          # App constants
└── prisma/
    └── schema.prisma         # Database schema
```

## 🎨 **Design System**

### **Colors**
- **Primary**: Indigo/Purple gradients
- **Background**: Dark slate with glassmorphism
- **Text**: White with opacity variations
- **Accents**: Emerald, Blue, Orange status colors

### **Components**
- **Glassmorphism Cards** - Semi-transparent with backdrop blur
- **Gradient Buttons** - Colorful gradients with hover effects
- **Shimmer Animations** - Loading states
- **Glow Effects** - Subtle glowing borders
- **Smooth Transitions** - 300ms ease-in-out

## 📱 **Mobile Features**

- **Responsive Grid** - Adapts to screen size
- **Touch-friendly** - Large tap targets
- **Mobile Cards** - Card layout for small screens
- **Swipe Gestures** - Natural mobile interactions

## 🔐 **Security**

- **Token-based Authentication** - Secure dashboard access
- **Webhook Secret** - Validate incoming webhooks
- **Input Validation** - Sanitize all inputs
- **Rate Limiting** - Prevent abuse (production)

## 🚀 **Deployment**

### **Vercel (Recommended)**
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### **Environment Variables**
```env
DATABASE_URL="file:./dev.db"
WEBHOOK_SECRET="your-webhook-secret"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### **Production Database**
For production, use PostgreSQL:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/airafa_leads"
```

## 📊 **API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/validate-token` | POST | Validate dashboard token |
| `/api/leads` | GET | Fetch leads with filters |
| `/api/leads/[id]` | PATCH | Update lead status |
| `/api/clinic` | GET | Get clinic information |
| `/api/stats` | GET | Get dashboard statistics |
| `/api/webhook/leads` | POST | N8N webhook endpoint |

## 🧪 **Testing**

### **Manual Testing**
1. **Dashboard Access**: Visit `/dashboard/demo-token-123`
2. **Lead Management**: Update lead statuses
3. **Real-time Updates**: Test webhook integration
4. **Mobile Responsive**: Test on different screen sizes

### **API Testing**
```bash
# Test token validation
curl -X POST http://localhost:3000/api/validate-token \
  -H "Content-Type: application/json" \
  -d '{"token":"demo-token-123"}'

# Test webhook
curl -X POST http://localhost:3000/api/webhook/leads \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: your-webhook-secret-here" \
  -d '{"session_id":"test","clinic_id":"clinic-001","name":"Test","phone":"+1234567890","treatment_id":"botox","message":"Test"}'
```

## 🔄 **Data Flow**

1. **Lead Added** to Google Sheets
2. **N8N Detects** new row
3. **Webhook Sent** to API endpoint
4. **Data Stored** in SQLite database
5. **Dashboard Updates** in real-time
6. **Notifications** shown to user

## 🛠️ **Development**

### **Adding New Features**
1. Update Prisma schema if needed
2. Run `npm run db:push` to update database
3. Update TypeScript types
4. Add API endpoints
5. Update dashboard components

### **Database Schema Changes**
```bash
# Edit prisma/schema.prisma
npm run db:push
npm run db:generate
```

## 📈 **Performance**

- **Client-side Caching** - Reduces API calls
- **Optimistic Updates** - Immediate UI feedback
- **Database Indexing** - Fast queries
- **Image Optimization** - Next.js automatic optimization
- **Code Splitting** - Lazy loading components

## 🐛 **Troubleshooting**

### **Common Issues**

**Dashboard not loading:**
- Check if database is seeded: `npm run db:seed`
- Verify token is valid: `demo-token-123`
- Check browser console for errors

**Webhook not working:**
- Verify webhook secret matches
- Check N8N workflow execution
- Test webhook endpoint manually

**Database errors:**
- Run `npm run db:push` to sync schema
- Check `.env.local` for correct DATABASE_URL
- Use `npm run db:studio` to inspect data

## 🚀 **Railway Deployment**

### **Quick Deploy to Railway**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Railway deployment"
   git push origin main
   ```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `RafaLeads` repository
   - Railway will auto-detect Next.js and deploy

3. **Set Environment Variables:**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add these variables:
     ```
     DATABASE_URL=file:./dev.db
     N8N_WEBHOOK_SECRET=your-secure-webhook-secret-here
     NODE_ENV=production
     NEXTAUTH_URL=https://your-app-name.railway.app
     NEXTAUTH_SECRET=your-nextauth-secret-here
     ```

4. **Initialize Database:**
   - Railway will automatically run `prisma generate` and `prisma db push`
   - To seed with sample data, run: `npm run db:seed` in Railway console

5. **Access Your Dashboard:**
   - Your app will be available at: `https://your-app-name.railway.app`
   - Test with: `https://your-app-name.railway.app/dashboard/demo-token-123`

### **Railway vs Cloudways**

| Feature | Railway | Cloudways |
|---------|---------|-----------|
| **Setup Time** | 2 minutes | 30+ minutes |
| **Database** | Built-in PostgreSQL | Manual setup |
| **Deployments** | Auto from Git | Manual upload |
| **Scaling** | Automatic | Manual |
| **Cost** | Pay per use | Fixed monthly |
| **Best For** | Quick deployment | Full control |

## 📚 **Documentation**

- [N8N Integration Guide](docs/n8n-integration-guide.md)
- [Google Sheets Setup](docs/google-sheets-setup.md)
- [Deployment Guide](docs/deployment-guide.md)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

MIT License - see LICENSE file for details

## 🎯 **Success Criteria**

✅ **Futuristic Design** - Glassmorphism with dark theme  
✅ **Real-time Updates** - Live data synchronization  
✅ **Mobile Responsive** - Works on all devices  
✅ **N8N Integration** - Webhook-based data sync  
✅ **Database Storage** - Local SQLite with Prisma  
✅ **Lead Management** - Full CRUD operations  
✅ **Analytics Dashboard** - Statistics and trends  
✅ **Token Authentication** - Secure access control  

---

**Built with ❤️ for AI clinic consultants**
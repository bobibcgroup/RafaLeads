# N8N Integration Guide

This guide shows how to integrate the AiRafa Leads Dashboard with N8N to automatically sync data from Google Sheets to the local database.

## 🔄 **Integration Flow**

```
Google Sheets → N8N Webhook → API Endpoint → Local Database → Dashboard
```

## 📋 **Prerequisites**

- N8N instance running (self-hosted or cloud)
- Google Sheets with lead data
- AiRafa Leads Dashboard running
- Webhook secret configured

## 🛠️ **Setup Steps**

### 1. **Configure Webhook Secret**

Update your `.env.local` file with a secure webhook secret:

```env
WEBHOOK_SECRET="your-super-secret-webhook-key-here"
```

### 2. **N8N Workflow Setup**

Create a new N8N workflow with the following nodes:

#### **Node 1: Google Sheets Trigger**
- **Type**: Google Sheets Trigger
- **Operation**: On Row Added
- **Spreadsheet ID**: Your Google Sheets ID
- **Sheet Name**: `leads`
- **Authentication**: Google Sheets OAuth2

#### **Node 2: Data Transformation**
- **Type**: Code Node
- **Purpose**: Transform Google Sheets data to API format

```javascript
// Transform Google Sheets row to API format
const row = $input.first().json;

return {
  json: {
    session_id: row.session_id || `session-${Date.now()}`,
    clinic_id: row.clinic_id || 'clinic-001',
    source: row.source || 'google_sheets',
    lang: row.lang || 'EN',
    event: row.event || 'form_submit',
    name: row.name,
    phone: row.phone,
    treatment_id: row.treatment_id,
    message: row.message,
    email: row.email || '',
    status: row.status || 'New',
    notes: row.notes || ''
  }
};
```

#### **Node 3: HTTP Request to API**
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `http://localhost:3000/api/webhook/leads`
- **Headers**:
  ```
  Content-Type: application/json
  x-webhook-secret: your-super-secret-webhook-key-here
  ```
- **Body**: JSON from previous node

#### **Node 4: Error Handling**
- **Type**: IF Node
- **Condition**: Check if API response is successful
- **On Success**: Log success message
- **On Error**: Send notification or retry

### 3. **Google Sheets Format**

Ensure your Google Sheets has the following columns:

| Column | Description | Required |
|--------|-------------|----------|
| A | session_id | Yes |
| B | clinic_id | Yes |
| C | source | No (defaults to 'google_sheets') |
| D | lang | No (defaults to 'EN') |
| E | event | No (defaults to 'form_submit') |
| F | name | Yes |
| G | phone | Yes |
| H | treatment_id | Yes |
| I | message | Yes |
| J | email | No |
| K | status | No (defaults to 'New') |
| L | notes | No |

### 4. **Testing the Integration**

1. **Add a test row** to your Google Sheets
2. **Check N8N execution** to see if the workflow runs
3. **Verify in dashboard** that the lead appears
4. **Check webhook logs** in the database

## 🔧 **Advanced Configuration**

### **Batch Processing**

For processing multiple rows at once:

```javascript
// In N8N Code Node
const rows = $input.all();

const batch = rows.map(row => ({
  session_id: row.json.session_id || `session-${Date.now()}-${Math.random()}`,
  clinic_id: row.json.clinic_id || 'clinic-001',
  source: row.json.source || 'google_sheets',
  lang: row.json.lang || 'EN',
  event: row.json.event || 'form_submit',
  name: row.json.name,
  phone: row.json.phone,
  treatment_id: row.json.treatment_id,
  message: row.json.message,
  email: row.json.email || '',
  status: row.json.status || 'New',
  notes: row.json.notes || ''
}));

return { json: { leads: batch } };
```

### **Error Handling & Retry**

Add retry logic for failed webhook calls:

```javascript
// In N8N Code Node for retry
const maxRetries = 3;
const retryDelay = 5000; // 5 seconds

if ($input.first().json.retryCount < maxRetries) {
  return {
    json: {
      ...$input.first().json,
      retryCount: ($input.first().json.retryCount || 0) + 1,
      retryAfter: Date.now() + retryDelay
    }
  };
} else {
  // Max retries reached, send alert
  return {
    json: {
      error: 'Max retries reached',
      originalData: $input.first().json
    }
  };
}
```

### **Data Validation**

Add validation before sending to API:

```javascript
// In N8N Code Node
const data = $input.first().json;

// Validate required fields
const requiredFields = ['name', 'phone', 'treatment_id', 'message'];
const missingFields = requiredFields.filter(field => !data[field]);

if (missingFields.length > 0) {
  return {
    json: {
      error: `Missing required fields: ${missingFields.join(', ')}`,
      data: data
    }
  };
}

// Validate phone number format
const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
if (!phoneRegex.test(data.phone)) {
  return {
    json: {
      error: 'Invalid phone number format',
      data: data
    }
  };
}

// Clean and format data
return {
  json: {
    session_id: data.session_id || `session-${Date.now()}`,
    clinic_id: data.clinic_id || 'clinic-001',
    source: data.source || 'google_sheets',
    lang: data.lang || 'EN',
    event: data.event || 'form_submit',
    name: data.name.trim(),
    phone: data.phone.replace(/\D/g, ''), // Remove non-digits
    treatment_id: data.treatment_id,
    message: data.message.trim(),
    email: data.email?.trim() || '',
    status: data.status || 'New',
    notes: data.notes?.trim() || ''
  }
};
```

## 📊 **Monitoring & Logs**

### **Webhook Logs**

Check webhook execution logs:

```sql
-- View recent webhook logs
SELECT * FROM webhook_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- View error logs
SELECT * FROM webhook_logs 
WHERE status = 'error' 
ORDER BY created_at DESC;
```

### **N8N Monitoring**

- Set up N8N execution monitoring
- Configure alerts for failed executions
- Monitor webhook response times
- Track data processing volumes

## 🚀 **Production Deployment**

### **Environment Variables**

```env
# Production environment
DATABASE_URL="postgresql://user:password@localhost:5432/airafa_leads"
WEBHOOK_SECRET="production-webhook-secret-key"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### **Security Considerations**

1. **Use HTTPS** for webhook endpoints
2. **Rotate webhook secrets** regularly
3. **Implement rate limiting** on webhook endpoints
4. **Validate all incoming data**
5. **Log all webhook activities**

### **Scaling Considerations**

1. **Database connection pooling**
2. **Queue system** for high-volume processing
3. **Caching** for frequently accessed data
4. **Load balancing** for multiple instances

## 🔍 **Troubleshooting**

### **Common Issues**

**Webhook not receiving data:**
- Check N8N workflow execution
- Verify webhook URL is correct
- Check webhook secret matches

**Data not appearing in dashboard:**
- Check database connection
- Verify API endpoint is working
- Check webhook logs for errors

**Performance issues:**
- Monitor database query performance
- Check N8N execution times
- Consider batch processing

### **Debug Commands**

```bash
# Check database status
npm run db:studio

# View recent leads
npx prisma studio

# Test webhook endpoint
curl -X POST http://localhost:3000/api/webhook/leads \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: your-secret" \
  -d '{"name":"Test Lead","phone":"+1234567890","treatment_id":"botox","message":"Test message"}'
```

## 📈 **Performance Optimization**

### **Database Indexing**

Add indexes for better performance:

```sql
-- Add indexes for common queries
CREATE INDEX idx_leads_clinic_id ON leads(clinic_id);
CREATE INDEX idx_leads_timestamp ON leads(timestamp);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_tokens_token ON dashboard_tokens(token);
```

### **Caching Strategy**

- Cache clinic data
- Cache dashboard tokens
- Use Redis for session data
- Implement query result caching

This integration provides a robust, scalable solution for syncing Google Sheets data with your leads dashboard while maintaining data integrity and performance.

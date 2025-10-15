# Google Sheets Setup Guide

This guide will help you set up Google Sheets for the AiRafa Leads Dashboard.

## Prerequisites

- Google account
- Google Cloud Platform account
- Basic understanding of Google Sheets

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "AiRafa Leads Dashboard"
4. Click "Create"

## Step 2: Enable Google Sheets API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on "Google Sheets API" and click "Enable"

## Step 3: Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Enter service account details:
   - Name: "airafa-sheets-service"
   - Description: "Service account for AiRafa Leads Dashboard"
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 4: Generate Service Account Key

1. In the Credentials page, find your service account
2. Click on the service account email
3. Go to "Keys" tab
4. Click "Add Key" → "Create new key"
5. Select "JSON" format
6. Click "Create" - this will download a JSON file
7. **Keep this file secure** - it contains sensitive credentials

## Step 5: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new blank spreadsheet
3. Name it "AiRafa Leads Data"
4. Create three tabs by clicking the "+" button at the bottom:
   - Rename "Sheet1" to "leads"
   - Add "clinics" tab
   - Add "dashboard_tokens" tab

## Step 6: Set Up Sheet Structure

### Leads Tab (Column Headers)
| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| timestamp | session_id | clinic_id | source | lang | event | name | phone | treatment_id | message | email | status | notes |

### Clinics Tab (Column Headers)
| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| clinic_id | name | city | whatsapp | phone | email | website | address | hours | notes |

### Dashboard Tokens Tab (Column Headers)
| A | B | C | D | E |
|---|---|---|---|---|
| token | clinic_id | created_at | expires_at | active |

## Step 7: Add Sample Data

### Sample Leads Data
```
2024-01-15T10:30:00Z	session-001	clinic-001	website	EN	form_submit	John Doe	+1234567890	botox	Interested in Botox treatment	john@example.com	New	
2024-01-15T11:15:00Z	session-002	clinic-001	facebook	AR	form_submit	Jane Smith	+1987654321	filler	Looking for dermal fillers		Contacted	Follow up scheduled
2024-01-15T12:00:00Z	session-003	clinic-001	instagram	EN	form_submit	Mike Johnson	+1555123456	laser	Interested in laser treatment	mike@example.com	New	
```

### Sample Clinics Data
```
clinic-001	Dr. Smith's Aesthetic Clinic	New York	+1234567890	+1234567890	info@drsmithclinic.com	https://drsmithclinic.com	123 Main St, New York, NY	Mon-Fri 9AM-6PM	Premium aesthetic clinic
```

### Sample Token Data
```
demo-token-123	clinic-001	2024-01-15T00:00:00Z	2025-01-15T00:00:00Z	TRUE
```

## Step 8: Share Sheet with Service Account

1. In your Google Sheet, click "Share" button
2. Add the service account email (from the JSON file you downloaded)
3. Set permission to "Editor"
4. Click "Send"

## Step 9: Get Spreadsheet ID

1. In your Google Sheet, look at the URL
2. The spreadsheet ID is the long string between `/d/` and `/edit`
3. Example: `https://docs.google.com/spreadsheets/d/1ABC123DEF456GHI789JKL/edit`
4. The ID would be: `1ABC123DEF456GHI789JKL`

## Step 10: Configure Environment Variables

1. Open the downloaded JSON file
2. Copy the `private_key` value
3. Copy the `client_email` value
4. Add these to your `.env.local` file:

```env
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_SHEETS_SPREADSHEET_ID="your-spreadsheet-id-here"
```

## Step 11: Test the Setup

1. Start your development server: `npm run dev`
2. Generate a test token: `node scripts/generate-token.js clinic-001 "Test Clinic"`
3. Visit: `http://localhost:3000/dashboard/your-generated-token`
4. You should see the dashboard with your sample data

## Troubleshooting

### Common Issues

**"The caller does not have permission"**
- Make sure you've shared the sheet with the service account email
- Check that the service account has "Editor" permissions

**"Spreadsheet not found"**
- Verify the spreadsheet ID is correct
- Make sure the sheet is not in a restricted folder

**"Invalid credentials"**
- Check that the private key is properly formatted with `\n` characters
- Verify the client email matches the service account

**"API not enabled"**
- Make sure Google Sheets API is enabled in your Google Cloud project

### Data Format Issues

**Timestamps**
- Use ISO 8601 format: `2024-01-15T10:30:00Z`
- Make sure timezone is included

**Phone Numbers**
- Include country code: `+1234567890`
- Use consistent format across all entries

**Status Values**
- Use exact values: `New`, `Contacted`, `Booked`, `Converted`, `Not Interested`
- Case-sensitive

## Security Best Practices

1. **Never commit the JSON key file** to version control
2. **Use environment variables** for all credentials
3. **Rotate service account keys** regularly
4. **Limit sheet permissions** to only what's needed
5. **Monitor API usage** in Google Cloud Console

## Next Steps

Once your Google Sheets is set up:

1. Add real clinic data to the `clinics` tab
2. Generate tokens for each clinic
3. Set up data collection from your website/forms
4. Configure automatic data updates
5. Set up monitoring and alerts

## Support

If you encounter issues:

1. Check the Google Sheets API documentation
2. Review the error messages in your browser console
3. Verify all environment variables are set correctly
4. Test with the sample data first
5. Create an issue in the repository with details

# 📱 SMS Setup Guide for Pet Alert App

## 🚀 Automatic SMS Sending Setup

The app now supports **automatic SMS sending** when the timer expires. Here's what you need to set up:

## Option 1: Twilio SMS Service (Recommended)

### Step 1: Create Twilio Account
1. Go to [Twilio.com](https://www.twilio.com)
2. Sign up for a free account
3. Verify your phone number

### Step 2: Get Twilio Credentials
1. Go to Twilio Console Dashboard
2. Copy these values:
   - **Account SID** (starts with 'AC')
   - **Auth Token** (click to reveal)
   - **Phone Number** (from your Twilio phone numbers)

### Step 3: Add to Environment Variables
Add these to your `.env` file:
```
EXPO_PUBLIC_TWILIO_ACCOUNT_SID=your_account_sid_here
EXPO_PUBLIC_TWILIO_AUTH_TOKEN=your_auth_token_here
EXPO_PUBLIC_TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

### Step 4: Test the Setup
1. Add an emergency contact with a valid phone number
2. Set a short timer (1-2 minutes)
3. Let the timer expire
4. Check if SMS was received

---

## Option 2: Custom Backend Service

### Step 1: Create Backend API
Create an endpoint at `/send-sms` that accepts:
```json
{
  "contacts": [
    {"name": "John", "phone": "+1234567890"}
  ],
  "message": "Emergency alert message"
}
```

### Step 2: Add Service URL
Add to your `.env` file:
```
EXPO_PUBLIC_SMS_SERVICE_URL=https://your-backend-service.com
```

---

## Option 3: Mock SMS (Development/Testing)

If no SMS service is configured, the app will use **mock SMS** that:
- Logs messages to console
- Shows all SMS details in the app
- Doesn't send actual SMS messages

This is perfect for development and testing!

---

## 🔧 Current Implementation Features

### ✅ What Works Now:
- **Automatic SMS sending** when timer expires
- **No user interaction required** - SMS sent in background
- **Multiple recipients** - sends to all emergency contacts
- **Detailed status feedback** - shows success/failure for each contact
- **Phone number formatting** - automatically adds country codes
- **Error handling** - graceful fallbacks if SMS fails

### 📱 SMS Message Format:
```
🚨 PET ALERT 🚨

Hi [Contact Name], this is an automated emergency alert. 
I haven't checked in as scheduled and may not be able to 
care for my pets.

Please:
1. Check on my pets immediately
2. Contact me directly  
3. Use your emergency key if needed

Time: [Timestamp]

This is an automated message from Pet Alert app.
```

### 🔧 Technical Details:
- **Format**: Phone numbers auto-formatted to +1XXXXXXXXXX
- **Retry**: No automatic retries (to avoid spam)
- **Rate Limits**: Respects Twilio/service rate limits
- **Security**: API keys stored in environment variables
- **Fallback**: Mock SMS if no service configured

---

## 🚨 Important Notes

### Security:
- Never share your Twilio credentials
- Use environment variables, not hardcoded values
- Test with your own phone number first

### Costs:
- Twilio charges ~$0.0075 per SMS in the US
- International rates vary
- Free trial includes $15 credit

### Legal:
- Only send to contacts who have consented
- Follow local SMS regulations
- Use only for legitimate emergencies

### Testing:
- Test with short timers (1-2 minutes)
- Verify phone numbers are correct
- Check spam/blocked messages folder

---

## 🛠️ Troubleshooting

### SMS Not Sending:
1. Check `.env` file has correct credentials
2. Verify phone numbers are formatted correctly
3. Check Twilio console for error messages
4. Ensure sufficient account balance

### Permission Errors:
- Make sure Twilio phone number is verified
- Check that your account is not suspended
- Verify recipient phone numbers are valid

### Mock SMS Only:
- This means no SMS service is configured
- Messages will show in console/app only
- Add Twilio credentials to send real SMS

---

## 📞 Next Steps

1. **Set up Twilio account** (5 minutes)
2. **Add credentials to .env** (1 minute)  
3. **Test with short timer** (2 minutes)
4. **Add real emergency contacts** (ongoing)

The app is now ready for fully automatic SMS emergency alerts! 🚨📱
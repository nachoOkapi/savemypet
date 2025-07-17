import { EmergencyContact } from '../state/petAlertStore';

// SMS Gateway configuration
const TWILIO_ACCOUNT_SID = process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.EXPO_PUBLIC_TWILIO_PHONE_NUMBER;

// Alternative: Use a backend service URL
const SMS_SERVICE_URL = process.env.EXPO_PUBLIC_SMS_SERVICE_URL;

export interface SMSResult {
  success: boolean;
  message: string;
  sentTo: string[];
  failedTo: string[];
}

// Format phone number for SMS (remove non-digits, ensure proper format)
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if missing (assume US +1)
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  return `+${cleaned}`;
}

// Send SMS using Twilio API directly
export async function sendSMSViaTwilio(
  contacts: EmergencyContact[], 
  message: string
): Promise<SMSResult> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    return {
      success: false,
      message: 'Twilio credentials not configured',
      sentTo: [],
      failedTo: contacts.map(c => c.phone)
    };
  }

  const sentTo: string[] = [];
  const failedTo: string[] = [];

  for (const contact of contacts) {
    try {
      const formattedNumber = formatPhoneNumber(contact.phone);
      
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: formattedNumber,
          Body: message.replace('{contactName}', contact.name),
        }).toString(),
      });

      if (response.ok) {
        sentTo.push(contact.phone);
        console.log(`SMS sent successfully to ${contact.name} (${contact.phone})`);
      } else {
        const errorData = await response.json();
        console.error(`Failed to send SMS to ${contact.name}:`, errorData);
        failedTo.push(contact.phone);
      }
    } catch (error) {
      console.error(`Error sending SMS to ${contact.name}:`, error);
      failedTo.push(contact.phone);
    }
  }

  return {
    success: sentTo.length > 0,
    message: `SMS sent to ${sentTo.length} of ${contacts.length} contacts`,
    sentTo,
    failedTo
  };
}

// Send SMS using custom backend service
export async function sendSMSViaBackend(
  contacts: EmergencyContact[], 
  message: string
): Promise<SMSResult> {
  if (!SMS_SERVICE_URL) {
    return {
      success: false,
      message: 'SMS service URL not configured',
      sentTo: [],
      failedTo: contacts.map(c => c.phone)
    };
  }

  try {
    const response = await fetch(`${SMS_SERVICE_URL}/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contacts: contacts.map(c => ({
          name: c.name,
          phone: formatPhoneNumber(c.phone)
        })),
        message
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error sending SMS via backend:', error);
    return {
      success: false,
      message: `Backend SMS service error: ${error.message}`,
      sentTo: [],
      failedTo: contacts.map(c => c.phone)
    };
  }
}

// Mock SMS sending for testing
export async function sendSMSMock(
  contacts: EmergencyContact[], 
  message: string
): Promise<SMSResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('MOCK SMS SENT:');
  console.log('Message:', message);
  console.log('Recipients:', contacts.map(c => `${c.name} (${c.phone})`));
  
  return {
    success: true,
    message: `Mock SMS sent to ${contacts.length} contacts`,
    sentTo: contacts.map(c => c.phone),
    failedTo: []
  };
}

// Main SMS sending function with fallback options
export async function sendAutomaticSMS(
  contacts: EmergencyContact[], 
  message: string
): Promise<SMSResult> {
  if (contacts.length === 0) {
    return {
      success: false,
      message: 'No emergency contacts to notify',
      sentTo: [],
      failedTo: []
    };
  }

  // Try Twilio first
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
    console.log('Attempting to send SMS via Twilio...');
    return await sendSMSViaTwilio(contacts, message);
  }

  // Try backend service
  if (SMS_SERVICE_URL) {
    console.log('Attempting to send SMS via backend service...');
    return await sendSMSViaBackend(contacts, message);
  }

  // Fallback to mock (for development/testing)
  console.log('No SMS service configured, using mock SMS...');
  return await sendSMSMock(contacts, message);
}
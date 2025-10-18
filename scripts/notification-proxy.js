// Servidor proxy local para notificaciones (evita CORS)
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_ROLE_KEY"';
const supabase = createClient(supabaseUrl, supabaseKey);

// Endpoint para enviar email
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, content } = req.body;

    if (!to || !subject || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Obtener configuración de Resend
    const { data: configData, error: configError } = await supabase
      .from('notification_config')
      .select('*')
      .eq('service', 'email')
      .eq('active', true)
      .single();

    if (configError || !configData?.api_key) {
      return res.status(500).json({ error: 'Email configuration not found' });
    }

    // Enviar email con Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${configData.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: configData.from_email || 'onboarding@resend.dev',
        to: [to],
        subject: subject,
        html: content,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      res.json({ success: true, messageId: data.id });
    } else {
      res.status(500).json({ success: false, error: data.message });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para enviar WhatsApp
app.post('/send-whatsapp', async (req, res) => {
  try {
    const { to, content } = req.body;

    if (!to || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Obtener configuración de Twilio WhatsApp
    const { data: configData, error: configError } = await supabase
      .from('notification_config')
      .select('*')
      .eq('service', 'whatsapp')
      .eq('active', true)
      .single();

    if (configError || !configData?.api_key || !configData?.api_secret) {
      return res.status(500).json({ error: 'WhatsApp configuration not found' });
    }

    // Enviar WhatsApp con Twilio
    const accountSid = configData.api_key;
    const authToken = configData.api_secret;
    const fromWhatsapp = configData.from_whatsapp;

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: `whatsapp:${fromWhatsapp}`,
        To: `whatsapp:${to}`,
        Body: content,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      res.json({ success: true, messageId: data.sid });
    } else {
      res.status(500).json({ success: false, error: data.message });
    }
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para enviar SMS
app.post('/send-sms', async (req, res) => {
  try {
    const { to, content } = req.body;

    if (!to || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Obtener configuración de Twilio SMS
    const { data: configData, error: configError } = await supabase
      .from('notification_config')
      .select('*')
      .eq('service', 'sms')
      .eq('active', true)
      .single();

    if (configError || !configData?.api_key || !configData?.api_secret) {
      return res.status(500).json({ error: 'SMS configuration not found' });
    }

    // Enviar SMS con Twilio
    const accountSid = configData.api_key;
    const authToken = configData.api_secret;
    const fromPhone = configData.from_phone;

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromPhone,
        To: to,
        Body: content,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      res.json({ success: true, messageId: data.sid });
    } else {
      res.status(500).json({ success: false, error: data.message });
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Notification proxy running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Notification proxy running on http://localhost:${PORT}`);
  console.log('📧 Email endpoint: POST /send-email');
  console.log('💬 WhatsApp endpoint: POST /send-whatsapp');
  console.log('📱 SMS endpoint: POST /send-sms');
});

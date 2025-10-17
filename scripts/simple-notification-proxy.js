// Proxy simple para notificaciones (sin dependencias de Supabase)
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración hardcodeada (para desarrollo)
const CONFIG = {
  email: {
    apiKey: 're_jJCLwffC_Q1rGVv46i1QPG4T9HE3HGDDe',
    fromEmail: 'onboarding@resend.dev'
  },
  whatsapp: {
    accountSid: 'AC716cc1fe67a13eaee8ede7dad8f5032d',
    authToken: '88a158cb92c9265916e3406dd66036d0',
    fromWhatsapp: '+14155238886'
  }
};

// Endpoint para enviar email
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, content } = req.body;

    if (!to || !subject || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('📧 Enviando email a:', to);

    // Enviar email con Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.email.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: CONFIG.email.fromEmail,
        to: [to],
        subject: subject,
        html: content,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Email enviado:', data.id);
      res.json({ success: true, messageId: data.id });
    } else {
      console.log('❌ Error email:', data.message);
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

    console.log('💬 Enviando WhatsApp a:', to);

    // Enviar WhatsApp con Twilio
    const accountSid = CONFIG.whatsapp.accountSid;
    const authToken = CONFIG.whatsapp.authToken;
    const fromWhatsapp = CONFIG.whatsapp.fromWhatsapp;

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
      console.log('✅ WhatsApp enviado:', data.sid);
      res.json({ success: true, messageId: data.sid });
    } else {
      console.log('❌ Error WhatsApp:', data.message);
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

    console.log('📱 Simulando envío de SMS a:', to);
    console.log('📱 Contenido:', content);

    // Simular SMS (para desarrollo - Twilio Sandbox requiere verificación)
    // En producción, aquí se usaría un número real de Twilio
    const messageId = 'sms_sim_' + Date.now();
    
    console.log('✅ SMS simulado enviado:', messageId);
    res.json({ 
      success: true, 
      messageId: messageId,
      note: 'SMS simulado - En producción se enviaría realmente'
    });
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
  console.log(`🚀 Simple notification proxy running on http://localhost:${PORT}`);
  console.log('📧 Email endpoint: POST /send-email');
  console.log('💬 WhatsApp endpoint: POST /send-whatsapp');
  console.log('📱 SMS endpoint: POST /send-sms');
  console.log('🔍 Health check: GET /health');
});

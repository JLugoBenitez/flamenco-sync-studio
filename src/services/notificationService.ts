import { supabase } from '@/integrations/supabase/client';

export interface NotificationConfig {
  email: {
    provider: string;
    apiKey: string;
    fromEmail: string;
  };
  sms: {
    provider: string;
    accountSid: string;
    authToken: string;
    fromPhone: string;
  };
  whatsapp: {
    provider: string;
    accountSid: string;
    authToken: string;
    fromWhatsApp: string;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  channel: 'email' | 'sms' | 'whatsapp';
  subject?: string;
  content: string;
  variables: string[];
}

export interface NotificationData {
  type: string;
  channel: 'email' | 'sms' | 'whatsapp';
  recipient: string;
  templateId?: string;
  subject?: string;
  content: string;
  variables?: Record<string, any>;
}

class NotificationService {
  private config: NotificationConfig | null = null;

  async initialize() {
    await this.loadConfig();
  }

  private async loadConfig() {
    const { data, error } = await supabase
      .from('notification_config')
      .select('*')
      .eq('active', true);

    if (error) {
      console.error('Error loading notification config:', error);
      return;
    }

    if (data) {
      this.config = {
        email: {
          provider: 'resend',
          apiKey: data.find(d => d.service === 'email')?.api_key || '',
          fromEmail: data.find(d => d.service === 'email')?.from_email || '',
        },
        sms: {
          provider: 'twilio',
          accountSid: data.find(d => d.service === 'sms')?.api_key || '',
          authToken: data.find(d => d.service === 'sms')?.api_secret || '',
          fromPhone: data.find(d => d.service === 'sms')?.from_phone || '',
        },
        whatsapp: {
          provider: 'twilio',
          accountSid: data.find(d => d.service === 'whatsapp')?.api_key || '',
          authToken: data.find(d => d.service === 'whatsapp')?.api_secret || '',
          fromWhatsApp: data.find(d => d.service === 'whatsapp')?.from_whatsapp || '',
        }
      };
    }
  }

  async getTemplates(type?: string, channel?: string): Promise<NotificationTemplate[]> {
    let query = supabase
      .from('notification_templates')
      .select('*')
      .eq('active', true)
      .order('name');

    if (type) {
      query = query.eq('type', type);
    }
    if (channel) {
      query = query.eq('channel', channel);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      return [];
    }

    return data || [];
  }

  async getUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user preferences:', error);
      return [];
    }

    return data || [];
  }

  async updateUserPreferences(userId: string, preferences: Array<{
    notification_type: string;
    enabled: boolean;
    settings?: any;
  }>) {
    const updates = preferences.map(pref => ({
      user_id: userId,
      notification_type: pref.notification_type,
      enabled: pref.enabled,
      settings: pref.settings || {},
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('notification_preferences')
      .upsert(updates);

    if (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  private replaceVariables(content: string, variables: Record<string, any>): string {
    let result = content;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value || ''));
    });

    return result;
  }

  async sendNotification(notification: NotificationData): Promise<boolean> {
    try {
      // Crear registro en el log
      const { data: logEntry, error: logError } = await supabase
        .from('notification_log')
        .insert({
          template_id: notification.templateId,
          type: notification.type,
          channel: notification.channel,
          recipient: notification.recipient,
          subject: notification.subject,
          content: notification.content,
          status: 'pending'
        })
        .select()
        .single();

      if (logError) {
        console.error('Error creating notification log:', logError);
        return false;
      }

      let success = false;
      let externalId = '';
      let errorMessage = '';

      try {
        switch (notification.channel) {
          case 'email':
            success = await this.sendEmail(notification);
            break;
          case 'sms':
            success = await this.sendSMS(notification);
            break;
          case 'whatsapp':
            success = await this.sendWhatsApp(notification);
            break;
          default:
            throw new Error(`Unsupported notification channel: ${notification.channel}`);
        }

        if (success) {
          // Actualizar log como enviado
          await supabase
            .from('notification_log')
            .update({
              status: 'sent',
              external_id: externalId,
              sent_at: new Date().toISOString()
            })
            .eq('id', logEntry.id);
        }
      } catch (error: any) {
        errorMessage = error.message;
        
        // Actualizar log como fallido
        await supabase
          .from('notification_log')
          .update({
            status: 'failed',
            error_message: errorMessage
          })
          .eq('id', logEntry.id);
      }

      return success;
    } catch (error) {
      console.error('Error in sendNotification:', error);
      return false;
    }
  }

  private async sendEmail(notification: NotificationData): Promise<boolean> {
    try {
      console.log('📧 Enviando email real...');
      
      // Usar proxy local para evitar CORS
      const response = await fetch('http://localhost:3002/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: notification.recipient,
          subject: notification.subject || 'Notificación FlamencoPuro',
          content: notification.content,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Email enviado correctamente:', data.messageId);
        return true;
      } else {
        console.error('❌ Error enviando email:', data.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error general enviando email:', error);
      return false;
    }
  }

  private async sendSMS(notification: NotificationData): Promise<boolean> {
    try {
      console.log('📱 Enviando SMS real...');
      
      // Usar proxy local para evitar CORS
      const response = await fetch('http://localhost:3002/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: notification.recipient,
          content: notification.content,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ SMS enviado correctamente:', data.messageId);
        return true;
      } else {
        console.error('❌ Error enviando SMS:', data.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error general enviando SMS:', error);
      return false;
    }
  }

  private async sendWhatsApp(notification: NotificationData): Promise<boolean> {
    try {
      console.log('💬 Enviando WhatsApp real...');
      
      // Usar proxy local para evitar CORS
      const response = await fetch('http://localhost:3002/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: notification.recipient,
          content: notification.content,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ WhatsApp enviado correctamente:', data.messageId);
        return true;
      } else {
        console.error('❌ Error enviando WhatsApp:', data.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error general enviando WhatsApp:', error);
      return false;
    }
  }

  async sendTemplateNotification(
    type: string,
    channel: 'email' | 'sms' | 'whatsapp',
    recipient: string,
    variables: Record<string, any>,
    userId?: string
  ): Promise<boolean> {
    // Verificar si el usuario tiene habilitado este tipo de notificación
    if (userId) {
      const preferences = await this.getUserPreferences(userId);
      const preference = preferences.find(p => p.notification_type === channel);
      
      if (!preference?.enabled) {
        console.log(`User ${userId} has disabled ${channel} notifications`);
        return false;
      }
    }

    // Obtener template
    const templates = await this.getTemplates(type, channel);
    const template = templates[0];

    if (!template) {
      console.error(`No template found for type: ${type}, channel: ${channel}`);
      return false;
    }

    // Reemplazar variables en el contenido
    const content = this.replaceVariables(template.content, variables);
    const subject = template.subject ? this.replaceVariables(template.subject, variables) : undefined;

    // Enviar notificación
    return await this.sendNotification({
      type,
      channel,
      recipient,
      templateId: template.id,
      subject,
      content,
      variables
    });
  }

  async getNotificationHistory(userId?: string, limit = 50) {
    let query = supabase
      .from('notification_log')
      .select(`
        *,
        notification_templates(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notification history:', error);
      return [];
    }

    return data || [];
  }
}

export const notificationService = new NotificationService();

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { notificationService } from '@/services/notificationService';
import { toast } from 'sonner';
import { Send, Mail, MessageSquare, Smartphone } from 'lucide-react';

export const NotificationTest = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'test',
    channel: 'email' as 'email' | 'sms' | 'whatsapp',
    recipient: '',
    variables: '{"fecha": "2025-01-17"}'
  });

  const handleSendTest = async () => {
    if (!formData.recipient) {
      toast.error('Por favor ingresa un destinatario');
      return;
    }

    setLoading(true);
    try {
      let variables = {};
      try {
        variables = JSON.parse(formData.variables);
      } catch (e) {
        toast.error('Variables JSON inválidas');
        setLoading(false);
        return;
      }

      const success = await notificationService.sendTemplateNotification(
        formData.type,
        formData.channel,
        formData.recipient,
        variables
      );

      if (success) {
        toast.success(`Notificación ${formData.channel} enviada correctamente`);
      } else {
        toast.error('Error enviando notificación');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error enviando notificación');
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'sms': return 'bg-green-100 text-green-800';
      case 'whatsapp': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Prueba de Notificaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Notificación</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Prueba</SelectItem>
                <SelectItem value="fichaje_entrada">Fichaje Entrada</SelectItem>
                <SelectItem value="fichaje_salida">Fichaje Salida</SelectItem>
                <SelectItem value="encargo_listo">Encargo Listo</SelectItem>
                <SelectItem value="stock_bajo">Stock Bajo</SelectItem>
                <SelectItem value="incidencia_nueva">Nueva Incidencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel">Canal</Label>
            <Select value={formData.channel} onValueChange={(value: 'email' | 'sms' | 'whatsapp') => setFormData({...formData, channel: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">📧 Email</SelectItem>
                <SelectItem value="sms">📱 SMS</SelectItem>
                <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipient">Destinatario</Label>
          <Input
            id="recipient"
            placeholder="email@ejemplo.com o +34612345678"
            value={formData.recipient}
            onChange={(e) => setFormData({...formData, recipient: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="variables">Variables (JSON)</Label>
          <Textarea
            id="variables"
            placeholder='{"fecha": "2025-01-17", "empleado_nombre": "Juan Pérez"}'
            value={formData.variables}
            onChange={(e) => setFormData({...formData, variables: e.target.value})}
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            {getChannelIcon(formData.channel)}
            <span className="font-medium">Canal seleccionado:</span>
            <span className={`px-2 py-1 rounded text-sm ${getChannelColor(formData.channel)}`}>
              {formData.channel.toUpperCase()}
            </span>
          </div>
        </div>

        <Button 
          onClick={handleSendTest} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Enviando...' : 'Enviar Notificación de Prueba'}
        </Button>

        <div className="text-sm text-muted-foreground">
          <p><strong>Nota:</strong> Asegúrate de que las variables JSON sean válidas.</p>
          <p><strong>Email:</strong> Usa un email válido para recibir la notificación.</p>
          <p><strong>SMS/WhatsApp:</strong> Usa un número de teléfono con formato internacional (+34612345678).</p>
        </div>
      </CardContent>
    </Card>
  );
};

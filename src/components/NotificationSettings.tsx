import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Phone, 
  Settings, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Save,
  TestTube
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, NotificationTemplate } from '@/services/notificationService';
import { useUserRole } from '@/hooks/useUserRole';

interface UserPreference {
  notification_type: string;
  enabled: boolean;
  settings: any;
}

interface NotificationConfig {
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

const NotificationSettings = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [userPreferences, setUserPreferences] = useState<UserPreference[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [config, setConfig] = useState<NotificationConfig>({
    email: { provider: 'resend', apiKey: '', fromEmail: '' },
    sms: { provider: 'twilio', accountSid: '', authToken: '', fromPhone: '' },
    whatsapp: { provider: 'twilio', accountSid: '', authToken: '', fromWhatsApp: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await notificationService.initialize();
      
      if (user) {
        const preferences = await notificationService.getUserPreferences(user.id);
        setUserPreferences(preferences);
      }
      
      const allTemplates = await notificationService.getTemplates();
      setTemplates(allTemplates);
      
      // Cargar configuración del sistema (solo admins)
      if (isAdmin) {
        // Aquí cargarías la configuración desde la base de datos
        // Por ahora usamos valores por defecto
      }
    } catch (error) {
      console.error('Error loading notification data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las configuraciones',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (type: string, enabled: boolean) => {
    setUserPreferences(prev => 
      prev.map(p => 
        p.notification_type === type 
          ? { ...p, enabled }
          : p
      )
    );
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await notificationService.updateUserPreferences(user.id, userPreferences);
      toast({
        title: 'Configuración guardada',
        description: 'Tus preferencias de notificación han sido actualizadas'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las preferencias',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async (channel: 'email' | 'sms' | 'whatsapp') => {
    if (!testRecipient) {
      toast({
        title: 'Error',
        description: 'Por favor, ingresa un destinatario para la prueba',
        variant: 'destructive'
      });
      return;
    }

    setTesting(true);
    try {
      const success = await notificationService.sendTemplateNotification(
        'test',
        channel,
        testRecipient,
        {
          usuario_nombre: user?.email?.split('@')[0] || 'Usuario',
          fecha: new Date().toLocaleDateString('es-ES')
        },
        user?.id
      );

      if (success) {
        toast({
          title: 'Prueba enviada',
          description: `Notificación de prueba enviada por ${channel}`
        });
      } else {
        toast({
          title: 'Error en la prueba',
          description: 'No se pudo enviar la notificación de prueba',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al enviar la notificación de prueba',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Phone className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getChannelName = (channel: string) => {
    switch (channel) {
      case 'email': return 'Email';
      case 'sms': return 'SMS';
      case 'whatsapp': return 'WhatsApp';
      default: return channel;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email': return 'text-blue-600';
      case 'sms': return 'text-green-600';
      case 'whatsapp': return 'text-green-500';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Cargando configuraciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-responsive font-bold text-primary-gradient flex items-center gap-2">
          <Bell className="h-8 w-8" />
          Configuración de Notificaciones
        </h1>
        <p className="text-muted-foreground mt-2">
          Configura cómo y cuándo recibir notificaciones del sistema
        </p>
      </div>

      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferencias
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Pruebas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="card-highlight">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Preferencias de Notificación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {['email', 'sms', 'whatsapp'].map((channel) => {
                  const preference = userPreferences.find(p => p.notification_type === channel);
                  const enabled = preference?.enabled ?? true;

                  return (
                    <div key={channel} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gray-100 ${getChannelColor(channel)}`}>
                          {getChannelIcon(channel)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{getChannelName(channel)}</h3>
                          <p className="text-sm text-muted-foreground">
                            Recibir notificaciones por {getChannelName(channel).toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => handlePreferenceChange(channel, checked)}
                      />
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button 
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="btn-gradient-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar Preferencias'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="card-highlight">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Plantillas de Notificación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getChannelIcon(template.channel)}
                          {getChannelName(template.channel)}
                        </Badge>
                        <h3 className="font-semibold">{template.name}</h3>
                      </div>
                      <Badge variant="secondary">{template.type}</Badge>
                    </div>
                    
                    {template.subject && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Asunto:</strong> {template.subject}
                      </p>
                    )}
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm whitespace-pre-line">{template.content}</p>
                    </div>
                    
                    {template.variables.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Variables disponibles:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card className="card-highlight">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-primary" />
                Pruebas de Notificación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-recipient">Destinatario de prueba</Label>
                  <Input
                    id="test-recipient"
                    type="text"
                    placeholder="email@ejemplo.com o +34612345678"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ingresa un email para pruebas de email, o un número de teléfono para SMS/WhatsApp
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {['email', 'sms', 'whatsapp'].map((channel) => (
                    <div key={channel} className="p-4 border rounded-lg text-center">
                      <div className={`inline-flex p-3 rounded-full bg-gray-100 ${getChannelColor(channel)} mb-3`}>
                        {getChannelIcon(channel)}
                      </div>
                      <h3 className="font-semibold mb-2">{getChannelName(channel)}</h3>
                      <Button
                        onClick={() => handleTestNotification(channel as any)}
                        disabled={testing || !testRecipient}
                        variant="outline"
                        className="w-full"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Probar {getChannelName(channel)}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationSettings;

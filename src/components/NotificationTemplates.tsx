import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Phone, 
  AlertTriangle,
  Package,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock,
  Send
} from 'lucide-react';
import { notificationService, NotificationTemplate } from '@/services/notificationService';

const NotificationTemplates = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const allTemplates = await notificationService.getTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
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

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email': return 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'sms': return 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400';
      case 'whatsapp': return 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400';
      default: return 'border-gray-500/30 bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stock_bajo': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'encargo_listo': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'incidencia_nueva': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'stock_bajo': return 'border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'encargo_listo': return 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400';
      case 'incidencia_nueva': return 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400';
      default: return 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400';
    }
  };

  const formatContent = (content: string) => {
    // Convertir markdown básico a HTML para mejor visualización
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-muted-foreground">$1</em>')
      .replace(/\n/g, '<br>');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Cargando plantillas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          Plantillas de Notificación
        </h2>
        <p className="text-muted-foreground mt-2">
          Plantillas predefinidas para diferentes tipos de notificaciones
        </p>
      </div>

      {templates.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No hay plantillas disponibles</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(template.type)}
                    <div>
                      <CardTitle className="text-lg text-foreground">
                        {template.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.type.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getTypeColor(template.type)}>
                      {template.type.replace('_', ' ')}
                    </Badge>
                    <Badge className={getChannelColor(template.channel)}>
                      {getChannelIcon(template.channel)}
                      <span className="ml-1">{template.channel}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {template.subject && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Asunto:</h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border/30">
                      {template.subject}
                    </p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Contenido:</h4>
                  <div className="bg-muted/30 border border-border/30 p-4 rounded-lg">
                    <div 
                      className="text-sm text-foreground font-mono leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: formatContent(template.content) 
                      }}
                    />
                  </div>
                </div>

                {template.variables && template.variables.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Variables disponibles:</h4>
                    <div className="flex flex-wrap gap-2">
                      {template.variables.map((variable, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationTemplates;

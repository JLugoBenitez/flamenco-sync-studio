import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut as LogOutIcon, Timer, User } from "lucide-react";
import { useFichaje } from "@/hooks/useFichaje";

export const FichajeActual = ({ onUpdate }: { onUpdate: () => void }) => {
  const [horaActual, setHoraActual] = useState(new Date());
  const { fichajeActivo, loading, ficharEntrada, ficharSalida } = useFichaje();

  useEffect(() => {
    const interval = setInterval(() => setHoraActual(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFicharEntrada = async () => {
    await ficharEntrada();
    onUpdate();
  };

  const handleFicharSalida = async () => {
    await ficharSalida();
    onUpdate();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const calculateElapsedTime = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Control de Jornada</h3>
              <p className="text-sm text-muted-foreground font-normal">
                {horaActual.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-primary">
              {formatTime(horaActual)}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Estado actual */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Estado:</span>
          </div>
          <Badge 
            variant={fichajeActivo ? "default" : "secondary"}
            className={fichajeActivo ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}
          >
            {fichajeActivo ? "Trabajando" : "Fuera de servicio"}
          </Badge>
        </div>

        {/* Botón principal */}
        <div className="flex justify-center">
          {!fichajeActivo ? (
            <Button 
              onClick={handleFicharEntrada} 
              disabled={loading}
              size="lg"
              className="w-full max-w-xs h-14 text-lg font-semibold gap-3 bg-green-600 hover:bg-green-700"
            >
              <LogIn className="h-6 w-6" />
              {loading ? "Fichando..." : "Fichar Entrada"}
            </Button>
          ) : (
            <Button 
              onClick={handleFicharSalida} 
              disabled={loading}
              size="lg"
              variant="destructive"
              className="w-full max-w-xs h-14 text-lg font-semibold gap-3"
            >
              <LogOutIcon className="h-6 w-6" />
              {loading ? "Fichando..." : "Fichar Salida"}
            </Button>
          )}
        </div>

        {/* Información del fichaje activo */}
        {fichajeActivo && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <Timer className="h-4 w-4" />
              <span className="font-medium">Jornada en curso</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-blue-600 font-medium">Entrada</div>
                <div className="text-lg font-mono font-bold text-blue-800">
                  {fichajeActivo.fecha_entrada ? 
                    new Date(fichajeActivo.fecha_entrada).toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 
                    'N/A'
                  }
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-blue-600 font-medium">Tiempo transcurrido</div>
                <div className="text-lg font-mono font-bold text-blue-800">
                  {fichajeActivo.fecha_entrada ? 
                    calculateElapsedTime(fichajeActivo.fecha_entrada) : 
                    '00:00:00'
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

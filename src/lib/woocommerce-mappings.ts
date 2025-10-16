// Mapeos centralizados entre estados locales y WooCommerce
// Esto evita inconsistencias en la sincronización bidireccional

export const LOCAL_TO_WOO_STATUS_MAP: Record<string, string> = {
  'pendiente': 'pending',
  'en_proceso': 'processing',
  'listo': 'processing',
  'entregado': 'completed',
  'cancelado': 'cancelled'
};

export const WOO_TO_LOCAL_STATUS_MAP: Record<string, string> = {
  'pending': 'pendiente',
  'processing': 'listo', // Mapeo inverso consistente
  'on-hold': 'pendiente',
  'completed': 'entregado',
  'cancelled': 'cancelado',
  'refunded': 'cancelado',
  'failed': 'cancelado'
};

export const mapLocalStatusToWoo = (localStatus: string): string => {
  return LOCAL_TO_WOO_STATUS_MAP[localStatus] || 'pending';
};

export const mapWooStatusToLocal = (wooStatus: string): string => {
  return WOO_TO_LOCAL_STATUS_MAP[wooStatus] || 'pendiente';
};

// Validar que los mapeos son consistentes
export const validateMappings = (): boolean => {
  for (const [local, woo] of Object.entries(LOCAL_TO_WOO_STATUS_MAP)) {
    const reverseMapped = WOO_TO_LOCAL_STATUS_MAP[woo];
    if (reverseMapped && reverseMapped !== local) {
      console.warn(`Mapeo inconsistente: ${local} → ${woo} → ${reverseMapped}`);
      return false;
    }
  }
  return true;
};


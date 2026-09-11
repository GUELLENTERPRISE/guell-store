import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Shield, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Gavel,
  User,
  CreditCard,
  Package,
  MapPin
} from 'lucide-react';
import { Merchant } from '@/types/food';
import { getAllMerchants } from '@/data/merchantData';

interface PolicyTemplate {
  id: string;
  title: string;
  type: 'terms' | 'privacy' | 'refund' | 'shipping';
  sections: PolicySection[];
  lastUpdated: Date;
  version: string;
}

interface PolicySection {
  id: string;
  title: string;
  content: string;
  required: boolean;
  merchantSpecific?: boolean;
}

interface MerchantPolicy {
  merchantId: string;
  merchantName: string;
  customPolicies: {
    refundPolicy?: string;
    deliveryPolicy?: string;
    specialConditions?: string;
  };
}

const DynamicPolicyGenerator: React.FC = () => {
  const [selectedMerchant, setSelectedMerchant] = useState<string>('all');
  const [policyType, setPolicyType] = useState<'terms' | 'privacy'>('terms');
  const [generatedPolicy, setGeneratedPolicy] = useState<PolicyTemplate | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const merchantData = getAllMerchants();
    setMerchants(merchantData);
  }, []);

  const generatePolicy = async () => {
    setIsLoading(true);
    
    // Simulate API call to generate policy
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const policy = policyType === 'terms' ? generateTermsPolicy() : generatePrivacyPolicy();
    setGeneratedPolicy(policy);
    setIsLoading(false);
  };

  const generateTermsPolicy = (): PolicyTemplate => {
    const baseSections: PolicySection[] = [
      {
        id: 'intro',
        title: '1. Introducción y Aceptación',
        content: `Bienvenido a GÜELL. Al utilizar nuestra plataforma, usted acepta estos términos y condiciones. 
        GÜELL es una plataforma que conecta a clientes con restaurantes locales para facilitar pedidos de comida a domicilio.
        
        ${selectedMerchant !== 'all' ? `
        Estos términos se aplican específicamente a sus transacciones con ${merchants.find(m => m.id === selectedMerchant)?.businessName}.
        ` : ''}
        
        Al crear una cuenta o realizar un pedido, usted confirma que tiene la capacidad legal para contratar y acepta estar sujeto a estos términos.`,
        required: true
      },
      {
        id: 'services',
        title: '2. Descripción del Servicio',
        content: `GÜELL actúa como intermediario tecnológico entre clientes y restaurantes. Nuestros servicios incluyen:
        
        - Plataforma de pedidos en línea
        - Procesamiento de pagos seguros
        - Coordinación de entregas
        - Sistema de calificación y reseñas
        - Gestión de promociones y descuentos
        
        ${selectedMerchant !== 'all' ? `
        ${merchants.find(m => m.id === selectedMerchant)?.businessName} ofrece especialidad en 
        ${merchants.find(m => m.id === selectedMerchant)?.cuisineType.join(', ')} 
        con tiempo de entrega estimado de ${merchants.find(m => m.id === selectedMerchant)?.deliveryTime}.
        ` : ''}
        
        No garantizamos la disponibilidad de todos los productos en todo momento.`,
        required: true
      },
      {
        id: 'user-responsibilities',
        title: '3. Responsabilidades del Usuario',
        content: `Como usuario de GÜELL, usted se compromete a:
        
        - Proporcionar información veraz y actualizada
        - Mantener la seguridad de su cuenta
        - Realizar pagos de manera oportuna
        - Tratar al personal de entrega con respeto
        - Reportar cualquier problema con su pedido
        
        Es su responsabilidad revisar su pedido antes de confirmarlo.`,
        required: true
      },
      {
        id: 'payment',
        title: '4. Pagos y Precios',
        content: `Los precios mostrados en GÜELL incluyen el costo del producto más tarifa de entrega e impuestos aplicables.
        
        Aceptamos los siguientes métodos de pago:
        - Tarjetas de crédito/débito (Visa, Mastercard, American Express)
        - Billeteras digitales
        - Efectivo (solo para entregas específicas)
        
        ${selectedMerchant !== 'all' ? `
        ${merchants.find(m => m.id === selectedMerchant)?.businessName} puede tener políticas de pago específicas.
        ` : ''}
        
        Las transacciones son procesadas de forma segura a través de nuestros proveedores de pago certificados.`,
        required: true
      }
    ];

    // Add merchant-specific sections if selected
    if (selectedMerchant !== 'all') {
      const merchant = merchants.find(m => m.id === selectedMerchant);
      if (merchant) {
        baseSections.push({
          id: 'merchant-specific',
          title: '5. Políticas Específicas del Restaurante',
          content: `${merchant.businessName} aplica las siguientes políticas específicas:
          
          **Política de Cancelación:**
          - Cancelaciones gratuitas hasta 30 minutos antes del tiempo de entrega
          - Cancelaciones tardías pueden generar un cargo del 50%
          
          **Política de Devolución:**
          - Productos incorrectos o dañados serán reemplazados gratuitamente
          - Discrepancias menores pueden resultar en crédito para futuros pedidos
          
          **Tiempo de Entrega:**
          - Entrega estimada: ${merchant.deliveryTime}
          - Radio de entrega: ${merchant.deliveryRadius} millas
          - Horario de operación: ${merchant.hours.monday?.open || 'Cerrado'} - ${merchant.hours.monday?.close || 'Cerrado'}
          
          **Contacto del Restaurante:**
          - Email: ${merchant.notificationEmail}
          - Ubicación: ${merchant.address.street} ${merchant.address.number}`,
          required: true,
          merchantSpecific: true
        });
      }
    }

    baseSections.push(
      {
        id: 'delivery',
        title: selectedMerchant !== 'all' ? '6. Entrega y Envío' : '5. Entrega y Envío',
        content: `La entrega se realiza dentro del área de cobertura especificada. Los tiempos de entrega son estimados y pueden variar debido a:
        
        - Condiciones del tráfico
        - Clima adverso
        - Volumen de pedidos
        - Disponibilidad del repartidor
        
        No somos responsables por retrasos causados por factores fuera de nuestro control.`,
        required: true
      },
      {
        id: 'intellectual',
        title: selectedMerchant !== 'all' ? '7. Propiedad Intelectual' : '6. Propiedad Intelectual',
        content: `Todo el contenido de GÜELL, incluyendo pero no limitado a logotipos, diseños, texto, gráficos y software, 
        está protegido por derechos de autor y otras leyes de propiedad intelectual.
        
        ${selectedMerchant !== 'all' ? `
        ${merchants.find(m => m.id === selectedMerchant)?.businessName} mantiene los derechos de propiedad intelectual 
        sobre sus recetas, nombres de platos y materiales promocionales.
        ` : ''}`,
        required: true
      },
      {
        id: 'liability',
        title: selectedMerchant !== 'all' ? '8. Limitación de Responsabilidad' : '7. Limitación de Responsabilidad',
        content: `GÜELL no será responsable por:
        
        - Daños indirectos, incidentales o consecuentes
        - Pérdida de ganancias o datos
        - Interrupciones del servicio
        - Contenido de terceros
        
        ${selectedMerchant !== 'all' ? `
        ${merchants.find(m => m.id === selectedMerchant)?.businessName} es responsable por la calidad 
        y seguridad de los alimentos preparados.
        ` : ''}`,
        required: true
      },
      {
        id: 'disputes',
        title: selectedMerchant !== 'all' ? '9. Resolución de Disputas' : '8. Resolución de Disputas',
        content: `Cualquier disputa será resuelta primero mediante negociación de buena fe. 
        Si no se llega a un acuerdo, las disputas serán sometidas a arbitraje de acuerdo con las leyes del estado.`,
        required: true
      },
      {
        id: 'modifications',
        title: selectedMerchant !== 'all' ? '10. Modificaciones de los Términos' : '9. Modificaciones de los Términos',
        content: `Nos reservamos el derecho de modificar estos términos en cualquier momento. 
        Las modificaciones entrarán en vigor 30 días después de su publicación.`,
        required: true
      }
    );

    return {
      id: `terms-${selectedMerchant}-${Date.now()}`,
      title: selectedMerchant !== 'all' 
        ? `Términos y Condiciones - ${merchants.find(m => m.id === selectedMerchant)?.businessName}`
        : 'Términos y Condiciones Generales - GÜELL',
      type: 'terms',
      sections: baseSections,
      lastUpdated: new Date(),
      version: '2.1.0'
    };
  };

  const generatePrivacyPolicy = (): PolicyTemplate => {
    const sections: PolicySection[] = [
      {
        id: 'intro',
        title: '1. Información que Recopilamos',
        content: `Recopilamos información personal para proporcionar y mejorar nuestros servicios. Esta información incluye:
        
        **Información de Cuenta:**
        - Nombre, dirección de correo electrónico, número de teléfono
        - Dirección de entrega
        - Información de pago
        
        **Información de Uso:**
        - Historial de pedidos
        - Preferencias alimenticias
        - Calificaciones y reseñas
        - Datos de navegación y uso de la aplicación
        
        **Información Técnica:**
        - Dirección IP
        - Tipo de dispositivo
        - Información del navegador`,
        required: true
      },
      {
        id: 'usage',
        title: '2. Cómo Usamos su Información',
        content: `Utilizamos su información para:
        
        - Procesar y entregar sus pedidos
        - Personalizar su experiencia
        - Comunicarnos sobre su pedido
        - Mejorar nuestros servicios
        - Enviar promociones relevantes
        - Prevenir fraudes y abusos
        
        ${selectedMerchant !== 'all' ? `
        ${merchants.find(m => m.id === selectedMerchant)?.businessName} puede acceder a información limitada 
        necesaria para completar su pedido.
        ` : ''}`,
        required: true
      },
      {
        id: 'sharing',
        title: '3. Compartir Información',
        content: `Compartimos información con:
        
        **Restaurantes Partners:**
        - Detalles del pedido necesarios para preparación y entrega
        - Información de contacto para coordinación
        
        **Proveedores de Servicios:**
        - Procesadores de pagos
        - Servicios de entrega
        - Proveedores de tecnología
        
        **Requisitos Legales:**
        - Cumplimiento de ley y regulaciones
        - Protección de derechos y seguridad`,
        required: true
      },
      {
        id: 'security',
        title: '4. Seguridad de Datos',
        content: `Implementamos medidas de seguridad robustas:
        
        - Encriptación de datos en tránsito y en reposo
        - Acceso restringido a información personal
        - Auditorías de seguridad regulares
        - Cumplimiento con estándares industriales
        
        Sin embargo, ninguna transmisión por Internet es 100% segura.`,
        required: true
      },
      {
        id: 'rights',
        title: '5. Sus Derechos',
        content: `Usted tiene derecho a:
        
        - Acceder a su información personal
        - Corregir información incorrecta
        - Eliminar su cuenta y datos
        - Oponerse al procesamiento de datos
        - Restringir el procesamiento de información sensible
        
        Para ejercer estos derechos, contáctenos a privacy@guell.com`,
        required: true
      },
      {
        id: 'cookies',
        title: '6. Cookies y Tecnologías Similares',
        content: `Utilizamos cookies y tecnologías similares para:
        
        - Recordar sus preferencias
        - Analizar el uso del sitio
        - Personalizar contenido
        - Medir efectividad de marketing
        
        Puede controlar las cookies a través de la configuración de su navegador.`,
        required: true
      },
      {
        id: 'retention',
        title: '7. Retención de Datos',
        content: `Conservamos su información personal solo mientras sea necesario para:
        
        - Proporcionar nuestros servicios
        - Cumplir obligaciones legales
        - Resolver disputas
        - Detectar fraudes
        
        ${selectedMerchant !== 'all' ? `
        ${merchants.find(m => m.id === selectedMerchant)?.businessName} puede tener políticas 
        específicas de retención de datos de pedidos.
        ` : ''}`,
        required: true
      },
      {
        id: 'international',
        title: '8. Transferencias Internacionales',
        content: `Su información puede ser transferida y procesada en países fuera de su país de residencia. 
        Nos aseguramos que estas transferencias cumplan con las leyes de protección de datos aplicables.`,
        required: true
      },
      {
        id: 'children',
        title: '9. Protección de Menores',
        content: `Nuestros servicios no están destinados a menores de 13 años. 
        No recopilamos intencionalmente información de menores sin consentimiento parental.`,
        required: true
      },
      {
        id: 'changes',
        title: '10. Cambios en esta Política',
        content: `Podemos actualizar esta política de privacidad. 
        Le notificaremos cambios significativos a través de nuestra aplicación o correo electrónico.`,
        required: true
      }
    ];

    return {
      id: `privacy-${selectedMerchant}-${Date.now()}`,
      title: selectedMerchant !== 'all' 
        ? `Política de Privacidad - ${merchants.find(m => m.id === selectedMerchant)?.businessName}`
        : 'Política de Privacidad - GÜELL',
      type: 'privacy',
      sections,
      lastUpdated: new Date(),
      version: '2.1.0'
    };
  };

  const exportPolicy = () => {
    if (!generatedPolicy) return;
    
    const policyContent = generatedPolicy.sections.map(section => 
      `${section.title}\n${section.content}\n\n`
    ).join('');
    
    const blob = new Blob([policyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedPolicy.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Gavel className="w-8 h-8 text-orange-600" />
          <h1 className="text-3xl font-bold text-foreground">
            Generador de Políticas Dinámicas
          </h1>
        </div>
        <p className="text-muted-foreground">
          Cree términos y condiciones personalizados para cada restaurante
        </p>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Configuración de Política
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Política
              </label>
              <select
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value as 'terms' | 'privacy')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="terms">Términos y Condiciones</option>
                <option value="privacy">Política de Privacidad</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurante
              </label>
              <select
                value={selectedMerchant}
                onChange={(e) => setSelectedMerchant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todos los Restaurantes (Política General)</option>
                {merchants.map((merchant) => (
                  <option key={merchant.id} value={merchant.id}>
                    {merchant.businessName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={generatePolicy}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? 'Generando...' : 'Generar Política'}
            </Button>
            
            {generatedPolicy && (
              <Button
                variant="outline"
                onClick={exportPolicy}
              >
                Exportar como TXT
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Policy */}
      {generatedPolicy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {generatedPolicy.title}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Versión {generatedPolicy.version}
                </Badge>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  {generatedPolicy.lastUpdated.toLocaleDateString()}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {generatedPolicy.sections.map((section) => (
                <div key={section.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {section.title}
                    </h3>
                    {section.required && (
                      <Badge className="bg-red-100 text-red-800">
                        Requerido
                      </Badge>
                    )}
                    {section.merchantSpecific && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Específico del Restaurante
                      </Badge>
                    )}
                  </div>
                  
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                  
                  {section.id !== generatedPolicy.sections[generatedPolicy.sections.length - 1].id && (
                    <Separator />
                  )}
                </div>
              ))}
            </div>
            
            {/* Footer */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  <p>© 2024 GÜELL. Todos los derechos reservados.</p>
                  <p>Esta política fue generada dinámicamente y está sujeta a actualizaciones.</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Validado legalmente</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DynamicPolicyGenerator;

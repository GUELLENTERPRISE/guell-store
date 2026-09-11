import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  HelpCircle, 
  Search, 
  Ticket, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Package,
  CreditCard,
  User,
  FileText,
  Send,
  Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  orderId?: string;
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
  responses: Array<{
    id: string;
    message: string;
    sender: 'customer' | 'support';
    timestamp: Date;
    isRead: boolean;
  }>;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

const HelpCenter: React.FC = () => {
  const { user } = useAuth();
  const { orders } = useOrders();
  
  const [activeTab, setActiveTab] = useState<'search' | 'tickets' | 'contact'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    orderId: ''
  });
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);

  // Mock FAQ data
  const faqs: FAQ[] = [
    {
      id: '1',
      question: '¿Cómo realizo un pedido en GÜELL Food?',
      answer: 'Para realizar un pedido, navega a la sección /food, selecciona un restaurante, elige los productos que deseas y procede al checkout. Puedes agregar modificaciones y especiales a tu pedido.',
      category: 'ordering',
      helpful: 156
    },
    {
      id: '2',
      question: '¿Cuánto tiempo tarda la entrega?',
      answer: 'El tiempo de entrega varía según el restaurante y tu ubicación, pero generalmente es de 25-45 minutos. Puedes ver el tiempo estimado en el checkout.',
      category: 'delivery',
      helpful: 89
    },
    {
      id: '3',
      question: '¿Cómo funcionan los puntos del GÜELL Club?',
      answer: 'Ganas 5% del valor de tu compra en puntos. Los puntos se pueden canjear por descuentos: 100 puntos = $1.00. Los miembros de niveles superiores ganan más puntos y tienen mejores beneficios.',
      category: 'loyalty',
      helpful: 234
    },
    {
      id: '4',
      question: '¿Puedo cancelar mi pedido?',
      answer: 'Sí, puedes cancelar tu pedido antes de que sea confirmado por el restaurante. Si ya está en preparación, contacta directamente con el soporte.',
      category: 'ordering',
      helpful: 67
    },
    {
      id: '5',
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express), billeteras digitales y efectivo en algunas ubicaciones.',
      category: 'payment',
      helpful: 145
    },
    {
      id: '6',
      question: '¿Cómo puedo obtener un reembolso?',
      answer: 'Si tienes un problema con tu pedido, contáctanos dentro de 24 horas. Evaluaremos cada caso individualmente y procesaremos el reembolso si corresponde.',
      category: 'refund',
      helpful: 78
    }
  ];

  // Mock tickets data
  useEffect(() => {
    if (user) {
      const mockTickets: SupportTicket[] = [
        {
          id: 'ticket-1',
          subject: 'Pedido incorrecto',
          description: 'Recibí el pedido equivocado, pedí hamburguesa doble queso y me enviaron simple.',
          category: 'order_issue',
          priority: 'high',
          status: 'in_progress',
          orderId: 'order-123',
          customerId: user.id,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          responses: [
            {
              id: 'resp-1',
              message: 'Hola, lamento el inconveniente. Estamos revisando tu caso.',
              sender: 'support',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              isRead: true
            }
          ]
        },
        {
          id: 'ticket-2',
          subject: 'Problema con el pago',
          description: 'Mi tarjeta fue cargada pero el pedido no se completó.',
          category: 'payment',
          priority: 'urgent',
          status: 'resolved',
          customerId: user.id,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          responses: [
            {
              id: 'resp-2',
              message: 'Hemos procesado el reembolso. El dinero debería aparecer en 3-5 días hábiles.',
              sender: 'support',
              timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
              isRead: true
            }
          ]
        }
      ];
      setTickets(mockTickets);
    }
  }, [user]);

  const categories = [
    { id: 'all', name: 'Todas las categorías', icon: HelpCircle },
    { id: 'ordering', name: 'Pedidos', icon: Package },
    { id: 'delivery', name: 'Entrega', icon: MapPin },
    { id: 'payment', name: 'Pago', icon: CreditCard },
    { id: 'loyalty', name: 'GÜELL Club', icon: Ticket },
    { id: 'account', name: 'Cuenta', icon: User },
    { id: 'refund', name: 'Reembolsos', icon: FileText },
    { id: 'technical', name: 'Problemas Técnicos', icon: AlertTriangle }
  ];

  const ticketCategories = [
    { id: 'order_issue', name: 'Problema con pedido' },
    { id: 'delivery_issue', name: 'Problema con entrega' },
    { id: 'payment_issue', name: 'Problema con pago' },
    { id: 'account_issue', name: 'Problema con cuenta' },
    { id: 'refund_request', name: 'Solicitud de reembolso' },
    { id: 'general_inquiry', name: 'Consulta general' },
    { id: 'bug_report', name: 'Reporte de error' },
    { id: 'feature_request', name: 'Sugerencia' }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTicket = async () => {
    if (!user || !ticketForm.subject || !ticketForm.description) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newTicket: SupportTicket = {
        id: `ticket-${Date.now()}`,
        subject: ticketForm.subject,
        description: ticketForm.description,
        category: ticketForm.category,
        priority: ticketForm.priority,
        status: 'open',
        orderId: ticketForm.orderId || undefined,
        customerId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        responses: []
      };
      
      setTickets(prev => [newTicket, ...prev]);
      setTicketForm({
        subject: '',
        description: '',
        category: '',
        priority: 'medium',
        orderId: ''
      });
      setShowTicketForm(false);
      setActiveTab('tickets');
      
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-muted text-gray-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-muted text-gray-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-purple-100 text-purple-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Hace unos minutos';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Centro de Ayuda</h1>
        <p className="text-muted-foreground">
          Estamos aquí para ayudarte. Busca en nuestras FAQs o crea un ticket de soporte.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('search')}>
          <CardContent className="p-4 text-center">
            <Search className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold">Buscar FAQs</h3>
            <p className="text-sm text-muted-foreground">Encuentra respuestas rápidas</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowTicketForm(true)}>
          <CardContent className="p-4 text-center">
            <Ticket className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold">Crear Ticket</h3>
            <p className="text-sm text-muted-foreground">Contacta con soporte</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('tickets')}>
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold">Mis Tickets</h3>
            <p className="text-sm text-muted-foreground">Ver historial de tickets</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <div className="border-b">
          <div className="flex space-x-1 p-4">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'search' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Buscar
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'tickets' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Mis Tickets ({tickets.length})
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'contact' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Phone className="w-4 h-4 inline mr-2" />
              Contacto
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Buscar en FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* FAQ Results */}
              <div className="space-y-4">
                {filteredFAQs.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No se encontraron resultados para tu búsqueda.</p>
                  </div>
                ) : (
                  filteredFAQs.map(faq => (
                    <Card key={faq.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{faq.question}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {faq.helpful} útiles
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{faq.answer}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Categoría: {categories.find(c => c.id === faq.category)?.name}</span>
                          <button className="text-blue-600 hover:text-blue-800">
                            ¿Fue útil? Sí
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Mis Tickets de Soporte</h3>
                <Button onClick={() => setShowTicketForm(true)}>
                  <Ticket className="w-4 h-4 mr-2" />
                  Nuevo Ticket
                </Button>
              </div>

              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tienes tickets de soporte.</p>
                  <Button onClick={() => setShowTicketForm(true)} className="mt-4">
                    Crear Primer Ticket
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map(ticket => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground">{ticket.subject}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status === 'open' ? 'Abierto' :
                               ticket.status === 'in_progress' ? 'En Progreso' :
                               ticket.status === 'resolved' ? 'Resuelto' : 'Cerrado'}
                            </Badge>
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority === 'low' ? 'Baja' :
                               ticket.priority === 'medium' ? 'Media' :
                               ticket.priority === 'high' ? 'Alta' : 'Urgente'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span>ID: {ticket.id}</span>
                            {ticket.orderId && <span>Pedido: {ticket.orderId}</span>}
                            <span>{formatTimestamp(ticket.createdAt)}</span>
                          </div>
                          {ticket.responses.length > 0 && (
                            <span>{ticket.responses.length} respuesta{ticket.responses.length > 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Phone className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Teléfono</h3>
                    <p className="text-muted-foreground">1-800-GÜELL</p>
                    <p className="text-sm text-muted-foreground">Lun-Vie: 9AM-8PM</p>
                    <p className="text-sm text-muted-foreground">Sáb-Dom: 10AM-6PM</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Mail className="w-8 h-8 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Email</h3>
                    <p className="text-muted-foreground">support@guell.com</p>
                    <p className="text-sm text-muted-foreground">Respuesta en 24 horas</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Chat en Vivo</h3>
                    <p className="text-muted-foreground">Disponible 24/7</p>
                    <Button className="mt-2" size="sm">
                      Iniciar Chat
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto Adicional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Horario de Atención</h4>
                    <p className="text-muted-foreground">
                      Lunes a Viernes: 9:00 AM - 8:00 PM<br />
                      Sábados y Domingos: 10:00 AM - 6:00 PM<br />
                      Días Festivos: 10:00 AM - 4:00 PM
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2">Tiempo de Respuesta</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>Emergencias: Inmediato</li>
                      <li>Pedidos: 1-2 horas</li>
                      <li>Consultas generales: 4-6 horas</li>
                      <li>Problemas técnicos: 24 horas</li>
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2">Redes Sociales</h4>
                    <div className="flex gap-4">
                      <Button variant="outline" size="sm">Facebook</Button>
                      <Button variant="outline" size="sm">Twitter</Button>
                      <Button variant="outline" size="sm">Instagram</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </Card>

      {/* Ticket Form Modal */}
      {showTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Crear Ticket de Soporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Describe brevemente tu problema"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select value={ticketForm.category} onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={ticketForm.priority} onValueChange={(value: any) => setTicketForm(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="order">Pedido relacionado (opcional)</Label>
                <Select value={ticketForm.orderId} onValueChange={(value) => setTicketForm(prev => ({ ...prev, orderId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un pedido si aplica" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ningún pedido</SelectItem>
                    {orders.slice(0, 10).map(order => (
                      <SelectItem key={order.id} value={order.id}>
                        Pedido #{order.id} - ${order.total_amount}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Descripción detallada</Label>
                <Textarea
                  id="description"
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe tu problema en detalle. Incluye cualquier información relevante como screenshots, mensajes de error, etc."
                  rows={4}
                />
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Responderemos a tu ticket lo antes posible. Los tickets urgentes tienen prioridad.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateTicket}
                  disabled={isLoading || !ticketForm.subject || !ticketForm.description}
                  className="flex-1"
                >
                  {isLoading ? 'Enviando...' : <><Send className="w-4 h-4 mr-2" />Enviar Ticket</>}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowTicketForm(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HelpCenter;

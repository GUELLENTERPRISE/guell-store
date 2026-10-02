# TableFlow MVP

## Objetivo

Lanzar una primera versión comercial de GÜELL centrada en el flujo gastronómico TableFlow: QR de mesa, menú, sesión, pedido, cocina y estado del pedido.

## Flujo incluido

1. El cliente abre el QR de una mesa activa.
2. La aplicación resuelve restaurante, mesa y sesión.
3. El cliente consulta el menú disponible.
4. El cliente selecciona productos, cantidades y modificadores válidos.
5. Se crea un pedido asociado a la mesa y sesión correctas.
6. Cocina recibe el pedido.
7. Cocina actualiza el estado: `new`, `preparing`, `ready`, `served`.
8. El cliente consulta el estado del pedido.
9. El restaurante registra pago manual o deja el pedido como pendiente de pago.

## Roles

- Cliente o invitado: consultar menú, unirse a sesión y crear pedidos permitidos.
- Cocina: consultar y actualizar pedidos del restaurante asignado.
- Cajero: operar pagos y caja del restaurante asignado.
- Administrador del restaurante: gestionar menú, mesas, personal y configuración.
- Administrador global: aprobar comercios y operar funciones globales.

## Datos oficiales del MVP

- Restaurante: `restaurants`.
- Personal: `restaurant_staff`.
- Menú: `restaurant_menu_items`.
- Categorías: `food_categories`.
- Mesas: `tableflowtables`.
- Sesiones: `tableflowsessions`.
- Pedidos: `tablefloworders`.
- Ítems: `tablefloworderitems`.
- Eventos de cocina: `tableflowkitchenevents`.
- Pagos: `tablefloworderpayments` y `manual_payment_declarations`.

Las tablas duplicadas de marketplace o modelos gastronómicos antiguos quedan fuera del flujo prioritario hasta una decisión de consolidación.

## Fuera del MVP

- Marketplace completo.
- PayPal.
- Stripe real hasta disponer de backend o Edge Function verificada.
- Membresías y suscripciones.
- Wishlist y comparaciones.
- Reseñas avanzadas.
- Aplicación móvil nativa.
- Analítica avanzada.

## Criterios de aceptación

- Un QR válido no expone información de otro restaurante.
- Un pedido nuevo aparece en cocina dentro del restaurante correcto.
- El total se calcula y valida en servidor.
- Un cliente no puede modificar pedidos de otra sesión.
- Un miembro de cocina no puede operar otro restaurante.
- Cada cambio de estado genera un evento auditable.
- El flujo puede probarse con datos de demostración sin usar datos reales.
- El build, lint y auditoría automatizados se ejecutan en cada pull request.

## Datos de demostración

El piloto debe utilizar un restaurante de prueba, dos mesas, tres productos, un usuario de cocina, un usuario cajero y clientes invitados controlados. No se deben introducir credenciales reales en migraciones ni fixtures públicos.

## Regla de lanzamiento

No se habilita un piloto comercial hasta verificar QR → sesión → pedido → cocina → estado y revisar las políticas RLS y funciones RPC de las tablas involucradas.
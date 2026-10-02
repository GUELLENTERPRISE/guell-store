# TableFlow smoke test plan

## Objetivo

Validar el flujo comercial mínimo sin crear ni modificar datos de producción:

`QR → mesa → sesión → menú → pedido → cocina → estado`

## Precondiciones

- URL de una instancia de desarrollo o staging.
- Proyecto Supabase de desarrollo, nunca producción.
- Un restaurante de demostración aprobado.
- Dos mesas activas con QR.
- Al menos tres ítems disponibles en el menú.
- Un usuario con rol `admin` del restaurante.
- Un usuario con rol `kitchen` del restaurante.
- Un usuario con rol `cashier` si se prueba pago manual.
- Variables de entorno configuradas en el entorno de prueba.

## Casos críticos

### TF-001 — Abrir mesa por QR

1. Abrir el QR de una mesa activa.
2. Confirmar que se identifica el restaurante correcto.
3. Confirmar que se crea o recupera una sola sesión abierta.
4. Confirmar que no se muestran datos de otro restaurante.

Resultado: la mesa aparece disponible y el cliente puede consultar el menú.

### TF-002 — Consultar menú

1. Abrir la ruta de menú de mesa.
2. Confirmar que se muestran únicamente ítems disponibles.
3. Confirmar nombre, precio, imagen opcional y categoría.
4. Confirmar estado vacío y error de red.

Resultado: el menú es navegable sin datos hardcodeados.

### TF-003 — Crear pedido

1. Seleccionar un ítem.
2. Establecer una cantidad válida.
3. Añadir instrucciones opcionales.
4. Enviar el pedido.
5. Confirmar la pantalla de confirmación.
6. Confirmar que el pedido pertenece a la sesión y mesa correctas.

Resultado: el pedido se crea una sola vez y los totales son coherentes.

### TF-004 — Cocina recibe pedido

1. Iniciar sesión con rol `kitchen`.
2. Abrir la pantalla de cocina.
3. Confirmar que aparece el pedido del restaurante asignado.
4. Confirmar que pedidos de otros restaurantes no aparecen.

Resultado: cocina recibe solo los pedidos autorizados.

### TF-005 — Cambiar estado de cocina

1. Cambiar `new` a `preparing`.
2. Cambiar `preparing` a `ready`.
3. Cambiar `ready` a `served`.
4. Confirmar que el cliente ve el último estado.
5. Confirmar que se registra el evento correspondiente.

Resultado: la transición queda persistida y auditable.

### TF-006 — Pago manual controlado

1. Crear una declaración de pago de prueba.
2. Confirmar que queda pendiente de revisión.
3. Revisarla como staff autorizado.
4. Confirmar o rechazarla.
5. Confirmar que un cliente no puede aprobarla.

Resultado: ninguna operación de aprobación queda disponible para `anon`.

## Pruebas negativas obligatorias

- QR inválido.
- QR de mesa inactiva.
- Sesión inexistente o cerrada.
- Cantidad cero o negativa.
- Producto no disponible.
- Pedido duplicado por doble clic.
- Usuario de cocina de otro restaurante.
- Cliente intentando leer un pedido ajeno.
- `anon` intentando ejecutar una RPC administrativa.
- Error de red durante la creación del pedido.

## Datos de demostración

Los datos deben crearse únicamente en un entorno Supabase de desarrollo o staging mediante migración/seed revisado. No se incluyen UUID, correos, claves ni tokens reales en el repositorio.

El conjunto mínimo es:

- 1 restaurante demo.
- 2 mesas activas.
- 1 categoría.
- 3 ítems disponibles.
- 1 usuario admin.
- 1 usuario kitchen.
- 1 usuario cashier.
- Métodos de pago de prueba.

## Criterio de salida

El MVP no se considera listo para piloto hasta que TF-001 a TF-005 pasen y TF-006 haya sido validado en staging. Las pruebas negativas de autorización son bloqueantes.
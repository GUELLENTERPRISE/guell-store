# GÜELL

Plataforma web de comercio y pedidos gastronómicos. Este repositorio contiene el frontend de GÜELL y los módulos de TableFlow para operar restaurantes, mesas, sesiones, pedidos y cocina.

## Objetivo de esta fase

Dejar documentada la base del proyecto antes de realizar cambios de código, esquema, RLS o despliegue. Esta rama no modifica migraciones, políticas de seguridad ni datos de Supabase.

## Stack

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- Supabase y PostgreSQL.
- Capacitor para empaquetado móvil.
- Node.js y npm como flujo recomendado de instalación.
- Bun aparece en el repositorio mediante sus archivos lock, pero debe definirse un único gestor antes de automatizar CI/CD.

## Requisitos

- Node.js LTS.
- npm.
- Una instancia de Supabase para las funciones conectadas a base de datos.

## Instalación local

```bash
npm install
cp .env.example .env
npm run dev
```

La aplicación se sirve con Vite. La URL exacta la muestra Vite en la terminal, normalmente `http://localhost:5173`.

## Scripts actuales

Los scripts disponibles deben consultarse directamente en `package.json`, porque todavía no se ha ejecutado una validación local en esta rama.

Comandos esperados del flujo actual:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Si un comando no existe en la versión actual de `package.json`, debe añadirse en una tarea posterior y no asumirse como funcional.

## Funcionalidades presentes en el código

- Autenticación y registro.
- Catálogo y búsqueda de productos.
- Carrito, checkout y órdenes.
- Perfil, direcciones, pagos y notificaciones.
- Wishlist y membresía.
- Registro de vendedores y panel de vendedor.
- Restaurantes y menú gastronómico.
- TableFlow para mesas, códigos QR y sesiones.
- Pedidos de mesa e ítems de pedido.
- Estados de cocina: nuevo, preparando, listo y servido.
- Pagos manuales y componentes relacionados con caja.

La presencia de una pantalla o tabla no implica que el flujo completo esté validado de extremo a extremo.

## Flujo principal TableFlow

1. El cliente abre el enlace del código QR de una mesa.
2. La aplicación resuelve el restaurante y la mesa.
3. Se crea o recupera una sesión abierta.
4. El invitado se identifica opcionalmente.
5. Se consulta el menú disponible.
6. El cliente selecciona productos, cantidades y modificadores.
7. Se crea el pedido con sus ítems.
8. Cocina recibe el pedido.
9. El personal actualiza el estado: nuevo, preparando, listo o servido.
10. El cliente consulta el estado del pedido.
11. El pago puede registrarse según el método configurado por el restaurante.

Este flujo es el objetivo funcional prioritario. Antes de añadir funcionalidades nuevas se debe comprobar cada paso con datos de prueba y permisos reales.

## Estado actual

### Disponible en el repositorio

- Frontend React + TypeScript con Vite.
- Integración con Supabase.
- Páginas de marketplace, cuenta, checkout, restaurantes y TableFlow.
- Migraciones y funciones SQL relacionadas con TableFlow.
- Configuración inicial de Capacitor, Tailwind y ESLint.

### Pendiente de validación

- Instalación limpia con un único gestor de dependencias.
- Compilación de producción.
- Lint sin errores bloqueantes.
- Flujo TableFlow completo en un entorno reproducible.
- Pruebas unitarias, de integración y E2E.
- Verificación de roles por restaurante.
- SEO de rutas públicas y dinámicas.
- Deploy reproducible y monitoreo.

## Errores y riesgos conocidos

- El repositorio contiene simultáneamente `package-lock.json`, `bun.lock` y `bun.lockb`.
- Existen modelos funcionales solapados para marketplace y gastronomía, por ejemplo `fooditems`/`restaurant_menu_items`, `foodcategories`/`food_categories` y `orders`/`tablefloworders`.
- Existen carpetas de contexto que deben revisarse: `src/context` y `src/contexts`.
- Existe un archivo antiguo dentro de páginas: `src/pages/AccountProfilePage.old.tsx`.
- Los reportes `lint-full.txt`, `lint-report.txt`, `file_list.txt` y `errores-post.txt` deben tratarse como artefactos de diagnóstico, no como fuente de verdad del estado actual.
- La aplicación requiere una auditoría específica de políticas RLS y funciones `SECURITY DEFINER` antes de producción.
- Esta documentación no confirma que el proyecto compile: la validación debe ejecutarse en un entorno local o CI.

## Variables de entorno

Copia `.env.example` a `.env` y completa solamente las variables necesarias para tu entorno. No subas `.env` ni secretos al repositorio.

Las variables con prefijo `VITE_` se incorporan al frontend. Nunca coloques una service-role key, una clave privada o un secreto de webhook en una variable `VITE_`.

## Supabase

Las migraciones se encuentran en `supabase/migrations`. Esta fase no las modifica ni las aplica. Antes de cambiar el esquema:

1. Crear una migración nueva y reversible cuando sea posible.
2. Probarla en un entorno de desarrollo.
3. Revisar RLS y funciones relacionadas.
4. Ejecutar los advisors de seguridad.
5. Documentar el impacto en el flujo TableFlow.

## Criterios para cerrar la siguiente fase

- `npm install` termina correctamente.
- `npm run build` termina sin errores.
- `npm run lint` termina sin errores bloqueantes.
- El flujo QR a pedido se prueba con un restaurante, una mesa, un menú y un usuario de prueba.
- Los errores de red, carga y estado vacío son visibles para el usuario.
- No se modifican datos de producción durante las pruebas.

## Contribución y ramas

- `main`: rama principal.
- `chore/foundation-documentation`: documentación y preparación inicial.
- Para cada bloque funcional debe utilizarse una rama separada y un pull request.
- No mezclar correcciones de UI, migraciones y seguridad en un único commit.

## Seguridad

Nunca subas:

- `.env`.
- Claves privadas.
- Service-role keys.
- Tokens de acceso.
- Secretos de webhooks.
- Credenciales de base de datos.

Antes de publicar se debe revisar RLS, permisos de RPC, logs, dependencias y configuración de autenticación.

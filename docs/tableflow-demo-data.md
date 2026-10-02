# Datos demo de TableFlow

## Regla principal

Este contrato describe datos de demostración; no contiene credenciales ni UUID reales. La semilla debe ejecutarse únicamente en un proyecto Supabase de desarrollo o staging.

## Entidades

| Entidad | Cantidad mínima | Requisito |
|---|---:|---|
| Restaurante | 1 | `approval_status = approved`, `isactive = true` |
| Mesas | 2 | `status = active`, `current_status = available` |
| Categorías | 1 | Activa |
| Ítems de menú | 3 | Disponibles y asociados al restaurante |
| Usuario administrador | 1 | Staff con rol `admin` |
| Usuario cocina | 1 | Staff con rol `kitchen` |
| Usuario cajero | 1 | Staff con rol `cashier` |
| Métodos de pago | 2 | Solo prueba |

## Tablas del contrato

- `restaurants`.
- `restaurant_staff`.
- `food_categories`.
- `restaurant_menu_items`.
- `tableflowtables`.
- `restaurant_payment_methods`.

## Reglas

- Nunca usar datos de clientes reales.
- Nunca guardar contraseñas en seeds.
- No usar service-role keys en el frontend.
- El seed debe ser idempotente o ejecutarse solo en un proyecto descartable.
- Los UUID y correos deben generarse en el entorno de prueba.
- El seed no debe crear administradores globales.
- Antes de ejecutar cualquier migración, crear backup o usar una rama de Supabase.

import { supabase } from "@/integrations/supabase/client";
import { TablePaymentChoice } from "@/types/tableSession";

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableFlowGuestPayload = {
  guestId: string;
  guestName?: string | null;
  seatLabel?: string | null;
  items?: Json[];
  paymentChoice?: TablePaymentChoice | string | null;
  status?: string | null;
  submittedAt?: string | null;
  localOrderId?: string | null;
};

type EnsureTableResult = {
  id: string;
  merchant_id: string;
  table_number: string;
  status?: string | null;
};

type EnsureSessionResult = {
  id: string;
  table_id: string;
  guest_id: string;
  status?: string | null;
};

const normalizeError = (error: unknown, fallback: string): Error => {
  if (error instanceof Error) return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return new Error(message);
    }
  }
  return new Error(fallback);
};

export const ensureTable = async (
  merchantId: string,
  tableNumber: string
): Promise<EnsureTableResult> => {
  const { data: existing, error: selectError } = await supabase
    .from("table_flow_tables")
    .select("id, merchant_id, table_number, status")
    .eq("merchant_id", merchantId)
    .eq("table_number", tableNumber)
    .maybeSingle();

  if (selectError) {
    throw normalizeError(selectError, "No se pudo consultar la mesa.");
  }

  if (existing) {
    return existing;
  }

  const { data: created, error: insertError } = await supabase
    .from("table_flow_tables")
    .insert({
      merchant_id: merchantId,
      table_number: tableNumber,
      status: "active",
    })
    .select("id, merchant_id, table_number, status")
    .single();

  if (insertError) {
    throw normalizeError(insertError, "No se pudo crear la mesa.");
  }

  return created;
};

export const ensureSession = async (
  tableId: string,
  guestId: string
): Promise<EnsureSessionResult> => {
  const { data: existing, error: selectError } = await supabase
    .from("table_flow_sessions")
    .select("id, table_id, guest_id, status")
    .eq("table_id", tableId)
    .eq("guest_id", guestId)
    .maybeSingle();

  if (selectError) {
    throw normalizeError(selectError, "No se pudo consultar la sesión.");
  }

  if (existing) {
    return existing;
  }

  const { data: created, error: insertError } = await supabase
    .from("table_flow_sessions")
    .insert({
      table_id: tableId,
      guest_id: guestId,
      status: "draft",
    })
    .select("id, table_id, guest_id, status")
    .single();

  if (insertError) {
    throw normalizeError(insertError, "No se pudo crear la sesión.");
  }

  return created;
};

export const persistTableFlowOrder = async (params: {
  merchantId: string;
  tableNumber: string;
  guest: TableFlowGuestPayload;
}) => {
  const { merchantId, tableNumber, guest } = params;

  const table = await ensureTable(merchantId, tableNumber);
  const session = await ensureSession(table.id, guest.guestId);

  const payload = {
    table_id: table.id,
    session_id: session.id,
    merchant_id: merchantId,
    table_number: tableNumber,
    guest_id: guest.guestId,
    guest_name: guest.guestName ?? null,
    seat_label: guest.seatLabel ?? null,
    items: (guest.items ?? []) as Json[],
    payment_choice: guest.paymentChoice ?? "later",
    status: guest.status ?? "confirmed",
    submitted_at: guest.submittedAt ?? new Date().toISOString(),
    local_order_id: guest.localOrderId ?? null,
  };

  const { data, error } = await supabase
    .from("table_flow_orders")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw normalizeError(error, "No se pudo guardar la orden de la mesa.");
  }

  return data;
};
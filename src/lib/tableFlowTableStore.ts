import type {
  TableGuestSession,
  TableSessionState,
  TableSessionStatus,
  TableTotalsSummary,
} from "@/types/tableSession";
import type { FoodCartItem } from "@/types/food";

const TABLEFLOW_TABLE_STORAGE_KEY = "tableflow:tables";
const LEGACY_TABLE_SESSION_KEY = "table-session-state";

type TableGuestSessionsMap = Record<string, TableGuestSession>;

type PersistedTableBucket = {
  merchantId: string;
  tableNumber: string;
  guests: TableGuestSessionsMap;
  updatedAt: string;
};

type PersistedTableBuckets = Record<string, PersistedTableBucket>;

type LegacyTableState = {
  merchantId?: string;
  tableNumber?: string;
  guestIndex?: number;
  session?: Partial<TableGuestSession>;
};

const canUseStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const buildTableKey = (merchantId: string, tableNumber: string) =>
  `${merchantId.trim()}::${tableNumber.trim()}`;

const buildGuestKey = (guestIndex: number) => `guest-${guestIndex}`;

const safeParse = <T>(value: string | null): T | null => {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const createEmptySession = (guestIndex: number): TableGuestSession => ({
  guestIndex,
  guestLabel: `Comensal ${guestIndex}`,
  items: [],
  subtotal: 0,
  total: 0,
  totalItems: 0,
  paymentChoice: "later",
  status: "draft",
  submittedAt: null,
  localOrderId: null,
});

const normalizeCartItem = (item: FoodCartItem): FoodCartItem => {
  const quantity = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1;
  const selectedModifiers = Array.isArray(item.selectedModifiers) ? item.selectedModifiers : [];
  const modifiersTotal = selectedModifiers.reduce(
    (sum, modifier) => sum + (Number(modifier.price) || 0),
    0
  );
  const basePrice = Number(item.foodItem?.price) || 0;
  const computedUnitPrice = basePrice + modifiersTotal;
  const totalPrice =
    Number.isFinite(item.totalPrice) && item.totalPrice > 0
      ? item.totalPrice
      : computedUnitPrice * quantity;

  return {
    ...item,
    quantity,
    selectedModifiers,
    specialInstructions: item.specialInstructions ?? "",
    totalPrice,
  };
};

const normalizeSessionStatus = (status?: string): TableSessionStatus => {
  if (status === "submitted" || status === "confirmed") return status;
  return "draft";
};

const computeSessionTotals = (items: FoodCartItem[]) => {
  const normalizedItems = items.map(normalizeCartItem);
  const subtotal = normalizedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: normalizedItems,
    subtotal,
    total: subtotal,
    totalItems,
  };
};

const normalizeSession = (
  session: Partial<TableGuestSession> | null | undefined,
  guestIndex: number
): TableGuestSession => {
  const base = createEmptySession(guestIndex);
  const totals = computeSessionTotals(Array.isArray(session?.items) ? session.items : []);

  return {
    ...base,
    ...session,
    ...totals,
    guestIndex,
    guestLabel:
      typeof session?.guestLabel === "string" && session.guestLabel.trim().length > 0
        ? session.guestLabel.trim()
        : base.guestLabel,
    paymentChoice: session?.paymentChoice === "now" ? "now" : "later",
    status: normalizeSessionStatus(session?.status),
    submittedAt: session?.submittedAt ?? null,
    localOrderId: session?.localOrderId ?? null,
  };
};

const normalizeBucket = (
  bucket: PersistedTableBucket | null | undefined,
  merchantId: string,
  tableNumber: string
): PersistedTableBucket => {
  const guestsSource = bucket?.guests ?? {};
  const guests = Object.entries(guestsSource).reduce<TableGuestSessionsMap>((acc, [key, value]) => {
    const parsedGuestIndex = Number(String(key).replace("guest-", ""));
    const guestIndex = Number.isFinite(parsedGuestIndex) && parsedGuestIndex > 0 ? parsedGuestIndex : 1;
    acc[buildGuestKey(guestIndex)] = normalizeSession(value, guestIndex);
    return acc;
  }, {});

  return {
    merchantId,
    tableNumber,
    guests,
    updatedAt: bucket?.updatedAt ?? new Date().toISOString(),
  };
};

const readBuckets = (): PersistedTableBuckets => {
  if (!canUseStorage()) return {};

  const parsed = safeParse<PersistedTableBuckets>(
    window.localStorage.getItem(TABLEFLOW_TABLE_STORAGE_KEY)
  );

  return parsed && typeof parsed === "object" ? parsed : {};
};

const writeBuckets = (buckets: PersistedTableBuckets) => {
  if (!canUseStorage()) return;

  window.localStorage.setItem(TABLEFLOW_TABLE_STORAGE_KEY, JSON.stringify(buckets));
};

const migrateLegacyStateIfNeeded = (
  merchantId: string,
  tableNumber: string
): PersistedTableBucket | null => {
  if (!canUseStorage()) return null;

  const legacy = safeParse<LegacyTableState>(
    window.localStorage.getItem(LEGACY_TABLE_SESSION_KEY) ??
      window.sessionStorage?.getItem(LEGACY_TABLE_SESSION_KEY) ??
      null
  );

  if (!legacy?.session) return null;
  if (legacy.merchantId && legacy.merchantId !== merchantId) return null;
  if (legacy.tableNumber && legacy.tableNumber !== tableNumber) return null;

  const guestIndex =
    Number.isFinite(legacy.guestIndex) && Number(legacy.guestIndex) > 0
      ? Number(legacy.guestIndex)
      : 1;

  const migratedBucket: PersistedTableBucket = {
    merchantId,
    tableNumber,
    guests: {
      [buildGuestKey(guestIndex)]: normalizeSession(legacy.session, guestIndex),
    },
    updatedAt: new Date().toISOString(),
  };

  const buckets = readBuckets();
  buckets[buildTableKey(merchantId, tableNumber)] = migratedBucket;
  writeBuckets(buckets);

  try {
    window.localStorage.removeItem(LEGACY_TABLE_SESSION_KEY);
    window.sessionStorage?.removeItem(LEGACY_TABLE_SESSION_KEY);
  } catch {
    //
  }

  return migratedBucket;
};

const getBucket = (merchantId: string, tableNumber: string): PersistedTableBucket => {
  const normalizedMerchantId = merchantId.trim();
  const normalizedTableNumber = tableNumber.trim();
  const tableKey = buildTableKey(normalizedMerchantId, normalizedTableNumber);

  const buckets = readBuckets();
  const existing = buckets[tableKey];

  if (existing) {
    const normalized = normalizeBucket(existing, normalizedMerchantId, normalizedTableNumber);
    buckets[tableKey] = normalized;
    writeBuckets(buckets);
    return normalized;
  }

  const migrated = migrateLegacyStateIfNeeded(normalizedMerchantId, normalizedTableNumber);
  if (migrated) return migrated;

  const emptyBucket = normalizeBucket(null, normalizedMerchantId, normalizedTableNumber);
  buckets[tableKey] = emptyBucket;
  writeBuckets(buckets);
  return emptyBucket;
};

const saveBucket = (bucket: PersistedTableBucket) => {
  const buckets = readBuckets();
  const tableKey = buildTableKey(bucket.merchantId, bucket.tableNumber);

  buckets[tableKey] = {
    ...bucket,
    updatedAt: new Date().toISOString(),
  };

  writeBuckets(buckets);
};

export const loadTableState = (
  merchantId: string,
  tableNumber: string,
  guestIndex: number
): TableGuestSession => {
  const safeGuestIndex = guestIndex > 0 ? guestIndex : 1;
  const bucket = getBucket(merchantId, tableNumber);
  const guestKey = buildGuestKey(safeGuestIndex);

  const session = bucket.guests[guestKey]
    ? normalizeSession(bucket.guests[guestKey], safeGuestIndex)
    : createEmptySession(safeGuestIndex);

  if (!bucket.guests[guestKey]) {
    bucket.guests[guestKey] = session;
    saveBucket(bucket);
  }

  return session;
};

export const saveTableState = (
  merchantId: string,
  tableNumber: string,
  session: TableGuestSession
): TableGuestSession => {
  const safeGuestIndex = session.guestIndex > 0 ? session.guestIndex : 1;
  const bucket = getBucket(merchantId, tableNumber);
  const guestKey = buildGuestKey(safeGuestIndex);
  const normalizedSession = normalizeSession(session, safeGuestIndex);

  bucket.guests[guestKey] = normalizedSession;
  saveBucket(bucket);

  return normalizedSession;
};

export const clearGuestTableState = (
  merchantId: string,
  tableNumber: string,
  guestIndex: number
) => {
  const safeGuestIndex = guestIndex > 0 ? guestIndex : 1;
  const bucket = getBucket(merchantId, tableNumber);
  const guestKey = buildGuestKey(safeGuestIndex);

  bucket.guests[guestKey] = createEmptySession(safeGuestIndex);
  saveBucket(bucket);
};

export const loadAllGuestSessions = (
  merchantId: string,
  tableNumber: string
): TableGuestSession[] => {
  const bucket = getBucket(merchantId, tableNumber);

  return Object.values(bucket.guests)
    .map((session) => normalizeSession(session, session.guestIndex))
    .sort((a, b) => a.guestIndex - b.guestIndex);
};

export const computeTableTotals = (
  merchantId: string,
  tableNumber: string
): TableTotalsSummary => {
  const sessions = loadAllGuestSessions(merchantId, tableNumber);
  const activeSessions = sessions.filter(
    (session) => session.items.length > 0 || session.status !== "draft"
  );

  return {
    guestCount: activeSessions.length,
    totalItems: activeSessions.reduce((sum, session) => sum + session.totalItems, 0),
    subtotal: activeSessions.reduce((sum, session) => sum + session.subtotal, 0),
    total: activeSessions.reduce((sum, session) => sum + session.total, 0),
  };
};

export const resolveTableAndGuest = (
  merchantId: string,
  tableNumber: string,
  requestedGuestIndex?: number | null
): { tableState: TableSessionState; guestIndex: number } => {
  const sessions = loadAllGuestSessions(merchantId, tableNumber);
  const validRequestedGuest =
    requestedGuestIndex && Number.isFinite(requestedGuestIndex) && requestedGuestIndex > 0
      ? requestedGuestIndex
      : null;

  const guestIndex =
    validRequestedGuest ??
    (sessions.length > 0 ? Math.max(...sessions.map((session) => session.guestIndex)) + 1 : 1);

  const existingSession =
    sessions.find((session) => session.guestIndex === guestIndex) ??
    loadTableState(merchantId, tableNumber, guestIndex);

  const tableState: TableSessionState = {
    merchantId,
    tableNumber,
    guestIndex,
    session: existingSession,
    tableTotals: computeTableTotals(merchantId, tableNumber),
  };

  return { tableState, guestIndex };
};

export const resetTableState = (merchantId: string, tableNumber: string) => {
  const buckets = readBuckets();
  delete buckets[buildTableKey(merchantId, tableNumber)];
  writeBuckets(buckets);
};
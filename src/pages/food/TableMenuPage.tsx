import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, MapPin, Plus, ShoppingBag, Star } from "lucide-react";

import SEOHead from "@/components/SEOHead";
import FoodItemModal, {
  type FoodItemModalCartActions,
} from "@/components/food/FoodItemModal";
import TableGuestBadge from "@/components/food/table/TableGuestBadge";
import TableOrderReview from "@/components/food/table/TableOrderReview";
import TableOrderSuccess from "@/components/food/table/TableOrderSuccess";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TableSessionProvider,
  useTableSession,
} from "@/contexts/TableSessionContext";
import {
  generateFoodItems,
  generateMerchantMenu,
  getMerchantById,
} from "@/data/merchantData";
import type { FoodCategory, FoodItem, Merchant } from "@/types/food";
import type { TableSession } from "@/types/tableSession";

type TableView = "menu" | "review" | "success";

type MenuSection = {
  category: FoodCategory;
  items: FoodItem[];
};

type TableMenuErrorProps = {
  title: string;
  description: string;
  hint?: string;
};

type TableMenuShellProps = {
  merchant: Merchant;
  tableNumber: string;
  menuByCategory: MenuSection[];
};

const TableMenuError = ({
  title,
  description,
  hint,
}: TableMenuErrorProps) => (
  <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-12">
    <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border bg-card p-8 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" aria-hidden />
      </div>

      <span className="mb-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        TableFlow
      </span>

      <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>

      {hint ? (
        <p className="mt-4 rounded-xl bg-muted px-4 py-3 font-mono text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  </div>
);

type TableMenuItemRowProps = {
  item: FoodItem;
  onSelect: () => void;
};

const TableMenuItemRow = ({ item, onSelect }: TableMenuItemRowProps) => (
  <button
    type="button"
    onClick={onSelect}
    className="flex w-full gap-3 rounded-2xl border bg-card p-3 text-left shadow-sm transition-shadow hover:shadow-md active:scale-[0.99]"
  >
    <img
      src={item.image}
      alt={item.name}
      className="h-20 w-20 shrink-0 rounded-xl object-cover"
      loading="lazy"
    />

    <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug text-foreground">{item.name}</h3>

          {item.promo ? (
            <Badge className="shrink-0 border-0 bg-orange-500 text-[10px] text-white">
              {item.promo}
            </Badge>
          ) : null}
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">{item.rating}</span>
          </div>

          <span className="text-base font-bold text-foreground">
            ${item.price.toFixed(2)}
          </span>
        </div>

        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </div>
  </button>
);

const TableMenuShell = ({
  merchant,
  tableNumber,
  menuByCategory,
}: TableMenuShellProps) => {
  const [view, setView] = useState<TableView>("menu");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);

  const {
    session,
    guestIndex,
    tableTotals,
    addItem,
    isItemInSession,
    getItemQuantity,
    canSubmitOrder,
    isSessionEditable,
    startNewOrder,
  } = useTableSession();

  useEffect(() => {
    if (session.status === "confirmed") {
      setView("success");
    }
  }, [session.status]);

  useEffect(() => {
    const firstCategoryId = menuByCategory[0]?.category?.id ?? null;

    if (!activeCategoryId && firstCategoryId) {
      setActiveCategoryId(firstCategoryId);
      return;
    }

    if (
      activeCategoryId &&
      !menuByCategory.some((entry) => entry.category.id === activeCategoryId)
    ) {
      setActiveCategoryId(firstCategoryId);
    }
  }, [activeCategoryId, menuByCategory]);

  const cartActions = useMemo<FoodItemModalCartActions>(
    () => ({
      addToCart: addItem,
      isItemInCart: isItemInSession,
      getItemQuantity,
    }),
    [addItem, isItemInSession, getItemQuantity]
  );

  const resolvedCategoryId =
    activeCategoryId ?? menuByCategory[0]?.category?.id ?? null;

  const visibleSections = menuByCategory.filter(
    (entry) => entry.category.id === resolvedCategoryId
  );

  const totalItems = session.totalItems ?? 0;

  const handleNewOrder = () => {
    startNewOrder();
    setSelectedFoodItem(null);
    setView("menu");
  };

  const handleReviewBack = () => {
    setView("menu");
  };

  const handleSubmitted = () => {
    setView("success");
  };

  if (view === "review" && isSessionEditable) {
    return (
      <TableOrderReview
        merchant={merchant}
        tableNumber={tableNumber}
        onBack={handleReviewBack}
        onSubmitted={handleSubmitted}
      />
    );
  }

  if (session.status === "confirmed") {
    return (
      <TableOrderSuccess
        merchant={merchant}
        tableNumber={tableNumber}
        onNewOrder={handleNewOrder}
        session={session as TableSession}
        guestIndex={guestIndex}
      />
    );
  }

  return (
    <>
      <SEOHead
        title={`${merchant.businessName} · Mesa ${tableNumber}`}
        description={`Menú en mesa de ${merchant.businessName}. Pedí desde tu celular.`}
      />

      <div className="min-h-[100dvh] bg-background">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                TableFlow
              </p>
              <h1 className="truncate text-lg font-bold">{merchant.businessName}</h1>

              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>Mesa {tableNumber}</span>
              </div>
            </div>

            <TableGuestBadge
              guestLabel={session.guestLabel}
              guestIndex={guestIndex}
              tableNumber={tableNumber}
              tableTotals={tableTotals}
              compact
            />
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-6">
          {menuByCategory.length > 0 ? (
            <section className="space-y-3">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {menuByCategory.map(({ category }) => {
                  const isActive = category.id === resolvedCategoryId;

                  return (
                    <Button
                      key={category.id}
                      type="button"
                      variant={isActive ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setActiveCategoryId(category.id)}
                    >
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {visibleSections.length > 0 ? (
            visibleSections.map(({ category, items }) => (
              <section key={category.id} className="space-y-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {category.name}
                  </h2>

                  {category.description ? (
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <TableMenuItemRow
                      key={item.id}
                      item={item}
                      onSelect={() => setSelectedFoodItem(item)}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <section className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground shadow-sm">
              No hay platos disponibles en esta categoría.
            </section>
          )}
        </main>

        <footer className="sticky bottom-0 border-t bg-card/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="mx-auto flex max-w-lg flex-col gap-2">
            <Button
              type="button"
              size="lg"
              className="w-full rounded-full"
              disabled={!canSubmitOrder}
              onClick={() => setView("review")}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {totalItems > 0
                ? `Revisar pedido · ${totalItems} item${totalItems === 1 ? "" : "s"}`
                : "Elegí tus platos"}
            </Button>
          </div>
        </footer>

        <FoodItemModal
          item={selectedFoodItem}
          open={!!selectedFoodItem}
          onOpenChange={(open) => {
            if (!open) setSelectedFoodItem(null);
          }}
          cartActions={cartActions}
          hideDeliveryMeta
          addButtonPrefix="Agregar"
        />
      </div>
    </>
  );
};

const TableMenuPage = () => {
  const [searchParams] = useSearchParams();

  const merchantId = searchParams.get("merchant")?.trim() ?? "";
  const tableNumber = searchParams.get("table")?.trim() ?? "";

  const merchant = useMemo(
    () => (merchantId ? getMerchantById(merchantId) : undefined),
    [merchantId]
  );

  const categories = useMemo<FoodCategory[]>(
    () => (merchant ? generateMerchantMenu(merchant.id) : []),
    [merchant]
  );

  const menuByCategory = useMemo<MenuSection[]>(() => {
    if (!merchant) return [];

    try {
      const allItems = generateFoodItems(merchant.id, "");

      if (!Array.isArray(allItems)) return [];

      return categories
        .map((category) => ({
          category,
          items: allItems.filter(
            (item) =>
              !!item &&
              typeof item.id === "string" &&
              item.isActive !== false &&
              item.category === category.id
          ),
        }))
        .filter((section) => section.items.length > 0);
    } catch {
      return [];
    }
  }, [merchant, categories]);

  if (!merchantId || !tableNumber) {
    const missing = [
      !merchantId ? "merchant" : null,
      !tableNumber ? "table" : null,
    ]
      .filter(Boolean)
      .join(" y ");

    return (
      <TableMenuError
        title="Enlace de mesa incompleto"
        description={`Para ver el menú necesitas un código QR válido con los parámetros ${missing} en la URL.`}
        hint="?merchant=merchant-1&table=12"
      />
    );
  }

  if (!merchant || !merchant.isActive) {
    return (
      <TableMenuError
        title="Restaurante no encontrado"
        description="No encontramos este local. Escaneá de nuevo el código QR de tu mesa o pedí ayuda al personal."
        hint={`merchant=${merchantId}`}
      />
    );
  }

  if (menuByCategory.length === 0) {
    return (
      <TableMenuError
        title="Menú no disponible"
        description={`${merchant.businessName} aún no tiene platos publicados para pedido en mesa.`}
        hint={`Mesa ${tableNumber}`}
      />
    );
  }

  return (
    <TableSessionProvider merchantId={merchantId} tableNumber={tableNumber}>
      <TableMenuShell
        merchant={merchant}
        tableNumber={tableNumber}
        menuByCategory={menuByCategory}
      />
    </TableSessionProvider>
  );
};

export default TableMenuPage;

interface ShippingInfoProps {
  product?: any;
}

const ShippingInfo = ({ product }: ShippingInfoProps) => {
  const inStock = typeof product?.inventory === 'number' && product.inventory > 0;

  return (
    <div>
      <div>Ships from {product?.shipped_from || 'GÜELL'}</div>
      <div>Sold by {product?.sold_by || 'GÜELL'}</div>
      {inStock && (
        <div className="mt-1 text-xs text-green-700">
          🚚 Estimated delivery: 3-7 business days
        </div>
      )}
    </div>
  );
};

export default ShippingInfo;

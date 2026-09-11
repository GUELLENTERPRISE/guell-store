import { useFoodCartContext } from '@/context/FoodCartContext';

const useFoodCart = () => {
  return useFoodCartContext();
};

export default useFoodCart;
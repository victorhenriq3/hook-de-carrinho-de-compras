import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart")

    if (storagedCart) {
      return JSON.parse(storagedCart)
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const productAlreadyInCart = cart.find(product => product.id === productId)

      if(productAlreadyInCart){

        const productStock = await api.get<Stock>(`/stock/${productId}`)

        if(!productStock.data){
          toast.error('Quantidade solicitada fora de estoque');
        }

         productAlreadyInCart.amount =+ 1
         setCart([...cart, productAlreadyInCart])
         localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart))
      }

      const productData = await api.get(`/products/${productId}`)

      setCart([...cart,{...productData.data, amount: 1}])

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart))

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const newCartProducts = cart.filter(product => product.id !== productId)

      setCart(newCartProducts)

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCartProducts))

    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      const productToUpdate = cart.find(product => product.id = productId)

      const productStock = await api.get(`/stock/${productId}`)

      if(productStock.data <= 0){
        return;
      }
    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}

import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

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
      const newProduct = [...cart]

      const productAlreadyExists = newProduct.find(product => product.id === productId)

      const stock = await api.get(`/stock/${productId}`)

      const stockAmount = stock.data.amount

      const currentAmount = productAlreadyExists ? productAlreadyExists.amount : 0;

      const newAmount = currentAmount + 1;

      if(newAmount > stockAmount){

        toast.error("Quantidade solicitada fora de estoque");

        return
      }

      if(productAlreadyExists){
        
        const {amount: productAmount} = productAlreadyExists

        const updateAmountCartProduct = cart.map(product => {
          return product.id === productId
          ? {...product, amount: productAmount + 1}
          : product
        })

        setCart(updateAmountCartProduct)
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updateAmountCartProduct))
        
        return 
      }else{
        const product = await api.get(`/products/${productId}`)
        const newProductCart = {...product.data, amount: 1}
        newProduct.push(newProductCart)
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newProduct))
      }

      setCart(newProduct)

    } catch {
      toast.error('Erro na adi????o do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const productsInCart = cart.find(product => product.id === productId)

      if(!productsInCart){
        toast.error('Erro na remo????o do produto');

        return 
      }
      const newCartProducts = cart.filter(product => product.id !== productId)
      
      setCart(newCartProducts)

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCartProducts))

    } catch {
      // TODO
      toast.error('Erro na remo????o do produto');
    }
  };

  const updateProductAmount = async ({
    productId,   
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if(amount < 1) return
      
      const productStock = await api.get(`/stock/${productId}`)
      
      if(productStock.data.amount < amount){
        toast.error('Quantidade solicitada fora de estoque');

        return
      }
      const productToUpdate = cart.map(product => {
        return product.id === productId ? {...product, amount} : product
      })

      setCart(productToUpdate)
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(productToUpdate))
    } catch {
      // TODO
      toast.error('Erro na altera????o de quantidade do produto');
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

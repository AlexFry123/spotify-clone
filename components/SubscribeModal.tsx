"use client";

import { Price, ProductWithPrice } from "@/types";

import Button from "./Button";
import Modal from "./Modal";
import { getStripe } from "@/libs/stripeClient";
import { postData } from "@/libs/helpers";
import toast from "react-hot-toast";
import { useState } from "react";
import useSubscribeModal from "@/hooks/useSubscribeModal";
import { useUser } from "@/hooks/useUser";

interface SubscribeModalProps {
  products: ProductWithPrice[];
}

const SubscribeModal: React.FC<SubscribeModalProps> = ({ products }) => {
    const subscribeModal = useSubscribeModal()
    const { user, isLoading, subscription } = useUser()
    const [priceIdLoading, setPriceIdLoading] = useState<string>()

  let content = <div className="text-center">No products available</div>;

  const onChange = (open: boolean) => {
    if(!open) subscribeModal.onClose()
  }

  const formatPrice = (price: Price) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.currency,
      minimumFractionDigits: 0,
    }).format((price?.unit_amount || 0) / 100);

    const handleCheckout = async (price: Price) => {
        setPriceIdLoading(price.id)

        if(!user){ 
            setPriceIdLoading(undefined)
            return toast.error('Must be logged in')
        }

        if(subscription) {
            setPriceIdLoading(undefined)
            return toast('Already subscribed')
        }

        try {
            const {sessionId} = await postData({
                url: '/api/create-checkout-session',
                data: {price}
            })

            const stripe = await getStripe()
            stripe?.redirectToCheckout({ sessionId})
        } catch(error) {
            toast.error((error as Error)?.message)
        } finally {
            setPriceIdLoading(undefined)
        }
    }

  if (products.length)
    content = (
      <div>
        {products.map((product) => {
          if (!product.prices?.length)
            return <div key={product.id}>No prices available</div>;

          return product.prices.map((price) => (
            <Button disabled={isLoading || price.id === priceIdLoading} className="mb-4" onClick={() => handleCheckout(price)} key={price.id}>{`Subscribe for ${formatPrice(price)} a ${
              price.interval
            }`}</Button>
          ));
        })}
      </div>
    );

    if(subscription) {
        content = (
            <div className="text-center">
                Already subscribed
            </div>
        )
    }

  return (
    <Modal
      title="Only for premium users"
      description="Listen to music with Spotify Premium"
      isOpen={subscribeModal.isOpen}
      onChange={onChange}
    >
      {content}
    </Modal>
  );
};

export default SubscribeModal;

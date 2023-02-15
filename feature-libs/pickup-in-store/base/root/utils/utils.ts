import { Cart } from '@spartacus/cart/base/root';
import { RequiredDeepPath } from './type-utils';

/** A cart with the required ids */
type CartWithIdAndUserId = RequiredDeepPath<Cart, 'guid' | 'user.uid' | 'code'>;
/** Custom type guard to ensure we have a cart with the required ids */
export function cartWithIdAndUserId(
  cart: Cart | undefined
): cart is CartWithIdAndUserId {
  return (
    !!cart &&
    cart.guid !== undefined &&
    cart.user !== undefined &&
    cart.user.uid !== undefined &&
    cart.code !== undefined
  );
}

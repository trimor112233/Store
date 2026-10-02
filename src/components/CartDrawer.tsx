import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useStoreData } from '../context/StoreDataContext';
import { useLanguage } from '../context/LanguageContext';
import { universityCampuses } from '../data/mockData';
import { Order } from '../types';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, CheckCircle2, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  onCheckoutSuccess?: (orderId: string) => void;
}

export default function CartDrawer({ onCheckoutSuccess }: CartDrawerProps) {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discount,
    shipping,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { addOrder } = useStoreData();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Checkout form state
  const [studentName, setStudentName] = useState('Ahmed Youssef');
  const [studentPhone, setStudentPhone] = useState('01099238471');
  const [pickupPoint, setPickupPoint] = useState(universityCampuses[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderCompleteId, setOrderCompleteId] = useState<string | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res.message);
    if (res.success) setCouponInput('');
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacingOrder(true);

    setTimeout(() => {
      const generatedId = `SH-${Math.floor(10000 + Math.random() * 90000)}`;

      const newOrder: Order = {
        id: generatedId,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        orderType: cart.some((i) => i.type === 'kit')
          ? 'Kit Order'
          : cart.some((i) => i.type === 'digital')
          ? 'Digital Product Order'
          : 'Product Order',
        status: 'Pending',
        paymentStatus: paymentMethod === 'card' ? 'Paid' : 'Unpaid',
        items: [...cart],
        subtotal,
        shipping,
        discount,
        total,
        campusDeliveryPoint: pickupPoint,
        deliveryAddress: `Student designated pickup: ${pickupPoint}`,
        studentName,
        phone: studentPhone,
        email: `${studentName.toLowerCase().replace(/\s+/g, '.')}@cu.edu.eg`,
        collegeId: cart[0]?.collegeId || 'engineering',
        collegeName: 'Faculty of Engineering',
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Campus Delivery' : 'Online Card / InstaPay',
        timeline: [
          {
            status: 'Pending',
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            description: 'Order placed by student',
          },
        ],
        internalNotes: [],
      };

      addOrder(newOrder);

      setIsPlacingOrder(false);
      setOrderCompleteId(generatedId);
      clearCart();
      if (onCheckoutSuccess) {
        onCheckoutSuccess(generatedId);
      }
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!isPlacingOrder) setIsCartOpen(false);
            }}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          <div className={`fixed inset-y-0 ${isRtl ? 'left-0 pl-0 sm:pl-10' : 'right-0 pr-0 sm:pr-10'} max-w-full flex`}>
            <motion.div
              initial={{ x: isRtl ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    {orderCompleteId 
                      ? (isRtl ? 'تم تأكيد طلبك' : 'Order Confirmed') 
                      : isCheckingOut 
                      ? t('checkout.title') 
                      : t('cart.title')}
                  </h2>
                  {!orderCompleteId && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {isCheckingOut 
                        ? t('checkout.subtitle') 
                        : isRtl 
                        ? `لديك عدد ${cart.length} منتجات في السلة` 
                        : `${cart.length} items in your order`}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckingOut(false);
                    setOrderCompleteId(null);
                  }}
                  className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {orderCompleteId ? (
                  /* Order Confirmation State */
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                      {isRtl ? 'تم إرسال الطلب بنجاح!' : 'Order Placed!'}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto mb-6">
                      {isRtl 
                        ? `تم تأكيد طلبك رقم #${orderCompleteId} بنجاح. ستصلك رسالة SMS للتنسيق بمجرد خروج المندوب للحرم الجامعي.`
                        : `Your order #${orderCompleteId} has been confirmed. You will receive an SMS when out for delivery to your campus gate.`}
                    </p>
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5 mb-6 text-right">
                      <div className="flex justify-between gap-4">
                        <span className="text-zinc-500">{isRtl ? 'بوابة التسليم:' : 'Pickup Location:'}</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100 text-right">{pickupPoint}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">{isRtl ? 'طريقة الدفع:' : 'Payment:'}</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {paymentMethod === 'cod' ? t('checkout.cod') : t('checkout.online')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        setOrderCompleteId(null);
                        setIsCheckingOut(false);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      {isRtl ? 'مواصلة التسوق' : 'Continue Shopping'}
                    </button>
                  </div>
                ) : isCheckingOut ? (
                  /* Checkout Form View */
                  <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        {t('checkout.name')}
                      </label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Ahmed Youssef"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        {t('checkout.phone')}
                      </label>
                      <input
                        type="tel"
                        required
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="010xxxxxxxx"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        {t('checkout.pickup')}
                      </label>
                      <select
                        value={pickupPoint}
                        onChange={(e) => setPickupPoint(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {universityCampuses.map((campus) => (
                          <option key={campus} value={campus}>
                            {campus}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        {t('checkout.payment')}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                            paymentMethod === 'cod'
                              ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                              : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <div className="text-xs font-bold">{isRtl ? 'دفع كاش بالكلية' : 'Cash on Delivery'}</div>
                          <div className="text-[10px] text-zinc-500">{isRtl ? 'تسليم يداً بيد' : 'Pay at faculty gate'}</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                            paymentMethod === 'card'
                              ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                              : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <div className="text-xs font-bold">{isRtl ? 'إنستا باي / فيزا' : 'InstaPay / Card'}</div>
                          <div className="text-[10px] text-zinc-500">{isRtl ? 'تحويل فوري مسبق' : 'Instant transfer'}</div>
                        </button>
                      </div>
                    </div>

                    {/* Order summary mini block */}
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                      <div className="flex justify-between text-zinc-500">
                        <span>{isRtl ? `المنتجات (${cart.length})` : `Items (${cart.length})`}</span>
                        <span className="tabular-nums font-medium text-zinc-800 dark:text-zinc-200">{subtotal} {isRtl ? 'ج.م' : 'EGP'}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <span>{isRtl ? 'خصم الطلاب' : 'Student Discount'}</span>
                          <span className="tabular-nums font-medium">-{discount} {isRtl ? 'ج.م' : 'EGP'}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-zinc-500">
                        <span>{t('cart.shipping')}</span>
                        <span className="tabular-nums font-medium text-zinc-800 dark:text-zinc-200">
                          {shipping === 0 ? t('cart.freeShipping') : `${shipping} ${isRtl ? 'ج.م' : 'EGP'}`}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        <span>{isRtl ? 'الإجمالي المستحق' : 'Total Due'}</span>
                        <span className="tabular-nums text-base">{total} {isRtl ? 'ج.م' : 'EGP'}</span>
                      </div>
                    </div>
                  </form>
                ) : cart.length === 0 ? (
                  /* Empty Cart View */
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl mb-3">
                      🛒
                    </div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1">{t('cart.empty')}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
                      {t('cart.empty.desc')}
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      {isRtl ? 'ابدأ التسوق' : 'Start Shopping'}
                    </button>
                  </div>
                ) : (
                  /* Items List */
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 rounded-lg object-cover bg-zinc-200 dark:bg-zinc-700 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=200&q=80';
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {item.category || 'Product'}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                              {item.price * item.quantity} {isRtl ? 'ج.م' : 'EGP'}
                            </span>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-400 cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-semibold px-2 tabular-nums">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-400 cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-zinc-400 hover:text-rose-500 transition-colors self-start cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Promo Code Form */}
                    <div className="pt-2">
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                            <Tag className="w-3.5 h-3.5" />
                            <span>{isRtl ? `تم تطبيق الكوبون "${appliedCoupon}"` : `Coupon "${appliedCoupon}" applied`}</span>
                          </div>
                          <button
                            type="button"
                            onClick={removeCoupon}
                            className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer"
                          >
                            {isRtl ? 'حذف' : 'Remove'}
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleApplyCoupon} className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            placeholder={t('cart.coupon.placeholder')}
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer"
                          >
                            {t('cart.coupon.apply')}
                          </button>
                        </form>
                      )}
                      {couponFeedback && !appliedCoupon && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">{couponFeedback}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {!orderCompleteId && cart.length > 0 && (
                <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 space-y-3 shrink-0">
                  {!isCheckingOut && (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>{t('cart.subtotal')}</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                          {subtotal} {isRtl ? 'ج.م' : 'EGP'}
                        </span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                          <span>{isRtl ? 'الخصم' : 'Discount'}</span>
                          <span className="tabular-nums">-{discount} {isRtl ? 'ج.م' : 'EGP'}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>{t('cart.shipping')}</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                          {shipping === 0 ? t('cart.freeShipping') : `${shipping} ${isRtl ? 'ج.م' : 'EGP'}`}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        <span>{t('cart.total')}</span>
                        <span className="text-base tabular-nums">{total} {isRtl ? 'ج.م' : 'EGP'}</span>
                      </div>
                    </div>
                  )}

                  {isCheckingOut ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCheckingOut(false)}
                        className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        {isRtl ? 'رجوع' : 'Back'}
                      </button>
                      <button
                        type="submit"
                        form="checkout-form"
                        disabled={isPlacingOrder}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isPlacingOrder 
                          ? (isRtl ? 'جاري الإرسال...' : 'Confirming Order...') 
                          : t('checkout.placeOrder')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsCheckingOut(true)}
                      className="w-full py-3 px-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs sm:text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{t('cart.checkout')}</span>
                      <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                    </button>
                  )}

                  <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isRtl ? 'ضمان الطالب • الدفع عند الاستلام كاش بالكامل' : 'Campus Student Guarantee · Cash on Pickup Allowed'}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

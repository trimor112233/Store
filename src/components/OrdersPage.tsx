import React, { useState } from 'react';
import { useStoreData } from '../context/StoreDataContext';
import { Order, StudentProfile } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { initialProfile } from '../data/mockData';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  Receipt,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  ShieldAlert,
} from 'lucide-react';

export default function OrdersPage() {
  const { orders } = useStoreData();
  const { addToCart, setIsCartOpen } = useCart();
  const { success } = useToast();
  const { t } = useLanguage();

  // Enforce permissions at data/query level
  const onboardingDone = localStorage.getItem('studenthub_onboarding_done') === 'true';
  const profileSaved = localStorage.getItem('sh_student_profile');
  const currentProfile: StudentProfile = profileSaved ? JSON.parse(profileSaved) : initialProfile;

  // Unauthenticated user -> no order history at all
  // Customer -> own orders only
  const filteredUserOrders = React.useMemo(() => {
    if (!onboardingDone) return [];
    return orders.filter(
      (order) =>
        order.phone === currentProfile.phone ||
        (order.email && currentProfile.email && order.email.toLowerCase() === currentProfile.email.toLowerCase()) ||
        order.studentName.toLowerCase() === currentProfile.name.toLowerCase()
    );
  }, [orders, onboardingDone, currentProfile]);

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    filteredUserOrders[0]?.id || null
  );

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered</span>
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400">
            <Truck className="w-3.5 h-3.5" />
            <span>Out for Campus Delivery</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Processing</span>
          </span>
        );
    }
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => addToCart(item));
    setIsCartOpen(true);
  };

  const handleDownloadInvoice = (orderId: string) => {
    success('Receipt Generated', `Official tax receipt for #${orderId} generated.`);
  };

  if (!onboardingDone) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="p-8 md:p-12 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs max-w-lg mx-auto">
          <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            {t('order.unauthorized.title')}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            {t('order.unauthorized')}
          </p>
          <div className="text-xs text-zinc-400">
            Please complete onboarding or set up your student profile to access order history.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t('order.history')}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {t('order.history.subtitle')}
        </p>
      </div>

      {filteredUserOrders.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8">
          <Package className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            {t('order.none')}
          </h3>
          <p className="text-xs text-zinc-500">{t('order.none.desc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUserOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div
                key={order.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs transition-all"
              >
                {/* Summary Row (Clickable) */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-50 font-mono">
                          #{order.id}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Placed on {order.date} · {order.items.length} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
                    <div className="text-left md:text-right">
                      <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                        {order.total} EGP
                      </span>
                      <span className="text-[11px] text-zinc-400 block">{order.paymentMethod}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorder(order);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reorder</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadInvoice(order.id);
                        }}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        title="Download Receipt"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                      <div className="p-1 text-zinc-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-4">
                    {/* Delivery & Student Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          <span>Campus Pickup Point</span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-300">{order.campusDeliveryPoint}</p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Recipient Contact</span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-300">
                          {order.studentName} · {order.phone}
                        </p>
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-zinc-400 font-semibold">{item.quantity}x</span>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                              {item.title}
                            </span>
                          </div>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                            {item.price * item.quantity} EGP
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Financials */}
                    <div className="flex justify-end">
                      <div className="w-64 space-y-1 text-xs">
                        <div className="flex justify-between text-zinc-500">
                          <span>Subtotal:</span>
                          <span className="tabular-nums font-medium text-zinc-800 dark:text-zinc-200">{order.subtotal} EGP</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                            <span>Discount:</span>
                            <span className="tabular-nums">-{order.discount} EGP</span>
                          </div>
                        )}
                        <div className="flex justify-between text-zinc-500">
                          <span>Campus Courier:</span>
                          <span className="tabular-nums font-medium text-zinc-800 dark:text-zinc-200">
                            {order.shipping === 0 ? 'FREE' : `${order.shipping} EGP`}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between font-bold text-sm text-zinc-900 dark:text-zinc-50">
                          <span>Total Paid:</span>
                          <span className="tabular-nums">{order.total} EGP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

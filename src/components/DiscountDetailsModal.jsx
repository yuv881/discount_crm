import { useState } from 'react';
import {
  X,
  Tag,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Code2,
  Clock,
  ShoppingBag,
  Sliders,
} from 'lucide-react';

export const DiscountDetailsModal = ({ discount, isOpen, onClose }) => {
  const [copiedField, setCopiedField] = useState('');
  const [showRawJson, setShowRawJson] = useState(false);

  if (!isOpen || !discount) return null;

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const title = discount.title || discount.name || discount.code || 'Configured Discount';
  const code = discount.code || discount.discountCode || discount.title || 'N/A';
  const discountType = discount.discountType || discount.type || 'Standard Discount';

  const statusStr = (
    discount.status ??
    discount.discountStatus ??
    (discount.isActive !== false ? 'active' : 'inactive')
  ).toString().toLowerCase();

  const isActive = statusStr === 'active';

  const usage = discount.usage ?? discount.usageCount ?? discount.timesUsed ?? discount.totalUsage ?? 0;
  const totalOrderAmount = discount.totalOrderAmount ?? discount.orderAmount ?? discount.totalOrdersValue ?? discount.totalSales ?? discount.totalOrdersAmount ?? discount.orderTotal ?? discount.sales ?? 0;
  const totalSavingGiven = discount.totalSavingGiven ?? discount.totalSavingsAmount ?? discount.totalSavingsGiven ?? discount.totalSavings ?? discount.savings ?? discount.totalDiscountValue ?? discount.discountAmount ?? 0;

  const value = discount.value ?? discount.discountValue ?? discount.percentage ?? discount.amount ?? null;
  const createdAt = discount.createdAt || discount.created_at || discount.startsAt || null;
  const endsAt = discount.endsAt || discount.ends_at || discount.expiresAt || null;
  const discountId = discount.id || discount._id || discount.discountId || discount.admin_graphql_api_id || 'N/A';

  // Format Dates
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Not Specified';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Additional rules if present
  const minRequirement = discount.minimumRequirement || discount.minRequirement || discount.minimumAmount || discount.minQuantity || (discount.rules?.minimumRequirement) || null;
  const appliesTo = discount.appliesTo || discount.targetType || discount.entitledCollectionIds?.length ? 'Selected Collections' : (discount.entitledProductIds?.length ? 'Selected Products' : 'All Products');
  const combinesWith = discount.combinesWith || discount.combines_with || null;
  const summary = discount.summary || discount.description || null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg truncate">
                  {title}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                >
                  {isActive ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <XCircle className="w-3 h-3 text-slate-400" />
                  )}
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Type: <span className="font-medium text-slate-700">{discountType}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metrics Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Total Usage</span>
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl font-bold text-slate-900">
                {typeof usage === 'number' ? usage.toLocaleString() : usage}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Times redeemed</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Total Order Value</span>
                <ShoppingBag className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-slate-900">
                ${Number(totalOrderAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Revenue with discount</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Savings Given</span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-slate-900">
                ${Number(totalSavingGiven).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Total discount given</p>
            </div>
          </div>

          {/* Configuration & Rule Details */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Discount Configuration
                </span>
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Discount Code */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-medium mb-1">Discount Code / Title</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 font-mono text-sm truncate">
                    {code}
                  </span>
                  {code !== 'N/A' && (
                    <button
                      onClick={() => handleCopy(code, 'code')}
                      className="text-slate-400 hover:text-indigo-600 p-1 rounded transition-colors shrink-0"
                      title="Copy code"
                    >
                      {copiedField === 'code' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Discount ID */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-medium mb-1">Discount ID</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-700 font-mono truncate">
                    {discountId}
                  </span>
                  {discountId !== 'N/A' && (
                    <button
                      onClick={() => handleCopy(discountId, 'id')}
                      className="text-slate-400 hover:text-indigo-600 p-1 rounded transition-colors shrink-0"
                      title="Copy ID"
                    >
                      {copiedField === 'id' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Discount Value */}
              {value !== null && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block font-medium mb-1">Configured Value</span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {typeof value === 'object' ? JSON.stringify(value) : `${value}${discountType.toLowerCase().includes('percent') ? '%' : ''}`}
                  </span>
                </div>
              )}

              {/* Applies To */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-medium mb-1">Applies To</span>
                <span className="font-semibold text-slate-900">
                  {typeof appliesTo === 'object' ? JSON.stringify(appliesTo) : appliesTo}
                </span>
              </div>

              {/* Created At */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-medium mb-1">Created / Started</span>
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDateTime(createdAt)}</span>
                </div>
              </div>

              {/* Ends At */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-medium mb-1">Expiry / Ends At</span>
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDateTime(endsAt)}</span>
                </div>
              </div>

              {/* Minimum Requirement if exists */}
              {minRequirement && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 sm:col-span-2">
                  <span className="text-slate-400 block font-medium mb-1">Minimum Requirements</span>
                  <span className="font-medium text-slate-800">
                    {typeof minRequirement === 'object' ? JSON.stringify(minRequirement) : String(minRequirement)}
                  </span>
                </div>
              )}

              {/* Combines With if exists */}
              {combinesWith && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 sm:col-span-2">
                  <span className="text-slate-400 block font-medium mb-1">Combines With</span>
                  <span className="font-medium text-slate-800">
                    {typeof combinesWith === 'object'
                      ? Array.isArray(combinesWith)
                        ? combinesWith.join(', ')
                        : Object.entries(combinesWith)
                            .filter(([, v]) => Boolean(v))
                            .map(([k]) => k.replace(/([A-Z])/g, ' $1').toLowerCase())
                            .join(', ') || 'None'
                      : String(combinesWith)}
                  </span>
                </div>
              )}

              {/* Summary / Description if exists */}
              {summary && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 sm:col-span-2">
                  <span className="text-slate-400 block font-medium mb-1">Summary Description</span>
                  <span className="font-medium text-slate-800">{summary}</span>
                </div>
              )}
            </div>
          </div>

          {/* Raw JSON / Advanced Inspector */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span>Raw Configuration JSON</span>
              </div>
              <span className="text-[11px] text-slate-500 font-normal">
                {showRawJson ? 'Hide payload' : 'Inspect raw JSON'}
              </span>
            </button>

            {showRawJson && (
              <div className="p-4 bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-60 rounded-b-xl relative">
                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(discount, null, 2), 'raw_json')}
                  className="absolute top-3 right-3 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] flex items-center gap-1"
                  title="Copy full JSON"
                >
                  {copiedField === 'raw_json' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy JSON
                    </>
                  )}
                </button>
                <pre className="pr-16 leading-relaxed whitespace-pre-wrap word-break">
                  {JSON.stringify(discount, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs rounded-xl shadow-2xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

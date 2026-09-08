import express from 'express';
import { DiscountStoreModel, StoreDetailsModel } from '../models/Store.js';

const router = express.Router();

// Helper to normalize discount items
function normalizeDiscount(d) {
  if (!d) return null;
  return {
    id: d.id || d._id?.toString() || d.shopifyDiscountId || 'disc_' + Math.random().toString(36).substr(2, 9),
    _id: d._id?.toString(),
    name: d.name || d.title || 'Untitled Discount',
    title: d.title || d.name || 'Untitled Discount',
    discountType: d.discountType || (d.type ? d.type.charAt(0).toUpperCase() + d.type.slice(1).replace('_', ' ') : 'Standard'),
    type: d.type || 'standard',
    discountWay: d.discountWay || 'automatic',
    totalSavingGiven: Number(d.totalSavingGiven ?? d.totalSavingsAmount ?? 0),
    totalSavingsAmount: Number(d.totalSavingsAmount ?? d.totalSavingGiven ?? 0),
    usageCount: Number(d.usageCount ?? (Array.isArray(d.usages) ? d.usages.length : 0)),
    totalOrderAmount: Number(d.totalOrderAmount ?? 0),
    status: d.status || (d.isDeleted ? 'deleted' : 'active'),
    createdAt: d.createdAt || d.startDate || new Date().toISOString(),
    updatedAt: d.updatedAt || d.createdAt || new Date().toISOString(),
    startDate: d.startDate || null,
    endDate: d.endDate || null,
    value: d.value ?? null,
    valueType: d.valueType || '',
    shopifyDiscountId: d.shopifyDiscountId || '',
    usages: Array.isArray(d.usages) ? d.usages : [],
    customerGets: d.customerGets || null,
    discountGroups: d.discountGroups || [],
  };
}

// Helper to determine exact store status from pastEvents and flags
export function getStoreStatus(store) {
  const rawEvents = Array.isArray(store?.pastEvents)
    ? store.pastEvents
    : store?.pastEvents && typeof store.pastEvents === 'object'
      ? [store.pastEvents]
      : [];

  let latestEventName = '';
  if (rawEvents.length > 0) {
    const sorted = [...rawEvents].sort((a, b) => {
      const timeA = typeof a === 'string' ? new Date(a).getTime() : new Date(a?.timestamp || a?.createdAt || a?.date || 0).getTime();
      const timeB = typeof b === 'string' ? new Date(b).getTime() : new Date(b?.timestamp || b?.createdAt || b?.date || 0).getTime();
      return timeB - timeA;
    });
    const latest = sorted[0];
    if (typeof latest === 'string') {
      latestEventName = latest;
    } else if (typeof latest === 'object' && latest !== null) {
      latestEventName = latest.eventName || latest.title || latest.name || latest.status || latest.event || latest.type || '';
    }
  }

  const lowerEvent = latestEventName.toLowerCase();
  if (lowerEvent.includes('reopen') || lowerEvent.includes('reopened')) {
    return 'reopened';
  } else if (lowerEvent.includes('close') || lowerEvent.includes('closed') || store?.isStoreClosed) {
    return 'closed';
  } else if (lowerEvent.includes('uninstall') || lowerEvent.includes('uninstalled') || store?.isActive === false) {
    return 'uninstalled';
  } else {
    return 'installed';
  }
}

// Helper to merge store and store_details
function formatStore(storeDoc, detailsDoc) {
  const store = storeDoc ? (storeDoc.toObject ? storeDoc.toObject() : storeDoc) : {};
  const details = detailsDoc ? (detailsDoc.toObject ? detailsDoc.toObject() : detailsDoc) : {};

  const domain = store.storeDomain || store.shop || details.shop || '';
  const ownerName = details.shop_owner_name || store.ownerName || 'Store Owner';
  const ownerEmail = details.email || store.ownerEmail || store.storeEmail || '';
  const storeEmail = store.storeEmail || details.email || ownerEmail;

  // Past events list
  let pastEvents = Array.isArray(store.pastEvents) ? store.pastEvents : [];
  if (pastEvents.length === 0 && details.installed_at) {
    pastEvents = [{ eventName: 'Installed', timestamp: details.installed_at }];
  }

  const rawDiscounts = Array.isArray(store.discounts) ? store.discounts : [];
  const discounts = rawDiscounts.map(normalizeDiscount).filter(Boolean);
  const totalUsage = Number(store.totalUsage ?? store.usageCount ?? discounts.reduce((sum, d) => sum + (d.usageCount || 0), 0));

  const createdAt = store.createdAt || details.installed_at || new Date().toISOString();
  const updatedAt = store.updatedAt || details.updated_at || createdAt;

  const currentStatus = getStoreStatus({ ...store, pastEvents, isStoreClosed: store.isStoreClosed, isActive: store.isActive });

  return {
    _id: store._id?.toString() || details._id?.toString() || domain,
    storeDomain: domain,
    shop: domain,
    ownerName,
    ownerEmail,
    storeEmail,
    country: details.country || store.country || 'N/A',
    shopifyPlan: details.shopify_plan || details.shopify_plan_type || 'Development',
    shopifyPlanType: details.shopify_plan_type || '',
    customersCount: details.customers_count ?? 0,
    isActive: store.isActive !== undefined ? Boolean(store.isActive) : true,
    isStoreClosed: Boolean(store.isStoreClosed),
    status: currentStatus,
    onboardingStatus: store.onboarding?.isCompleted ?? store.onboardingStatus ?? true,
    onboarding: store.onboarding || { isCompleted: true },
    plan: store.plan || { name: details.app_plan || 'Free', status: 'active' },
    createdAt,
    updatedAt,
    pastEvents,
    discounts,
    totalUsage,
  };
}

// GET /api/stores - List all stores with optional filtering, search, sorting, pagination
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      status = 'all',
      startDate = '',
      endDate = '',
      sortField = 'updatedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
      all = 'false',
    } = req.query;

    // Fetch all store records from Discounts collection
    const discountStores = await DiscountStoreModel.find({}).lean();

    // Fetch all details records from store_details collection
    const storeDetails = await StoreDetailsModel.find({}).lean();

    // Create a map by shop/domain
    const detailsMap = new Map();
    for (const d of storeDetails) {
      if (d.shop) {
        detailsMap.set(d.shop.toLowerCase(), d);
      }
    }

    // Merge discounts stores with details
    const processedDomains = new Set();
    let combined = [];

    for (const store of discountStores) {
      const domain = (store.storeDomain || store.shop || '').toLowerCase();
      if (domain) processedDomains.add(domain);
      const details = domain ? detailsMap.get(domain) : null;
      combined.push(formatStore(store, details));
    }

    // If there are stores in store_details not in Discounts collection, include them as well
    for (const d of storeDetails) {
      const shopLower = (d.shop || '').toLowerCase();
      if (shopLower && !processedDomains.has(shopLower)) {
        combined.push(formatStore({}, d));
      }
    }

    // Apply Search Filter
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      combined = combined.filter((s) => {
        return (
          s.storeDomain?.toLowerCase().includes(q) ||
          s.ownerName?.toLowerCase().includes(q) ||
          s.ownerEmail?.toLowerCase().includes(q) ||
          s.storeEmail?.toLowerCase().includes(q) ||
          s.country?.toLowerCase().includes(q)
        );
      });
    }

    // Apply Status Filter (supports multi-select comma-separated values, e.g. status=installed,uninstalled)
    if (status && status !== 'all') {
      const selectedStatuses = status
        .split(',')
        .map((st) => st.trim().toLowerCase())
        .filter(Boolean)
        .map((st) => (st === 'active' ? 'installed' : st));

      if (selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
        combined = combined.filter((s) => selectedStatuses.includes(s.status));
      }
    }

    // Apply Date Range Filter (on createdAt or updatedAt)
    if (startDate) {
      const startMs = new Date(startDate).getTime();
      combined = combined.filter((s) => new Date(s.createdAt).getTime() >= startMs);
    }
    if (endDate) {
      const endMs = new Date(endDate).getTime() + (24 * 60 * 60 * 1000 - 1); // end of day
      combined = combined.filter((s) => new Date(s.createdAt).getTime() <= endMs);
    }

    // Sorting
    combined.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'discounts') {
        valA = a.discounts?.length || 0;
        valB = b.discounts?.length || 0;
      } else if (sortField === 'totalUsage') {
        valA = Number(a.totalUsage) || 0;
        valB = Number(b.totalUsage) || 0;
      } else if (sortField === 'createdAt' || sortField === 'updatedAt') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const totalCount = combined.length;

    // If client asks for all stores without pagination
    if (all === 'true') {
      return res.json({
        success: true,
        totalCount,
        data: combined,
      });
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = combined.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      data: paginated,
      allStores: combined, // also provided for convenience
    });
  } catch (error) {
    console.error('[API /api/stores] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/stores/:domain - Single store details by domain
router.get('/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    if (!domain) {
      return res.status(400).json({ success: false, error: 'Domain parameter is required' });
    }

    const domainRegex = new RegExp(`^${domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    // Find in Discounts collection
    const storeDoc = await DiscountStoreModel.findOne({
      $or: [{ storeDomain: domainRegex }, { shop: domainRegex }],
    }).lean();

    // Find in store_details collection
    const detailsDoc = await StoreDetailsModel.findOne({
      shop: domainRegex,
    }).lean();

    if (!storeDoc && !detailsDoc) {
      return res.status(404).json({ success: false, error: `Store with domain '${domain}' not found` });
    }

    const formatted = formatStore(storeDoc, detailsDoc);
    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('[API /api/stores/:domain] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

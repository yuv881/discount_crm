import mongoose from 'mongoose';

// Schema for Discounts collection (contains store data and its discounts array)
const discountStoreSchema = new mongoose.Schema(
  {
    storeDomain: { type: String, index: true },
    shop: { type: String, index: true },
    ownerName: { type: String },
    ownerEmail: { type: String },
    storeEmail: { type: String },
    isActive: { type: Boolean, default: true },
    isStoreClosed: { type: Boolean, default: false },
    onboardingStatus: { type: Boolean, default: true },
    pastEvents: { type: Array, default: [] },
    discounts: { type: Array, default: [] },
    plan: { type: Object, default: {} },
    onboarding: { type: Object, default: {} },
  },
  {
    collection: 'Discounts',
    timestamps: true,
    strict: false,
  }
);

// Schema for store_details collection (contains store metadata from shopify)
const storeDetailsSchema = new mongoose.Schema(
  {
    shop: { type: String, index: true },
    email: { type: String },
    shop_owner_name: { type: String },
    country: { type: String },
    customers_count: { type: Number },
    installed_at: { type: Date },
    updated_at: { type: Date },
    app_plan: { type: String },
    shopify_plan: { type: String },
    shopify_plan_type: { type: String },
  },
  {
    collection: 'store_details',
    timestamps: false,
    strict: false,
  }
);

export const DiscountStoreModel = mongoose.model('DiscountStore', discountStoreSchema);
export const StoreDetailsModel = mongoose.model('StoreDetails', storeDetailsSchema);

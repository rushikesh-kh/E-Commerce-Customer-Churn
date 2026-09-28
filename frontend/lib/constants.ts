// Category options and default form values, mirroring api/scripts.py exactly
// so the frontend never sends a value the trained model has never seen.

export const PRIMARY_ACCESS_DEVICE_OPTIONS = ["Smartphone App", "Mobile Browser", "Desktop/Laptop"];
export const PAYMENT_MODE_OPTIONS = [
  "UPI",
  "Debit Card",
  "Credit Card",
  "Digital Wallet",
  "Card on Delivery (POS)",
  "Cash on Delivery",
];
export const GENDER_OPTIONS = ["Female", "Male"];
export const TOP_CATEGORY_OPTIONS = [
  "Smartphones",
  "Tablets & Wearables",
  "Grocery & Essentials",
  "Apparel & Fashion",
  "Laptops & Accessories",
  "Miscellaneous",
];
export const MARITAL_STATUS_OPTIONS = ["Married", "Single", "Separated/Divorced"];

export interface CustomerFormState {
  Tenure_Months: number | "";
  Primary_Access_Device: string;
  City_Tier: number | "";
  Hub_To_Home_KM: number | "";
  Payment_Mode: string;
  Gender: string;
  App_Engagement_Hrs: number | "";
  Devices_Linked: number | "";
  Top_Category: string;
  CSAT_Score: number | "";
  Marital_Status: string;
  Saved_Addresses: number | "";
  Complaint_Last_Month: number | "";
  YoY_Spend_Growth_Pct: number | "";
  Coupons_Redeemed: number | "";
  Monthly_Orders: number | "";
  Days_Since_Last_Order: number | "";
  Avg_Reward_Value_INR: number | "";
}

// Sensible defaults, close to the dataset's median values, so the form is
// immediately usable without the person filling in every field from scratch.
export const DEFAULT_FORM_STATE: CustomerFormState = {
  Tenure_Months: 15,
  Primary_Access_Device: "Smartphone App",
  City_Tier: 1,
  Hub_To_Home_KM: 14,
  Payment_Mode: "UPI",
  Gender: "Female",
  App_Engagement_Hrs: 0.2,
  Devices_Linked: 3,
  Top_Category: "Smartphones",
  CSAT_Score: 3,
  Marital_Status: "Married",
  Saved_Addresses: 3,
  Complaint_Last_Month: 0,
  YoY_Spend_Growth_Pct: 5,
  Coupons_Redeemed: 1,
  Monthly_Orders: 3,
  Days_Since_Last_Order: 7,
  Avg_Reward_Value_INR: 200,
};

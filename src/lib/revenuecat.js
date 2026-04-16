import { Purchases, LOG_LEVEL } from "@revenuecat/purchases-capacitor";
import { Capacitor } from "@capacitor/core";

const RC_API_KEY = "goog_hsFQVMNREhbkDHRdwZaVfBCVUVf";
const PRODUCT_ID = "glikova_premium";

let initialized = false;

export async function initRevenueCat(userId) {
  if (!Capacitor.isNativePlatform()) return;
  if (initialized) return;
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    await Purchases.configure({ apiKey: RC_API_KEY });
    if (userId) {
      await Purchases.logIn({ appUserID: userId });
    }
    initialized = true;
  } catch (e) {
    console.error("RevenueCat init error:", e);
  }
}

export async function checkPremiumStatus() {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active["premium"] !== undefined;
  } catch (e) {
    console.error("RevenueCat status error:", e);
    return false;
  }
}

export async function purchasePremium() {
  if (!Capacitor.isNativePlatform()) {
    throw new Error("NOT_NATIVE");
  }
  try {
    const { offerings } = await Purchases.getOfferings();
    const pkg = offerings?.current?.availablePackages?.[0];
    if (!pkg) throw new Error("NO_PACKAGE");
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    return customerInfo.entitlements.active["premium"] !== undefined;
  } catch (e) {
    if (e.code === "1") return false; // user cancelled
    throw e;
  }
}

export async function restorePurchases() {
  if (!Capacitor.isNativePlatform()) {
    throw new Error("NOT_NATIVE");
  }
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    return customerInfo.entitlements.active["premium"] !== undefined;
  } catch (e) {
    throw e;
  }
}

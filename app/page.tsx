"use client";

import { useEffect, useState } from "react"; // Adjust the path if needed
import styles from "./page.module.css";

declare global {
  interface Window {
    Square: {
      payments: (applicationId: string, locationId: string) => SquarePayments;
    };
  }
}

interface SquarePayments {
  paymentRequest: (options: PaymentRequestOptions) => PaymentRequest;
  cashAppPay: (
    request: PaymentRequest,
    options: CashAppPayOptions
  ) => Promise<CashAppPayInstance>;
}

interface PaymentRequestOptions {
  countryCode: string;
  currencyCode: string;
  total: {
    amount: string;
    label: string;
  };
}

interface CashAppPayOptions {
  redirectURL: string;
  referenceId: string;
}

interface CashAppPayInstance {
  attach: (
    selector: string,
    options?: CashAppPayButtonOptions
  ) => Promise<void>;
  addEventListener: (
    type: "ontokenization",
    listener: (event: CustomEvent<{ tokenResult: TokenResult }>) => void
  ) => void;
}

interface TokenResult {
  status: "OK" | "FAILED";
  token: string;
  errors?: unknown[];
}

interface CashAppPayButtonOptions {
  shape?: "semiround" | "square";
  width?: "full" | "static";
}

export default function Home() {
  const [amount, setAmount] = useState("10");

  useEffect(() => {
    const appId = "sq0idp-jKJY_vd7lPiul-ekwDrTdw";
    const locationId = "LA8577X5T20EP";

    const initCashApp = async () => {
      if (!window.Square) {
        console.warn("Square.js not ready, retrying...");
        setTimeout(initCashApp, 300);
        return;
      }

      try {
        const payments = window.Square.payments(appId, locationId);

        const paymentRequest = payments.paymentRequest({
          countryCode: "US",
          currencyCode: "USD",
          total: {
            amount: amount,
            label: "Total",
          },
        });

        const cashAppPay = await payments.cashAppPay(paymentRequest, {
          redirectURL: "https://polopackaging.com/thank-you",
          referenceId: crypto.randomUUID(),
        });

        await cashAppPay.attach("#cash-app-button", {
          shape: "semiround",
          width: "full",
        });

        cashAppPay.addEventListener("ontokenization", async (event) => {
          const { tokenResult } = event.detail;

          if (tokenResult.status === "OK") {
            const res = await fetch("/api/create-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sourceId: tokenResult.token,
                amount: parseFloat(amount) * 100, // in cents
              }),
            });

            const data = await res.json();
            alert(`✅ Payment ${data.payment?.status ?? "processed"}`);
          } else {
            console.error("❌ Tokenization failed:", tokenResult.errors);
            alert("❌ Tokenization failed");
          }
        });
      } catch (err) {
        console.error("❌ Error initializing Cash App Pay:", err);
      }
    };

    initCashApp();
  }, [amount]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.offerBanner}>
          ⚡ Limited Time Offer: Instant Delivery Guaranteed!
        </div>

        <h1 className={styles.title}>Virtual Entertainment Hub</h1>
        <p className={styles.subtitle}>Purchase Credits Instantly</p>
        <p className={styles.description}>All Orders Final · No Refunds</p>

        <label className={styles.label}>
          📃 Select Credit Amount{" "}
          <span className={styles.labelGray}>(Min: $5 | Max: $500)</span>
        </label>
        <select
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={styles.select}
        >
          {["5", "10", "20", "50", "100", "250", "500"].map((value) => (
            <option key={value} value={value}>
              ${value}
            </option>
          ))}
        </select>

        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>🔋 Instant Access</div>
          <div className={styles.featureItem}>🔐 Secure Encryption</div>
          <div className={styles.featureItem}>♻ No Extra Fees</div>
          <div className={styles.featureItem}>😊 24/7 Support</div>
        </div>

        <div className={styles.cashAppButtonWrapper} id="cash-app-button"></div>

        <p className={styles.badges}>
          <span className={styles.badge}>🔒 Secure Checkout</span>
          <span className={styles.badge}>🗻 Verified Vendor</span>
        </p>

        <p className={styles.legalText}>
          By continuing, you accept our{" "}
          <a href="#" className={styles.legalLink}>
            Terms of Use
          </a>{" "}
          and{" "}
          <a href="#" className={styles.legalLink}>
            Privacy Policy
          </a>
          .
          <br />
          All payments are encrypted and securely processed.
        </p>
      </div>
    </main>
  );
}

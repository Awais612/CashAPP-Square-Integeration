"use client";

import { useEffect, useRef, useState } from "react"; // Adjust the path if needed
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
  destroy?: () => Promise<void>;
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
  const [errorMessage, setErrorMessage] = useState("");
  const cashAppPayRef = useRef<CashAppPayInstance | null>(null);

  const creditAmounts = [
    5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 41, 42, 43, 44, 45, 46,
    47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 61, 62, 63, 64, 65, 66,
    67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 81, 82, 83, 84, 85, 86,
    87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 101, 102, 103, 104, 105,
    106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120,
    121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135,
    136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150,
    151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165,
    166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180,
    181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195,
    196, 197, 198, 199, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211,
    212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226,
    227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241,
    242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256,
    257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271,
    272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286,
    287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301,
    302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316,
    317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331,
    332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346,
    347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361,
    362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376,
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391,
    392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406,
    407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421,
    422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436,
    437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451,
    452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466,
    467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 481,
    482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 496,
    497, 498, 499,
  ];

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

    const initCashApp = async () => {
      if (!window.Square) {
        console.warn("Square.js not ready, retrying...");
        setTimeout(initCashApp, 300);
        return;
      }

      if (!appId || !locationId) {
        setErrorMessage("Square Application ID or Location ID is missing.");
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

        // ✅ Destroy existing instance before creating new
        if (cashAppPayRef.current) {
          await cashAppPayRef.current.destroy?.();
          cashAppPayRef.current = null;
        }

        const cashAppPay = await payments.cashAppPay(paymentRequest, {
          redirectURL: "https://cash-app-square-integeration.vercel.app/",
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
                amount: parseFloat(amount) * 100,
              }),
            });

            const data = await res.json();
            alert(`✅ Payment ${data.payment?.status ?? "processed"}`);
          } else {
            alert(`❌ Payment failed`);
            setErrorMessage("Payment authorization failed.");
          }
        });

        // ✅ Save instance
        cashAppPayRef.current = cashAppPay;
      } catch (err) {
        console.error("Cash App error:", err);
        setErrorMessage("Payment authorization failed.");
      }
    };

    initCashApp();

    // Optional: clean up on unmount
    return () => {
      cashAppPayRef.current?.destroy?.();
      cashAppPayRef.current = null;
    };
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
          {/* Primary options */}
          <option value="10">$10</option>
          <option value="20">$20</option>
          <option value="40">$40</option>
          <option value="60">$60</option>
          <option value="80">$80</option>
          <option value="100">$100</option>
          <option value="200">$200</option>
          <option value="500">$500</option>

          {/* Separator */}
          <option disabled>──────────</option>

          {/* Additional values from array */}
          {creditAmounts.map((value) => (
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

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}

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

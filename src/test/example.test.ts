/*
 * Unit Test Example
 * Testing a simple utility function
 */

import { describe, it, expect } from "vitest";

// Örnek utility fonksiyon
function formatPrice(price: number, currency = "TRY"): string {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency,
    }).format(price);
}

function calculateDiscount(price: number, discountPercent: number): number {
    if (discountPercent < 0 || discountPercent > 100) {
        throw new Error("Discount must be between 0 and 100");
    }
    return price - (price * discountPercent) / 100;
}

// TESTLER
describe("formatPrice", () => {
    it("should format price in TRY currency", () => {
        const result = formatPrice(1000);
        expect(result).toContain("1.000");
        expect(result).toContain("₺");
    });

    it("should format price in USD currency", () => {
        const result = formatPrice(1000, "USD");
        expect(result).toContain("$");
    });

    it("should handle decimal numbers", () => {
        const result = formatPrice(99.99);
        expect(result).toContain("99,99");
    });
});

describe("calculateDiscount", () => {
    it("should calculate 10% discount correctly", () => {
        expect(calculateDiscount(100, 10)).toBe(90);
    });

    it("should calculate 50% discount correctly", () => {
        expect(calculateDiscount(200, 50)).toBe(100);
    });

    it("should return same price for 0% discount", () => {
        expect(calculateDiscount(100, 0)).toBe(100);
    });

    it("should return 0 for 100% discount", () => {
        expect(calculateDiscount(100, 100)).toBe(0);
    });

    it("should throw error for negative discount", () => {
        expect(() => calculateDiscount(100, -10)).toThrow(
            "Discount must be between 0 and 100"
        );
    });

    it("should throw error for discount over 100", () => {
        expect(() => calculateDiscount(100, 150)).toThrow(
            "Discount must be between 0 and 100"
        );
    });
});

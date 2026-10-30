import { describe, it, expect } from 'vitest';
import {
  buildUpiDeepLink,
  generateUpiQrDataUrl,
  generateTaxInvoice,
  PaymentDetails
} from '../../services/paymentGateway';

describe('PaymentGateway & GST Tax Invoicing (Phase 7-28)', () => {
  const sampleDetails: PaymentDetails = {
    planTitle: 'Partner Pro Annual',
    amountInr: 1999,
    tierId: 'partner_pro_annual',
    type: 'partner',
    userEmail: 'lover@prerna.sovereign',
  };

  it('builds standard NPCI-compliant UPI deep links', () => {
    const txnRef = 'PRN-TXN-123456';
    const upiLink = buildUpiDeepLink(sampleDetails, txnRef);

    expect(upiLink).toContain('upi://pay?');
    expect(upiLink).toContain('pa=prerna.sanctuary%40icici');
    expect(upiLink).toContain('am=1999.00');
    expect(upiLink).toContain('cu=INR');
    expect(upiLink).toContain('tr=PRN-TXN-123456');
  });

  it('generates base64 data URL for QR codes', async () => {
    const upiLink = buildUpiDeepLink(sampleDetails, 'TXN-QR-TEST');
    const qrDataUrl = await generateUpiQrDataUrl(upiLink);

    expect(qrDataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('generates official GST tax invoice with reverse calculated 18% GST and SAC 998431', () => {
    const txnRef = 'UPI-UTR-987654321012';
    const invoice = generateTaxInvoice(sampleDetails, txnRef, sampleDetails.userEmail);

    expect(invoice.invoiceNumber).toMatch(/^PRN-INV-2026-\d{4}$/);
    expect(invoice.sacCode).toBe('998431');
    expect(invoice.totalAmountInr).toBe(1999);
    expect(invoice.supplierGstin).toBe('27AAACP0126P1Z4');
    expect(invoice.customerEmail).toBe('lover@prerna.sovereign');
    expect(invoice.utrOrTxnId).toBe(txnRef);

    // Verify mathematical tax calculations (18% GST inclusive)
    expect(invoice.taxableValue).toBe(1694.07);
    expect(invoice.cgst).toBe(152.47);
    expect(invoice.sgst).toBe(152.47);
    expect(invoice.taxableValue + invoice.cgst + invoice.sgst).toBeCloseTo(1999, 1);
  });

  it('calculates corporate school license GST accurately', () => {
    const schoolDetails: PaymentDetails = {
      planTitle: 'VidyaPeeth Campus Annual',
      amountInr: 49000,
      tierId: 'campus_annual',
      type: 'school',
      userEmail: 'principal@dps.edu.in',
    };

    const invoice = generateTaxInvoice(schoolDetails, 'NEFT-CAMPUS-9911');
    expect(invoice.totalAmountInr).toBe(49000);
    expect(invoice.taxableValue).toBe(41525.42);
    expect(invoice.cgst).toBe(3737.29);
    expect(invoice.sgst).toBe(3737.29);
    expect(invoice.taxableValue + invoice.cgst + invoice.sgst).toBeCloseTo(49000, 1);
  });
});


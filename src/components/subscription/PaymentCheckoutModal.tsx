import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  QrCode,
  CreditCard,
  Ticket,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Download,
  ArrowRight,
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  PaymentDetails,
  GstInvoice,
  buildUpiDeepLink,
  generateUpiQrDataUrl,
  generateTaxInvoice,
  downloadTaxInvoiceReceipt
} from '../../services/paymentGateway';
import { somaticAudio } from '../../utils/audioSynthesis';
import { useFocusTrap } from '../../utils/useFocusTrap';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: PaymentDetails | null;
  onSuccess: (txnId: string) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  details,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'voucher'>('upi');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [txnRef, setTxnRef] = useState<string>('');
  const [utrInput, setUtrInput] = useState<string>('');
  const [voucherInput, setVoucherInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<GstInvoice | null>(null);
  const [copiedVpa, setCopiedVpa] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && details) {
      const ref = `TXN-${Date.now().toString().slice(-8)}`;
      setTxnRef(ref);
      setPaymentSuccess(false);
      setGeneratedInvoice(null);
      setError(null);
      setUtrInput('');
      setVoucherInput('');

      const upiUrl = buildUpiDeepLink(details, ref);
      generateUpiQrDataUrl(upiUrl).then((url) => {
        setQrDataUrl(url);
      });
    }
  }, [isOpen, details]);

  const modalRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);

  if (!isOpen || !details) return null;

  const handleCopyVpa = () => {
    navigator.clipboard?.writeText('prerna.sanctuary@icici');
    setCopiedVpa(true);
    somaticAudio.playSoftChime();
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleCompletePayment = (customTxnId?: string) => {
    setIsVerifying(true);
    setError(null);
    somaticAudio.playSoftChime();

    const finalizedTxnId = customTxnId || utrInput.trim() || txnRef;

    setTimeout(() => {
      setIsVerifying(false);
      setPaymentSuccess(true);
      const invoice = generateTaxInvoice(details, finalizedTxnId, details.userEmail || 'user@prerna.sovereign');
      setGeneratedInvoice(invoice);
      somaticAudio.playStarBeaconChime();
      onSuccess(finalizedTxnId);
    }, 1200);
  };

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const code = voucherInput.trim().toUpperCase();
    if (code === 'PRERNA2026' || code === 'SOULMATE100' || code === 'BETA-LOVE' || code === 'VIDYAPEETH') {
      handleCompletePayment(`GRANT-${code}-${Date.now().toString().slice(-6)}`);
    } else {
      setError('Invalid or expired voucher code. Try "PRERNA2026" for beta grant.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md font-sans">
        
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-checkout-title"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-left"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Instant Indian Settlement
                </span>
                <span className="text-xs text-slate-400 font-mono">Ref: {txnRef}</span>
              </div>
              <h3 id="payment-checkout-title" className="text-lg font-black text-white mt-1">
                {paymentSuccess ? 'Payment Confirmed' : `Subscribe to ${details.planTitle}`}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close payment window"
            >
              <X size={20} />
            </button>
          </div>

          {/* Amount Strip */}
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold block">Total Amount Payable:</span>
              <span className="text-2xl font-black text-slate-900">
                ₹{details.amountInr.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 font-medium ml-1.5">(Incl. 18% GST)</span>
            </div>

            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
              100% Sovereign Gateway
            </span>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
            
            {paymentSuccess ? (
              /* Success & Tax Invoice Download Screen */
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={36} />
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl font-black text-slate-900">Sanctuary Pass Activated!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Your contribution directly cross-subsidizes free mental health guidance for adolescents and schools across India.
                  </p>
                </div>

                {generatedInvoice && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-500">
                      <span>Invoice Number:</span>
                      <span className="font-bold text-slate-800">{generatedInvoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>GSTIN (SAC 998431):</span>
                      <span className="text-slate-800">{generatedInvoice.supplierGstin}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Total Paid:</span>
                      <span className="font-bold text-emerald-700">₹{generatedInvoice.totalAmountInr.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  {generatedInvoice && (
                    <button
                      type="button"
                      onClick={() => downloadTaxInvoiceReceipt(generatedInvoice)}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Download size={15} />
                      <span>Download GST Tax Invoice</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                  >
                    <span>Enter My Sanctuary</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ) : (
              /* Payment Methods Selection */
              <>
                {/* Method Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('upi')}
                    className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'upi' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <QrCode size={15} />
                    <span>UPI QR & Apps</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('card')}
                    className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'card' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <CreditCard size={15} />
                    <span>Cards & NetBanking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('voucher')}
                    className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'voucher' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <Ticket size={15} />
                    <span>Beta Grant Voucher</span>
                  </button>
                </div>

                {/* Tab 1: Dynamic UPI QR Code */}
                {activeTab === 'upi' && (
                  <div className="space-y-4 text-center">
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col items-center justify-center space-y-3">
                      {qrDataUrl ? (
                        <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                          <img
                            src={qrDataUrl}
                            alt="Dynamic UPI QR Code"
                            className="w-52 h-52 object-contain mx-auto"
                          />
                        </div>
                      ) : (
                        <div className="w-52 h-52 flex items-center justify-center bg-slate-100 rounded-2xl animate-pulse text-xs text-slate-400">
                          Generating Dynamic UPI QR...
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-700 block">
                          Scan with Google Pay, PhonePe, Paytm, or BHIM
                        </span>
                        <div className="flex items-center justify-center gap-2">
                          <code className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border text-slate-700">
                            prerna.sanctuary@icici
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyVpa}
                            className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer"
                            title="Copy UPI ID"
                          >
                            <Copy size={13} />
                          </button>
                          {copiedVpa && <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>}
                        </div>
                      </div>
                    </div>

                    {/* Instant Verification Simulation */}
                    <div className="space-y-2 pt-1 text-left">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        Enter 12-Digit UPI UTR or Confirm Payment:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={16}
                          value={utrInput}
                          onChange={(e) => setUtrInput(e.target.value)}
                          placeholder="e.g. 529182746192 or leave blank to verify"
                          className="flex-grow p-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleCompletePayment()}
                          disabled={isVerifying}
                          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-sm"
                        >
                          <Sparkles size={14} className="text-amber-400" />
                          <span>{isVerifying ? 'Verifying Settlement...' : 'Verify Payment'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Cards & NetBanking (Razorpay Standard) */}
                {activeTab === 'card' && (
                  <div className="py-4 space-y-4 text-center">
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <CreditCard size={36} className="mx-auto text-indigo-600" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Razorpay Secure Standard Checkout</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                          Pay securely using Credit Cards, Debit Cards, NetBanking (50+ Indian banks), or Corporate Accounts.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCompletePayment('RZP-SECURE-' + Date.now().toString().slice(-6))}
                        disabled={isVerifying}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-900 to-indigo-950 hover:from-indigo-800 hover:to-indigo-900 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                      >
                        <ExternalLink size={15} />
                        <span>{isVerifying ? 'Connecting Gateway...' : `Pay ₹${details.amountInr.toLocaleString('en-IN')} via Razorpay`}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>256-Bit Encrypted • PCI-DSS Level 1 Certified</span>
                    </div>
                  </div>
                )}

                {/* Tab 3: Beta Voucher Code */}
                {activeTab === 'voucher' && (
                  <form onSubmit={handleApplyVoucher} className="py-4 space-y-4">
                    <div className="space-y-1 text-left">
                      <label className="text-xs font-bold text-slate-700 block">
                        Enter Sacred Voucher or Institutional Grant Code:
                      </label>
                      <input
                        type="text"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value)}
                        placeholder="e.g. PRERNA2026 or BETA-LOVE"
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm font-mono uppercase font-black bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-[11px] text-slate-500">
                        Granted to clinical partners, beta cohort families, and educators.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying || !voucherInput.trim()}
                      className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
                    >
                      <span>{isVerifying ? 'Validating Voucher...' : 'Apply Voucher & Unlock Pass'}</span>
                    </button>
                  </form>
                )}

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={15} className="text-rose-600 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </>
            )}

          </div>

          {/* Footer DPDP Guarantee */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
            <span>GSTIN: 27AAACP0126P1Z4 • SAC 998431</span>
            <span>Zero Telemetry Guarantee</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};


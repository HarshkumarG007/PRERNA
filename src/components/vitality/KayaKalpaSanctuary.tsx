import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, 
  Sun, 
  Droplets, 
  Activity, 
  Heart, 
  Clock, 
  Sparkles, 
  Bell, 
  BellOff, 
  CheckCircle2, 
  Footprints, 
  Bluetooth, 
  Volume2, 
  VolumeX, 
  TrendingUp, 
  BedDouble,
  Play,
  Square
} from 'lucide-react';
import { 
  useVitality, 
  useSleepSessions, 
  useMovementEntries, 
  useAppStore 
} from '../../store';
import { 
  calculateWakeTimesFromNow, 
  calculateBedtimesForWakeTarget, 
  evaluateAdolescentGrowth, 
  calculateHydrationProgress, 
  classifyRestingHeartRate, 
  formatTime12h 
} from '../../engine/vitality/vitalityEngine';
import { somaticAudio } from '../../utils/audioSynthesis';

export const KayaKalpaSanctuary: React.FC = () => {
  const vitality = useVitality();
  const sleepSessions = useSleepSessions();
  const movementEntries = useMovementEntries();
  const { 
    updateVitalityProfile, 
    logWaterGlass, 
    resetWaterToday, 
    logSleepSession, 
    deleteSleepSession, 
    logMovementEntry 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'sleep' | 'vitality' | 'movement'>('sleep');

  // --- Sleep & Alarm State ---
  const [calcMode, setCalcMode] = useState<'wakeNow' | 'targetWake'>('wakeNow');
  const [targetWakeHour, setTargetWakeHour] = useState<number>(6);
  const [targetWakeMinute, setTargetWakeMinute] = useState<number>(30);
  const [isLullabyPlaying, setIsLullabyPlaying] = useState<boolean>(false);
  const [lullabyTimer, setLullabyTimer] = useState<number>(30); // minutes
  const [nightModeActive, setNightModeActive] = useState<boolean>(false);
  const [nightClock, setNightClock] = useState<string>('');
  const [isAlarmActive, setIsAlarmActive] = useState<boolean>(false);
  const [alarmRinging, setAlarmRinging] = useState<boolean>(false);
  const [alarmTime, setAlarmTime] = useState<string>('06:30');
  const [sleepStartTime, setSleepStartTime] = useState<number | null>(null);
  const [showMorningModal, setShowMorningModal] = useState<boolean>(false);
  const [morningRating, setMorningRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [morningNotes, setMorningNotes] = useState<string>('');

  // --- Vitality Profile Form State ---
  const [heightInput, setHeightInput] = useState<string>(vitality.heightCm?.toString() || '162');
  const [weightInput, setWeightInput] = useState<string>(vitality.weightKg?.toString() || '52');
  const [profileSavedToast, setProfileSavedToast] = useState<boolean>(false);

  // --- Movement & Smartband State ---
  const [todaySteps, setTodaySteps] = useState<number>(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = movementEntries.find(m => m.date === today);
    return todayEntry ? todayEntry.steps : 4250;
  });
  const [bleDeviceName, setBleDeviceName] = useState<string | null>(null);
  const [bleHeartRate, setBleHeartRate] = useState<number | null>(null);
  const [bleConnecting, setBleConnecting] = useState<boolean>(false);
  const [bleError, setBleError] = useState<string | null>(null);

  // --- 60-Second Pulse Tap Meter ---
  const [pulseTaps, setPulseTaps] = useState<number[]>([]);
  const [pulseBpm, setPulseBpm] = useState<number | null>(null);

  // Real-time clock for Night Mode
  useEffect(() => {
    const updateTime = () => {
      setNightClock(formatTime12h(new Date()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Alarm clock checker
  useEffect(() => {
    if (!isAlarmActive) return;
    const checkAlarm = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      if (currentTimeStr === alarmTime && !alarmRinging) {
        setAlarmRinging(true);
        somaticAudio.playWakeUpAlarm();
      }
    };
    const timer = setInterval(checkAlarm, 5000);
    return () => clearInterval(timer);
  }, [isAlarmActive, alarmTime, alarmRinging]);

  // Handle Growth Assessment
  const currentHeight = parseFloat(heightInput) || 0;
  const currentWeight = parseFloat(weightInput) || 0;
  const growthResult = evaluateAdolescentGrowth(currentHeight, currentWeight);
  const hydration = calculateHydrationProgress(vitality.waterGlassesToday);

  // Calculate Sleep Options
  const wakeTimesFromNow = calculateWakeTimesFromNow();
  const bedtimesForTarget = calculateBedtimesForWakeTarget(targetWakeHour, targetWakeMinute);

  const handleSaveVitalityProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(heightInput);
    const w = parseFloat(weightInput);
    if (h > 50 && w > 20) {
      updateVitalityProfile({ heightCm: h, weightKg: w });
      setProfileSavedToast(true);
      setTimeout(() => setProfileSavedToast(false), 3000);
    }
  };

  // Toggle Lullaby Drone
  const toggleLullaby = () => {
    if (isLullabyPlaying) {
      somaticAudio.stopSleepLullabyDrone();
      setIsLullabyPlaying(false);
    } else {
      somaticAudio.startSleepLullabyDrone(lullabyTimer);
      setIsLullabyPlaying(true);
    }
  };

  // Start Night Mode
  const startNightMode = () => {
    setNightModeActive(true);
    setSleepStartTime(Date.now());
  };

  // Wake Up / Dismiss Alarm
  const handleWakeUp = () => {
    somaticAudio.stopWakeUpAlarm();
    setAlarmRinging(false);
    setIsAlarmActive(false);
    setNightModeActive(false);
    if (isLullabyPlaying) {
      somaticAudio.stopSleepLullabyDrone();
      setIsLullabyPlaying(false);
    }
    setShowMorningModal(true);
  };

  const handleSaveMorningSession = () => {
    const wake = Date.now();
    const start = sleepStartTime || (wake - 8 * 60 * 60 * 1000);
    const durationMinutes = Math.max(30, Math.round((wake - start) / (1000 * 60)));
    const cycles = Math.max(1, Math.floor(durationMinutes / 90));

    logSleepSession({
      bedtime: new Date(start).toISOString(),
      wakeTime: new Date(wake).toISOString(),
      durationMinutes,
      cyclesCompleted: cycles,
      qualityRating: morningRating,
      notes: morningNotes.trim() || undefined,
    });

    setShowMorningModal(false);
    setSleepStartTime(null);
    setMorningNotes('');
  };

  // BLE Smartwatch Pairing
  const connectBluetoothSmartband = async () => {
    setBleConnecting(true);
    setBleError(null);
    try {
      if (!('bluetooth' in navigator)) {
        throw new Error('Web Bluetooth is not supported on this browser. Try Google Chrome, Microsoft Edge, or desktop app.');
      }
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service']
      });

      setBleDeviceName(device.name || 'Smartband / BLE Fitness Watch');
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        let hr = 0;
        if (flags & 0x01) {
          hr = value.getUint16(1, true); // 16-bit
        } else {
          hr = value.getUint8(1); // 8-bit
        }
        setBleHeartRate(hr);
      });
    } catch (err: any) {
      console.warn('Bluetooth connection cancelled or failed:', err);
      setBleError(err.message || 'Bluetooth connection was cancelled.');
    } finally {
      setBleConnecting(false);
    }
  };

  // Pulse Tap Handler
  const handlePulseTap = () => {
    const now = Date.now();
    const newTaps = [...pulseTaps, now].slice(-12); // Keep last 12 taps
    setPulseTaps(newTaps);

    if (newTaps.length >= 4) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgMs > 300 && avgMs < 2000) {
        const computedBpm = Math.round(60000 / avgMs);
        setPulseBpm(computedBpm);
      }
    }
  };

  const handleAddSteps = (count: number) => {
    const newTotal = todaySteps + count;
    setTodaySteps(newTotal);
    const today = new Date().toISOString().split('T')[0];
    logMovementEntry({
      date: today,
      steps: newTotal,
      activeMinutes: Math.round(newTotal / 100),
      activityType: 'walk',
      heartRateBpm: bleHeartRate || pulseBpm || undefined,
      notes: 'Logged via Kaya Kalpa Movement Hub',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Sacred Kaya Kalpa Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 text-white p-6 md:p-8 shadow-xl border border-emerald-500/20 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide">
              <span>🌿</span>
              <span>काया कल्प • PHYSICAL VITALITY & CIRCADIAN SANCTUARY</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Nourish the Vessel of Consciousness</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              &quot;पहला सुख निरोगी काया&quot; — Natural 90-minute ultradian sleep rhythms, adolescent growth velocity, dynamic hydration, and safe movement tracking without restrictive numbers or body shaming.
            </p>
          </div>

          {/* Quick Vitality Metrics Snapshot */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 min-w-[120px]">
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Hydration</div>
              <div className="text-xl font-black text-sky-300 flex items-center gap-1.5 mt-0.5">
                <Droplets size={18} className="text-sky-400" />
                <span>{vitality.waterGlassesToday} / 8</span>
              </div>
              <div className="text-[10px] text-slate-400">{hydration.percentage}% of 2 Liters</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 min-w-[120px]">
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Today's Steps</div>
              <div className="text-xl font-black text-emerald-300 flex items-center gap-1.5 mt-0.5">
                <Footprints size={18} className="text-emerald-400" />
                <span>{todaySteps.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-slate-400">{Math.round((todaySteps / 8000) * 100)}% goal</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 min-w-[120px]">
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Last Sleep</div>
              <div className="text-xl font-black text-amber-300 flex items-center gap-1.5 mt-0.5">
                <Moon size={18} className="text-amber-400" />
                <span>
                  {sleepSessions.length > 0 
                    ? `${(sleepSessions[0].durationMinutes / 60).toFixed(1)}h`
                    : '7.5h'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                {sleepSessions.length > 0 ? `${sleepSessions[0].cyclesCompleted} cycles` : '5 cycles (Optimal)'}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-t border-white/10 pt-4 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('sleep')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sleep'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Moon size={16} />
            <span>Circadian Sleep Sanctuary (निद्रा योग)</span>
          </button>

          <button
            onClick={() => setActiveTab('vitality')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'vitality'
                ? 'bg-emerald-400 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Droplets size={16} />
            <span>Physical Vitality & Growth (काया स्वास्थ्य)</span>
          </button>

          <button
            onClick={() => setActiveTab('movement')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'movement'
                ? 'bg-sky-400 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity size={16} />
            <span>Movement & Smartband Sync (गति व स्पंदन)</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: CIRCADIAN SLEEP SANCTUARY & 90-MINUTE SMART ALARM */}
      {/* ============================================================ */}
      {activeTab === 'sleep' && (
        <div className="space-y-6">
          {/* Ultradian Cycle Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Clock size={20} className="text-indigo-600" />
                    <span>90-Minute Ultradian Sleep Calculator</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Waking at the completion of a 90-minute sleep cycle eliminates morning brain fog (sleep inertia).
                  </p>
                </div>

                <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-bold self-start sm:self-auto">
                  <button
                    onClick={() => setCalcMode('wakeNow')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      calcMode === 'wakeNow' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    If I Sleep Now
                  </button>
                  <button
                    onClick={() => setCalcMode('targetWake')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      calcMode === 'targetWake' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Target Wake Time
                  </button>
                </div>
              </div>

              {/* Calculator Output */}
              {calcMode === 'wakeNow' ? (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <span>🌙</span>
                    <span>If your head hits the pillow right now (accounting for 14m sleep onset):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {wakeTimesFromNow.map((item) => (
                      <div
                        key={item.cycles}
                        className={`p-4 rounded-2xl border transition-all ${
                          item.isRecommended
                            ? 'bg-indigo-50/80 border-indigo-200 ring-1 ring-indigo-300'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                            {item.cycles} Cycles
                          </span>
                          {item.isRecommended && (
                            <span className="text-[9px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                        <div className="text-2xl font-black text-slate-800 my-1">{item.wakeTime}</div>
                        <div className="text-xs text-slate-500 font-medium">{item.durationHours} hrs restful sleep</div>
                        <p className="text-[11px] text-slate-600 mt-2 leading-snug">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">Desired Wake Up Time:</span>
                    <input
                      type="time"
                      value={`${targetWakeHour.toString().padStart(2, '0')}:${targetWakeMinute.toString().padStart(2, '0')}`}
                      onChange={(e) => {
                        const [h, m] = e.target.value.split(':').map(Number);
                        setTargetWakeHour(h);
                        setTargetWakeMinute(m);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-indigo-200 font-black text-indigo-700 bg-indigo-50/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {bedtimesForTarget.map((item) => (
                      <div
                        key={item.cycles}
                        className={`p-4 rounded-2xl border transition-all ${
                          item.isRecommended
                            ? 'bg-emerald-50/80 border-emerald-200 ring-1 ring-emerald-300'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                            {item.cycles} Cycles
                          </span>
                          {item.isRecommended && (
                            <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded-full">
                              Sweet Spot
                            </span>
                          )}
                        </div>
                        <div className="text-2xl font-black text-slate-800 my-1">{item.bedtime}</div>
                        <div className="text-xs text-slate-500 font-medium">{item.durationHours} hrs total in bed</div>
                        <p className="text-[11px] text-slate-600 mt-2 leading-snug">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Offline 432 Hz Theta Lullaby Player */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {isLullabyPlaying ? <Volume2 size={20} className="animate-pulse" /> : <VolumeX size={20} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <span>432 Hz Offline Theta Sleep Lullaby</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-extrabold">Binaural 4Hz</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Pure mathematical tone synthesis tuned to 432 Hz carrier + 4 Hz Theta waves. Calms racing exam thoughts and induces natural drowsiness.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <select
                    value={lullabyTimer}
                    onChange={(e) => setLullabyTimer(Number(e.target.value))}
                    className="text-xs font-bold px-2.5 py-2 rounded-xl bg-white border border-amber-200 text-slate-700 focus:outline-none"
                    disabled={isLullabyPlaying}
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                  <button
                    onClick={toggleLullaby}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 ${
                      isLullabyPlaying
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold'
                    }`}
                  >
                    {isLullabyPlaying ? <Square size={14} /> : <Play size={14} />}
                    <span>{isLullabyPlaying ? 'Stop Drone' : 'Play Lullaby'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Alarm & Turn-In Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white border border-indigo-700/50 shadow-md space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                    <Bell size={16} />
                    <span>Smart Wake Alarm</span>
                  </div>
                  <span className="text-xs bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-400/30 font-semibold">
                    Tibetan Bowl Chime
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-black text-amber-300">{alarmTime}</div>
                  <p className="text-xs text-slate-300">
                    Gentle multi-stage singing bowl alarm that rises gracefully without abrupt stress.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={alarmTime}
                    onChange={(e) => setAlarmTime(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white font-black text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <button
                    onClick={() => setIsAlarmActive(!isAlarmActive)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isAlarmActive
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {isAlarmActive ? <Bell size={14} /> : <BellOff size={14} />}
                    <span>{isAlarmActive ? 'Alarm Armed' : 'Set Alarm'}</span>
                  </button>
                </div>
              </div>

              {/* Turn In Button */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <button
                  onClick={startNightMode}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-lg hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BedDouble size={18} />
                  <span>Turn In For The Night (Start Sleep)</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  Dims screen to sacred night mode and tracks duration automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Sleep Sessions History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Moon size={18} className="text-indigo-600" />
                <span>Recent Circadian Sleep Sessions</span>
              </h3>
              <span className="text-xs text-slate-500">100% Private & On-Device</span>
            </div>

            {sleepSessions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-xs">
                No sleep sessions logged yet. Tap &quot;Turn In For The Night&quot; to begin tracking your cycles!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sleepSessions.map((session) => (
                  <div key={session.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700">
                        {new Date(session.bedtime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 text-xs">
                        {'★'.repeat(session.qualityRating)}
                        <span className="text-slate-400 text-[10px]">({session.qualityRating}/5)</span>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-800">
                        {(session.durationMinutes / 60).toFixed(1)} hrs
                      </span>
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {session.cyclesCompleted} cycles
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      {new Date(session.bedtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} →{' '}
                      {new Date(session.wakeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {session.notes && (
                      <p className="text-xs text-slate-600 italic bg-white p-2 rounded-xl border border-slate-100">
                        &quot;{session.notes}&quot;
                      </p>
                    )}

                    <button
                      onClick={() => deleteSleepSession(session.id)}
                      className="text-[10px] text-slate-400 hover:text-red-500 transition-colors pt-1 cursor-pointer"
                    >
                      Delete entry
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: PHYSICAL VITALITY, GROWTH VELOCITY & HYDRATION */}
      {/* ============================================================ */}
      {activeTab === 'vitality' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Height & Weight Input Form */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-600" />
                  <span>Adolescent Growth Horizon</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Puberty involves dynamic skeletal and muscle expansion. Enter your metrics to view supportive developmental guidance.
                </p>
              </div>

              <form onSubmit={handleSaveVitalityProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Height (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="100"
                      max="220"
                      value={heightInput}
                      onChange={(e) => setHeightInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. 162"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="25"
                      max="150"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. 52"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Update Growth Metrics
                </button>

                {profileSavedToast && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-fade-in">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Metrics updated securely on device!</span>
                  </div>
                )}
              </form>

              {/* Evaluated Zone Card */}
              {growthResult.bmi > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                      {growthResult.hindiTitle}
                    </span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900">
                      BMI: {growthResult.bmi}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{growthResult.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{growthResult.tagline}</p>
                </div>
              )}
            </div>

            {/* Dynamic Hydration Tracker (अमृत जल) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <Droplets size={18} className="text-sky-600" />
                    <span>Dynamic Hydration (अमृत जल)</span>
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    2.0 L Goal
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Every glass sustains cognitive reaction speed, brain hydration, and kidney filtration.
                </p>

                {/* 8 Water Drops Visual */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {Array.from({ length: 8 }).map((_, idx) => {
                    const isFilled = idx < vitality.waterGlassesToday;
                    return (
                      <button
                        key={idx}
                        onClick={logWaterGlass}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isFilled
                            ? 'bg-sky-500 text-white border-sky-600 shadow-sm scale-102'
                            : 'bg-slate-50 hover:bg-sky-50 text-slate-400 border-slate-200'
                        }`}
                        title={`Glass ${idx + 1} (250 ml)`}
                      >
                        <Droplets size={20} className={isFilled ? 'text-white' : 'text-sky-400'} />
                        <span className="text-[10px] font-bold">250 ml</span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs font-medium text-slate-600 pt-1 text-center">
                  {hydration.statusText}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={logWaterGlass}
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Droplets size={14} />
                  <span>+ Drink 1 Glass (250ml)</span>
                </button>
                <button
                  onClick={resetWaterToday}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                  title="Reset counter for new day"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Ayurvedic Dinacharya Wisdom Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <span>🪷</span>
                <h4>Ayurvedic Dinacharya (दिनचर्या)</h4>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {growthResult.dinacharyaWisdom}
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/80">
                  <span className="font-bold text-amber-900 block">1. उषापान (Ushapan)</span>
                  <span className="text-slate-600">Drink 1–2 glasses warm water at sunrise to awaken digestion.</span>
                </div>
                <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/80">
                  <span className="font-bold text-amber-900 block">2. सूर्य प्रकाश (Morning Sunlight)</span>
                  <span className="text-slate-600">15 minutes natural morning sunlight resets melatonin clock.</span>
                </div>
                <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/80">
                  <span className="font-bold text-amber-900 block">3. संतुलित आहार (Solar Timing)</span>
                  <span className="text-slate-600">Hearty lunch when digestive fire is peak; light dinner before 8 PM.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supportive Adolescent Growth Guidance */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              <span>Evidence-Based Adolescent Nutrition Pillars</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {growthResult.growthAdvice.map((advice, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Pillar {i + 1}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{advice}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: MOVEMENT, STEPS & SMARTBAND SYNC (गति व स्पंदन) */}
      {/* ============================================================ */}
      {activeTab === 'movement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step Counter Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <Footprints size={18} className="text-emerald-600" />
                    <span>Daily Movement Steps</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">8,000 steps daily builds heart stamina & focus.</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Goal: 8k
                </span>
              </div>

              {/* Big Step Counter Display */}
              <div className="text-center py-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <div className="text-4xl font-black text-emerald-900">{todaySteps.toLocaleString()}</div>
                <div className="text-xs font-bold text-emerald-700 mt-1">
                  {Math.round((todaySteps / 8000) * 100)}% of Daily Benchmark
                </div>
                <div className="w-48 h-2 bg-emerald-200 rounded-full mx-auto mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, (todaySteps / 8000) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Quick Log Buttons */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700">Quick-Add Activity:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAddSteps(1000)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    + 1,000 (Walk)
                  </button>
                  <button
                    onClick={() => handleAddSteps(2500)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    + 2,500 (Sports)
                  </button>
                  <button
                    onClick={() => handleAddSteps(1500)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    + 1,500 (Cycling)
                  </button>
                  <button
                    onClick={() => handleAddSteps(3000)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    + 3,000 (Dance/Run)
                  </button>
                </div>
              </div>
            </div>

            {/* Smartband / BLE Sync Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Bluetooth size={18} className="text-indigo-600" />
                  <span>Smartband & BLE Watch Sync</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connect Noise, boAt, Xiaomi, Apple or any Bluetooth Smartwatch directly to your device.
                </p>
              </div>

              {bleDeviceName ? (
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900">{bleDeviceName}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                      Connected
                    </span>
                  </div>
                  {bleHeartRate && (
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-3xl font-black text-rose-600 flex items-center gap-1.5">
                        <Heart size={24} className="animate-pulse" />
                        {bleHeartRate}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">BPM Real-Time Pulse</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <p className="text-xs text-slate-600">
                    Pair your wearable to stream real-time Heart Rate (BPM) and Steps locally into your encrypted SQLite database. Zero cloud accounts required.
                  </p>
                  <button
                    onClick={connectBluetoothSmartband}
                    disabled={bleConnecting}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Bluetooth size={14} />
                    <span>{bleConnecting ? 'Scanning BLE Devices...' : 'Connect Bluetooth Smartwatch'}</span>
                  </button>
                </div>
              )}

              {bleError && (
                <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  {bleError}
                </p>
              )}
            </div>

            {/* Zero-Hardware Fallback: 60-Second Pulse Tap Meter */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Heart size={18} className="text-rose-600" />
                  <span>60-Second Pulse Tap Meter</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  No smartwatch? Place two fingers on your neck or wrist artery. Tap the heart orb in rhythm with each pulse!
                </p>
              </div>

              <div className="flex flex-col items-center justify-center py-4">
                <button
                  onClick={handlePulseTap}
                  className="w-24 h-24 rounded-full bg-rose-50 hover:bg-rose-100 active:scale-95 border-2 border-rose-300 flex items-center justify-center transition-all shadow-md cursor-pointer group"
                >
                  <Heart 
                    size={42} 
                    className="text-rose-500 group-hover:scale-110 group-active:scale-90 transition-transform" 
                  />
                </button>
                <span className="text-[11px] font-bold text-slate-500 mt-2">
                  {pulseTaps.length === 0 ? 'Tap here with your pulse' : `Taps recorded: ${pulseTaps.length}`}
                </span>
              </div>

              {pulseBpm && (
                <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-200 text-center space-y-1">
                  <div className="text-2xl font-black text-rose-700">{pulseBpm} BPM</div>
                  <div className="text-xs font-bold text-rose-900">
                    {classifyRestingHeartRate(pulseBpm).label}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {classifyRestingHeartRate(pulseBpm).description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* FULLSCREEN NIGHT SANCTUARY MODE */}
      {/* ============================================================ */}
      <AnimatePresence>
        {nightModeActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#020617] text-white flex flex-col justify-between p-6 md:p-12 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                <span>🌙</span>
                <span>PRERNA NIGHT SANCTUARY</span>
              </div>
              <button
                onClick={handleWakeUp}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
              >
                Exit Night Mode
              </button>
            </div>

            {/* Glowing Clock & Alarm Banner */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 my-auto">
              <div className="text-6xl md:text-8xl font-black tracking-tight text-slate-100">
                {nightClock}
              </div>
              <p className="text-slate-400 text-sm max-w-md">
                Rest peacefully. Your circadian rhythms are restoring prefrontal focus for tomorrow.
              </p>

              {isAlarmActive && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold">
                  <Bell size={14} className="text-amber-400" />
                  <span>Smart Wake Alarm set for {alarmTime}</span>
                </div>
              )}

              {alarmRinging && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1.05 }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="p-6 rounded-3xl bg-amber-500 text-slate-950 text-center space-y-3 shadow-2xl"
                >
                  <div className="text-xl font-black flex items-center justify-center gap-2">
                    <Sun size={24} />
                    <span>Good Morning! 90-Minute Cycle Complete</span>
                  </div>
                  <p className="text-xs font-medium">
                    Your brain is at the top of a restorative cycle. Take a deep breath and rise gently.
                  </p>
                  <button
                    onClick={handleWakeUp}
                    className="px-6 py-2.5 rounded-xl bg-slate-950 text-white font-black text-sm shadow-md hover:bg-slate-900 cursor-pointer"
                  >
                    Turn Off Alarm & Log Sleep
                  </button>
                </motion.div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4">
              <div className="text-xs text-slate-400">
                Offline 432 Hz Synthesizer · Zero Blue Light Stimulation
              </div>
              <button
                onClick={handleWakeUp}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-lg hover:from-emerald-400 hover:to-teal-400 transition-all cursor-pointer flex items-center gap-2"
              >
                <Sun size={16} />
                <span>Wake Up & Check In</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MORNING VITALITY CHECK-IN MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showMorningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-2xl flex-shrink-0">
                  🌅
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Good Morning! Sleep Cycle Logged</h3>
                  <p className="text-xs text-slate-500">How do your mind and body feel right now?</p>
                </div>
              </div>

              {/* Energy Rating Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Morning Energy Rating:</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: 1, label: 'Drained 🥱' },
                    { val: 2, label: 'Heavy ⛅' },
                    { val: 3, label: 'Fair 🌿' },
                    { val: 4, label: 'Good ✨' },
                    { val: 5, label: 'Radiant ⚡' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setMorningRating(opt.val as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                        morningRating === opt.val
                          ? 'bg-amber-400 text-slate-950 border-amber-500 font-black shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{'★'.repeat(opt.val)}</span>
                      <span className="text-[10px] mt-1">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Morning Reflection or Dreams (Optional):</label>
                <textarea
                  value={morningNotes}
                  onChange={(e) => setMorningNotes(e.target.value)}
                  placeholder="e.g. Woke up feeling clear-headed after math revision..."
                  className="w-full h-20 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleSaveMorningSession}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Save To Private Journal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Minor Repair Work Order Board - Aetra Air Tangerang
 */

export interface ComplaintItem {
  id: string;
  customer: string;
  phone: string;
  meterId: string;
  address: string;
  area: string;
  category: string;
  desc: string;
  officer: string;
  receivedAt: string;
  urgent: boolean;
  coords: string;
  status: string;
  rescheduledDate: string | null;
  photoBefore: string | null;
  photoAfter: string | null;
  createdAt?: string;
}

export function initMinorRepairApp(rootElement: HTMLElement) {
  const SUPABASE_URL =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_SUPABASE_URL) ||
    "https://bprmrbwmoadocyslhsqr.supabase.co";
  const SUPABASE_ANON_KEY =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_SUPABASE_ANON_KEY) ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcm1yYndtb2Fkb2N5c2xoc3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzODc4ODgsImV4cCI6MjEwNDk2Mzg4OH0.oaCUIBFy2ii_ZBrR-XMpuL-UsGvTaH2CGmTpncvf5K8";
  const TABLE = "complaints";
  const LOCAL_STORAGE_KEY = "aetra_work_orders_backup";

  // @ts-ignore
  const sb = (window as any).supabase
    ? // @ts-ignore
      (window as any).supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

  const OFFICE_COORDS = { lat: -6.2231, lng: 106.5134 };
  const OFFICERS = [
    "Budi Santoso",
    "Agus Setiawan",
    "Dedi Kurniawan",
    "Hendra Wijaya",
    "Eko Prasetyo",
  ];

  const OFFICER_COLORS: Record<
    string,
    { main: string; bg: string; border: string }
  > = {
    "Budi Santoso": { main: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    "Agus Setiawan": { main: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
    "Dedi Kurniawan": { main: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    "Hendra Wijaya": { main: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    "Eko Prasetyo": { main: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  };

  function getOfficerColor(officer: string) {
    return (
      OFFICER_COLORS[officer] || {
        main: "#4B5563",
        bg: "#F3F4F6",
        border: "#E5E7EB",
      }
    );
  }

  const CATEGORIES = [
    { key: "BPPD", label: "Biaya Penambahan Pipa Dinas", opRisk: 1, custImpact: 1, keywords: ["biaya", "pipa dinas"] },
    { key: "BPPDIND", label: "Biaya Penambahan Pipa Dinas Industri", opRisk: 2, custImpact: 2, keywords: ["pipa dinas industri"] },
    { key: "INFO-PLG", label: "Info ke Pelanggan", opRisk: 1, custImpact: 1, keywords: ["info", "informasi"] },
    { key: "KATM", label: "Air Tidak Mengalir Domestic", opRisk: 3, custImpact: 3, keywords: ["tidak mengalir", "air mati", "mati", "tidak keluar", "kering"] },
    { key: "KATMIND", label: "Air Tidak Mengalir Industri", opRisk: 3, custImpact: 3, keywords: ["air mati industri", "tidak mengalir industri"] },
    { key: "KATR", label: "Air Kotor Domestic", opRisk: 2, custImpact: 3, keywords: ["kotor", "keruh", "berbau", "hitam", "kuning"] },
    { key: "KATRIND", label: "Air Kotor Industri", opRisk: 3, custImpact: 3, keywords: ["kotor industri", "keruh industri"] },
    { key: "KBBP", label: "Sudah Bayar Belum Pasang Meter", opRisk: 2, custImpact: 3, keywords: ["belum pasang meter", "sudah bayar"] },
    { key: "KBGL", label: "Bekas Galian", opRisk: 1, custImpact: 2, keywords: ["galian", "bekas galian"] },
    { key: "KBSM", label: "Bocor Sebelum Meter", opRisk: 3, custImpact: 3, keywords: ["bocor sebelum meter", "bocor sebelum", "pipa bocor", "bocor deras"] },
    { key: "KBSMIND", label: "Bocor Sebelum Meter Industri", opRisk: 3, custImpact: 3, keywords: ["bocor sebelum meter industri"] },
    { key: "KBTR", label: "Belum Menerima Tagihan", opRisk: 1, custImpact: 2, keywords: ["belum menerima tagihan", "tagihan belum ada"] },
    { key: "KBTT", label: "Sudah Bayar Tapi di Tagih", opRisk: 2, custImpact: 3, keywords: ["sudah bayar tapi ditagih", "ditagih lagi"] },
    { key: "KILL", label: "Illegal Consumption", opRisk: 3, custImpact: 2, keywords: ["illegal", "pencurian air", "ilegal"] },
    { key: "KKMR", label: "Kran Meter Rusak", opRisk: 2, custImpact: 2, keywords: ["kran rusak", "kran patah"] },
    { key: "KKMRIND", label: "Kran Meter Rusak Industri", opRisk: 3, custImpact: 2, keywords: ["kran rusak industri"] },
    { key: "KLBC", label: "Pipa Jaringan Bocor", opRisk: 3, custImpact: 3, keywords: ["pipa jaringan bocor", "bocor jalan"] },
    { key: "KMAL", label: "Meter Air Lepas", opRisk: 2, custImpact: 2, keywords: ["meter lepas", "meter air lepas"] },
    { key: "KMALIND", label: "Meter Air Lepas Industri", opRisk: 3, custImpact: 3, keywords: ["meter lepas industri"] },
    { key: "KMDT", label: "Meter Dipasang Terbalik", opRisk: 2, custImpact: 2, keywords: ["meter terbalik", "dipasang terbalik"] },
    { key: "KMTA", label: "Meter Tidak Ada", opRisk: 2, custImpact: 2, keywords: ["meter tidak ada", "meter hilang"] },
    { key: "KPAP", label: "Perubahan Alamat Premise", opRisk: 1, custImpact: 1, keywords: ["perubahan alamat premise"] },
    { key: "KPAT", label: "Perubahan Alamat Billing", opRisk: 1, custImpact: 1, keywords: ["perubahan alamat billing"] },
    { key: "KPCT", label: "Pengajuan Cicilan Tagihan", opRisk: 1, custImpact: 2, keywords: ["cicilan", "pengajuan cicilan"] },
    { key: "KPDB", label: "Double Bayar", opRisk: 2, custImpact: 2, keywords: ["double bayar", "bayar dua kali"] },
    { key: "KPGP", label: "Permintaan Balik Nama", opRisk: 1, custImpact: 1, keywords: ["balik nama"] },
    { key: "KPKT", label: "Penyambungan Kembali Akibat Tunggakkan", opRisk: 2, custImpact: 2, keywords: ["penyambungan kembali", "tunggakan"] },
    { key: "KPMR", label: "Meter Rusak", opRisk: 2, custImpact: 2, keywords: ["meter rusak", "meter mati", "angka tidak jalan"] },
    { key: "KPMRIND", label: "Meter Rusak Industri", opRisk: 3, custImpact: 3, keywords: ["meter rusak industri"] },
    { key: "KPPA", label: "Revisi Nama", opRisk: 1, custImpact: 1, keywords: ["revisi nama"] },
    { key: "KPPM", label: "Perilaku Pembaca Meter", opRisk: 1, custImpact: 2, keywords: ["pembaca meter", "petugas catat"] },
    { key: "KPPR", label: "Pipa Dinas Rusak", opRisk: 3, custImpact: 3, keywords: ["pipa dinas rusak"] },
    { key: "KPPS", label: "Permintaan Pemutusan Sambungan", opRisk: 1, custImpact: 1, keywords: ["pemutusan sambungan", "putus air"] },
    { key: "KPPSIND", label: "Permintaan Pemutusan Sambungan Industri", opRisk: 2, custImpact: 2, keywords: ["pemutusan industri"] },
    { key: "KPSB", label: "Salah Bayar", opRisk: 2, custImpact: 2, keywords: ["salah bayar"] },
    { key: "KPSM", label: "Petugas Penyegelan", opRisk: 1, custImpact: 2, keywords: ["segel", "petugas penyegelan"] },
    { key: "KRMT", label: "Permintaan Relokasi Meter (teknis)", opRisk: 2, custImpact: 1, keywords: ["relokasi meter", "pindah meter teknis"] },
    { key: "KRPR", label: "Rekening Pembayaran Rendah", opRisk: 1, custImpact: 1, keywords: ["rekening rendah", "tagihan rendah"] },
    { key: "KRPT", label: "Rekening Pembayaran Tinggi", opRisk: 2, custImpact: 3, keywords: ["rekening tinggi", "tagihan melonjak", "tagihan mahal"] },
    { key: "KSPM", label: "Meter Tertukar", opRisk: 2, custImpact: 2, keywords: ["meter tertukar"] },
    { key: "KTST", label: "Tidak Sesuai Tarif", opRisk: 1, custImpact: 2, keywords: ["tidak sesuai tarif"] },
    { key: "KTST-RC", label: "Tidak Sesuai Tarif - Re Class", opRisk: 1, custImpact: 2, keywords: ["re class", "reclass tarif"] },
    { key: "LAPUL", label: "Lapor Ulang", opRisk: 2, custImpact: 2, keywords: ["lapor ulang", "komplain ulang"] },
    { key: "PPMI", label: "Permintaan Penyesuaian Meter Industri", opRisk: 2, custImpact: 2, keywords: ["penyesuaian meter industri"] },
    { key: "TERAREQ", label: "Tera Meter Request", opRisk: 2, custImpact: 2, keywords: ["tera meter", "uji tera"] },
    { key: "TRO9", label: "Pindah Meter", opRisk: 2, custImpact: 1, keywords: ["pindah meter"] },
    { key: "TRO9IND", label: "Pindah Meter Industri", opRisk: 2, custImpact: 2, keywords: ["pindah meter industri"] },
  ];

  const SLA_DAYS = 14;
  let MAX_PER_DAY = 10;

  let complaints: ComplaintItem[] = [];
  let searchQuery = "";
  let quickFilter = "semua";
  let sortMode = "prioritas";
  let categoryFilter = "semua";
  let officerFilter = "semua";
  let areaFilter = "semua";
  let isDarkMode = false;
  let activeMaps: Record<string, any> = {};
  let fleetMapObj: any = null;
  let donutChartObj: any = null;

  // Workspace Tabs & Navigation
  let currentTab: "board" | "map" | "analytics" | "calendar" | "mobile" = "board";

  // Mobile Officer Companion State
  let selectedMobileOfficer: string = OFFICERS[0];
  let mobileAppSubTab: "tasks" | "route" | "workload" | "profile" = "tasks";
  let mobileFilterStatus: "all" | "urgent" | "proses" | "selesai" = "all";
  let mobileDeviceMode: "phone" | "fullscreen" = "phone";
  let mobileLastSyncTime: string = "Baru saja";
  let mobileGuideOpen: boolean = false;

  if (
    typeof window !== "undefined" &&
    (window.location.hash === "#mobile" ||
      window.location.search.includes("mode=mobile"))
  ) {
    currentTab = "mobile";
  }

  // Batch Selection
  let selectedTicketIds: Set<string> = new Set();

  // Work Order Detail Modal
  let detailModalOpen = false;
  let detailTargetId: string | null = null;

  // Printable SPK Modal
  let spkModalOpen = false;
  let spkTicketIds: string[] = [];

  // Route Planning & Optimization in Map Tab
  let routeSelectedOfficer = "semua";
  let routeOptimizedOrder: string[] = [];
  let routeMapTabObj: any = null;
  let dailyRouteModalOfficer: string | null = null;
  let officerOptimizedOrders: Record<string, string[]> = {};
  let lastRouteGeneratedTimestamp: string | null = null;

  // Lifecycle guards & timers
  let isDisposed = false;
  let renderTimer: any = null;

  // Live Digital Clock & Sync state
  let currentTimeString = "";
  let clockInterval: any = null;
  let isSyncing = false;
  let syncStatus: "synced" | "syncing" = "synced";
  let lastSyncTime = new Date();

  const KNOWN_AREAS = [
    "Cikupa",
    "Balaraja",
    "Pasar Kemis",
    "Sepatan",
    "Tigaraksa",
    "Panongan",
    "Rajeg",
    "Curug",
    "Legok",
    "Kronjo",
    "Kresek",
  ];

  function calcDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  const AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
    Cikupa: { lat: -6.2285, lng: 106.518 },
    Balaraja: { lat: -6.2045, lng: 106.462 },
    "Pasar Kemis": { lat: -6.175, lng: 106.538 },
    Sepatan: { lat: -6.123, lng: 106.572 },
    Tigaraksa: { lat: -6.261, lng: 106.485 },
    Panongan: { lat: -6.252, lng: 106.521 },
    Rajeg: { lat: -6.148, lng: 106.505 },
    Curug: { lat: -6.241, lng: 106.554 },
    Legok: { lat: -6.282, lng: 106.591 },
    Kronjo: { lat: -6.085, lng: 106.412 },
    Kresek: { lat: -6.128, lng: 106.398 },
    Mauk: { lat: -6.061, lng: 106.517 },
    Teluknaga: { lat: -6.101, lng: 106.638 },
    Kosambi: { lat: -6.091, lng: 106.682 },
    Pakuhaji: { lat: -6.072, lng: 106.592 },
    Sukadiri: { lat: -6.098, lng: 106.552 },
    Kemiri: { lat: -6.095, lng: 106.462 },
    Jayanti: { lat: -6.195, lng: 106.415 },
    Sukamulya: { lat: -6.187, lng: 106.452 },
    "Sindang Jaya": { lat: -6.183, lng: 106.501 },
    Solear: { lat: -6.289, lng: 106.438 },
    Cisoka: { lat: -6.27, lng: 106.442 },
  };

  function getCoordsForTicket(item: ComplaintItem): { lat: number; lng: number } {
    const parsed = parseCoords(item.coords);
    if (parsed) return parsed;
    if (item.area && AREA_COORDINATES[item.area]) {
      return AREA_COORDINATES[item.area];
    }
    return OFFICE_COORDS;
  }

  // PROACTIVE SLA MONITORING & AUTO-REASSIGNMENT STATE
  let urgentSlaHoursLimit = 24; // Standar penanganan darurat air (24 jam)
  let proactiveAlertDismissedMap: Record<string, boolean> = {};
  let slaRadarModalOpen = false;
  let slaRadarTargetTicketId: string | null = null;
  let slaRadarMapObj: any = null;
  let soundAlertEnabled = true;
  let lastAlertAudiblePlayedTimestamp = 0;

  function playProactiveAlertChime() {
    if (!soundAlertEnabled) return;
    const now = Date.now();
    // Batasi suara berbunyi maksimal 1 kali per 30 detik agar tidak mengganggu
    if (now - lastAlertAudiblePlayedTimestamp < 30000) return;
    lastAlertAudiblePlayedTimestamp = now;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      // Dual-tone harmonic chime
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.debug("Chime audio inactive:", e);
    }
  }

  function isHighPriorityComplaint(c: ComplaintItem): boolean {
    if (c.urgent) return true;
    const cInfo = catInfo(c.category);
    if (cInfo && (cInfo.opRisk >= 3 || cInfo.custImpact >= 3)) return true;
    const metrics = computeUrgencyMetrics(c);
    if (metrics.level === "tinggi") return true;
    return false;
  }

  interface TechnicianCandidate {
    officer: string;
    distanceKm: number;
    estTravelMin: number;
    activeCount: number;
    urgentCount: number;
    locationName: string;
    locationCoords: { lat: number; lng: number };
    suitabilityScore: number;
    statusBadge: "available" | "busy" | "overload";
    statusText: string;
    color: { main: string; bg: string; border: string };
    isCurrent: boolean;
  }

  function getClosestAvailableTechnicianSuggestion(ticket: ComplaintItem) {
    const ticketCoords = getCoordsForTicket(ticket);
    const candidates: TechnicianCandidate[] = [];

    for (const officer of OFFICERS) {
      const isCurrent = ticket.officer === officer;
      const officerTickets = complaints.filter(
        (c) => c.officer === officer && c.status !== "selesai" && c.id !== ticket.id
      );
      const activeCount = officerTickets.length;
      const urgentCount = officerTickets.filter((c) => c.urgent).length;

      // Tentukan posisi operasional saat ini / terdekat dari petugas
      let bestLoc = OFFICE_COORDS;
      let locName = "Kantor Operasional Cikupa (Pangkalan Standby)";
      let minDist = calcDistanceKm(
        ticketCoords.lat,
        ticketCoords.lng,
        OFFICE_COORDS.lat,
        OFFICE_COORDS.lng
      );

      // Cari titik pekerjaan aktif terdekat dari petugas hari ini
      for (const ot of officerTickets) {
        const otCoords = getCoordsForTicket(ot);
        const d = calcDistanceKm(
          ticketCoords.lat,
          ticketCoords.lng,
          otCoords.lat,
          otCoords.lng
        );
        if (d < minDist) {
          minDist = d;
          bestLoc = otCoords;
          locName = `${ot.area || "Area"} (${ot.address.slice(0, 26)}...)`;
        }
      }

      const estTravelMin = Math.max(Math.round(minDist * 3.2 + 5), 5);

      // Status Kapasitas
      let statusBadge: "available" | "busy" | "overload" = "available";
      let statusText = "Tersedia & Siap Alih Tugas";
      if (activeCount >= 5) {
        statusBadge = "overload";
        statusText = "Kapasitas Penuh (Beban Tinggi)";
      } else if (activeCount >= 3) {
        statusBadge = "busy";
        statusText = "Sedang Bertugas (Kapasitas Cukup)";
      }

      // Skor kesesuaian: semakin kecil semakin ideal (jarak dekat + beban sedikit)
      const currentOfficerPenalty = isCurrent ? 60 : 0;
      const score =
        minDist * 1.8 +
        activeCount * 2.2 +
        urgentCount * 3.5 +
        currentOfficerPenalty;

      candidates.push({
        officer,
        distanceKm: minDist,
        estTravelMin,
        activeCount,
        urgentCount,
        locationName: locName,
        locationCoords: bestLoc,
        suitabilityScore: score,
        statusBadge,
        statusText,
        color: getOfficerColor(officer),
        isCurrent,
      });
    }

    // Urutkan alternatif (kecuali petugas yang sedang memegang tiket ini jika ada kandidat lain)
    const alternativeCandidates = candidates.filter((c) => !c.isCurrent);
    const sortedAlternatives = (
      alternativeCandidates.length > 0 ? alternativeCandidates : candidates
    )
      .slice()
      .sort((a, b) => a.suitabilityScore - b.suitabilityScore);

    const best = sortedAlternatives[0];
    const currentOfficerData = candidates.find((c) => c.isCurrent);

    const reason = best
      ? `Jarak terdekat (~${best.distanceKm} km dari ${best.locationName}) dengan beban ${best.activeCount} tugas aktif${
          currentOfficerData
            ? ` (vs ${currentOfficerData.officer}: ${currentOfficerData.activeCount} tugas aktif)`
            : ""
        }`
      : "Petugas standby di pangkalan operasional Cikupa";

    return {
      bestCandidate: best,
      allCandidates: candidates.sort((a, b) => a.suitabilityScore - b.suitabilityScore),
      currentOfficerData,
      reason,
      ticketCoords,
    };
  }

  function getHighPrioritySlaBreaches() {
    const now = Date.now();
    const breaches: {
      ticket: ComplaintItem;
      targetHours: number;
      elapsedHours: number;
      overdueHours: number;
      suggestion: ReturnType<typeof getClosestAvailableTechnicianSuggestion>;
      is14DayOverdue: boolean;
    }[] = [];

    for (const c of complaints) {
      if (c.status === "selesai") continue;
      if (!isHighPriorityComplaint(c)) continue;

      const startMs = new Date(c.receivedAt).getTime();
      const elapsedMs = now - startMs;
      const elapsedHours = Math.round(elapsedMs / (1000 * 3600));

      // Cek SLA 14 hari standar
      const deadline14 = getDeadlineInfo(c);
      const is14DayOverdue = deadline14.isOverdue;

      // Cek Batas Waktu SLA Prioritas Tinggi / Darurat (default 24 jam)
      const targetHours = c.urgent ? urgentSlaHoursLimit : urgentSlaHoursLimit * 2;
      const targetMs = targetHours * 3600 * 1000;
      const isUrgentOverdue = elapsedMs > targetMs;

      if (isUrgentOverdue || is14DayOverdue) {
        const overdueMs = Math.max(elapsedMs - targetMs, 0);
        const overdueHours = Math.max(Math.round(overdueMs / (1000 * 3600)), 1);
        const suggestion = getClosestAvailableTechnicianSuggestion(c);

        breaches.push({
          ticket: c,
          targetHours,
          elapsedHours,
          overdueHours,
          suggestion,
          is14DayOverdue,
        });
      }
    }

    // Urutkan dari yang paling darurat dan paling lama terlambat
    breaches.sort((a, b) => b.overdueHours - a.overdueHours);
    return breaches;
  }

  async function executeAutoReassignment(
    ticketId: string,
    targetOfficer: string,
    reasonSummary: string
  ) {
    const target = complaints.find((c) => c.id === ticketId);
    if (!target) return;

    const oldOfficer = target.officer || "Belum Ditugaskan";
    target.officer = targetOfficer;

    const nowIso = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const auditNote = `[AUTO-REASSIGN SLA ${nowIso}: dialihkan dari ${oldOfficer} ke ${targetOfficer} (${reasonSummary})]`;
    if (!target.desc.includes("[AUTO-REASSIGN SLA")) {
      target.desc += ` ${auditNote}`;
    }

    saveLocal();
    render();

    const fullDesc = buildFullDescription(
      target.desc,
      target.address,
      target.phone,
      target.rescheduledDate,
      target.officer,
      target.photoBefore,
      target.photoAfter
    );

    try {
      if (sb) {
        await sb.from(TABLE).update({ description: fullDesc }).eq("id", ticketId);
      }
    } catch (err) {
      console.error("Gagal update cloud reassignment:", err);
    }

    // @ts-ignore
    if ((window as any).Swal) {
      // @ts-ignore
      (window as any).Swal.fire({
        icon: "success",
        title: "⚡ Pengalihan Otomatis Berhasil!",
        html: `
          <div style="text-align:left; font-size:12.5px; line-height:1.6; color:#334155;">
            <p>Work Order <b>${target.id}</b> telah dialihkan ke teknisi terdekat:</p>
            <div style="background:#F0FDF4; border:1px solid #86EFAC; border-radius:8px; padding:10px; margin:8px 0;">
              <b style="color:#166534; font-size:13.5px;">👷 ${targetOfficer}</b><br/>
              <span style="font-size:11.5px; color:#15803D;">${reasonSummary}</span>
            </div>
            <p style="font-size:11px; color:#64748B; margin-top:6px;">
              Notifikasi pembaruan rute penugasan diteruskan ke armada dan lembar kerja SPK.
            </p>
          </div>
        `,
        confirmButtonText: "Selesai",
        confirmButtonColor: "#0284C7",
        timer: 3500,
      });
    }
  }

  async function executeAutoReassignAll(
    breaches: ReturnType<typeof getHighPrioritySlaBreaches>
  ) {
    if (breaches.length === 0) return;

    let reassignCount = 0;
    const summaryList: string[] = [];

    for (const b of breaches) {
      const ticket = b.ticket;
      const targetOfficer = b.suggestion.bestCandidate.officer;
      const oldOfficer = ticket.officer || "Belum Ditugaskan";
      ticket.officer = targetOfficer;

      const nowIso = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const auditNote = `[AUTO-REASSIGN SLA ${nowIso}: dari ${oldOfficer} ke ${targetOfficer} (${b.suggestion.reason})]`;
      if (!ticket.desc.includes("[AUTO-REASSIGN SLA")) {
        ticket.desc += ` ${auditNote}`;
      }

      summaryList.push(
        `• <b>${ticket.id}</b>: ${oldOfficer} ➔ <b>${targetOfficer}</b> (~${b.suggestion.bestCandidate.distanceKm} km)`
      );
      reassignCount++;

      const fullDesc = buildFullDescription(
        ticket.desc,
        ticket.address,
        ticket.phone,
        ticket.rescheduledDate,
        ticket.officer,
        ticket.photoBefore,
        ticket.photoAfter
      );

      try {
        if (sb) {
          await sb.from(TABLE).update({ description: fullDesc }).eq("id", ticket.id);
        }
      } catch (e) {
        console.error("Gagal update batch reassignment:", e);
      }
    }

    saveLocal();
    render();

    // @ts-ignore
    if ((window as any).Swal) {
      // @ts-ignore
      (window as any).Swal.fire({
        icon: "success",
        title: "⚡ Pengalihan Massal Selesai!",
        html: `
          <div style="text-align:left; font-size:12.5px; line-height:1.6; color:#334155;">
            <p>Berhasil mengalihkan <b>${reassignCount}</b> Work Order prioritas tinggi yang melewati batas SLA ke teknisi terdekat yang tersedia:</p>
            <div style="background:#F0FDF4; border:1px solid #86EFAC; border-radius:8px; padding:10px; margin:8px 0; font-size:12px;">
              ${summaryList.join("<br/>")}
            </div>
            <p style="font-size:11px; color:#64748B;">Rute harian dan jadwal penugasan armada telah disinkronkan.</p>
          </div>
        `,
        confirmButtonText: "Selesai",
        confirmButtonColor: "#0284C7",
      });
    }
  }

  function triggerSlaSimulation() {
    const urgentActive = complaints.find(
      (c) =>
        c.status !== "selesai" &&
        c.urgent &&
        !getHighPrioritySlaBreaches().some((b) => b.ticket.id === c.id)
    );

    if (urgentActive) {
      urgentActive.receivedAt = new Date(
        Date.now() - 32 * 3600 * 1000
      ).toISOString();
      saveLocal();
      render();
      // @ts-ignore
      if ((window as any).Swal) {
        // @ts-ignore
        (window as any).Swal.fire({
          icon: "info",
          title: "🧪 Simulasi SLA Diaktifkan",
          text: `Tiket ${urgentActive.id} (${urgentActive.customer}) disimulasikan telah melewati batas SLA (+8 jam overdue). Sistem proaktif menampilkan peringatan dan saran teknisi terdekat.`,
          timer: 2500,
          showConfirmButton: false,
        });
      }
    } else {
      const simId = `WO-SIM-${Math.floor(100 + Math.random() * 900)}`;
      const simTicket: ComplaintItem = {
        id: simId,
        customer: "PT Surya Cemerlang Indah (Simulasi)",
        phone: "081387654321",
        meterId: "MTR-SIM-882",
        address: "Kawasan Industri Balaraja Blok C3, Balaraja",
        area: "Balaraja",
        category: "KATMIND",
        desc: "Tekanan air industri drop total, memerlukan penanganan mendesak [Simulasi Darurat SLA]",
        officer: "Agus Setiawan",
        receivedAt: new Date(Date.now() - 34 * 3600 * 1000).toISOString(),
        urgent: true,
        coords: "-6.2045, 106.4620",
        status: "proses",
        rescheduledDate: null,
        photoBefore: null,
        photoAfter: null,
      };
      complaints.unshift(simTicket);
      saveLocal();
      render();
      // @ts-ignore
      if ((window as any).Swal) {
        // @ts-ignore
        (window as any).Swal.fire({
          icon: "warning",
          title: "🚨 Kasus Simulasi Ditambahkan",
          text: `Kasus darurat baru ${simId} ditambahkan (34 jam lalu). Sistem proaktif mendeteksi batas SLA terlampaui dan menyarankan teknisi terdekat.`,
          timer: 2500,
          showConfirmButton: false,
        });
      }
    }
  }

  function updateLiveClock() {
    const now = new Date();
    currentTimeString = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) + " WIB";
  }
  updateLiveClock();
  clockInterval = setInterval(() => {
    if (isDisposed) return;
    updateLiveClock();
    const badges = document.querySelectorAll(".live-clock-badge");
    badges.forEach((b) => {
      b.textContent = `🕒 ${currentTimeString}`;
    });
    const nowSec = new Date().getSeconds();
    if (nowSec % 30 === 0) {
      const breaches = getHighPrioritySlaBreaches();
      if (breaches.length > 0 && soundAlertEnabled) {
        playProactiveAlertChime();
      }
    }
  }, 1000);

  let selectedDate: Date | null = null;
  let viewMonth = new Date();
  let formOpen = false;
  let slaBannerCollapsed = false;
  let slaBannerDismissed = false;
  let emailModalOpen = false;
  let historyModalOpen = false;
  let finishModalOpen = false;
  let finishTargetId: string | null = null;
  let historySearchTerm = "";
  let editingId: string | null = null;

  const UNASSIGNED_ORDER_KEY = "aetra_unassigned_priority_order";
  let unassignedOrderIds: string[] = [];
  let draggedTicketId: string | null = null;

  // HELPER LOCAL STORAGE AGAR WORK ORDER & URUTAN PRIORITAS DISPATCHER TIDAK HILANG
  function saveLocal() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(complaints));
      localStorage.setItem(
        UNASSIGNED_ORDER_KEY,
        JSON.stringify(unassignedOrderIds)
      );
    } catch (e) {
      console.error("Gagal simpan lokal:", e);
    }
  }

  function loadLocal(): ComplaintItem[] {
    try {
      const orderData = localStorage.getItem(UNASSIGNED_ORDER_KEY);
      if (orderData) {
        try {
          unassignedOrderIds = JSON.parse(orderData);
        } catch (e) {
          unassignedOrderIds = [];
        }
      }
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function getUnassignedList(): ComplaintItem[] {
    const list = complaints.filter(
      (c) => (!c.officer || c.officer.trim() === "") && c.status !== "selesai"
    );

    list.sort((a, b) => {
      const idxA = unassignedOrderIds.indexOf(a.id);
      const idxB = unassignedOrderIds.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;

      // Fallback: urgent priority, then SLA urgency metrics, then received date
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      const scoreDiff =
        computeUrgencyMetrics(b).score - computeUrgencyMetrics(a).score;
      if (Math.abs(scoreDiff) > 0.05) return scoreDiff;
      return (
        new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
      );
    });

    return list;
  }

  function getUnassignedRank(id: string): number {
    const list = getUnassignedList();
    const idx = list.findIndex((c) => c.id === id);
    return idx !== -1 ? idx + 1 : 999;
  }

  function reorderUnassigned(
    fromId: string,
    toId: string,
    place: "before" | "after" = "before"
  ) {
    if (fromId === toId) return;
    const currentList = getUnassignedList().map((c) => c.id);
    const fromIdx = currentList.indexOf(fromId);
    if (fromIdx === -1) return;
    currentList.splice(fromIdx, 1);

    let toIdx = currentList.indexOf(toId);
    if (toIdx === -1) {
      currentList.push(fromId);
    } else {
      if (place === "after") toIdx++;
      currentList.splice(toIdx, 0, fromId);
    }

    unassignedOrderIds = currentList;
    saveLocal();
    render();

    const targetRank = getUnassignedRank(fromId);
    // @ts-ignore
    if ((window as any).Swal) {
      // @ts-ignore
      (window as any).Swal.fire({
        icon: "success",
        title: "Prioritas Diperbarui",
        text: `WO ${fromId} digeser ke urutan #${targetRank}`,
        timer: 1000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    }
  }

  function moveUnassignedItem(
    id: string,
    action: "top" | "up" | "down" | "bottom"
  ) {
    const currentList = getUnassignedList().map((c) => c.id);
    const idx = currentList.indexOf(id);
    if (idx === -1) return;

    if (action === "top") {
      currentList.splice(idx, 1);
      currentList.unshift(id);
    } else if (action === "bottom") {
      currentList.splice(idx, 1);
      currentList.push(id);
    } else if (action === "up") {
      if (idx > 0) {
        const temp = currentList[idx - 1];
        currentList[idx - 1] = currentList[idx];
        currentList[idx] = temp;
      }
    } else if (action === "down") {
      if (idx < currentList.length - 1) {
        const temp = currentList[idx + 1];
        currentList[idx + 1] = currentList[idx];
        currentList[idx] = temp;
      }
    }

    unassignedOrderIds = currentList;
    saveLocal();
    render();

    const targetRank = getUnassignedRank(id);
    // @ts-ignore
    if ((window as any).Swal) {
      // @ts-ignore
      (window as any).Swal.fire({
        icon: "success",
        title: "Prioritas Berubah",
        text: `WO ${id} kini berada di Urutan Prioritas #${targetRank}`,
        timer: 900,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    }
  }

  function prioritizeAllUrgentUnassigned() {
    const list = getUnassignedList();
    list.sort((a, b) => {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      const diff =
        computeUrgencyMetrics(b).score - computeUrgencyMetrics(a).score;
      if (Math.abs(diff) > 0.05) return diff;
      return (
        new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
      );
    });
    unassignedOrderIds = list.map((c) => c.id);
    saveLocal();
    render();

    // @ts-ignore
    if ((window as any).Swal) {
      // @ts-ignore
      (window as any).Swal.fire({
        icon: "success",
        title: "Prioritas Kritis Diurutkan",
        text: "Semua perbaikan mendesak & berisiko tinggi dipindahkan ke antrean teratas!",
        timer: 1400,
        showConfirmButton: false,
      });
    }
  }

  function resetUnassignedOrderToDefault() {
    unassignedOrderIds = [];
    try {
      localStorage.removeItem(UNASSIGNED_ORDER_KEY);
    } catch (e) {}
    render();

    // @ts-ignore
    if ((window as any).Swal) {
      // @ts-ignore
      (window as any).Swal.fire({
        icon: "info",
        title: "Urutan Direset",
        text: "Urutan antrean dikembalikan ke algoritma kalkulasi SLA standar.",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  }

  function catInfo(key: string) {
    return (
      CATEGORIES.find((c) => c.key === key) || {
        key: key || "OTHERS",
        label: key || "Lainnya",
        opRisk: 1,
        custImpact: 1,
        keywords: [],
      }
    );
  }

  function getZonaByArea(areaStr: string) {
    if (!areaStr) return "ZONA 2";
    const text = areaStr.toLowerCase();

    const zona1Keywords = [
      "sepatan timur",
      "sepatan",
      "pasar kemis",
      "pasarkemis",
      "sindang jaya 1",
      "sindang jaya zona 1",
    ];
    const zona2Keywords = [
      "cikupa",
      "balaraja",
      "jayanti",
      "sukamulya",
      "sindang jaya 2",
      "sindang jaya zona 2",
      "sindang jaya",
    ];

    for (const kw of zona1Keywords) {
      if (text.includes(kw)) return "ZONA 1";
    }

    for (const kw of zona2Keywords) {
      if (text.includes(kw)) return "ZONA 2";
    }

    if (text.includes("sindang jaya")) return "ZONA 1";
    return "ZONA 2";
  }

  function formatWA(phoneStr: string) {
    if (!phoneStr) return "";
    let clean = phoneStr.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) clean = "62" + clean.slice(1);
    return clean;
  }

  function isWeekend(dateObj: Date) {
    const day = dateObj.getDay();
    return day === 0 || day === 6;
  }

  function getNextWorkingDay(startDate: Date) {
    const d = new Date(startDate);
    while (isWeekend(d)) {
      d.setDate(d.getDate() + 1);
    }
    return d;
  }

  function computeUrgencyMetrics(item: ComplaintItem) {
    const cInfo = catInfo(item.category);
    const scoreOpRisk = item.urgent ? 3 : cInfo.opRisk || 1;
    const scoreCustImpact = item.urgent ? 3 : cInfo.custImpact || 1;

    const start = new Date(item.receivedAt);
    const deadline = new Date(start.getTime() + SLA_DAYS * 24 * 60 * 60 * 1000);
    const diffDays = Math.ceil(
      (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    const scoreSla = diffDays <= 3 ? 3 : diffDays <= 7 ? 2 : 1;

    const isIndustrial =
      (item.category && item.category.endsWith("IND")) ||
      (item.customer && item.customer.toLowerCase().includes("pt."));
    const scoreCustType = isIndustrial ? 3 : 2;

    const totalScore =
      scoreOpRisk * 0.35 +
      scoreCustImpact * 0.3 +
      scoreSla * 0.2 +
      scoreCustType * 0.15;
    const roundedScore = Math.round(totalScore * 100) / 100;

    let level = "rendah";
    if (roundedScore >= 2.4) level = "tinggi";
    else if (roundedScore >= 1.7) level = "sedang";

    return { score: roundedScore, level };
  }

  function urgencyLevel(item: ComplaintItem) {
    return computeUrgencyMetrics(item).level;
  }

  function hoursWaiting(item: ComplaintItem) {
    const ms = Date.now() - new Date(item.receivedAt).getTime();
    return Math.max(0, ms / 3600000);
  }

  function priorityScore(item: ComplaintItem) {
    const metrics = computeUrgencyMetrics(item);
    const hrs = Math.min(hoursWaiting(item), 336);
    return metrics.score * 1000 + hrs;
  }

  function fmtDateTime(dateObj: Date) {
    return dateObj.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function fmtDateOnly(dateObj: Date) {
    return dateObj.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateKey(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseCoords(str: string) {
    if (!str) return null;
    const parts = str.split(",").map((p) => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
    return null;
  }

  function getSLACountdown(receivedAt: string) {
    const deadline = new Date(
      new Date(receivedAt).getTime() + SLA_DAYS * 24 * 60 * 60 * 1000
    );
    const diffMs = deadline.getTime() - new Date().getTime();
    if (diffMs <= 0) return { text: "OVERDUE", isOverdue: true };

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    return { text: `⏳ Sisa ${days}d ${hours}h`, isOverdue: false };
  }

  function getDeadlineInfo(item: ComplaintItem) {
    const start = new Date(item.receivedAt);
    const deadline = new Date(start.getTime() + SLA_DAYS * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let statusClass = "deadline-normal";
    let statusText = `SLA ${diffDays}hr`;

    if (diffMs < 0) {
      statusClass = "deadline-overdue";
      statusText = `Overdue (${Math.abs(diffDays)}hr)`;
    } else if (diffDays <= 3) {
      statusClass = "deadline-warning";
      statusText = `SLA Urgent (${diffDays}hr)`;
    }

    return {
      receivedText: fmtDateTime(start),
      deadlineText: fmtDateTime(deadline),
      statusClass,
      statusText,
      isOverdue: diffMs < 0,
    };
  }

  async function assignOfficerToWO(id: string, newOfficer: string) {
    const target = complaints.find((c) => c.id === id);
    if (!target) return;

    target.officer = newOfficer;
    saveLocal();
    render();

    const fullDesc = buildFullDescription(
      target.desc,
      target.address,
      target.phone,
      target.rescheduledDate,
      target.officer,
      target.photoBefore,
      target.photoAfter
    );

    try {
      if (sb) {
        await sb
          .from(TABLE)
          .update({ description: fullDesc })
          .eq("id", id);
      }
      // @ts-ignore
      if ((window as any).Swal) {
        // @ts-ignore
        (window as any).Swal.fire({
          icon: "success",
          title: "Petugas Ditugaskan",
          text: `WO ${id} diserahkan ke ${newOfficer || "Belum Ditugaskan"}`,
          timer: 1200,
          showConfirmButton: false,
        });
      }
    } catch (e) {
      console.error("Gagal menugaskan petugas di server:", e);
    }
  }

  async function autoAssignMerata() {
    const unassigned = complaints
      .filter((c) => (!c.officer || c.officer.trim() === "") && c.status !== "selesai")
      .sort((a, b) => getUnassignedRank(a.id) - getUnassignedRank(b.id));
    if (unassigned.length === 0) {
      // @ts-ignore
      if ((window as any).Swal) {
        // @ts-ignore
        (window as any).Swal.fire(
          "Info",
          "Semua komplain aktif sudah memiliki petugas lapangan!",
          "info"
        );
      }
      return;
    }

    const counts: Record<string, number> = {};
    OFFICERS.forEach((o) => (counts[o] = 0));
    complaints.forEach((c) => {
      if (c.officer && OFFICERS.includes(c.officer) && c.status !== "selesai") {
        counts[c.officer]++;
      }
    });

    for (const item of unassigned) {
      let minOfficer = OFFICERS[0];
      let minCount = counts[OFFICERS[0]];

      for (const o of OFFICERS) {
        if (counts[o] < minCount) {
          minCount = counts[o];
          minOfficer = o;
        }
      }

      item.officer = minOfficer;
      counts[minOfficer]++;

      const fullDesc = buildFullDescription(
        item.desc,
        item.address,
        item.phone,
        item.rescheduledDate,
        item.officer,
        item.photoBefore,
        item.photoAfter
      );
      try {
        if (sb) {
          await sb.from(TABLE).update({ description: fullDesc }).eq("id", item.id);
        }
      } catch (e) {
        console.error(e);
      }
    }

    saveLocal();
    // @ts-ignore
    if ((window as any).Swal) {
      // @ts-ignore
      (window as any).Swal.fire(
        "Berhasil",
        `Berhasil membagikan ${unassigned.length} Work Order secara merata ke petugas!`,
        "success"
      );
    }
    render();
  }

  function copyFieldFormat(item: ComplaintItem) {
    const cInfo = catInfo(item.category);
    const textToCopy = `*[LAPORAN PENGERJAAN MINOR REPAIR]*
ID WO: ${item.id}
Pelanggan: ${item.customer} ${item.meterId ? "(" + item.meterId + ")" : ""}
Keluhan: [${item.category}] ${cInfo.label}
Petugas Lapangan: ${item.officer || "Belum Ditugaskan"}
Alamat: ${item.address || "-"}
Area: ${item.area || "Cikupa"}
Status: ${item.status.toUpperCase()}
Catatan: ${item.desc || "-"}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      // @ts-ignore
      if ((window as any).Swal) {
        // @ts-ignore
        (window as any).Swal.fire({
          icon: "success",
          title: "Tercopy!",
          text: "Format laporan berhasil disalin ke clipboard.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }

  function calculateCalendarSchedule() {
    const dateMap: Record<string, ComplaintItem[]> = {};
    const itemScheduledDateMap: Record<string, Date> = {};

    const completedItems = complaints.filter((c) => c.status === "selesai");
    completedItems.forEach((item) => {
      const dateKey = formatDateKey(new Date(item.receivedAt));
      if (!dateMap[dateKey]) dateMap[dateKey] = [];
      dateMap[dateKey].push(item);
      itemScheduledDateMap[item.id] = new Date(item.receivedAt);
    });

    const rescheduledItems = complaints.filter(
      (c) => c.status !== "selesai" && c.rescheduledDate
    );
    rescheduledItems.forEach((item) => {
      const dateKey = formatDateKey(new Date(item.rescheduledDate!));
      if (!dateMap[dateKey]) dateMap[dateKey] = [];
      dateMap[dateKey].push(item);
      itemScheduledDateMap[item.id] = new Date(item.rescheduledDate!);
    });

    const sortForSchedule = (a: ComplaintItem, b: ComplaintItem) => {
      const isUnassignedA = !a.officer || a.officer.trim() === "";
      const isUnassignedB = !b.officer || b.officer.trim() === "";
      if (isUnassignedA && isUnassignedB) {
        const rankA = getUnassignedRank(a.id);
        const rankB = getUnassignedRank(b.id);
        if (rankA !== rankB) return rankA - rankB;
      }
      return priorityScore(b) - priorityScore(a);
    };

    let unassigned = complaints
      .filter((c) => c.status !== "selesai" && !c.rescheduledDate)
      .sort(sortForSchedule);

    let currentDate = getNextWorkingDay(new Date());
    currentDate.setHours(0, 0, 0, 0);

    while (unassigned.length > 0) {
      if (isWeekend(currentDate)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      const dateKey = formatDateKey(currentDate);
      if (!dateMap[dateKey]) dateMap[dateKey] = [];

      const availableSlots = MAX_PER_DAY - dateMap[dateKey].length;
      if (availableSlots <= 0) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      const seedItem = unassigned[0];
      const targetArea = (seedItem.area || "TANPA-AREA").trim().toLowerCase();

      const sameAreaItems = unassigned.filter(
        (i) => (i.area || "TANPA-AREA").trim().toLowerCase() === targetArea
      );
      const otherAreaItems = unassigned.filter(
        (i) => (i.area || "TANPA-AREA").trim().toLowerCase() !== targetArea
      );

      const batchForToday = sameAreaItems.slice(0, availableSlots);
      const remainingSameArea = sameAreaItems.slice(availableSlots);

      batchForToday.forEach((item) => {
        let targetWorkingDate = new Date(currentDate);
        if (isWeekend(new Date(item.receivedAt))) {
          targetWorkingDate = getNextWorkingDay(new Date(item.receivedAt));
        }

        dateMap[dateKey].push(item);
        itemScheduledDateMap[item.id] = targetWorkingDate;
      });

      unassigned = [...remainingSameArea, ...otherAreaItems].sort(sortForSchedule);

      if (dateMap[dateKey].length >= MAX_PER_DAY) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return { dateMap, itemScheduledDateMap };
  }

  function exportToExcel(
    itemsToExport: ComplaintItem[],
    itemScheduledDateMap: Record<string, Date>
  ) {
    if (!itemsToExport || itemsToExport.length === 0) {
      // @ts-ignore
      if ((window as any).Swal) {
        // @ts-ignore
        (window as any).Swal.fire(
          "Warning",
          "Tidak ada data komplain untuk diunduh.",
          "warning"
        );
      }
      return;
    }

    const excelData = itemsToExport.map((item) => {
      const caseDetails = catInfo(item.category);
      const metrics = computeUrgencyMetrics(item);
      const deadlineInfo = getDeadlineInfo(item);
      const schedDate = itemScheduledDateMap[item.id];

      return {
        "ID Work Order": item.id,
        "Nama Pelanggan": item.customer || "-",
        "No WhatsApp": item.phone || "-",
        "ID Meter": item.meterId || "-",
        "Petugas Lapangan": item.officer || "Belum Ditugaskan",
        "Alamat Lengkap": item.address || "-",
        "Area / Zona": item.area || "-",
        "Kode CASE": item.category,
        "Kategori Keluhan": caseDetails.label,
        "Skor Urgensi": metrics.score,
        "Level Urgensi": metrics.level.toUpperCase(),
        Deskripsi: item.desc || "-",
        "Waktu Diterima": fmtDateTime(new Date(item.receivedAt)),
        "Jadwal Pengerjaan": schedDate ? fmtDateOnly(schedDate) : "-",
        "Batas SLA (14 Hari)": deadlineInfo.deadlineText,
        "Status SLA": deadlineInfo.statusText,
        "Status Work Order":
          item.status === "selesai"
            ? "Selesai"
            : item.status === "proses"
            ? "Dalam Proses"
            : "Belum Dikerjakan",
      };
    });

    // @ts-ignore
    const XLSX = (window as any).XLSX;
    if (!XLSX) return;

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Komplain");

    const dateStr = formatDateKey(new Date());
    XLSX.writeFile(workbook, `Laporan_Minor_Repair_${dateStr}.xlsx`);
  }

  function exportToCsv(
    itemsToExport: ComplaintItem[],
    itemScheduledDateMap: Record<string, Date>
  ) {
    if (!itemsToExport || itemsToExport.length === 0) {
      // @ts-ignore
      if ((window as any).Swal) {
        // @ts-ignore
        (window as any).Swal.fire(
          "Warning",
          "Tidak ada data Work Order untuk diekspor ke CSV.",
          "warning"
        );
      }
      return;
    }

    const headers = [
      "ID Work Order",
      "Nama Pelanggan",
      "No WhatsApp",
      "ID Meter",
      "Petugas Lapangan",
      "Alamat Lengkap",
      "Area / Zona",
      "Kode CASE",
      "Kategori Keluhan",
      "Prioritas",
      "Skor Urgensi",
      "Level Urgensi",
      "Deskripsi",
      "Koordinat GPS",
      "Waktu Diterima",
      "Jadwal Pengerjaan",
      "Batas SLA (14 Hari)",
      "Status SLA",
      "Status Work Order",
    ];

    const escapeCsvField = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows: string[] = [
      headers.map(escapeCsvField).join(","),
    ];

    itemsToExport.forEach((item) => {
      const caseDetails = catInfo(item.category);
      const metrics = computeUrgencyMetrics(item);
      const deadlineInfo = getDeadlineInfo(item);
      const schedDate = itemScheduledDateMap[item.id];

      const rowValues = [
        item.id,
        item.customer || "-",
        item.phone || "-",
        item.meterId || "-",
        item.officer || "Belum Ditugaskan",
        item.address || "-",
        item.area || "-",
        item.category,
        caseDetails.label,
        item.urgent ? "Darurat (Urgent)" : "Normal",
        metrics.score,
        metrics.level.toUpperCase(),
        item.desc || "-",
        item.coords || "-",
        fmtDateTime(new Date(item.receivedAt)),
        schedDate ? fmtDateOnly(schedDate) : "-",
        deadlineInfo.deadlineText,
        deadlineInfo.statusText,
        item.status === "selesai"
          ? "Selesai"
          : item.status === "proses"
          ? "Dalam Proses"
          : "Belum Dikerjakan",
      ];

      rows.push(rowValues.map(escapeCsvField).join(","));
    });

    const csvContent = "\uFEFF" + rows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = formatDateKey(new Date());
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Work_Order_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // @ts-ignore
    if ((window as any).Swal) {
      // @ts-ignore
      (window as any).Swal.fire({
        icon: "success",
        title: "Export CSV Berhasil!",
        text: `${itemsToExport.length} Work Order berhasil diunduh ke format CSV.`,
        timer: 1800,
        showConfirmButton: false,
      });
    }
  }

  function buildFullDescription(
    desc: string,
    address?: string | null,
    phone?: string | null,
    reschedDate?: string | null,
    officer?: string | null,
    photoBefore?: string | null,
    photoAfter?: string | null
  ) {
    let result = desc || "";
    if (address) result += ` [Alamat: ${address}]`;
    if (phone) result += ` [WA: ${phone}]`;
    if (reschedDate) result += ` [Resched: ${reschedDate}]`;
    if (officer) result += ` [Petugas: ${officer}]`;
    if (photoBefore) result += ` [Before: ${photoBefore}]`;
    if (photoAfter) result += ` [After: ${photoAfter}]`;
    return result;
  }

  function rowToItem(row: any): ComplaintItem {
    let extraAddr = row.address || "";
    let extraMeter = row.meter_id || "";
    let extraPhone = row.phone || "";
    let extraOfficer = "";
    let reschedDate: string | null = null;
    let photoBefore: string | null = null;
    let photoAfter: string | null = null;

    if (row.description) {
      if (row.description.includes("[Alamat:")) {
        const mAddr = row.description.match(/\[Alamat:\s*(.*?)\]/);
        if (mAddr) extraAddr = mAddr[1];
      }
      if (row.description.includes("[WA:")) {
        const mPhone = row.description.match(/\[WA:\s*(.*?)\]/);
        if (mPhone) extraPhone = mPhone[1];
      }
      if (row.description.includes("[Resched:")) {
        const mResched = row.description.match(/\[Resched:\s*(.*?)\]/);
        if (mResched) reschedDate = mResched[1];
      }
      if (row.description.includes("[Petugas:")) {
        const mOff = row.description.match(/\[Petugas:\s*(.*?)\]/);
        if (mOff) extraOfficer = mOff[1];
      }
      if (row.description.includes("[Before:")) {
        const mBef = row.description.match(/\[Before:\s*(.*?)\]/);
        if (mBef) photoBefore = mBef[1];
      }
      if (row.description.includes("[After:")) {
        const mAft = row.description.match(/\[After:\s*(.*?)\]/);
        if (mAft) photoAfter = mAft[1];
      }
    }

    if (
      !extraMeter &&
      row.customer &&
      row.customer.includes("(") &&
      row.customer.includes(")")
    ) {
      const mId = row.customer.match(/\((.*?)\)/);
      if (mId) extraMeter = mId[1];
    }

    return {
      id: row.id,
      customer: row.customer ? row.customer.replace(/\s*\(.*?\)/, "") : "",
      phone: extraPhone,
      meterId: extraMeter,
      address: extraAddr,
      area: row.area || "Cikupa",
      category: row.category || "KBSM",
      desc: row.description
        ? row.description
            .replace(/\[Alamat:.*?\]/g, "")
            .replace(/\[WA:.*?\]/g, "")
            .replace(/\[Resched:.*?\]/g, "")
            .replace(/\[Petugas:.*?\]/g, "")
            .replace(/\[Before:.*?\]/g, "")
            .replace(/\[After:.*?\]/g, "")
            .trim()
        : "",
      receivedAt: row.received_at || row.created_at || new Date().toISOString(),
      urgent: !!row.urgent,
      coords: row.coords || "",
      status: row.status || "baru",
      rescheduledDate: reschedDate,
      officer: extraOfficer,
      photoBefore: photoBefore,
      photoAfter: photoAfter,
      createdAt: row.created_at,
    };
  }

  async function addComplaint(data: any) {
    try {
      let receivedDateObj =
        data && data.receivedAt ? new Date(data.receivedAt) : new Date();
      if (isNaN(receivedDateObj.getTime())) receivedDateObj = new Date();

      if (isWeekend(receivedDateObj)) {
        receivedDateObj = getNextWorkingDay(receivedDateObj);
      }

      // Generate ID yang unik & rapi
      const generatedId = "WO-" + Math.floor(100000 + Math.random() * 900000);

      const item: ComplaintItem = {
        id: generatedId,
        customer:
          data && data.customer ? data.customer : "Pelanggan Tanpa Nama",
        phone: data && data.phone ? data.phone : "",
        meterId: data && data.meterId ? data.meterId : "",
        address: data && data.address ? data.address : "",
        area: data && data.area ? data.area : "Cikupa",
        category: data && data.category ? data.category : "KBSM",
        desc: data && data.desc ? data.desc : "",
        officer: "",
        receivedAt: receivedDateObj.toISOString(),
        urgent: !!(data && data.urgent),
        coords: data && data.coords ? data.coords : "",
        status: "baru",
        rescheduledDate: null,
        photoBefore: null,
        photoAfter: null,
      };

      // Pastikan tiket baru berada di prioritas teratas antrean unassigned
      if (!unassignedOrderIds.includes(generatedId)) {
        unassignedOrderIds.unshift(generatedId);
      }

      // Reset filter agar tiket yang baru dibuat langsung terlihat seketika
      currentTab = "board";
      quickFilter = "semua";
      selectedDate = null;

      // 1. Simpan ke array memori & localStorage seketika
      complaints.unshift(item);
      saveLocal();

      formOpen = false;
      editingId = null;
      render();

      setTimeout(() => {
        const ticketEl = document.getElementById(`ticket-${item.id}`);
        if (ticketEl) {
          ticketEl.scrollIntoView({ behavior: "smooth", block: "center" });
          ticketEl.classList.add("highlight-new-ticket");
          setTimeout(() => ticketEl.classList.remove("highlight-new-ticket"), 3500);
        }
      }, 120);

      // @ts-ignore
      if ((window as any).Swal) {
        // @ts-ignore
        (window as any).Swal.fire({
          icon: "success",
          title: "Berhasil Disimpan!",
          text: `Work Order ${item.id} berhasil ditambahkan dan masuk ke antrean utama.`,
          timer: 1800,
          showConfirmButton: false,
        });
      }

      // 2. Kirim ke Database Supabase
      const fullDesc = buildFullDescription(
        item.desc,
        item.address,
        item.phone,
        null,
        item.officer,
        null,
        null
      );
      const fullCust = item.meterId
        ? `${item.customer} (${item.meterId})`
        : item.customer;

      const fullPayload = {
        id: item.id,
        customer: fullCust,
        phone: item.phone || null,
        meter_id: item.meterId || null,
        address: item.address || null,
        area: item.area,
        category: item.category,
        description: fullDesc,
        received_at: item.receivedAt,
        urgent: item.urgent,
        coords: item.coords,
        status: item.status,
      };

      if (sb) {
        const { error } = await sb.from(TABLE).insert(fullPayload);
        if (error) {
          console.error("Gagal simpan ke Supabase DB:", error);
        }
      }
    } catch (globalErr) {
      console.error("Error addComplaint:", globalErr);
    }
  }

  async function markAbsentAndReschedule(id: string) {
    const target = complaints.find((c) => c.id === id);
    if (!target) return;

    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow = getNextWorkingDay(tomorrow);

    const tomorrowStr = formatDateKey(tomorrow);

    target.rescheduledDate = tomorrowStr;
    saveLocal();
    render();

    const fullDesc = buildFullDescription(
      target.desc,
      target.address,
      target.phone,
      tomorrowStr,
      target.officer,
      target.photoBefore,
      target.photoAfter
    );

    try {
      if (sb) {
        await sb.from(TABLE).update({ description: fullDesc }).eq("id", id);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function updateComplaint(id: string, data: any) {
    const target = complaints.find((c) => c.id === id);
    if (target) {
      target.customer = data.customer;
      target.phone = data.phone;
      target.meterId = data.meterId;
      target.address = data.address;
      target.area = data.area;
      target.category = data.category;
      target.desc = data.desc;
      target.receivedAt = data.receivedAt;
      target.urgent = data.urgent;
      target.coords = data.coords;
    }

    saveLocal();
    formOpen = false;
    editingId = null;
    render();

    const fullDesc = buildFullDescription(
      data.desc,
      data.address,
      data.phone,
      target ? target.rescheduledDate : null,
      target ? target.officer : "",
      target ? target.photoBefore : null,
      target ? target.photoAfter : null
    );
    const fullCust = data.meterId
      ? `${data.customer} (${data.meterId})`
      : data.customer;

    try {
      if (sb) {
        await sb
          .from(TABLE)
          .update({
            customer: fullCust,
            phone: data.phone || null,
            meter_id: data.meterId || null,
            address: data.address || null,
            area: data.area,
            category: data.category,
            description: fullDesc,
            received_at: data.receivedAt,
            urgent: data.urgent,
            coords: data.coords,
          })
          .eq("id", id);
      }
      // @ts-ignore
      if ((window as any).Swal) {
        // @ts-ignore
        (window as any).Swal.fire({
          icon: "success",
          title: "Diperbarui!",
          text: `Work Order ${id} berhasil diubah!`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function setStatus(id: string, status: string) {
    const target = complaints.find((c) => c.id === id);
    if (target) target.status = status;
    saveLocal();
    render();

    try {
      if (sb) {
        await sb.from(TABLE).update({ status }).eq("id", id);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function removeComplaint(id: string) {
    // @ts-ignore
    if ((window as any).Swal) {
      // @ts-ignore
      (window as any).Swal.fire({
        title: "Hapus Work Order?",
        text: "Data yang dihapus tidak dapat dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#EF4444",
        confirmButtonText: "Ya, Hapus",
      }).then(async (result: any) => {
        if (result.isConfirmed) {
          complaints = complaints.filter((c) => c.id !== id);
          saveLocal();
          render();
          try {
            if (sb) await sb.from(TABLE).delete().eq("id", id);
          } catch (e) {}
          // @ts-ignore
          (window as any).Swal.fire("Terhapus!", "WO berhasil dihapus.", "success");
        }
      });
    } else {
      complaints = complaints.filter((c) => c.id !== id);
      saveLocal();
      render();
    }
  }

  async function processInboundEmail(emailRawText: string) {
    if (!emailRawText.trim()) return;

    const parseField = (pattern: RegExp) => {
      const match = emailRawText.match(pattern);
      return match ? match[1].trim() : null;
    };

    const customer =
      parseField(/Nama Pelanggan\s*:\s*(.*)/i) ||
      parseField(/Pelanggan\s*:\s*(.*)/i) ||
      "Pelanggan Inbound Email";
    const phone =
      parseField(/No WhatsApp\s*:\s*(.*)/i) ||
      parseField(/No HP\s*:\s*(.*)/i) ||
      "";
    const meterId =
      parseField(/ID Meter\s*:\s*(.*)/i) ||
      parseField(/ID Pelanggan\s*:\s*(.*)/i) ||
      "-";
    const address = parseField(/Alamat\s*:\s*(.*)/i) || "-";
    const area = parseField(/Area\s*:\s*(.*)/i) || "Cikupa";
    const coords = parseField(/Koordinat\s*:\s*(.*)/i) || "";
    const desc =
      parseField(/Deskripsi\s*:\s*(.*)/i) || emailRawText.slice(0, 150);

    let detectedCategory =
      parseField(/Jenis Case\s*:\s*(.*)/i) || parseField(/Case\s*:\s*(.*)/i);
    if (
      !detectedCategory ||
      !CATEGORIES.some((c) => c.key === detectedCategory!.toUpperCase())
    ) {
      const lowerText = (desc + " " + emailRawText).toLowerCase();
      const matched = CATEGORIES.find((c) =>
        c.keywords.some((kw) => lowerText.includes(kw))
      );
      detectedCategory = matched ? matched.key : "KBSM";
    }

    const newComplaint = {
      customer,
      phone,
      meterId,
      address,
      area,
      category: detectedCategory.toUpperCase(),
      desc: desc + " [Konversi Email Otomatis]",
      receivedAt: new Date().toISOString(),
      urgent: false,
      coords,
    };

    await addComplaint(newComplaint);
  }

  function getSeedComplaints(): ComplaintItem[] {
    const now = Date.now();
    const d = (hoursAgo: number) =>
      new Date(now - hoursAgo * 3600 * 1000).toISOString();
    return [
      {
        id: "WO-2026-001",
        customer: "Hj. Siti Rahmah",
        phone: "081298765432",
        meterId: "MTR-882109",
        address: "Jl. Raya Cikupa No. 45, RT 02/RW 04, Cikupa",
        area: "Cikupa",
        category: "KBSM",
        desc: "Pipa sebelum meter bocor deras menggenang ke jalan depan rumah",
        officer: "Budi Santoso",
        receivedAt: d(18),
        urgent: true,
        coords: "-6.2285, 106.5180",
        status: "proses",
        rescheduledDate: null,
        photoBefore: null,
        photoAfter: null,
      },
      {
        id: "WO-2026-002",
        customer: "PT Surya Cemerlang Indah",
        phone: "081387654321",
        meterId: "MTR-994120",
        address: "Kawasan Industri Balaraja Blok C3, Balaraja",
        area: "Balaraja",
        category: "KATMIND",
        desc: "Tekanan air drop total sejak pagi, aktivitas pabrik terganggu",
        officer: "Agus Setiawan",
        receivedAt: d(36),
        urgent: true,
        coords: "-6.2045, 106.4620",
        status: "proses",
        rescheduledDate: null,
        photoBefore: null,
        photoAfter: null,
      },
      {
        id: "WO-2026-003",
        customer: "Ahmad Fauzi",
        phone: "085712345678",
        meterId: "MTR-773412",
        address: "Perumahan Bumi Asri Blok B4 No. 12, Pasar Kemis",
        area: "Pasar Kemis",
        category: "KKMR",
        desc: "Kran meter patah akibat terbentur kendaraan bermotor saat parkir",
        officer: "",
        receivedAt: d(52),
        urgent: false,
        coords: "-6.1750, 106.5380",
        status: "baru",
        rescheduledDate: null,
        photoBefore: null,
        photoAfter: null,
      },
      {
        id: "WO-2026-004",
        customer: "Ibu Maria Kusuma",
        phone: "081901234567",
        meterId: "MTR-665231",
        address: "Jl. Ki Mas Laing RT 03/01, Sepatan",
        area: "Sepatan",
        category: "KATR",
        desc: "Air keluar keruh kecoklatan dan berpasir sejak perbaikan pipa utama",
        officer: "",
        receivedAt: d(80),
        urgent: false,
        coords: "-6.1230, 106.5720",
        status: "baru",
        rescheduledDate: null,
        photoBefore: null,
        photoAfter: null,
      },
      {
        id: "WO-2026-005",
        customer: "Drs. Hendro Wibowo",
        phone: "081234567890",
        meterId: "MTR-554102",
        address: "Komplek Pemda Tigaraksa Blok F No. 8, Tigaraksa",
        area: "Tigaraksa",
        category: "KPMR",
        desc: "Jarum meteran macet tidak berputar meskipun air mengalir normal",
        officer: "Dedi Kurniawan",
        receivedAt: d(120),
        urgent: false,
        coords: "-6.2610, 106.4850",
        status: "selesai",
        rescheduledDate: null,
        photoBefore: null,
        photoAfter: null,
      },
      {
        id: "WO-2026-006",
        customer: "Klinik Harapan Sehat",
        phone: "082199887766",
        meterId: "MTR-443219",
        address: "Jl. Raya Curug KM 3 No. 88, Curug",
        area: "Curug",
        category: "KATM",
        desc: "Pasokan air mati mendadak untuk fasilitas rawat inap klinik",
        officer: "Hendra Wijaya",
        receivedAt: d(8),
        urgent: true,
        coords: "-6.2410, 106.5540",
        status: "proses",
        rescheduledDate: null,
        photoBefore: null,
        photoAfter: null,
      },
      {
        id: "WO-2026-007",
        customer: "Bpk. Suhendar",
        phone: "087812903456",
        meterId: "MTR-332190",
        address: "Perum Graha Panongan Blok D2/15, Panongan",
        area: "Panongan",
        category: "KBSM",
        desc: "Rembesan pipa sebelum meter, tanah amblas sedikit di sekitar meteran",
        officer: "",
        receivedAt: d(300),
        urgent: false,
        coords: "-6.2520, 106.5210",
        status: "baru",
        rescheduledDate: null,
        photoBefore: null,
        photoAfter: null,
      },
      {
        id: "WO-2026-008",
        customer: "Toko Sinar Rejeki",
        phone: "081356789012",
        meterId: "MTR-221098",
        address: "Pasar Rajeg Blok B No. 5, Rajeg",
        area: "Rajeg",
        category: "KMDT",
        desc: "Pemasangan arah panah meter terbalik setelah perapihan saluran",
        officer: "",
        receivedAt: d(400),
        urgent: false,
        coords: "-6.1480, 106.5050",
        status: "baru",
        rescheduledDate: null,
        photoBefore: null,
        photoAfter: null,
      },
    ];
  }

  async function load() {
    // 1. Ambil data lokal terlebih dahulu agar UI instan dan tidak ada data hilang saat refresh
    const localData = loadLocal();
    if (localData && localData.length > 0) {
      complaints = localData;
    } else {
      complaints = getSeedComplaints();
      saveLocal();
    }
    render();

    // 2. Sinkronkan dengan Supabase Database
    try {
      if (sb && !isDisposed) {
        const { data, error } = await sb
          .from(TABLE)
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && !isDisposed) {
          const remoteItems = data.map(rowToItem);

          // Gabungkan data lokal yang belum sempat tersimpan di server
          const merged = [...remoteItems];
          complaints.forEach((localItem) => {
            if (!merged.some((r) => r.id === localItem.id)) {
              merged.unshift(localItem);
            }
          });

          complaints = merged;
          saveLocal();
          render();
        }
      }
    } catch (e) {
      console.warn("Mode offline/server fallback, memakai data lokal:", e);
    }
  }

  function el(tag: string, attrs?: Record<string, any>, ...children: any[]) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === "class") {
          e.className = attrs[k];
        } else if (k === "checked" && "checked" in e) {
          (e as HTMLInputElement).checked = Boolean(attrs[k]);
        } else if (k === "value" && "value" in e) {
          (e as HTMLInputElement).value = attrs[k] ?? "";
        } else if (k === "disabled" && "disabled" in e) {
          (e as HTMLInputElement).disabled = Boolean(attrs[k]);
        } else if (k.startsWith("on")) {
          e.addEventListener(k.slice(2), attrs[k]);
        } else if (attrs[k] !== null && attrs[k] !== undefined) {
          e.setAttribute(k, attrs[k]);
        }
      }
    }
    children.flat().forEach((c) => {
      if (c === null || c === undefined) return;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  }

  function nowLocalInputValue() {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  function renderForm() {
    if (!formOpen) return el("div");

    const editing = editingId
      ? complaints.find((x) => x.id === editingId)
      : null;
    const toLocalInput = (iso: string) => {
      try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return nowLocalInputValue();
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
          d.getDate()
        )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } catch (e) {
        return nowLocalInputValue();
      }
    };

    const customerInput = el("input", {
      type: "text",
      placeholder: "Nama Pelanggan",
      value: editing ? editing.customer : "",
    }) as HTMLInputElement;
    const phoneInput = el("input", {
      type: "text",
      placeholder: "No WA (08xxxxxxxxxx)",
      value: editing ? editing.phone : "",
    }) as HTMLInputElement;
    const meterIdInput = el("input", {
      type: "text",
      placeholder: "ID Meter / Langganan",
      value: editing ? editing.meterId : "",
    }) as HTMLInputElement;
    const addressInput = el("input", {
      type: "text",
      placeholder: "Alamat Lengkap",
      value: editing ? editing.address : "",
    }) as HTMLInputElement;
    const areaInput = el("input", {
      type: "text",
      placeholder: "Area / Kecamatan (Sepatan, Cikupa, dll.)",
      value: editing ? editing.area : "Cikupa",
    }) as HTMLInputElement;

    const catSelect = el(
      "select",
      {},
      ...CATEGORIES.map((c) =>
        el(
          "option",
          {
            value: c.key,
            selected: editing && editing.category === c.key ? "selected" : null,
          },
          `[${c.key}] ${c.label}`
        )
      )
    ) as HTMLSelectElement;

    const descInput = el(
      "textarea",
      { placeholder: "Detail komplain..." },
      editing ? editing.desc : ""
    ) as HTMLTextAreaElement;
    const timeInput = el("input", {
      type: "datetime-local",
      value: editing ? toLocalInput(editing.receivedAt) : nowLocalInputValue(),
    }) as HTMLInputElement;
    const urgentCheck = el("input", {
      type: "checkbox",
      checked: editing && editing.urgent ? "checked" : null,
    }) as HTMLInputElement;
    const coordsInput = el("input", {
      type: "text",
      placeholder: "-6.1783, 106.6319 (opsional)",
      value: editing ? editing.coords || "" : "",
    }) as HTMLInputElement;

    const formErrorEl = el("div", {
      style: "display:none; background:#FEE2E2; border:1px solid #FCA5A5; color:#991B1B; padding:6px 10px; border-radius:6px; font-size:11.5px; font-weight:600; margin-bottom:10px;",
    });

    return el(
      "div",
      { class: "form-panel open", id: "wo-create-form" },
      el(
        "div",
        { style: "display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; flex-wrap:wrap; gap:8px;" },
        el(
          "h2",
          { style: "margin:0; font-size:14px; font-weight:800; color:#1E293B;" },
          editing ? `✏️ Ubah Komplain Work Order ${editing.id}` : "➕ Tambah Work Order / Komplain Baru"
        ),
        !editing
          ? el(
              "button",
              {
                type: "button",
                class: "btn-secondary",
                style: "font-size:11px; padding:3px 9px; background:#EFF6FF; color:#1D4ED8; border-color:#BFDBFE; font-weight:700;",
                title: "Isi contoh data cepat untuk mempermudah pengujian",
                onclick: () => {
                  customerInput.value = "Bpk. Hendra Saputra";
                  phoneInput.value = "081298765432";
                  meterIdInput.value = "MTR-88219";
                  addressInput.value = "Jl. Raya Serang Km 14, Blok B No. 7";
                  areaInput.value = "Cikupa";
                  catSelect.value = "KPPR";
                  descInput.value = "Pipa dinas bocor di depan meteran, air merembes ke jalan";
                  urgentCheck.checked = true;
                  coordsInput.value = "-6.2341, 106.5298";
                  formErrorEl.style.display = "none";
                },
              },
              "⚡ Isi Contoh Data Cepat"
            )
          : null
      ),
      formErrorEl,
      el(
        "div",
        { class: "field-row" },
        el("div", { class: "field" }, el("label", {}, "Nama Pelanggan *"), customerInput),
        el("div", { class: "field" }, el("label", {}, "No WhatsApp"), phoneInput),
        el("div", { class: "field" }, el("label", {}, "ID Meter"), meterIdInput)
      ),
      el(
        "div",
        { class: "field-row" },
        el("div", { class: "field" }, el("label", {}, "Alamat Lengkap"), addressInput),
        el("div", { class: "field" }, el("label", {}, "Area / Kecamatan"), areaInput)
      ),
      el(
        "div",
        { class: "field-row" },
        el("div", { class: "field" }, el("label", {}, "CASE Keluhan (Pilih Jenis Case)"), catSelect),
        el("div", { class: "field" }, el("label", {}, "Waktu Diterima"), timeInput)
      ),
      el(
        "div",
        { class: "field-row" },
        el("div", { class: "field" }, el("label", {}, "Deskripsi Keluhan"), descInput),
        el("div", { class: "field" }, el("label", {}, "Koordinat GPS"), coordsInput)
      ),
      el(
        "label",
        {
          style:
            "display:flex; align-items:center; gap:8px; font-size:12px; margin: 6px 0 14px; cursor:pointer;",
        },
        urgentCheck,
        "Tandai mendesak (Prioritas Utama)"
      ),
      el(
        "div",
        { style: "display:flex; gap:8px;" },
        el(
          "button",
          {
            class: "btn-primary",
            onclick: async (e: Event) => {
              if (e && e.preventDefault) e.preventDefault();
              const valCust = customerInput ? customerInput.value.trim() : "";
              if (!valCust) {
                formErrorEl.innerText = "⚠️ Nama Pelanggan wajib diisi sebelum menyimpan!";
                formErrorEl.style.display = "block";
                customerInput.focus();
                // @ts-ignore
                if ((window as any).Swal) {
                  // @ts-ignore
                  (window as any).Swal.fire(
                    "Error",
                    "Nama Pelanggan wajib diisi!",
                    "error"
                  );
                }
                return;
              }
              formErrorEl.style.display = "none";

              const data = {
                customer: valCust,
                phone: phoneInput ? phoneInput.value.trim() : "",
                meterId: meterIdInput ? meterIdInput.value.trim() : "",
                address: addressInput ? addressInput.value.trim() : "",
                area:
                  areaInput && areaInput.value.trim()
                    ? areaInput.value.trim()
                    : "Cikupa",
                category: catSelect ? catSelect.value : "KBSM",
                desc: descInput ? descInput.value.trim() : "",
                receivedAt:
                  timeInput && timeInput.value
                    ? new Date(timeInput.value).toISOString()
                    : new Date().toISOString(),
                urgent: urgentCheck ? urgentCheck.checked : false,
                coords: coordsInput ? coordsInput.value.trim() : "",
              };

              if (editing) {
                await updateComplaint(editing.id, data);
              } else {
                await addComplaint(data);
              }
            },
          },
          editing ? "Simpan Perubahan" : "Simpan Komplain"
        ),
        el(
          "button",
          {
            class: "btn-secondary",
            onclick: () => {
              formOpen = false;
              editingId = null;
              render();
            },
          },
          "Batal"
        )
      )
    );
  }

  function renderFinishModal() {
    if (!finishModalOpen || !finishTargetId) return el("div");

    let photoBeforeData: string | null = null;
    let photoAfterData: string | null = null;

    const target = complaints.find((c) => c.id === finishTargetId);
    if (target) {
      photoBeforeData = target.photoBefore || null;
      photoAfterData = target.photoAfter || null;
    }

    function handleImageFile(file: File | undefined, callback: (url: string) => void) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 800;

          if (width > height && width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          } else if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            callback(canvas.toDataURL("image/jpeg", 0.7));
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }

    const camBeforeInput = el("input", {
      type: "file",
      accept: "image/*",
      capture: "environment",
      style: "display:none;",
    }) as HTMLInputElement;
    const fileBeforeInput = el("input", {
      type: "file",
      accept: "image/*",
      style: "display:none;",
    }) as HTMLInputElement;
    const imgBeforePreview = el("img", {
      class: "photo-preview-img",
      src: photoBeforeData || "",
    }) as HTMLImageElement;
    if (photoBeforeData) imgBeforePreview.style.display = "block";

    camBeforeInput.onchange = (e: any) =>
      handleImageFile(e.target.files[0], (url) => {
        photoBeforeData = url;
        imgBeforePreview.src = url;
        imgBeforePreview.style.display = "block";
      });
    fileBeforeInput.onchange = (e: any) =>
      handleImageFile(e.target.files[0], (url) => {
        photoBeforeData = url;
        imgBeforePreview.src = url;
        imgBeforePreview.style.display = "block";
      });

    const camAfterInput = el("input", {
      type: "file",
      accept: "image/*",
      capture: "environment",
      style: "display:none;",
    }) as HTMLInputElement;
    const fileAfterInput = el("input", {
      type: "file",
      accept: "image/*",
      style: "display:none;",
    }) as HTMLInputElement;
    const imgAfterPreview = el("img", {
      class: "photo-preview-img",
      src: photoAfterData || "",
    }) as HTMLImageElement;
    if (photoAfterData) imgAfterPreview.style.display = "block";

    camAfterInput.onchange = (e: any) =>
      handleImageFile(e.target.files[0], (url) => {
        photoAfterData = url;
        imgAfterPreview.src = url;
        imgAfterPreview.style.display = "block";
      });
    fileAfterInput.onchange = (e: any) =>
      handleImageFile(e.target.files[0], (url) => {
        photoAfterData = url;
        imgAfterPreview.src = url;
        imgAfterPreview.style.display = "block";
      });

    const canvas = el("canvas", {
      class: "signature-pad",
      width: "340",
      height: "120",
      style: "touch-action: none;",
    }) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    let drawing = false;
    let hasSignature = false;

    function getCoords(e: MouseEvent | TouchEvent) {
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function startDrawing(e: MouseEvent | TouchEvent) {
      drawing = true;
      hasSignature = true;
      const pos = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      if (e.cancelable) e.preventDefault();
    }

    function draw(e: MouseEvent | TouchEvent) {
      if (!drawing) return;
      const pos = getCoords(e);
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = isDarkMode ? "#38BDF8" : "#0F172A";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      if (e.cancelable) e.preventDefault();
    }

    function stopDrawing() {
      drawing = false;
      ctx.beginPath();
    }

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);

    return el(
      "div",
      {
        class: "form-panel open",
        style: "background:var(--panel); border:1px solid var(--accent);",
      },
      el(
        "h2",
        { style: "margin-top:0;" },
        `📸 Bukti Pengerjaan & Tanda Tangan (${finishTargetId})`
      ),
      el(
        "div",
        { class: "field-row" },
        el(
          "div",
          { class: "field" },
          el("label", {}, "Foto Sebelum (Before):"),
          el(
            "div",
            { class: "photo-upload-box" },
            imgBeforePreview,
            el(
              "div",
              { class: "photo-btn-group" },
              el(
                "label",
                { class: "btn-cam", onclick: () => camBeforeInput.click() },
                "📷 Kamera"
              ),
              el(
                "label",
                { class: "btn-file", onclick: () => fileBeforeInput.click() },
                "📁 File"
              ),
              camBeforeInput,
              fileBeforeInput
            )
          )
        ),
        el(
          "div",
          { class: "field" },
          el("label", {}, "Foto Sesudah (After):"),
          el(
            "div",
            { class: "photo-upload-box" },
            imgAfterPreview,
            el(
              "div",
              { class: "photo-btn-group" },
              el(
                "label",
                { class: "btn-cam", onclick: () => camAfterInput.click() },
                "📷 Kamera"
              ),
              el(
                "label",
                { class: "btn-file", onclick: () => fileAfterInput.click() },
                "📁 File"
              ),
              camAfterInput,
              fileAfterInput
            )
          )
        )
      ),
      el(
        "div",
        { class: "field", style: "margin-bottom:10px; margin-top:6px;" },
        el("label", {}, "Tanda Tangan Pelanggan Digital:"),
        canvas,
        el(
          "button",
          {
            class: "btn-secondary",
            style: "width:100px; margin-top:4px; font-size:10px;",
            onclick: () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              hasSignature = false;
            },
          },
          "🧹 Hapus TTD"
        )
      ),
      el(
        "div",
        { style: "display:flex; gap:8px;" },
        el(
          "button",
          {
            class: "btn-primary",
            onclick: async () => {
              if (!hasSignature) {
                // @ts-ignore
                if ((window as any).Swal) {
                  // @ts-ignore
                  (window as any).Swal.fire(
                    "Peringatan",
                    "Harap bubuhkan tanda tangan pelanggan terlebih dahulu!",
                    "warning"
                  );
                }
                return;
              }

              if (target) {
                target.status = "selesai";
                target.photoBefore = photoBeforeData;
                target.photoAfter = photoAfterData;
                saveLocal();
                const fullDesc = buildFullDescription(
                  target.desc,
                  target.address,
                  target.phone,
                  target.rescheduledDate,
                  target.officer,
                  target.photoBefore,
                  target.photoAfter
                );

                if (sb) {
                  await sb
                    .from(TABLE)
                    .update({ status: "selesai", description: fullDesc })
                    .eq("id", target.id);
                }
              }
              finishModalOpen = false;
              // @ts-ignore
              if ((window as any).Swal) {
                // @ts-ignore
                (window as any).Swal.fire(
                  "Selesai!",
                  "Work Order telah diselesaikan, bukti foto & TTD terverifikasi.",
                  "success"
                );
              }
              render();
            },
          },
          "Verifikasi & Selesai"
        ),
        el(
          "button",
          {
            class: "btn-secondary",
            onclick: () => {
              finishModalOpen = false;
              render();
            },
          },
          "Batal"
        )
      )
    );
  }

  function renderHistoryModal() {
    if (!historyModalOpen) return el("div");

    let historyResults: ComplaintItem[] = [];
    if (historySearchTerm.trim()) {
      const term = historySearchTerm.toLowerCase();
      historyResults = complaints.filter(
        (c) =>
          (c.meterId && c.meterId.toLowerCase().includes(term)) ||
          (c.customer && c.customer.toLowerCase().includes(term))
      );
    }

    return el(
      "div",
      {
        class: "form-panel open",
        style: "background:#F0F9FF; border-color:#0284C7;",
      },
      el(
        "h2",
        { style: "color:#0369A1; margin-top:0;" },
        "📜 Cari History Komplain Pelanggan"
      ),
      el(
        "div",
        { class: "field-row" },
        el(
          "div",
          { class: "field" },
          el("label", {}, "Masukkan ID Meter / Nama Pelanggan:"),
          el("input", {
            type: "text",
            placeholder: "Contoh: PLG-99882 atau Bambang",
            value: historySearchTerm,
            oninput: (e: any) => {
              historySearchTerm = e.target.value;
              render();
            },
          })
        )
      ),
      historySearchTerm.trim() === ""
        ? el(
            "p",
            { style: "font-size:11.5px; color:var(--ink-soft);" },
            "Ketik ID Meter atau Nama Pelanggan di atas."
          )
        : historyResults.length === 0
        ? el(
            "p",
            { style: "font-size:11.5px; color:var(--tinggi);" },
            "Tidak ditemukan riwayat komplain."
          )
        : el(
            "div",
            { style: "max-height:220px; overflow-y:auto; margin-top:10px;" },
            ...historyResults.map((item) => {
              const cInfo = catInfo(item.category);
              return el(
                "div",
                {
                  class: "history-item",
                  style:
                    "background:var(--panel); padding:8px; margin-bottom:6px; border-radius:6px; border:1px solid #BAE6FD;",
                },
                el(
                  "div",
                  {
                    style:
                      "display:flex; justify-content:space-between; font-weight:700;",
                  },
                  el("span", {}, `${item.id} - ${cInfo.label}`),
                  el(
                    "span",
                    {
                      style: `color: ${
                        item.status === "selesai"
                          ? "var(--rendah)"
                          : "var(--tinggi)"
                      }`,
                    },
                    item.status.toUpperCase()
                  )
                ),
                el(
                  "div",
                  {
                    style:
                      "color:var(--ink-soft); font-size:10.5px; margin-top:2px;",
                  },
                  `Waktu Lapor: ${fmtDateTime(new Date(item.receivedAt))}`
                ),
                el("div", { style: "margin-top:4px;" }, item.desc)
              );
            })
          ),
      el(
        "div",
        { style: "display:flex; gap:8px; margin-top:12px;" },
        el(
          "button",
          {
            class: "btn-secondary",
            onclick: () => {
              historyModalOpen = false;
              historySearchTerm = "";
              render();
            },
          },
          "Tutup"
        )
      )
    );
  }

  function renderEmailParserModal() {
    if (!emailModalOpen) return el("div");

    const defaultEmailContent = `FW: [LAPORAN KELUHAN AIR MATI]
Nama Pelanggan : Bambang Wijaya
No WhatsApp : 081298765432
ID Meter : PLG-99882
Alamat : Jl. Raya Serang Km 14 No. 25, Cikupa
Area : Cikupa
Koordinat : -6.2231, 106.5134
Deskripsi : Air mati total sejak kemarin sore dan pipa sebelum meteran bocor deras. Mohon segera diperbaiki.`;

    const emailTextArea = el(
      "textarea",
      {
        style:
          "width:100%; height:140px; font-family:monospace; font-size:11.5px; padding:8px; border:1px solid var(--border); border-radius:6px; background:var(--panel); color:var(--ink);",
      },
      defaultEmailContent
    ) as HTMLTextAreaElement;

    return el(
      "div",
      {
        class: "form-panel open",
        style: "background:#F3E8FF; border-color:#C084FC;",
      },
      el(
        "h2",
        { style: "color:#6B21A8; margin-top:0;" },
        "🔄 Auto Inbound Email Webhook & Converter"
      ),
      emailTextArea,
      el(
        "div",
        { style: "display:flex; gap:8px; margin-top:10px;" },
        el(
          "button",
          {
            class: "btn-email",
            onclick: async () => {
              await processInboundEmail(emailTextArea.value);
              emailModalOpen = false;
              render();
            },
          },
          "⚡ Ekstrak Email Otomatis"
        ),
        el(
          "button",
          {
            class: "btn-secondary",
            onclick: () => {
              emailModalOpen = false;
              render();
            },
          },
          "Tutup"
        )
      )
    );
  }

  function renderDetailModal() {
    if (!detailModalOpen || !detailTargetId) return el("div");
    const item = complaints.find((c) => c.id === detailTargetId);
    if (!item) return el("div");

    const caseInfo = catInfo(item.category);
    const metrics = computeUrgencyMetrics(item);
    const deadline = getDeadlineInfo(item);
    const coordsObj = parseCoords(item.coords);
    const formattedPhone = formatWA(item.phone);

    const msgEnRoute = encodeURIComponent(
      `Halo Bpk/Ibu ${item.customer}, kami dari Unit Lapangan Aetra Air Tangerang (${item.officer || "Petugas Lapangan"}). Kami saat ini sedang dalam perjalanan menuju lokasi Anda terkait laporan WO ${item.id} [${caseInfo.label}]. Mohon pastikan ada orang di lokasi meteran.`
    );
    const msgDone = encodeURIComponent(
      `Halo Bpk/Ibu ${item.customer}, perbaikan pada laporan WO ${item.id} [${caseInfo.label}] telah selesai kami kerjakan. Air telah diperiksa dan mengalir normal. Terima kasih telah menghubungi Aetra Air Tangerang.`
    );

    return el(
      "div",
      {
        class: "modal-overlay",
        onclick: (e: any) => {
          if (e.target === e.currentTarget) {
            detailModalOpen = false;
            render();
          }
        },
      },
      el(
        "div",
        { class: "modal-card", style: "max-width: 620px;" },
        el(
          "div",
          { class: "modal-header" },
          el(
            "h3",
            {},
            `🔍 Detail Lengkap Work Order: ${item.id}`,
            el(
              "span",
              {
                class: `ticket-badge ${
                  item.status === "selesai"
                    ? "badge-selesai"
                    : "badge-" + metrics.level
                }`,
                style: "margin-left: 8px;",
              },
              item.status === "selesai" ? "SELESAI" : metrics.level.toUpperCase()
            )
          ),
          el(
            "button",
            {
              class: "btn-secondary",
              style: "border:none; padding:4px 8px; font-size:14px;",
              onclick: () => {
                detailModalOpen = false;
                render();
              },
            },
            "✕"
          )
        ),
        el(
          "div",
          { class: "modal-body" },
          el(
            "div",
            {
              style:
                "display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:14px; background:var(--bg); padding:10px; border-radius:8px; border:1px solid var(--border);",
            },
            el(
              "div",
              {},
              el(
                "strong",
                { style: "font-size:10px; color:var(--ink-soft); display:block;" },
                "PELANGGAN"
              ),
              el("span", { style: "font-weight:700; font-size:13px;" }, item.customer)
            ),
            el(
              "div",
              {},
              el(
                "strong",
                { style: "font-size:10px; color:var(--ink-soft); display:block;" },
                "ID METER"
              ),
              el("span", { style: "font-weight:700; font-size:13px;" }, item.meterId || "-")
            ),
            el(
              "div",
              {},
              el(
                "strong",
                { style: "font-size:10px; color:var(--ink-soft); display:block;" },
                "PETUGAS LAPANGAN"
              ),
              el(
                "span",
                { style: "font-weight:700; color:var(--accent); font-size:13px;" },
                item.officer ? `👷 ${item.officer}` : "⚠️ Belum Ditugaskan"
              )
            ),
            el(
              "div",
              {},
              el(
                "strong",
                { style: "font-size:10px; color:var(--ink-soft); display:block;" },
                "AREA & SLA"
              ),
              el(
                "span",
                { style: "font-size:12px;" },
                `${item.area || "Cikupa"} • ${deadline.statusText}`
              )
            )
          ),
          el(
            "div",
            { style: "margin-bottom:12px;" },
            el(
              "strong",
              { style: "font-size:11px; color:var(--ink-soft); display:block;" },
              "ALAMAT & LOKASI:"
            ),
            el(
              "p",
              { style: "margin:3px 0 6px; font-size:12px; line-height:1.4;" },
              item.address || "-"
            ),
            coordsObj
              ? el(
                  "div",
                  { style: "display:flex; align-items:center; gap:8px;" },
                  el(
                    "span",
                    { style: "font-size:10.5px; color:var(--ink-soft);" },
                    `📍 ${coordsObj.lat}, ${coordsObj.lng}`
                  ),
                  el(
                    "a",
                    {
                      href: `https://www.google.com/maps/dir/?api=1&destination=${coordsObj.lat},${coordsObj.lng}`,
                      target: "_blank",
                      rel: "noopener",
                      class: "btn-nav-route",
                      style: "font-size:10px; padding:2px 8px;",
                    },
                    "Buka Google Maps ↗"
                  )
                )
              : null
          ),
          el(
            "div",
            {
              style:
                "margin-bottom:14px; background:var(--bg); padding:10px; border-radius:8px;",
            },
            el(
              "strong",
              { style: "font-size:11px; color:var(--ink-soft); display:block;" },
              "KELUHAN & KATEGORI CASE:"
            ),
            el(
              "div",
              { style: "display:flex; align-items:center; gap:6px; margin:4px 0;" },
              el("span", { class: "case-tag" }, item.category),
              el(
                "span",
                { style: "font-weight:700; font-size:12px;" },
                caseInfo.label
              )
            ),
            el(
              "p",
              { style: "margin:4px 0 0; font-size:12px; color:var(--ink);" },
              item.desc || "Tidak ada rincian deskripsi."
            )
          ),
          el(
            "div",
            { style: "margin-bottom:14px;" },
            el(
              "strong",
              {
                style:
                  "font-size:11px; color:var(--ink-soft); display:block; margin-bottom:6px;",
              },
              "TIMELINE PROSES PENGERJAAN:"
            ),
            el(
              "div",
              { class: "timeline-list" },
              el(
                "div",
                { class: "timeline-node" },
                el("div", { class: "timeline-dot done" }),
                el("div", { style: "font-weight:700;" }, "1. Laporan Masuk"),
                el(
                  "div",
                  { style: "font-size:10px; color:var(--ink-soft);" },
                  `Diterima: ${fmtDateTime(new Date(item.receivedAt))}`
                )
              ),
              el(
                "div",
                { class: "timeline-node" },
                el("div", {
                  class: `timeline-dot ${item.officer ? "done" : "active"}`,
                }),
                el(
                  "div",
                  { style: "font-weight:700;" },
                  item.officer
                    ? `2. Ditugaskan ke ${item.officer}`
                    : "2. Menunggu Penugasan Petugas"
                ),
                el(
                  "div",
                  { style: "font-size:10px; color:var(--ink-soft);" },
                  item.officer
                    ? "Petugas telah dialokasikan"
                    : "Ada dalam antrean prioritas"
                )
              ),
              el(
                "div",
                { class: "timeline-node" },
                el("div", {
                  class: `timeline-dot ${
                    item.status === "proses"
                      ? "active"
                      : item.status === "selesai"
                      ? "done"
                      : ""
                  }`,
                }),
                el("div", { style: "font-weight:700;" }, "3. Pengerjaan Lapangan"),
                el(
                  "div",
                  { style: "font-size:10px; color:var(--ink-soft);" },
                  item.status === "proses"
                    ? "Sedang dikerjakan oleh petugas di lokasi"
                    : item.status === "selesai"
                    ? "Pekerjaan lapangan tuntas"
                    : "Belum dimulai"
                )
              ),
              el(
                "div",
                { class: "timeline-node" },
                el("div", {
                  class: `timeline-dot ${
                    item.status === "selesai" ? "done" : ""
                  }`,
                }),
                el(
                  "div",
                  { style: "font-weight:700;" },
                  "4. Verifikasi & Selesai"
                ),
                el(
                  "div",
                  { style: "font-size:10px; color:var(--ink-soft);" },
                  item.status === "selesai"
                    ? "Bukti foto & tanda tangan terverifikasi"
                    : "Menunggu verifikasi hasil kerja"
                )
              )
            )
          ),
          formattedPhone
            ? el(
                "div",
                { style: "margin-bottom:12px;" },
                el(
                  "strong",
                  {
                    style:
                      "font-size:11px; color:var(--ink-soft); display:block; margin-bottom:6px;",
                  },
                  "TEMPLATE RESPON CEPAT WHATSAPP:"
                ),
                el(
                  "div",
                  { style: "display:flex; gap:6px; flex-wrap:wrap;" },
                  el(
                    "a",
                    {
                      href: `https://wa.me/${formattedPhone}?text=${msgEnRoute}`,
                      target: "_blank",
                      rel: "noopener",
                      class: "btn-wa",
                      style: "font-size:11px; padding:4px 10px;",
                    },
                    "💬 Beritahu: Menuju Lokasi"
                  ),
                  el(
                    "a",
                    {
                      href: `https://wa.me/${formattedPhone}?text=${msgDone}`,
                      target: "_blank",
                      rel: "noopener",
                      class: "btn-wa",
                      style: "font-size:11px; padding:4px 10px; background:#0D9488;",
                    },
                    "💬 Beritahu: Pekerjaan Selesai"
                  )
                )
              )
            : null,
          item.photoBefore || item.photoAfter
            ? el(
                "div",
                {},
                el(
                  "strong",
                  {
                    style:
                      "font-size:11px; color:var(--ink-soft); display:block; margin-bottom:6px;",
                  },
                  "DOKUMENTASI FOTO KERJA:"
                ),
                el(
                  "div",
                  { class: "photo-proof-grid" },
                  item.photoBefore
                    ? el(
                        "div",
                        { class: "photo-box" },
                        el("div", { class: "photo-lbl" }, "BEFORE"),
                        el("img", { src: item.photoBefore })
                      )
                    : null,
                  item.photoAfter
                    ? el(
                        "div",
                        { class: "photo-box" },
                        el("div", { class: "photo-lbl" }, "AFTER"),
                        el("img", { src: item.photoAfter })
                      )
                    : null
                )
              )
            : null
        ),
        el(
          "div",
          { class: "modal-footer" },
          el(
            "button",
            {
              class: "btn-secondary",
              onclick: () => {
                detailModalOpen = false;
                spkTicketIds = [item.id];
                spkModalOpen = true;
                render();
              },
            },
            "🖨️ Cetak Lembar SPK"
          ),
          el(
            "button",
            {
              class: "btn-secondary",
              onclick: () => {
                detailModalOpen = false;
                editingId = item.id;
                formOpen = true;
                render();
              },
            },
            "✏️ Edit Data"
          ),
          el(
            "button",
            {
              class: "btn-primary",
              onclick: () => {
                detailModalOpen = false;
                render();
              },
            },
            "Tutup"
          )
        )
      )
    );
  }

  function renderSpkModal() {
    if (!spkModalOpen || spkTicketIds.length === 0) return el("div");

    const targetItems = complaints.filter((c) => spkTicketIds.includes(c.id));
    if (targetItems.length === 0) return el("div");

    return el(
      "div",
      {
        class: "modal-overlay",
        onclick: (e: any) => {
          if (e.target === e.currentTarget) {
            spkModalOpen = false;
            render();
          }
        },
      },
      el(
        "div",
        {
          class: "modal-card spk-printable-area",
          style: "max-width:760px; max-height:92vh;",
        },
        el(
          "div",
          { class: "modal-header no-print" },
          el(
            "h3",
            {},
            `🖨️ Lembar Kerja SPK Minor Repair (${targetItems.length} Dokumen)`
          ),
          el(
            "div",
            { style: "display:flex; gap:6px;" },
            el(
              "button",
              {
                class: "btn-primary",
                style: "font-size:11.5px; padding:5px 12px;",
                onclick: () => {
                  window.print();
                },
              },
              "🖨️ Print / Cetak PDF"
            ),
            el(
              "button",
              {
                class: "btn-secondary",
                style: "border:none; padding:4px 8px;",
                onclick: () => {
                  spkModalOpen = false;
                  render();
                },
              },
              "✕"
            )
          )
        ),
        el(
          "div",
          { class: "modal-body", style: "padding:16px 20px;" },
          ...targetItems.map((item, idx) => {
            const caseDetails = catInfo(item.category);
            const deadline = getDeadlineInfo(item);
            return el(
              "div",
              {
                class: "spk-sheet",
                style: `background:#FFF; color:#000; padding:16px; border:1px solid #CBD5E1; border-radius:8px; margin-bottom:${
                  idx < targetItems.length - 1 ? "20px" : "0"
                }; page-break-after: always;`,
              },
              el(
                "div",
                {
                  style:
                    "display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0284C7; padding-bottom:10px; margin-bottom:12px;",
                },
                el(
                  "div",
                  { style: "display:flex; align-items:center; gap:12px;" },
                  el("img", {
                    src: "/aetra-logo.svg",
                    style: "height:38px; width:auto; object-fit:contain;",
                    alt: "Logo PT Aetra Air Tangerang",
                  }),
                  el(
                    "div",
                    {},
                    el(
                      "div",
                      {
                        style:
                          "font-size:13px; font-weight:800; color:#0F172A;",
                      },
                      "PT AETRA AIR TANGERANG"
                    ),
                    el(
                      "div",
                      { style: "font-size:10px; color:#64748B;" },
                      "Unit Pelayanan & Pemeliharaan Jaringan Pipa Minor Repair"
                    )
                  )
                ),
                el(
                  "div",
                  { style: "text-align:right;" },
                  el(
                    "div",
                    {
                      style:
                        "font-size:12px; font-weight:800; color:#0284C7;",
                    },
                    "SURAT PERINTAH KERJA (SPK)"
                  ),
                  el(
                    "div",
                    { style: "font-size:11px; font-weight:700;" },
                    `NO: SPK-${item.id}`
                  ),
                  el(
                    "div",
                    { style: "font-size:9.5px; color:#64748B;" },
                    `Tgl: ${fmtDateOnly(new Date())}`
                  )
                )
              ),
              el(
                "table",
                {
                  style:
                    "width:100%; border-collapse:collapse; font-size:11px; margin-bottom:12px;",
                },
                el(
                  "tbody",
                  {},
                  el(
                    "tr",
                    { style: "border-bottom:1px solid #E2E8F0;" },
                    el(
                      "td",
                      { style: "width:22%; font-weight:700; padding:4px 0;" },
                      "Nama Pelanggan:"
                    ),
                    el(
                      "td",
                      { style: "width:28%; padding:4px 0;" },
                      item.customer
                    ),
                    el(
                      "td",
                      { style: "width:20%; font-weight:700; padding:4px 0;" },
                      "Petugas Lapangan:"
                    ),
                    el(
                      "td",
                      {
                        style:
                          "width:30%; padding:4px 0; font-weight:700; color:#0284C7;",
                      },
                      item.officer || "Belum Ditugaskan"
                    )
                  ),
                  el(
                    "tr",
                    { style: "border-bottom:1px solid #E2E8F0;" },
                    el(
                      "td",
                      { style: "font-weight:700; padding:4px 0;" },
                      "ID Pelanggan / Meter:"
                    ),
                    el("td", { style: "padding:4px 0;" }, item.meterId || "-"),
                    el(
                      "td",
                      { style: "font-weight:700; padding:4px 0;" },
                      "Target SLA (14 Hari):"
                    ),
                    el("td", { style: "padding:4px 0;" }, deadline.deadlineText)
                  ),
                  el(
                    "tr",
                    { style: "border-bottom:1px solid #E2E8F0;" },
                    el(
                      "td",
                      { style: "font-weight:700; padding:4px 0;" },
                      "No. Kontak / WA:"
                    ),
                    el("td", { style: "padding:4px 0;" }, item.phone || "-"),
                    el(
                      "td",
                      { style: "font-weight:700; padding:4px 0;" },
                      "Area Operasional:"
                    ),
                    el(
                      "td",
                      { style: "padding:4px 0;" },
                      item.area || "Cikupa"
                    )
                  ),
                  el(
                    "tr",
                    { style: "border-bottom:1px solid #E2E8F0;" },
                    el(
                      "td",
                      { style: "font-weight:700; padding:4px 0;" },
                      "Alamat Lengkap:"
                    ),
                    el(
                      "td",
                      { colspan: "3", style: "padding:4px 0;" },
                      item.address || "-"
                    )
                  ),
                  el(
                    "tr",
                    { style: "border-bottom:1px solid #E2E8F0;" },
                    el(
                      "td",
                      { style: "font-weight:700; padding:4px 0;" },
                      "Koordinat GPS:"
                    ),
                    el(
                      "td",
                      { colspan: "3", style: "padding:4px 0; font-family:monospace;" },
                      item.coords || "-"
                    )
                  ),
                  el(
                    "tr",
                    {},
                    el(
                      "td",
                      { style: "font-weight:700; padding:4px 0;" },
                      "Keluhan / Gejala:"
                    ),
                    el(
                      "td",
                      { colspan: "3", style: "padding:4px 0;" },
                      `[${item.category}] ${caseDetails.label} — ${
                        item.desc || "-"
                      }`
                    )
                  )
                )
              ),
              el(
                "div",
                {
                  style:
                    "background:#F8FAFC; border:1px solid #E2E8F0; padding:10px; border-radius:6px; margin-bottom:12px;",
                },
                el(
                  "div",
                  {
                    style:
                      "font-size:10.5px; font-weight:700; margin-bottom:6px; color:#334155;",
                  },
                  "CHECKLIST STANDARD PENANGANAN TEKNIS LAPANGAN:"
                ),
                el(
                  "div",
                  {
                    style:
                      "display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:10px;",
                  },
                  el(
                    "label",
                    { style: "display:flex; align-items:center; gap:6px;" },
                    el("input", { type: "checkbox", disabled: "true" }),
                    "Pemeriksaan titik kebocoran & aksesoris meter"
                  ),
                  el(
                    "label",
                    { style: "display:flex; align-items:center; gap:6px;" },
                    el("input", { type: "checkbox", disabled: "true" }),
                    "Penggantian kran / fitting / pipa sambungan"
                  ),
                  el(
                    "label",
                    { style: "display:flex; align-items:center; gap:6px;" },
                    el("input", { type: "checkbox", disabled: "true" }),
                    "Uji tekanan air & memastikan aliran lancar"
                  ),
                  el(
                    "label",
                    { style: "display:flex; align-items:center; gap:6px;" },
                    el("input", { type: "checkbox", disabled: "true" }),
                    "Foto dokumentasi kerja Sebelum & Sesudah"
                  )
                )
              ),
              el(
                "div",
                {
                  style:
                    "display:flex; justify-content:space-between; margin-top:20px; text-align:center; font-size:11px;",
                },
                el(
                  "div",
                  { style: "width:40%;" },
                  el("div", {}, "Petugas Lapangan,"),
                  el("div", { style: "height:48px;" }),
                  el(
                    "div",
                    {
                      style:
                        "border-bottom:1px solid #000; width:80%; margin:0 auto; font-weight:700;",
                    },
                    item.officer || "Petugas Aetra"
                  ),
                  el(
                    "div",
                    { style: "font-size:9.5px; color:#64748B;" },
                    "NIP / ID Petugas"
                  )
                ),
                el(
                  "div",
                  { style: "width:40%;" },
                  el("div", {}, "Pelanggan / Penerima Manfaat,"),
                  el("div", { style: "height:48px;" }),
                  el(
                    "div",
                    {
                      style:
                        "border-bottom:1px solid #000; width:80%; margin:0 auto; font-weight:700;",
                    },
                    item.customer
                  ),
                  el(
                    "div",
                    { style: "font-size:9.5px; color:#64748B;" },
                    "Tanda Tangan & Nama Jelas"
                  )
                )
              )
            );
          })
        ),
        el(
          "div",
          { class: "modal-footer no-print" },
          el(
            "button",
            {
              class: "btn-primary",
              onclick: () => {
                window.print();
              },
            },
            "🖨️ Cetak / Simpan PDF Sekarang"
          ),
          el(
            "button",
            {
              class: "btn-secondary",
              onclick: () => {
                spkModalOpen = false;
                render();
              },
            },
            "Tutup"
          )
        )
      )
    );
  }

  async function bulkUpdateTicketStatus(
    ids: string[],
    newStatus: "menunggu" | "proses" | "selesai"
  ) {
    if (ids.length === 0) return;

    const statusLabels: Record<string, string> = {
      menunggu: "Menunggu (Pending)",
      proses: "Dalam Proses (In Progress)",
      selesai: "Selesai (Completed)",
    };
    const label = statusLabels[newStatus] || newStatus;

    if (newStatus === "selesai" && ids.length > 1) {
      // @ts-ignore
      if ((window as any).Swal) {
        // @ts-ignore
        const confirmResult = await (window as any).Swal.fire({
          title: "Selesaikan Work Order Terpilih?",
          text: `Apakah Anda yakin ingin mengubah status ${ids.length} Work Order terpilih menjadi 'Selesai'?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Ya, Tandai Selesai",
          cancelButtonText: "Batal",
          confirmButtonColor: "#10B981",
        });
        if (!confirmResult.isConfirmed) return;
      }
    }

    // Update locally in memory
    for (const id of ids) {
      const ticket = complaints.find((c) => c.id === id);
      if (ticket) {
        ticket.status = newStatus;
      }
    }
    saveLocal();
    render();

    // Update in Supabase cloud
    try {
      if (sb) {
        await sb.from(TABLE).update({ status: newStatus }).in("id", ids);
      }
    } catch (e) {
      console.error("Gagal update status massal di cloud:", e);
    }

    // Show SweetAlert2 feedback
    // @ts-ignore
    if ((window as any).Swal) {
      // @ts-ignore
      (window as any).Swal.fire({
        icon: "success",
        title: "Status Berhasil Diperbarui!",
        text: `${ids.length} Work Order berhasil diubah statusnya menjadi '${label}'.`,
        timer: 1700,
        showConfirmButton: false,
      });
    }

    selectedTicketIds.clear();
    render();
  }

  function renderBatchActionBar(visibleItems: ComplaintItem[]) {
    if (selectedTicketIds.size === 0) return el("div");

    const selectedIds = Array.from(selectedTicketIds);

    return el(
      "div",
      { class: "batch-action-bar", id: "floating-batch-action-bar" },
      el(
        "div",
        { style: "display:flex; align-items:center; gap:8px; flex-wrap:wrap;" },
        el(
          "span",
          { class: "batch-count-badge" },
          `☑️ ${selectedTicketIds.size} Terpilih`
        ),
        el(
          "button",
          {
            class: "btn-secondary",
            style:
              "background:rgba(255,255,255,0.15); color:#FFF; border:none; padding:4px 9px; font-size:11px; font-weight:600; cursor:pointer;",
            onclick: () => {
              if (selectedTicketIds.size === visibleItems.length) {
                selectedTicketIds.clear();
              } else {
                visibleItems.forEach((c) => selectedTicketIds.add(c.id));
              }
              render();
            },
          },
          selectedTicketIds.size === visibleItems.length
            ? "✕ Batalkan Pilihan"
            : `Pilih Semua (${visibleItems.length})`
        )
      ),
      el(
        "div",
        { class: "batch-actions-group" },
        // Bulk Status Update Controls
        el(
          "div",
          {
            style:
              "display:flex; align-items:center; gap:5px; background:rgba(0,0,0,0.3); padding:3px 7px; border-radius:8px; border:1px solid rgba(255,255,255,0.12);",
          },
          el(
            "span",
            {
              style:
                "font-size:10.5px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.5px; margin-right:2px;",
            },
            "Ubah Status:"
          ),
          el(
            "button",
            {
              class: "batch-btn-status batch-btn-progress",
              title:
                "Ubah status semua Work Order terpilih menjadi 'Dalam Proses' (In Progress)",
              onclick: () => bulkUpdateTicketStatus(selectedIds, "proses"),
            },
            "▶️ In Progress"
          ),
          el(
            "button",
            {
              class: "batch-btn-status batch-btn-pending",
              title:
                "Ubah status semua Work Order terpilih menjadi 'Menunggu' (Pending)",
              onclick: () => bulkUpdateTicketStatus(selectedIds, "menunggu"),
            },
            "⏳ Pending"
          ),
          el(
            "button",
            {
              class: "batch-btn-status batch-btn-done",
              title:
                "Ubah status semua Work Order terpilih menjadi 'Selesai' (Completed)",
              onclick: () => bulkUpdateTicketStatus(selectedIds, "selesai"),
            },
            "✅ Selesai"
          )
        ),
        // Officer Assignment Dropdown
        el(
          "select",
          {
            style:
              "padding:5px 9px; font-size:11px; border-radius:6px; background:#334155; color:#F8FAFC; border:1px solid #475569; font-weight:600; cursor:pointer;",
            onchange: async (e: any) => {
              const targetOff = e.target.value;
              if (!targetOff) return;
              for (const id of selectedIds) {
                await assignOfficerToWO(id, targetOff);
              }
              // @ts-ignore
              if ((window as any).Swal) {
                // @ts-ignore
                (window as any).Swal.fire(
                  "Ditugaskan!",
                  `${selectedIds.length} Work Order berhasil dialokasikan ke 👷 ${targetOff}.`,
                  "success"
                );
              }
              selectedTicketIds.clear();
              render();
            },
          },
          el("option", { value: "" }, "👷 Tugaskan Terpilih ke..."),
          ...OFFICERS.map((off) => el("option", { value: off }, `👷 ${off}`))
        ),
        el(
          "button",
          {
            class: "btn-secondary",
            style:
              "background:#4338CA; color:#FFF; border:none; padding:5px 10px; font-size:11px; font-weight:700;",
            onclick: () => {
              spkTicketIds = Array.from(selectedTicketIds);
              spkModalOpen = true;
              render();
            },
          },
          `🖨️ Cetak SPK (${selectedTicketIds.size})`
        ),
        el(
          "button",
          {
            class: "btn-secondary",
            style:
              "background:#991B1B; color:#FFF; border:none; padding:5px 10px; font-size:11px; font-weight:700;",
            onclick: async () => {
              // @ts-ignore
              if ((window as any).Swal) {
                // @ts-ignore
                const res = await (window as any).Swal.fire({
                  title: "Hapus Work Order?",
                  text: `Apakah Anda yakin ingin menghapus ${selectedTicketIds.size} Work Order terpilih?`,
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Ya, Hapus!",
                  cancelButtonText: "Batal",
                  confirmButtonColor: "#EF4444",
                });
                if (!res.isConfirmed) return;
              }
              for (const id of selectedIds) {
                await removeComplaint(id);
              }
              selectedTicketIds.clear();
              render();
            },
          },
          "🗑️ Hapus"
        ),
        el(
          "button",
          {
            class: "btn-secondary",
            style: "border:none; padding:5px 9px; font-size:11px; cursor:pointer;",
            onclick: () => {
              selectedTicketIds.clear();
              render();
            },
          },
          "✕ Batal"
        )
      )
    );
  }

  interface OfficerDailyRouteData {
    officer: string;
    color: { main: string; bg: string; border: string };
    activeTickets: ComplaintItem[];
    orderedTickets: ComplaintItem[];
    totalDistanceKm: number;
    estTravelMinutes: number;
    estTotalMinutes: number;
    urgentCount: number;
    areas: string[];
    googleMapsUrl: string;
    whatsappUrl: string;
  }

  function calculateOfficerDailyRoute(officer: string): OfficerDailyRouteData {
    const color = getOfficerColor(officer);
    const activeTickets = complaints.filter(
      (c) => c.officer === officer && c.status !== "selesai"
    );

    let orderedTickets: ComplaintItem[] = [];
    const customOrder = officerOptimizedOrders[officer];

    if (customOrder && customOrder.length > 0) {
      const orderMap = new Map(customOrder.map((id, idx) => [id, idx]));
      orderedTickets = [...activeTickets].sort(
        (a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999)
      );
    } else {
      const withCoords = activeTickets.filter((c) => parseCoords(c.coords));
      const withoutCoords = activeTickets.filter((c) => !parseCoords(c.coords));

      const unvisitedUrgent = withCoords.filter((c) => c.urgent);
      const unvisitedNormal = withCoords.filter((c) => !c.urgent);

      let curr = { lat: OFFICE_COORDS.lat, lng: OFFICE_COORDS.lng };
      const res: ComplaintItem[] = [];

      // Prioritize urgent work orders first
      while (unvisitedUrgent.length > 0) {
        let nearestIdx = 0;
        let minDist = Infinity;
        for (let i = 0; i < unvisitedUrgent.length; i++) {
          const c = parseCoords(unvisitedUrgent[i].coords);
          if (c) {
            const dist = calcDistanceKm(curr.lat, curr.lng, c.lat, c.lng);
            if (dist < minDist) {
              minDist = dist;
              nearestIdx = i;
            }
          }
        }
        const nextItem = unvisitedUrgent.splice(nearestIdx, 1)[0];
        res.push(nextItem);
        const nextC = parseCoords(nextItem.coords);
        if (nextC) curr = nextC;
      }

      // Then optimize regular work orders by nearest proximity
      while (unvisitedNormal.length > 0) {
        let nearestIdx = 0;
        let minDist = Infinity;
        for (let i = 0; i < unvisitedNormal.length; i++) {
          const c = parseCoords(unvisitedNormal[i].coords);
          if (c) {
            const dist = calcDistanceKm(curr.lat, curr.lng, c.lat, c.lng);
            if (dist < minDist) {
              minDist = dist;
              nearestIdx = i;
            }
          }
        }
        const nextItem = unvisitedNormal.splice(nearestIdx, 1)[0];
        res.push(nextItem);
        const nextC = parseCoords(nextItem.coords);
        if (nextC) curr = nextC;
      }

      orderedTickets = [...res, ...withoutCoords];
    }

    // Distance calculation
    let totalDistanceKm = 0;
    let prevPoint = { lat: OFFICE_COORDS.lat, lng: OFFICE_COORDS.lng };
    orderedTickets.forEach((t) => {
      const c = parseCoords(t.coords);
      if (c) {
        totalDistanceKm += calcDistanceKm(
          prevPoint.lat,
          prevPoint.lng,
          c.lat,
          c.lng
        );
        prevPoint = c;
      }
    });
    totalDistanceKm = Math.round(totalDistanceKm * 10) / 10;
    const estTravelMinutes = Math.round((totalDistanceKm / 25) * 60);
    const estTotalMinutes = estTravelMinutes + orderedTickets.length * 30;

    const urgentCount = orderedTickets.filter((t) => t.urgent).length;
    const uniqueAreas = Array.from(
      new Set(orderedTickets.map((t) => t.area || "Cikupa"))
    );

    // Multi-stop Google Maps URL
    const ticketsWithCoords = orderedTickets.filter((t) => parseCoords(t.coords));
    let googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=Aetra+Air+Tangerang+Cikupa`;
    if (ticketsWithCoords.length === 1) {
      const c = parseCoords(ticketsWithCoords[0].coords)!;
      googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${OFFICE_COORDS.lat},${OFFICE_COORDS.lng}&destination=${c.lat},${c.lng}&travelmode=driving`;
    } else if (ticketsWithCoords.length > 1) {
      const last = parseCoords(ticketsWithCoords[ticketsWithCoords.length - 1].coords)!;
      const waypoints = ticketsWithCoords
        .slice(0, -1)
        .map((t) => {
          const c = parseCoords(t.coords)!;
          return `${c.lat},${c.lng}`;
        })
        .join("|");
      googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${OFFICE_COORDS.lat},${OFFICE_COORDS.lng}&destination=${last.lat},${last.lng}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`;
    }

    // WhatsApp Dispatch Message
    const dateStr = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const stopsText = orderedTickets
      .map((t, i) => {
        return `${i + 1}. [${t.id}] ${t.customer}\n   📍 ${t.address || t.area || "-"}\n   🔧 ${t.category} ${t.urgent ? "🚨(URGENT)" : ""}`;
      })
      .join("\n\n");

    const waMsg = `*📋 RUTE HARIAN WORK ORDER MINOR REPAIR*\nPetugas: 👷 ${officer}\nTanggal: 📅 ${dateStr}\nTotal Kasus: ${orderedTickets.length} Titik (${urgentCount} Kasus Urgent)\nEstimasi Jarak: 🚗 ${totalDistanceKm} km (~${Math.floor(estTotalMinutes / 60)} jam ${estTotalMinutes % 60} mnt)\n\n*Urutan Kunjungan (Itinerary):*\n${stopsText}\n\n*Buka Rute Navigasi Google Maps:*\n${googleMapsUrl}\n\n_Mohon utamakan keselamatan kerja & K3!_`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(waMsg)}`;

    return {
      officer,
      color,
      activeTickets,
      orderedTickets,
      totalDistanceKm,
      estTravelMinutes,
      estTotalMinutes,
      urgentCount,
      areas: uniqueAreas,
      googleMapsUrl,
      whatsappUrl,
    };
  }

  function generateDailyRoutesForAllOfficers() {
    OFFICERS.forEach((officer) => {
      delete officerOptimizedOrders[officer];
      const data = calculateOfficerDailyRoute(officer);
      officerOptimizedOrders[officer] = data.orderedTickets.map((t) => t.id);
    });
    routeOptimizedOrder = [];
    lastRouteGeneratedTimestamp = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // @ts-ignore
    if ((window as any).Swal) {
      const activeCount = OFFICERS.filter(
        (o) => complaints.filter((c) => c.officer === o && c.status !== "selesai").length > 0
      ).length;
      // @ts-ignore
      (window as any).Swal.fire({
        title: "⚡ Rute Harian Berhasil Dibuat!",
        html: `Saran rute patroli harian telah dihitung optimal untuk <b>${activeCount} petugas lapangan aktif</b> berdasarkan kedekatan lokasi dari Kantor Cikupa & penanganan kasus urgent terlebih dahulu.`,
        icon: "success",
        confirmButtonColor: "#2563EB",
      });
    }
    render();
  }

  function renderDailyRouteSheetModal() {
    if (!dailyRouteModalOfficer) return el("div");
    const officer = dailyRouteModalOfficer;
    const data = calculateOfficerDailyRoute(officer);
    const color = data.color;

    return el(
      "div",
      {
        class: "modal-overlay",
        onclick: (e: any) => {
          if (e.target === e.currentTarget) {
            dailyRouteModalOfficer = null;
            render();
          }
        },
      },
      el(
        "div",
        {
          class: "modal-card route-sheet-printable-area",
          style: "max-width:820px; max-height:92vh; overflow-y:auto; padding:20px 24px;",
        },
        el(
          "div",
          {
            class: "modal-header no-print",
            style: "border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:16px;",
          },
          el(
            "div",
            {},
            el(
              "h3",
              { style: "margin:0; font-size:16px; font-weight:800;" },
              `📄 Lembar Manifest Rute Harian - ${officer}`
            ),
            el(
              "p",
              { style: "margin:3px 0 0; font-size:11.5px; color:var(--ink-soft);" },
              "Saran itinerary resmi perjalanan lapangan Minor Repair PT Aetra Air Tangerang"
            )
          ),
          el(
            "div",
            { style: "display:flex; gap:6px;" },
            el(
              "button",
              {
                class: "btn-primary",
                style: "font-size:11px; padding:5px 12px;",
                onclick: () => window.print(),
              },
              "🖨️ Cetak Lembar Rute"
            ),
            el(
              "a",
              {
                href: data.whatsappUrl,
                target: "_blank",
                rel: "noopener",
                class: "btn-card-action whatsapp",
                style: "font-size:11px; padding:5px 10px;",
              },
              "📲 Kirim WhatsApp"
            ),
            el(
              "button",
              {
                class: "btn-secondary",
                style: "border:none; padding:4px 8px;",
                onclick: () => {
                  dailyRouteModalOfficer = null;
                  render();
                },
              },
              "✕"
            )
          )
        ),
        // Sheet Printable Content
        el(
          "div",
          {},
          // Aetra Header
          el(
            "div",
            {
              style:
                "display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #1E3A8A; padding-bottom:10px; margin-bottom:14px;",
            },
            el(
              "div",
              { style: "display:flex; align-items:center; gap:12px;" },
              el("img", {
                src: "/aetra-logo.svg",
                style: "height:40px; width:auto; object-fit:contain;",
                alt: "Logo PT Aetra Air Tangerang",
              }),
              el(
                "div",
                {},
                el(
                  "div",
                  {
                    style:
                      "font-size:17px; font-weight:900; color:#1E3A8A; letter-spacing:-0.5px;",
                  },
                  "PT AETRA AIR TANGERANG"
                ),
                el(
                  "div",
                  { style: "font-size:11.5px; font-weight:700; color:#475569;" },
                  "UNIT OPERASIONAL MINOR REPAIR CIKUPA"
                ),
                el(
                  "div",
                  { style: "font-size:10px; color:#64748B;" },
                  "Jl. Raya Cikupa No. 45, Cikupa, Tangerang, Banten"
                )
              )
            ),
            el(
              "div",
              { style: "text-align:right;" },
              el(
                "div",
                { style: "font-size:13px; font-weight:800; color:#1E293B;" },
                "LEMBAR PENUGASAN RUTE HARIAN"
              ),
              el(
                "div",
                { style: "font-size:11px; color:#64748B;" },
                `Tanggal: ${new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}`
              ),
              el(
                "div",
                {
                  style: `font-size:11px; font-weight:800; color:${color.main};`,
                },
                `Petugas: ${officer}`
              )
            )
          ),
          // Route Summary Stats
          el(
            "div",
            {
              style:
                "display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; margin-bottom:14px;",
            },
            el(
              "div",
              {
                style:
                  "border:1px solid #CBD5E1; border-radius:6px; padding:8px 10px; background:#F8FAFC;",
              },
              el(
                "div",
                { style: "font-size:10px; color:#64748B; font-weight:600;" },
                "Total Titik Pekerjaan"
              ),
              el(
                "div",
                { style: "font-size:15px; font-weight:800; color:#1E293B;" },
                `${data.orderedTickets.length} Lokasi`
              )
            ),
            el(
              "div",
              {
                style:
                  "border:1px solid #CBD5E1; border-radius:6px; padding:8px 10px; background:#F8FAFC;",
              },
              el(
                "div",
                { style: "font-size:10px; color:#64748B; font-weight:600;" },
                "Estimasi Jarak Tempuh"
              ),
              el(
                "div",
                { style: "font-size:15px; font-weight:800; color:#2563EB;" },
                `${data.totalDistanceKm} km`
              )
            ),
            el(
              "div",
              {
                style:
                  "border:1px solid #CBD5E1; border-radius:6px; padding:8px 10px; background:#F8FAFC;",
              },
              el(
                "div",
                { style: "font-size:10px; color:#64748B; font-weight:600;" },
                "Est. Durasi Shift"
              ),
              el(
                "div",
                { style: "font-size:15px; font-weight:800; color:#059669;" },
                `~${Math.floor(data.estTotalMinutes / 60)}j ${data.estTotalMinutes % 60}m`
              )
            ),
            el(
              "div",
              {
                style:
                  "border:1px solid #CBD5E1; border-radius:6px; padding:8px 10px; background:#F8FAFC;",
              },
              el(
                "div",
                { style: "font-size:10px; color:#64748B; font-weight:600;" },
                "Kasus Prioritas Urgent"
              ),
              el(
                "div",
                {
                  style: `font-size:15px; font-weight:800; color:${data.urgentCount > 0 ? "#DC2626" : "#475569"};`,
                },
                `${data.urgentCount} Urgent`
              )
            )
          ),
          // Route Table
          el(
            "table",
            {
              style:
                "width:100%; border-collapse:collapse; font-size:11px; margin-bottom:16px;",
            },
            el(
              "thead",
              {},
              el(
                "tr",
                { style: "background:#F1F5F9; border-bottom:2px solid #CBD5E1;" },
                el(
                  "th",
                  { style: "padding:6px 8px; text-align:center; width:45px;" },
                  "Stop"
                ),
                el(
                  "th",
                  { style: "padding:6px 8px; text-align:left; width:90px;" },
                  "No. WO"
                ),
                el(
                  "th",
                  { style: "padding:6px 8px; text-align:left; width:130px;" },
                  "Pelanggan & Telp"
                ),
                el(
                  "th",
                  { style: "padding:6px 8px; text-align:left;" },
                  "Alamat & Area"
                ),
                el(
                  "th",
                  { style: "padding:6px 8px; text-align:left; width:110px;" },
                  "Kategori"
                ),
                el(
                  "th",
                  { style: "padding:6px 8px; text-align:center; width:65px;" },
                  "Status"
                ),
                el(
                  "th",
                  { style: "padding:6px 8px; text-align:center; width:90px;" },
                  "TTD Pelanggan"
                )
              )
            ),
            el(
              "tbody",
              {},
              ...data.orderedTickets.map((t, idx) => {
                return el(
                  "tr",
                  { style: "border-bottom:1px solid #E2E8F0;" },
                  el(
                    "td",
                    {
                      style: `padding:8px 6px; text-align:center; font-weight:800; color:${color.main};`,
                    },
                    `#${idx + 1}`
                  ),
                  el(
                    "td",
                    {
                      style:
                        "padding:8px 6px; font-family:monospace; font-weight:700;",
                    },
                    t.id
                  ),
                  el(
                    "td",
                    { style: "padding:8px 6px;" },
                    el("div", { style: "font-weight:700;" }, t.customer),
                    el(
                      "div",
                      { style: "font-size:9.5px; color:#64748B;" },
                      t.phone || t.meterId || "-"
                    )
                  ),
                  el(
                    "td",
                    { style: "padding:8px 6px;" },
                    el("div", {}, t.address || "-"),
                    el(
                      "div",
                      {
                        style:
                          "font-size:9.5px; font-weight:600; color:#0284C7;",
                      },
                      `Area: ${t.area || "-"}`
                    )
                  ),
                  el(
                    "td",
                    { style: "padding:8px 6px;" },
                    el(
                      "span",
                      {
                        style:
                          "font-weight:700; font-size:10px; background:#FEF3C7; color:#92400E; padding:1px 5px; border-radius:4px;",
                      },
                      t.category
                    ),
                    t.urgent
                      ? el(
                          "div",
                          {
                            style:
                              "color:#DC2626; font-size:9.5px; font-weight:800; margin-top:2px;",
                          },
                          "🚨 URGENT"
                        )
                      : null
                  ),
                  el(
                    "td",
                    { style: "padding:8px 6px; text-align:center;" },
                    el(
                      "span",
                      {
                        style:
                          "font-size:10px; text-transform:uppercase; font-weight:700;",
                      },
                      t.status
                    )
                  ),
                  el(
                    "td",
                    {
                      style:
                        "padding:8px 6px; border:1px dashed #CBD5E1; height:36px;",
                    },
                    ""
                  )
                );
              })
            )
          ),
          // Signature Block
          el(
            "div",
            {
              style:
                "display:flex; justify-content:space-between; margin-top:24px; font-size:11px; page-break-inside:avoid;",
            },
            el(
              "div",
              { style: "text-align:center; width:180px;" },
              el("div", {}, "Diserahkan Oleh:"),
              el(
                "div",
                {
                  style:
                    "margin-top:45px; font-weight:700; border-top:1px solid #94A3B8; padding-top:4px;",
                },
                "Supervisor Lapangan"
              )
            ),
            el(
              "div",
              { style: "text-align:center; width:180px;" },
              el("div", {}, "Diterima & Dikerjakan:"),
              el(
                "div",
                {
                  style:
                    "margin-top:45px; font-weight:700; border-top:1px solid #94A3B8; padding-top:4px;",
                },
                officer
              )
            )
          )
        )
      )
    );
  }

  function renderProactiveSlaAlertBanner(
    breaches: ReturnType<typeof getHighPrioritySlaBreaches>,
    overdueCount: number
  ) {
    if (breaches.length === 0) {
      if (overdueCount > 0) {
        return el(
          "div",
          { class: "sla-alert-banner" },
          el(
            "span",
            {},
            `⚠️ Terdapat ${overdueCount} Work Order yang telah melewati batas waktu SLA (Overdue). Mohon secepatnya ditindaklanjuti.`
          ),
          el(
            "button",
            {
              class: "btn-secondary",
              style: "font-size:10.5px; padding:3px 6px;",
              onclick: () => {
                quickFilter = "urgent";
                render();
              },
            },
            "Tampilkan Urgent"
          )
        );
      }
      return null;
    }

    // Play proactive sound chime if not silenced
    playProactiveAlertChime();

    if (slaBannerDismissed) {
      return el(
        "div",
        {
          class: "sla-dismissed-ribbon",
          onclick: () => {
            slaBannerDismissed = false;
            render();
          },
          title: "Klik untuk membuka peringatan SLA kembali",
        },
        el(
          "div",
          { style: "display:flex; align-items:center; gap:6px;" },
          el("span", { class: "sla-beacon-dot" }),
          el("span", {}, `🚨 Terdapat ${breaches.length} Work Order Kritis Melebihi Batas SLA (${urgentSlaHoursLimit}h)`)
        ),
        el("button", { class: "sla-toggle-btn" }, "Buka Peringatan ▼")
      );
    }

    if (slaBannerCollapsed) {
      return el(
        "div",
        { class: "proactive-sla-container collapsed", id: "proactive-sla-alert-banner" },
        el(
          "div",
          { class: "proactive-sla-header", style: "width:100%; display:flex; align-items:center; justify-content:space-between;" },
          el(
            "div",
            { style: "display:flex; align-items:center; gap:6px; flex-wrap:wrap;" },
            el("span", { class: "sla-beacon-dot" }),
            el(
              "span",
              { style: "font-size:11.5px; font-weight:800; color:#991B1B;" },
              `🚨 Peringatan SLA Kritis: ${breaches.length} WO Overdue (>${urgentSlaHoursLimit} Jam)`
            ),
            el(
              "span",
              { style: "font-size:10px; color:#991B1B; background:#FEE2E2; padding:1px 6px; border-radius:4px; font-weight:700;" },
              breaches.map((b) => b.ticket.id).join(", ")
            )
          ),
          el(
            "div",
            { style: "display:flex; align-items:center; gap:5px;" },
            breaches.length > 1
              ? el(
                  "button",
                  {
                    class: "btn-reassign-quick",
                    title: "Alihkan semua WO kritis ke teknisi rekomendasi",
                    onclick: () => executeAutoReassignAll(breaches),
                  },
                  `⚡ Alihkan Semua (${breaches.length})`
                )
              : null,
            el(
              "button",
              {
                class: "sla-toggle-btn",
                title: "Buka rincian lengkap kasus SLA",
                onclick: () => {
                  slaBannerCollapsed = false;
                  render();
                },
              },
              `▼ Rincian (${breaches.length})`
            ),
            el(
              "button",
              {
                class: "btn-secondary",
                style: "font-size:10px; padding:2px 5px; color:#991B1B; border-color:#FCA5A5; cursor:pointer;",
                title: "Tutup sementara peringatan",
                onclick: () => {
                  slaBannerDismissed = true;
                  render();
                },
              },
              "✕"
            )
          )
        )
      );
    }

    return el(
      "div",
      { class: "proactive-sla-container", id: "proactive-sla-alert-banner" },
      // Header
      el(
        "div",
        { class: "proactive-sla-header" },
        el(
          "div",
          { style: "display:flex; align-items:center; gap:6px;" },
          el("span", { class: "sla-beacon-dot" }),
          el(
            "span",
            { style: "font-size:11.5px; font-weight:800; color:#991B1B;" },
            `🚨 Peringatan SLA Kritis: ${breaches.length} WO Melebihi Batas Waktu`
          )
        ),
        el(
          "div",
          { style: "display:flex; align-items:center; gap:5px; flex-wrap:wrap;" },
          el(
            "span",
            { style: "font-size:10px; font-weight:700; color:#991B1B;" },
            "Target:"
          ),
          el(
            "select",
            {
              style:
                "font-size:10px; font-weight:600; padding:1px 5px; border-radius:4px; border:1px solid #FCA5A5; background:#FFF; color:#991B1B;",
              onchange: (e: any) => {
                urgentSlaHoursLimit = parseInt(e.target.value) || 24;
                render();
              },
            },
            el(
              "option",
              { value: "24", selected: urgentSlaHoursLimit === 24 ? "selected" : null },
              "24 Jam"
            ),
            el(
              "option",
              { value: "48", selected: urgentSlaHoursLimit === 48 ? "selected" : null },
              "48 Jam"
            ),
            el(
              "option",
              { value: "72", selected: urgentSlaHoursLimit === 72 ? "selected" : null },
              "72 Jam"
            ),
            el(
              "option",
              { value: "336", selected: urgentSlaHoursLimit === 336 ? "selected" : null },
              "14 Hari"
            )
          ),
          el(
            "button",
            {
              class: "btn-secondary",
              style: "font-size:10px; padding:2px 5px;",
              title: soundAlertEnabled ? "Matikan suara notifikasi" : "Nyalakan suara notifikasi",
              onclick: () => {
                soundAlertEnabled = !soundAlertEnabled;
                render();
              },
            },
            soundAlertEnabled ? "🔔" : "🔕"
          ),
          el(
            "button",
            {
              class: "btn-secondary",
              style:
                "font-size:10px; padding:2px 5px; background:#EFF6FF; border-color:#93C5FD; color:#1E40AF;",
              title: "Buat kasus uji coba simulasi SLA",
              onclick: () => {
                triggerSlaSimulation();
              },
            },
            "🧪 Uji Coba"
          ),
          breaches.length > 1
            ? el(
                "button",
                {
                  class: "btn-reassign-quick",
                  style: "padding:2px 7px; font-size:10px;",
                  onclick: () => {
                    executeAutoReassignAll(breaches);
                  },
                },
                `⚡ Alihkan Semua (${breaches.length})`
              )
            : null,
          el(
            "button",
            {
              class: "sla-toggle-btn",
              title: "Ciutkan tampilan banner agar hemat tempat",
              onclick: () => {
                slaBannerCollapsed = true;
                render();
              },
            },
            "▲ Ciutkan"
          ),
          el(
            "button",
            {
              class: "btn-secondary",
              style: "font-size:10px; padding:2px 5px; color:#991B1B; border-color:#FCA5A5;",
              title: "Tutup sementara peringatan",
              onclick: () => {
                slaBannerDismissed = true;
                render();
              },
            },
            "✕"
          )
        )
      ),
      // List of breach cards
      el(
        "div",
        { class: "sla-breach-cards-list" },
        ...breaches.map((b) => {
          const item = b.ticket;
          const best = b.suggestion.bestCandidate;
          const currentOff = item.officer || "Belum Ditugaskan";
          const cat = catInfo(item.category);

          return el(
            "div",
            { class: "sla-breach-item-card" },
            // Left meta
            el(
              "div",
              { class: "sla-item-meta" },
              el(
                "div",
                { style: "display:flex; align-items:center; gap:5px; flex-wrap:wrap;" },
                el("strong", { style: "color:#1E293B; font-size:11.5px;" }, item.id),
                el(
                  "span",
                  { class: "sla-overdue-tag" },
                  `⏳ +${b.overdueHours}h`
                ),
                el(
                  "span",
                  {
                    style:
                      "font-size:9.5px; font-weight:700; background:#FEE2E2; color:#B91C1C; padding:1px 5px; border-radius:3px;",
                  },
                  cat.key
                ),
                el(
                  "span",
                  { style: "font-size:11px; color:#475569;" },
                  `Pelanggan: <b>${item.customer}</b> (${item.area || "Area"}) • Petugas: <b style="color:#B91C1C;">👷 ${currentOff}</b>`
                )
              )
            ),
            // Middle suggestion chip
            el(
              "div",
              { class: "sla-suggestion-chip" },
              el("span", { style: "font-size:13px;" }, "💡"),
              el(
                "div",
                { style: "display:flex; align-items:center; gap:4px; font-size:10.5px;" },
                el(
                  "span",
                  { style: "font-weight:700; color:#166534;" },
                  `Saran: 👷 ${best.officer}`
                ),
                el(
                  "span",
                  { style: "color:#15803D; font-size:10px;" },
                  `(~${best.distanceKm} km • ${best.activeCount} aktif)`
                )
              )
            ),
            // Right actions
            el(
              "div",
              { style: "display:flex; align-items:center; gap:4px; flex-shrink:0;" },
              el(
                "button",
                {
                  class: "btn-reassign-quick",
                  title: `Alihkan WO ${item.id} ke ${best.officer}`,
                  onclick: () => {
                    executeAutoReassignment(item.id, best.officer, b.suggestion.reason);
                  },
                },
                `⚡ Alihkan`
              ),
              el(
                "button",
                {
                  class: "btn-radar-inspect",
                  title: "Lihat radar teknisi dan estimasi jarak",
                  onclick: () => {
                    slaRadarTargetTicketId = item.id;
                    slaRadarModalOpen = true;
                    render();
                  },
                },
                "🗺️ Radar"
              ),
              el(
                "button",
                {
                  class: "btn-secondary",
                  style: "font-size:10px; padding:3px 6px;",
                  title: "Buka detail lengkap tiket",
                  onclick: () => {
                    detailTargetId = item.id;
                    detailModalOpen = true;
                    render();
                  },
                },
                "Detail"
              )
            )
          );
        })
      )
    );
  }

  function renderSlaReassignModal() {
    if (!slaRadarModalOpen || !slaRadarTargetTicketId) return el("div");
    const ticket = complaints.find((c) => c.id === slaRadarTargetTicketId);
    if (!ticket) return el("div");

    const suggestion = getClosestAvailableTechnicianSuggestion(ticket);
    const best = suggestion.bestCandidate;
    const cat = catInfo(ticket.category);

    const elapsedMs = Date.now() - new Date(ticket.receivedAt).getTime();
    const elapsedHours = Math.round(elapsedMs / (1000 * 3600));
    const targetHours = ticket.urgent ? urgentSlaHoursLimit : urgentSlaHoursLimit * 2;
    const overdueHours = Math.max(elapsedHours - targetHours, 1);

    // Leaflet map initialization
    setTimeout(() => {
      const container = document.getElementById("sla-radar-map-container");
      if (!container) return;

      if (slaRadarMapObj) {
        slaRadarMapObj.remove();
        slaRadarMapObj = null;
      }

      // @ts-ignore
      if (typeof L === "undefined") return;

      const tCoords = suggestion.ticketCoords;
      // @ts-ignore
      const map = L.map(container).setView([tCoords.lat, tCoords.lng], 13);
      slaRadarMapObj = map;

      // @ts-ignore
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      // Marker for Overdue Ticket (Pulsing Red)
      // @ts-ignore
      const ticketIcon = L.divIcon({
        className: "custom-div-icon",
        html: `
          <div style="background:#DC2626; color:#FFF; font-weight:800; font-size:11px; padding:4px 8px; border-radius:12px; box-shadow:0 0 0 4px rgba(220, 38, 38, 0.4); border:2px solid #FFF; display:flex; align-items:center; gap:4px; white-space:nowrap;">
            🚨 ${ticket.id} (${ticket.area})
          </div>
        `,
        iconSize: [110, 30],
        iconAnchor: [55, 15],
      });

      // @ts-ignore
      L.marker([tCoords.lat, tCoords.lng], { icon: ticketIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-size:12px; line-height:1.5;">
            <b style="color:#DC2626;">🚨 WO Overdue: ${ticket.id}</b><br/>
            Pelanggan: <b>${ticket.customer}</b><br/>
            Kategori: ${cat.label}<br/>
            Terlambat: <b>+${overdueHours} Jam</b><br/>
            Petugas Sekarang: ${ticket.officer || "Belum Ditugaskan"}
          </div>
        `)
        .openPopup();

      const allLatLngs: [number, number][] = [[tCoords.lat, tCoords.lng]];

      // Add technician markers
      for (const cand of suggestion.allCandidates) {
        const isBest = cand.officer === best.officer;
        const isCurrent = cand.isCurrent;
        allLatLngs.push([cand.locationCoords.lat, cand.locationCoords.lng]);

        const bgCol = isBest ? "#16A34A" : isCurrent ? "#EA580C" : cand.color.main;
        const iconLabel = isBest
          ? `⭐ ${cand.officer}`
          : isCurrent
          ? `⚠️ ${cand.officer} (Kini)`
          : `👷 ${cand.officer}`;

        // @ts-ignore
        const officerIcon = L.divIcon({
          className: "custom-div-icon",
          html: `
            <div style="background:${bgCol}; color:#FFF; font-weight:700; font-size:10px; padding:3px 7px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.3); border:1.5px solid #FFF; display:flex; align-items:center; gap:3px; white-space:nowrap;">
              ${iconLabel} (~${cand.distanceKm}km)
            </div>
          `,
          iconSize: [120, 26],
          iconAnchor: [60, 13],
        });

        // @ts-ignore
        L.marker([cand.locationCoords.lat, cand.locationCoords.lng], {
          icon: officerIcon,
        }).addTo(map).bindPopup(`
            <div style="font-size:11.5px; line-height:1.4;">
              <b style="color:${bgCol};">${cand.officer}</b><br/>
              Jarak: <b>${cand.distanceKm} km</b> (~${cand.estTravelMin} mnt)<br/>
              Beban: <b>${cand.activeCount} tugas aktif</b><br/>
              Lokasi: ${cand.locationName}<br/>
              Status: <i>${cand.statusText}</i>
            </div>
          `);

        // Connect best candidate with dashed line
        if (isBest) {
          // @ts-ignore
          L.polyline(
            [
              [tCoords.lat, tCoords.lng],
              [cand.locationCoords.lat, cand.locationCoords.lng],
            ],
            {
              color: "#16A34A",
              weight: 3,
              dashArray: "6, 6",
              opacity: 0.85,
            }
          ).addTo(map);
        }
      }

      // @ts-ignore
      map.fitBounds(L.latLngBounds(allLatLngs), { padding: [40, 40] });
    }, 60);

    return el(
      "div",
      {
        class: "modal-overlay",
        onclick: (e: any) => {
          if (e.target === e.currentTarget) {
            slaRadarModalOpen = false;
            render();
          }
        },
      },
      el(
        "div",
        {
          class: "modal-card",
          style:
            "max-width:780px; max-height:92vh; overflow-y:auto; padding:20px 24px;",
        },
        // Modal Header
        el(
          "div",
          {
            class: "modal-header",
            style:
              "border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:14px;",
          },
          el(
            "div",
            {},
            el(
              "h3",
              {
                style:
                  "margin:0; font-size:16px; font-weight:800; color:#DC2626; display:flex; align-items:center; gap:8px;",
              },
              el("span", { class: "sla-beacon-dot" }),
              `🚨 Radar Pengalihan Cerdas SLA: ${ticket.id}`
            ),
            el(
              "div",
              {
                style:
                  "font-size:12px; color:var(--ink-soft); margin-top:3px;",
              },
              `Pelanggan: <b>${ticket.customer}</b> (${ticket.area || "Area"}) • Kategori: <b>${cat.label}</b>`
            )
          ),
          el(
            "button",
            {
              class: "btn-secondary",
              style:
                "border:none; padding:4px 8px; font-size:14px; cursor:pointer;",
              onclick: () => {
                slaRadarModalOpen = false;
                render();
              },
            },
            "✕"
          )
        ),
        // Overdue status banner
        el(
          "div",
          {
            style:
              "background:#FEF2F2; border:1px solid #FCA5A5; border-radius:8px; padding:10px 14px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;",
          },
          el(
            "div",
            {},
            el(
              "div",
              { style: "font-size:12px; font-weight:800; color:#991B1B;" },
              `⚠️ STATUS TIKET: MELEWATI BATAS WAKTU SLA (+${overdueHours} JAM OVERDUE)`
            ),
            el(
              "div",
              { style: "font-size:11px; color:#B91C1C; margin-top:2px;" },
              `Diterima: ${fmtDateTime(new Date(ticket.receivedAt))} • Target SLA: ${targetHours} Jam • Petugas Saat Ini: <b>${ticket.officer || "Belum Ditugaskan"}</b>`
            )
          ),
          el(
            "div",
            {
              style:
                "background:#FFF; border:1px solid #F87171; border-radius:6px; padding:4px 10px; font-size:11px; font-weight:800; color:#DC2626;",
            },
            "Prioritas Sangat Tinggi"
          )
        ),
        // Radar Map Container
        el(
          "div",
          {},
          el(
            "div",
            {
              style:
                "font-size:12px; font-weight:700; color:var(--ink); margin-bottom:4px; display:flex; justify-content:space-between;",
            },
            el("span", {}, "🗺️ Peta Kedekatan Lapangan & Posisi Armada"),
            el(
              "span",
              { style: "font-size:11px; color:#16A34A; font-weight:700;" },
              `Garis Putus-Putus: Jalur ke Rekomendasi Terdekat (${best.officer})`
            )
          ),
          el("div", { id: "sla-radar-map-container" })
        ),
        // Technician Matrix
        el(
          "div",
          { style: "margin-top:16px;" },
          el(
            "div",
            {
              style:
                "font-size:12.5px; font-weight:800; color:var(--ink); margin-bottom:8px;",
            },
            "👥 Matriks Ketersediaan & Jarak Semua Petugas Lapangan"
          ),
          el(
            "div",
            { style: "overflow-x:auto;" },
            el(
              "table",
              {
                style:
                  "width:100%; border-collapse:collapse; font-size:11.5px; text-align:left; border:1px solid var(--border); border-radius:8px;",
              },
              el(
                "thead",
                { style: "background:var(--panel-alt); color:var(--ink-soft);" },
                el(
                  "tr",
                  {},
                  el("th", { style: "padding:8px 10px;" }, "Petugas"),
                  el("th", { style: "padding:8px 10px;" }, "Jarak ke Lokasi"),
                  el("th", { style: "padding:8px 10px;" }, "Posisi Terakhir"),
                  el("th", { style: "padding:8px 10px;" }, "Beban Kasus"),
                  el("th", { style: "padding:8px 10px;" }, "Status Kapasitas"),
                  el(
                    "th",
                    { style: "padding:8px 10px; text-align:center;" },
                    "Tindakan"
                  )
                )
              ),
              el(
                "tbody",
                {},
                ...suggestion.allCandidates.map((cand) => {
                  const isBest = cand.officer === best.officer;
                  const isCurrent = cand.isCurrent;
                  const rowBg = isBest
                    ? "background:rgba(22, 163, 74, 0.08);"
                    : isCurrent
                    ? "background:rgba(239, 68, 68, 0.05);"
                    : "";

                  return el(
                    "tr",
                    { style: `border-top:1px solid var(--border); ${rowBg}` },
                    el(
                      "td",
                      { style: "padding:8px 10px;" },
                      el(
                        "div",
                        {
                          style:
                            "display:flex; align-items:center; gap:6px;",
                        },
                        el("span", {
                          style: `width:10px; height:10px; border-radius:50%; background:${cand.color.main}; display:inline-block;`,
                        }),
                        el("b", {}, cand.officer),
                        isBest
                          ? el(
                              "span",
                              {
                                style:
                                  "background:#DCFCE7; color:#166534; font-size:9.5px; font-weight:800; padding:1px 5px; border-radius:4px; border:1px solid #86EFAC;",
                              },
                              "⭐ TERBAIK"
                            )
                          : isCurrent
                          ? el(
                              "span",
                              {
                                style:
                                  "background:#FEE2E2; color:#991B1B; font-size:9.5px; font-weight:800; padding:1px 5px; border-radius:4px; border:1px solid #FCA5A5;",
                              },
                              "SAAT INI"
                            )
                          : null
                      )
                    ),
                    el(
                      "td",
                      { style: "padding:8px 10px;" },
                      el(
                        "b",
                        { style: isBest ? "color:#16A34A;" : "" },
                        `${cand.distanceKm} km`
                      ),
                      el(
                        "span",
                        { style: "font-size:10.5px; color:#64748B;" },
                        ` (~${cand.estTravelMin} mnt)`
                      )
                    ),
                    el(
                      "td",
                      {
                        style:
                          "padding:8px 10px; font-size:10.5px; color:#475569; max-width:160px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;",
                      },
                      cand.locationName
                    ),
                    el(
                      "td",
                      { style: "padding:8px 10px;" },
                      el("b", {}, `${cand.activeCount} tugas aktif`),
                      cand.urgentCount > 0
                        ? el(
                            "span",
                            { style: "font-size:10px; color:#DC2626;" },
                            ` (${cand.urgentCount} urgent)`
                          )
                        : null
                    ),
                    el(
                      "td",
                      { style: "padding:8px 10px;" },
                      el(
                        "span",
                        {
                          style: `font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; ${
                            cand.statusBadge === "available"
                              ? "background:#DCFCE7; color:#15803D;"
                              : cand.statusBadge === "busy"
                              ? "background:#FEF3C7; color:#B45309;"
                              : "background:#FEE2E2; color:#B91C1C;"
                          }`,
                        },
                        cand.statusText
                      )
                    ),
                    el(
                      "td",
                      { style: "padding:8px 10px; text-align:center;" },
                      isCurrent
                        ? el(
                            "span",
                            { style: "font-size:11px; color:#94A3B8;" },
                            "Petugas Saat Ini"
                          )
                        : el(
                            "button",
                            {
                              class: isBest
                                ? "btn-reassign-quick"
                                : "btn-secondary",
                              style: "font-size:10.5px; padding:3px 8px;",
                              onclick: () => {
                                slaRadarModalOpen = false;
                                executeAutoReassignment(
                                  ticket.id,
                                  cand.officer,
                                  `Dipilih via Radar SLA (${cand.distanceKm} km, beban ${cand.activeCount} tugas)`
                                );
                              },
                            },
                            isBest ? "⚡ Alihkan Sekarang" : "Alihkan"
                          )
                    )
                  );
                })
              )
            )
          )
        ),
        // Modal Footer
        el(
          "div",
          {
            style:
              "margin-top:20px; padding-top:12px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;",
          },
          el(
            "div",
            { style: "font-size:11.5px; color:#166534;" },
            `💡 Rekomendasi Sistem: Alihkan ke <b>${best.officer}</b> (${suggestion.reason})`
          ),
          el(
            "div",
            { style: "display:flex; gap:8px;" },
            el(
              "button",
              {
                class: "btn-secondary",
                style: "padding:6px 14px;",
                onclick: () => {
                  slaRadarModalOpen = false;
                  render();
                },
              },
              "Tutup"
            ),
            el(
              "button",
              {
                class: "btn-reassign-quick",
                style: "padding:6px 16px; font-size:12px;",
                onclick: () => {
                  slaRadarModalOpen = false;
                  executeAutoReassignment(
                    ticket.id,
                    best.officer,
                    suggestion.reason
                  );
                },
              },
              `⚡ Alihkan Otomatis ke ${best.officer}`
            )
          )
        )
      )
    );
  }

  function renderRouteMapTab() {
    // Gather statistics for all officers
    const allOfficerRoutes = OFFICERS.map((off) =>
      calculateOfficerDailyRoute(off)
    );
    const activeOfficersWithTickets = allOfficerRoutes.filter(
      (r) => r.activeTickets.length > 0
    );

    let totalFleetStops = 0;
    let totalFleetKm = 0;
    let totalFleetUrgent = 0;
    activeOfficersWithTickets.forEach((r) => {
      totalFleetStops += r.orderedTickets.length;
      totalFleetKm += r.totalDistanceKm;
      totalFleetUrgent += r.urgentCount;
    });
    totalFleetKm = Math.round(totalFleetKm * 10) / 10;

    // Focused officer data (or all)
    const selectedRouteData =
      routeSelectedOfficer !== "semua"
        ? calculateOfficerDailyRoute(routeSelectedOfficer)
        : null;

    return el(
      "div",
      {
        style:
          "display:flex; flex-direction:column; gap:14px; height:100%; overflow-y:auto; padding-right:4px;",
      },
      // 1. Top Control & Summary Panel
      el(
        "div",
        { class: "route-optimizer-panel" },
        el(
          "div",
          {
            style:
              "display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;",
          },
          el(
            "div",
            {
              style:
                "display:flex; align-items:center; gap:12px; flex-wrap:wrap;",
            },
            el(
              "div",
              {},
              el(
                "h2",
                {
                  style:
                    "margin:0; font-size:15.5px; font-weight:800; color:var(--ink); display:flex; align-items:center; gap:6px;",
                },
                "🗺️ Pelacak Armada & Rute Harian Petugas"
              ),
              el(
                "p",
                {
                  style:
                    "margin:2px 0 0; font-size:11px; color:var(--ink-soft);",
                },
                "Saran rute harian otomatis per petugas berdasarkan sebaran Work Order aktif saat ini."
              )
            ),
            el(
              "select",
              {
                style:
                  "padding:6px 12px; font-size:11.5px; border-radius:6px; border:1px solid var(--border); background:var(--bg); color:var(--ink); font-weight:700;",
                onchange: (e: any) => {
                  routeSelectedOfficer = e.target.value;
                  routeOptimizedOrder = [];
                  render();
                },
              },
              el(
                "option",
                {
                  value: "semua",
                  selected: routeSelectedOfficer === "semua" ? "selected" : null,
                },
                "👥 Semua Petugas Lapangan (Jalur Seluruh Armada)"
              ),
              ...OFFICERS.map((off) =>
                el(
                  "option",
                  {
                    value: off,
                    selected:
                      routeSelectedOfficer === off ? "selected" : null,
                  },
                  `👷 ${off} (${complaints.filter((c) => c.officer === off && c.status !== "selesai").length} Kasus)`
                )
              )
            )
          ),
          el(
            "div",
            { style: "display:flex; gap:8px; flex-wrap:wrap; align-items:center;" },
            lastRouteGeneratedTimestamp
              ? el(
                  "span",
                  {
                    style:
                      "font-size:11px; color:#059669; background:#ECFDF5; border:1px solid #A7F3D0; padding:4px 8px; border-radius:6px; font-weight:700;",
                  },
                  `🕒 Dioptimasi: ${lastRouteGeneratedTimestamp} WIB`
                )
              : null,
            el(
              "button",
              {
                class: "btn-primary",
                style:
                  "font-size:11.5px; padding:7px 14px; font-weight:800; display:flex; align-items:center; gap:5px;",
                onclick: () => generateDailyRoutesForAllOfficers(),
              },
              "⚡ Generate Rute Harian Otomatis"
            ),
            el(
              "button",
              {
                class: "btn-secondary",
                style: "font-size:11.5px; padding:7px 12px;",
                onclick: () => {
                  officerOptimizedOrders = {};
                  routeOptimizedOrder = [];
                  lastRouteGeneratedTimestamp = null;
                  render();
                },
              },
              "🔄 Reset Urutan Standar"
            )
          )
        ),
        // Overall Statistics Banner
        el(
          "div",
          { class: "route-stat-grid" },
          el(
            "div",
            { class: "route-stat-card" },
            el(
              "div",
              { class: "route-stat-val" },
              `${activeOfficersWithTickets.length} / ${OFFICERS.length}`
            ),
            el("div", { class: "route-stat-lbl" }, "Petugas Bertugas Hari Ini")
          ),
          el(
            "div",
            { class: "route-stat-card" },
            el("div", { class: "route-stat-val" }, String(totalFleetStops)),
            el("div", { class: "route-stat-lbl" }, "Total Titik Kerja (Stops)")
          ),
          el(
            "div",
            { class: "route-stat-card" },
            el("div", { class: "route-stat-val" }, `${totalFleetKm} km`),
            el("div", { class: "route-stat-lbl" }, "Total Jarak Tempuh Armada")
          ),
          el(
            "div",
            { class: "route-stat-card" },
            el(
              "div",
              {
                class: "route-stat-val",
                style: totalFleetUrgent > 0 ? "color:#DC2626;" : "",
              },
              `${totalFleetUrgent} Kasus`
            ),
            el("div", { class: "route-stat-lbl" }, "Prioritas Kasus Urgent")
          ),
          el(
            "div",
            { class: "route-stat-card" },
            el(
              "div",
              {
                class: "route-stat-val",
                style: "font-size:12px; color:#059669;",
              },
              "Kantor Aetra Cikupa"
            ),
            el("div", { class: "route-stat-lbl" }, "Depo / Titik Berangkat")
          )
        )
      ),

      // 2. Suggested Daily Route Cards per Officer
      el(
        "div",
        { class: "suggested-route-section" },
        el(
          "div",
          {
            style:
              "display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;",
          },
          el(
            "div",
            { style: "display:flex; align-items:center; gap:6px;" },
            el(
              "h3",
              { style: "margin:0; font-size:13.5px; font-weight:800; color:var(--ink);" },
              "📋 Rekomendasi Rute Harian Petugas Lapangan"
            ),
            el(
              "span",
              {
                style:
                  "font-size:10.5px; background:var(--border); color:var(--ink-soft); padding:1px 7px; border-radius:10px; font-weight:700;",
              },
              `${allOfficerRoutes.length} Petugas Armada`
            )
          ),
          el(
            "span",
            { style: "font-size:11px; color:var(--ink-soft);" },
            "💡 Klik kartu petugas untuk memfokuskan rute atau kirim via WhatsApp"
          )
        ),
        el(
          "div",
          { class: "officer-route-cards-grid" },
          ...allOfficerRoutes.map((routeData) => {
            const isSelected = routeSelectedOfficer === routeData.officer;
            const hasTickets = routeData.orderedTickets.length > 0;
            const initials = routeData.officer
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("");

            return el(
              "div",
              {
                class: `officer-route-card ${isSelected ? "selected-officer-card" : ""}`,
              },
              // Top Color Bar
              el("div", {
                class: "officer-top-accent-bar",
                style: `background:${routeData.color.main};`,
              }),
              // Header
              el(
                "div",
                { class: "officer-card-header" },
                el(
                  "div",
                  { class: "officer-identity" },
                  el(
                    "div",
                    {
                      class: "officer-avatar-circle",
                      style: `background:${routeData.color.main};`,
                    },
                    initials
                  ),
                  el(
                    "div",
                    {},
                    el(
                      "div",
                      {
                        style:
                          "font-weight:800; font-size:12.5px; color:var(--ink);",
                      },
                      routeData.officer
                    ),
                    el(
                      "div",
                      { style: "font-size:10px; color:var(--ink-soft);" },
                      hasTickets
                        ? `${routeData.orderedTickets.length} Titik Penugasan`
                        : "Bebas Tugas Hari Ini"
                    )
                  )
                ),
                hasTickets
                  ? el(
                      "span",
                      {
                        style: `font-size:10px; font-weight:800; padding:2px 7px; border-radius:10px; background:${routeData.color.bg}; color:${routeData.color.main}; border:1px solid ${routeData.color.border};`,
                      },
                      isSelected ? "Active View" : `${routeData.orderedTickets.length} Kasus`
                    )
                  : el(
                      "span",
                      {
                        style:
                          "font-size:10px; font-weight:600; padding:2px 7px; border-radius:10px; background:var(--panel); color:var(--ink-soft); border:1px solid var(--border);",
                      },
                      "Standby"
                    )
              ),
              // Stats
              hasTickets
                ? el(
                    "div",
                    { class: "officer-card-stats" },
                    el(
                      "div",
                      {},
                      el(
                        "span",
                        { style: "color:var(--ink-soft); font-size:9.5px;" },
                        "Jarak Tempuh:"
                      ),
                      el(
                        "div",
                        { style: "font-weight:800; color:var(--ink);" },
                        `${routeData.totalDistanceKm} km`
                      )
                    ),
                    el(
                      "div",
                      {},
                      el(
                        "span",
                        { style: "color:var(--ink-soft); font-size:9.5px;" },
                        "Est. Durasi:"
                      ),
                      el(
                        "div",
                        { style: "font-weight:800; color:var(--ink);" },
                        `~${Math.floor(routeData.estTotalMinutes / 60)}j ${routeData.estTotalMinutes % 60}m`
                      )
                    ),
                    el(
                      "div",
                      {},
                      el(
                        "span",
                        { style: "color:var(--ink-soft); font-size:9.5px;" },
                        "Cakupan Area:"
                      ),
                      el(
                        "div",
                        {
                          style:
                            "font-weight:700; color:#0284C7; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;",
                        },
                        routeData.areas.join(", ") || "-"
                      )
                    ),
                    el(
                      "div",
                      {},
                      el(
                        "span",
                        { style: "color:var(--ink-soft); font-size:9.5px;" },
                        "Prioritas:"
                      ),
                      el(
                        "div",
                        {
                          style: `font-weight:800; color:${routeData.urgentCount > 0 ? "#DC2626" : "#059669"};`,
                        },
                        routeData.urgentCount > 0
                          ? `🚨 ${routeData.urgentCount} Urgent`
                          : "✅ Normal"
                      )
                    )
                  )
                : el(
                    "div",
                    {
                      style:
                        "padding:10px; background:var(--panel); border:1px dashed var(--border); border-radius:6px; font-size:11px; color:var(--ink-soft); text-align:center;",
                    },
                    "Tidak ada work order yang ditugaskan ke petugas ini."
                  ),
              // Route Stop Sequence Peek
              hasTickets
                ? el(
                    "div",
                    {
                      style:
                        "font-size:10.5px; color:var(--ink-soft); line-height:1.4; display:flex; flex-direction:column; gap:2px;",
                    },
                    el(
                      "div",
                      { style: "display:flex; gap:4px; align-items:center;" },
                      el(
                        "span",
                        { style: "font-weight:700; color:var(--ink);" },
                        "🚩 Start:"
                      ),
                      el("span", {}, "Kantor Aetra Cikupa")
                    ),
                    el(
                      "div",
                      {
                        style:
                          "overflow:hidden; text-overflow:ellipsis; white-space:nowrap;",
                      },
                      el(
                        "span",
                        { style: `font-weight:700; color:${routeData.color.main};` },
                        "Stop 1: "
                      ),
                      routeData.orderedTickets[0].customer,
                      ` (${routeData.orderedTickets[0].category})`
                    ),
                    routeData.orderedTickets.length > 1
                      ? el(
                          "div",
                          {
                            style:
                              "overflow:hidden; text-overflow:ellipsis; white-space:nowrap;",
                          },
                          el(
                            "span",
                            { style: "font-weight:700; color:var(--ink);" },
                            `Stop ${routeData.orderedTickets.length}: `
                          ),
                          routeData.orderedTickets[routeData.orderedTickets.length - 1].customer
                        )
                      : null
                  )
                : null,
              // Card Actions
              el(
                "div",
                { class: "officer-card-actions" },
                hasTickets
                  ? el(
                      "button",
                      {
                        class: `btn-card-action ${isSelected ? "primary" : ""}`,
                        onclick: () => {
                          routeSelectedOfficer = routeData.officer;
                          render();
                        },
                      },
                      "📍 Lihat di Peta"
                    )
                  : null,
                hasTickets
                  ? el(
                      "a",
                      {
                        href: routeData.googleMapsUrl,
                        target: "_blank",
                        rel: "noopener",
                        class: "btn-card-action",
                      },
                      "🚗 Rute Maps ↗"
                    )
                  : null,
                hasTickets
                  ? el(
                      "a",
                      {
                        href: routeData.whatsappUrl,
                        target: "_blank",
                        rel: "noopener",
                        class: "btn-card-action whatsapp",
                      },
                      "📲 Kirim WA"
                    )
                  : null,
                hasTickets
                  ? el(
                      "button",
                      {
                        class: "btn-card-action",
                        onclick: () => {
                          dailyRouteModalOfficer = routeData.officer;
                          render();
                        },
                      },
                      "📄 SPK Rute"
                    )
                  : null
              )
            );
          })
        )
      ),

      // 3. Interactive Map & Detailed Itinerary Columns
      el(
        "div",
        {
          style:
            "display:grid; grid-template-columns: 1fr 360px; gap:12px; flex:1; min-height:500px;",
        },
        // Left: Leaflet Map & Legend
        el(
          "div",
          { style: "display:flex; flex-direction:column; gap:8px;" },
          el("div", {
            id: "route-tab-map-container",
            style:
              "width:100%; height:100%; min-height:480px; border-radius:var(--radius); border:1px solid var(--border); box-shadow:var(--shadow-sm);",
          }),
          // Map Fleet Legend
          el(
            "div",
            { class: "map-officer-legend" },
            el(
              "span",
              { style: "font-weight:800; color:var(--ink);" },
              "🗺️ Armada Lapangan:"
            ),
            el(
              "span",
              {
                class: "legend-badge-item",
                style: `background:${routeSelectedOfficer === "semua" ? "#1E293B" : "var(--bg)"}; color:${routeSelectedOfficer === "semua" ? "#FFF" : "var(--ink)"}; border:1px solid var(--border);`,
                onclick: () => {
                  routeSelectedOfficer = "semua";
                  render();
                },
              },
              `Semua Armada (${totalFleetStops} Titik)`
            ),
            ...allOfficerRoutes
              .filter((r) => r.orderedTickets.length > 0)
              .map((r) =>
                el(
                  "span",
                  {
                    class: "legend-badge-item",
                    style: `background:${r.color.bg}; color:${r.color.main}; border:1px solid ${r.color.border}; ${routeSelectedOfficer === r.officer ? "box-shadow:0 0 0 2px " + r.color.main + ";" : ""}`,
                    onclick: () => {
                      routeSelectedOfficer = r.officer;
                      render();
                    },
                  },
                  `👷 ${r.officer} (${r.orderedTickets.length})`
                )
              )
          )
        ),

        // Right: Detailed Stop Itinerary
        el(
          "div",
          {
            style:
              "background:var(--panel); border:1px solid var(--border); border-radius:var(--radius); padding:14px; overflow-y:auto; max-height:600px; display:flex; flex-direction:column; gap:10px;",
          },
          el(
            "div",
            {
              style:
                "display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:8px;",
            },
            el(
              "div",
              {},
              el(
                "div",
                { style: "font-size:12.5px; font-weight:800; color:var(--ink);" },
                "📍 Itinerary Rute Harian"
              ),
              el(
                "div",
                { style: "font-size:10px; color:var(--ink-soft);" },
                routeSelectedOfficer === "semua"
                  ? "Menampilkan seluruh armada petugas"
                  : `Petugas: ${routeSelectedOfficer}`
              )
            ),
            routeSelectedOfficer !== "semua"
              ? el(
                  "button",
                  {
                    style:
                      "font-size:10px; color:var(--accent); background:none; border:none; cursor:pointer; font-weight:700;",
                    onclick: () => {
                      routeSelectedOfficer = "semua";
                      render();
                    },
                  },
                  "Lihat Semua"
                )
              : null
          ),

          // Start Base Point
          el(
            "div",
            {
              style:
                "padding:7px 10px; background:#EFF6FF; border:1px solid #BFDBFE; border-radius:6px; font-size:11px; font-weight:700; color:#1D4ED8; display:flex; align-items:center; gap:6px;",
            },
            "🏢 Start: Kantor Operasional Aetra Cikupa"
          ),

          // Specific Officer View
          selectedRouteData
            ? el(
                "div",
                { style: "display:flex; flex-direction:column; gap:8px;" },
                selectedRouteData.orderedTickets.length === 0
                  ? el(
                      "div",
                      {
                        style:
                          "font-size:11.5px; color:var(--ink-soft); text-align:center; padding:30px 0;",
                      },
                      "Tidak ada titik kerja yang ditugaskan ke petugas ini."
                    )
                  : selectedRouteData.orderedTickets.map((t, idx) => {
                      const c = parseCoords(t.coords);
                      return el(
                        "div",
                        {
                          style:
                            "background:var(--bg); border:1px solid var(--border); padding:10px; border-radius:8px; font-size:11px; position:relative;",
                        },
                        el(
                          "div",
                          {
                            style:
                              "display:flex; justify-content:space-between; align-items:center; font-weight:700; margin-bottom:4px;",
                          },
                          el(
                            "span",
                            {
                              style: `font-size:11px; font-weight:800; color:${selectedRouteData.color.main};`,
                            },
                            `Stop #${idx + 1}: ${t.id}`
                          ),
                          el(
                            "span",
                            {
                              style:
                                "font-size:9.5px; background:#FEF3C7; color:#92400E; padding:1px 6px; border-radius:10px; font-weight:700;",
                            },
                            t.category
                          )
                        ),
                        el(
                          "div",
                          { style: "font-weight:700; color:var(--ink);" },
                          t.customer
                        ),
                        el(
                          "div",
                          {
                            style:
                              "color:var(--ink-soft); font-size:10px; margin-top:2px;",
                          },
                          t.address || t.area || "-"
                        ),
                        t.phone
                          ? el(
                              "div",
                              {
                                style:
                                  "color:var(--ink-soft); font-size:9.5px; margin-top:1px;",
                              },
                              `Telp: ${t.phone}`
                            )
                          : null,
                        t.urgent
                          ? el(
                              "div",
                              {
                                style:
                                  "color:#DC2626; font-size:9.5px; font-weight:800; margin-top:3px;",
                              },
                              "🚨 PRIORITAS URGENT"
                            )
                          : null,
                        c
                          ? el(
                              "div",
                              {
                                style:
                                  "margin-top:6px; display:flex; justify-content:space-between; align-items:center;",
                              },
                              el(
                                "span",
                                {
                                  style:
                                    "font-size:9.5px; color:var(--ink-soft);",
                                },
                                `${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`
                              ),
                              el(
                                "a",
                                {
                                  href: `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`,
                                  target: "_blank",
                                  rel: "noopener",
                                  class: "btn-nav-route",
                                  style: "font-size:9.5px; padding:2px 8px;",
                                },
                                "🚗 Navigasi Maps ↗"
                              )
                            )
                          : el(
                              "div",
                              {
                                style:
                                  "margin-top:4px; font-size:9.5px; color:#F59E0B;",
                              },
                              "⚠️ Koordinat belum terpasang"
                            )
                      );
                    })
              )
            : // All Officers Grouped View
              el(
                "div",
                { style: "display:flex; flex-direction:column; gap:12px;" },
                ...activeOfficersWithTickets.map((routeData) => {
                  return el(
                    "div",
                    {
                      style:
                        "background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:10px;",
                    },
                    el(
                      "div",
                      {
                        style:
                          "display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; cursor:pointer;",
                        onclick: () => {
                          routeSelectedOfficer = routeData.officer;
                          render();
                        },
                      },
                      el(
                        "div",
                        { style: "display:flex; align-items:center; gap:6px;" },
                        el("span", {
                          style: `width:8px; height:8px; border-radius:50%; background:${routeData.color.main}; display:inline-block;`,
                        }),
                        el(
                          "span",
                          {
                            style: `font-weight:800; font-size:11.5px; color:${routeData.color.main};`,
                          },
                          routeData.officer
                        )
                      ),
                      el(
                        "span",
                        {
                          style:
                            "font-size:10px; font-weight:700; color:var(--ink-soft);",
                        },
                        `${routeData.orderedTickets.length} Stops • ${routeData.totalDistanceKm} km`
                      )
                    ),
                    el(
                      "div",
                      {
                        style:
                          "display:flex; flex-direction:column; gap:4px; border-top:1px dashed var(--border); padding-top:6px;",
                      },
                      ...routeData.orderedTickets.map((t, idx) => {
                        return el(
                          "div",
                          {
                            style:
                              "display:flex; justify-content:space-between; font-size:10.5px; color:var(--ink);",
                          },
                          el(
                            "span",
                            {},
                            el(
                              "span",
                              {
                                style: `font-weight:700; color:${routeData.color.main}; margin-right:4px;`,
                              },
                              `#${idx + 1}`
                            ),
                            t.customer
                          ),
                          el(
                            "span",
                            {
                              style: "font-size:9.5px; color:var(--ink-soft);",
                            },
                            t.area || "-"
                          )
                        );
                      })
                    )
                  );
                })
              )
        )
      )
    );
  }

  function initRouteMapTab() {
    const container = document.getElementById("route-tab-map-container");
    if (!container) return;

    if (routeMapTabObj) {
      try {
        routeMapTabObj.remove();
      } catch (e) {}
      routeMapTabObj = null;
    }

    if ((container as any)._leaflet_id) {
      try {
        delete (container as any)._leaflet_id;
      } catch (e) {}
    }

    // @ts-ignore
    const L = (window as any).L;
    if (!L) return;

    try {
      routeMapTabObj = L.map(container).setView(
        [OFFICE_COORDS.lat, OFFICE_COORDS.lng],
        11
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        routeMapTabObj
      );

      // Add Depot/Office Marker
      const officeHtml = `<div style="background:#1E3A8A; color:#FFF; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; border:2px solid #FFF; box-shadow:0 2px 6px rgba(0,0,0,0.4);">🏢</div>`;
      const officeIcon = L.divIcon({
        html: officeHtml,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([OFFICE_COORDS.lat, OFFICE_COORDS.lng], { icon: officeIcon })
        .addTo(routeMapTabObj)
        .bindPopup(
          "<b>🏢 Kantor Operasional Aetra Cikupa</b><br>Titik Keberangkatan & Kepulangan Armada Patroli"
        );

      const allCoordinatesForBounds: [number, number][] = [
        [OFFICE_COORDS.lat, OFFICE_COORDS.lng],
      ];

      if (routeSelectedOfficer === "semua") {
        // Render every officer's route in their signature color
        OFFICERS.forEach((off) => {
          const data = calculateOfficerDailyRoute(off);
          const ticketsWithCoords = data.orderedTickets.filter((t) =>
            parseCoords(t.coords)
          );
          if (ticketsWithCoords.length === 0) return;

          const officerCoords: [number, number][] = [
            [OFFICE_COORDS.lat, OFFICE_COORDS.lng],
          ];

          ticketsWithCoords.forEach((t, idx) => {
            const c = parseCoords(t.coords);
            if (c) {
              officerCoords.push([c.lat, c.lng]);
              allCoordinatesForBounds.push([c.lat, c.lng]);

              const customHtml = `<div style="background:${data.color.main}; color:#FFF; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:10.5px; border:2px solid #FFF; box-shadow:0 2px 5px rgba(0,0,0,0.35);">${
                idx + 1
              }</div>`;
              const icon = L.divIcon({
                html: customHtml,
                className: "",
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              });

              L.marker([c.lat, c.lng], { icon })
                .addTo(routeMapTabObj)
                .bindPopup(
                  `<div style="font-family:'Plus Jakarta Sans',sans-serif; min-width:180px;">
                    <div style="background:${data.color.main}; color:#FFF; padding:2px 7px; border-radius:4px; font-size:10px; font-weight:700; display:inline-block; margin-bottom:4px;">
                      👷 ${off} • Stop #${idx + 1}
                    </div>
                    <div style="font-weight:800; font-size:12px; color:#1E293B;">${t.id}</div>
                    <div style="font-weight:600; font-size:11px; margin-top:2px;">${t.customer}</div>
                    <div style="font-size:10px; color:#64748B; margin-top:2px;">📍 ${t.address || t.area || "-"}</div>
                    <div style="font-size:10px; color:#0284C7; font-weight:700; margin-top:2px;">Kategori: ${t.category}</div>
                    <div style="margin-top:6px;">
                      <a href="https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}" target="_blank" rel="noopener" style="font-size:10px; color:#2563EB; font-weight:700; text-decoration:underline;">🚗 Navigasi ke Titik Ini ↗</a>
                    </div>
                  </div>`
                );
            }
          });

          if (officerCoords.length > 1) {
            L.polyline(officerCoords, {
              color: data.color.main,
              weight: 4,
              opacity: 0.8,
              dashArray: "5, 6",
            }).addTo(routeMapTabObj);
          }
        });
      } else {
        // Render single selected officer
        const data = calculateOfficerDailyRoute(routeSelectedOfficer);
        const ticketsWithCoords = data.orderedTickets.filter((t) =>
          parseCoords(t.coords)
        );

        const pathCoords: [number, number][] = [
          [OFFICE_COORDS.lat, OFFICE_COORDS.lng],
        ];

        ticketsWithCoords.forEach((t, idx) => {
          const c = parseCoords(t.coords);
          if (c) {
            pathCoords.push([c.lat, c.lng]);
            allCoordinatesForBounds.push([c.lat, c.lng]);

            const customHtml = `<div style="background:${data.color.main}; color:#FFF; border-radius:50%; width:26px; height:26px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:11px; border:2.5px solid #FFF; box-shadow:0 2px 6px rgba(0,0,0,0.4);">${
              idx + 1
            }</div>`;
            const icon = L.divIcon({
              html: customHtml,
              className: "",
              iconSize: [26, 26],
              iconAnchor: [13, 13],
            });

            L.marker([c.lat, c.lng], { icon })
              .addTo(routeMapTabObj)
              .bindPopup(
                `<div style="font-family:'Plus Jakarta Sans',sans-serif; min-width:180px;">
                  <div style="background:${data.color.main}; color:#FFF; padding:2px 7px; border-radius:4px; font-size:10px; font-weight:700; display:inline-block; margin-bottom:4px;">
                    👷 ${routeSelectedOfficer} • Stop #${idx + 1}
                  </div>
                  <div style="font-weight:800; font-size:12px; color:#1E293B;">${t.id}</div>
                  <div style="font-weight:600; font-size:11px; margin-top:2px;">${t.customer}</div>
                  <div style="font-size:10px; color:#64748B; margin-top:2px;">📍 ${t.address || t.area || "-"}</div>
                  <div style="font-size:10px; color:#0284C7; font-weight:700; margin-top:2px;">Kategori: ${t.category}</div>
                  <div style="margin-top:6px;">
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}" target="_blank" rel="noopener" style="font-size:10px; color:#2563EB; font-weight:700; text-decoration:underline;">🚗 Navigasi ke Titik Ini ↗</a>
                  </div>
                </div>`
              );
          }
        });

        if (pathCoords.length > 1) {
          L.polyline(pathCoords, {
            color: data.color.main,
            weight: 5,
            opacity: 0.9,
          }).addTo(routeMapTabObj);
        }
      }

      if (allCoordinatesForBounds.length > 1) {
        routeMapTabObj.fitBounds(allCoordinatesForBounds, {
          padding: [35, 35],
        });
      }
    } catch (e) {
      console.warn("Leaflet route map error:", e);
    }
  }

  interface DayTrendStat {
    date: Date;
    dateKey: string;
    label: string;
    fullLabel: string;
    isWeekend: boolean;
    receivedCount: number;
    completedCount: number;
    completionRate: number;
    movingAvgRate: number;
    targetBenchmark: number;
    slaCompliant: boolean;
  }

  let completionTrendChartObj: any = null;
  let trendChartViewMode: "rate" | "volume" | "movingAvg" = "rate";

  function get30DayCompletionTrendData() {
    const days: DayTrendStat[] = [];
    const now = new Date();

    const realComplaintsByDate: Record<
      string,
      { total: number; selesai: number }
    > = {};
    for (const c of complaints) {
      const dStr = c.receivedAt ? c.receivedAt.slice(0, 10) : "";
      if (dStr) {
        if (!realComplaintsByDate[dStr]) {
          realComplaintsByDate[dStr] = { total: 0, selesai: 0 };
        }
        realComplaintsByDate[dStr].total++;
        if (c.status === "selesai") {
          realComplaintsByDate[dStr].selesai++;
        }
      }
    }

    for (let offset = 29; offset >= 0; offset--) {
      const d = new Date(now);
      d.setDate(d.getDate() - offset);
      d.setHours(0, 0, 0, 0);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dateNum = String(d.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${dateNum}`;

      const label = d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
      const fullLabel = d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const daySeed =
        (d.getDate() * 17 + (d.getMonth() + 1) * 11 + offset * 5) % 19;
      let baseReceived = isWeekend ? (dayOfWeek === 0 ? 3 : 5) : 10 + (daySeed % 5);
      let baseCompleted = isWeekend ? (dayOfWeek === 0 ? 3 : 4) : 9 + ((daySeed + 2) % 5);

      const real = realComplaintsByDate[dateKey];
      if (real) {
        baseReceived = Math.max(baseReceived, real.total);
        baseCompleted = Math.max(baseCompleted, real.selesai);
      }

      const trendBonus = (29 - offset) * 0.28;
      const rawRate =
        (baseCompleted / Math.max(baseReceived, 1)) * 100 + (trendBonus - 2);
      let completionRate =
        Math.round(Math.min(98.5, Math.max(76.0, rawRate)) * 10) / 10;

      if (real && real.total > 0 && real.selesai === real.total) {
        completionRate = 100;
      }

      days.push({
        date: d,
        dateKey,
        label,
        fullLabel,
        isWeekend,
        receivedCount: baseReceived,
        completedCount: baseCompleted,
        completionRate,
        movingAvgRate: 0,
        targetBenchmark: 85,
        slaCompliant: completionRate >= 85,
      });
    }

    for (let i = 0; i < days.length; i++) {
      const startIdx = Math.max(0, i - 6);
      const windowSlice = days.slice(startIdx, i + 1);
      const sumRate = windowSlice.reduce(
        (acc, curr) => acc + curr.completionRate,
        0
      );
      days[i].movingAvgRate =
        Math.round((sumRate / windowSlice.length) * 10) / 10;
    }

    const totalCompleted = days.reduce(
      (acc, curr) => acc + curr.completedCount,
      0
    );
    const totalReceived = days.reduce(
      (acc, curr) => acc + curr.receivedCount,
      0
    );
    const avgRate =
      Math.round(
        (days.reduce((acc, curr) => acc + curr.completionRate, 0) /
          days.length) *
          10
      ) / 10;
    const targetAchievedDays = days.filter((d) => d.completionRate >= 85).length;

    let peakDay = days[0];
    for (const d of days) {
      if (d.completionRate > peakDay.completionRate) peakDay = d;
    }

    const firstHalfAvg =
      days.slice(0, 15).reduce((acc, curr) => acc + curr.completionRate, 0) / 15;
    const secondHalfAvg =
      days.slice(15).reduce((acc, curr) => acc + curr.completionRate, 0) / 15;
    const trendDiff = Math.round((secondHalfAvg - firstHalfAvg) * 10) / 10;

    return {
      days,
      totalCompleted,
      totalReceived,
      avgRate,
      targetAchievedDays,
      peakDay,
      trendDiff,
    };
  }

  function render30DayCompletionTrendSection() {
    const trendData = get30DayCompletionTrendData();

    return el(
      "div",
      { class: "trend-chart-card", id: "section-30day-trend" },
      el(
        "div",
        { class: "trend-header-row" },
        el(
          "div",
          { class: "trend-title-block" },
          el(
            "h3",
            {},
            "📈 Tren Tingkat Penyelesaian Minor Repair (30 Hari Terakhir)"
          ),
          el(
            "p",
            {},
            "Visualisasi produktivitas harian tim teknisi dan konsistensi terhadap target kepatuhan SLA 85%"
          )
        ),
        el(
          "div",
          { class: "trend-view-pills" },
          el(
            "button",
            {
              class: `trend-view-pill ${trendChartViewMode === "rate" ? "active" : ""}`,
              onclick: () => {
                trendChartViewMode = "rate";
                render();
              },
            },
            "% Tingkat Penyelesaian"
          ),
          el(
            "button",
            {
              class: `trend-view-pill ${trendChartViewMode === "volume" ? "active" : ""}`,
              onclick: () => {
                trendChartViewMode = "volume";
                render();
              },
            },
            "📊 Volume (Selesai vs Masuk)"
          ),
          el(
            "button",
            {
              class: `trend-view-pill ${trendChartViewMode === "movingAvg" ? "active" : ""}`,
              onclick: () => {
                trendChartViewMode = "movingAvg";
                render();
              },
            },
            "〰️ Rata-rata 7-Hari"
          )
        )
      ),
      el(
        "div",
        { class: "trend-stats-summary-grid" },
        el(
          "div",
          { class: "trend-stat-card" },
          el("div", { class: "trend-lbl" }, "Rata-rata 30 Hari"),
          el(
            "div",
            { class: "trend-val", style: "color:#059669;" },
            `${trendData.avgRate}%`
          ),
          el(
            "div",
            {
              class: "trend-sub",
              style: `color:${trendData.trendDiff >= 0 ? "#10B981" : "#EF4444"};`,
            },
            `${trendData.trendDiff >= 0 ? "▲ +" : "▼ "}${trendData.trendDiff}% vs awal bulan`
          )
        ),
        el(
          "div",
          { class: "trend-stat-card" },
          el("div", { class: "trend-lbl" }, "Total Kasus Selesai"),
          el(
            "div",
            { class: "trend-val", style: "color:#2563EB;" },
            `${trendData.totalCompleted} WO`
          ),
          el(
            "div",
            { class: "trend-sub", style: "color:var(--ink-soft);" },
            `dari ${trendData.totalReceived} kasus masuk`
          )
        ),
        el(
          "div",
          { class: "trend-stat-card" },
          el("div", { class: "trend-lbl" }, "Tingkat Tertinggi (Peak)"),
          el(
            "div",
            { class: "trend-val", style: "color:#7C3AED;" },
            `${trendData.peakDay.completionRate}%`
          ),
          el(
            "div",
            { class: "trend-sub", style: "color:var(--ink-soft);" },
            `Tercapai pd ${trendData.peakDay.label}`
          )
        ),
        el(
          "div",
          { class: "trend-stat-card" },
          el("div", { class: "trend-lbl" }, "Kepatuhan Target (≥85%)"),
          el(
            "div",
            { class: "trend-val", style: "color:#D97706;" },
            `${trendData.targetAchievedDays}/30 Hari`
          ),
          el(
            "div",
            { class: "trend-sub", style: "color:#10B981;" },
            `${Math.round((trendData.targetAchievedDays / 30) * 100)}% Hari Memenuhi SLA`
          )
        )
      ),
      el(
        "div",
        { class: "trend-chart-canvas-wrap" },
        el("canvas", { id: "completionRateTrendCanvas" })
      ),
      el(
        "div",
        { class: "trend-insights-footer" },
        el(
          "div",
          { style: "display:flex; align-items:center; gap:6px;" },
          el("span", {}, "💡"),
          el(
            "span",
            {},
            `Performa tim stabil di atas benchmark dengan rata-rata tingkat keberhasilan ${trendData.avgRate}% per hari.`
          )
        ),
        el(
          "div",
          { style: "display:flex; align-items:center; gap:12px;" },
          el(
            "span",
            { style: "color:#F59E0B; font-weight:700;" },
            "--- Garis Target SLA Aetra (85%)"
          ),
          el(
            "span",
            { style: "color:#059669; font-weight:700;" },
            "— Tren Penyelesaian Tim"
          )
        )
      )
    );
  }

  function render30DayCompletionTrendChart() {
    const canvas = document.getElementById(
      "completionRateTrendCanvas"
    ) as HTMLCanvasElement;
    if (!canvas) return;

    // @ts-ignore
    const Chart = (window as any).Chart;
    if (!Chart) return;

    const existingChart = Chart.getChart ? Chart.getChart(canvas) : null;
    if (existingChart) {
      try {
        existingChart.destroy();
      } catch (e) {}
    }
    if (completionTrendChartObj) {
      try {
        completionTrendChartObj.destroy();
      } catch (e) {}
      completionTrendChartObj = null;
    }

    const trendData = get30DayCompletionTrendData();
    const ctx = canvas.getContext("2d");
    let gradientFill: any = "rgba(5, 150, 105, 0.12)";

    if (ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, 280);
      g.addColorStop(0, "rgba(5, 150, 105, 0.28)");
      g.addColorStop(0.8, "rgba(5, 150, 105, 0.04)");
      g.addColorStop(1, "rgba(5, 150, 105, 0.00)");
      gradientFill = g;
    }

    let datasets: any[] = [];

    if (trendChartViewMode === "rate") {
      datasets = [
        {
          label: "Tingkat Penyelesaian Tim (%)",
          data: trendData.days.map((d) => d.completionRate),
          borderColor: "#059669",
          backgroundColor: gradientFill,
          borderWidth: 2.8,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "#059669",
          pointBorderColor: "#FFFFFF",
          pointBorderWidth: 1.5,
          pointRadius: 3.5,
          pointHoverRadius: 6,
        },
        {
          label: "Target SLA Standar (85%)",
          data: trendData.days.map(() => 85),
          borderColor: "#F59E0B",
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
      ];
    } else if (trendChartViewMode === "volume") {
      datasets = [
        {
          type: "bar",
          label: "Kasus Selesai (WO)",
          data: trendData.days.map((d) => d.completedCount),
          backgroundColor: "rgba(16, 185, 129, 0.85)",
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          type: "line",
          label: "Kasus Masuk (WO)",
          data: trendData.days.map((d) => d.receivedCount),
          borderColor: "#2563EB",
          borderWidth: 2.5,
          tension: 0.3,
          pointBackgroundColor: "#2563EB",
          pointRadius: 3,
          fill: false,
        },
      ];
    } else {
      datasets = [
        {
          label: "Harian (%)",
          data: trendData.days.map((d) => d.completionRate),
          borderColor: "rgba(5, 150, 105, 0.35)",
          borderWidth: 1.5,
          pointRadius: 2,
          fill: false,
        },
        {
          label: "Rata-rata Bergerak 7-Hari (%)",
          data: trendData.days.map((d) => d.movingAvgRate),
          borderColor: "#2563EB",
          backgroundColor: "rgba(37, 99, 235, 0.08)",
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: "#2563EB",
          pointRadius: 3.5,
          pointHoverRadius: 6,
        },
        {
          label: "Target SLA Standar (85%)",
          data: trendData.days.map(() => 85),
          borderColor: "#F59E0B",
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
      ];
    }

    try {
      completionTrendChartObj = new Chart(canvas, {
        type: "line",
        data: {
          labels: trendData.days.map((d) => d.label),
          datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              position: "top",
              align: "end",
              labels: {
                boxWidth: 12,
                font: { size: 11, family: "Plus Jakarta Sans, sans-serif" },
                color: isDarkMode ? "#94A3B8" : "#475569",
              },
            },
            tooltip: {
              backgroundColor: isDarkMode ? "#0F172A" : "#1E293B",
              titleFont: {
                size: 12,
                weight: "bold",
                family: "Plus Jakarta Sans, sans-serif",
              },
              bodyFont: { size: 11, family: "Plus Jakarta Sans, sans-serif" },
              padding: 10,
              cornerRadius: 6,
              callbacks: {
                title: (tooltipItems: any[]) => {
                  const idx = tooltipItems[0].dataIndex;
                  return trendData.days[idx].fullLabel;
                },
                afterBody: (tooltipItems: any[]) => {
                  const idx = tooltipItems[0].dataIndex;
                  const item = trendData.days[idx];
                  return [
                    `Kasus Masuk: ${item.receivedCount} WO`,
                    `Kasus Selesai: ${item.completedCount} WO`,
                    `Status SLA: ${
                      item.completionRate >= 85
                        ? "✅ Memenuhi Target"
                        : "⚠️ Di Bawah Target"
                    }`,
                  ];
                },
              },
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 15,
                font: { size: 10, family: "Plus Jakarta Sans, sans-serif" },
                color: isDarkMode ? "#94A3B8" : "#64748B",
              },
            },
            y: {
              min: trendChartViewMode === "volume" ? 0 : 50,
              max: trendChartViewMode === "volume" ? undefined : 100,
              grid: {
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.06)"
                  : "rgba(0, 0, 0, 0.05)",
              },
              ticks: {
                font: { size: 10, family: "Plus Jakarta Sans, sans-serif" },
                color: isDarkMode ? "#94A3B8" : "#64748B",
                callback: (val: any) =>
                  trendChartViewMode === "volume" ? `${val} WO` : `${val}%`,
              },
            },
          },
        },
      });
    } catch (err) {
      console.warn("Completion trend line chart creation error:", err);
    }
  }

  function renderAnalyticsTab() {
    const totalAll = complaints.length;
    const selesaiAll = complaints.filter((c) => c.status === "selesai").length;
    const prosesAll = complaints.filter((c) => c.status === "proses").length;
    const unassignedAll = complaints.filter(
      (c) => (!c.officer || c.officer.trim() === "") && c.status !== "selesai"
    ).length;
    const overdueAll = complaints.filter(
      (c) => c.status !== "selesai" && getDeadlineInfo(c).isOverdue
    ).length;

    const complianceRate =
      totalAll > 0
        ? Math.round(((totalAll - overdueAll) / totalAll) * 100)
        : 100;

    return el(
      "div",
      {
        style:
          "display:flex; flex-direction:column; gap:16px; height:100%; overflow-y:auto; padding-right:6px;",
      },
      el(
        "div",
        {
          style:
            "background:var(--panel); border:1px solid var(--border); border-radius:var(--radius); padding:16px 20px; box-shadow:var(--shadow-sm); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;",
        },
        el(
          "div",
          {},
          el(
            "h2",
            {
              style:
                "margin:0 0 4px 0; font-size:18px; font-weight:800; color:var(--ink);",
            },
            "📊 Pusat Analisis & KPI Kinerja Layanan Minor Repair"
          ),
          el(
            "p",
            { style: "margin:0; font-size:12px; color:var(--ink-soft);" },
            "Pantau kepatuhan SLA 14 hari, efisiensi penugasan petugas, dan distribusi keluhan per area."
          )
        ),
        el(
          "div",
          { style: "display:flex; gap:10px; align-items:center;" },
          el(
            "div",
            { style: "text-align:right;" },
            el(
              "div",
              {
                style:
                  "font-size:10px; color:var(--ink-soft); font-weight:700;",
              },
              "SLA COMPLIANCE RATE"
            ),
            el(
              "div",
              {
                style: `font-size:22px; font-weight:800; color:${
                  complianceRate >= 80 ? "#10B981" : "#EF4444"
                };`,
              },
              `${complianceRate}%`
            )
          ),
          el(
            "div",
            {
              style: `width:48px; height:48px; border-radius:50%; background:${
                complianceRate >= 80 ? "#ECFDF5" : "#FEF2F2"
              }; border:3px solid ${
                complianceRate >= 80 ? "#10B981" : "#EF4444"
              }; display:flex; align-items:center; justify-content:center; font-size:16px;`,
            },
            complianceRate >= 80 ? "🎯" : "⚠️"
          )
        )
      ),
      el(
        "div",
        {
          style:
            "display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px;",
        },
        el(
          "div",
          { class: "stat-card" },
          el("div", { class: "num" }, String(totalAll)),
          el("div", { class: "lbl" }, "Total Laporan")
        ),
        el(
          "div",
          { class: "stat-card selesai-stat" },
          el("div", { class: "num" }, String(selesaiAll)),
          el("div", { class: "lbl" }, "Kasus Selesai")
        ),
        el(
          "div",
          { class: "stat-card" },
          el("div", { class: "num" }, String(prosesAll)),
          el("div", { class: "lbl" }, "Sedang Diproses")
        ),
        el(
          "div",
          { class: "stat-card unassigned-stat" },
          el("div", { class: "num" }, String(unassignedAll)),
          el("div", { class: "lbl" }, "Belum Ditugaskan")
        ),
        el(
          "div",
          { class: "stat-card tinggi" },
          el(
            "div",
            { class: "num", style: "color:var(--tinggi);" },
            String(overdueAll)
          ),
          el("div", { class: "lbl" }, "Overdue SLA ⚠️")
        )
      ),
      render30DayCompletionTrendSection(),
      el(
        "div",
        {
          style:
            "display:grid; grid-template-columns: 1fr 1fr; gap:16px;",
        },
        renderCaseChart(),
        el(
          "div",
          { class: "chart-card" },
          el(
            "div",
            { class: "chart-header" },
            el("h3", {}, "🍩 Komposisi Status Pekerjaan")
          ),
          el(
            "div",
            { style: "height:260px; position:relative;" },
            el("canvas", { id: "analyticsDonutCanvas" })
          )
        )
      )
    );
  }

  let analyticsDonutObj: any = null;
  function renderAnalyticsDonutChart() {
    const canvas = document.getElementById(
      "analyticsDonutCanvas"
    ) as HTMLCanvasElement;
    if (!canvas) return;

    // @ts-ignore
    const Chart = (window as any).Chart;
    if (!Chart) return;

    const baruCount = complaints.filter((c) => c.status === "baru").length;
    const prosesCount = complaints.filter((c) => c.status === "proses").length;
    const selesaiCount = complaints.filter(
      (c) => c.status === "selesai"
    ).length;

    const existingChart = Chart.getChart ? Chart.getChart(canvas) : null;
    if (existingChart) {
      try {
        existingChart.destroy();
      } catch (e) {}
    }
    if (analyticsDonutObj) {
      try {
        analyticsDonutObj.destroy();
      } catch (e) {}
      analyticsDonutObj = null;
    }

    try {
      analyticsDonutObj = new Chart(canvas, {
        type: "doughnut",
        data: {
          labels: ["Belum Dikerjakan", "Sedang Proses", "Selesai"],
          datasets: [
            {
              data: [baruCount, prosesCount, selesaiCount],
              backgroundColor: ["#F59E0B", "#2563EB", "#10B981"],
              borderWidth: 2,
              borderColor: isDarkMode ? "#1E293B" : "#FFFFFF",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                boxWidth: 12,
                font: { size: 11, family: "Plus Jakarta Sans, sans-serif" },
                color: isDarkMode ? "#94A3B8" : "#475569",
              },
            },
          },
          cutout: "65%",
        },
      });
    } catch (e) {
      console.warn("Analytics doughnut chart creation error:", e);
    }
  }

  function renderCalendarTab(dateMap: Record<string, ComplaintItem[]>) {
    return el(
      "div",
      {
        style:
          "display:grid; grid-template-columns: 360px 1fr; gap:16px; height:100%; overflow-y:auto; padding-right:4px;",
      },
      el(
        "div",
        { style: "display:flex; flex-direction:column; gap:12px;" },
        renderSidebarCalendar(dateMap),
        el(
          "div",
          { class: "quota-card" },
          el(
            "div",
            { class: "quota-header" },
            el("span", {}, "⚡ Kapasitas Tim Harian"),
            el(
              "span",
              { style: "color:var(--accent);" },
              `${MAX_PER_DAY} Kasus/Hari`
            )
          ),
          el(
            "p",
            {
              style:
                "font-size:11px; color:var(--ink-soft); margin:6px 0 0; line-height:1.4;",
            },
            "Jadwal operasional Senin–Jumat. Kasus akhir pekan otomatis dialokasikan ke hari kerja berikutnya."
          )
        )
      ),
      el(
        "div",
        {
          style:
            "background:var(--panel); border:1px solid var(--border); border-radius:var(--radius); padding:16px; overflow-y:auto; box-shadow:var(--shadow-sm);",
        },
        el(
          "div",
          {
            style:
              "display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:10px;",
          },
          el(
            "h3",
            {
              style:
                "margin:0; font-size:15px; font-weight:800; color:var(--ink);",
            },
            selectedDate
              ? `📅 Agenda Kerja: ${fmtDateOnly(selectedDate)}`
              : "📅 Agenda Kerja: Seluruh Tanggal Operasional"
          ),
          selectedDate
            ? el(
                "button",
                {
                  class: "btn-secondary",
                  style: "font-size:11px;",
                  onclick: () => {
                    selectedDate = null;
                    render();
                  },
                },
                "Tampilkan Semua Hari"
              )
            : null
        ),
        el(
          "div",
          { style: "display:flex; flex-direction:column; gap:10px;" },
          ...(selectedDate
            ? dateMap[formatDateKey(selectedDate)] || []
            : complaints.filter((c) => c.status !== "selesai")
          ).map((c) => {
            const caseInfo = catInfo(c.category);
            return el(
              "div",
              {
                style:
                  "background:var(--bg); border:1px solid var(--border); padding:10px 12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;",
              },
              el(
                "div",
                {},
                el(
                  "div",
                  {
                    style:
                      "display:flex; gap:6px; align-items:center; margin-bottom:2px;",
                  },
                  el(
                    "span",
                    {
                      style:
                        "font-weight:800; font-size:12.5px; color:var(--accent);",
                    },
                    c.id
                  ),
                  el("span", { class: "case-tag" }, c.category),
                  el(
                    "span",
                    { style: "font-size:11px; font-weight:600;" },
                    caseInfo.label
                  )
                ),
                el(
                  "div",
                  { style: "font-weight:700; font-size:12px;" },
                  `${c.customer} • ${c.area || "Cikupa"}`
                ),
                el(
                  "div",
                  { style: "font-size:10.5px; color:var(--ink-soft);" },
                  c.address || "-"
                )
              ),
              el(
                "div",
                { style: "display:flex; gap:6px; align-items:center;" },
                el(
                  "span",
                  {
                    style:
                      "font-size:11px; font-weight:700; color:var(--accent);",
                  },
                  c.officer ? `👷 ${c.officer}` : "⚠️ Unassigned"
                ),
                el(
                  "button",
                  {
                    class: "btn-secondary",
                    style: "font-size:11px; padding:4px 8px;",
                    onclick: () => {
                      detailTargetId = c.id;
                      detailModalOpen = true;
                      render();
                    },
                  },
                  "🔍 Detail"
                )
              )
            );
          })
        )
      )
    );
  }

  function renderMobileAppTab() {
    const officer = selectedMobileOfficer || OFFICERS[0];
    const officerColor = getOfficerColor(officer);

    // Get all tickets assigned to this officer
    const officerTickets = complaints.filter((c) => c.officer === officer);
    const activeTickets = officerTickets.filter((c) => c.status !== "selesai");
    const prosesTickets = officerTickets.filter((c) => c.status === "proses");
    const selesaiTickets = officerTickets.filter((c) => c.status === "selesai");
    const urgentTickets = officerTickets.filter(
      (c) => c.urgent && c.status !== "selesai"
    );
    const waitingTickets = officerTickets.filter(
      (c) => c.status !== "proses" && c.status !== "selesai"
    );

    const totalAssigned = officerTickets.length;
    const completionRate =
      totalAssigned > 0
        ? Math.round((selesaiTickets.length / totalAssigned) * 100)
        : 0;

    // Route & distance calculation for this officer
    const routeData = calculateOfficerDailyRoute(officer);

    // Capacity status
    let capacityText = "Beban Ringan (Kapasitas Tersedia)";
    let capacityColor = "#10B981";
    let capacityBg = "rgba(16, 185, 129, 0.12)";
    if (activeTickets.length >= 6) {
      capacityText = "Beban Padat (Kapasitas Penuh)";
      capacityColor = "#EF4444";
      capacityBg = "rgba(239, 68, 68, 0.12)";
    } else if (activeTickets.length >= 3) {
      capacityText = "Beban Optimal (Seimbang)";
      capacityColor = "#0284C7";
      capacityBg = "rgba(2, 132, 199, 0.12)";
    } else if (activeTickets.length === 0) {
      capacityText = "Kosong / Bebas Tugas";
      capacityColor = "#6B7280";
      capacityBg = "rgba(107, 114, 128, 0.12)";
    }

    // Filter tickets according to mobileFilterStatus
    let filteredTickets = officerTickets;
    if (mobileFilterStatus === "urgent") {
      filteredTickets = officerTickets.filter(
        (c) => c.urgent && c.status !== "selesai"
      );
    } else if (mobileFilterStatus === "proses") {
      filteredTickets = officerTickets.filter((c) => c.status === "proses");
    } else if (mobileFilterStatus === "selesai") {
      filteredTickets = officerTickets.filter((c) => c.status === "selesai");
    }

    // Current time string for phone status bar
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    // Officer avatar initials
    const initials = officer
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return el(
      "div",
      { class: "mobile-app-wrapper" },

      // 1. Top Control Bar (Pilih Petugas & Pengaturan Sinkronisasi)
      el(
        "div",
        { class: "mobile-top-control-bar" },
        el(
          "div",
          {
            style:
              "display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;",
          },
          el(
            "div",
            {},
            el(
              "h2",
              {
                style:
                  "margin:0; font-size:16px; font-weight:800; display:flex; align-items:center; gap:8px;",
              },
              "📱 Aplikasi Petugas Lapangan (Mobile Dispatch Companion)",
              el(
                "span",
                {
                  class: "mobile-sync-badge",
                  title:
                    "Data tersinkron otomatis 2 arah dengan papan kerja pengawas",
                },
                "🟢 Realtime Sync Aktif"
              )
            ),
            el(
              "p",
              {
                style:
                  "margin:2px 0 0; font-size:11.5px; color:var(--ink-soft); line-height:1.4;",
              },
              "Antarmuka khusus smartphone untuk teknisi di lapangan. Setiap perubahan status yang diklik teknisi di HP otomatis mengupdate Papan Pengawas (Board, KPI, dan Peta)."
            )
          ),
          el(
            "div",
            {
              style:
                "display:flex; align-items:center; gap:8px; flex-wrap:wrap;",
            },
            el(
              "button",
              {
                class: "btn-secondary",
                style: "font-size:11px; padding:6px 10px;",
                onclick: () => {
                  mobileGuideOpen = !mobileGuideOpen;
                  render();
                },
              },
              mobileGuideOpen ? "✖ Tutup Petunjuk" : "📲 Cara Buka di HP Nyata"
            ),
            el(
              "button",
              {
                class: "btn-secondary",
                style: "font-size:11px; padding:6px 10px;",
                onclick: () => {
                  mobileDeviceMode =
                    mobileDeviceMode === "phone" ? "fullscreen" : "phone";
                  render();
                },
              },
              mobileDeviceMode === "phone"
                ? "🖥️ Layar Penuh"
                : "📱 Frame Handphone"
            ),
            el(
              "button",
              {
                class: "btn-primary",
                style:
                  "font-size:11px; padding:6px 12px; display:inline-flex; align-items:center; gap:5px;",
                onclick: () => {
                  mobileLastSyncTime = new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                  // @ts-ignore
                  if ((window as any).Swal) {
                    // @ts-ignore
                    (window as any).Swal.fire({
                      icon: "success",
                      title: "Sinkronisasi Berhasil!",
                      text: `Data Work Order untuk ${officer} telah disinkronkan dengan server pengawas (${mobileLastSyncTime}).`,
                      timer: 1500,
                      showConfirmButton: false,
                    });
                  }
                  render();
                },
              },
              "🔄 Sinkronkan Sekarang"
            )
          )
        ),

        // Officer Switcher Dropdown & Live Summary
        el(
          "div",
          {
            style:
              "display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; background:var(--panel-alt); padding:8px 12px; border-radius:8px; border:1px solid var(--border);",
          },
          el(
            "div",
            { style: "display:flex; align-items:center; gap:8px;" },
            el(
              "span",
              { style: "font-size:11.5px; font-weight:700;" },
              "Pilih Handphone Petugas:"
            ),
            el(
              "select",
              {
                style:
                  "padding:5px 10px; border-radius:6px; border:1px solid var(--border); background:var(--panel); font-size:12px; font-weight:700; color:var(--ink); cursor:pointer;",
                value: selectedMobileOfficer,
                onchange: (e: any) => {
                  selectedMobileOfficer = e.target.value;
                  render();
                },
              },
              ...OFFICERS.map((off) => {
                const offCount = complaints.filter(
                  (c) => c.officer === off && c.status !== "selesai"
                ).length;
                const offUrgent = complaints.filter(
                  (c) => c.officer === off && c.status !== "selesai" && c.urgent
                ).length;
                return el(
                  "option",
                  { value: off, selected: off === selectedMobileOfficer },
                  `👷 ${off} (${offCount} WO Aktif${
                    offUrgent > 0 ? `, 🚨 ${offUrgent} Urgent` : ""
                  })`
                );
              })
            )
          ),
          el(
            "div",
            {
              style:
                "font-size:11px; color:var(--ink-soft); display:flex; align-items:center; gap:6px;",
            },
            el("span", {}, `Terakhir sinkron: ${mobileLastSyncTime}`),
            el("span", { style: "color:var(--border);" }, "•"),
            el(
              "span",
              {
                style: `font-weight:700; color:${capacityColor}; background:${capacityBg}; padding:2px 8px; border-radius:4px;`,
              },
              capacityText
            )
          )
        ),

        // Expandable Guide on how to open on real smartphone
        mobileGuideOpen
          ? el(
              "div",
              {
                style:
                  "background:linear-gradient(135deg, rgba(2,132,199,0.06), rgba(16,185,129,0.06)); border:1px dashed #0284C7; border-radius:8px; padding:12px 14px; font-size:11.5px; line-height:1.5; color:var(--ink);",
              },
              el(
                "div",
                {
                  style:
                    "font-weight:800; color:#0284C7; margin-bottom:4px; display:flex; align-items:center; gap:6px;",
                },
                "📲 Petunjuk Membuka Aplikasi di Handphone Petugas Nyata (PWA Standalone):"
              ),
              el(
                "ol",
                { style: "margin:4px 0 6px 18px; padding:0;" },
                el(
                  "li",
                  {},
                  "Buka alamat URL aplikasi ini langsung di browser handphone teknisi (Google Chrome di Android atau Safari di iOS)."
                ),
                el(
                  "li",
                  {},
                  "Ketikkan atau bagikan link dengan akhiran hash '#mobile' agar otomatis langsung masuk ke mode mobile."
                ),
                el(
                  "li",
                  {},
                  "Di browser HP, klik menu opsi (titik 3 di Chrome atau ikon bagikan di Safari) lalu pilih 'Tambahkan ke Layar Utama' (Add to Home Screen)."
                ),
                el(
                  "li",
                  {},
                  "Aplikasi akan terpasang di menu smartphone teknisi seperti aplikasi resmi, dapat dibuka layar penuh, hemat kuota, dan otomatis sinkron dengan dashboard kantor."
                )
              ),
              el(
                "div",
                {
                  style:
                    "display:flex; align-items:center; gap:8px; margin-top:6px;",
                },
                el(
                  "button",
                  {
                    class: "btn-secondary",
                    style: "font-size:10.5px; padding:3px 8px;",
                    onclick: () => {
                      const mobileUrl = `${window.location.origin}${window.location.pathname}#mobile`;
                      navigator.clipboard.writeText(mobileUrl);
                      // @ts-ignore
                      if ((window as any).Swal) {
                        // @ts-ignore
                        (window as any).Swal.fire({
                          icon: "success",
                          title: "Tautan Disalin!",
                          text: "Tautan mode mobile disalin ke clipboard. Bagikan ke WhatsApp petugas lapangan.",
                          timer: 1600,
                          showConfirmButton: false,
                        });
                      }
                    },
                  },
                  "📋 Salin Tautan Mobile ke Clipboard"
                )
              )
            )
          : el("div", { style: "display:none;" })
      ),

      // 2. The Smartphone Mockup Container
      el(
        "div",
        {
          class: `mobile-device-frame ${
            mobileDeviceMode === "fullscreen" ? "fullscreen" : ""
          }`,
        },
        el(
          "div",
          { class: "mobile-screen" },

          // Realistic Mobile Status Bar
          el(
            "div",
            { class: "mobile-status-bar" },
            el("span", {}, timeStr),
            el(
              "div",
              { class: "mobile-notch" },
              el("div", { class: "mobile-notch-camera" }),
              el("div", {
                style:
                  "width:5px; height:5px; background:#10B981; border-radius:50%; box-shadow:0 0 4px #10B981;",
                title: "Live GPS Active",
              })
            ),
            el(
              "div",
              { style: "display:flex; align-items:center; gap:5px;" },
              el("span", { style: "font-size:9.5px;" }, "4G"),
              el("span", {}, "📶"),
              el("span", {}, "🔋 94%")
            )
          ),

          // Header inside the Smartphone
          el(
            "div",
            { class: "mobile-app-header" },
            el(
              "div",
              {
                style:
                  "display:flex; justify-content:space-between; align-items:center;",
              },
              el(
                "div",
                { style: "display:flex; align-items:center; gap:6px;" },
                el(
                  "span",
                  {
                    style:
                      "font-size:10px; font-weight:900; letter-spacing:0.5px; background:rgba(255,255,255,0.2); padding:2px 6px; border-radius:4px;",
                  },
                  "AETRA"
                ),
                el(
                  "span",
                  { style: "font-size:12px; font-weight:800;" },
                  "Mobile Petugas"
                )
              ),
              el(
                "span",
                {
                  style:
                    "font-size:10px; background:rgba(16,185,129,0.25); color:#A7F3D0; padding:2px 7px; border-radius:10px; font-weight:700; border:1px solid rgba(167,243,208,0.4);",
                },
                "🟢 Online"
              )
            ),

            // Officer Card inside Phone
            el(
              "div",
              { class: "mobile-officer-banner" },
              el(
                "div",
                { style: "display:flex; align-items:center; gap:10px;" },
                el(
                  "div",
                  {
                    class: "mobile-officer-avatar",
                    style: `border:2px solid ${officerColor.main}; color:${officerColor.main};`,
                  },
                  initials
                ),
                el(
                  "div",
                  {},
                  el(
                    "div",
                    {
                      style:
                        "font-size:13.5px; font-weight:800; line-height:1.2;",
                    },
                    officer
                  ),
                  el(
                    "div",
                    {
                      style:
                        "font-size:10.5px; opacity:0.85; margin-top:1px;",
                    },
                    "Teknisi Operasional • Armada Siaga"
                  )
                )
              ),
              el(
                "div",
                { style: "text-align:right;" },
                el(
                  "div",
                  { style: "font-size:18px; font-weight:900;" },
                  `${activeTickets.length}`
                ),
                el(
                  "div",
                  { style: "font-size:9.5px; opacity:0.85;" },
                  "Tugas Aktif"
                )
              )
            )
          ),

          // Workload Banner (Beban Kerja Petugas)
          el(
            "div",
            { class: "mobile-workload-banner" },
            el(
              "div",
              {
                style:
                  "display:flex; justify-content:space-between; align-items:center;",
              },
              el(
                "span",
                {
                  style:
                    "font-size:11.5px; font-weight:800; color:var(--ink); display:flex; align-items:center; gap:5px;",
                },
                "📊 Beban Kerja Petugas",
                el(
                  "span",
                  {
                    style: `font-size:9.5px; font-weight:700; color:${capacityColor}; background:${capacityBg}; padding:1px 6px; border-radius:4px;`,
                  },
                  capacityText
                )
              ),
              el(
                "span",
                {
                  style:
                    "font-size:10.5px; font-weight:700; color:var(--ink-soft);",
                },
                `${completionRate}% Selesai`
              )
            ),

            // Progress Bar Workload
            el(
              "div",
              {
                style:
                  "height:7px; background:var(--border); border-radius:4px; overflow:hidden; position:relative;",
              },
              el("div", {
                style: `height:100%; width:${Math.min(
                  100,
                  (activeTickets.length / 6) * 100
                )}%; background:${capacityColor}; border-radius:4px; transition:width 0.3s;`,
              })
            ),

            // 4 Key Quick Workload Metrics
            el(
              "div",
              {
                style:
                  "display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; text-align:center; padding-top:4px;",
              },
              el(
                "div",
                {
                  style:
                    "background:var(--panel-alt); padding:5px 2px; border-radius:6px; border:1px solid var(--border);",
                },
                el(
                  "div",
                  {
                    style:
                      "font-size:13px; font-weight:800; color:var(--ink);",
                  },
                  String(totalAssigned)
                ),
                el(
                  "div",
                  { style: "font-size:9px; color:var(--ink-soft);" },
                  "Total WO"
                )
              ),
              el(
                "div",
                {
                  style:
                    "background:var(--panel-alt); padding:5px 2px; border-radius:6px; border:1px solid var(--border);",
                },
                el(
                  "div",
                  {
                    style: "font-size:13px; font-weight:800; color:#D97706;",
                  },
                  String(waitingTickets.length)
                ),
                el(
                  "div",
                  { style: "font-size:9px; color:var(--ink-soft);" },
                  "Menunggu"
                )
              ),
              el(
                "div",
                {
                  style:
                    "background:var(--panel-alt); padding:5px 2px; border-radius:6px; border:1px solid var(--border);",
                },
                el(
                  "div",
                  {
                    style: "font-size:13px; font-weight:800; color:#2563EB;",
                  },
                  String(prosesTickets.length)
                ),
                el(
                  "div",
                  { style: "font-size:9px; color:var(--ink-soft);" },
                  "Dikerjakan"
                )
              ),
              el(
                "div",
                {
                  style:
                    "background:var(--panel-alt); padding:5px 2px; border-radius:6px; border:1px solid var(--border);",
                },
                el(
                  "div",
                  {
                    style: "font-size:13px; font-weight:800; color:#10B981;",
                  },
                  String(selesaiTickets.length)
                ),
                el(
                  "div",
                  { style: "font-size:9px; color:var(--ink-soft);" },
                  "Selesai"
                )
              )
            ),

            // Urgent alert if any
            urgentTickets.length > 0
              ? el(
                  "div",
                  {
                    style:
                      "background:#FEF2F2; border:1px solid #FECACA; color:#DC2626; padding:5px 8px; border-radius:6px; font-size:10.5px; font-weight:700; display:flex; align-items:center; gap:5px;",
                  },
                  el("span", {}, "🚨"),
                  el(
                    "span",
                    {},
                    `Ada ${urgentTickets.length} Work Order Darurat (SLA) memerlukan penanganan prioritas!`
                  )
                )
              : el("div", { style: "display:none;" })
          ),

          // Sub-tabs navigation inside Mobile Phone
          el(
            "div",
            { class: "mobile-subtabs" },
            el(
              "button",
              {
                class: `mobile-subtab-btn ${
                  mobileAppSubTab === "tasks" ? "active" : ""
                }`,
                onclick: () => {
                  mobileAppSubTab = "tasks";
                  render();
                },
              },
              `📋 Tugas (${officerTickets.length})`
            ),
            el(
              "button",
              {
                class: `mobile-subtab-btn ${
                  mobileAppSubTab === "route" ? "active" : ""
                }`,
                onclick: () => {
                  mobileAppSubTab = "route";
                  render();
                },
              },
              `🗺️ Rute (${routeData.orderedTickets.length})`
            ),
            el(
              "button",
              {
                class: `mobile-subtab-btn ${
                  mobileAppSubTab === "workload" ? "active" : ""
                }`,
                onclick: () => {
                  mobileAppSubTab = "workload";
                  render();
                },
              },
              "📊 Beban"
            ),
            el(
              "button",
              {
                class: `mobile-subtab-btn ${
                  mobileAppSubTab === "profile" ? "active" : ""
                }`,
                onclick: () => {
                  mobileAppSubTab = "profile";
                  render();
                },
              },
              "👤 Profil"
            )
          ),

          // Mobile Sub-Tab Content
          mobileAppSubTab === "tasks"
            ? el(
                "div",
                {
                  style:
                    "display:flex; flex-direction:column; flex:1; min-height:0;",
                },
                // Filter Row
                el(
                  "div",
                  { class: "mobile-filter-row" },
                  el(
                    "span",
                    {
                      class: `mobile-filter-pill ${
                        mobileFilterStatus === "all" ? "active" : ""
                      }`,
                      onclick: () => {
                        mobileFilterStatus = "all";
                        render();
                      },
                    },
                    `Semua (${officerTickets.length})`
                  ),
                  el(
                    "span",
                    {
                      class: `mobile-filter-pill ${
                        mobileFilterStatus === "urgent" ? "active" : ""
                      }`,
                      onclick: () => {
                        mobileFilterStatus = "urgent";
                        render();
                      },
                    },
                    `🚨 Darurat (${urgentTickets.length})`
                  ),
                  el(
                    "span",
                    {
                      class: `mobile-filter-pill ${
                        mobileFilterStatus === "proses" ? "active" : ""
                      }`,
                      onclick: () => {
                        mobileFilterStatus = "proses";
                        render();
                      },
                    },
                    `▶ Dikerjakan (${prosesTickets.length})`
                  ),
                  el(
                    "span",
                    {
                      class: `mobile-filter-pill ${
                        mobileFilterStatus === "selesai" ? "active" : ""
                      }`,
                      onclick: () => {
                        mobileFilterStatus = "selesai";
                        render();
                      },
                    },
                    `✅ Selesai (${selesaiTickets.length})`
                  )
                ),

                // Tickets Scroll List
                el(
                  "div",
                  { class: "mobile-tickets-scroll" },
                  filteredTickets.length === 0
                    ? el(
                        "div",
                        {
                          style:
                            "text-align:center; padding:32px 16px; color:var(--ink-soft); font-size:12px; display:flex; flex-direction:column; align-items:center; gap:8px;",
                        },
                        el("span", { style: "font-size:32px;" }, "🎉"),
                        el(
                          "div",
                          { style: "font-weight:700;" },
                          "Tidak ada Work Order pada kategori ini"
                        ),
                        el(
                          "div",
                          { style: "font-size:11px;" },
                          "Semua tugas selesai atau belum ada penugasan baru dari pengawas."
                        )
                      )
                    : filteredTickets.map((ticket) => {
                        const cInfo = catInfo(ticket.category);
                        const deadlineInfo = getDeadlineInfo(ticket);
                        const isDone = ticket.status === "selesai";
                        const isProses = ticket.status === "proses";

                        let statusBadgeStyle =
                          "background:#F3F4F6; color:#4B5563;";
                        let statusText = "⏳ Menunggu";
                        if (isDone) {
                          statusBadgeStyle =
                            "background:#DEF7EC; color:#03543F;";
                          statusText = "✅ Selesai";
                        } else if (isProses) {
                          statusBadgeStyle =
                            "background:#DBEAFE; color:#1E40AF;";
                          statusText = "▶ Sedang Dikerjakan";
                        }

                        // WhatsApp link
                        const cleanPhone = (ticket.phone || "").replace(
                          /\D/g,
                          ""
                        );
                        const waNumber = cleanPhone.startsWith("0")
                          ? "62" + cleanPhone.slice(1)
                          : cleanPhone;
                        const waText = encodeURIComponent(
                          `Halo Bpk/Ibu ${ticket.customer}, saya ${officer} dari Aetra Air Tangerang terkait penanganan Work Order ${ticket.id} (${cInfo.label}).`
                        );
                        const waUrl = waNumber
                          ? `https://wa.me/${waNumber}?text=${waText}`
                          : "#";

                        // Google Maps Link
                        const coords = parseCoords(ticket.coords);
                        const mapUrl = coords
                          ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              ticket.address + " " + ticket.area
                            )}`;

                        return el(
                          "div",
                          {
                            class: `mobile-ticket-card ${
                              ticket.urgent && !isDone ? "card-urgent" : ""
                            }`,
                          },
                          // Header: ID, Priority, Status
                          el(
                            "div",
                            {
                              style:
                                "display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;",
                            },
                            el(
                              "div",
                              {
                                style:
                                  "display:flex; align-items:center; gap:6px;",
                              },
                              el(
                                "span",
                                {
                                  style:
                                    "font-family:monospace; font-size:12px; font-weight:800; color:var(--ink);",
                                },
                                ticket.id
                              ),
                              ticket.urgent
                                ? el(
                                    "span",
                                    {
                                      style:
                                        "background:#FEE2E2; color:#DC2626; font-size:9.5px; font-weight:800; padding:1px 6px; border-radius:4px; border:1px solid #FECACA;",
                                    },
                                    "🚨 URGENT"
                                  )
                                : el("span", { style: "display:none;" })
                            ),
                            el(
                              "span",
                              {
                                style: `font-size:10px; font-weight:800; padding:2px 8px; border-radius:10px; ${statusBadgeStyle}`,
                              },
                              statusText
                            )
                          ),

                          // Customer & Meter info
                          el(
                            "div",
                            {},
                            el(
                              "div",
                              {
                                style:
                                  "font-size:12.5px; font-weight:800; color:var(--ink); display:flex; align-items:center; justify-content:space-between;",
                              },
                              el("span", {}, ticket.customer || "-"),
                              el(
                                "span",
                                {
                                  style:
                                    "font-size:10px; font-weight:600; color:var(--ink-soft); font-family:monospace;",
                                },
                                ticket.meterId ? `MTR: ${ticket.meterId}` : ""
                              )
                            ),
                            el(
                              "div",
                              {
                                style:
                                  "font-size:11px; color:var(--ink-soft); margin-top:2px; display:flex; align-items:flex-start; gap:4px;",
                              },
                              el("span", {}, "📍"),
                              el(
                                "span",
                                {},
                                `${ticket.address} (${ticket.area})`
                              )
                            )
                          ),

                          // Category & Description
                          el(
                            "div",
                            {
                              style:
                                "background:var(--panel-alt); padding:6px 8px; border-radius:6px; font-size:11px; border:1px solid var(--border);",
                            },
                            el(
                              "div",
                              { style: "font-weight:700; color:var(--ink);" },
                              `[${ticket.category}] ${cInfo.label}`
                            ),
                            ticket.desc
                              ? el(
                                  "div",
                                  {
                                    style:
                                      "color:var(--ink-soft); font-size:10.5px; margin-top:2px; line-height:1.3;",
                                  },
                                  ticket.desc
                                )
                              : el("span", { style: "display:none;" })
                          ),

                          // SLA / Schedule info
                          el(
                            "div",
                            {
                              style:
                                "display:flex; justify-content:space-between; align-items:center; font-size:10px; color:var(--ink-soft);",
                            },
                            el(
                              "span",
                              {},
                              `Batas SLA: ${deadlineInfo.statusText}`
                            ),
                            ticket.rescheduledDate
                              ? el(
                                  "span",
                                  { style: "color:#D97706; font-weight:700;" },
                                  `Reschedule: ${ticket.rescheduledDate}`
                                )
                              : el(
                                  "span",
                                  {},
                                  `Masuk: ${fmtDateTime(
                                    new Date(ticket.receivedAt)
                                  )}`
                                )
                          ),

                          // Action Buttons for Field Technician
                          el(
                            "div",
                            { class: "mobile-action-bar" },
                            // Call / WA
                            el(
                              "a",
                              {
                                class: "mobile-act-btn",
                                style:
                                  "background:#25D366; color:#FFF; text-decoration:none;",
                                href: waUrl,
                                target: "_blank",
                                rel: "noopener noreferrer",
                              },
                              "💬 Hubungi WA"
                            ),
                            // Navigation Maps
                            el(
                              "a",
                              {
                                class: "mobile-act-btn",
                                style:
                                  "background:#0EA5E9; color:#FFF; text-decoration:none;",
                                href: mapUrl,
                                target: "_blank",
                                rel: "noopener noreferrer",
                              },
                              "🧭 Navigasi"
                            ),
                            // Work State Change: Mulai / Selesai
                            !isDone
                              ? !isProses
                                ? el(
                                    "button",
                                    {
                                      class: "mobile-act-btn",
                                      style: "background:#2563EB; color:#FFF;",
                                      onclick: () => {
                                        ticket.status = "proses";
                                        saveLocal();
                                        // @ts-ignore
                                        if ((window as any).Swal) {
                                          // @ts-ignore
                                          (window as any).Swal.fire({
                                            icon: "info",
                                            title: "Pengerjaan Dimulai",
                                            text: `Status WO ${ticket.id} diubah menjadi 'Sedang Dikerjakan'. Dashboard pengawas otomatis terupdate.`,
                                            timer: 1600,
                                            showConfirmButton: false,
                                          });
                                        }
                                        render();
                                      },
                                    },
                                    "▶ Mulai Kerja"
                                  )
                                : el(
                                    "button",
                                    {
                                      class: "mobile-act-btn",
                                      style: "background:#10B981; color:#FFF;",
                                      onclick: () => {
                                        finishTargetId = ticket.id;
                                        finishModalOpen = true;
                                        render();
                                      },
                                    },
                                    "✅ Selesaikan"
                                  )
                              : el(
                                  "button",
                                  {
                                    class: "mobile-act-btn",
                                    style:
                                      "background:var(--panel-alt); border:1px solid var(--border); color:var(--ink-soft);",
                                    onclick: () => {
                                      detailTargetId = ticket.id;
                                      detailModalOpen = true;
                                      render();
                                    },
                                  },
                                  "👁️ Detail Kasus"
                                )
                          )
                        );
                      })
                )
              )
            : mobileAppSubTab === "route"
            ? el(
                "div",
                {
                  style:
                    "display:flex; flex-direction:column; flex:1; min-height:0; overflow-y:auto; padding:8px 12px 14px; gap:10px;",
                },
                // Route Summary Card
                el(
                  "div",
                  {
                    style:
                      "background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:10px; display:flex; justify-content:space-between; align-items:center;",
                  },
                  el(
                    "div",
                    {},
                    el(
                      "div",
                      { style: "font-size:12px; font-weight:800;" },
                      "Urutan Kunjungan Lapangan"
                    ),
                    el(
                      "div",
                      {
                        style:
                          "font-size:11px; color:var(--ink-soft); margin-top:2px;",
                      },
                      `${routeData.orderedTickets.length} Titik • ~${routeData.totalDistanceKm} km • Est. ${routeData.estTravelMinutes} mnt`
                    )
                  ),
                  el(
                    "a",
                    {
                      class: "btn-primary",
                      style:
                        "font-size:10.5px; padding:6px 10px; text-decoration:none; display:inline-flex; align-items:center; gap:4px;",
                      href: routeData.googleMapsUrl,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    },
                    "🗺️ Buka Rute Penuh"
                  )
                ),

                // Stop by stop sequence
                ...routeData.orderedTickets.map((t, index) => {
                  const cInfo = catInfo(t.category);
                  return el(
                    "div",
                    {
                      style:
                        "display:flex; gap:10px; align-items:flex-start; background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:10px;",
                    },
                    el(
                      "div",
                      {
                        style:
                          "width:24px; height:24px; border-radius:50%; background:#0284C7; color:#FFF; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; flex-shrink:0;",
                      },
                      String(index + 1)
                    ),
                    el(
                      "div",
                      { style: "flex:1;" },
                      el(
                        "div",
                        {
                          style:
                            "display:flex; justify-content:space-between; align-items:center;",
                        },
                        el(
                          "span",
                          { style: "font-size:12px; font-weight:800;" },
                          t.customer
                        ),
                        el(
                          "span",
                          {
                            style:
                              "font-size:10px; font-family:monospace;",
                          },
                          t.id
                        )
                      ),
                      el(
                        "div",
                        {
                          style:
                            "font-size:11px; color:var(--ink-soft); margin-top:2px;",
                        },
                        `${t.address} (${t.area})`
                      ),
                      el(
                        "div",
                        {
                          style:
                            "font-size:10.5px; color:var(--accent); font-weight:700; margin-top:3px;",
                        },
                        `[${t.category}] ${cInfo.label}`
                      )
                    )
                  );
                })
              )
            : mobileAppSubTab === "workload"
            ? el(
                "div",
                {
                  style:
                    "display:flex; flex-direction:column; flex:1; min-height:0; overflow-y:auto; padding:8px 12px 14px; gap:10px;",
                },
                el(
                  "div",
                  {
                    style:
                      "background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:8px;",
                  },
                  el(
                    "h4",
                    { style: "margin:0; font-size:13px; font-weight:800;" },
                    "📈 Analisis Beban & Kapasitas Teknisi"
                  ),
                  el(
                    "div",
                    {
                      style:
                        "font-size:11.5px; color:var(--ink-soft); line-height:1.4;",
                    },
                    `Teknisi ${officer} memiliki kuota optimal penanganan harian sebesar 5-8 tiket. Saat ini memegang ${activeTickets.length} tiket aktif.`
                  ),
                  el(
                    "div",
                    {
                      style: `padding:8px 10px; border-radius:6px; background:${capacityBg}; color:${capacityColor}; font-size:11.5px; font-weight:800;`,
                    },
                    `Status Kapasitas: ${capacityText}`
                  )
                ),

                // Area distribution for this officer
                el(
                  "div",
                  {
                    style:
                      "background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:8px;",
                  },
                  el(
                    "h4",
                    { style: "margin:0; font-size:12.5px; font-weight:800;" },
                    "🗺️ Wilayah Cakupan Kerja"
                  ),
                  el(
                    "div",
                    { style: "display:flex; flex-wrap:wrap; gap:6px;" },
                    ...routeData.areas.map((ar) =>
                      el(
                        "span",
                        {
                          style:
                            "background:var(--panel-alt); border:1px solid var(--border); padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700;",
                        },
                        `📍 ${ar}`
                      )
                    )
                  )
                ),

                // KPI completion summary
                el(
                  "div",
                  {
                    style:
                      "background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:8px;",
                  },
                  el(
                    "h4",
                    { style: "margin:0; font-size:12.5px; font-weight:800;" },
                    "🏆 Tingkat Penyelesaian (SLA)"
                  ),
                  el(
                    "div",
                    {
                      style:
                        "display:flex; justify-content:space-between; font-size:12px; font-weight:700;",
                    },
                    el("span", {}, "Tingkat Sukses:"),
                    el(
                      "span",
                      { style: "color:#10B981;" },
                      `${completionRate}%`
                    )
                  ),
                  el(
                    "div",
                    {
                      style:
                        "height:8px; background:var(--border); border-radius:4px; overflow:hidden;",
                    },
                    el("div", {
                      style: `height:100%; width:${completionRate}%; background:#10B981; border-radius:4px;`,
                    })
                  )
                )
              )
            : el(
                // Profile Sub-tab
                "div",
                {
                  style:
                    "display:flex; flex-direction:column; flex:1; min-height:0; overflow-y:auto; padding:14px 12px; gap:12px;",
                },
                el(
                  "div",
                  {
                    style:
                      "background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:16px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px;",
                  },
                  el(
                    "div",
                    {
                      style: `width:56px; height:56px; border-radius:50%; background:${officerColor.bg}; border:3px solid ${officerColor.main}; color:${officerColor.main}; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:900;`,
                    },
                    initials
                  ),
                  el(
                    "div",
                    { style: "font-size:15px; font-weight:800;" },
                    officer
                  ),
                  el(
                    "div",
                    { style: "font-size:11.5px; color:var(--ink-soft);" },
                    "Divisi Distribusi & Transmisi • Minor Repair"
                  ),
                  el(
                    "span",
                    {
                      style:
                        "font-size:10.5px; background:rgba(16,185,129,0.15); color:#059669; font-weight:800; padding:2px 8px; border-radius:10px;",
                    },
                    "Teknisi Bersertifikat Aetra"
                  )
                ),

                el(
                  "div",
                  {
                    style:
                      "background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:8px; font-size:11.5px;",
                  },
                  el(
                    "div",
                    { style: "font-weight:800; color:var(--ink);" },
                    "Informasi Operasional:"
                  ),
                  el(
                    "div",
                    {
                      style:
                        "display:flex; justify-content:space-between; color:var(--ink-soft);",
                    },
                    el("span", {}, "Nomor Kontak Dispatch:"),
                    el(
                      "span",
                      { style: "font-weight:700; color:var(--ink);" },
                      "0812-8899-7711 (Pusat)"
                    )
                  ),
                  el(
                    "div",
                    {
                      style:
                        "display:flex; justify-content:space-between; color:var(--ink-soft);",
                    },
                    el("span", {}, "Armada / Motor:"),
                    el(
                      "span",
                      { style: "font-weight:700; color:var(--ink);" },
                      "B 3912 PKX (Unit Lapangan)"
                    )
                  ),
                  el(
                    "div",
                    {
                      style:
                        "display:flex; justify-content:space-between; color:var(--ink-soft);",
                    },
                    el("span", {}, "Sistem Sinkron:"),
                    el(
                      "span",
                      { style: "font-weight:700; color:#10B981;" },
                      "Supabase + Local Backup"
                    )
                  )
                )
              ),

          // Bottom Bar of the smartphone
          el(
            "div",
            { class: "mobile-bottom-nav" },
            el(
              "button",
              {
                class: `mobile-bottom-item ${
                  mobileAppSubTab === "tasks" ? "active" : ""
                }`,
                onclick: () => {
                  mobileAppSubTab = "tasks";
                  render();
                },
              },
              el("span", { style: "font-size:14px;" }, "📋"),
              el("span", {}, "Tugas WO")
            ),
            el(
              "button",
              {
                class: `mobile-bottom-item ${
                  mobileAppSubTab === "route" ? "active" : ""
                }`,
                onclick: () => {
                  mobileAppSubTab = "route";
                  render();
                },
              },
              el("span", { style: "font-size:14px;" }, "🗺️"),
              el("span", {}, "Rute Jalan")
            ),
            el(
              "button",
              {
                class: `mobile-bottom-item ${
                  mobileAppSubTab === "workload" ? "active" : ""
                }`,
                onclick: () => {
                  mobileAppSubTab = "workload";
                  render();
                },
              },
              el("span", { style: "font-size:14px;" }, "📊"),
              el("span", {}, "Beban Kerja")
            ),
            el(
              "button",
              {
                class: `mobile-bottom-item ${
                  mobileAppSubTab === "profile" ? "active" : ""
                }`,
                onclick: () => {
                  mobileAppSubTab = "profile";
                  render();
                },
              },
              el("span", { style: "font-size:14px;" }, "👤"),
              el("span", {}, "Profil")
            )
          )
        )
      )
    );
  }

  function initFleetMap() {
    const container = document.getElementById("fleet-map-container");
    if (!container) return;

    if (fleetMapObj) {
      try {
        fleetMapObj.remove();
      } catch (e) {}
      fleetMapObj = null;
    }

    if ((container as any)._leaflet_id) {
      try {
        delete (container as any)._leaflet_id;
      } catch (e) {}
    }

    // @ts-ignore
    const L = (window as any).L;
    if (!L) return;

    try {
      fleetMapObj = L.map(container, { zoomControl: false }).setView(
        [OFFICE_COORDS.lat, OFFICE_COORDS.lng],
        11
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        fleetMapObj
      );

      L.marker([OFFICE_COORDS.lat, OFFICE_COORDS.lng])
        .addTo(fleetMapObj)
        .bindPopup("<b>Kantor Cikupa</b>");

      complaints.forEach((c) => {
        if (c.status !== "selesai" && c.coords) {
          const parts = c.coords.split(",").map((p) => parseFloat(p.trim()));
          if (parts.length === 2 && !isNaN(parts[0])) {
            L.circleMarker([parts[0], parts[1]], {
              radius: 6,
              fillColor: c.urgent ? "#EF4444" : "#2563EB",
              color: "#FFF",
              weight: 1,
              fillOpacity: 0.8,
            })
              .addTo(fleetMapObj)
              .bindPopup(`<b>${c.id}</b><br>${c.customer}`);
          }
        }
      });
    } catch (e) {
      console.warn("Error initializing fleet map:", e);
    }
  }

  function renderDonutChart() {
    const canvas = document.getElementById(
      "donutChartCanvas"
    ) as HTMLCanvasElement;
    if (!canvas) return;

    // @ts-ignore
    const Chart = (window as any).Chart;
    if (!Chart) return;

    const belum = complaints.filter((c) => c.status === "baru").length;
    const proses = complaints.filter((c) => c.status === "proses").length;
    const selesai = complaints.filter((c) => c.status === "selesai").length;

    const existingChart = Chart.getChart ? Chart.getChart(canvas) : null;
    if (existingChart) {
      try {
        existingChart.destroy();
      } catch (e) {}
    }
    if (donutChartObj) {
      try {
        donutChartObj.destroy();
      } catch (e) {}
      donutChartObj = null;
    }

    try {
      donutChartObj = new Chart(canvas, {
        type: "doughnut",
        data: {
          labels: ["Belum", "Diproses", "Selesai"],
          datasets: [
            {
              data: [belum, proses, selesai],
              backgroundColor: ["#3B82F6", "#F59E0B", "#10B981"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
        },
      });
    } catch (e) {
      console.warn("Donut chart error:", e);
    }
  }

  function renderCaseChart() {
    const counts: Record<string, number> = {};
    const customerMap: Record<string, number> = {};
    const officerDoneCounts: Record<string, number> = {};

    OFFICERS.forEach((o) => (officerDoneCounts[o] = 0));
    let totalWaitHours = 0;

    complaints.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
      const custKey = c.meterId || c.customer;
      if (custKey) customerMap[custKey] = (customerMap[custKey] || 0) + 1;
      totalWaitHours += hoursWaiting(c);

      if (c.status === "selesai" && c.officer && OFFICERS.includes(c.officer)) {
        officerDoneCounts[c.officer]++;
      }
    });

    const totalDiterima = complaints.length;
    const avgWaitHours =
      totalDiterima > 0 ? Math.round(totalWaitHours / totalDiterima) : 0;
    const repeatCustomers = Object.values(customerMap).filter(
      (val) => val > 1
    ).length;
    const customerCount = Object.keys(customerMap).length;
    const repeatRate =
      totalDiterima > 0
        ? Math.round((repeatCustomers / (customerCount || 1)) * 100) || 0
        : 0;

    const activeCases = Object.keys(counts)
      .map((key) => ({
        key,
        count: counts[key],
        label: catInfo(key).label,
      }))
      .sort((a, b) => b.count - a.count);

    return el(
      "div",
      { class: "chart-card" },
      el(
        "div",
        { class: "chart-header" },
        el("h3", {}, "📊 Analytics & KPI Kinerja CASE"),
        el("span", { class: "total-badge" }, `Total: ${totalDiterima}`)
      ),

      activeCases.length === 0
        ? el(
            "div",
            {
              style:
                "font-size:11px; color:var(--ink-soft); text-align:center; padding:8px;",
            },
            "Belum ada data komplain."
          )
        : el(
            "div",
            { class: "chart-list" },
            ...activeCases.map((item) => {
              const pct =
                totalDiterima > 0
                  ? Math.round((item.count / totalDiterima) * 100)
                  : 0;
              return el(
                "div",
                { class: "chart-item" },
                el(
                  "div",
                  { class: "chart-label" },
                  el("span", {}, `[${item.key}] ${item.label}`),
                  el("span", {}, `${item.count} (${pct}%)`)
                ),
                el(
                  "div",
                  { class: "chart-bar-bg" },
                  el("div", {
                    class: "chart-bar-fill",
                    style: `width: ${pct}%`,
                  })
                )
              );
            })
          ),

      el(
        "div",
        {
          style:
            "margin-top:10px; padding-top:8px; border-top:1px dashed var(--border);",
        },
        el(
          "div",
          {
            style:
              "font-size:10.5px; font-weight:700; color:var(--ink-soft); margin-bottom:4px;",
          },
          "🏆 PRODUKTIVITAS PETUGAS (SELESAI):"
        ),
        el(
          "div",
          { class: "officer-done-grid" },
          ...OFFICERS.map((off) =>
            el(
              "div",
              {
                class: "officer-done-box",
                style: "cursor:pointer;",
                title: `Klik untuk melihat tampilan HP Petugas ${off}`,
                onclick: () => {
                  selectedMobileOfficer = off;
                  currentTab = "mobile";
                  render();
                },
              },
              el("span", { class: "officer-done-name" }, `👷 ${off}`),
              el(
                "span",
                { class: "officer-done-count" },
                `${officerDoneCounts[off]} WO 📱`
              )
            )
          )
        )
      ),

      el(
        "div",
        { class: "analytics-grid" },
        el(
          "div",
          { class: "analytics-box" },
          el("div", { class: "val" }, `${avgWaitHours} Jam`),
          el("div", { class: "lbl" }, "Rata Wait Time")
        ),
        el(
          "div",
          { class: "analytics-box" },
          el("div", { class: "val" }, `${repeatRate}%`),
          el("div", { class: "lbl" }, "Rasio Berulang")
        ),
        el(
          "div",
          { class: "analytics-box" },
          el("div", { class: "val" }, activeCases[0] ? activeCases[0].key : "-"),
          el("div", { class: "lbl" }, "Top CASE")
        )
      )
    );
  }

  function renderSidebarCalendar(dateMap: Record<string, ComplaintItem[]>) {
    const selectedKey = selectedDate ? formatDateKey(selectedDate) : null;
    const headerTitle = selectedDate
      ? selectedDate.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })
      : "Semua Tanggal Kerja";

    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const monthTitle = viewMonth.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const startDayOfWeek = firstDay.getDay();

    const dateCells: any[] = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      dateCells.push({ dayNum: prevMonthLastDay - i, isOtherMonth: true });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const fullDate = new Date(year, month, d);
      const key = formatDateKey(fullDate);
      const tasks = dateMap[key] || [];
      const weekend = isWeekend(fullDate);

      dateCells.push({
        dayNum: d,
        fullDate,
        key,
        isSelected: key === selectedKey,
        isWeekend: weekend,
        hasTasks: tasks.length > 0,
        hasHigh: tasks.some(
          (t) => urgencyLevel(t) === "tinggi" && t.status !== "selesai"
        ),
        allDone: tasks.length > 0 && tasks.every((t) => t.status === "selesai"),
        isOtherMonth: false,
      });
    }

    const remainingSlots = 42 - dateCells.length;
    for (let i = 1; i <= remainingSlots; i++) {
      dateCells.push({ dayNum: i, isOtherMonth: true });
    }

    const headers = [
      { t: "Min", w: true },
      { t: "Sen", w: false },
      { t: "Sel", w: false },
      { t: "Rab", w: false },
      { t: "Kam", w: false },
      { t: "Jum", w: false },
      { t: "Sab", w: true },
    ];

    return el(
      "div",
      { class: "calendar-card" },
      el(
        "div",
        { class: "cal-top-header" },
        el("span", {}, headerTitle),
        selectedDate
          ? el(
              "button",
              {
                style:
                  "font-size:10px; background:none; border:none; color:#38BDF8; cursor:pointer; font-weight:700;",
                onclick: () => {
                  selectedDate = null;
                  render();
                },
              },
              "Reset Filter"
            )
          : null
      ),
      el(
        "div",
        { class: "cal-month-nav" },
        el("span", { class: "cal-month-title" }, monthTitle),
        el(
          "div",
          { class: "cal-nav-btns" },
          el(
            "button",
            {
              class: "cal-nav-btn",
              onclick: () => {
                viewMonth.setMonth(viewMonth.getMonth() - 1);
                render();
              },
            },
            "▲"
          ),
          el(
            "button",
            {
              class: "cal-nav-btn",
              onclick: () => {
                viewMonth.setMonth(viewMonth.getMonth() + 1);
                render();
              },
            },
            "▼"
          )
        )
      ),
      el(
        "div",
        { class: "cal-grid-embedded" },
        ...headers.map((h) =>
          el("div", { class: "cal-head-cell " + (h.w ? "weekend-head" : "") }, h.t)
        ),
        ...dateCells.map((c) => {
          if (c.isOtherMonth) {
            return el(
              "div",
              { class: "cal-date-cell other-month" },
              String(c.dayNum)
            );
          }
          let classes = "cal-date-cell";
          if (c.isWeekend) classes += " weekend-day";
          if (c.isSelected) classes += " selected";
          if (c.hasTasks) classes += " has-tasks";
          if (c.hasHigh) classes += " has-high";
          if (c.allDone) classes += " all-done";

          return el(
            "div",
            {
              class: classes,
              title: c.isWeekend
                ? "Hari Libur (Sabtu/Minggu) - Kasus Otomatis Dialihkan ke Senin"
                : "Hari Kerja Operasional",
              onclick: () => {
                if (c.isWeekend) return;
                selectedDate =
                  selectedDate && formatDateKey(selectedDate) === c.key
                    ? null
                    : c.fullDate;
                render();
              },
            },
            String(c.dayNum)
          );
        })
      ),
      el(
        "div",
        { class: "quota-card" },
        el(
          "div",
          { class: "quota-header" },
          el("span", {}, "⚡ Auto Load-Balancer Kuota/Hari Kerja"),
          el("span", { style: "color:var(--accent);" }, `${MAX_PER_DAY} Kasus`)
        ),
        el("input", {
          type: "range",
          min: "5",
          max: "25",
          value: String(MAX_PER_DAY),
          style: "width:100%; cursor:pointer;",
          oninput: (e: any) => {
            MAX_PER_DAY = parseInt(e.target.value, 10);
            render();
          },
        })
      )
    );
  }

  function renderTicket(
    item: ComplaintItem,
    itemScheduledDateMap: Record<string, Date>
  ) {
    const metrics = computeUrgencyMetrics(item);
    const level = metrics.level;
    const badgeText =
      level === "tinggi" ? "Urgent" : level === "sedang" ? "Medium" : "Low";
    const isDone = item.status === "selesai";
    const coordsObj = parseCoords(item.coords);
    const deadlineInfo = getDeadlineInfo(item);
    const slaCountdown = getSLACountdown(item.receivedAt);
    const mapContainerId = "map-" + item.id;
    const caseDetails = catInfo(item.category);

    const scheduledDateObj = itemScheduledDateMap[item.id];
    const scheduledText = scheduledDateObj ? fmtDateOnly(scheduledDateObj) : "-";

    const formattedPhone = formatWA(item.phone);
    const waText = encodeURIComponent(
      `Halo Bpk/Ibu ${item.customer},\n\nKami dari Petugas Lapangan Aetra Air Tangerang (${
        item.officer || "Petugas Lapangan"
      }) mengonfirmasi WO ${item.id} [${
        caseDetails.label
      }]. Petugas menuju lokasi. Terima kasih.`
    );
    const waUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${waText}`
      : null;

    const googleMapsRouteUrl = coordsObj
      ? `https://www.google.com/maps/dir/?api=1&destination=${coordsObj.lat},${coordsObj.lng}&travelmode=driving`
      : null;

    const officerSelectCard = el(
      "select",
      {
        class: "officer-select-inline " + (!item.officer ? "unassigned" : ""),
        onchange: (e: any) => assignOfficerToWO(item.id, e.target.value),
      },
      el("option", { value: "" }, "⚠️ Pilih Petugas Lapangan"),
      ...OFFICERS.map((off) =>
        el(
          "option",
          { value: off, selected: item.officer === off ? "selected" : null },
          `👷 ${off}`
        )
      )
    );

    const isUnassigned =
      (!item.officer || item.officer.trim() === "") && !isDone;
    const rank = isUnassigned ? getUnassignedRank(item.id) : null;
    const totalUnassigned = getUnassignedList().length;
    const isFirstRank = rank === 1;
    const isLastRank = rank !== null && rank >= totalUnassigned;

    let rankBadgeEl: HTMLElement | null = null;
    if (isUnassigned && rank !== null) {
      const cls =
        rank === 1
          ? "top-1"
          : rank === 2
          ? "top-2"
          : rank === 3
          ? "top-3"
          : "standard";
      const icon =
        rank === 1 ? "👑" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "#";
      rankBadgeEl = el(
        "span",
        {
          class: `rank-badge ${cls}`,
          title: `Prioritas Antrean Dispatcher: #${rank} dari ${totalUnassigned} (Tahan & seret untuk ubah urutan)`,
        },
        `${icon} #${rank} Prioritas`
      );
    }

    let dragHandleEl: HTMLElement | null = null;
    let reorderControlsEl: HTMLElement | null = null;

    if (isUnassigned) {
      dragHandleEl = el(
        "div",
        {
          class: "drag-handle",
          title: "Tahan dan seret kartu ini untuk mengatur urutan prioritas",
        },
        "⠿ Drag"
      );

      reorderControlsEl = el(
        "div",
        { class: "reorder-btn-group", title: "Atur Prioritas Dispatcher" },
        !isFirstRank
          ? el(
              "button",
              {
                class: "reorder-btn top-btn",
                title: "Jadikan Prioritas Teratas (#1)",
                onclick: (e: Event) => {
                  e.stopPropagation();
                  moveUnassignedItem(item.id, "top");
                },
              },
              "⏫ Top"
            )
          : null,
        !isFirstRank
          ? el(
              "button",
              {
                class: "reorder-btn",
                title: "Naikkan 1 Peringkat Prioritas",
                onclick: (e: Event) => {
                  e.stopPropagation();
                  moveUnassignedItem(item.id, "up");
                },
              },
              "▲"
            )
          : null,
        !isLastRank
          ? el(
              "button",
              {
                class: "reorder-btn",
                title: "Turunkan 1 Peringkat Prioritas",
                onclick: (e: Event) => {
                  e.stopPropagation();
                  moveUnassignedItem(item.id, "down");
                },
              },
              "▼"
            )
          : null
      );
    }

    const ticketCard = el(
      "div",
      {
        id: `ticket-${item.id}`,
        class: `ticket ${isUnassigned ? "draggable-ticket" : ""} ${
          isDone ? "selesai" : ""
        } ${selectedTicketIds.has(item.id) ? "selected" : ""}`,
        draggable: isUnassigned ? "true" : "false",
        ondragstart: (e: DragEvent) => {
          if (!isUnassigned) return;
          draggedTicketId = item.id;
          if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", item.id);
          }
          ticketCard.classList.add("dragging");
        },
        ondragover: (e: DragEvent) => {
          if (!isUnassigned || !draggedTicketId || draggedTicketId === item.id)
            return;
          e.preventDefault();
          if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
          ticketCard.classList.add("drag-over");
        },
        ondragleave: () => {
          ticketCard.classList.remove("drag-over");
        },
        ondrop: (e: DragEvent) => {
          if (!isUnassigned) return;
          e.preventDefault();
          ticketCard.classList.remove("drag-over");
          if (draggedTicketId && draggedTicketId !== item.id) {
            const rect = ticketCard.getBoundingClientRect();
            const place =
              e.clientY - rect.top > rect.height / 2 ? "after" : "before";
            reorderUnassigned(draggedTicketId, item.id, place);
          }
        },
        ondragend: () => {
          ticketCard.classList.remove("dragging");
          ticketCard.classList.remove("drag-over");
          draggedTicketId = null;
        },
      },
      el(
        "div",
        { class: "ticket-top" },
        el(
          "div",
          {
            style:
              "display:flex; align-items:center; gap:6px; flex-wrap:wrap;",
          },
          el("input", {
            type: "checkbox",
            class: "ticket-select-chk",
            checked: selectedTicketIds.has(item.id) ? "checked" : null,
            title: "Pilih untuk aksi massal",
            onclick: (e: Event) => {
              e.stopPropagation();
              if (selectedTicketIds.has(item.id)) {
                selectedTicketIds.delete(item.id);
              } else {
                selectedTicketIds.add(item.id);
              }
              render();
            },
          }),
          dragHandleEl,
          rankBadgeEl,
          el("span", { class: "ticket-id" }, item.id),
          el("span", { class: "ticket-cust" }, item.customer),
          item.meterId
            ? el(
                "span",
                { style: "font-size:10.5px; color:var(--ink-soft);" },
                `(${item.meterId})`
              )
            : null
        ),
        el(
          "div",
          { style: "display:flex; gap:6px; align-items:center;" },
          reorderControlsEl,
          !isDone
            ? el("span", { class: "countdown-badge" }, slaCountdown.text)
            : null,
          el(
            "span",
            {
              class: `ticket-badge ${
                isDone ? "badge-selesai" : "badge-" + level
              }`,
            },
            isDone ? "Selesai" : badgeText
          )
        )
      ),
      !isDone
        ? el(
            "div",
            {
              class: "sla-progress-wrap",
              title: `SLA 14 Hari: ${Math.min(
                100,
                Math.round(
                  (Math.max(
                    0,
                    Date.now() - new Date(item.receivedAt).getTime()
                  ) /
                    (14 * 24 * 3600 * 1000)) *
                    100
                )
              )}% Waktu Terpakai`,
            },
            el("div", {
              class: "sla-progress-fill",
              style: `width: ${Math.min(
                100,
                Math.round(
                  (Math.max(
                    0,
                    Date.now() - new Date(item.receivedAt).getTime()
                  ) /
                    (14 * 24 * 3600 * 1000)) *
                    100
                )
              )}%; background: ${
                Math.min(
                  100,
                  Math.round(
                    (Math.max(
                      0,
                      Date.now() - new Date(item.receivedAt).getTime()
                    ) /
                      (14 * 24 * 3600 * 1000)) *
                      100
                  )
                ) >= 90
                  ? "#EF4444"
                  : Math.min(
                      100,
                      Math.round(
                        (Math.max(
                          0,
                          Date.now() - new Date(item.receivedAt).getTime()
                        ) /
                          (14 * 24 * 3600 * 1000)) *
                          100
                      )
                    ) >= 65
                  ? "#F59E0B"
                  : "#10B981"
              };`,
            })
          )
        : null,
      el(
        "div",
        { class: "ticket-main-info" },
        el("span", { class: "case-tag" }, item.category),
        el("span", {}, caseDetails.label),
        el(
          "span",
          { class: "score-tag", title: "Skor Urgensi Otomatis" },
          `⭐ ${metrics.score.toFixed(2)}`
        ),
        officerSelectCard,
        item.area
          ? el(
              "span",
              { style: "font-weight:700; color:#92400E;" },
              `• Area: ${item.area}`
            )
          : null
      ),
      item.address
        ? el("div", { class: "ticket-address" }, `📍 ${item.address}`)
        : null,
      item.desc ? el("div", { class: "ticket-desc" }, item.desc) : null,

      item.photoBefore || item.photoAfter
        ? el(
            "div",
            { class: "photo-proof-grid" },
            item.photoBefore
              ? el(
                  "div",
                  { class: "photo-box" },
                  el("div", { class: "photo-lbl" }, "BEFORE"),
                  el("img", { src: item.photoBefore })
                )
              : null,
            item.photoAfter
              ? el(
                  "div",
                  { class: "photo-box" },
                  el("div", { class: "photo-lbl" }, "AFTER"),
                  el("img", { src: item.photoAfter })
                )
              : null
          )
        : null,

      el(
        "div",
        { class: "schedule-row-simple" },
        el("span", {}, `📅 Pengerjaan: ${scheduledText}`),
        el(
          "span",
          { class: `deadline-tag ${deadlineInfo.statusClass}` },
          deadlineInfo.statusText
        )
      ),
      coordsObj
        ? el(
            "div",
            {},
            el("div", { id: mapContainerId, class: "ticket-map-container" }),
            el(
              "div",
              {
                style:
                  "display:flex; justify-content:space-between; align-items:center; margin-top:3px;",
              },
              el(
                "span",
                { style: "font-size:10px; color:var(--ink-soft);" },
                `📍 ${coordsObj.lat.toFixed(4)}, ${coordsObj.lng.toFixed(4)}`
              ),
              el(
                "a",
                {
                  href: googleMapsRouteUrl,
                  target: "_blank",
                  rel: "noopener",
                  class: "btn-nav-route",
                },
                "🚗 Petunjuk Rute ↗"
              )
            )
          )
        : null,
      el(
        "div",
        { class: "ticket-actions" },
        waUrl
          ? el(
              "a",
              {
                class: "btn-wa",
                href: waUrl,
                target: "_blank",
                rel: "noopener",
              },
              "💬 WhatsApp"
            )
          : null,
        el(
          "button",
          { class: "copy-btn", onclick: () => copyFieldFormat(item) },
          "📋 Copy Format"
        ),
        !isDone
          ? el(
              "button",
              {
                class: "resched-btn",
                onclick: () => markAbsentAndReschedule(item.id),
              },
              "🏠 Reschedule"
            )
          : null,
        !isDone && item.status !== "proses"
          ? el(
              "button",
              { class: "progress", onclick: () => setStatus(item.id, "proses") },
              "Proses"
            )
          : null,
        !isDone
          ? el(
              "button",
              {
                class: "done",
                onclick: () => {
                  finishTargetId = item.id;
                  finishModalOpen = true;
                  render();
                },
              },
              "Selesai"
            )
          : null,
        isDone
          ? el(
              "button",
              { class: "progress", onclick: () => setStatus(item.id, "proses") },
              "Buka Lagi"
            )
          : null,
        el(
          "button",
          {
            class: "btn-secondary",
            style: "font-weight:700; color:var(--accent);",
            onclick: () => {
              detailTargetId = item.id;
              detailModalOpen = true;
              render();
            },
          },
          "🔍 Detail"
        ),
        el(
          "button",
          {
            class: "btn-secondary",
            style: "font-weight:700; color:#4338CA;",
            onclick: () => {
              spkTicketIds = [item.id];
              spkModalOpen = true;
              render();
            },
          },
          "🖨️ SPK"
        ),
        el(
          "button",
          {
            onclick: () => {
              editingId = item.id;
              formOpen = true;
              render();
            },
          },
          "Edit"
        ),
        el(
          "button",
          { class: "del", onclick: () => removeComplaint(item.id) },
          "Hapus"
        )
      )
    );

    return ticketCard;
  }

  function initMaps() {
    Object.keys(activeMaps).forEach((id) => {
      if (activeMaps[id] && activeMaps[id].remove) {
        try {
          activeMaps[id].remove();
        } catch (e) {}
      }
      delete activeMaps[id];
    });

    // @ts-ignore
    const L = (window as any).L;
    if (!L) return;

    complaints.forEach((item) => {
      const coords = parseCoords(item.coords);
      const container = document.getElementById("map-" + item.id);
      if (container && coords) {
        if ((container as any)._leaflet_id) {
          try {
            delete (container as any)._leaflet_id;
          } catch (e) {}
        }
        try {
          const map = L.map(container, {
            attributionControl: false,
            zoomControl: false,
          });
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
          }).addTo(map);

          L.marker([OFFICE_COORDS.lat, OFFICE_COORDS.lng])
            .addTo(map)
            .bindPopup("Kantor Aetra Cikupa");
          L.marker([coords.lat, coords.lng])
            .addTo(map)
            .bindPopup("Lokasi Pelanggan");

          const routeLine = L.polyline(
            [
              [OFFICE_COORDS.lat, OFFICE_COORDS.lng],
              [coords.lat, coords.lng],
            ],
            { color: "#0284C7", weight: 4, opacity: 0.8, dashArray: "6, 6" }
          ).addTo(map);

          map.fitBounds(routeLine.getBounds(), { padding: [15, 15] });
          activeMaps[item.id] = map;
        } catch (e) {}
      }
    });
  }

  function render() {
    if (isDisposed) return;
    const root = rootElement || document.getElementById("app-root");
    if (!root) return;
    root.innerHTML = "";

    const { dateMap, itemScheduledDateMap } = calculateCalendarSchedule();
    let base = complaints;

    if (searchQuery.trim()) {
      const terms = searchQuery.toLowerCase().trim().split(/\s+/);
      base = base.filter((c) => {
        const cInfo = catInfo(c.category);
        const fullContent = [
          c.id,
          c.customer,
          c.meterId,
          c.phone,
          c.address,
          c.area,
          c.category,
          cInfo.label,
          c.desc,
          c.officer,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return terms.every((term) => fullContent.includes(term));
      });
    }

    if (quickFilter === "urgent")
      base = base.filter((c) => urgencyLevel(c) === "tinggi");
    else if (quickFilter === "unassigned")
      base = base.filter(
        (c) => (!c.officer || c.officer.trim() === "") && c.status !== "selesai"
      );
    else if (quickFilter === "proses")
      base = base.filter((c) => c.status === "proses");
    else if (quickFilter === "reschedule")
      base = base.filter((c) => c.rescheduledDate);

    if (categoryFilter !== "semua")
      base = base.filter((c) => c.category === categoryFilter);

    if (officerFilter === "unassigned")
      base = base.filter(
        (c) => (!c.officer || c.officer.trim() === "") && c.status !== "selesai"
      );
    else if (officerFilter !== "semua")
      base = base.filter((c) => c.officer === officerFilter);

    if (selectedDate) {
      const selKey = formatDateKey(selectedDate);
      base = base.filter((item) => {
        const schedDate = itemScheduledDateMap[item.id];
        return schedDate && formatDateKey(schedDate) === selKey;
      });
    }

    const processSmartSort = (items: ComplaintItem[]) => {
      const sorted = [...items];

      if (sortMode === "manual") {
        sorted.sort((a, b) => {
          const rankA = getUnassignedRank(a.id);
          const rankB = getUnassignedRank(b.id);
          if (rankA !== rankB) return rankA - rankB;
          return (
            computeUrgencyMetrics(b).score - computeUrgencyMetrics(a).score
          );
        });
      } else if (sortMode === "prioritas") {
        sorted.sort((a, b) => {
          const scoreDiff =
            computeUrgencyMetrics(b).score - computeUrgencyMetrics(a).score;
          if (Math.abs(scoreDiff) > 0.05) return scoreDiff;
          return (
            new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
          );
        });
      } else if (sortMode === "waktu-terbaru") {
        sorted.sort(
          (a, b) =>
            new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
        );
      } else if (sortMode === "waktu-lama") {
        sorted.sort(
          (a, b) =>
            new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
        );
      } else if (sortMode === "nama") {
        sorted.sort((a, b) =>
          (a.customer || "").localeCompare(b.customer || "")
        );
      }

      const groupedByZonaAndArea: Record<string, ComplaintItem[]> = {};

      sorted.forEach((item) => {
        const areaName = (item.area || "Cikupa").trim();
        const zona = getZonaByArea(areaName);
        const groupKey = `${zona} - KECAMATAN/AREA: ${areaName.toUpperCase()}`;

        if (!groupedByZonaAndArea[groupKey]) {
          groupedByZonaAndArea[groupKey] = [];
        }
        groupedByZonaAndArea[groupKey].push(item);
      });

      return groupedByZonaAndArea;
    };

    const belumGroups = processSmartSort(
      base.filter((c) => c.status === "baru")
    );
    const prosesGroups = processSmartSort(
      base.filter((c) => c.status === "proses")
    );
    const selesaiGroups = processSmartSort(
      base.filter((c) => c.status === "selesai")
    );

    const openAll = complaints.filter((c) => c.status !== "selesai");
    const unassignedCount = complaints.filter(
      (c) => (!c.officer || c.officer.trim() === "") && c.status !== "selesai"
    ).length;
    const totalSelesai = complaints.filter((c) => c.status === "selesai").length;
    const tinggiCount = openAll.filter(
      (c) => urgencyLevel(c) === "tinggi"
    ).length;
    const overdueCount = openAll.filter(
      (c) => getDeadlineInfo(c).isOverdue
    ).length;
    const highPriorityBreaches = getHighPrioritySlaBreaches();

    const renderUnassignedQueueSection = (
      items: ComplaintItem[],
      itemScheduledMap: Record<string, Date>
    ) => {
      const sortedUnassigned = [...items].sort(
        (a, b) => getUnassignedRank(a.id) - getUnassignedRank(b.id)
      );

      return el(
        "div",
        { class: "unassigned-queue-wrapper" },
        el(
          "div",
          { class: "unassigned-banner" },
          el(
            "div",
            {
              style:
                "display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;",
            },
            el(
              "div",
              {},
              el(
                "h3",
                {
                  style:
                    "margin:0 0 4px 0; font-size:15px; font-weight:800; color:var(--ink-dark); display:flex; align-items:center; gap:8px;",
                },
                "📋 Antrean Prioritas Work Order Belum Ditugaskan",
                el(
                  "span",
                  {
                    style:
                      "background:#FEF3C7; color:#92400E; font-size:11px; font-weight:800; padding:2px 8px; border-radius:12px; border:1px solid #FDE68A;",
                  },
                  `${sortedUnassigned.length} Work Order`
                )
              ),
              el(
                "p",
                {
                  style:
                    "margin:0; font-size:12px; color:var(--ink-soft); line-height:1.4;",
                },
                "Tahan & geser (Drag & Drop) kartu atau gunakan tombol ⏫ Top / ▲ / ▼ untuk memprioritaskan perbaikan kritis. Urutan teratas otomatis didahulukan dalam jadwal kalender kerja & fitur Auto-Assign."
              )
            ),
            el(
              "div",
              { style: "display:flex; gap:6px; flex-wrap:wrap;" },
              el(
                "button",
                {
                  class: "btn-primary",
                  style: "font-size:11.5px; padding:6px 10px;",
                  title: "Naikkan seluruh kasus Urgent & Berisiko Tinggi ke antrean paling atas",
                  onclick: () => prioritizeAllUrgentUnassigned(),
                },
                "🔥 Prioritaskan Semua Urgent"
              ),
              el(
                "button",
                {
                  class: "btn-autoassign",
                  style: "font-size:11.5px; padding:6px 10px;",
                  title: "Tugaskan ke petugas lapangan berdasarkan urutan prioritas antrean",
                  onclick: () => autoAssignMerata(),
                },
                "⚖️ Auto-Assign Urutan Ini"
              ),
              el(
                "button",
                {
                  class: "btn-secondary",
                  style: "font-size:11.5px; padding:6px 10px;",
                  title: "Kembalikan urutan antrean ke kalkulasi SLA standar",
                  onclick: () => resetUnassignedOrderToDefault(),
                },
                "🔄 Reset Urutan Standar"
              )
            )
          )
        ),
        sortedUnassigned.length === 0
          ? el(
              "div",
              { class: "empty" },
              "🎉 Luar biasa! Semua Work Order aktif sudah ditugaskan ke petugas lapangan."
            )
          : el(
              "div",
              {
                class: "unassigned-tickets-list",
                style:
                  "display:flex; flex-direction:column; gap:10px; margin-top:10px;",
              },
              ...sortedUnassigned.map((item) =>
                renderTicket(item, itemScheduledMap)
              )
            )
      );
    };

    const renderGroupedSection = (
      title: string,
      groups: Record<string, ComplaintItem[]>,
      isFirst: boolean
    ) => {
      const zones = Object.keys(groups);
      const totalInSec = zones.reduce((acc, z) => acc + groups[z].length, 0);

      return el(
        "div",
        {},
        el(
          "div",
          { class: "section-head" + (isFirst ? " first" : "") },
          title,
          el("span", { class: "count" }, String(totalInSec))
        ),
        totalInSec === 0
          ? el("div", { class: "empty" }, "Tidak ada komplain di seksi ini.")
          : el(
              "div",
              {},
              ...zones.map((zoneName) =>
                el(
                  "div",
                  {},
                  el(
                    "div",
                    { class: "area-group-header" },
                    el("span", {}, `🗺️ ${zoneName}`),
                    el(
                      "span",
                      { class: "area-badge" },
                      `${groups[zoneName].length} WO`
                    )
                  ),
                  ...groups[zoneName].map((item) =>
                    renderTicket(item, itemScheduledDateMap)
                  )
                )
              )
            )
      );
    };

    const mastheadEl = el(
      "div",
      { class: "masthead" },
      el(
        "div",
        { class: "brand-group" },
        el(
          "div",
          { class: "brand-logo-badge", title: "PT Aetra Air Tangerang" },
          el("img", {
            class: "brand-logo",
            src: "/aetra-logo.svg",
            alt: "Logo PT Aetra Air Tangerang",
          })
        ),
        el(
          "div",
          { class: "brand-title" },
          el(
            "h1",
            {},
            "Papan Kerja Minor Repair",
            el("span", { class: "brand-live-pill" }, "Live")
          ),
          el(
            "span",
            { class: "unit" },
            "Aetra Air Tangerang • Sistem Kendali Operasional Lapangan"
          )
        )
      ),
      el(
        "div",
        { class: "workspace-tabs" },
        el(
          "button",
          {
            class: `workspace-tab ${currentTab === "board" ? "active" : ""}`,
            onclick: () => {
              currentTab = "board";
              render();
            },
          },
          "📋 Board Antrean"
        ),
        el(
          "button",
          {
            class: `workspace-tab ${currentTab === "map" ? "active" : ""}`,
            onclick: () => {
              currentTab = "map";
              render();
            },
          },
          "🗺️ Armada & Rute"
        ),
        el(
          "button",
          {
            class: `workspace-tab ${currentTab === "analytics" ? "active" : ""}`,
            onclick: () => {
              currentTab = "analytics";
              render();
            },
          },
          "📊 KPI & Analisis"
        ),
        el(
          "button",
          {
            class: `workspace-tab ${currentTab === "calendar" ? "active" : ""}`,
            onclick: () => {
              currentTab = "calendar";
              render();
            },
          },
          "📅 Kalender & Kuota"
        ),
        el(
          "button",
          {
            class: `workspace-tab ${currentTab === "mobile" ? "active" : ""}`,
            style:
              currentTab === "mobile"
                ? ""
                : "border-color:rgba(16,185,129,0.5); background:rgba(16,185,129,0.08); font-weight:700;",
            title:
              "Buka antarmuka khusus smartphone handphone petugas di lapangan (tersinkron realtime)",
            onclick: () => {
              currentTab = "mobile";
              render();
            },
          },
          "📱 HP Petugas (Mobile)"
        )
      ),
      el(
        "div",
        { style: "display:flex; align-items:center; gap:8px;" },
        el(
          "button",
          {
            class: "btn-primary",
            style:
              "padding:6px 13px; font-size:11.5px; font-weight:700; display:inline-flex; align-items:center; gap:6px; border-radius:6px; box-shadow:var(--shadow-sm);",
            title: "Input Laporan / Work Order Baru",
            onclick: () => {
              currentTab = "board";
              formOpen = true;
              editingId = null;
              selectedDate = null;
              quickFilter = "semua";
              render();
              setTimeout(() => {
                const f = document.getElementById("wo-create-form") || document.querySelector(".form-panel.open");
                if (f) {
                  f.scrollIntoView({ behavior: "smooth", block: "start" });
                  const inp = f.querySelector("input") as HTMLInputElement | null;
                  if (inp) inp.focus();
                }
              }, 70);
            },
          },
          "➕ Buat WO Baru"
        ),
        el(
          "div",
          {
            class: `sync-indicator-pill ${
              syncStatus === "syncing" ? "syncing" : ""
            }`,
            title: "Klik untuk sinkronisasi data dengan cloud",
            onclick: async () => {
              syncStatus = "syncing";
              render();
              await load();
              syncStatus = "synced";
              render();
            },
          },
          el("span", { class: "sync-dot" }),
          syncStatus === "syncing" ? "Menyinkronkan..." : "Cloud Sync Aktif"
        ),
        highPriorityBreaches.length > 0
          ? el(
              "div",
              {
                class: "masthead-sla-alert-badge",
                title: `🚨 ${highPriorityBreaches.length} Work Order prioritas tinggi melewati SLA. Klik untuk buka radar pengalihan teknisi.`,
                onclick: () => {
                  slaRadarTargetTicketId = highPriorityBreaches[0].ticket.id;
                  slaRadarModalOpen = true;
                  render();
                },
              },
              el("span", { class: "sla-beacon-dot" }),
              `🚨 ${highPriorityBreaches.length} SLA Breach`
            )
          : null,
        el(
          "div",
          { class: "live-clock-badge", title: "Waktu Lokal Tangerang (WIB)" },
          `🕒 ${currentTimeString}`
        ),
        el(
          "button",
          {
            class: "btn-secondary",
            style: "padding:5px 10px;",
            onclick: () => {
              isDarkMode = !isDarkMode;
              document.body.classList.toggle("dark-mode", isDarkMode);
              render();
            },
          },
          isDarkMode ? "☀️ Terang" : "🌙 Gelap"
        )
      )
    );

    let activeTabBody: HTMLElement;
    if (currentTab === "map") {
      activeTabBody = renderRouteMapTab();
    } else if (currentTab === "analytics") {
      activeTabBody = renderAnalyticsTab();
    } else if (currentTab === "calendar") {
      activeTabBody = renderCalendarTab(dateMap);
    } else if (currentTab === "mobile") {
      activeTabBody = renderMobileAppTab();
    } else {
      activeTabBody = el(
        "div",
        {
          style:
            "display:flex; flex-direction:column; gap:10px; height:100%; min-height:0;",
        },
        renderProactiveSlaAlertBanner(highPriorityBreaches, overdueCount),
        el(
          "div",
          { class: "dashboard-grid-balanced" },

        el(
          "div",
          { class: "left-col-sidebar" },
          el(
            "div",
            { class: "fleet-map-card" },
            el(
              "div",
              { class: "fleet-map-header" },
              el("span", {}, "🗺️ Fleet Map Sebaran Kasus")
            ),
            el("div", { id: "fleet-map-container" })
          ),
          el(
            "div",
            { class: "summary" },
            el(
              "div",
              {
                class: `stat-card unassigned-stat ${
                  quickFilter === "unassigned" ? "active-stat" : ""
                }`,
                title: "Buka Antrean Prioritas Belum Ditugaskan (Drag & Drop Reorder)",
                style: "cursor:pointer;",
                onclick: () => {
                  quickFilter =
                    quickFilter === "unassigned" ? "semua" : "unassigned";
                  render();
                },
              },
              el("div", { class: "num" }, String(unassignedCount)),
              el("div", { class: "lbl" }, "Unassigned 🎯")
            ),
            el(
              "div",
              { class: "stat-card tinggi" },
              el("div", { class: "num" }, String(tinggiCount)),
              el("div", { class: "lbl" }, "Urgent")
            ),
            el(
              "div",
              { class: "stat-card" },
              el("div", { class: "num" }, String(openAll.length)),
              el("div", { class: "lbl" }, "Aktif")
            ),
            el(
              "div",
              { class: "stat-card selesai-stat" },
              el("div", { class: "num" }, String(totalSelesai)),
              el("div", { class: "lbl" }, "Selesai")
            )
          ),
          el(
            "button",
            {
              class: "btn-secondary",
              style:
                "width:100%; font-size:11px; padding:6px 10px; margin-top:6px; display:flex; justify-content:center; align-items:center; gap:6px; background:var(--panel-alt); font-weight:700; border-radius:6px;",
              onclick: () => {
                currentTab = "analytics";
                render();
              },
            },
            "📈 Tren Kinerja 30 Hari (Completion Rate)"
          ),
          renderCaseChart(),
          el(
            "div",
            { class: "chart-card" },
            el(
              "div",
              { class: "chart-header" },
              el("h3", {}, "📊 Komposisi Status Work Order")
            ),
            el(
              "div",
              { style: "height:140px; position:relative;" },
              el("canvas", { id: "donutChartCanvas" })
            )
          ),
          renderSidebarCalendar(dateMap)
        ),

        el(
          "div",
          { class: "right-col-content" },
          el(
            "div",
            { class: "search-bar" },
            el("input", {
              class: "search-input",
              type: "text",
              placeholder:
                "🔍 Cari WO, Pelanggan, ID Meter, WA, Alamat, Area, CASE, atau Petugas...",
              value: searchQuery,
              oninput: (e: any) => {
                searchQuery = e.target.value;
                render();
              },
            }),
            el(
              "span",
              {
                class: `quick-badge ${
                  quickFilter === "semua" ? "active" : ""
                }`,
                onclick: () => {
                  quickFilter = "semua";
                  render();
                },
              },
              "Semua"
            ),
            el(
              "span",
              {
                class: `quick-badge ${
                  quickFilter === "unassigned" ? "active" : ""
                }`,
                title: "Filter dan atur prioritas Work Order Belum Ditugaskan",
                onclick: () => {
                  quickFilter =
                    quickFilter === "unassigned" ? "semua" : "unassigned";
                  render();
                },
              },
              `🎯 Unassigned (${unassignedCount})`
            ),
            el(
              "span",
              {
                class: `quick-badge ${
                  quickFilter === "urgent" ? "active" : ""
                }`,
                onclick: () => {
                  quickFilter = "urgent";
                  render();
                },
              },
              "🔥 Urgent"
            ),
            el(
              "span",
              {
                class: `quick-badge ${
                  quickFilter === "proses" ? "active" : ""
                }`,
                onclick: () => {
                  quickFilter = "proses";
                  render();
                },
              },
              "⚙️ Diproses"
            ),
            el(
              "span",
              {
                class: `quick-badge ${
                  quickFilter === "reschedule" ? "active" : ""
                }`,
                onclick: () => {
                  quickFilter = "reschedule";
                  render();
                },
              },
              "🏠 Reschedule"
            )
          ),

          el(
            "div",
            { class: "toolbar" },
            el(
              "div",
              { class: "toolbar-actions" },
              el(
                "button",
                {
                  class:
                    quickFilter === "unassigned"
                      ? "btn-primary"
                      : "btn-secondary",
                  title:
                    "Buka tampilan antrean prioritas Unassigned untuk Drag & Drop reorder",
                  onclick: () => {
                    quickFilter =
                      quickFilter === "unassigned" ? "semua" : "unassigned";
                    render();
                  },
                },
                `🎯 Antrean Prioritas (${unassignedCount})`
              ),
              el(
                "button",
                {
                  class: "btn-primary",
                  onclick: () => {
                    formOpen = !formOpen;
                    emailModalOpen = false;
                    historyModalOpen = false;
                    if (!formOpen) editingId = null;
                    render();
                    if (formOpen) {
                      setTimeout(() => {
                        const f = document.getElementById("wo-create-form") || document.querySelector(".form-panel.open");
                        if (f) {
                          f.scrollIntoView({ behavior: "smooth", block: "start" });
                          const inp = f.querySelector("input") as HTMLInputElement | null;
                          if (inp) inp.focus();
                        }
                      }, 70);
                    }
                  },
                },
                formOpen ? "Tutup Form" : "+ Manual Komplain"
              ),
              el(
                "button",
                {
                  class: "btn-autoassign",
                  onclick: () => autoAssignMerata(),
                },
                "⚖️ Auto-Assign"
              ),
              el(
                "button",
                {
                  class: "btn-email",
                  onclick: () => {
                    emailModalOpen = !emailModalOpen;
                    formOpen = false;
                    historyModalOpen = false;
                    render();
                  },
                },
                "🔄 Email Parser"
              ),
              el(
                "button",
                {
                  class: "btn-history",
                  onclick: () => {
                    historyModalOpen = !historyModalOpen;
                    formOpen = false;
                    emailModalOpen = false;
                    render();
                  },
                },
                "📜 History"
              ),
              el(
                "button",
                {
                  class: "btn-csv",
                  title: "Ekspor daftar Work Order saat ini ke format CSV untuk pelaporan",
                  onclick: () => exportToCsv(base, itemScheduledDateMap),
                },
                "📄 Export CSV"
              ),
              el(
                "button",
                {
                  class: "btn-excel",
                  onclick: () => exportToExcel(base, itemScheduledDateMap),
                },
                "📊 Export Excel"
              ),
              el(
                "button",
                {
                  class: "btn-secondary",
                  style:
                    selectedTicketIds.size > 0
                      ? "background:#0284C7; color:#FFFFFF; font-weight:700; border-color:#0284C7;"
                      : "background:rgba(2,132,199,0.08); color:#0284C7; font-weight:700; border-color:rgba(2,132,199,0.4);",
                  title:
                    selectedTicketIds.size > 0
                      ? "Batalkan pilihan semua Work Order"
                      : "Pilih semua Work Order pada tampilan ini untuk aksi massal",
                  onclick: () => {
                    if (
                      selectedTicketIds.size === base.length &&
                      base.length > 0
                    ) {
                      selectedTicketIds.clear();
                    } else {
                      base.forEach((c) => selectedTicketIds.add(c.id));
                    }
                    render();
                  },
                },
                selectedTicketIds.size > 0
                  ? `☑️ ${selectedTicketIds.size} Dipilih (Batal)`
                  : `☑️ Pilih Semua (${base.length})`
              ),
              el(
                "button",
                {
                  class: "btn-secondary",
                  style:
                    "color:#059669; border-color:rgba(16,185,129,0.5); font-weight:700; background:rgba(16,185,129,0.06);",
                  title:
                    "Buka tampilan antarmuka khusus smartphone handphone petugas di lapangan",
                  onclick: () => {
                    currentTab = "mobile";
                    render();
                  },
                },
                "📱 Buka HP Petugas"
              )
            ),
            el(
              "div",
              { class: "filters" },
              el(
                "div",
                { class: "filter-group" },
                "Filter Petugas:",
                el(
                  "select",
                  {
                    onchange: (e: any) => {
                      officerFilter = e.target.value;
                      render();
                    },
                  },
                  el(
                    "option",
                    {
                      value: "semua",
                      selected: officerFilter === "semua" ? "selected" : null,
                    },
                    "Semua Petugas"
                  ),
                  el(
                    "option",
                    {
                      value: "unassigned",
                      selected:
                        officerFilter === "unassigned" ? "selected" : null,
                    },
                    "⚠️ Belum Ditugaskan (Unassigned)"
                  ),
                  ...OFFICERS.map((o) =>
                    el(
                      "option",
                      {
                        value: o,
                        selected: officerFilter === o ? "selected" : null,
                      },
                      o
                    )
                  )
                )
              ),
              el(
                "div",
                { class: "filter-group" },
                "CASE:",
                el(
                  "select",
                  {
                    onchange: (e: any) => {
                      categoryFilter = e.target.value;
                      render();
                    },
                  },
                  el(
                    "option",
                    {
                      value: "semua",
                      selected: categoryFilter === "semua" ? "selected" : null,
                    },
                    "Semua CASE"
                  ),
                  ...CATEGORIES.map((c) =>
                    el(
                      "option",
                      {
                        value: c.key,
                        selected: categoryFilter === c.key ? "selected" : null,
                      },
                      `[${c.key}] ${c.label}`
                    )
                  )
                )
              ),
              el(
                "div",
                { class: "filter-group" },
                "Urutkan:",
                el(
                  "select",
                  {
                    onchange: (e: any) => {
                      sortMode = e.target.value;
                      render();
                    },
                  },
                  el(
                    "option",
                    {
                      value: "manual",
                      selected: sortMode === "manual" ? "selected" : null,
                    },
                    "✋ Urutan Prioritas Dispatcher"
                  ),
                  el(
                    "option",
                    {
                      value: "prioritas",
                      selected: sortMode === "prioritas" ? "selected" : null,
                    },
                    "⚡ Skor Urgensi -> Waktu -> Kluster"
                  ),
                  el(
                    "option",
                    {
                      value: "waktu-terbaru",
                      selected:
                        sortMode === "waktu-terbaru" ? "selected" : null,
                    },
                    "🕒 Waktu Terbaru"
                  ),
                  el(
                    "option",
                    {
                      value: "waktu-lama",
                      selected: sortMode === "waktu-lama" ? "selected" : null,
                    },
                    "⏳ Waktu Terlama"
                  ),
                  el(
                    "option",
                    {
                      value: "nama",
                      selected: sortMode === "nama" ? "selected" : null,
                    },
                    "🔤 Nama (A-Z)"
                  )
                )
              )
            )
          ),

          renderForm(),
          renderEmailParserModal(),
          renderHistoryModal(),
          renderFinishModal(),

          selectedDate
            ? el(
                "div",
                {
                  class: "filter-date-banner",
                  style:
                    "background:#E0F2FE; color:#0369A1; padding:6px 10px; border-radius:6px; font-size:11.5px; font-weight:700; display:flex; justify-content:space-between; align-items:center;",
                },
                el(
                  "span",
                  {},
                  `📅 Menampilkan Kasus Tanggal Kerja: ${fmtDateOnly(
                    selectedDate
                  )}`
                ),
                el(
                  "button",
                  {
                    style:
                      "color:#0284C7; font-size:11px; background:none; border:none; cursor:pointer;",
                    onclick: () => {
                      selectedDate = null;
                      render();
                    },
                  },
                  "Tampilkan Semua"
                )
              )
            : null,

          quickFilter === "unassigned"
            ? renderUnassignedQueueSection(base, itemScheduledDateMap)
            : el(
                "div",
                {},
                renderGroupedSection("Belum Dikerjakan", belumGroups, true),
                renderGroupedSection("Sedang Dikerjakan", prosesGroups, false),
                renderGroupedSection("Selesai", selesaiGroups, false)
              )
        )
      )
    );
  }

    const wrap = el(
      "div",
      { class: "wrap" },
      mastheadEl,
      renderBatchActionBar(base),
      activeTabBody,
      renderDetailModal(),
      renderSpkModal(),
      renderDailyRouteSheetModal(),
      renderSlaReassignModal()
    );

    root.appendChild(wrap);
    if (renderTimer) {
      clearTimeout(renderTimer);
      renderTimer = null;
    }
    renderTimer = setTimeout(() => {
      if (isDisposed) return;
      try {
        if (currentTab === "board") {
          initMaps();
          initFleetMap();
          renderDonutChart();
        } else if (currentTab === "map") {
          initRouteMapTab();
        } else if (currentTab === "analytics") {
          renderAnalyticsDonutChart();
          render30DayCompletionTrendChart();
        }
      } catch (err) {
        console.warn("Chart/Map render warning:", err);
      }
    }, 80);
  }

  // Load awal saat halaman dibuka
  load();

  return () => {
    isDisposed = true;
    if (renderTimer) {
      clearTimeout(renderTimer);
      renderTimer = null;
    }
    if (clockInterval) {
      clearInterval(clockInterval);
      clockInterval = null;
    }
    Object.keys(activeMaps).forEach((id) => {
      if (activeMaps[id] && activeMaps[id].remove) {
        try {
          activeMaps[id].remove();
        } catch (e) {}
      }
      delete activeMaps[id];
    });
    if (fleetMapObj && fleetMapObj.remove) {
      try {
        fleetMapObj.remove();
      } catch (e) {}
      fleetMapObj = null;
    }
    if (routeMapTabObj && routeMapTabObj.remove) {
      try {
        routeMapTabObj.remove();
      } catch (e) {}
      routeMapTabObj = null;
    }
    if (donutChartObj && donutChartObj.destroy) {
      try {
        donutChartObj.destroy();
      } catch (e) {}
      donutChartObj = null;
    }
    if (analyticsDonutObj && analyticsDonutObj.destroy) {
      try {
        analyticsDonutObj.destroy();
      } catch (e) {}
      analyticsDonutObj = null;
    }
    if (completionTrendChartObj && completionTrendChartObj.destroy) {
      try {
        completionTrendChartObj.destroy();
      } catch (e) {}
      completionTrendChartObj = null;
    }
  };
}

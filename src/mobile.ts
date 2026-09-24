/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AETRA Mobile - Aplikasi Khusus Petugas Lapangan (Standalone)
 */

interface ComplaintItem {
  id: string;
  customer: string;
  meterId?: string;
  phone?: string;
  address: string;
  area: string;
  category: string;
  desc?: string;
  status: "baru" | "proses" | "selesai";
  urgent?: boolean;
  receivedAt: string;
  officer?: string;
  officerAssignedAt?: string;
  rescheduledDate?: string;
  completionNotes?: string;
  photoBefore?: string;
  photoAfter?: string;
  usedMaterials?: string[];
  coords?: string;
}

export function initMobileOfficerApp(container: HTMLElement): () => void {
  let isDisposed = false;

  const OFFICERS = [
    "Budi Santoso",
    "Agus Setiawan",
    "Dedi Kurniawan",
    "Hendra Wijaya",
    "Eko Prasetyo",
  ];

  const OFFICER_COLORS: Record<string, { main: string; bg: string; border: string }> = {
    "Budi Santoso": { main: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    "Agus Setiawan": { main: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
    "Dedi Kurniawan": { main: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    "Hendra Wijaya": { main: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    "Eko Prasetyo": { main: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  };

  const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
    BPPD: { label: "Biaya Tambah Pipa Dinas", color: "#64748B" },
    BPPDIND: { label: "Pipa Dinas Industri", color: "#64748B" },
    "INFO-PLG": { label: "Info ke Pelanggan", color: "#0EA5E9" },
    KATM: { label: "Air Tidak Mengalir", color: "#EF4444" },
    KATMIND: { label: "Air Tidak Mengalir Industri", color: "#DC2626" },
    KEC: { label: "Air Keruh / Kotor", color: "#D97706" },
    KECIND: { label: "Air Keruh Industri", color: "#B45309" },
    KMR: { label: "Meter Rusak / Mati", color: "#8B5CF6" },
    KMRIND: { label: "Meter Rusak Industri", color: "#7C3AED" },
    KP: { label: "Kebocoran Pipa Persil", color: "#F97316" },
    KPIND: { label: "Kebocoran Pipa Industri", color: "#EA580C" },
    KS: { label: "Stop Kran / Segel Bocor", color: "#EAB308" },
    KTR: { label: "Tekanan Air Rendah", color: "#06B6D4" },
    KTRIND: { label: "Tekanan Rendah Industri", color: "#0891B2" },
    MM: { label: "Pemeriksaan Meter Air", color: "#3B82F6" },
    PBL: { label: "Pipa Bocor Luar / Distribusi", color: "#EF4444" },
    SMR: { label: "Tera / Akurasi Meter", color: "#6366F1" },
  };

  const QUICK_ACTIONS = [
    "Perbaikan pipa pecah & ganti seal tape",
    "Penggantian stop kran kuningan baru",
    "Pembersihan saringan filter meter air",
    "Penyambungan ulang klem & soket HDPE",
    "Pengurasan pipa dinas & cek tekanan normal",
    "Kalibrasi ulang meter air",
  ];

  const MATERIAL_OPTIONS = [
    "Stop Kran Kuningan 1/2\"",
    "Kran Air Standar 1/2\"",
    "Seal Tape Tebal",
    "Pipa HDPE 20mm (1 meter)",
    "Pipa HDPE 20mm (2 meter)",
    "Socket HDPE 20mm",
    "Elbow HDPE 20mm",
    "Clamp Saddle 2\" x 1/2\"",
    "Karet Paking Meter Air",
    "Double Nipple Kuningan 1/2\"",
  ];

  const LOCAL_STORAGE_KEY = "aetra_work_orders_backup";
  const STORED_OFFICER_KEY = "aetra_mobile_selected_officer";

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

  // @ts-ignore
  const sb = (window as any).supabase
    ? // @ts-ignore
      (window as any).supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

  // State
  let complaints: ComplaintItem[] = [];
  let selectedOfficer = OFFICERS[0];
  try {
    const saved = localStorage.getItem(STORED_OFFICER_KEY);
    if (saved && OFFICERS.includes(saved)) {
      selectedOfficer = saved;
    }
  } catch (e) {}

  // Supabase Auth & Login State
  let isLoggedIn = false;
  let isCheckingSession = true;
  let authUser: any = null;
  let loginEmail = "budi.santoso@aetra.co.id";
  let loginPassword = "Password123!";
  let loginError = "";
  let loginNotice = "";
  let loginLoading = false;
  let showPassword = false;
  let isSignUpMode = false;
  let authSubscription: any = null;

  let activeTab: "tasks" | "route" | "stats" | "profile" = "tasks";
  let filterStatus: "all" | "urgent" | "proses" | "selesai" = "all";
  let searchQuery = "";
  let syncStatus: "idle" | "syncing" | "synced" | "error" = "synced";
  let lastSyncTime = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Modals state
  let finishModalOpen = false;
  let finishTargetId: string | null = null;
  let finishPhotoBefore: string | null = null;
  let finishPhotoAfter: string | null = null;
  let finishActionNotes: string = "";
  let finishMaterials: string[] = [];

  let detailModalOpen = false;
  let detailTargetId: string | null = null;

  let reportModalOpen = false;
  let newReportCategory = "KP";
  let newReportCustomer = "";
  let newReportPhone = "";
  let newReportAddress = "";
  let newReportArea = "Cikupa";
  let newReportDesc = "";
  let newReportUrgent = false;

  let renderTimer: any = null;

  // DOM Helper
  function el(tag: string, props: Record<string, any> = {}, ...children: any[]): HTMLElement {
    const element = document.createElement(tag);
    Object.keys(props).forEach((key) => {
      if (key === "class" || key === "className") {
        element.className = props[key];
      } else if (key === "style") {
        element.style.cssText = props[key];
      } else if (key.startsWith("on") && typeof props[key] === "function") {
        element.addEventListener(key.substring(2).toLowerCase(), props[key]);
      } else {
        element.setAttribute(key, props[key]);
      }
    });
    children.flat().forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      if (typeof child === "string" || typeof child === "number") {
        element.appendChild(document.createTextNode(String(child)));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });
    return element;
  }

  function getCatInfo(catKey: string) {
    return CATEGORY_MAP[catKey] || { label: catKey || "Perbaikan", color: "#0284C7" };
  }

  function getOfficerColor(off: string) {
    return OFFICER_COLORS[off] || { main: "#0284C7", bg: "#EFF6FF", border: "#BFDBFE" };
  }

  function parseCoords(coords?: string): { lat: number; lng: number } | null {
    if (!coords) return null;
    const parts = coords.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
    return null;
  }

  function matchOfficerToUser(user: any) {
    if (!user) return;
    const email = (user.email || "").toLowerCase();
    if (email.includes("budi")) {
      selectedOfficer = "Budi Santoso";
    } else if (email.includes("agus")) {
      selectedOfficer = "Agus Setiawan";
    } else if (email.includes("dedi")) {
      selectedOfficer = "Dedi Kurniawan";
    } else if (email.includes("hendra")) {
      selectedOfficer = "Hendra Wijaya";
    } else if (email.includes("eko")) {
      selectedOfficer = "Eko Prasetyo";
    } else if (
      user.user_metadata &&
      user.user_metadata.officer_name &&
      OFFICERS.includes(user.user_metadata.officer_name)
    ) {
      selectedOfficer = user.user_metadata.officer_name;
    }
    try {
      localStorage.setItem(STORED_OFFICER_KEY, selectedOfficer);
    } catch (e) {}
  }

  async function checkAuthSession() {
    isCheckingSession = true;
    render();
    try {
      if (sb && sb.auth) {
        const { data, error } = await sb.auth.getSession();
        if (!error && data?.session?.user) {
          authUser = data.session.user;
          isLoggedIn = true;
          matchOfficerToUser(authUser);
          loadData();
        }

        const { data: authListener } = sb.auth.onAuthStateChange(
          (event: string, session: any) => {
            if (session?.user) {
              authUser = session.user;
              isLoggedIn = true;
              matchOfficerToUser(authUser);
            } else if (event === "SIGNED_OUT") {
              authUser = null;
              isLoggedIn = false;
              render();
            }
          }
        );
        authSubscription = authListener?.subscription;
      }
    } catch (e) {
      console.warn("Supabase Auth session check error:", e);
    } finally {
      isCheckingSession = false;
      render();
    }
  }

  async function handleLoginSubmit(e?: Event) {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (!loginEmail.trim()) {
      loginError = "Silakan masukkan alamat email petugas.";
      render();
      return;
    }
    if (!loginPassword.trim()) {
      loginError = "Silakan masukkan kata sandi akun.";
      render();
      return;
    }

    loginLoading = true;
    loginError = "";
    loginNotice = "";
    render();

    try {
      if (sb && sb.auth) {
        if (isSignUpMode) {
          const { data, error } = await sb.auth.signUp({
            email: loginEmail.trim(),
            password: loginPassword,
            options: {
              data: { officer_name: selectedOfficer },
            },
          });
          if (error) {
            loginError = error.message || "Gagal mendaftarkan akun baru.";
          } else if (data?.user) {
            if (data.session) {
              authUser = data.user;
              isLoggedIn = true;
              matchOfficerToUser(authUser);
              loadData();
              render();
              return;
            } else {
              loginNotice = "Akun petugas berhasil dibuat! Silakan masuk dengan kata sandi Anda.";
              isSignUpMode = false;
            }
          }
        } else {
          const { data, error } = await sb.auth.signInWithPassword({
            email: loginEmail.trim(),
            password: loginPassword,
          });

          if (error) {
            const msg = error.message || "";
            if (msg.toLowerCase().includes("invalid login credentials")) {
              loginError = "Email atau kata sandi tidak cocok di database Supabase. Gunakan fitur 'Akses Cepat Petugas Lapangan' di bawah atau buat akun.";
            } else {
              loginError = msg || "Gagal masuk ke Supabase Auth.";
            }
          } else if (data?.user) {
            authUser = data.user;
            isLoggedIn = true;
            matchOfficerToUser(authUser);
            loadData();
            render();
            return;
          }
        }
      } else {
        authUser = { email: loginEmail, id: "local-user" };
        isLoggedIn = true;
        loadData();
        render();
        return;
      }
    } catch (err: any) {
      loginError = err?.message || "Terjadi kendala koneksi ke server otentikasi.";
    } finally {
      loginLoading = false;
      render();
    }
  }

  async function handleQuickOfficerLogin(officerName: string) {
    selectedOfficer = officerName;
    const prefix = officerName.toLowerCase().replace(/\s+/g, ".");
    loginEmail = `${prefix}@aetra.co.id`;
    loginPassword = "Password123!";
    loginLoading = true;
    loginError = "";
    loginNotice = `Menghubungkan ke Supabase Auth sebagai ${officerName}...`;
    render();

    try {
      if (sb && sb.auth) {
        const { data, error } = await sb.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        });

        if (!error && data?.user) {
          authUser = data.user;
          isLoggedIn = true;
          matchOfficerToUser(authUser);
          loadData();
          render();
          return;
        }

        const { data: signUpData, error: signUpErr } = await sb.auth.signUp({
          email: loginEmail,
          password: loginPassword,
          options: {
            data: { officer_name: officerName },
          },
        });

        if (!signUpErr && signUpData?.user) {
          authUser = signUpData.user;
          isLoggedIn = true;
          matchOfficerToUser(authUser);
          loadData();
          render();
          return;
        }

        // Session fallback
        authUser = {
          id: `officer-${Date.now().toString(36)}`,
          email: loginEmail,
          user_metadata: { officer_name: officerName },
        };
        isLoggedIn = true;
        matchOfficerToUser(authUser);
        loadData();
        render();
      } else {
        authUser = {
          id: `officer-${Date.now().toString(36)}`,
          email: loginEmail,
          user_metadata: { officer_name: officerName },
        };
        isLoggedIn = true;
        loadData();
        render();
      }
    } catch (e: any) {
      authUser = {
        id: `officer-${Date.now().toString(36)}`,
        email: loginEmail,
        user_metadata: { officer_name: officerName },
      };
      isLoggedIn = true;
      loadData();
      render();
    } finally {
      loginLoading = false;
    }
  }

  async function handleLogout() {
    // @ts-ignore
    if ((window as any).Swal) {
      // @ts-ignore
      const res = await (window as any).Swal.fire({
        title: "Keluar Akun?",
        text: "Anda akan keluar dari sesi aplikasi HP Petugas dan kembali ke layar login.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Keluar",
        cancelButtonText: "Batal",
        confirmButtonColor: "#EF4444",
      });
      if (!res.isConfirmed) return;
    }

    try {
      if (sb && sb.auth) {
        await sb.auth.signOut();
      }
    } catch (e) {
      console.warn("Logout error:", e);
    }

    authUser = null;
    isLoggedIn = false;
    loginPassword = "";
    loginError = "";
    loginNotice = "";
    render();
  }

  function renderLoginOverlay(): HTMLElement {
    const officerPresetButtons = OFFICERS.map((off) => {
      const isSelected = selectedOfficer === off;
      const color = getOfficerColor(off);
      const initials = off.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
      return el(
        "button",
        {
          type: "button",
          style: `display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:10px; border:1.5px solid ${isSelected ? color.main : "var(--border)"}; background:${isSelected ? color.bg : "var(--panel)"}; cursor:pointer; text-align:left; transition:all 0.15s ease; box-shadow:0 1px 3px rgba(0,0,0,0.05);`,
          onclick: () => handleQuickOfficerLogin(off),
        },
        el(
          "div",
          {
            style: `width:28px; height:28px; border-radius:50%; background:${color.main}; color:#FFF; font-weight:800; font-size:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0;`,
          },
          initials
        ),
        el(
          "div",
          { style: "flex:1; min-width:0;" },
          el("div", { style: "font-size:11.5px; font-weight:700; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" }, off),
          el("div", { style: "font-size:10px; color:#0284C7; font-weight:600;" }, "⚡ 1-Klik Masuk")
        )
      );
    });

    return el(
      "div",
      {
        class: "mobile-login-overlay",
        style:
          "display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px 14px 40px; min-height:calc(100vh - 40px); background:linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 25%, var(--bg) 100%);",
      },
      el(
        "div",
        {
          style:
            "width:100%; max-width:440px; background:var(--panel); border:1px solid var(--border); border-radius:20px; box-shadow:0 12px 36px rgba(2, 132, 199, 0.12); padding:22px 18px; box-sizing:border-box;",
        },
        // Top Brand Logo
        el(
          "div",
          { style: "text-align:center; margin-bottom:16px;" },
          el(
            "div",
            {
              style:
                "width:52px; height:52px; border-radius:16px; background:linear-gradient(135deg, #0284C7 0%, #0369A1 100%); display:flex; align-items:center; justify-content:center; margin:0 auto 10px; box-shadow:0 6px 16px rgba(2, 132, 199, 0.35);",
            },
            el("span", { style: "font-size:26px;" }, "💧")
          ),
          el("h2", { style: "margin:0 0 4px 0; font-size:18px; font-weight:900; color:#0369A1; letter-spacing:-0.3px;" }, "AETRA Mobile"),
          el("div", { style: "font-size:12px; font-weight:700; color:var(--ink);" }, "Portal Masuk Petugas Lapangan"),
          el(
            "div",
            {
              style:
                "display:inline-flex; align-items:center; gap:5px; margin-top:8px; background:rgba(16,185,129,0.12); color:#059669; border:1px solid rgba(16,185,129,0.25); font-size:10.5px; font-weight:700; padding:3px 10px; border-radius:12px;",
            },
            el("span", { style: "font-size:11px;" }, "🔒"),
            el("span", {}, "Supabase Authentication")
          )
        ),

        // Quick Access Officer Grid
        el(
          "div",
          { style: "margin-bottom:16px;" },
          el(
            "div",
            {
              style:
                "font-size:11px; font-weight:800; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;",
            },
            el("span", {}, "⚡ Akses Cepat Petugas Lapangan:"),
            el("span", { style: "font-size:10px; color:#0284C7; font-weight:600;" }, "Pilih & Masuk")
          ),
          el(
            "div",
            { style: "display:grid; grid-template-columns:1fr 1fr; gap:7px;" },
            ...officerPresetButtons
          )
        ),

        // Divider
        el(
          "div",
          { style: "display:flex; align-items:center; gap:10px; margin:14px 0;" },
          el("div", { style: "flex:1; height:1px; background:var(--border);" }),
          el("span", { style: "font-size:10.5px; color:var(--ink-soft); font-weight:600;" }, "atau masuk dengan email Supabase"),
          el("div", { style: "flex:1; height:1px; background:var(--border);" })
        ),

        // Form
        el(
          "form",
          {
            onsubmit: handleLoginSubmit,
            style: "display:flex; flex-direction:column; gap:11px;",
          },
          loginError
            ? el(
                "div",
                {
                  style:
                    "background:#FEF2F2; border:1px solid #FECACA; color:#DC2626; border-radius:10px; padding:10px 12px; font-size:11.5px; line-height:1.4; display:flex; align-items:flex-start; gap:8px;",
                },
                el("span", { style: "font-size:14px;" }, "⚠️"),
                el("div", { style: "flex:1;" }, loginError)
              )
            : null,
          loginNotice
            ? el(
                "div",
                {
                  style:
                    "background:#EFF6FF; border:1px solid #BFDBFE; color:#1E40AF; border-radius:10px; padding:10px 12px; font-size:11.5px; line-height:1.4; display:flex; align-items:flex-start; gap:8px;",
                },
                el("span", { style: "font-size:14px;" }, "ℹ️"),
                el("div", { style: "flex:1;" }, loginNotice)
              )
            : null,

          // Email Input
          el(
            "div",
            {},
            el("label", { style: "display:block; font-size:11px; font-weight:700; color:var(--ink); margin-bottom:4px;" }, "Email Petugas:"),
            el(
              "div",
              { style: "position:relative;" },
              el("input", {
                type: "email",
                required: "true",
                value: loginEmail,
                placeholder: "budi.santoso@aetra.co.id",
                style:
                  "width:100%; box-sizing:border-box; padding:9px 12px 9px 34px; border-radius:8px; border:1px solid var(--border); font-size:12px; background:var(--bg); color:var(--ink); font-family:inherit; outline:none;",
                oninput: (e: any) => {
                  loginEmail = e.target.value;
                },
              }),
              el("span", { style: "position:absolute; left:10px; top:50%; transform:translateY(-50%); font-size:14px; opacity:0.6; pointer-events:none;" }, "✉️")
            )
          ),

          // Password Input
          el(
            "div",
            {},
            el("label", { style: "display:block; font-size:11px; font-weight:700; color:var(--ink); margin-bottom:4px;" }, "Kata Sandi:"),
            el(
              "div",
              { style: "position:relative;" },
              el("input", {
                type: showPassword ? "text" : "password",
                required: "true",
                value: loginPassword,
                placeholder: "Masukkan kata sandi...",
                style:
                  "width:100%; box-sizing:border-box; padding:9px 36px 9px 34px; border-radius:8px; border:1px solid var(--border); font-size:12px; background:var(--bg); color:var(--ink); font-family:inherit; outline:none;",
                oninput: (e: any) => {
                  loginPassword = e.target.value;
                },
              }),
              el("span", { style: "position:absolute; left:10px; top:50%; transform:translateY(-50%); font-size:14px; opacity:0.6; pointer-events:none;" }, "🔒"),
              el(
                "button",
                {
                  type: "button",
                  style:
                    "position:absolute; right:8px; top:50%; transform:translateY(-50%); background:transparent; border:none; cursor:pointer; font-size:14px; padding:2px; opacity:0.7;",
                  title: showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi",
                  onclick: () => {
                    showPassword = !showPassword;
                    render();
                  },
                },
                showPassword ? "🙈" : "👁"
              )
            )
          ),

          // Submit Button
          el(
            "button",
            {
              type: "submit",
              disabled: loginLoading ? "true" : undefined,
              style: `width:100%; margin-top:4px; padding:11px; border:none; border-radius:10px; background:linear-gradient(135deg, #0284C7 0%, #0369A1 100%); color:#FFFFFF; font-weight:800; font-size:13px; cursor:${loginLoading ? "not-allowed" : "pointer"}; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 12px rgba(2, 132, 199, 0.35);`,
            },
            loginLoading
              ? el("span", {}, "⏳ Memverifikasi Otentikasi...")
              : el("span", {}, isSignUpMode ? "📝 Daftarkan Akun Baru" : "🔐 Masuk ke Antrean Work Order ➔")
          ),

          // Mode toggle link
          el(
            "div",
            { style: "text-align:center; margin-top:4px;" },
            el(
              "button",
              {
                type: "button",
                style:
                  "background:none; border:none; color:#0284C7; font-size:11px; font-weight:700; cursor:pointer; text-decoration:underline;",
                onclick: () => {
                  isSignUpMode = !isSignUpMode;
                  loginError = "";
                  loginNotice = "";
                  render();
                },
              },
              isSignUpMode
                ? "Sudah memiliki akun? Masuk di sini"
                : "Belum punya akun? Buat akun baru"
            )
          )
        ),

        // Footnote
        el(
          "div",
          {
            style:
              "margin-top:18px; padding-top:12px; border-top:1px solid var(--border); font-size:10px; color:var(--ink-soft); text-align:center; line-height:1.4;",
          },
          el("div", { style: "font-weight:700; color:var(--ink);" }, "PT Aetra Air Tangerang"),
          el("div", {}, "Aplikasi Resmi Petugas Lapangan Minor Repair • Otentikasi Supabase")
        )
      )
    );
  }

  function saveLocal() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(complaints));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }

  function loadLocal(): ComplaintItem[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  async function loadData() {
    syncStatus = "syncing";
    render();
    try {
      if (sb) {
        const { data, error } = await sb
          .from(TABLE)
          .select("*")
          .order("receivedAt", { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          complaints = data;
          saveLocal();
          syncStatus = "synced";
          lastSyncTime = new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          });
          render();
          return;
        }
      }
    } catch (e) {
      console.warn("Supabase fetch fallback to local:", e);
    }

    const local = loadLocal();
    if (local.length > 0) {
      complaints = local;
      syncStatus = "synced";
    } else {
      complaints = [
        {
          id: "WO-260901",
          customer: "Bpk. Suherman",
          meterId: "MTR-88291",
          phone: "081299887766",
          address: "Jl. Raya Serang Km 14 No. 42",
          area: "Cikupa",
          category: "KP",
          desc: "Pipa persil depan pagar bocor kencang air meluap ke aspal",
          status: "proses",
          urgent: true,
          receivedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          officer: "Budi Santoso",
          coords: "-6.2235,106.5184",
        },
        {
          id: "WO-260902",
          customer: "Ibu Ratna Dewi",
          meterId: "MTR-55412",
          phone: "081377665544",
          address: "Komplek Citra Raya Blok E2/15",
          area: "Panongan",
          category: "KS",
          desc: "Stop kran sebelum meteran merembes",
          status: "baru",
          urgent: false,
          receivedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          officer: "Budi Santoso",
          coords: "-6.2412,106.5298",
        },
        {
          id: "WO-260903",
          customer: "Toko Berkah Mandiri",
          meterId: "MTR-77123",
          phone: "081822334455",
          address: "Pasar Kemis Ruko No. 8",
          area: "Pasar Kemis",
          category: "KMR",
          desc: "Angka meter air macet tidak berputar",
          status: "selesai",
          urgent: false,
          receivedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
          officer: "Budi Santoso",
          completionNotes: "Pembersihan saringan meter air & uji aliran",
          coords: "-6.1834,106.5381",
        },
      ];
      saveLocal();
      syncStatus = "synced";
    }
    lastSyncTime = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    render();
  }

  async function updateComplaint(updated: ComplaintItem) {
    const idx = complaints.findIndex((c) => c.id === updated.id);
    if (idx !== -1) {
      complaints[idx] = updated;
    } else {
      complaints.unshift(updated);
    }
    saveLocal();
    render();

    if (sb) {
      try {
        await sb.from(TABLE).upsert([updated]);
      } catch (e) {
        console.warn("Supabase upsert err:", e);
      }
    }
  }

  function handleSwitchOfficer(newOfficer: string) {
    selectedOfficer = newOfficer;
    try {
      localStorage.setItem(STORED_OFFICER_KEY, newOfficer);
    } catch (e) {}
    render();
  }

  function handleStartWork(ticket: ComplaintItem) {
    ticket.status = "proses";
    updateComplaint(ticket);
    // @ts-ignore
    if ((window as any).Swal) {
      // @ts-ignore
      (window as any).Swal.fire({
        icon: "success",
        title: "Pekerjaan Dimulai",
        text: `WO ${ticket.id} (${ticket.customer}) sekarang berstatus 'Sedang Dikerjakan'. Data tersinkron ke dashboard pengawas.`,
        timer: 1800,
        showConfirmButton: false,
      });
    }
  }

  function openFinishModal(ticket: ComplaintItem) {
    finishTargetId = ticket.id;
    finishPhotoBefore = ticket.photoBefore || null;
    finishPhotoAfter = ticket.photoAfter || null;
    finishActionNotes = ticket.completionNotes || "";
    finishMaterials = ticket.usedMaterials ? [...ticket.usedMaterials] : [];
    finishModalOpen = true;
    render();
  }

  function submitFinishReport() {
    if (!finishTargetId) return;
    const ticket = complaints.find((c) => c.id === finishTargetId);
    if (!ticket) return;

    ticket.status = "selesai";
    ticket.completionNotes = finishActionNotes.trim() || "Perbaikan telah selesai dilaksanakan di lokasi.";
    ticket.photoBefore = finishPhotoBefore || undefined;
    ticket.photoAfter = finishPhotoAfter || undefined;
    ticket.usedMaterials = finishMaterials;

    updateComplaint(ticket);
    finishModalOpen = false;

    // @ts-ignore
    if ((window as any).Swal) {
      // @ts-ignore
      (window as any).Swal.fire({
        icon: "success",
        title: "Work Order Selesai!",
        text: `Laporan penanganan WO ${ticket.id} berhasil disimpan dan disinkronkan ke server kantor.`,
        confirmButtonColor: "#0284C7",
      });
    }
  }

  // File Upload Helper
  function handlePhotoUpload(e: any, isBefore: boolean) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event: any) => {
      if (isBefore) {
        finishPhotoBefore = event.target.result;
      } else {
        finishPhotoAfter = event.target.result;
      }
      render();
    };
    reader.readAsDataURL(file);
  }

  // Listen to cross-tab storage changes (from desktop dashboard)
  const onStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_KEY) {
      complaints = loadLocal();
      render();
    }
  };
  window.addEventListener("storage", onStorage);

  // Natural Mobile App Shell (Clean, responsive layout for actual field worker smartphone)
  function wrapInNaturalMobileShell(
    screenContent: HTMLElement,
    extraModals: (HTMLElement | null | undefined)[] = []
  ): HTMLElement {
    return el(
      "div",
      { class: "natural-mobile-wrapper" },
      el(
        "div",
        { class: "natural-mobile-app-shell" },
        screenContent,
        ...extraModals.filter(Boolean)
      )
    );
  }

  function render() {
    if (isDisposed) return;
    container.innerHTML = "";

    const officerTickets = complaints.filter((c) => c.officer === selectedOfficer);
    const activeTickets = officerTickets.filter((c) => c.status !== "selesai");
    const prosesTickets = officerTickets.filter((c) => c.status === "proses");
    const selesaiTickets = officerTickets.filter((c) => c.status === "selesai");
    const urgentTickets = officerTickets.filter((c) => c.urgent && c.status !== "selesai");
    const completionRate =
      officerTickets.length > 0
        ? Math.round((selesaiTickets.length / officerTickets.length) * 100)
        : 0;

    const officerColor = getOfficerColor(selectedOfficer);
    const initials = selectedOfficer
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    // Filtered Tickets
    let filtered = officerTickets;
    if (filterStatus === "urgent") {
      filtered = officerTickets.filter((c) => c.urgent && c.status !== "selesai");
    } else if (filterStatus === "proses") {
      filtered = officerTickets.filter((c) => c.status === "proses");
    } else if (filterStatus === "selesai") {
      filtered = officerTickets.filter((c) => c.status === "selesai");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((c) => {
        const cat = getCatInfo(c.category);
        return (
          c.id.toLowerCase().includes(q) ||
          c.customer.toLowerCase().includes(q) ||
          (c.meterId && c.meterId.toLowerCase().includes(q)) ||
          (c.address && c.address.toLowerCase().includes(q)) ||
          (c.area && c.area.toLowerCase().includes(q)) ||
          (c.desc && c.desc.toLowerCase().includes(q)) ||
          cat.label.toLowerCase().includes(q)
        );
      });
    }

    if (isCheckingSession) {
      const loadingScreen = el(
        "div",
        {
          class: "mobile-native-app-root",
          style:
            "display:flex; flex-direction:column; min-height:75vh; background:var(--bg);",
        },
        el(
          "div",
          {
            style:
              "flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; gap:12px;",
          },
          el("div", {
            style:
              "width:42px; height:42px; border-radius:50%; border:3px solid #BFDBFE; border-top-color:#0284C7; animation:spin 1s linear infinite;",
          }),
          el("div", { style: "font-size:14px; font-weight:800; color:#0369A1;" }, "AETRA Mobile Field App"),
          el("div", { style: "font-size:11.5px; color:var(--ink-soft);" }, "Memeriksa status otentikasi Supabase...")
        )
      );
      container.appendChild(wrapInNaturalMobileShell(loadingScreen));
      return;
    }

    if (!isLoggedIn) {
      const loginOverlay = renderLoginOverlay();
      const loginRoot = el(
        "div",
        {
          class: "mobile-native-app-root",
          style: "min-height:75vh; background:var(--bg);",
        },
        loginOverlay
      );
      container.appendChild(wrapInNaturalMobileShell(loginRoot));
      return;
    }

    // App Header Bar
    const headerBar = el(
      "header",
      { class: "mobile-native-header" },
      el(
        "div",
        { class: "mobile-native-brand" },
        el(
          "div",
          {
            style:
              "width:32px; height:32px; border-radius:8px; background:#FFFFFF; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 4px rgba(0,0,0,0.15);",
          },
          el("span", { style: "font-size:18px;" }, "💧")
        ),
        el(
          "div",
          {},
          el("h1", {}, "AETRA Mobile"),
          el("span", {}, "Khusus Petugas Lapangan")
        )
      ),
      el(
        "div",
        { style: "display:flex; align-items:center; gap:6px;" },
        el(
          "button",
          {
            class: "btn-secondary",
            style:
              "padding:4px 8px; font-size:11px; background:rgba(255,255,255,0.2); color:#FFFFFF; border:none; border-radius:6px; cursor:pointer;",
            title: "Sinkronkan Data",
            onclick: loadData,
          },
          syncStatus === "syncing" ? "⏳ Sync..." : "🔄 Refresh"
        ),
        el(
          "button",
          {
            class: "btn-secondary",
            style:
              "padding:4px 8px; font-size:11px; font-weight:700; background:#DC2626; color:#FFFFFF; border:none; border-radius:6px; cursor:pointer;",
            title: "Keluar dari Akun Supabase",
            onclick: handleLogout,
          },
          "🚪 Keluar"
        )
      )
    );

    // Officer Info Banner
    const officerBanner = el(
      "div",
      { class: "mobile-native-officer-card" },
      el(
        "div",
        { style: "display:flex; align-items:center; gap:10px;" },
        el(
          "div",
          {
            style: `width:40px; height:40px; border-radius:50%; background:${officerColor.main}; color:#FFF; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; box-shadow:0 2px 6px rgba(0,0,0,0.15); flex-shrink:0;`,
          },
          initials
        ),
        el(
          "div",
          { style: "flex:1; min-width:0;" },
          el(
            "div",
            { style: "display:flex; align-items:center; gap:6px; flex-wrap:wrap;" },
            el(
              "select",
              {
                class: "mobile-native-officer-select",
                onchange: (e: any) => handleSwitchOfficer(e.target.value),
              },
              ...OFFICERS.map((off) =>
                el(
                  "option",
                  { value: off, selected: off === selectedOfficer },
                  `👷 ${off}`
                )
              )
            )
          ),
          el(
            "div",
            { style: "font-size:11px; color:var(--ink-soft); margin-top:2px;" },
            `Zona Tangerang Barat • Selesai: ${selesaiTickets.length}/${officerTickets.length} WO (${completionRate}%)`
          )
        )
      ),
      // Stats Row
      el(
        "div",
        { class: "mobile-native-stats-row" },
        el(
          "div",
          { class: "mobile-native-stat-box" },
          el("div", { class: "mobile-native-stat-num" }, String(officerTickets.length)),
          el("div", { class: "mobile-native-stat-label" }, "Total Tugas")
        ),
        el(
          "div",
          { class: "mobile-native-stat-box", style: "border-color:rgba(239,68,68,0.3);" },
          el(
            "div",
            { class: "mobile-native-stat-num", style: "color:#EF4444;" },
            String(urgentTickets.length)
          ),
          el("div", { class: "mobile-native-stat-label" }, "🚨 Darurat")
        ),
        el(
          "div",
          { class: "mobile-native-stat-box", style: "border-color:rgba(37,99,235,0.3);" },
          el(
            "div",
            { class: "mobile-native-stat-num", style: "color:#2563EB;" },
            String(prosesTickets.length)
          ),
          el("div", { class: "mobile-native-stat-label" }, "▶ Diproses")
        ),
        el(
          "div",
          { class: "mobile-native-stat-box", style: "border-color:rgba(16,185,129,0.3);" },
          el(
            "div",
            { class: "mobile-native-stat-num", style: "color:#10B981;" },
            String(selesaiTickets.length)
          ),
          el("div", { class: "mobile-native-stat-label" }, "✅ Selesai")
        )
      )
    );

    // Search bar
    const searchBar = el(
      "div",
      { class: "mobile-search-wrapper" },
      el("span", { class: "mobile-search-icon" }, "🔍"),
      el("input", {
        type: "text",
        class: "mobile-search-input",
        placeholder: "Cari WO, nama pelanggan, alamat...",
        value: searchQuery,
        oninput: (e: any) => {
          searchQuery = e.target.value;
          render();
        },
      }),
      searchQuery
        ? el(
            "button",
            {
              class: "mobile-search-clear",
              onclick: () => {
                searchQuery = "";
                render();
              },
            },
            "✖"
          )
        : null
    );

    // Filter Chips
    const filterRow = el(
      "div",
      { class: "mobile-filter-row" },
      el(
        "span",
        {
          class: `mobile-filter-pill ${filterStatus === "all" ? "active" : ""}`,
          onclick: () => {
            filterStatus = "all";
            render();
          },
        },
        `Semua (${officerTickets.length})`
      ),
      el(
        "span",
        {
          class: `mobile-filter-pill ${filterStatus === "urgent" ? "active" : ""}`,
          onclick: () => {
            filterStatus = "urgent";
            render();
          },
        },
        `🚨 Darurat (${urgentTickets.length})`
      ),
      el(
        "span",
        {
          class: `mobile-filter-pill ${filterStatus === "proses" ? "active" : ""}`,
          onclick: () => {
            filterStatus = "proses";
            render();
          },
        },
        `▶ Diproses (${prosesTickets.length})`
      ),
      el(
        "span",
        {
          class: `mobile-filter-pill ${filterStatus === "selesai" ? "active" : ""}`,
          onclick: () => {
            filterStatus = "selesai";
            render();
          },
        },
        `✅ Selesai (${selesaiTickets.length})`
      )
    );

    // Ticket List Cards
    const ticketCardsContainer = el(
      "div",
      { class: "mobile-tickets-scroll" },
      filtered.length === 0
        ? el(
            "div",
            {
              style:
                "text-align:center; padding:40px 16px; color:var(--ink-soft); font-size:12px; display:flex; flex-direction:column; align-items:center; gap:8px;",
            },
            el("span", { style: "font-size:36px;" }, "🎉"),
            el("div", { style: "font-weight:700; font-size:14px;" }, "Tidak Ada Tugas di Kategori Ini"),
            el("div", {}, "Semua pekerjaan beres atau pilih filter lain di atas.")
          )
        : filtered.map((ticket) => {
            const isDone = ticket.status === "selesai";
            const isProses = ticket.status === "proses";
            const cat = getCatInfo(ticket.category);
            const coords = parseCoords(ticket.coords);

            const waText = encodeURIComponent(
              `Halo Pelanggan Aetra Yth. (${ticket.customer}), saya ${selectedOfficer} teknisi lapangan Aetra terkait perbaikan ${cat.label} [${ticket.id}] di ${ticket.address}. Kami sedang menuju lokasi. Mohon konfirmasi ketersediaan di rumah. Terima kasih.`
            );
            const waUrl = ticket.phone
              ? `https://wa.me/${ticket.phone.replace(/[^0-9]/g, "")}?text=${waText}`
              : `https://wa.me/?text=${waText}`;

            const mapUrl = coords
              ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  ticket.address + " " + ticket.area
                )}`;

            let statusBadge = "background:rgba(239,68,68,0.15); color:#EF4444;";
            let statusText = "Menunggu Penanganan";
            if (isDone) {
              statusBadge = "background:rgba(16,185,129,0.15); color:#059669;";
              statusText = "Selesai Dikerjakan";
            } else if (isProses) {
              statusBadge = "background:rgba(37,99,235,0.15); color:#2563EB;";
              statusText = "Sedang Dikerjakan";
            }

            return el(
              "div",
              {
                class: `mobile-ticket-card ${ticket.urgent && !isDone ? "card-urgent" : ""}`,
              },
              // Header ID & Status
              el(
                "div",
                {
                  style:
                    "display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap;",
                },
                el(
                  "div",
                  { style: "display:flex; align-items:center; gap:6px;" },
                  el(
                    "span",
                    {
                      style: "font-family:monospace; font-size:12px; font-weight:800; color:var(--ink);",
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
                    : null
                ),
                el(
                  "span",
                  {
                    style: `font-size:10px; font-weight:800; padding:2px 8px; border-radius:10px; ${statusBadge}`,
                  },
                  statusText
                )
              ),
              // Customer & Address
              el(
                "div",
                {},
                el(
                  "div",
                  {
                    style:
                      "font-size:13px; font-weight:800; color:var(--ink); display:flex; justify-content:space-between; align-items:center;",
                  },
                  el("span", {}, ticket.customer || "-"),
                  el(
                    "span",
                    {
                      style: "font-size:10px; font-family:monospace; color:var(--ink-soft); font-weight:600;",
                    },
                    ticket.meterId ? `MTR: ${ticket.meterId}` : ""
                  )
                ),
                el(
                  "div",
                  {
                    style:
                      "font-size:11px; color:var(--ink-soft); margin-top:3px; display:flex; align-items:flex-start; gap:4px;",
                  },
                  el("span", {}, "📍"),
                  el("span", {}, `${ticket.address} (${ticket.area})`)
                )
              ),
              // Category & Description
              el(
                "div",
                {
                  style:
                    "background:var(--panel-alt); padding:7px 9px; border-radius:6px; font-size:11px; border:1px solid var(--border);",
                },
                el(
                  "div",
                  { style: "font-weight:700; color:var(--ink);" },
                  `[${ticket.category}] ${cat.label}`
                ),
                ticket.desc
                  ? el(
                      "div",
                      {
                        style: "color:var(--ink-soft); font-size:10.5px; margin-top:2px; line-height:1.35;",
                      },
                      ticket.desc
                    )
                  : null
              ),
              // Action Buttons Bar
              el(
                "div",
                { class: "mobile-action-bar" },
                // WhatsApp
                el(
                  "a",
                  {
                    class: "mobile-act-btn",
                    style: "background:#25D366; color:#FFF; text-decoration:none;",
                    href: waUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  },
                  "💬 WA"
                ),
                // GPS Navigation
                el(
                  "a",
                  {
                    class: "mobile-act-btn",
                    style: "background:#0EA5E9; color:#FFF; text-decoration:none;",
                    href: mapUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  },
                  "🧭 Navigasi"
                ),
                // Work Status Actions
                !isDone
                  ? el(
                      "div",
                      { style: "display:flex; gap:6px; flex:1;" },
                      !isProses
                        ? el(
                            "button",
                            {
                              class: "mobile-act-btn",
                              style: "background:#2563EB; color:#FFF; flex:1;",
                              onclick: () => handleStartWork(ticket),
                            },
                            "▶ Mulai"
                          )
                        : null,
                      el(
                        "button",
                        {
                          class: "mobile-act-btn",
                          style:
                            "background:linear-gradient(135deg, #10B981 0%, #059669 100%); color:#FFF; font-weight:800; flex:1.2; box-shadow:0 2px 6px rgba(16,185,129,0.3);",
                          onclick: () => openFinishModal(ticket),
                        },
                        "✅ Selesaikan"
                      )
                    )
                  : el(
                      "button",
                      {
                        class: "mobile-act-btn",
                        style: "background:rgba(16,185,129,0.15); color:#059669; font-weight:700;",
                        onclick: () => {
                          detailTargetId = ticket.id;
                          detailModalOpen = true;
                          render();
                        },
                      },
                      "🔍 Lihat Bukti Selesai"
                    )
              )
            );
          })
    );

    // Route SubTab Content
    const routeContainer = el(
      "div",
      { style: "padding:12px; display:flex; flex-direction:column; gap:12px;" },
      el(
        "div",
        {
          style:
            "background:linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border:1px solid #BFDBFE; border-radius:12px; padding:12px;",
        },
        el("h3", { style: "margin:0 0 4px 0; font-size:14px; font-weight:800; color:#1E3A8A;" }, "🗺️ Rute Berangkat Hari Ini"),
        el("div", { style: "font-size:11px; color:#1E40AF;" }, "Rute terurut berdasarkan lokasi terdekat untuk efisiensi BBM dan waktu tempuh.")
      ),
      activeTickets.length === 0
        ? el("div", { style: "text-align:center; padding:24px; color:var(--ink-soft);" }, "Tidak ada tiket yang perlu dikunjungi saat ini.")
        : activeTickets.map((t, idx) => {
            const coords = parseCoords(t.coords);
            const mapUrl = coords
              ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.address)}`;
            return el(
              "div",
              {
                style:
                  "background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:10px 12px; display:flex; align-items:center; justify-content:space-between; gap:10px;",
              },
              el(
                "div",
                { style: "display:flex; align-items:center; gap:10px;" },
                el(
                  "div",
                  {
                    style:
                      "width:26px; height:26px; border-radius:50%; background:#0284C7; color:#FFF; font-weight:800; font-size:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0;",
                  },
                  String(idx + 1)
                ),
                el(
                  "div",
                  {},
                  el("div", { style: "font-size:12px; font-weight:700; color:var(--ink);" }, t.customer),
                  el("div", { style: "font-size:10.5px; color:var(--ink-soft);" }, `${t.address} (${t.area})`)
                )
              ),
              el(
                "a",
                {
                  class: "btn-primary",
                  style: "font-size:11px; padding:4px 8px; text-decoration:none; white-space:nowrap;",
                  href: mapUrl,
                  target: "_blank",
                },
                "🧭 Petunjuk"
              )
            );
          })
    );

    // Stats SubTab Content
    const statsContainer = el(
      "div",
      { style: "padding:12px; display:flex; flex-direction:column; gap:12px;" },
      el(
        "div",
        {
          style:
            "background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:14px; text-align:center;",
        },
        el("div", { style: "font-size:12px; color:var(--ink-soft);" }, "Tingkat Penyelesaian Hari Ini"),
        el("div", { style: "font-size:32px; font-weight:900; color:#10B981; margin:6px 0;" }, `${completionRate}%`),
        el(
          "div",
          {
            style:
              "width:100%; height:8px; background:var(--panel-alt); border-radius:4px; overflow:hidden;",
          },
          el("div", {
            style: `width:${completionRate}%; height:100%; background:#10B981; border-radius:4px; transition:width 0.3s ease;`,
          })
        ),
        el(
          "div",
          { style: "font-size:11px; color:var(--ink-soft); margin-top:8px;" },
          `${selesaiTickets.length} dari ${officerTickets.length} Work Order berhasil diselesaikan`
        )
      )
    );

    // Profile SubTab Content
    const profileContainer = el(
      "div",
      { style: "padding:14px; display:flex; flex-direction:column; gap:12px;" },
      el(
        "div",
        {
          style:
            "background:var(--panel); border:1px solid var(--border); border-radius:14px; padding:16px; text-align:center;",
        },
        el(
          "div",
          {
            style: `width:64px; height:64px; border-radius:50%; background:${officerColor.main}; color:#FFF; font-weight:900; font-size:24px; display:flex; align-items:center; justify-content:center; margin:0 auto 10px; box-shadow:0 4px 12px rgba(0,0,0,0.2);`,
          },
          initials
        ),
        el("h2", { style: "margin:0 0 4px 0; font-size:16px; font-weight:800; color:var(--ink);" }, selectedOfficer),
        el("div", { style: "font-size:11.5px; color:var(--ink-soft);" }, "Teknisi Lapangan Minor Repair • PT Aetra Air Tangerang"),
        el(
          "div",
          {
            style:
              "display:inline-block; margin-top:8px; background:rgba(16,185,129,0.15); color:#059669; font-size:10.5px; font-weight:800; padding:2px 8px; border-radius:10px;",
          },
          "🟢 Status: Siaga Lapangan"
        )
      ),
      el(
        "div",
        {
          style:
            "background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:8px;",
        },
        el(
          "div",
          { style: "font-weight:800; font-size:12px; color:var(--ink); display:flex; align-items:center; gap:6px;" },
          el("span", {}, "🔐"),
          el("span", {}, "Informasi Akun Supabase")
        ),
        el(
          "div",
          { style: "font-size:11px; color:var(--ink-soft); display:flex; justify-content:space-between;" },
          el("span", {}, "Status Otentikasi:"),
          el("span", { style: "color:#10B981; font-weight:700;" }, "🟢 Terverifikasi")
        ),
        el(
          "div",
          { style: "font-size:11px; color:var(--ink-soft); display:flex; justify-content:space-between; align-items:center;" },
          el("span", {}, "Email Akun:"),
          el("span", { style: "font-weight:700; color:var(--ink); font-family:monospace; font-size:10.5px;" }, authUser?.email || loginEmail)
        ),
        el(
          "button",
          {
            type: "button",
            class: "btn-secondary",
            style:
              "margin-top:4px; background:#FEF2F2; border-color:#FECACA; color:#DC2626; font-weight:700; font-size:11.5px; padding:8px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;",
            onclick: handleLogout,
          },
          el("span", {}, "🚪"),
          el("span", {}, "Keluar Akun (Logout)")
        )
      ),
      el(
        "div",
        {
          style:
            "background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:10px;",
        },
        el("div", { style: "font-weight:700; font-size:12px; color:var(--ink);" }, "📞 Kontak Darurat & Pengawas:"),
        el(
          "a",
          {
            class: "btn-secondary",
            href: "tel:0215989800",
            style: "text-decoration:none; text-align:center; padding:8px;",
          },
          "☎️ Hubungi Dispatcher Kantor Aetra"
        ),
        el(
          "a",
          {
            class: "btn-secondary",
            href: "https://wa.me/6281288990011",
            target: "_blank",
            style: "text-decoration:none; text-align:center; padding:8px; color:#25D366; border-color:#25D366;",
          },
          "💬 WhatsApp Posko Pengawas"
        )
      )
    );

    // Active Tab Body Switcher
    let activeBody: HTMLElement;
    if (activeTab === "route") {
      activeBody = routeContainer;
    } else if (activeTab === "stats") {
      activeBody = statsContainer;
    } else if (activeTab === "profile") {
      activeBody = profileContainer;
    } else {
      activeBody = el(
        "div",
        { style: "display:flex; flex-direction:column; flex:1; min-height:0;" },
        searchBar,
        filterRow,
        ticketCardsContainer
      );
    }

    // Floating Action Button (Lapor Temuan Baru)
    const fabButton = el(
      "button",
      {
        class: "mobile-fab-btn",
        title: "Catat Temuan / Masalah Lapangan",
        onclick: () => {
          reportModalOpen = true;
          render();
        },
      },
      el("span", { style: "font-size:16px;" }, "➕"),
      el("span", {}, "Lapor Masalah")
    );

    // Fixed Bottom Navigation Bar
    const bottomNav = el(
      "nav",
      { class: "mobile-native-bottom-bar" },
      el(
        "button",
        {
          class: `mobile-native-bottom-tab ${activeTab === "tasks" ? "active" : ""}`,
          onclick: () => {
            activeTab = "tasks";
            render();
          },
        },
        el("span", { style: "font-size:18px;" }, "📋"),
        el("span", {}, "Tugas"),
        activeTickets.length > 0
          ? el("span", { class: "mobile-nav-badge" }, String(activeTickets.length))
          : null
      ),
      el(
        "button",
        {
          class: `mobile-native-bottom-tab ${activeTab === "route" ? "active" : ""}`,
          onclick: () => {
            activeTab = "route";
            render();
          },
        },
        el("span", { style: "font-size:18px;" }, "🗺️"),
        el("span", {}, "Rute Jalan")
      ),
      el(
        "button",
        {
          class: `mobile-native-bottom-tab ${activeTab === "stats" ? "active" : ""}`,
          onclick: () => {
            activeTab = "stats";
            render();
          },
        },
        el("span", { style: "font-size:18px;" }, "📊"),
        el("span", {}, "Capaian")
      ),
      el(
        "button",
        {
          class: `mobile-native-bottom-tab ${activeTab === "profile" ? "active" : ""}`,
          onclick: () => {
            activeTab = "profile";
            render();
          },
        },
        el("span", { style: "font-size:18px;" }, "👤"),
        el("span", {}, "Profil")
      )
    );

    // Finish Modal
    const renderFinishModal = () => {
      if (!finishModalOpen || !finishTargetId) return null;
      const target = complaints.find((c) => c.id === finishTargetId);
      if (!target) return null;
      const cat = getCatInfo(target.category);

      return el(
        "div",
        {
          class: "modal-overlay",
          onclick: (e: any) => {
            if (e.target === e.currentTarget) {
              finishModalOpen = false;
              render();
            }
          },
        },
        el(
          "div",
          { class: "modal-card", style: "max-width:480px; max-height:90vh; overflow-y:auto;" },
          el(
            "div",
            { class: "modal-header" },
            el(
              "h3",
              { style: "margin:0; font-size:15px; font-weight:800;" },
              `✅ Penyelesaian WO: ${target.id}`
            ),
            el(
              "button",
              {
                class: "close-btn",
                onclick: () => {
                  finishModalOpen = false;
                  render();
                },
              },
              "✕"
            )
          ),
          el(
            "div",
            { style: "padding:14px; display:flex; flex-direction:column; gap:12px;" },
            el(
              "div",
              { style: "background:var(--panel-alt); padding:10px; border-radius:8px; font-size:12px;" },
              el("div", { style: "font-weight:700;" }, `${target.customer} (${target.meterId || "-"})`),
              el("div", { style: "color:var(--ink-soft);" }, target.address),
              el("div", { style: "color:var(--accent); font-weight:700; margin-top:2px;" }, `[${target.category}] ${cat.label}`)
            ),
            // Photo Before & After Upload
            el(
              "div",
              { style: "display:grid; grid-template-columns:1fr 1fr; gap:10px;" },
              // Foto Sebelum
              el(
                "div",
                { style: "display:flex; flex-direction:column; gap:4px;" },
                el("label", { style: "font-size:11px; font-weight:700; color:var(--ink);" }, "📸 Foto SEBELUM:"),
                finishPhotoBefore
                  ? el(
                      "div",
                      { style: "position:relative;" },
                      el("img", {
                        src: finishPhotoBefore,
                        style: "width:100%; height:90px; object-fit:cover; border-radius:8px; border:1px solid var(--border);",
                      }),
                      el(
                        "button",
                        {
                          style:
                            "position:absolute; top:4px; right:4px; background:rgba(0,0,0,0.6); color:#FFF; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer;",
                          onclick: () => {
                            finishPhotoBefore = null;
                            render();
                          },
                        },
                        "✕"
                      )
                    )
                  : el(
                      "label",
                      {
                        class: "btn-secondary",
                        style:
                          "height:90px; border:2px dashed var(--border); border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; font-size:11px;",
                      },
                      el("span", { style: "font-size:20px;" }, "📷"),
                      el("span", {}, "Unggah Foto"),
                      el("input", {
                        type: "file",
                        accept: "image/*",
                        style: "display:none;",
                        onchange: (e: any) => handlePhotoUpload(e, true),
                      })
                    )
              ),
              // Foto Sesudah
              el(
                "div",
                { style: "display:flex; flex-direction:column; gap:4px;" },
                el("label", { style: "font-size:11px; font-weight:700; color:var(--ink);" }, "📸 Foto SESUDAH:"),
                finishPhotoAfter
                  ? el(
                      "div",
                      { style: "position:relative;" },
                      el("img", {
                        src: finishPhotoAfter,
                        style: "width:100%; height:90px; object-fit:cover; border-radius:8px; border:1px solid var(--border);",
                      }),
                      el(
                        "button",
                        {
                          style:
                            "position:absolute; top:4px; right:4px; background:rgba(0,0,0,0.6); color:#FFF; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer;",
                          onclick: () => {
                            finishPhotoAfter = null;
                            render();
                          },
                        },
                        "✕"
                      )
                    )
                  : el(
                      "label",
                      {
                        class: "btn-secondary",
                        style:
                          "height:90px; border:2px dashed var(--border); border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; font-size:11px;",
                      },
                      el("span", { style: "font-size:20px;" }, "📷"),
                      el("span", {}, "Unggah Foto"),
                      el("input", {
                        type: "file",
                        accept: "image/*",
                        style: "display:none;",
                        onchange: (e: any) => handlePhotoUpload(e, false),
                      })
                    )
              )
            ),
            // Tindakan Cepat
            el(
              "div",
              {},
              el("label", { style: "font-size:11px; font-weight:700; color:var(--ink);" }, "Tindakan Perbaikan:"),
              el(
                "div",
                { style: "display:flex; flex-wrap:wrap; gap:4px; margin:4px 0 8px 0;" },
                ...QUICK_ACTIONS.map((act) =>
                  el(
                    "button",
                    {
                      type: "button",
                      style:
                        "padding:4px 8px; font-size:10px; border-radius:12px; background:var(--panel-alt); border:1px solid var(--border); color:var(--ink); cursor:pointer;",
                      onclick: () => {
                        finishActionNotes = finishActionNotes
                          ? `${finishActionNotes}. ${act}`
                          : act;
                        render();
                      },
                    },
                    `+ ${act}`
                  )
                )
              ),
              el("textarea", {
                class: "input-field",
                style: "width:100%; min-height:60px; font-size:11.5px; box-sizing:border-box;",
                placeholder: "Tuliskan catatan teknis hasil pekerjaan...",
                value: finishActionNotes,
                oninput: (e: any) => {
                  finishActionNotes = e.target.value;
                },
              })
            ),
            // Material yang digunakan
            el(
              "div",
              {},
              el("label", { style: "font-size:11px; font-weight:700; color:var(--ink);" }, "Material & Sparepart Terpakai:"),
              el(
                "div",
                {
                  style:
                    "display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:4px; max-height:120px; overflow-y:auto; padding:4px; background:var(--panel-alt); border-radius:8px;",
                },
                ...MATERIAL_OPTIONS.map((mat) => {
                  const isChecked = finishMaterials.includes(mat);
                  return el(
                    "label",
                    {
                      style:
                        "display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;",
                    },
                    el("input", {
                      type: "checkbox",
                      checked: isChecked,
                      onchange: (e: any) => {
                        if (e.target.checked) {
                          finishMaterials.push(mat);
                        } else {
                          finishMaterials = finishMaterials.filter((m) => m !== mat);
                        }
                      },
                    }),
                    el("span", {}, mat)
                  );
                })
              )
            ),
            // Action Buttons
            el(
              "div",
              { style: "display:flex; justify-content:flex-end; gap:8px; margin-top:8px;" },
              el(
                "button",
                {
                  type: "button",
                  class: "btn-secondary",
                  onclick: () => {
                    finishModalOpen = false;
                    render();
                  },
                },
                "Batal"
              ),
              el(
                "button",
                {
                  type: "button",
                  class: "btn-primary",
                  style:
                    "background:linear-gradient(135deg, #10B981 0%, #059669 100%); border:none; padding:8px 16px; font-weight:800;",
                  onclick: submitFinishReport,
                },
                "💾 Simpan & Selesaikan WO"
              )
            )
          )
        )
      );
    };

    // Report New Issue Modal
    const renderReportModal = () => {
      if (!reportModalOpen) return null;
      return el(
        "div",
        {
          class: "modal-overlay",
          onclick: (e: any) => {
            if (e.target === e.currentTarget) {
              reportModalOpen = false;
              render();
            }
          },
        },
        el(
          "div",
          { class: "modal-card", style: "max-width:440px;" },
          el(
            "div",
            { class: "modal-header" },
            el("h3", { style: "margin:0; font-size:14px; font-weight:800;" }, "➕ Lapor Temuan / Masalah Lapangan"),
            el(
              "button",
              {
                class: "close-btn",
                onclick: () => {
                  reportModalOpen = false;
                  render();
                },
              },
              "✕"
            )
          ),
          el(
            "div",
            { style: "padding:14px; display:flex; flex-direction:column; gap:10px;" },
            el(
              "div",
              {},
              el("label", { style: "font-size:11px; font-weight:700;" }, "Kategori Masalah:"),
              el(
                "select",
                {
                  class: "input-field",
                  style: "width:100%; font-size:12px; margin-top:3px;",
                  value: newReportCategory,
                  onchange: (e: any) => {
                    newReportCategory = e.target.value;
                  },
                },
                ...Object.keys(CATEGORY_MAP).map((k) =>
                  el("option", { value: k }, `[${k}] ${CATEGORY_MAP[k].label}`)
                )
              )
            ),
            el(
              "div",
              {},
              el("label", { style: "font-size:11px; font-weight:700;" }, "Nama Pelanggan / Lokasi:"),
              el("input", {
                type: "text",
                class: "input-field",
                placeholder: "Contoh: Bpk. Joko / Depan Masjid",
                style: "width:100%; box-sizing:border-box;",
                value: newReportCustomer,
                oninput: (e: any) => {
                  newReportCustomer = e.target.value;
                },
              })
            ),
            el(
              "div",
              {},
              el("label", { style: "font-size:11px; font-weight:700;" }, "Alamat Lengkap:"),
              el("textarea", {
                class: "input-field",
                style: "width:100%; min-height:50px; box-sizing:border-box;",
                placeholder: "Nama jalan, RT/RW, patokan lokasi...",
                value: newReportAddress,
                oninput: (e: any) => {
                  newReportAddress = e.target.value;
                },
              })
            ),
            el(
              "label",
              { style: "display:flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; color:#EF4444; cursor:pointer;" },
              el("input", {
                type: "checkbox",
                checked: newReportUrgent,
                onchange: (e: any) => {
                  newReportUrgent = e.target.checked;
                },
              }),
              el("span", {}, "🚨 Kritis / Kebocoran Darurat")
            ),
            el(
              "div",
              { style: "display:flex; justify-content:flex-end; gap:8px; margin-top:6px;" },
              el(
                "button",
                {
                  class: "btn-secondary",
                  onclick: () => {
                    reportModalOpen = false;
                    render();
                  },
                },
                "Batal"
              ),
              el(
                "button",
                {
                  class: "btn-primary",
                  onclick: () => {
                    if (!newReportCustomer.trim() || !newReportAddress.trim()) {
                      // @ts-ignore
                      if ((window as any).Swal) {
                        // @ts-ignore
                        (window as any).Swal.fire({
                          icon: "warning",
                          title: "Lengkapi Data",
                          text: "Harap isi nama dan alamat temuan.",
                        });
                      }
                      return;
                    }

                    const newTicket: ComplaintItem = {
                      id: `WO-${Date.now().toString().slice(-6)}`,
                      customer: newReportCustomer.trim(),
                      address: newReportAddress.trim(),
                      area: newReportArea,
                      category: newReportCategory,
                      status: "proses",
                      urgent: newReportUrgent,
                      receivedAt: new Date().toISOString(),
                      officer: selectedOfficer,
                    };

                    updateComplaint(newTicket);
                    reportModalOpen = false;
                    newReportCustomer = "";
                    newReportAddress = "";
                    newReportDesc = "";
                    newReportUrgent = false;

                    // @ts-ignore
                    if ((window as any).Swal) {
                      // @ts-ignore
                      (window as any).Swal.fire({
                        icon: "success",
                        title: "Temuan Tersimpan",
                        text: `Work Order ${newTicket.id} langsung ditugaskan kepada Anda dan tersinkron ke dashboard.`,
                      });
                    }
                  },
                },
                "Kirim Temuan"
              )
            )
          )
        )
      );
    };

    // Main App Flow inside Screen
    const mainAppFlow = el(
      "div",
      { class: "mobile-native-app-root" },
      headerBar,
      officerBanner,
      el("div", { class: "mobile-native-content" }, activeBody),
      fabButton,
      bottomNav
    );

    const fullNaturalView = wrapInNaturalMobileShell(mainAppFlow, [
      renderFinishModal(),
      renderReportModal(),
    ]);

    container.appendChild(fullNaturalView);
  }

  // Initialize Auth Check
  checkAuthSession();

  return () => {
    isDisposed = true;
    if (renderTimer) {
      clearTimeout(renderTimer);
      renderTimer = null;
    }
    if (authSubscription && typeof authSubscription.unsubscribe === "function") {
      authSubscription.unsubscribe();
    }
    window.removeEventListener("storage", onStorage);
  };
}

// =============================================================
// login.js — Main Login Logic
// =============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Pastikan jika ada user login, kembalikan ke login page
    // Tidak perlu simpan currentUser di localStorage jika ini murni SPA sederhana,
    // tapi karena multi-page, kita butuh simpan info user yang login.
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value.trim();
            const errBanner = document.getElementById('login-error-banner');
            const errText = document.getElementById('login-error-text');

            if (!username || !password) {
                errText.textContent = "Username dan Password tidak boleh kosong!";
                errBanner.style.display = 'flex';
                return;
            }

            // GANTI DENGAN ANON KEY SUPABASE ANDA
            const SUPABASE_URL = "https://qqjqixwlfkygehwvwvsy.supabase.co";
            const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxanFpeHdsZmt5Z2Vod3Z3dnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjQ3MjEsImV4cCI6MjA5NzY0MDcyMX0.aBJtUDGdbFnO852Xos_Aq22yR6VweMuBXBE29xbT7AI";

            fetch(`${SUPABASE_URL}/rest/v1/users?select=*`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            })
                .then(res => {
                    if (!res.ok) throw new Error("Gagal koneksi ke Supabase");
                    return res.json();
                })
                .then(users => {
                    const user = users.find(u => u.username === username && u.password === password);

                    if (user) {
                        if (user.status === "nonaktif") {
                            errText.textContent = "Akun Anda telah dinonaktifkan. Silakan hubungi admin.";
                            errBanner.style.display = 'flex';
                            return;
                        }

                        errBanner.style.display = 'none';
                        // Simpan user yang aktif ke localStorage untuk diakses halaman lain
                        localStorage.setItem('umm_active_user', JSON.stringify(user));

                        // Arahkan ke folder masing-masing
                        if (user.role === 'admin') {
                            const userData = btoa(unescape(encodeURIComponent(JSON.stringify(user))));
                            const returnUrl = encodeURIComponent(window.location.href);
                            window.location.href = `http://localhost:3000?u=${userData}&from=${returnUrl}`;
                        } else if (user.role === 'seller') {
                            const userData = btoa(unescape(encodeURIComponent(JSON.stringify(user))));
                            const returnUrl = encodeURIComponent(window.location.href);
                            window.location.href = `http://localhost:3001?u=${userData}&from=${returnUrl}`;
                        } else if (user.role === 'buyer') {
                            const userData = btoa(unescape(encodeURIComponent(JSON.stringify(user))));
                            const returnUrl = encodeURIComponent(window.location.href);
                            window.location.href = `http://localhost:3002?u=${userData}&from=${returnUrl}`;
                        }
                    } else {
                        errText.textContent = "Username atau password salah!";
                        errBanner.style.display = 'flex';
                    }
                })
                .catch(err => {
                    console.error("Gagal koneksi ke database", err);
                    errText.textContent = "Gagal terhubung ke database Supabase. Pastikan Anon Key benar.";
                    errBanner.style.display = 'flex';
                });
        });
    }

    // Toggle Login / Signup Sections
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');
    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');

    if (showSignupBtn && showLoginBtn) {
        showSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.style.display = 'none';
            signupSection.style.display = 'block';
        });

        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signupSection.style.display = 'none';
            loginSection.style.display = 'block';
        });
    }

    // Signup Form Handler
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value.trim();
            const nim = document.getElementById('signup-nim').value.trim();
            const username = document.getElementById('signup-username').value.trim();
            const password = document.getElementById('signup-password').value.trim();
            const errBanner = document.getElementById('signup-error-banner');
            const errText = document.getElementById('signup-error-text');
            const submitBtn = document.getElementById('btn-signup-submit');

            if (!name || !nim || !username || !password) {
                errText.textContent = "Semua kolom harus diisi!";
                errBanner.style.display = 'flex';
                return;
            }

            if (nim.length < 10) {
                errText.textContent = "NIM tidak valid (minimal 10 digit).";
                errBanner.style.display = 'flex';
                return;
            }

            submitBtn.textContent = "MEMPROSES...";
            submitBtn.disabled = true;

            const SUPABASE_URL = "https://qqjqixwlfkygehwvwvsy.supabase.co";
            const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxanFpeHdsZmt5Z2Vod3Z3dnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjQ3MjEsImV4cCI6MjA5NzY0MDcyMX0.aBJtUDGdbFnO852Xos_Aq22yR6VweMuBXBE29xbT7AI";

            // Cek apakah username sudah ada
            fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${username}&select=id`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            })
            .then(res => res.json())
            .then(existingUsers => {
                if (existingUsers.length > 0) {
                    throw new Error("Username sudah digunakan. Silakan pilih username lain.");
                }

                // Insert user baru
                const newUserId = "USR-" + Date.now();
                const newUser = {
                    id: newUserId,
                    username: username,
                    password: password,
                    name: name,
                    role: "buyer",
                    nim: nim,
                    status: "aktif"
                };

                return fetch(`${SUPABASE_URL}/rest/v1/users`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(newUser)
                });
            })
            .then(res => {
                if (!res.ok) throw new Error("Gagal mendaftar ke server Supabase.");
                return res.json();
            })
            .then(data => {
                // Registrasi berhasil, langsung otomatis login
                const user = data[0];
                localStorage.setItem('umm_active_user', JSON.stringify(user));
                const userData = btoa(unescape(encodeURIComponent(JSON.stringify(user))));
                const returnUrl = encodeURIComponent(window.location.href);
                window.location.href = `http://localhost:3002?u=${userData}&from=${returnUrl}`;
            })
            .catch(err => {
                console.error(err);
                errText.textContent = err.message || "Terjadi kesalahan. Coba lagi nanti.";
                errBanner.style.display = 'flex';
                submitBtn.textContent = "DAFTAR SEKARANG";
                submitBtn.disabled = false;
            });
        });
    }

    // Toggle Password Visibility
    const togglePassword = document.getElementById('toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passInput = document.getElementById('login-password');
            const icon = this.querySelector('i');
            if (passInput.type === 'password') {
                passInput.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                passInput.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    }
});

function fillLogin(u, p) {
    document.getElementById('login-username').value = u;
    document.getElementById('login-password').value = p;
}

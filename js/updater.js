// updater.js
// Versioning without manual refresh.
//  - version.json is rewritten by GitHub Pages on every deploy (commit id + date).
//  - The page checks it regularly: when a new version is online, a popup offers
//    to update. "Update" downloads fresh copies of the site files, then reloads.
//  - When a visitor comes back after a deploy, or an old cached file breaks the
//    page, the same refresh runs automatically (once), so CSS and JS always match.
// Classic script (not a module) so it still works when a module fails to load.
(function () {
    const VERSION_URL = "version.json";
    const CHECK_EVERY = 3 * 60 * 1000; // ms
    const REPAIR_KEY = "portfolio-repaired";
    const SEEN_KEY = "portfolio-version"; // last version this browser displayed

    const TEXTS = {
        en: { message: "A new version of the site is available", update: "Update", later: "Later" },
        fr: { message: "Une nouvelle version du site est disponible", update: "Mettre à jour", later: "Plus tard" }
    };

    let currentVersion = null;
    let dismissedVersion = null;
    let toast = null;

    function lang() {
        let saved = null;
        try { saved = localStorage.getItem("portfolio-lang"); } catch (e) { }
        if (saved && TEXTS[saved]) return saved;
        return (navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
    }

    function fetchVersion() {
        return fetch(VERSION_URL + "?t=" + Date.now(), { cache: "no-store" })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (!data) return null;
                // commit id when GitHub provides it, otherwise the build date
                const id = data.version && data.version.trim() ? data.version.trim() : data.date;
                return id ? { version: id, date: data.date } : null;
            })
            .catch(() => null);
    }

    // Re-download every file of the site, bypassing the cache, then reload
    function hardRefresh() {
        const urls = new Set([location.href.split("#")[0]]);
        for (const entry of performance.getEntriesByType("resource")) {
            const url = entry.name;
            if (url.startsWith(location.origin) && /\.(js|css|json|html)(\?|$)/.test(url)) urls.add(url);
        }
        const done = () => location.reload();
        Promise.all([...urls].map(url => fetch(url, { cache: "reload" }).catch(() => null)))
            .then(done, done);
        setTimeout(done, 8000); // never stay stuck
    }

    function showToast(version) {
        if (toast || version === dismissedVersion) return;
        const txt = TEXTS[lang()];

        toast = document.createElement("div");
        toast.id = "updateToast";
        toast.setAttribute("role", "status");

        const message = document.createElement("span");
        message.textContent = "✦ " + txt.message;

        const update = document.createElement("button");
        update.className = "update-now";
        update.textContent = txt.update;
        update.addEventListener("click", () => {
            remember(version);
            update.disabled = true;
            update.textContent = "...";
            hardRefresh();
        });

        const later = document.createElement("button");
        later.className = "update-later";
        later.textContent = txt.later;
        later.addEventListener("click", () => {
            dismissedVersion = version;
            toast.remove();
            toast = null;
        });

        toast.append(message, update, later);
        document.body.appendChild(toast);
    }

    function check() {
        return fetchVersion().then(data => {
            if (!data) return;
            if (currentVersion === null) {
                currentVersion = data.version;
                showVersionTag(data);
                // the site changed since this browser's last visit: its cached
                // files (CSS, JS) may be old, so fetch fresh ones once
                const seen = recall();
                remember(data.version);
                if (seen && seen !== data.version) repairOnce();
            } else if (data.version !== currentVersion) {
                showToast(data.version);
            }
        });
    }

    function recall() {
        try { return localStorage.getItem(SEEN_KEY); } catch (e) { return null; }
    }

    function remember(version) {
        try { localStorage.setItem(SEEN_KEY, version); } catch (e) { }
    }

    function showVersionTag(data) {
        const tag = document.getElementById("versionTag");
        if (!tag || data.version.includes("{{")) return; // local server: no Jekyll
        tag.textContent = data.version === data.date
            ? "v" + data.date
            : "v" + data.version.slice(0, 7) + (data.date ? " · " + data.date : "");
    }

    // --- Automatic repair: an old cached module does not match the new ones ---
    function looksLikeStaleCache(message) {
        return /does not provide an export|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(message || "");
    }

    function repairOnce() {
        try {
            if (sessionStorage.getItem(REPAIR_KEY)) return;
            sessionStorage.setItem(REPAIR_KEY, "1");
        } catch (e) { return; }
        hardRefresh();
    }

    window.addEventListener("error", e => {
        // a module file that could not be downloaded
        const target = e.target;
        if (target && target.tagName === "SCRIPT" && target.type === "module") repairOnce();
        else if (looksLikeStaleCache(e.message)) repairOnce();
    }, true);

    window.addEventListener("unhandledrejection", e => {
        if (looksLikeStaleCache(e.reason && e.reason.message)) repairOnce();
    });

    // the page worked: allow a new repair after a future deploy
    window.addEventListener("load", () => {
        setTimeout(() => {
            try { sessionStorage.removeItem(REPAIR_KEY); } catch (e) { }
        }, 5000);
    });

    // --- Checks ---
    check();
    setInterval(check, CHECK_EVERY);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") check();
    });

    window.portfolioUpdater = { check, hardRefresh };
})();

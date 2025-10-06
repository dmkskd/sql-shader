/**
 * =====================================================================================
 * WHY IS THIS FILE NEEDED?
 * =====================================================================================
 *
 * DuckDB-WASM is designed for high performance and can execute queries in parallel using
 * multiple threads. To achieve this in a web browser, it needs a JavaScript feature
 * called `SharedArrayBuffer`.
 *
 * --- The Security Requirement ---
 * For security reasons (to mitigate risks from attacks like Spectre), browsers will only
 * enable `SharedArrayBuffer` if the web page is in a "cross-origin isolated" state.
 *
 * A page becomes cross-origin isolated when its main document is served with two
 * specific HTTP headers:
 *   1. Cross-Origin-Opener-Policy: same-origin (COOP)
 *   2. Cross-Origin-Embedder-Policy: require-corp (COEP)
 *
 * --- The Development Challenge ---
 * Many simple development servers (like `python -m http.server`) don't provide an
 * easy way to add these custom headers.
 *
 * --- The Solution: This Service Worker ---
 * This script acts as a workaround. It installs a "service worker" that intercepts all
 * network requests for your page. It then re-sends the responses with the necessary
 * COOP and COEP headers added, effectively creating the secure environment that
 * DuckDB-WASM needs to enable multi-threading and achieve its full performance.
 */
/*! coi-serviceworker v0.1.7 - Guido Zuidhof, licensed under MIT */
if(typeof window === 'undefined'){
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

    self.addEventListener("message", e => {
        if (e.data && e.data.type === "deregister") {
            self.registration.unregister().then(() => {
                return self.clients.matchAll();
            }).then(clients => {
                clients.forEach(client => client.navigate(client.url))
            });
        }
    });

    self.addEventListener("fetch", function(event) {
        if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
            return;
        }
        event.respondWith(fetch(event.request).then(response => {
            if (response.status === 0) {
                return response;
            }
            const newHeaders = new Headers(response.headers);
            newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
            newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
            return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders, });
        }).catch(e => console.error(e)));
    });

} else {
    (() => {
        // You can customize the behavior of this script through a global `coi` variable.
        const coi = {
            shouldRegister: () => !window.crossOriginIsolated,
            shouldDeregister: () => false,
            ...window.coi
        }

        if (coi.shouldRegister()) {
            navigator.serviceWorker.register(new URL(document.currentScript.src).pathname).then(registration => {
                console.log('COOP/COEP Service Worker registered', registration.scope);

                registration.addEventListener("updatefound", () => window.location.reload());

                // If the registration is active, but it's not controlling the page
                if (registration.active && !navigator.serviceWorker.controller) {
                    window.location.reload();
                }
            }).catch(err => console.error("COOP/COEP Service Worker failed to register:", err));
        }

        if (coi.shouldDeregister()) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for (const registration of registrations) {
                    registration.unregister();
                }
            });
        }
    })();
}
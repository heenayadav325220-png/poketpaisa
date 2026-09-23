/**
 * PocketPaisa Pro - Foreground Service & Edge Overlay Manager
 * Compliant with Android SYSTEM_ALERT_WINDOW specifications.
 * High-Performance, Isolated Module, Non-Blocking Architecture.
 */

(function(window, document) {
    'use strict';

    // Storage Keys
    const STORAGE_KEY_ENABLED = 'pocketpaisa_edge_overlay_enabled';
    const STORAGE_KEY_PERM = 'pocketpaisa_overlay_permission';
    const STORAGE_KEY_SIDE = 'pocketpaisa_edge_side'; // 'right' | 'left'
    const STORAGE_KEY_Y = 'pocketpaisa_edge_y_pos';
    const STORAGE_KEY_ONBOARDED = 'pocketpaisa_edge_onboarded';

    // State
    const state = {
        enabled: localStorage.getItem(STORAGE_KEY_ENABLED) === 'true',
        permission: localStorage.getItem(STORAGE_KEY_PERM) || 'unprompted', // 'granted' | 'denied' | 'unprompted'
        side: localStorage.getItem(STORAGE_KEY_SIDE) || 'right',
        yPos: parseFloat(localStorage.getItem(STORAGE_KEY_Y)) || 0.45, // fraction of screen height
        isOpen: false,
        activeType: 'expense',
        isDragging: false,
        startY: 0,
        startX: 0,
        currentYPx: 0,
        dragMoved: false,
        dragStartTime: 0
    };

    // DOM Elements Cache
    let handleEl = null;
    let panelEl = null;
    let backdropEl = null;
    let permModalEl = null;
    let onboardToastEl = null;
    let settingsToggleInput = null;
    let settingsBadgeEl = null;
    let settingsSideBtn = null;

    /**
     * Native Android / Capacitor Bridge Integration
     * Checks if running under native Android wrapper with SYSTEM_ALERT_WINDOW bridge
     */
    const AndroidBridge = {
        isAvailable: () => {
            return !!(window.AndroidOverlayBridge || (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SystemAlertWindow));
        },
        checkPermission: async () => {
            if (window.AndroidOverlayBridge && window.AndroidOverlayBridge.canDrawOverlays) {
                try {
                    return window.AndroidOverlayBridge.canDrawOverlays();
                } catch (e) {
                    console.warn('[OverlayBridge] Error querying native permission:', e);
                }
            }
            return state.permission === 'granted';
        },
        requestPermission: () => {
            if (window.AndroidOverlayBridge && window.AndroidOverlayBridge.requestOverlayPermission) {
                try {
                    window.AndroidOverlayBridge.requestOverlayPermission();
                    return;
                } catch (e) {
                    console.warn('[OverlayBridge] Error requesting native permission:', e);
                }
            }
            // Standard Web / In-App WebView System Alert Window dialog
            showPermissionModal();
        },
        startForegroundService: () => {
            if (window.AndroidOverlayBridge && window.AndroidOverlayBridge.startForegroundOverlayService) {
                try {
                    window.AndroidOverlayBridge.startForegroundOverlayService();
                } catch (e) {
                    console.warn('[OverlayBridge] Error starting foreground service:', e);
                }
            }
        },
        stopForegroundService: () => {
            if (window.AndroidOverlayBridge && window.AndroidOverlayBridge.stopForegroundOverlayService) {
                try {
                    window.AndroidOverlayBridge.stopForegroundOverlayService();
                } catch (e) {
                    console.warn('[OverlayBridge] Error stopping foreground service:', e);
                }
            }
        }
    };

    /**
     * Build and Inject Floating Edge Handle DOM
     */
    function createHandle() {
        if (handleEl) return;

        handleEl = document.createElement('div');
        handleEl.id = 'edgeOverlayHandle';
        handleEl.className = `edge-overlay-handle side-${state.side}`;
        handleEl.title = 'Swipe or tap for PocketPaisa Quick Launch';
        handleEl.setAttribute('role', 'button');
        handleEl.setAttribute('aria-label', 'Open PocketPaisa Quick Launch');

        handleEl.innerHTML = `
            <div class="edge-handle-grip">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        document.body.appendChild(handleEl);
        positionHandle();
        attachHandleGestures();
    }

    /**
     * Position Handle on Screen (Vertical Axis)
     */
    function positionHandle() {
        if (!handleEl) return;
        const windowHeight = window.innerHeight || 800;
        const targetY = Math.max(20, Math.min(windowHeight - 80, state.yPos * windowHeight));
        state.currentYPx = targetY;
        handleEl.style.transform = `translate3d(0, ${targetY}px, 0)`;
        handleEl.className = `edge-overlay-handle side-${state.side}`;
    }

    /**
     * Butter-smooth Gesture & Inward Swipe Detection
     */
    function attachHandleGestures() {
        if (!handleEl) return;

        let rafId = null;

        const onTouchStart = (e) => {
            const touch = e.touches ? e.touches[0] : e;
            state.startY = touch.clientY;
            state.startX = touch.clientX;
            state.dragStartTime = Date.now();
            state.dragMoved = false;
            state.isDragging = true;
            handleEl.classList.add('is-dragging');
        };

        const onTouchMove = (e) => {
            if (!state.isDragging) return;
            const touch = e.touches ? e.touches[0] : e;
            const deltaY = touch.clientY - state.startY;
            const deltaX = touch.clientX - state.startX;

            if (Math.abs(deltaY) > 4 || Math.abs(deltaX) > 4) {
                state.dragMoved = true;
            }

            // Drag vertical position clamped to screen bounds
            const windowHeight = window.innerHeight || 800;
            const newY = Math.max(15, Math.min(windowHeight - 75, state.currentYPx + deltaY));

            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                handleEl.style.transform = `translate3d(0, ${newY}px, 0)`;
            });
        };

        const onTouchEnd = (e) => {
            if (!state.isDragging) return;
            state.isDragging = false;
            handleEl.classList.remove('is-dragging');

            const touch = e.changedTouches ? e.changedTouches[0] : e;
            const totalDeltaX = touch.clientX - state.startX;
            const totalDeltaY = touch.clientY - state.startY;
            const elapsed = Date.now() - state.dragStartTime;

            // Inward Swipe Detection:
            // If on right side and swiped left (deltaX < -18), OR on left side and swiped right (deltaX > 18)
            const isInwardSwipe = (state.side === 'right' && totalDeltaX < -18) ||
                                  (state.side === 'left' && totalDeltaX > 18);

            // Tap Detection: moved very little or quick tap
            const isTap = !state.dragMoved || (Math.abs(totalDeltaX) < 10 && Math.abs(totalDeltaY) < 10 && elapsed < 350);

            if (isInwardSwipe || isTap) {
                positionHandle(); // Snap back
                openQuickPanel();
                return;
            }

            // Otherwise, update saved vertical position
            const windowHeight = window.innerHeight || 800;
            const finalY = Math.max(15, Math.min(windowHeight - 75, state.currentYPx + totalDeltaY));
            state.yPos = finalY / windowHeight;
            state.currentYPx = finalY;
            localStorage.setItem(STORAGE_KEY_Y, state.yPos);
            positionHandle();
        };

        // Touch events
        handleEl.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onTouchEnd, { passive: true });

        // Mouse events for preview & desktop environments
        handleEl.addEventListener('mousedown', onTouchStart);
        window.addEventListener('mousemove', (e) => {
            if (state.isDragging) onTouchMove(e);
        });
        window.addEventListener('mouseup', (e) => {
            if (state.isDragging) onTouchEnd(e);
        });

        // Window resize repositioning
        window.addEventListener('resize', () => {
            positionHandle();
        }, { passive: true });
    }

    /**
     * Build Quick Launch Panel DOM
     */
    function createQuickPanel() {
        if (panelEl) return;

        // Backdrop
        backdropEl = document.createElement('div');
        backdropEl.className = 'edge-panel-backdrop';
        backdropEl.onclick = closeQuickPanel;
        document.body.appendChild(backdropEl);

        // Panel Container
        panelEl = document.createElement('aside');
        panelEl.id = 'edgeQuickLaunchPanel';
        panelEl.className = `edge-quick-panel side-${state.side}`;
        panelEl.setAttribute('role', 'dialog');
        panelEl.setAttribute('aria-modal', 'true');
        panelEl.setAttribute('aria-label', 'Quick Launch Panel');

        const icons = window.Icons || {};
        const getIcon = (name, fallback) => {
            return (icons[name] ? icons[name]('svg-icon-sm') : fallback);
        };

        panelEl.innerHTML = `
            <!-- Panel Header -->
            <div class="edge-panel-header">
                <div class="edge-panel-brand" style="display: flex; align-items: center; gap: 8px;">
                    <img src="/logo.svg" alt="PocketPaisa" style="width: 22px; height: 22px; border-radius: 6px; object-fit: cover; box-shadow: 0 2px 6px rgba(16,185,129,0.3);">
                    <h4>PocketPaisa</h4>
                    <span class="edge-service-beacon">
                        <span class="edge-beacon-dot"></span>
                        <span>Quick Launch</span>
                    </span>
                </div>
                <div class="edge-panel-controls">
                    <button type="button" class="edge-panel-btn" onclick="window.EdgeOverlayService.switchSide()" title="Dock to opposite edge" aria-label="Switch Side">
                        ${getIcon('themeSwitch', '⇄')}
                    </button>
                    <button type="button" class="edge-panel-btn" onclick="window.EdgeOverlayService.close()" title="Minimize to edge" aria-label="Close">
                        ${getIcon('close', '✕')}
                    </button>
                </div>
            </div>

            <!-- Financial Snapshot -->
            <div class="edge-snapshot-card">
                <div class="edge-snapshot-row">
                    <span class="edge-snapshot-label">Balance</span>
                    <span class="edge-snapshot-balance" id="edgeSnapBalance">₹0.00</span>
                </div>
                <div class="edge-mini-progress">
                    <div class="edge-mini-progress-fill" id="edgeSnapProgress"></div>
                </div>
            </div>

            <!-- Instant Transaction Composer -->
            <div class="edge-composer-body">
                <!-- Expense / Income Segmented Switch -->
                <div class="edge-type-switch">
                    <button type="button" class="edge-type-btn active btn-exp" id="edgeTypeExpense" onclick="window.EdgeOverlayService.setType('expense')">
                        ${getIcon('expense', '-')} <span>Expense</span>
                    </button>
                    <button type="button" class="edge-type-btn btn-inc" id="edgeTypeIncome" onclick="window.EdgeOverlayService.setType('income')">
                        ${getIcon('income', '+')} <span>Income</span>
                    </button>
                </div>

                <!-- Fast Amount Input -->
                <div class="edge-input-field">
                    <label class="edge-input-label" for="edgeAmountInput">Amount</label>
                    <div class="edge-amount-input-box">
                        <span class="edge-currency-sym" id="edgeCurrencySym">₹</span>
                        <input type="number" step="any" id="edgeAmountInput" class="edge-amount-input" placeholder="0.00" inputmode="decimal">
                    </div>
                </div>

                <!-- Fast Category Input -->
                <div class="edge-input-field">
                    <label class="edge-input-label" for="edgeCategoryInput">Category</label>
                    <input type="text" id="edgeCategoryInput" class="edge-category-input" placeholder="e.g. Food, Fuel, Coffee">
                </div>

                <!-- Fast Account Selector -->
                <div class="edge-input-field">
                    <label class="edge-input-label" for="edgeAccountSelect">Account</label>
                    <select id="edgeAccountSelect" class="edge-account-select">
                        <option value="bank" selected>Bank (UPI)</option>
                        <option value="cash">Cash (नकद)</option>
                        <option value="credit">Card Debt (उधार)</option>
                    </select>
                </div>

                <!-- Quick Voice Add Section -->
                <div class="edge-voice-add-section">
                    <div class="edge-voice-add-info">
                        <span class="edge-voice-add-title">Quick Voice Add</span>
                        <span id="edgeVoiceInstruction" class="edge-voice-instruction">💡 Say: "Lunch 120 bank" or "Salary 5000 cash"</span>
                    </div>
                    <div class="edge-voice-mic-container">
                        <button type="button" id="edgePanelMicBtn" class="edge-panel-mic-btn" onclick="window.EdgeOverlayService.toggleVoice()" title="Tap to speak & add">
                            <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                        </button>
                        <div id="edgeMicPulseWave" class="edge-mic-pulse-wave"></div>
                    </div>
                </div>

                <!-- Fast Category Preset Chips -->
                <div class="edge-chips-grid">
                    <button type="button" class="edge-chip" onclick="window.EdgeOverlayService.quickFill('Food & Dining')">
                        ${getIcon('food', '🍽️')} <span>Food</span>
                    </button>
                    <button type="button" class="edge-chip" onclick="window.EdgeOverlayService.quickFill('Groceries')">
                        ${getIcon('groceries', '🛒')} <span>Grocery</span>
                    </button>
                    <button type="button" class="edge-chip" onclick="window.EdgeOverlayService.quickFill('Transport')">
                        ${getIcon('transport', '🚗')} <span>Fuel</span>
                    </button>
                    <button type="button" class="edge-chip" onclick="window.EdgeOverlayService.quickFill('Rent & Bills')">
                        ${getIcon('rent', '🏠')} <span>Rent</span>
                    </button>
                    <button type="button" class="edge-chip" onclick="window.EdgeOverlayService.quickFill('Shopping')">
                        ${getIcon('shopping', '🛍️')} <span>Shop</span>
                    </button>
                    <button type="button" class="edge-chip" onclick="window.EdgeOverlayService.quickFill('Salary')">
                        ${getIcon('salary', '💼')} <span>Salary</span>
                    </button>
                </div>

                <!-- Submit Button -->
                <button type="button" id="edgeSubmitBtn" class="edge-submit-btn btn-expense-mode" onclick="window.EdgeOverlayService.submitTransaction()">
                    ${getIcon('composer', '⚡')} <span id="edgeSubmitBtnText">Record Expense</span>
                </button>

                <!-- Feedback Toast -->
                <div id="edgePanelToast" class="edge-toast">
                    ${getIcon('shieldCheck', '✓')}
                    <span id="edgePanelToastText">Transaction recorded!</span>
                </div>
            </div>
        `;

        document.body.appendChild(panelEl);
    }

    /**
     * Synchronize Snapshot Data with App State
     */
    function syncPanelWithApp() {
        if (!panelEl) return;
        const bridge = window.PocketPaisaBridge;
        const appState = bridge ? bridge.getState() : null;

        const currency = appState ? appState.currentCurrency : (localStorage.getItem('web_currency_v2') || '₹');
        const salary = appState ? appState.salary : (parseFloat(localStorage.getItem('web_salary_v2')) || 0);
        const balance = appState ? appState.balance : (parseFloat(localStorage.getItem('web_balance_v2')) || 0);

        const symEl = document.getElementById('edgeCurrencySym');
        if (symEl) symEl.innerText = currency;

        const balEl = document.getElementById('edgeSnapBalance');
        if (balEl) balEl.innerText = `${currency}${balance.toFixed(2)}`;

        const progressEl = document.getElementById('edgeSnapProgress');
        if (progressEl) {
            let totalSpent = salary - balance;
            let spentPercent = salary > 0 ? (totalSpent / salary) * 100 : 0;
            let displayPercent = Math.max(0, Math.min(spentPercent, 100));
            progressEl.style.width = `${displayPercent}%`;
            if (spentPercent >= 95 || balance < 0) {
                progressEl.style.backgroundColor = 'var(--accent-rose, #f43f5e)';
            } else if (spentPercent >= 80) {
                progressEl.style.backgroundColor = 'var(--accent-amber, #f59e0b)';
            } else {
                progressEl.style.backgroundColor = 'var(--accent-green, #10b981)';
            }
        }
    }

    /**
     * Open Quick Launch Panel
     */
    function openQuickPanel() {
        if (!panelEl) createQuickPanel();
        syncPanelWithApp();
        state.isOpen = true;
        backdropEl.classList.add('is-open');
        panelEl.className = `edge-quick-panel side-${state.side} is-open`;

        // Focus amount input for rapid entry
        setTimeout(() => {
            const input = document.getElementById('edgeAmountInput');
            if (input) input.focus();
        }, 150);
    }

    /**
     * Close Quick Launch Panel
     */
    function closeQuickPanel() {
        if (!panelEl) return;
        state.isOpen = false;
        if (backdropEl) backdropEl.classList.remove('is-open');
        panelEl.classList.remove('is-open');

        // Fire native Android Bridge event to auto-hide native overlay window
        if (window.AndroidOverlayBridge && typeof window.AndroidOverlayBridge.closeOverlay === 'function') {
            try {
                window.AndroidOverlayBridge.closeOverlay();
            } catch (e) {
                console.warn("[Bridge] Error calling native closeOverlay", e);
            }
        }
    }

    /**
     * Set Active Mode: Expense vs Income
     */
    function setType(type) {
        state.activeType = type;
        const expBtn = document.getElementById('edgeTypeExpense');
        const incBtn = document.getElementById('edgeTypeIncome');
        const submitBtn = document.getElementById('edgeSubmitBtn');
        const submitText = document.getElementById('edgeSubmitBtnText');

        if (expBtn && incBtn) {
            if (type === 'expense') {
                expBtn.classList.add('active');
                incBtn.classList.remove('active');
                if (submitBtn) submitBtn.className = 'edge-submit-btn btn-expense-mode';
                if (submitText) submitText.innerText = 'Record Expense';
            } else {
                incBtn.classList.add('active');
                expBtn.classList.remove('active');
                if (submitBtn) submitBtn.className = 'edge-submit-btn';
                if (submitText) submitText.innerText = 'Record Income';
            }
        }
    }

    /**
     * Quick Fill Category Input
     */
    function quickFill(catName) {
        const input = document.getElementById('edgeCategoryInput');
        if (input) {
            input.value = catName;
            input.focus();
        }
    }

    /**
     * Record Transaction through PocketPaisa Bridge
     */
    function submitTransaction() {
        const amountEl = document.getElementById('edgeAmountInput');
        const categoryEl = document.getElementById('edgeCategoryInput');
        const accountEl = document.getElementById('edgeAccountSelect');
        const toastEl = document.getElementById('edgePanelToast');
        const toastTextEl = document.getElementById('edgePanelToastText');

        if (!amountEl) return;
        const amount = parseFloat(amountEl.value);
        const category = categoryEl ? categoryEl.value : '';
        const account = accountEl ? accountEl.value : 'bank';

        if (isNaN(amount) || amount <= 0) {
            amountEl.style.borderColor = 'var(--accent-rose, #f43f5e)';
            setTimeout(() => { amountEl.style.borderColor = ''; }, 1200);
            return;
        }

        const bridge = window.PocketPaisaBridge;
        let success = false;

        if (bridge && bridge.addTransaction) {
            success = bridge.addTransaction(state.activeType, amount, category, account);
        } else if (typeof window.addTransaction === 'function') {
            // Fallback direct invocation
            const amtInput = document.getElementById('amount');
            const catInput = document.getElementById('category');
            if (amtInput) amtInput.value = amount;
            if (catInput) catInput.value = category;
            window.addTransaction(state.activeType);
            success = true;
        }

        if (success !== false) {
            // Feedback
            amountEl.value = '';
            if (categoryEl) categoryEl.value = '';

            syncPanelWithApp();

            if (toastEl && toastTextEl) {
                const cur = (bridge && bridge.getState().currentCurrency) || '₹';
                toastTextEl.innerText = `Recorded ${cur}${amount.toFixed(2)} (${category || state.activeType})!`;
                toastEl.style.display = 'flex';
                setTimeout(() => {
                    toastEl.style.display = 'none';
                    closeQuickPanel();
                }, 900);
            } else {
                closeQuickPanel();
            }
        }
    }

    /**
     * Switch Handle & Panel Edge (Left vs Right)
     */
    function switchSide() {
        state.side = state.side === 'right' ? 'left' : 'right';
        localStorage.setItem(STORAGE_KEY_SIDE, state.side);

        if (handleEl) {
            handleEl.className = `edge-overlay-handle side-${state.side}`;
        }
        if (panelEl) {
            panelEl.className = `edge-quick-panel side-${state.side} ${state.isOpen ? 'is-open' : ''}`;
        }
        updateSettingsUI();
    }

    /**
     * Build Android SYSTEM_ALERT_WINDOW Permission Sheet
     */
    function createPermissionModal() {
        if (permModalEl) return;

        permModalEl = document.createElement('div');
        permModalEl.id = 'androidOverlayPermModal';
        permModalEl.className = 'android-perm-modal';

        const icons = window.Icons || {};
        const shieldIcon = icons.shieldCheck ? icons.shieldCheck('svg-icon-lg') : '🛡️';

        permModalEl.innerHTML = `
            <div class="android-perm-sheet" role="alertdialog">
                <div class="android-perm-header">
                    <div class="android-perm-app-icon" style="background: transparent; box-shadow: none;">
                        <img src="/logo.svg" alt="PocketPaisa Pro" style="width: 44px; height: 44px; border-radius: 12px; box-shadow: 0 4px 12px rgba(16,185,129,0.35);">
                    </div>
                    <div class="android-perm-title">
                        <h3>Display over other apps</h3>
                        <span class="android-perm-tag">SYSTEM_ALERT_WINDOW</span>
                    </div>
                </div>

                <p class="android-perm-body">
                    Allow <strong>PocketPaisa Pro</strong> to display a minimal edge handle over other apps. This enables instant budget tracking without interrupting your flow or leaving your current screen.
                </p>

                <div class="android-switch-box">
                    <span class="android-switch-text">Allow display over other apps</span>
                    <label class="switch-toggle">
                        <input type="checkbox" id="androidSystemPermCheckbox" checked>
                        <span class="switch-slider"></span>
                    </label>
                </div>

                <div class="android-perm-actions">
                    <button type="button" class="android-btn android-btn-cancel" onclick="window.EdgeOverlayService.denyPermission()">
                        Deny
                    </button>
                    <button type="button" class="android-btn android-btn-allow" onclick="window.EdgeOverlayService.grantPermission()">
                        Allow & Enable
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(permModalEl);
    }

    function showPermissionModal() {
        if (!permModalEl) createPermissionModal();
        permModalEl.style.display = 'flex';
    }

    function hidePermissionModal() {
        if (permModalEl) permModalEl.style.display = 'none';
    }

    /**
     * Grant Permission
     */
    function grantPermission() {
        state.permission = 'granted';
        state.enabled = true;
        localStorage.setItem(STORAGE_KEY_PERM, 'granted');
        localStorage.setItem(STORAGE_KEY_ENABLED, 'true');
        localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true');

        hidePermissionModal();
        hideOnboardToast();
        activateService();
        updateSettingsUI();
    }

    /**
     * Deny Permission (Non-blocking, graceful fallback)
     */
    function denyPermission() {
        state.permission = 'denied';
        state.enabled = false;
        localStorage.setItem(STORAGE_KEY_PERM, 'denied');
        localStorage.setItem(STORAGE_KEY_ENABLED, 'false');
        localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true');

        hidePermissionModal();
        hideOnboardToast();
        deactivateService();
        updateSettingsUI();
    }

    /**
     * Activate Foreground Service & Edge Handle
     */
    function activateService() {
        AndroidBridge.startForegroundService();
        createHandle();
        createQuickPanel();
        if (handleEl) handleEl.style.display = 'flex';
    }

    /**
     * Deactivate Service & Remove Handle
     */
    function deactivateService() {
        AndroidBridge.stopForegroundService();
        closeQuickPanel();
        if (handleEl) {
            handleEl.style.display = 'none';
        }
    }

    /**
     * First Launch Onboarding Toast
     */
    function showOnboardToastIfNeeded() {
        const onboarded = localStorage.getItem(STORAGE_KEY_ONBOARDED);
        if (onboarded || state.permission === 'granted') return;

        onboardToastEl = document.createElement('div');
        onboardToastEl.className = 'edge-onboard-toast';
        onboardToastEl.innerHTML = `
            <div class="edge-onboard-info">
                <p>⚡ <strong>Quick Launch Handle</strong>: Swipe from the edge to record expenses anywhere.</p>
            </div>
            <div class="edge-onboard-actions">
                <button type="button" class="edge-onboard-btn-enable" onclick="window.EdgeOverlayService.requestPermission()">Enable</button>
                <button type="button" class="edge-onboard-btn-dismiss" onclick="window.EdgeOverlayService.dismissOnboarding()">Not Now</button>
            </div>
        `;
        document.body.appendChild(onboardToastEl);

        setTimeout(() => {
            onboardToastEl.classList.add('is-visible');
        }, 800);
    }

    function hideOnboardToast() {
        if (onboardToastEl) {
            onboardToastEl.classList.remove('is-visible');
            setTimeout(() => {
                if (onboardToastEl && onboardToastEl.parentNode) {
                    onboardToastEl.parentNode.removeChild(onboardToastEl);
                }
            }, 350);
        }
    }

    function dismissOnboarding() {
        localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true');
        hideOnboardToast();
    }

    /**
     * Settings Screen Control Hook
     */
    function toggleFromSettings(isChecked) {
        if (isChecked) {
            if (state.permission !== 'granted') {
                showPermissionModal();
            } else {
                state.enabled = true;
                localStorage.setItem(STORAGE_KEY_ENABLED, 'true');
                activateService();
            }
        } else {
            state.enabled = false;
            localStorage.setItem(STORAGE_KEY_ENABLED, 'false');
            deactivateService();
        }
        updateSettingsUI();
    }

    function updateSettingsUI() {
        if (!settingsToggleInput) {
            settingsToggleInput = document.getElementById('edgeQuickLaunchToggle');
        }
        if (!settingsBadgeEl) {
            settingsBadgeEl = document.getElementById('edgePermissionBadge');
        }
        if (!settingsSideBtn) {
            settingsSideBtn = document.getElementById('edgeSideBtn');
        }

        if (settingsToggleInput) {
            settingsToggleInput.checked = state.enabled && state.permission === 'granted';
        }

        if (settingsBadgeEl) {
            const isGranted = state.permission === 'granted';
            settingsBadgeEl.className = `edge-perm-badge ${isGranted ? 'granted' : 'denied'}`;
            settingsBadgeEl.innerText = isGranted ? 'Permission: Active' : 'Permission: Required';
        }

        if (settingsSideBtn) {
            settingsSideBtn.innerText = `Side: ${state.side === 'right' ? 'Right' : 'Left'}`;
        }
    }

    // --- EDGE FLOATING OVERLAY QUICK VOICE ADD SYSTEM ---
    let edgeIsListening = false;
    let edgeRecognition = null;

    function initEdgeSpeech() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            const label = document.getElementById('edgeVoiceInstruction');
            if (label) {
                const isHi = getAppLanguage() === 'hi';
                label.innerText = isHi ? '⚠️ वॉइस सपोर्ट नहीं है' : '⚠️ Speech not supported';
                label.style.color = 'var(--accent-rose, #f43f5e)';
            }
            return;
        }

        edgeRecognition = new SpeechRecognition();
        edgeRecognition.continuous = false;
        edgeRecognition.interimResults = false;

        edgeRecognition.onstart = function() {
            edgeIsListening = true;
            updateEdgeMicUI(true);
        };

        edgeRecognition.onerror = function(event) {
            console.error("[Edge Speech] Error:", event.error);
            edgeIsListening = false;
            updateEdgeMicUI(false);
            const label = document.getElementById('edgeVoiceInstruction');
            if (label) {
                const isHi = getAppLanguage() === 'hi';
                if (event.error === 'not-allowed') {
                    label.innerText = isHi ? '⚠️ माइक अनुमति आवश्यक है' : '⚠️ Mic permission required';
                } else {
                    label.innerText = isHi ? '⚠️ एरर आ गया' : '⚠️ Speech error';
                }
                label.style.color = 'var(--accent-rose, #f43f5e)';
            }
        };

        edgeRecognition.onend = function() {
            edgeIsListening = false;
            updateEdgeMicUI(false);
        };

        edgeRecognition.onresult = function(event) {
            const text = event.results[0][0].transcript;
            if (text && text.trim()) {
                processEdgeVoiceInput(text);
            }
        };
    }

    function getAppLanguage() {
        const bridge = window.PocketPaisaBridge;
        return (bridge ? bridge.getState().currentLang : (localStorage.getItem('web_lang') || 'en'));
    }

    function updateEdgeMicUI(active) {
        const micBtn = document.getElementById('edgePanelMicBtn');
        const wave = document.getElementById('edgeMicPulseWave');
        const instruction = document.getElementById('edgeVoiceInstruction');
        const isHi = getAppLanguage() === 'hi';

        if (active) {
            if (micBtn) micBtn.style.background = 'var(--accent-rose, #f43f5e)';
            if (wave) wave.style.display = 'block';
            if (instruction) {
                instruction.innerText = isHi ? 'सुन रहा हूँ... बोलें' : 'Listening... Speak now';
                instruction.style.color = 'var(--accent-rose, #f43f5e)';
            }
        } else {
            if (micBtn) micBtn.style.background = 'var(--accent-green, #10b981)';
            if (wave) wave.style.display = 'none';
            if (instruction) {
                instruction.style.color = '';
                resetVoiceInstruction();
            }
        }
    }

    function resetVoiceInstruction() {
        const instruction = document.getElementById('edgeVoiceInstruction');
        if (!instruction) return;
        const isHi = getAppLanguage() === 'hi';
        instruction.innerText = isHi 
            ? '💡 बोलें: "चाय ₹10 नकद" या "सैलरी 50000 बैंक"' 
            : '💡 Say: "Lunch 120 bank" or "Salary 5000 cash"';
    }

    function toggleEdgeVoice() {
        if (!edgeRecognition) {
            initEdgeSpeech();
        }
        if (!edgeRecognition) return;

        if (edgeIsListening) {
            edgeRecognition.stop();
        } else {
            edgeRecognition.lang = getAppLanguage() === 'hi' ? 'hi-IN' : 'en-US';
            try {
                edgeRecognition.start();
            } catch (e) {
                console.warn(e);
            }
        }
    }

    function parseEdgeVoiceTransaction(text) {
        const lowercaseText = text.toLowerCase().trim();
        
        // Find numbers matching amount
        const amountMatch = lowercaseText.match(/(\d+(?:\.\d+)?)/);
        if (!amountMatch) return null;
        const amount = parseFloat(amountMatch[1]);

        // Determine if income or expense
        let isIncome = false;
        const incomeWords = ["salary", "deposit", "income", "received", "credited", "कमाई", "सैलरी", "आय", "मिला", "ब्याज", "मुनाफा", "bonus", "जोड़ो"];
        for (let word of incomeWords) {
            if (lowercaseText.includes(word)) {
                isIncome = true;
                break;
            }
        }

        // Determine Account (cash vs bank vs credit)
        let account = 'bank';
        if (lowercaseText.includes('cash') || lowercaseText.includes('नकद') || lowercaseText.includes('कैश')) {
            account = 'cash';
        } else if (lowercaseText.includes('credit') || lowercaseText.includes('card') || lowercaseText.includes('कार्ड') || lowercaseText.includes('उधार')) {
            account = 'credit';
        }

        // Clean category name
        let category = text
            .replace(amountMatch[1], '')
            .replace(/(salary|deposit|income|received|credited|कमाई|सैलरी|आय|मिला|ब्याज|मुनाफा|bonus|cash|नकद|कैश|credit|card|कार्ड|उधार|जोड़ो|काटो|खर्च|रुपये|रुपया|rupees|rupee|rs|spent|spend|pay)/gi, '')
            .replace(/[\s\-\:\,\/\=\+]+/g, ' ')
            .trim();

        if (!category) {
            category = isIncome 
                ? (getAppLanguage() === 'hi' ? 'विविध आय' : 'Miscellaneous Income') 
                : (getAppLanguage() === 'hi' ? 'विविध खर्च' : 'Miscellaneous Expense');
        } else {
            category = category.charAt(0).toUpperCase() + category.slice(1);
        }

        return {
            type: isIncome ? 'income' : 'expense',
            amount: amount,
            category: category,
            account: account
        };
    }

    function processEdgeVoiceInput(text) {
        const parsed = parseEdgeVoiceTransaction(text);
        if (!parsed) {
            const instruction = document.getElementById('edgeVoiceInstruction');
            if (instruction) {
                const isHi = getAppLanguage() === 'hi';
                instruction.innerText = isHi ? '⚠️ राशि समझ नहीं आई' : '⚠️ Could not parse amount';
                instruction.style.color = 'var(--accent-rose, #f43f5e)';
                setTimeout(resetVoiceInstruction, 2500);
            }
            return;
        }

        const bridge = window.PocketPaisaBridge;
        let success = false;

        if (bridge && bridge.addTransaction) {
            success = bridge.addTransaction(parsed.type, parsed.amount, parsed.category, parsed.account);
        } else if (typeof window.addTransaction === 'function') {
            const amtInput = document.getElementById('amount');
            const catInput = document.getElementById('category');
            if (amtInput) amtInput.value = parsed.amount;
            if (catInput) catInput.value = parsed.category;
            window.addTransaction(parsed.type);
            success = true;
        }

        if (success !== false) {
            // Speak confirmation
            speakEdgeConfirmation(parsed);

            // Show recorded notification inside edge panel
            const toastEl = document.getElementById('edgePanelToast');
            const toastTextEl = document.getElementById('edgePanelToastText');
            if (toastEl && toastTextEl) {
                const cur = (bridge && bridge.getState().currentCurrency) || '₹';
                toastTextEl.innerText = `Voice Recorded: ${cur}${parsed.amount.toFixed(2)} - ${parsed.category}!`;
                toastEl.style.display = 'flex';
                
                // Keep panel open just briefly to show toast, then auto-close
                setTimeout(() => {
                    toastEl.style.display = 'none';
                    closeQuickPanel();
                }, 1000);
            } else {
                closeQuickPanel();
            }
        }
    }

    function speakEdgeConfirmation(tx) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const isHi = getAppLanguage() === 'hi';
            const action = tx.type === 'income' ? (isHi ? 'आय' : 'Income') : (isHi ? 'खर्च' : 'Expense');
            const acctLabel = tx.account === 'bank' ? (isHi ? 'बैंक' : 'Bank') : (tx.account === 'cash' ? (isHi ? 'कैश' : 'Cash') : (isHi ? 'कार्ड' : 'Card'));
            
            let sentence = isHi 
                ? `✅ ठीक है! मैंने आपके ${acctLabel} खाते में ${tx.category} के लिए ${tx.amount} रुपये का ${action} जोड़ दिया है।`
                : `✅ Done! Added ${tx.amount} to your ${acctLabel} for ${tx.category}.`;
                
            const utterance = new SpeechSynthesisUtterance(sentence);
            utterance.lang = isHi ? 'hi-IN' : 'en-US';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.startsWith(isHi ? 'hi' : 'en'));
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            window.speechSynthesis.speak(utterance);
        }
    }
    // --- END EDGE FLOATING OVERLAY QUICK VOICE ADD SYSTEM ---

    /**
     * Initialize Edge Overlay System
     */
    function init() {
        // Check permission & status
        if (state.enabled && state.permission === 'granted') {
            activateService();
        }

        // Onboarding prompt after splash screen completes
        setTimeout(() => {
            showOnboardToastIfNeeded();
        }, 2200);

        updateSettingsUI();
    }

    // Public API exposed under window.EdgeOverlayService
    window.EdgeOverlayService = {
        init: init,
        open: openQuickPanel,
        close: closeQuickPanel,
        setType: setType,
        quickFill: quickFill,
        submitTransaction: submitTransaction,
        switchSide: switchSide,
        requestPermission: showPermissionModal,
        grantPermission: grantPermission,
        denyPermission: denyPermission,
        dismissOnboarding: dismissOnboarding,
        toggleFromSettings: toggleFromSettings,
        syncWithApp: syncPanelWithApp,
        toggleVoice: toggleEdgeVoice,
        getState: () => ({ ...state })
    };

    // Auto-init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window, document);

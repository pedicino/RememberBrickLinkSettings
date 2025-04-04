// ==UserScript==
// @name         Remember BrickLink Settings
// @namespace    https://github.com/pedicino
// @version      2.2
// @description  Adds a settings wheel to save your BrickLink catalog preferences between sessions. Includes US-based defaults for shipping destination, seller location, and currency.
// @author       pedicino
// @match        https://www.bricklink.com/*
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    if (typeof GM_addStyle !== 'undefined') {
        GM_addStyle(`
            .blp-adv-search__form {
                width: calc(100% - 48px) !important;
                transition: none !important;
                max-width: 100% !important;
            }

            .blp-adv-search {
                width: calc(100% - 48px) !important;
                transition: none !important;
                box-sizing: border-box !important;
            }

            body .blp-header .blp-adv-search__form {
                width: calc(100% - 48px) !important;
            }

            #bl-preferences-placeholder {
                width: 40px !important;
                min-width: 40px !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                visibility: hidden !important;
            }

            .blp-icon-nav {
                min-width: 130px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: flex-end !important;
            }

            .blp-icon-nav__item-container {
                min-width: 40px !important;
            }
        `);
    } else {
        const injectCSS = () => {
            if (document.head) {
                const style = document.createElement('style');
                style.id = 'bl-preferences-style';
                style.textContent = `
                    .blp-adv-search__form {
                        width: calc(100% - 48px) !important;
                        transition: none !important;
                    }
                `;
                document.head.appendChild(style);
            } else {
                setTimeout(injectCSS, 5);
            }
        };
        injectCSS();
    }

    const defaultPrefs = {
        ss: "US", loc: "US", ca: "1", iconly: 0
    };
    const PREF_KEY = "BL_preferences";

    function savePrefs(prefsToSave) {
        try {
            const cleanPrefs = {};
            for (const key in prefsToSave) {
                if (prefsToSave[key] !== undefined) { cleanPrefs[key] = prefsToSave[key]; }
            }
            localStorage.setItem(PREF_KEY, JSON.stringify(cleanPrefs));
        } catch (e) { console.error("Error saving BL_preferences to localStorage:", e); }
    }

    function getPrefs() {
        let prefsFromStorage = {};
        let storedSuccessfully = false;
        let wasStorageEmpty = true;
        try {
            const stored = localStorage.getItem(PREF_KEY);
            if (stored) {
                wasStorageEmpty = false;
                prefsFromStorage = JSON.parse(stored);
                storedSuccessfully = true;
            }
        } catch (e) { console.error(`Error reading/parsing ${PREF_KEY}:`, e); localStorage.removeItem(PREF_KEY); }

        let effectivePrefs = {};
        for (const key in defaultPrefs) {
            if (prefsFromStorage.hasOwnProperty(key)) { effectivePrefs[key] = prefsFromStorage[key]; }
            else if (storedSuccessfully) { effectivePrefs[key] = undefined; }
            else { effectivePrefs[key] = defaultPrefs[key]; }
        }
        if (effectivePrefs.iconly === undefined) { effectivePrefs.iconly = defaultPrefs.iconly; }
        if (wasStorageEmpty || !storedSuccessfully) { savePrefs(effectivePrefs); }
        return effectivePrefs;
    }

    function buildOptionsObject(prefs) {
        const options = {};
        for (const key in prefs) {
             if (prefs[key] !== undefined && defaultPrefs.hasOwnProperty(key)) { options[key] = prefs[key]; }
        }
         options.iconly = prefs.iconly !== undefined ? prefs.iconly : defaultPrefs.iconly;
        return options;
    }

    function buildHashString(options) {
        const orderedOptions = {};
        const order = ['ss', 'loc', 'ca', 'iconly'];
        order.forEach(key => { if (options.hasOwnProperty(key)) { orderedOptions[key] = options[key]; } });
        for(const key in options) { if (!orderedOptions.hasOwnProperty(key)) { orderedOptions[key] = options[key]; } }
        if (Object.keys(orderedOptions).length === 0) { orderedOptions.iconly = defaultPrefs.iconly; }
        return "#T=S&O=" + JSON.stringify(orderedOptions);
    }

    const isCatalogPage = /\/v2\/catalog\/catalogitem\.page/i.test(window.location.pathname);

    if (isCatalogPage) {
        const prefsToEnforce = getPrefs();
        const desiredOptions = buildOptionsObject(prefsToEnforce);
        const desiredHash = buildHashString(desiredOptions);
        const currentHash = window.location.hash;
        const decodedHash = decodeURIComponent(currentHash);
        if (decodedHash !== desiredHash) {
            let needsRedirect = true;
             if (decodedHash.startsWith("#T=S&O=")) {
                 try {
                     const currentOptions = JSON.parse(decodedHash.substring(6));
                     const currentKeys = Object.keys(currentOptions).sort();
                     const desiredKeys = Object.keys(desiredOptions).sort();
                     if (currentKeys.length === desiredKeys.length && currentKeys.every((key, index) => key === desiredKeys[index])) {
                         let valuesMatch = true;
                         for (const key of currentKeys) { if (String(currentOptions[key]) !== String(desiredOptions[key])) { valuesMatch = false; break; } }
                         if (valuesMatch) needsRedirect = false;
                     }
                 } catch (e) { }
             }
            if (needsRedirect) {
                const baseUrl = window.location.href.split("#")[0];
                const newUrl = baseUrl + desiredHash;
                console.log(`%cEnforcing preferences via replace...`, "color: blue;");
                sessionStorage.setItem("bl_refreshing", "true");
                window.location.replace(newUrl);
            }
        }
    }

    function createPlaceholder() {
        if (document.getElementById('bl-preferences-placeholder') ||
            document.querySelector('.blp-icon-nav__item-container--preferences')) {
            return;
        }

        const iconNav = document.querySelector(".blp-icon-nav");
        if (!iconNav) return;

        const placeholder = document.createElement("div");
        placeholder.id = "bl-preferences-placeholder";
        placeholder.className = "blp-icon-nav__item-container";
        placeholder.innerHTML = `<div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;visibility:hidden;">
            <svg style="width:24px;height:24px;" viewBox="0 0 24 24">
                <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" fill="none" stroke="transparent" stroke-width="1.5"/>
            </svg>
        </div>`;

        const mb = iconNav.querySelector(".blp-icon-nav__item-container--more");
        if (mb) iconNav.insertBefore(placeholder, mb);
        else iconNav.appendChild(placeholder);
    }

    function createPreferencesUI() {
        const existingButton = document.querySelector('.blp-icon-nav__item-container--preferences');
        const existingPanel = document.getElementById('bl-preferences-panel');
        if (existingButton && existingPanel) { initializeCheckboxes(); return; }
        if (existingButton) existingButton.remove(); if (existingPanel) existingPanel.remove();

        const gearSvg = `<svg class="svg-icon" style="width: 1.5em; height: 1.5em;vertical-align: middle;overflow: hidden;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" fill="none" stroke="#000000" stroke-width="1.5" stroke-linejoin="round" />
</svg>`;
        const navButtonContainer = document.createElement("div");
        navButtonContainer.className = "blp-icon-nav__item-container blp-icon-nav__item-container--preferences";
        navButtonContainer.style.width = "40px";
        navButtonContainer.style.minWidth = "40px";

        const navButton = document.createElement("button");
        navButton.className = "blp-btn blp-icon-nav__item blp-icon-nav__item--preferences";
        navButton.setAttribute("aria-haspopup", "dialog");
        navButton.setAttribute("aria-expanded", "false");
        navButton.setAttribute("data-state", "closed");
        navButton.title = "Marketplace Preferences";
        navButton.style.cssText = "background: transparent; transition: all 0.2s; width: 40px;";
        navButton.addEventListener("mouseover", () => {
            const pathElement = iconDiv.querySelector('svg path');
            pathElement.setAttribute('stroke', '#0055AA');
        });
        navButton.addEventListener("mouseout", () => {
            const pathElement = iconDiv.querySelector('svg path');
            pathElement.setAttribute('stroke', '#000000');
        });

        const iconGroup = document.createElement("div");
        iconGroup.className = "blp-icon-nav__item-icon-notification-group";
        const iconNotification = document.createElement("span");
        iconNotification.className = "blp-icon-nav__item-notification blp-icon-nav__item-notification--hidden";
        const iconDiv = document.createElement("div");
        iconDiv.className = "blp-icon blp-icon--large";
        iconDiv.setAttribute("aria-hidden", "true");
        iconDiv.style.cssText = "background: transparent; display: flex; align-items: center; justify-content: center; transform: scale(1.3);";
        iconDiv.innerHTML = gearSvg;
        iconGroup.appendChild(iconNotification);
        iconGroup.appendChild(iconDiv);
        navButton.appendChild(iconGroup);
        navButtonContainer.appendChild(navButton);

        const placeholder = document.getElementById('bl-preferences-placeholder');
        if (placeholder) {
            placeholder.parentNode.replaceChild(navButtonContainer, placeholder);
        } else {
            const iconNav = document.querySelector(".blp-icon-nav");
            if (iconNav) {
                const mb = iconNav.querySelector(".blp-icon-nav__item-container--more");
                if (mb) iconNav.insertBefore(navButtonContainer, mb);
                else iconNav.appendChild(navButtonContainer);
            } else {
                const hr = document.querySelector(".blp-header__content");
                if (hr) {
                    navButtonContainer.style.cssText = "display:inline-block;margin-right:10px;width:40px;min-width:40px;";
                    navButton.style.padding = "10px";
                    const fc = hr.firstChild;
                    if(fc) hr.insertBefore(navButtonContainer, fc);
                    else hr.appendChild(navButtonContainer);
                } else {
                    console.error("Cannot find insert location");
                    return;
                }
            }
        }

        const panel = document.createElement("div"); panel.id = "bl-preferences-panel"; panel.style.cssText = "position: fixed; top: 60px; right: 10px; background: rgba(255,255,255,0.98); border: 1px solid #ccc; padding: 15px; z-index: 10001; font-size: 14px; font-family: Arial, sans-serif; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); display: none;";
        panel.innerHTML = `<div style="margin-bottom:10px; font-weight:bold; border-bottom:1px solid #eee; padding-bottom:8px;">Marketplace Preferences</div><label style="display:block; margin-bottom:8px;"><input type="checkbox" id="pref-ss" style="margin-right:5px;"> Shipping to USA</label><label style="display:block; margin-bottom:8px;"><input type="checkbox" id="pref-loc" style="margin-right:5px;"> Seller located in USA</label><label style="display:block; margin-bottom:12px;"><input type="checkbox" id="pref-ca" style="margin-right:5px;"> Seller accepts US dollar</label><button id="refreshPrefs" style="padding:6px 12px; background:#f8f8f8; border:1px solid #ddd; border-radius:4px; cursor:pointer; width:100%; text-align:center;">Apply & Refresh</button><div id="prefs-status" style="margin-top:8px; text-align:center; font-size:12px; min-height:1em;"></div>`;
        document.body.appendChild(panel);
        const ssCheckbox = panel.querySelector("#pref-ss"), locCheckbox = panel.querySelector("#pref-loc"), caCheckbox = panel.querySelector("#pref-ca"), refreshBtn = panel.querySelector("#refreshPrefs"), statusDiv = panel.querySelector("#prefs-status");
        let statusTimeout = null; function showStatus(msg, dur=2500, err=false) { if(statusTimeout) clearTimeout(statusTimeout); if(!statusDiv)return; statusDiv.textContent=msg; statusDiv.style.color=err?'red':'green'; if(dur>0){statusTimeout=setTimeout(()=>{if(statusDiv)statusDiv.textContent='';}, dur);} }
        navButton.addEventListener("click", (e) => { e.stopPropagation(); const disp=panel.style.display==="block"; panel.style.display=disp?"none":"block"; navButton.setAttribute("aria-expanded",!disp); navButton.setAttribute("data-state",disp?"closed":"open"); if(!disp){ initializeCheckboxes(); showStatus('',0); refreshBtn.disabled=false; refreshBtn.style.backgroundColor='#f8f8f8'; refreshBtn.textContent=isCatalogPage?"Apply & Refresh":"Save Preferences";} });
        document.addEventListener("click", (e) => { if (panel.style.display==="block" && !panel.contains(e.target) && !navButtonContainer.contains(e.target)) { panel.style.display="none"; navButton.setAttribute("aria-expanded","false"); navButton.setAttribute("data-state","closed"); } });
        function initializeCheckboxes() { if (!ssCheckbox || !refreshBtn || panel.style.display==='none') return; const p=getPrefs(); ssCheckbox.checked=(p.ss==="US"); locCheckbox.checked=(p.loc==="US"); caCheckbox.checked=(p.ca==="1"); refreshBtn.textContent=isCatalogPage?"Apply & Refresh":"Save Preferences"; }

        panel.querySelectorAll("input[type='checkbox']").forEach(input => {
            input.addEventListener("change", () => {
                let currentPanelPrefs = {
                    ss: ssCheckbox.checked ? "US" : undefined,
                    loc: locCheckbox.checked ? "US" : undefined,
                    ca: caCheckbox.checked ? "1" : undefined,
                    iconly: 0
                };
                savePrefs(currentPanelPrefs);
                showStatus('Preferences updated.', 1500);
                if (isCatalogPage) {
                    const optionsForHash = buildOptionsObject(currentPanelPrefs);
                    const newHash = buildHashString(optionsForHash);
                    history.replaceState(null, '', window.location.href.split("#")[0] + newHash);
                    console.log("Checkbox change updated hash to:", newHash);
                }
            });
        });

        if (refreshBtn) {
            refreshBtn.addEventListener("click", function(event) {
                event.preventDefault();
                event.stopPropagation();
                const button = this;

                let desiredPrefs = {
                    ss: ssCheckbox.checked ? "US" : undefined,
                    loc: locCheckbox.checked ? "US" : undefined,
                    ca: caCheckbox.checked ? "1" : undefined,
                    iconly: 0
                };
                savePrefs(desiredPrefs);

                button.disabled = true;
                showStatus('', 0);

                if (isCatalogPage) {
                    button.textContent = "Reloading...";
                    button.style.backgroundColor = "#e0e0e0";
                    console.log("Apply/Refresh clicked. Hash updated by checkbox listener. Attempting reload...");

                    setTimeout(() => {
                        try {
                            console.log(`%cExecuting window.location.reload()`, "color: green; font-weight: bold;");
                            window.location.reload();
                        } catch (err) {
                            console.error("Error during window.location.reload():", err);
                            showStatus('Error reloading page.', 3000, true);
                            button.textContent = "Apply & Refresh";
                            button.style.backgroundColor = "#f8f8f8";
                            button.disabled = false;
                        }
                    }, 50);

                } else {
                    button.textContent = "✓ Saved!";
                    button.style.backgroundColor = "#d4f8d4";
                    showStatus('Preferences saved!', 1500);
                    setTimeout(() => {
                        if (panel.style.display === 'block') {
                            button.textContent = "Save Preferences";
                            button.style.backgroundColor = "#f8f8f8";
                            button.disabled = false;
                        }
                    }, 1500);
                }
            });
        } else { console.error("Could not find refresh button."); }

        initializeCheckboxes();
    }

    const observeDOM = (function(){const M=window.MutationObserver||window.WebKitMutationObserver; return function(o,c){if(!o||o.nodeType!==1)return; if(M){const m=new M(c); m.observe(o,{childList:true,subtree:true}); return m;}else{o.addEventListener('DOMNodeInserted',c,false);o.addEventListener('DOMNodeRemoved',c,false);return null;}}})();

    function tryEarlyPlaceholder() {
        if (document.body) {
            createPlaceholder();
        } else {
            setTimeout(tryEarlyPlaceholder, 5);
        }
    }
    tryEarlyPlaceholder();

    function checkAndCreateUI() {
        createPlaceholder();

        const h=document.querySelector(".blp-header")||document.body;
        const b=document.querySelector(".blp-icon-nav__item-container--preferences");
        const p=document.getElementById("bl-preferences-panel");
        if(h&&(!b||!p)){createPreferencesUI();}else if(h&&b&&p){
            if(p.style.display==='block'){initializeCheckboxes();}
        }
    }

    function initialSetup() {
        if(document.body){
            createPlaceholder();

            setTimeout(() => {
                const forms = document.querySelectorAll('.blp-adv-search__form');
                for (const form of forms) {
                    form.style.display = 'none';
                    void form.offsetWidth;
                    form.style.display = '';
                }
            }, 0);

            if(sessionStorage.getItem("bl_refreshing")==="true"){
                sessionStorage.removeItem("bl_refreshing");
                setTimeout(checkAndCreateUI, 50);
            } else {
                setTimeout(checkAndCreateUI, 0);
            }

            observeDOM(document.body, function(m){
                let pc=false;
                for(const mut of m){
                    if(mut.type==='childList'){
                        createPlaceholder();

                        for (const node of mut.addedNodes) {
                            if (node.nodeType === 1 &&
                                (node.classList?.contains('blp-adv-search__form') ||
                                 node.querySelector?.('.blp-adv-search__form'))) {
                                pc = true;
                                break;
                            }
                        }

                        if(mut.target.closest('.blp-header')){pc=true;break;}
                        for(const n of mut.removedNodes){
                            if(n.nodeType===1){
                                if(n.querySelector?.('.blp-icon-nav__item-container--preferences') ||
                                   n.id==='bl-preferences-panel' ||
                                   n.classList?.contains('blp-icon-nav__item-container--preferences')){
                                    pc=true;break;
                                }
                            }
                        }
                        if(pc)break;
                    }
                }
                if(pc){setTimeout(checkAndCreateUI, 0);}
            });
        } else {
            setTimeout(initialSetup, 5);
        }
    }

    if(document.readyState==="loading"){
        document.addEventListener("DOMContentLoaded", initialSetup);
    } else {
        initialSetup();
    }
})();
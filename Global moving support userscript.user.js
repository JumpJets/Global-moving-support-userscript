// ==UserScript==
// @name         Global moving support userscript
// @namespace    https://github.com/JumpJets/Global-moving-support-userscript
// @version      1.1
// @description  Configure mouse keys, speed multipliers, e.t.c. in script.
// @author       XCanG
// @match        *://*/*
// @grant        none
// ==/UserScript==

"use strict";
var hotk = 2, // Toggle hotkey. Mouse keys: LMB: 0, MMB: 1, RMB: 2, HistFwd: 4, HistBck: 3
	spdm = 1.5, // Speed multiplier (per pixel). Use negative value if you want to invert moving.
	allowtextselection = true, // Allow text selection.
	alterm = true, // Enable alternative key mode. This mode use key for LMB: RMB, for anything else include RMB: LMB. Basically it modify your speed. You may scroll faster or slower depend on alter speed multiplier.
	alterspdm = 5, // Additional speed multiplier. If > 1 then increese speed, if < 1 then decreese.
	alterk = hotk === 0 ? 2 : 1,
	inertiam = true, // Enable Inertia mode. Basically it allow you to continue scrolling after you release button in case your last scroll was fast.
	inertiaslow = .75, // Basically friction of inertia (rate how faster it will stop or negative acceleration). Should be > 0

	// Don't touch variables below, they are unconfigurable.
	fsm = false,
	fsprevent = false,
	fsmsleave = false,
	fstg,
	fsy,
	fsx,
	fsdy,
	fsdx,
	fsrelym,
	fsrelxm,
	fssposy,
	fssposx,
	scry,
	scrx,
	fsint,
	fsidy,
	fsidx,
	fsfrt;

const fast_scroll_move = (e, {_tg = undefined, _up = false} = {}) => {
	e.preventDefault();

	fstg = _tg || e.target;
	scry = 0;
	scrx = 0;
	let vs = false,
		hs = false;

	if (fstg.scrollHeight > fstg.clientHeight) vs = true;
	if (fstg.scrollWidth > fstg.clientWidth) hs = true;
	if (!vs && !hs && fstg !== document.documentElement) {
		return fast_scroll_move(e, {_tg: fstg.parentElement, _up: _up});
	} else if (!vs && !hs) {
		return false;
	}

	if (!_up) {
		fsdy = e.clientY - fsy;
		fsdx = e.clientX - fsx;
		fsy = e.clientY;
		fsx = e.clientX;
	}
	fsrelym = fstg.scrollHeight / fstg.clientHeight;
	fsrelxm = fstg.scrollWidth / fstg.clientWidth;
	vs ? fssposy = fstg.scrollTop / (fstg.scrollHeight - fstg.clientHeight) : fsdy < 0 ? fssposy = 0 : fssposy = 1;
	hs ? fssposx = fstg.scrollLeft / (fstg.scrollWidth - fstg.clientWidth) : fsdx < 0 ? fssposx = 0 : fssposx = 1;

	if (alterm && ((e.buttons & alterk) === alterk)) {
		scry = Math.round(spdm * alterspdm * fsrelym * fsdy);
		scrx = Math.round(spdm * alterspdm * fsrelxm * fsdx);
	} else {
		scry = Math.round(spdm * fsrelym * fsdy);
		scrx = Math.round(spdm * fsrelxm * fsdx);
	}
	if ((vs || hs) && (scry > 2 || scry < -2 || scrx > 2 || scrx < -2)) fsprevent = true;

	fstg.scrollBy(scrx, scry);
	if (fstg !== document.documentElement && (fssposy === 0 && scry < 0 || fssposx === 0 && scrx < 0 || fssposy === 1 && scry > 0 || fssposx === 1 && scrx > 0)) fast_scroll_move(e, {_tg: fstg.parentElement, _up: true});
};

const fast_scroll = (e) => {
	if (allowtextselection && (e.button && e.button === 0 || e.which && e.which === 1) && (!e.target.children || Array.from(e.target.children).filter(el => el.tagName !== "BR").length === 0 && Array.from(e.target.childNodes).map(el => el.nodeType).includes(Node.TEXT_NODE))) return false;
	if (fsm && (e.buttons & 1) === 1) e.preventDefault();

	if (e.button && e.button === hotk || e.which && e.which === (hotk + 1)) {
		fsm = true;
		fsy = e.clientY;
		fsx = e.clientX;
		fsdy = 0;
		fsdx = 0;
		scry = 0;
		scrx = 0;
		if ((e.button && e.button === 0 || e.which && e.which === 1) || (e.button && e.button === 1 || e.which && e.which === 2)) e.preventDefault();

		document.addEventListener("mousemove", fast_scroll_move, false);
		if (inertiam && fsint) clearInterval(fsint);
	}
};

const fast_scroll_stop = (e) => {
	if (e.button && e.button === hotk || e.which && e.which === (hotk + 1)) {
		if (fsm) {
			if (e.button && e.button === 1 || e.which && e.which === 2) {
				e.preventDefault();
				fsprevent = false;
				fsm = false;
			} else if (e.button && e.button !== 2 || e.which && e.which !== 3) {
				if (fsprevent) {
					e.preventDefault();
					fsprevent = false;
				}
				fsm = false;
			}

			document.removeEventListener("mousemove", fast_scroll_move);
			fsx = undefined;
			fsy = undefined;

			if (inertiam) {
				fsidy = scry;
				fsidx = scrx;

				fsint = setInterval(() => {
					if ((fsidy > -.5 && fsidy < .5) && (fsidx > -.5 && fsidx < .5)) clearInterval(fsint);

					fsidy = fsidy - fsidy * inertiaslow / fsfrt;
					fsidx = fsidx - fsidx * inertiaslow / fsfrt;

					fstg.scrollBy(Math.round(fsidx), Math.round(fsidy));
				}, fsfrt);
			}
		}
	}
};

const fast_scroll_preventmenu = (e) => {
	if (fsm && fsprevent && e.button !== alterk) {
		e.preventDefault();
		fsprevent = false;
		fsm = false;
	} else if (fsm && alterm && e.button === alterk) {
		e.preventDefault();
	}
};

const fast_scroll_leave = (e) => {
	if (fsm) fsmsleave = true;
}

const fast_scroll_enter = (e) => {
	if (fsm && fsmsleave && !(e.button && e.button === hotk || e.which && e.which === (hotk + 1))) {
		document.removeEventListener("mousemove", fast_scroll_move);
		fsx = undefined;
		fsy = undefined;
		fsprevent = false;
		fsm = false;
	}
}

const getFPS = () =>
	new Promise(resolve =>
		requestAnimationFrame(t1 =>
			requestAnimationFrame(t2 => resolve(1000 / (t2 - t1)))
		)
	)

document.addEventListener("mousedown", fast_scroll, false);
document.addEventListener("mouseup", fast_scroll_stop, false);
if (hotk === 2 || (hotk === 0 && alterm)) document.addEventListener("contextmenu", fast_scroll_preventmenu, false);
document.addEventListener("mouseleave", fast_scroll_leave, false);
document.addEventListener("mouseenter", fast_scroll_enter, false);
window.onload = () => getFPS().then(fps => { fsfrt = 1000 / fps });

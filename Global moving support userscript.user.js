// ==UserScript==
// @name         Global moving support userscript
// @namespace    https://github.com/JumpJets/Global-moving-support-userscript
// @version      2.0
// @description  Configure mouse keys, speed multipliers, e.t.c. in script.
// @author       XCanG
// @match        *://*/*
// @grant        none
// ==/UserScript==

(() => {
	"use strict";

	//? Configure variables below:
	let us_hotkey = 2, //* Toggle hotkey. Mouse keys: LMB: 1, RMB: 2, MMB: 4, HistoryFwd: 16, HistBck: 8
		us_speed_multiplier = 1.5, //* Speed multiplier (per pixel). Use negative value if you want to inverse scrolling direction.
		us_allow_text_selection = true, //* Allow text selection when hotkey is LMB.
		us_use_alternative_key = true, //* Enable alternative key mode. This mode allow you to hold another key (if your main key is LMB, then alternative key is RMB, in other cases it LMB) to further modify your scrolling speed. It can be either faster (if multiplier > 1) or slower (if < 1).
		us_alternative_key_speed_multiplier = 5, //* Alternative mode speed multiplier. If > 1 then increase speed, if < 1 then decrease.
		us_alternative_hotkey = us_hotkey === 1 ? 2 : 1,
		us_inertia_mode = false, //* Enable inertia mode. Basically it allow you to continue scrolling after you release button in case your last scroll was fast. Similar functionality have any touch devices (mobile, tablet, e.t.c.).
		us_inertia_friction = 1.75, //* Friction/negative acceleration of inertia. Smaller value will make inertia longer and further and vice versa. Should be > 0.

		//! Don't touch variables below, they are unconfigurable.
		us_moved = false, // True when mouse moved after hotkey was pressed
		us_prevent_contextmenu = false, // Prevent context menu to show, it only work when RMB is scroll button and on mouseup you need to prevent menu from showing
		us_event_mouse_leave = false, // True when mouse leave viewport
		us_target, // Current DOM node where scroll happens
		us_y = 0, // Coordinates
		us_x = 0,
		us_dy = 0, // Delta coordinates (for scroll position and acceleration on mouseup)
		us_dx = 0,
		us_relative_y_multiplier = 0, // A multiplier based on element total height / width divided to viewport height / width
		us_relative_x_multiplier = 0,
		us_scroll_pos_y = 0, // Scroll position (state) of element in either direction
		us_scroll_pos_x = 0,
		us_scrollBy_y = 0, // Variables for target.scrollBy()
		us_scrollBy_x = 0,
		us_interval, // Store interval for clearing when inertia mode is used
		us_inertia_dy = 0,
		us_inertia_dx = 0,
		us_tickrate = 16.67, // Tickrate (ms, 1 / fps)
		us_self_closed_tags = ["AREA", "BASE", "BR", "COL", "EMBED", "HR", "IMG", "INPUT", "LINK", "META", "PARAM", "SOURCE", "TRACK", "WBR"];

	const scroll_mousemove = (e, { _tg = undefined, _up = false } = {}) => {
		/* Event on mousemove, main scrolling function
		* _tg = parent target when navigate up in DOM
		* _up = value to determine that previous coordinates need to be reused from child element */

		e?.preventDefault?.();

		// console.debug("scroll mousemove, target?:", _tg, "up:", _up);

		if ((e?.buttons & us_hotkey) !== us_hotkey) document.removeEventListener("mousemove", scroll_mousemove, { capture: true });

		us_target = _tg ?? e?.target;
		us_scrollBy_y = 0;
		us_scrollBy_x = 0;

		let vertical_scroll = false, // Variables to detect if element is scrollable in either direction
			horizontal_scroll = false;

		// scroll size = total element size, client size = only visible size. if smaller, then there is scroll in that direction
		if ((us_target?.scrollHeight - us_target?.clientHeight > 6) && us_target?.clientHeight !== 0) vertical_scroll = true;
		if ((us_target?.scrollWidth - us_target?.clientWidth > 6) && us_target?.clientHeight !== 0) horizontal_scroll = true;

		// If there is no scroll, then we reinitialize move event with parent as target until we hit <html></html> node
		if (!vertical_scroll && !horizontal_scroll && us_target !== document.documentElement) {
			return scroll_mousemove(e, { _tg: us_target?.parentElement, _up: _up });
		} else if (!vertical_scroll && !horizontal_scroll) {
			return false;
		}

		// Set initial position variables, for any parent element with scroll they will be reused
		if (!_up) {
			us_dy = (e?.clientY ?? 0) - us_y;
			us_dx = (e?.clientX ?? 0) - us_x;
			us_y = e?.clientY ?? 0;
			us_x = e?.clientX ?? 0;
		}

		// Set directional multipliers, the more to scroll, the faster scrolling step will be
		us_relative_y_multiplier = us_target?.scrollHeight / us_target?.clientHeight || 1;
		us_relative_x_multiplier = us_target?.scrollWidth / us_target?.clientWidth || 1;

		// For each direction set scroll position of current element if it scrollable, otherwise set start / end marker, so that we do not try to scroll element later
		vertical_scroll ? us_scroll_pos_y = us_target?.scrollTop / (us_target?.scrollHeight - us_target?.clientHeight) || 0 : us_dy < 0 ? us_scroll_pos_y = 0 : us_scroll_pos_y = 1;
		horizontal_scroll ? us_scroll_pos_x = us_target?.scrollLeft / (us_target?.scrollWidth - us_target?.clientWidth) || 0 : us_dx < 0 ? us_scroll_pos_x = 0 : us_scroll_pos_x = 1;

		// Calculate scrollBy value based on multiplier * relative multiplier * delta position (with direction)
		// When alternative hotkey is pressed also multiplied to alternative key speed multiplier
		if (us_use_alternative_key && ((e?.buttons & us_alternative_hotkey) === us_alternative_hotkey)) {
			us_scrollBy_y = Math.round(us_speed_multiplier * us_alternative_key_speed_multiplier * us_relative_y_multiplier * us_dy);
			us_scrollBy_x = Math.round(us_speed_multiplier * us_alternative_key_speed_multiplier * us_relative_x_multiplier * us_dx);
		} else {
			us_scrollBy_y = Math.round(us_speed_multiplier * us_relative_y_multiplier * us_dy);
			us_scrollBy_x = Math.round(us_speed_multiplier * us_relative_x_multiplier * us_dx);
		}

		// If scrolled enough, prevent RMB menu to open, otherwise on mouseup contextmenu wont be prevented
		if ((vertical_scroll || horizontal_scroll) && (us_scrollBy_y > 2 || us_scrollBy_y < -2 || us_scrollBy_x > 2 || us_scrollBy_x < -2)) us_prevent_contextmenu = true;

		// Initialize scrolling
		us_target?.scrollBy?.(us_scrollBy_x, us_scrollBy_y);

		// If target is not <html></html> and scroll reached start / end, reinitialize function for parent element and set flag _up = true to reuse current positions
		if (
			us_target !== document.documentElement
			&& (
				us_scroll_pos_y === 0 && us_scrollBy_y < 0
				|| us_scroll_pos_x === 0 && us_scrollBy_x < 0
				|| us_scroll_pos_y === 1 && us_scrollBy_y > 0
				|| us_scroll_pos_x === 1 && us_scrollBy_x > 0
			)
			&& us_target?.parentElement
		) scroll_mousemove(e, { _tg: us_target?.parentElement, _up: true });
	}

	const scroll_mousedown = (e) => {
		/* Statup event */

		// Check if text selection is allowed and LMB is pressed while target have text nodes
		if (
			us_allow_text_selection
			&& ((e?.buttons & 1) === 1)
			&& (
				Array.from(e?.target?.children ?? []).filter(el => !us_self_closed_tags.includes(el?.tagName)).length === 0 // If node is simple node without nested elements
				&& Array.from(e?.target?.childNodes ?? []).map(el => el.nodeType).includes(Node.TEXT_NODE)
			)
		) return false;

		if (us_moved && (e?.buttons & 1) === 1) e.preventDefault();

		// console.debug("scroll mousedown", e.buttons);

		// Create mousemove event
		if ((e?.buttons & us_hotkey) === us_hotkey) {
			us_moved = true;
			us_event_mouse_leave = false;

			us_y = e?.clientY ?? 0;
			us_x = e?.clientX ?? 0;
			us_dy = 0;
			us_dx = 0;
			us_scrollBy_y = 0;
			us_scrollBy_x = 0;

			if (((e?.buttons & 1) === 1) || ((e?.buttons & 4) === 4)) e.preventDefault();

			document.addEventListener("mousemove", scroll_mousemove, { capture: true });

			// Clear inertia interval if it used and still active after previous release while new event was created
			if (us_inertia_mode && us_interval) clearInterval(us_interval);
		}
	}

	const scroll_mouseup = (e) => {
		/* Stop event
		* NOTE: e.buttons = current state of pressed mouse buttons AFTER event fired
		* e.button = mouse button, that being unpressed BEFORE event fired */

		// console.debug("scroll mouseup", us_moved);

		if (us_moved && (e?.buttons & us_hotkey) !== us_hotkey) {
			// Prevent autoscroll from MMB (1) and contextmenu from other buttons when RMB is on hold (2, only prevent if scrolled)
			if (e?.button === 1 || (e?.button !== 2 && us_prevent_contextmenu)) {
				e.preventDefault();
				us_prevent_contextmenu = false;
			}

			document.removeEventListener("mousemove", scroll_mousemove, { capture: true });
			setTimeout(() => { us_moved = false }, 10);

			us_x = 0;
			us_y = 0;

			// If inertia mode is enabled, continue scroll until threshold was reached (< .5 delta speed)
			if (us_inertia_mode) {
				us_inertia_dy = us_scrollBy_y;
				us_inertia_dx = us_scrollBy_x;

				us_interval = setInterval(() => {
					// Threshold
					if ((us_inertia_dy > -.5 && us_inertia_dy < .5) && (us_inertia_dx > -.5 && us_inertia_dx < .5)) clearInterval(us_interval);

					us_inertia_dy -= us_inertia_dy * us_inertia_friction / us_tickrate;
					us_inertia_dx -= us_inertia_dx * us_inertia_friction / us_tickrate;

					us_target.scrollBy(Math.round(us_inertia_dx), Math.round(us_inertia_dy));
				}, us_tickrate);
			}
		}
	}

	const scroll_prevent_contextmenu = (e) => {
		/* Supplementary event when scroll hotkey is RMB and it trigger this event */

		if (us_moved && us_prevent_contextmenu && ((e?.buttons & us_alternative_hotkey) !== us_alternative_hotkey)) {
			// console.debug("scroll prevent contextmenu during fast scroll w/RMB");

			e.preventDefault();

			us_prevent_contextmenu = false;
			us_moved = false;

		} else if (us_moved && us_use_alternative_key && ((e?.buttons & us_alternative_hotkey) === us_alternative_hotkey)) {
			// console.debug("scroll prevent contextmenu during RMB scroll");

			e.preventDefault();
		}
	}

	const scroll_mouseleave = (e) => {
		/* Event when mouse leave viewport */

		if (us_moved && !us_event_mouse_leave) {
			// console.debug("scroll mouseleave");

			us_event_mouse_leave = true;
		}
	}

	const scroll_mouseenter = (e) => {
		/* Event when mouse back into viewport and if buttons still pressed, then keep mousemove event */

		const button =
			us_hotkey === 1 ? 0
				: us_hotkey === 2 ? 2
					: us_hotkey === 4 ? 1
						: us_hotkey === 8 ? 3
							: 4;

		if (us_moved && us_event_mouse_leave && e?.button !== button) {
			// console.debug("scroll mouseenter");

			document.removeEventListener("mousemove", scroll_mousemove, { capture: true });

			us_x = 0;
			us_y = 0;

			us_prevent_contextmenu = false;
			us_event_mouse_leave = false;
			us_moved = false;
		}
	}

	const set_tickrate = async () => {
		/* Detecting tickrate (1 / FPS) */

		us_tickrate = +(
			Math.round(
				await new Promise(resolve =>
					requestAnimationFrame(t1 =>
						requestAnimationFrame(t2 => resolve(t2 - t1))
					)
				)
				+ "e+2")
			+ "e-2")
	}

	// Adding events on page, e.persisted indicate page loaded from cache
	window.addEventListener("pageshow", async (e) => {
		await set_tickrate();

		document.addEventListener("mousedown", scroll_mousedown, { capture: true });
		document.addEventListener("mouseup", scroll_mouseup, { capture: true });
		if (us_hotkey === 2 || (us_hotkey === 1 && us_use_alternative_key)) document.addEventListener("contextmenu", scroll_prevent_contextmenu, { capture: false });
		document.addEventListener("mouseleave", scroll_mouseleave, { capture: false });
		document.addEventListener("mouseenter", scroll_mouseenter, { capture: false });
	});

	window.addEventListener("pagehide", (e) => {
		document.removeEventListener("mousedown", scroll_mousedown);
		document.removeEventListener("mouseup", scroll_mouseup);
		document.removeEventListener("mouseleave", scroll_mouseleave);
		document.removeEventListener("mouseenter", scroll_mouseenter);
		if (us_hotkey === 2 || (us_hotkey === 1 && us_use_alternative_key)) document.removeEventListener("contextmenu", scroll_prevent_contextmenu);
	});
})();

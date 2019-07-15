# Global-moving-support-userscript
Configure mouse keys, speed multipliers, e.t.c. in script.

# Live example
Try this userscript on this codepen page: https://codepen.io/XCanG/pen/pXmdPd

# What does this script do?
This script allow you to use your mouse keys to scroll on page. No more need to move your mouse over scrollbar and drag it. No more issues with horizontal scrollbar on Chrome (when it hiding and not appearing).

All what you need is simply click and hold any mouse hotkey (default RMB) to start scrolling. To stop simply release mouse hotkey. You still will be able to select text (LMB) and open menu (RMB).

Script also have additional modes:

* **Alternative mode** allow you to hold another key (if your main key is LMB, then alternative key is RMB, in other cases it LMB) to further modify your scrolling speed. It can be eighter faster (if multiplier > 1) or slower (if < 1).
* **Inertia mode** allow you to scroll on release. Similar functionality have any touch devices (mobile, tablet, e.t.c.). You can modify friction/negative acceleration in settings variables.
* **Allow text selection** used as separate option. It enabled by default, but you may disable it if you need.

*Note: if you want to inverse scrolling direction, then simply use negative speed multiplier (e.g. negative default: `-1.5`).*

# Suggestion and bug reports
If you want to suggest feature or report bugs, feel free to open issue or eighter send commit/pull request.

# License
MIT

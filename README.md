# Global-moving-support-userscript
Configure mouse keys, speed multipliers, e.t.c. in script.

You need addon in your browser such as **Tampermonkey** to use it.

# Live example
Try this userscript on this codepen page: https://codepen.io/XCanG/pen/pXmdPd

# What does this script do?
This script allow you to use your mouse keys to scroll on page. No more need to move your mouse over scrollbar and drag it. No more issues with horizontal scrollbar on Chrome (when it hiding and not appearing).

All what you need is simply click and hold any mouse hotkey (default RMB) to start scrolling. To stop simply release mouse hotkey. You still will be able to select text (LMB) and open menu (RMB).

# Settings

| Variable name | Description | Values | Default |
| ------------- | ----------- | ------ | ------- |
| **hotk** | Toggle hotkey | LMB: 0, MMB: 1, RMB: 2, HistFwd: 4, HistBck: 3 | 2 |
| **spdm** | Speed multiplier (per pixel). Use negative value if you want to inverse scrolling direction. | ±inf | 1.5 |
| **allowtextselection** | Allow text selection when hotkey is LMB. | true/false | true |
| **alterm** | Enable alternative key mode. This mode allow you to hold another key (if your main key is LMB, then alternative key is RMB, in other cases it LMB) to further modify your scrolling speed. It can be eighter faster (if multiplier > 1) or slower (if < 1). | true/false | true |
| **alterspdm** | Alternative mode speed multiplier. | ±inf | 5 |
| **inertiam** | Enable inertia mode. Basically it allow you to continue scrolling after you release button in case your last scroll was fast. Similar functionality have any touch devices (mobile, tablet, e.t.c.). | true/false | true |
| **inertiaslow** | Friction/negative acceleration of inertia. Smaller value will make inertia longer and further and vice versa. | 0 - +inf | 1.75 |

# FAQ
### Why no auto-scroll on MMB? Or what the difference?
| Auto-scroll | This userscript |
| ----------- | --------------- |
| Clicking MMB just activate Auto-scroll mode | Clicking hotkey prepare to use scroll, but if no movement is made it cancel and you can open menu on RMB or navigate via Forward/Backward history buttons or even activate MMB Auto-scroll |
| Point of creating auto-scroll have ±12px around before it start scrolling | You can move mouse even on 1px to start scrolling |
| To achieve confortable speed you need to move mouse to proper distance, while in the process scrolling will be accelerated | Scrolling speed is fixed, however with alternative key you can change it to faster or slower rate |
| After you setup correct speed you may leave it as it is and forget | You will need to move your mouse manually by hand and speed affected only by you |
| To cancel you need to click MMB again or the whole time hold MMB | Just release hotkey button to cancel |

Overall time for shorter scroll smaller for userscript. To human mind will be easier to work with fixed scrolling speed, as mouse wheel do, however mouse wheel typically slower when we need. You still may use MMB in both cases if you want to automatically scrolling pages.

# Suggestion and bug reports
If you want to suggest feature or report bugs, feel free to open issue or eighter send commit/pull request.

# License
MIT

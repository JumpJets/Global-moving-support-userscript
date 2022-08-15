# Global-moving-support-userscript
Configure mouse keys, speed multipliers, e.t.c. in script.

You need addon in your browser such as **Tampermonkey** to use it.

# Live example
Try this userscript on this codepen page: https://codepen.io/XCanG/pen/pXmdPd

# What does this script do?
This script allow you to use your mouse keys to scroll on page. No more need to move your mouse over scrollbar and drag it. No more issues with horizontal scrollbar on Chrome _(when it hiding and not appearing)_.

All what you need is simply click and hold any mouse hotkey (default RMB) to start scrolling. To stop, simply release mouse hotkey. You still will be able to select text (LMB) and open context menu (RMB).

# Settings

| Variable name | Description | Values | Default |
| ------------- | ----------- | ------ | ------- |
| **hotkey** | Toggle hotkey | LMB: `1`, RMB: `2`, MMB: `4`, HistoryFwd: `16`, HistBck: `8` | `2` |
| **speed_multiplier** | Speed multiplier (per pixel). Use negative value if you want to inverse scrolling direction. | `±inf` | `1.5` |
| **allow_text_selection** | Allow text selection when hotkey is LMB. | `true`/`false` | `true` |
| **use_alternative_key** | Enable alternative key mode. This mode allow you to hold another key (if your main key is LMB, then alternative key is RMB, in other cases it LMB) to further modify your scrolling speed. It can be either faster (if multiplier > 1) or slower (if < 1). | `true`/`false` | `true` |
| **alternative_key_speed_multiplier** | Alternative mode speed multiplier. If > 1 then increase speed, if < 1 then decrease. | `±inf` | `5` |
| **inertia_mode** | Enable inertia mode. Basically it allow you to continue scrolling after you release button in case your last scroll was fast. Similar functionality have any touch devices (mobile, tablet, e.t.c.). | `true`/`false` | `false` |
| **inertia_friction** | Friction/negative acceleration of inertia. Smaller value will make inertia longer and further and vice versa. | `0` - `+inf` | `1.75` |

# FAQ
### Why no auto-scroll on MMB? Or what the difference?
| Auto-scroll | This userscript |
| ----------- | --------------- |
| Clicking MMB just activate Auto-scroll mode | Clicking hotkey prepare to use scroll, but if no movement is made, it cancel scrolling and you open menu on RMB instead or navigate via Forward/Backward history buttons or even activate MMB Auto-scroll |
| Auto-scroll create ±12px area around clicked position and you need yo move mouse beyond it to start scrolling | You can move mouse even on 1px to start scrolling |
| To achieve confortable speed you need to move mouse to proper distance, while in the process scrolling will be accelerated | Scrolling speed is fixed, however with alternative key you can change it to faster or slower rate |
| After you setup correct speed you may preserve it (cruise effect) | You will need to move your mouse manually by hand and speed affected only by you |
| To cancel you need to click MMB again or hold MMB whole time | Just release hotkey button to cancel |

Overall time for shorter scrolls smaller for userscript. To human mind will be easier to work with fixed scrolling speed, as mouse wheel do, however mouse wheel typically slower, than speed we need. You still may use MMB in both cases if you want to scroll pages at constant speed (cruise effect).

# Suggestion and bug reports
If you want to suggest feature or report bugs, feel free to open issue or either send commit/pull request.

# License
MIT

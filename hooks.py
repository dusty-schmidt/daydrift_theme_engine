"""Daydrift Theme Engine — Framework lifecycle hooks."""

import json
import logging
from pathlib import Path

logger = logging.getLogger("daydrift_theme_engine")

# Marker file path (outside plugin dir so it survives uninstall)
_CLEANUP_MARKER = Path("/a0/usr/plugins/.daydrift_cleanup")

def install():
    """Called by A0 framework after plugin is placed in usr/plugins/.

    Registers the WebUI path for serving the theme's static files.
    The plugin already works without this hook because the framework
    auto-serves webui/ as a static directory, but having the hook
    here makes lifecycle explicit for the plugin hub.
    """
    logger.info("daydrift_theme_engine: installed")


def uninstall():
    """Called by A0 framework before the plugin directory is deleted.

    Creates a cleanup marker so the theme's frontend JS can restore
    the user's previous darkMode setting on next page load.

    NOTE: The frontend JS checks for this marker on init. If found,
    it restores the previous darkMode value from localStorage and
    removes the daydriftTheme.* keys. The marker is then deleted.

    If the page doesn't reload between uninstall and the next visit,
    darkMode may persist. In that case, the user can toggle it manually
    from Preferences or clear localStorage for the A0 origin.
    """
    try:
        _CLEANUP_MARKER.write_text(json.dumps({
            "action": "restore_previous_darkmode",
            "keys": ["darkMode", "daydriftTheme.userId", "daydriftTheme.previousDarkMode"]
        }))
        logger.info("daydrift_theme_engine: wrote cleanup marker")
    except Exception as e:
        logger.warning("daydrift_theme_engine: could not write cleanup marker: %s", e)

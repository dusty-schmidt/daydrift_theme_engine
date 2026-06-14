from pathlib import Path
import re

root = Path("/a0/usr/plugins/daydrift_theme_engine")

# --- 1. Extract warningText constant ---
phases_path = root / "webui/daydrift-phases.mjs"
phases = phases_path.read_text()

if "const WARNING_TEXT = " in phases:
    print("WARNING_TEXT already extracted")
else:
    phases = phases.replace(
        "// Keep this file data-focused: the engine imports these values and handles\n// interpolation, daily drift, and contrast/readability enforcement.",
        "// Keep this file data-focused: the engine imports these values and handles\n// interpolation, daily drift, and contrast/readability enforcement.\n\n// Warning text color \u2014 constant across all phases (warm amber).\nconst WARNING_TEXT = '#d7a85f';",
    )
    count = phases.count("warningText: '#d7a85f'")
    phases = phases.replace("warningText: '#d7a85f'", "warningText: WARNING_TEXT")
    phases_path.write_text(phases)
    print(f"Extracted WARNING_TEXT constant, replaced {count} inline occurrences")

# --- 2. Resolve messageText dual-list confusion ---
engine_path = root / "webui/daydrift-engine.mjs"
engine = engine_path.read_text()

# Remove messageText from PALETTE_KEYS since it is overwritten by enforceReadableText
if "'messageText'" in re.search(r"export const PALETTE_KEYS = \[([^\]]+)\]", engine).group(1):
    # Remove the trailing comma + newline + messageText entry
    engine = re.sub(
        r"(\s+)'messageText',\n",
        "\n",
        engine,
        count=1,
    )
    print("Removed messageText from PALETTE_KEYS")
else:
    print("messageText already not in PALETTE_KEYS")

# --- 3. Remove legacy drift fields ---
# Find and remove accentHue/accentSaturation/accentLightness defaults in buildDailyDrift
old_legacy = "\n  // Legacy drift fields\n  accentHue: 0,\n  accentSaturation: 0,\n  accentLightness: 0,\n"
if old_legacy in engine:
    engine = engine.replace(old_legacy, "\n")
    print("Removed legacy drift fields from buildDailyDrift")
else:
    # Try alternate pattern
    legacy_pattern = r"\n  // Legacy drift fields[^"]*\n  accentHue: 0,\n  accentSaturation: 0,\n  accentLightness: 0,\n"
    if re.search(legacy_pattern, engine):
        engine = re.sub(legacy_pattern, "\n", engine)
        print("Removed legacy drift fields (alt pattern)")
    else:
        print("Legacy drift fields not found in expected format")

# --- 4. Make cleanup marker XHR async ---
runtime_path = root / "webui/daydrift-theme.js"
runtime = runtime_path.read_text()

old_xhr = "const xhr = new XMLHttpRequest();\n    xhr.open('GET', '/usr/plugins/.daydrift_cleanup', false);\n    xhr.send();"
if old_xhr in runtime:
    runtime = runtime.replace(
        old_xhr,
        "fetch('/usr/plugins/.daydrift_cleanup').then(r => r.ok ? r.json() : null).then(marker => {\n        if (marker && marker.action === 'restore_previous_darkmode') {\n          const previous = localStorage.getItem('daydriftTheme.previousDarkMode');\n          if (previous !== null) {\n            if (previous === '' || previous === null) localStorage.removeItem('darkMode');\n            else localStorage.setItem('darkMode', previous);\n          } else localStorage.removeItem('darkMode');\n          for (const key of (marker.keys || [])) localStorage.removeItem(key);\n          fetch('/usr/plugins/.daydrift_cleanup', { method: 'DELETE' }).catch(() => {});\n        }\n      }).catch(() => {});  // Marker file does not exist \u2014 normal state",
    )
    print("Replaced sync XHR with async fetch in cleanup marker")
else:
    print("Sync XHR not found in expected format")

# Write engine back
engine_path.write_text(engine)
runtime_path.write_text(runtime)
print("Done writing files")

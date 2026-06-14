import json
import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import hooks

hooks.logger.setLevel(60)  # suppress all output

def test_install_completes_without_error():
    hooks.install()
    print("PASS: install completes without error")

def test_uninstall_writes_correct_cleanup_marker():
    p = Path("/tmp/test_daydrift_cleanup.json")
    with patch.object(hooks, "_CLEANUP_MARKER", p):
        hooks.uninstall()
    assert p.exists(), "marker file should exist"
    m = json.loads(p.read_text())
    assert m["action"] == "restore_previous_darkmode", f"wrong action: {m['action']}"
    assert isinstance(m["keys"], list), "keys should be a list"
    assert "darkMode" in m["keys"], "darkMode should be in keys"
    assert "daydriftTheme.previousDarkMode" in m["keys"], "previousDarkMode should be in keys"
    p.unlink(missing_ok=True)
    print("PASS: uninstall writes correct cleanup marker")

def test_uninstall_handles_filesystem_errors():
    with patch.object(hooks, "_CLEANUP_MARKER", Path("/no/such/path/file.json")):
        try:
            hooks.uninstall()
        except Exception as e:
            raise AssertionError(f"uninstall should not raise: {e}")
    print("PASS: uninstall handles filesystem errors gracefully")

if __name__ == "__main__":
    test_install_completes_without_error()
    test_uninstall_writes_correct_cleanup_marker()
    test_uninstall_handles_filesystem_errors()
    print("\nAll 3 hooks tests passed.")

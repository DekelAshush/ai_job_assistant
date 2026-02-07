"""
Install backend deps: pip install -r requirements.txt then playwright install.
On Linux/WSL, also run: sudo playwright install-deps  (system libs for Chromium).
Run from repo root: python scripts/install_deps.py
Or from ai_job_backend: python scripts/install_deps.py
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REQUIREMENTS = ROOT / "requirements.txt"


def main() -> int:
    if not REQUIREMENTS.exists():
        print(f"requirements.txt not found at {REQUIREMENTS}", file=sys.stderr)
        return 1
    print("Installing Python packages...")
    r = subprocess.run(
        [sys.executable, "-m", "pip", "install", "-r", str(REQUIREMENTS)],
        cwd=str(ROOT),
    )
    if r.returncode != 0:
        return r.returncode
    print("Installing Playwright browsers...")
    r = subprocess.run(
        [sys.executable, "-m", "playwright", "install"],
        cwd=str(ROOT),
    )
    if r.returncode != 0:
        return r.returncode
    if sys.platform.startswith("linux"):
        print("\nOn Linux/WSL, install system deps for Chromium:")
        print("  sudo playwright install-deps")
    return 0


if __name__ == "__main__":
    sys.exit(main())

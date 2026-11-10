#!/usr/bin/env python3
"""Generate a PCB reference design from a chip datasheet using Claude.

Pipeline: datasheet -> Claude writes a SKiDL script -> script is executed to
produce a KiCad netlist -> any error is fed back to Claude -> repeat.

Usage:
    python pcb_ai.py datasheet.pdf --out build/ --notes "5V in, 3.3V out, 500mA"
"""
import argparse
import base64
import re
import subprocess
import sys
from pathlib import Path

import anthropic

MODEL = "claude-sonnet-5-5"
HERE = Path(__file__).parent

SYSTEM = (HERE / "prompt.md").read_text()


def datasheet_block(path: Path) -> dict:
    """Return a content block for the datasheet (PDF or plain text)."""
    if path.suffix.lower() == ".pdf":
        data = base64.standard_b64encode(path.read_bytes()).decode()
        return {
            "type": "document",
            "source": {"type": "base64", "media_type": "application/pdf", "data": data},
        }
    return {"type": "text", "text": path.read_text()}


def extract_code(reply: str) -> str:
    m = re.search(r"```python\n(.*?)```", reply, re.S)
    if not m:
        raise ValueError("Reply contained no ```python block")
    return m.group(1)


def run_design(code: str, out: Path) -> tuple[bool, str]:
    """Execute the generated SKiDL script; success means a netlist was written."""
    out.mkdir(parents=True, exist_ok=True)
    script = out / "design.py"
    script.write_text(code)
    proc = subprocess.run(
        [sys.executable, "design.py"],
        cwd=out, capture_output=True, text=True, timeout=120,
    )
    log = (proc.stdout + proc.stderr).strip()
    netlists = list(out.glob("*.net"))
    if proc.returncode == 0 and netlists and "ERROR" not in log:
        return True, log
    return False, log or "No netlist (.net) file was produced."


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("datasheet", type=Path)
    ap.add_argument("--out", type=Path, default=Path("build"))
    ap.add_argument("--notes", default="", help="Application requirements")
    ap.add_argument("--attempts", type=int, default=4)
    args = ap.parse_args()

    client = anthropic.Anthropic()
    task = (
        "Design a complete reference circuit for the chip in this datasheet. "
        "Include every required support component with values taken from the datasheet."
    )
    if args.notes:
        task += f"\nApplication requirements: {args.notes}"

    messages = [{
        "role": "user",
        "content": [datasheet_block(args.datasheet), {"type": "text", "text": task}],
    }]

    for attempt in range(1, args.attempts + 1):
        print(f"[attempt {attempt}] asking Claude...")
        resp = client.messages.create(
            model=MODEL, max_tokens=8000, system=SYSTEM, messages=messages
        )
        reply = resp.content[0].text
        messages.append({"role": "assistant", "content": reply})
        try:
            code = extract_code(reply)
            ok, log = run_design(code, args.out)
        except Exception as e:  # bad reply, timeout, etc.
            ok, log = False, str(e)
        if ok:
            print(f"Done. Netlist and design.py are in {args.out}/")
            return 0
        print(f"  failed:\n{log[-1500:]}")
        messages.append({
            "role": "user",
            "content": f"Running the script failed:\n\n{log[-4000:]}\n\nFix it and return the full script.",
        })

    print("Gave up after max attempts.")
    return 1


if __name__ == "__main__":
    sys.exit(main())

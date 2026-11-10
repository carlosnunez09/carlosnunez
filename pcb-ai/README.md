# pcb-ai

Generate a PCB reference design from a chip datasheet using Claude.

```
datasheet.pdf -> Claude writes SKiDL -> run it -> KiCad netlist (.net)
                      ^                    |
                      +---- error log -----+   (up to --attempts retries)
```

## Setup

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=...
# SKiDL needs KiCad's symbol libraries (install KiCad and set KICAD_SYMBOL_DIR
# if SKiDL cannot find them).
```

## Use

```bash
python pcb_ai.py lm1117.pdf --out build/lm1117 --notes "5V in, 3.3V out, 800mA"
```

Output in `--out`: `design.py` (the generated circuit) and a `.net` netlist you
can import into KiCad's PCBnew to lay out the board.

## Limits

- It does not lay out or route the board; it produces the schematic netlist.
- Execution only proves the script runs, not that the circuit is right.
  Always review the result against the datasheet before fabricating.
- Good next step: add a testbench of requirement checks (e.g. total
  capacitance on the input rail >= 22uF) and feed failures back into the loop.

"""
Plain-text strikethrough for acknowledged reminders (RM-16a). HA-free.

The built-in Home Assistant calendar dashboard renders event summaries as plain
text — there is no styling channel — so a past ("acked") reminder is struck
through by interleaving the Unicode combining long stroke overlay (U+0336) into
the summary at calendar read time. The stored summary is never decorated;
``strip_strikethrough`` undoes the decoration so an edit made through HA's
calendar dialog can't persist the combining characters.
"""

from __future__ import annotations

# Combining long stroke overlay: renders a strike over the preceding character.
STRIKE_CHAR = "\u0336"


def strike_text(text: str) -> str:
    """Return ``text`` with every character struck through."""
    return "".join(f"{ch}{STRIKE_CHAR}" for ch in text)


def strip_strikethrough(text: str) -> str:
    """Return ``text`` with any strikethrough decoration removed."""
    return text.replace(STRIKE_CHAR, "")

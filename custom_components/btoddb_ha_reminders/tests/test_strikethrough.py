"""Strikethrough decoration for acked reminders (RM-16a). HA-free."""

from __future__ import annotations

from conftest import load_module

strikethrough = load_module("strikethrough")
STRIKE_CHAR = strikethrough.STRIKE_CHAR
strike_text = strikethrough.strike_text
strip_strikethrough = strikethrough.strip_strikethrough


def test_strike_interleaves_combining_stroke_after_every_char():
    assert strike_text("ab") == f"a{STRIKE_CHAR}b{STRIKE_CHAR}"


def test_strike_empty_string_is_empty():
    assert strike_text("") == ""


def test_strip_undoes_strike():
    assert strip_strikethrough(strike_text("water the plants")) == "water the plants"


def test_strip_leaves_clean_text_untouched():
    assert strip_strikethrough("water the plants") == "water the plants"

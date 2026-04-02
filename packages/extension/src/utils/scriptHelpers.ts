/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Script injection helpers — safe serialization for webview inline scripts
 */

/**
 * Serializes a value to JSON safe for injection into an inline `<script>` tag.
 *
 * Standard `JSON.stringify()` does not escape `</script>` sequences, which
 * allows a crafted string value to break out of the script context (OWASP A03).
 * This helper escapes `<`, `>`, and `&` as Unicode escape sequences so the
 * JSON string is safe regardless of its content.
 *
 * Use this instead of `JSON.stringify()` wherever the result is interpolated
 * into a `<script>…</script>` template literal.
 */
export function safeJsonStringify(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

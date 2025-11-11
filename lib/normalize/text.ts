// lib/normalize/text.ts

/**
 * Minimal HTML-entity decoder.
 * Handles common named entities, RIDB's \u003C style escapes,
 * and numeric entities (decimal & hex).
 */
export function decodeHtmlEntities(input: string): string {
    if (!input) return '';

    let s = input
        // RIDB often escapes angle brackets (e.g., \u003C, \u003E, \u0026)
        .replace(/\\u003c/gi, '<')
        .replace(/\\u003e/gi, '>')
        .replace(/\\u0026/gi, '&')

        // Common named entities
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/gi, ' ');

    // Numeric entities: decimal (&#123;) and hex (&#x7B;)
    s = s.replace(/&#(\d+);/g, (_, d: string) =>
        String.fromCharCode(Number(d))
    );
    s = s.replace(/&#x([0-9a-fA-F]+);/g, (_, h: string) =>
        String.fromCharCode(parseInt(h, 16))
    );

    return s;
}

/**
 * Convert HTML (often messy from RIDB) into clean plain text.
 * - Decodes entities
 * - Strips <script>/<style>
 * - Converts <br>/<hr> and </p> to newlines
 * - Removes remaining tags
 * - Normalizes whitespace
 */
export function htmlToText(input: string): string {
    if (!input) return '';

    // 1) Decode entities so tags are recognizable
    let s = decodeHtmlEntities(input);

    // 2) Drop scripts/styles entirely
    s = s
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '');

    // 3) Convert line-break-ish tags to newlines
    s = s
        .replace(/<(?:br|hr)\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n');

    // 4) Remove all remaining tags
    s = s.replace(/<[^>]+>/g, '');

    // 5) Normalize whitespace & newlines
    s = s
        .replace(/\r/g, '')
        .replace(/[ \t]+/g, ' ')
        .replace(/\s*\n\s*/g, '\n')
        // collapse multiple blank lines
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    return s;
}

/**
 * Text prepped for embeddings (pgvector/RAG).
 * - Uses htmlToText
 * - Flattens to single spaces
 * - Length-limits to avoid oversized vectors
 */
export function toEmbeddingText(input: string, maxChars = 4000): string {
    const txt = htmlToText(input).replace(/\s+/g, ' ').trim();
    return txt.length > maxChars ? txt.slice(0, maxChars) : txt;
}

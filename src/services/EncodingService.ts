export const sniffXmlEncoding = (buffer: ArrayBuffer): string => {
    // 1. Read the first 100 bytes directly
    const view = new Uint8Array(buffer.slice(0, 100));
    let header = '';

    // Convert to ASCII string (safe for <?xml ... ?> tags)
    for (let i = 0; i < view.length; i++) {
        header += String.fromCharCode(view[i]);
    }

    // 2. Regex to find encoding="..."
    // Supports single or double quotes, case insensitive
    const match = header.match(/encoding=["']([^"']+)["']/i);

    if (match && match[1]) {
        return match[1].toLowerCase();
    }

    // 3. BOM Checks (Byte Order Mark)
    if (view[0] === 0xEF && view[1] === 0xBB && view[2] === 0xBF) return 'utf-8';
    if (view[0] === 0xFE && view[1] === 0xFF) return 'utf-16be';
    if (view[0] === 0xFF && view[1] === 0xFE) return 'utf-16le';

    // 4. Fallback: Assumption
    // If no declaration, XML spec says UTF-8, but TISS reality often means ISO-8859-1.
    // We return 'unknown' to let the caller decide policy.
    return 'unknown';
};

export const darkenHexColor = (hex: string, amount: number) => {
    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, '');

    // Parse the r, g, b values
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Make the color darker by decreasing each channel value
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);

    // Convert the r, g, b values back to hex
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    const darkenedHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

    return darkenedHex;
};
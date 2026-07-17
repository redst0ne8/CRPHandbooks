const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'crp-staff-guides-secret-change-me';

function generateState() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
}

function sign(text, secret) {
    const encoder = new TextEncoder();
    const key = encoder.encode(secret);
    const data = encoder.encode(text);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash + data[i]) | 0;
    }
    return Math.abs(hash).toString(36);
}

export default async function handler(req, res) {
    const state = generateState();
    const signed = sign(state, COOKIE_SECRET);

    res.setHeader('Set-Cookie', [
        `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
        `oauth_state_sig=${signed}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
    ]);

    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'code',
        scope: 'identify',
        state: state
    });

    res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
}
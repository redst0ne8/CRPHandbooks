const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'crp-staff-guides-secret-change-me';

function generateState() {
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function sign(text, secret) {
    const data = text + secret;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
    }
    return Math.abs(hash).toString(36);
}

export default async function handler(req, res) {
    const state = generateState();
    const sig = sign(state, COOKIE_SECRET);

    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'code',
        scope: 'identify',
        state: state
    });

    res.writeHead(302, {
        'Location': `https://discord.com/api/oauth2/authorize?${params.toString()}`,
        'Set-Cookie': [
            `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
            `oauth_state_sig=${sig}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
        ]
    });
    res.end();
}
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'crp-staff-guides-secret-change-me';

function sign(text, secret) {
    const data = text + secret;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
    }
    return Math.abs(hash).toString(36);
}

function parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;
    cookieHeader.split(';').forEach(c => {
        const idx = c.indexOf('=');
        if (idx === -1) return;
        const key = c.slice(0, idx).trim();
        const val = c.slice(idx + 1).trim();
        cookies[key] = val;
    });
    return cookies;
}

export default async function handler(req, res) {
    const { code, state } = req.query;
    const cookies = parseCookies(req.headers.cookie);

    if (!code || !state) {
        res.writeHead(302, { 'Location': '/?error=missing_params' });
        return res.end();
    }

    const expectedSig = sign(state, COOKIE_SECRET);
    if (cookies.oauth_state !== state || cookies.oauth_state_sig !== expectedSig) {
        res.writeHead(302, { 'Location': '/?error=invalid_state' });
        return res.end();
    }

    try {
        const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: DISCORD_REDIRECT_URI
            })
        });

        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
            res.writeHead(302, { 'Location': '/?error=token_failed' });
            return res.end();
        }

        const userRes = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });

        const userData = await userRes.json();

        const avatarUrl = userData.avatar
            ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=128`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.discriminator) % 5}.png`;

        const payload = JSON.stringify({ userId: userData.id, avatar: avatarUrl, username: userData.username });
        const encoded = Buffer.from(payload).toString('base64url');
        const sessionSig = sign(encoded, COOKIE_SECRET);

        res.writeHead(302, {
            'Location': '/',
            'Set-Cookie': [
                `session=${encoded}.${sessionSig}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
                `oauth_state=; Path=/; HttpOnly; Max-Age=0`,
                `oauth_state_sig=; Path=/; HttpOnly; Max-Age=0`
            ]
        });
        res.end();
    } catch (err) {
        console.error('OAuth callback error:', err);
        res.writeHead(302, { 'Location': '/?error=server_error' });
        res.end();
    }
}
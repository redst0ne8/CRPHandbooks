const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'crp-staff-guides-secret-change-me';

function sign(text, secret) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash + data[i]) | 0;
    }
    return Math.abs(hash).toString(36);
}

function parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;
    cookieHeader.split(';').forEach(c => {
        const [key, ...val] = c.split('=');
        cookies[key.trim()] = val.join('=').trim();
    });
    return cookies;
}

function setSessionCookie(res, userId, avatar, username) {
    const payload = JSON.stringify({ userId, avatar, username });
    const encoded = Buffer.from(payload).toString('base64url');
    const sig = sign(encoded, COOKIE_SECRET);
    return `session=${encoded}.${sig}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`;
}

export default async function handler(req, res) {
    const { code, state } = req.query;
    const cookies = parseCookies(req.headers.cookie);

    if (!code || !state) {
        return res.redirect('/?error=missing_params');
    }

    const expectedSig = sign(state, COOKIE_SECRET);
    if (cookies.oauth_state !== state || cookies.oauth_state_sig !== expectedSig) {
        return res.redirect('/?error=invalid_state');
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
            return res.redirect('/?error=token_failed');
        }

        const userRes = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });

        const userData = await userRes.json();

        const avatarUrl = userData.avatar
            ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=128`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.discriminator) % 5}.png`;

        res.setHeader('Set-Cookie', [
            setSessionCookie(res, userData.id, avatarUrl, userData.username),
            'oauth_state=; Path=/; HttpOnly; Secure; Max-Age=0',
            'oauth_state_sig=; Path=/; HttpOnly; Secure; Max-Age=0'
        ].join(', '));

        res.redirect('/');
    } catch (err) {
        console.error('OAuth callback error:', err);
        res.redirect('/?error=server_error');
    }
}
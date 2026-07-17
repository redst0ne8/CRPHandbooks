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

export default async function handler(req, res) {
    const cookies = parseCookies(req.headers.cookie);

    if (!cookies.session) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const [encoded, sig] = cookies.session.split('.');
        const expectedSig = sign(encoded, COOKIE_SECRET);

        if (sig !== expectedSig) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString());

        res.status(200).json({
            user: {
                id: payload.userId,
                avatar: payload.avatar,
                username: payload.username
            }
        });
    } catch (err) {
        res.status(401).json({ error: 'Invalid session' });
    }
}
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
        cookies[c.slice(0, idx).trim()] = c.slice(idx + 1).trim();
    });
    return cookies;
}

export default async function handler(req, res) {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
    }

    if (!token) {
        const cookies = parseCookies(req.headers.cookie);
        if (cookies.session) {
            token = cookies.session;
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const parts = token.split('.');
        if (parts.length !== 2) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        const [encoded, sig] = parts;
        const expectedSig = sign(encoded, COOKIE_SECRET);

        if (sig !== expectedSig) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString());

        let roleLabel = 'Not Staff';
        let joinedAt = null;

        try {
            const memberRes = await fetch(
                `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID || '1317032666331353099'}/members/${payload.userId}`,
                {
                    headers: {
                        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (memberRes.ok) {
                const member = await memberRes.json();
                joinedAt = member.joined_at || null;
                const roles = member.roles || [];
                const HIGH_RANK_ROLE_ID = '1460812635846086656';
                const STAFF_ROLE_ID = '1460812651168010304';
                if (roles.includes(HIGH_RANK_ROLE_ID)) {
                    roleLabel = 'High Rank';
                } else if (roles.includes(STAFF_ROLE_ID)) {
                    roleLabel = 'Staff';
                }
            }
        } catch (e) {}

        res.status(200).json({
            user: {
                id: payload.userId,
                avatar: payload.avatar,
                username: payload.username,
                role: roleLabel,
                joinedAt: joinedAt
            }
        });
    } catch (err) {
        res.status(401).json({ error: 'Invalid session' });
    }
}
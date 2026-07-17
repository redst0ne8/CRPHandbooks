const COOKIE_SECRET = process.env.COOKIE_SECRET || 'crp-staff-guides-secret-change-me';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = '1317032666331353099';
const STAFF_ROLE_ID = '1460812651168010304';
const HIGH_RANK_ROLE_ID = '1460812635846086656';

function sign(text, secret) {
    const data = text + secret;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
    }
    return Math.abs(hash).toString(36);
}

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const token = authHeader.slice(7);

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
        const userId = payload.userId;

        const memberRes = await fetch(
            `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${userId}`,
            {
                headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
            }
        );

        if (!memberRes.ok) {
            return res.status(200).json({ isStaff: false, isHighRank: false });
        }

        const member = await memberRes.json();
        const roles = member.roles || [];

        const isStaff = roles.includes(STAFF_ROLE_ID);
        const isHighRank = roles.includes(HIGH_RANK_ROLE_ID);

        res.status(200).json({ isStaff, isHighRank });
    } catch (err) {
        console.error('Role check error:', err);
        res.status(200).json({ isStaff: false, isHighRank: false });
    }
}
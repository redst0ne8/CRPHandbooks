import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

const COOKIE_SECRET = process.env.COOKIE_SECRET || 'crp-staff-guides-secret-change-me';
const GUILD_ID = process.env.DISCORD_GUILD_ID || '1317032666331353099';
const STAFF_ROLE_ID = '1460812651168010304';
const HIGH_RANK_ROLE_ID = '1460812635846086656';
const EXECUTIVE_ROLE_ID = '1460812466454921358';
const OWNERSHIP_ROLE_ID = '1522036995726250015';
const EDITOR_USER_ID = '802937980897067059';

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

function getToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    const cookies = parseCookies(req.headers.cookie);
    return cookies.session || null;
}

function verifySession(token) {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, sig] = parts;
    if (sig !== sign(encoded, COOKIE_SECRET)) return null;
    try {
        return JSON.parse(Buffer.from(encoded, 'base64url').toString());
    } catch {
        return null;
    }
}

async function canEdit(session) {
    if (!session) return false;
    if (session.userId === EDITOR_USER_ID) return true;

    try {
        const memberRes = await fetch(
            `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${session.userId}`,
            {
                headers: {
                    'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        if (memberRes.ok) {
            const member = await memberRes.json();
            const roles = member.roles || [];
            if (roles.includes(OWNERSHIP_ROLE_ID)) return true;
            if (roles.includes(EXECUTIVE_ROLE_ID)) return true;
        }
    } catch (e) {}

    return false;
}

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const pageData = await redis.get('pages');
            const collapsibleData = await redis.get('collapsibles');
            const customPageData = await redis.get('customPages');
            const deletedPages = (await redis.get('deletedPages')) || [];
            const pageOrderData = (await redis.get('pageOrder')) || {};
            return res.status(200).json({
                pages: pageData || {},
                collapsibles: collapsibleData || {},
                customPages: customPageData || {},
                deletedPages,
                pageOrder: pageOrderData
            });
        } catch (e) {
            return res.status(200).json({ pages: {}, collapsibles: {} });
        }
    }

    if (req.method === 'POST') {
        const token = getToken(req);
        const session = verifySession(token);
        if (!session) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!(await canEdit(session))) {
            return res.status(403).json({ error: 'Not authorized to edit' });
        }

        const { type, pageId, collapsibleId, content, pageData, title, icon, isCustom, pageOrder } = req.body || {};

        if (type === 'deletePage') {
            if (!pageId) {
                return res.status(400).json({ error: 'pageId is required' });
            }
            try {
                const deleted = (await redis.get('deletedPages')) || [];
                if (!deleted.includes(pageId)) {
                    deleted.push(pageId);
                    await redis.set('deletedPages', deleted);
                }
                return res.status(200).json({ success: true });
            } catch (e) {
                return res.status(500).json({ error: 'Failed to delete page' });
            }
        }

        if (type === 'deleteCustomPage') {
            if (!pageId) {
                return res.status(400).json({ error: 'pageId is required' });
            }
            try {
                const existing = (await redis.get('customPages')) || {};
                delete existing[pageId];
                await redis.set('customPages', existing);
                return res.status(200).json({ success: true });
            } catch (e) {
                return res.status(500).json({ error: 'Failed to delete custom page' });
            }
        }

        if (type === 'customPage') {
            if (!pageId || !pageData) {
                return res.status(400).json({ error: 'pageId and pageData are required' });
            }
            try {
                const existing = (await redis.get('customPages')) || {};
                existing[pageId] = {
                    ...pageData,
                    createdBy: session.username,
                    createdAt: new Date().toISOString()
                };
                await redis.set('customPages', existing);
                return res.status(200).json({ success: true });
            } catch (e) {
                return res.status(500).json({ error: 'Failed to save custom page' });
            }
        }

        if (type === 'updatePageMeta') {
            if (!pageId || !title) {
                return res.status(400).json({ error: 'pageId and title are required' });
            }
            try {
                if (isCustom) {
                    const existing = (await redis.get('customPages')) || {};
                    if (existing[pageId]) {
                        existing[pageId].title = title;
                        existing[pageId].icon = icon;
                        await redis.set('customPages', existing);
                    }
                } else {
                    const existing = (await redis.get('pages')) || {};
                    existing[pageId] = {
                        ...(existing[pageId] || {}),
                        title,
                        icon,
                        updatedBy: session.username,
                        updatedAt: new Date().toISOString()
                    };
                    await redis.set('pages', existing);
                }
                if (pageOrder) {
                    await redis.set('pageOrder', pageOrder);
                }
                return res.status(200).json({ success: true });
            } catch (e) {
                return res.status(500).json({ error: 'Failed to update page settings' });
            }
        }

        if (type === 'collapsible') {
            if (!collapsibleId || content === undefined) {
                return res.status(400).json({ error: 'collapsibleId and content are required' });
            }

            try {
                const existing = (await redis.get('collapsibles')) || {};
                existing[collapsibleId] = {
                    content: content,
                    updatedBy: session.username,
                    updatedAt: new Date().toISOString()
                };
                await redis.set('collapsibles', existing);
                return res.status(200).json({ success: true });
            } catch (e) {
                return res.status(500).json({ error: 'Failed to save collapsible content' });
            }
        }

        if (!pageId || content === undefined) {
            return res.status(400).json({ error: 'pageId and content are required' });
        }

        try {
            const existing = (await redis.get('pages')) || {};
            existing[pageId] = {
                content: content,
                lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                updatedBy: session.username,
                updatedAt: new Date().toISOString()
            };
            await redis.set('pages', existing);
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ error: 'Failed to save content' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}

export default async function handler(req, res) {
    res.writeHead(302, {
        'Location': '/',
        'Set-Cookie': 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    });
    res.end();
}
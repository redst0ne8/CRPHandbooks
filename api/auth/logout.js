export default async function handler(req, res) {
    res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    res.redirect('/');
}
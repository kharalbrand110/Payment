export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { username } = req.query;
    
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    // Your TikTok API credentials (add in Vercel Environment Variables)
    const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || 'YOUR_CLIENT_KEY';
    const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';

    try {
        // Step 1: Get access token
        const tokenRes = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_key: CLIENT_KEY,
                client_secret: CLIENT_SECRET,
                grant_type: 'client_credentials'
            })
        });
        
        const tokenData = await tokenRes.json();
        
        if (!tokenData.access_token) {
            throw new Error('Failed to get access token');
        }

        // Step 2: Get user info
        const userRes = await fetch(
            `https://open-api.tiktok.com/user/info/?username=${username}`,
            {
                headers: {
                    'Access-Token': tokenData.access_token,
                    'Client-Key': CLIENT_KEY
                }
            }
        );
        
        const userData = await userRes.json();
        
        if (userData.data?.user) {
            return res.status(200).json({
                username: userData.data.user.unique_id,
                displayName: userData.data.user.display_name,
                avatar: userData.data.user.avatar_medium_url,
                bio: userData.data.user.signature,
                followers: userData.data.user.follower_count,
                following: userData.data.user.following_count,
                likes: userData.data.user.like_count,
                videos: userData.data.user.video_count,
                location: userData.data.user.location || 'Not public',
                email: userData.data.user.email || 'Not public'
            });
        } else {
            throw new Error('User not found');
        }
        
    } catch (error) {
        return res.status(500).json({ 
            error: error.message,
            suggestion: 'Make sure CLIENT_KEY and CLIENT_SECRET are set in Vercel env variables'
        });
    }
}

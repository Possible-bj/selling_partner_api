import fetch from "node-fetch";

export default async () => {
  try {
    const refreshToken = process.env.REFRESHTOKEN
    const clientId = process.env.CLIENTID
    const clientSecret = process.env.CLIENTSECRET;

    const o2AuthRes = await fetch(`https://api.amazon.com/auth/o2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret })
    })

    const o2AuthData = await o2AuthRes.json()

    return o2AuthData.access_token

  } catch (error) {
    throw new Error(error.meassage)
  }
}
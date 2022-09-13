import { SignatureV4 } from '@aws-sdk/signature-v4'
import crypto from '@aws-crypto/sha256-js'
import fetch from 'node-fetch'

export default async (accessToken) => {
  const credentials = {
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY
  }

  const StsSignature = new SignatureV4({
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
    region: 'us-east-1',
    service: 'sts',
    sha256: crypto.Sha256
  })

  const stsHeaders = { host: 'sts.amazonaws.com', }

  const stsUrl = `https://sts.amazonaws.com/?Version=2011-06-15&Action=AssumeRole&RoleSessionName=Test&RoleArn=arn:aws:iam::807923402431:role/manifest-sp-api-role&DurationSeconds=3600`

  const stsSignedRequest = await StsSignature.sign({ path: stsUrl, headers: stsHeaders, method: 'GET', protocol: 'https', hostname: 'sts.amazonaws.com' })
  const stsRes = await fetch(stsSignedRequest.path, { headers: stsSignedRequest.headers })
  const stsData = await stsRes.text()
  console.log(stsData)

  // const now = new Date()
  // const date = (now).toISOString().replace(/[\-:]/g, "");
  // const xAmzDate = `${date.substring(0, date.length - 5)}Z`
  // console.log(xAmzDate)
  const Signature = new SignatureV4({
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
    region: 'us-east-1',
    service: 'execute-api',
    sha256: crypto.Sha256
  })
  const headers = { host: 'sellingpartnerapi-na.amazon.com', 'user-agent': 'manifest-sp-api/1.0 (Language=JavaScript)', 'x-amz-access-token': accessToken }

  const url = `https://sellingpartnerapi-na.amazon.com/sellers/v1/marketplaceParticipations`

  const signedRequest = await Signature.sign({ path: url, headers, method: 'GET', protocol: 'https', hostname: 'sellingpartnerapi-na.amazon.com' })

  try {
    const res = await fetch(signedRequest.path, { headers: signedRequest.headers })
    const data = await res.json()
    // console.log(res)
    return (data)
  } catch (error) {
    throw new Error(error.message)
  }

}

// @aws-sdk/signature-v4
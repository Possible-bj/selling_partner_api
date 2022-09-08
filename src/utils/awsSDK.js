import { SignatureV4 } from '@aws-sdk/signature-v4'
import AWS from 'aws-sdk'
import crypto from "crypto"
// import moment from "moment"
import fetch from 'node-fetch'

export default async (accessToken) => {
  const credentials = {
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY
  }
  const params = {
    RoleSessionName: 'Test',
    RoleArn: 'arn:aws:iam::807923402431:role/manifest-sp-api-role',
    DurationSeconds: 3600
  }
  AWS.config.correctClockSkew = true
  AWS.config.update({ region: 'us-east-1', credentials });
  // let credentialData = [];
  const sts = new AWS.STS({ apiVersion: '2011-06-15' });
  sts.assumeRole(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      console.log(data)
    }   // successful response
  });

  class Sha256Constructor {
    constructor(key = '') {
      this._hmac = crypto.createHmac('sha256', key)
    }

    update(message) {
      return this._hmac.update(message)
    }

    digest() {
      return this._hmac.digest()
    }
  }
  // sessionToken: credentials.SessionToken,
  // expiration: credentials.Expiration,

  const Signature = new SignatureV4({
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
    region: 'us-east-1',
    service: 'execute-api',
    sha256: Sha256Constructor
  })

  // const now = new Date()
  // const date = (now).toISOString().replace(/[\-:]/g, "");
  // const xAmzDate = `${date.substring(0, date.length - 5)}Z`
  // console.log(xAmzDate)
  const headers = { host: 'sellingpartnerapi-na.amazon.com', 'user-agent': 'manifest-sp-api/1.0 (Language=JavaScript)', 'x-amz-access-token': accessToken }

  const url = `https://sellingpartnerapi-na.amazon.com/sellers/v1/marketplaceParticipations`

  const signedRequest = await Signature.sign({ path: url, headers, method: 'GET', protocol: 'https', hostname: 'sellingpartnerapi-na.amazon.com' })

  try {
    const res = await fetch(signedRequest.path, { headers: signedRequest.headers })
    const data = await res.json()
    console.log(res)
    return (data)
  } catch (error) {
    throw new Error(error.message)
  }

}

// @aws-sdk/signature-v4
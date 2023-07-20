import { base64url } from '@/libs/base64url';
import CBOR from '@/libs/cbor';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // get search params
  const { publicKey, signedData, signature } = req.body as {
    publicKey: string;
    signedData: string;
    signature: ArrayBuffer;
  };

  const publicKeyBase64 = base64url.decode(publicKey);
  const signatureIsValid = publicKeyBase64.verify(
    // @ts-ignore
    assertion?.response.signature,
    signedData,
  );

  res.status(200).json({ signatureIsValid });
}

import type { NextApiRequest, NextApiResponse } from 'next';
import CBOR from '../../libs/cbor';
import { ResponseData } from '../../types/responseData';
import { base64url } from '@/libs/base64url';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  const credential = req.body;
  //parse the PublicKeyCredential

  const base64ClientDataObj = base64url.decode(
    credential.response.clientDataJSON,
  );
  const enc = new TextDecoder(); // always utf-8
  const clientDataObj = enc.decode(base64ClientDataObj);
  console.log(clientDataObj);

  const base64DecodedAttestationObj = base64url.decode(
    credential.response.attestationObject,
  );

  const decodedAttestationObj = CBOR.decode(base64DecodedAttestationObj);

  //const { authData } = decodedAttestationObj;

  //   // get the length of the credential ID
  //   const dataView = new DataView(new ArrayBuffer(2));
  //   const idLenBytes = authData.slice(53, 55);
  //   idLenBytes.forEach((value: any, index: any) =>
  //     dataView.setUint8(index, value),
  //   );
  //   const credentialIdLength = dataView.getUint16(2);

  //   // get the credential ID
  //   const credentialId = authData.slice(55, 55 + credentialIdLength);

  //   // get the public key object
  //   const publicKeyBytes = authData.slice(55 + credentialIdLength);

  //   // the publicKeyBytes are encoded again as CBOR
  //   const publicKeyObject = CBOR.decode(publicKeyBytes.buffer);

  res.status(200).json({
    clientDataObj,
    decodedAttestationObj,
    // credentialId: 'credentialId',
    // publicKeyBytes: 'publicKeyBytes',
    // publicKeyObject: 'publicKeyObject',
  });
}

import { RegistrationCredential } from '@simplewebauthn/typescript-types';
import { base64url } from './base64url';
import CBOR from './cbor';

export const getCredentials = async ({
  randomStringFromServer,
  username,
}: {
  randomStringFromServer: string;
  username: string;
}) => {
  const credential = (await navigator.credentials.create({
    publicKey: {
      rp: {
        name: 'Web Grow',
        id: window.location.hostname,
      },
      challenge: Uint8Array.from(randomStringFromServer, c => c.charCodeAt(0)),
      user: {
        id: Uint8Array.from(username, c => c.charCodeAt(0)),
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: {
        authenticatorAttachment: 'cross-platform',
        requireResidentKey: true,
      },
      timeout: 60000,
      attestation: 'direct',
    },
  })) as RegistrationCredential;
  let credentialId = '';
  if (credential?.id) {
    const rawId = base64url.encode(credential.rawId);
    const clientDataJSON = base64url.encode(credential.response.clientDataJSON);
    const attestationObject = base64url.encode(
      credential.response.attestationObject,
    );
    const clientExtensionResults = {};

    let transports: any[] = [];

    // if `getTransports()` is supported, serialize the result.
    if (credential.response.getTransports) {
      transports = credential.response.getTransports();
    }

    const encodedCredential = {
      id: credential.id,
      rawId,
      response: {
        clientDataJSON,
        attestationObject,
      },
      type: credential.type,
      transports,
      clientExtensionResults,
    };

    const res = await fetch(`/api/registerUser`, {
      body: JSON.stringify(encodedCredential),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const respData = await res.json();
    return respData;
  }
};

export const authenticate = async ({
  randomStringFromServer,
  credentialId,
}: {
  randomStringFromServer: string;
  credentialId: string;
}) => {
  const publicKeyCredentialRequestOptions = {
    challenge: Uint8Array.from(randomStringFromServer, c => c.charCodeAt(0)),
    allowCredentials: [
      {
        id: base64url.decode(credentialId),
        type: 'public-key' as const,
      },
    ],
    timeout: 60000,
  };

  const assertion = await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions,
  });

  debugger;

  const authenticatorDataBytes = new Uint8Array(
    // @ts-ignore
    assertion?.response.authenticatorData,
  );

  // sha-256 hash
  const hashedClientDataJSON = await crypto.subtle.digest(
    'SHA-256',
    // @ts-ignore
    assertion?.response.clientDataJSON,
  );

  const hashedClientDataJSONBytes = new Uint8Array(hashedClientDataJSON);

  const signedData = Array.from(authenticatorDataBytes).concat(
    Array.from(hashedClientDataJSONBytes),
  );

  // @ts-ignore
  return { signedData, signature: assertion?.response.signature };
};

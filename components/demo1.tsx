import { base64url } from '@/libs/base64url';
import { ResponseData } from '@/types/responseData';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { CodeBlock, dracula } from 'react-code-blocks';
import {
  AttestationConveyancePreference,
  // PublicKeyCredentialDescriptor,
  PublicKeyCredentialParameters,
  AuthenticatorDevice,
  RegistrationCredential,
  AuthenticationCredential,
  PublicKeyCredentialUserEntityJSON,
} from '@simplewebauthn/typescript-types';

interface DemoProps {
  randomStringFromServer: string;
}

function Demo1({ randomStringFromServer }: DemoProps) {
  const [publicKeyCredential, setPublicKeyCredential] = useState<
    Credential | undefined
  >();
  const [respData, setRespData] = useState<ResponseData | undefined>();

  const getCredentials = async () => {
    const credential = (await navigator.credentials.create({
      //publicKey: publicKeyCredentialCreationOptions
      publicKey: {
        challenge: Uint8Array.from(randomStringFromServer, c =>
          c.charCodeAt(0),
        ),
        rp: {
          name: 'Acme Security',
          id: 'localhost',
        },
        //the user that is currently registering.
        user: {
          id: Uint8Array.from('UZSL85T9AFC', c => c.charCodeAt(0)),
          name: 'user@me.com',
          displayName: 'Sagar',
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        authenticatorSelection: {
          authenticatorAttachment: 'cross-platform',
        },
        //timeout in ms that describes how long the user has to respond to a challenge.
        timeout: 60000,
        //The attestation data that is returned from the authenticator has information that could be used to track users. This option allows servers to indicate how important the attestation data is to this registration event.
        attestation: 'direct',
      },
    })) as RegistrationCredential;
    if (credential?.id) {
      setPublicKeyCredential(credential);
      console.log(credential);
      const rawId = base64url.encode(credential.rawId);
      const clientDataJSON = base64url.encode(
        credential.response.clientDataJSON,
      );
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

      const res = await fetch(`http://localhost:3000/api/registerUser`, {
        body: JSON.stringify(encodedCredential),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const respData = await res.json();
      setRespData(respData);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div>
        <button
          onClick={e => getCredentials()}
          type="submit"
          style={{
            margin: '0 auto',
            display: 'block',
          }}
        >
          CLICK ME TO REGISTER!
        </button>

        <button
          style={{
            margin: '0 auto',
            display: 'block',
          }}
        >
          Sign in
        </button>
      </div>

      {respData ? (
        <div style={{ marginTop: '30px' }}>
          <CodeBlock
            language="javascript"
            text={JSON.stringify(respData)}
            showLineNumbers={true}
            startingLineNumber={0}
            wrapLongLines={false}
          />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(Demo1), {
  ssr: false,
});

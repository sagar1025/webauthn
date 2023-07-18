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
  const publicKeyCredentialCreationOptions = {
    rp: {
      name: 'Acme Security',
      id: 'localhost',
    },
    // //the user that is currently registering.
    // user: {
    //   id: Uint8Array.from('UZSL85T9AFC', c => c.charCodeAt(0)),
    //   name: 'user@me.com',
    //   displayName: 'Sagar',
    // },
    // pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
    // authenticatorSelection: {
    //   authenticatorAttachment: 'cross-platform',
    // },
    // //timeout in ms that describes how long the user has to respond to a challenge.
    // timeout: 60000,
    // //The attestation data that is returned from the authenticator has information that could be used to track users. This option allows servers to indicate how important the attestation data is to this registration event.
    // attestation: 'direct',
    challenge: Uint8Array.from(randomStringFromServer, c => c.charCodeAt(0)),
    user: {
      id: Uint8Array.from('UZSL85T9AFC', c => c.charCodeAt(0)),
      name: 'abcd@webauthn.guide',
      displayName: 'Lee',
    },
    pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
    authenticatorSelection: {
      //authenticatorAttachment: 'webauthn-platform',
      authenticatorAttachment: 'cross-platform',
      requireResidentKey: true,
    },
    timeout: 60000,
    attestation: 'direct',
  };

  const [respData, setRespData] = useState<ResponseData | undefined>();

  const getCredentials = async () => {
    const credential = (await navigator.credentials.create({
      //@ts-ignore
      publicKey: publicKeyCredentialCreationOptions,
    })) as RegistrationCredential;
    if (credential?.id) {
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

      console.log(respData.credentialId);
      //store the credentialsId to demo Sign in
      localStorage.setItem('credentialId', respData.credentialId);
    }
  };

  const signIn = async () => {
    //const encodedCid = localStorage.getItem('credentialId') || '';

    // const publicKeyCredentialRequestOptions = {
    //   challenge: Uint8Array.from('some randome thing', c => c.charCodeAt(0)),
    //   allowCredentials: [
    //     {
    //       id: base64url.decode(encodedCid),
    //       type: 'public-key',
    //       //transports: ['ble', 'nfc'],
    //     },
    //   ],
    //   authenticatorSelection: {
    //     //authenticatorAttachment: 'webauthn-platform',
    //     authenticatorAttachment: 'cross-platform',
    //     requireResidentKey: true,
    //   },
    //   timeout: 60000,
    // };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialCreationOptions,
    });
    // const assertion = await navigator.credentials.get({
    //   publicKey: publicKeyCredentialRequestOptions,
    // });
    console.log(assertion);

    /*
    const storedCredential = await getCredentialFromDatabase(
      userHandle,
      decodedCid,
    );

    const signedData = authenticatorDataBytes + hashedClientDataJSON;

    const signatureIsValid = storedCredential.publicKey.verify(
      signature,
      signedData,
    );

    if (signatureIsValid) {
      return 'Hooray! User is authenticated! 🎉';
    } else {
      return 'Verification failed. 😭';
    }
    */
  };

  return (
    <div style={{ width: '100%' }}>
      <div>
        <button
          onClick={e => getCredentials()}
          type="button"
          style={{
            margin: '0 auto',
            display: 'block',
          }}
        >
          CLICK ME TO REGISTER!
        </button>

        <button
          style={{
            margin: '1rem auto 0 auto',
            display: 'block',
          }}
          type="button"
          onClick={e => signIn()}
        >
          CLICK ME TO AUTHENTICATE!
        </button>
      </div>

      {respData ? (
        <div style={{ marginTop: '30px' }}>
          <CodeBlock
            language="javascript"
            text={JSON.stringify(respData, null, 4)}
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

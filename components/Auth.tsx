import supabase from '@/libs/supabaseClient';
import { authenticate, getCredentials } from '@/libs/webauth';
import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { base64url } from '@/libs/base64url';
import CBOR from '../libs/cbor';

const Auth: React.FC<{ randomStringFromServer: string }> = ({
  randomStringFromServer,
}) => {
  const [username, setUsername] = useState<string>('John Doe');
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const registerAndOrSignIn = async () => {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('username', username)
      .single();
    if (error) {
      console.log(error);
    }

    if (!data) {
      handleRegister();
    } else {
      handleSignIn(data.credential_id, data.public_key);
    }
  };

  const handleSignIn = async (credentialId: string, publicKey: string) => {
    setIsBusy(true);
    const { signedData, signature } = await authenticate({
      credentialId,
      randomStringFromServer,
    });
    fetch('/api/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicKey,
        signedData,
        signature,
      }),
    });
  };

  const handleRegister = async () => {
    setIsBusy(true);
    const response = await getCredentials({
      randomStringFromServer,
      username,
    });

    if (response.credentialId && response.publicKeyBytes) {
      // save to supabase
      const { error } = await supabase.from('user').insert({
        username,
        credential_id: response.credentialId,
        public_key: response.publicKeyBytes,
      });
      if (error) {
        console.log(error);
      }
      // await handleSignIn(response.credentialId, response.publicKeyBytes);
    }
    setIsBusy(false);
  };

  return (
    <div className="w-screen h-screen grid place-items-center">
      <div className="flex flex-col justify-center items-center space-y-6 h-64 w-full sm:w-1/2 lg:w-1/3 bg-teal-500 px-6 py-10">
        {isBusy ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="relative flex flex-col">
              <input
                type="username"
                name="username"
                id="username"
                placeholder="Username"
                className="peer h-10 w-full border-b-2 border-gray-300 bg-transparent text-gray-100 placeholder-transparent focus:border-purple-600 focus:outline-none invalid:focus:border-red-500 dark:text-gray-100"
                onChange={e => setUsername(e.target.value)}
              />
              <label
                htmlFor="username"
                className="absolute -top-3.5 left-0 cursor-text text-sm text-gray-100 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-200 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-gray-100"
              >
                Username
              </label>
            </div>

            <button
              className="bg-white p-2 rounded shadow"
              onClick={registerAndOrSignIn}
            >
              Register/Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;

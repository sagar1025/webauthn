const Auth: React.FC<{ randomStringFromServer: string }> = ({
  randomStringFromServer,
}) => {
  return (
    <div className="w-screen h-screen grid place-items-center">
      <div className="flex flex-col items-center justify-center w-1/3 bg-teal-500 shadow">
        <span>Auth</span>
      </div>
    </div>
  );
};

export default Auth;

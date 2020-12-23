import React from 'react';
import { useState, useEffect } from 'react';

import { verifierFactory } from '@southlane/cognito-jwt-verifier';

const verify = verifierFactory({
  region: 'us-east-1',
  userPoolId: 'us-east-1_eB1Xdqe4i',
  appClientId: '11tk4h9tul8n81u9uv4nmpo5sn',
  tokenType: 'access', // either "access" or "id"
});

const App = ({ title }) => {
  const [token, setToken] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function validate(token) {
      try {
        const payload = await verify(token);
        setResult(`Payload: ${JSON.stringify(payload)}`);
      } catch (e) {
        setResult(`Error: ${JSON.stringify(e)}`);
      }
    }

    if (submitted) {
      validate(token);
    }
  }, [submitted]);

  return (
    <div>
      <form
        onSubmit={(event) => {
          setSubmitted(true);
          event.preventDefault();
        }}
      >
        <input
          onChange={(event) => {
            setSubmitted(false);
            setToken(event.target.value);
          }}
        />
        <button type="submit">Validate</button>
      </form>
      <p>Result: {result}</p>
    </div>
  );
};

export default App;

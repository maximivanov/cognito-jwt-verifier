# cognito-jwt-verifier

Verify ID and access JWT tokens from AWS Cognito in your node/Lambda backend
with minimal npm dependencies.

Why this library? I couldn't find anything checking
all the boxes for me:

- minimal dependencies
- framework agnostic
- JWKS (public keys) caching
- test coverage

## Getting Started

### Prerequisites

- Node.js version >=10.13.0

### Installing

```sh
npm i @southlane/cognito-jwt-verifier
```

## Usage

1. Set up a Cognito User Pool.
   Note **User Pool ID** on the "General Settings" page in AWS Console.
2. Within the User Pool, create an Application Client.
   Note **App Client ID** on the App Clients page.
3. Fetch ID/access tokens. Either by making an AWS SDK / Amplify call
   or from a Hosted UI redirect.

Now you can programmatically verify issued ID and access tokens:

```js
const {
  verifierFactory,
  errors: { JwtVerificationError, JwksNoMatchingKeyError },
} = require('@southlane/cognito-jwt-verifier')

// get a verifier instance. Put your config values here.
const verifier = verifierFactory({
  region: 'us-east-1',
  userPoolId: 'us-east-1_PDsy6i0Bf',
  appClientId: '5ra91i9p4trq42m2vnjs0pv06q',
  tokenType: 'id', // either "access" or "id"
})

// you can decode this token at jwt.io
const expiredToken =
  'eyJraWQiOiI0UFFoK0JaVExkRVFkeUM2b0VheVJDckVjblFDSXhqbFZFbTFVd2RhZ2ZNPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiQlNFSWQ1bkYyN3pNck45QkxYLVRfQSIsInN1YiI6IjI0ZTI2OTEwLWU3YjktNGFhZC1hOTk0LTM4Nzk0MmYxNjRlNyIsImF1ZCI6IjVyYTkxaTlwNHRycTQybTJ2bmpzMHB2MDZxIiwiZXZlbnRfaWQiOiJiNmQ3YTYyZC01NGRhLTQ5ZTYtYTgzOS02NjUwNmYwYzIxYjUiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTU4NzMxMTgzOCwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfUERzeTZpMEJmIiwibmFtZSI6Ik1heCBJdmFub3YiLCJjb2duaXRvOnVzZXJuYW1lIjoiMjRlMjY5MTAtZTdiOS00YWFkLWE5OTQtMzg3OTQyZjE2NGU3IiwiZXhwIjoxNTg3MzE1NDM4LCJpYXQiOjE1ODczMTE4MzgsImVtYWlsIjoibWF4QHNvdXRobGFuZS5jb20ifQ.GrlpeYQDwB81HjBZRkuqzw0ZXSGFBi_pbMoWC1QvHyPYrc6NRto02H4xgMls5OmCGa4bZBYWTT6wfo0bxuOLZDP__JRSfOyPUIbiAWTu1IiyAhbt3nlW1xSNSvf62xXQNveF9sPcvG2Gh6-0nFEUrAuI1a5QAVjXbp1YDDMr2TzrFrugW7zl2Ntzj42xWIq7P0R75S2JYVmBfhAxS6YNO1n8KpOFzxagxmn89leledx4PTxuOdWdmT6vZkW9q9QnOI9kjgUIxfWjx55205P4BwkOeqY7AN0j85LBwAHbhezfzNETybX1pwnMBh1p5_iLYgQMMZ60ZJseGl3cMRsPnQ'

try {
  const tokenPayload = await verifier.verify(expiredToken)
} catch (e) {
  if (
    e instanceof JwtVerificationError ||
    e instanceof JwksNoMatchingKeyError
  ) {
    // token is malformed, invalid, expired or cannot be validated with known keys
    // act accordingly, e.g. return HTTP 401 error
  }

  throw e
}
```

On successful verification `tokenPayload` will hold the body (payload) of the JWT:

```json
{
  "at_hash": "BSEId5nF27zMrN9BLX-T_A",
  "sub": "24e26910-e7b9-4aad-a994-387942f164e7",
  "aud": "5ra91i9p4trq42m2vnjs0pv06q",
  "event_id": "b6d7a62d-54da-49e6-a839-66506f0c21b5",
  "token_use": "id",
  "auth_time": 1587311838,
  "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_PDsy6i0Bf",
  "name": "Max Ivanov",
  "cognito:username": "24e26910-e7b9-4aad-a994-387942f164e7",
  "exp": 1587315438,
  "iat": 1587311838,
  "email": "max@southlane.com"
}
```

### Errors Thrown

- `TypeError` on invalid input arguments.
- `JwksFetchError` on failed https request to fetch JSON Web Key Set.
- `JwksNoMatchingKeyError` on JWT referencing key which is missing in the key set.
- `JwtVerificationError` on failed JWT verification.
  Inspect error object's `originalError` property to find out verification error
  details.

Underlying Jose library may throw lower-level errors,
like if you try to import invalid JWKS.
<https://github.com/panva/jose/blob/master/docs/README.md#errors>.
Those are not supposed to be thrown under normal course of operation and
probably signify a programmer's error.

### Leveraging Cache

Verifier instance you get from `verifierFactory()` call has an internal JWKS cache
to avoid hitting the network on subsequent calls.

Make sure verifier instance is shared across `verifier.verify()` calls.

## Running the Tests

### Unit and Integration Tests

Run tests:

```sh
npm run test
```

Run tests with coverage report:

```sh
npm run test-coverage
```

### Coding Style and Documentation Tests

Make sure code has no syntax errors and is properly formatted.
Make sure docs are valid Markdown.

```sh
npm run lint
```

### Security Tests

Make sure there are no known vulnerabilities in dependencies.

```sh
npm run audit-security
```

## Built With

- [Jose](https://github.com/panva/jose) - "JSON Web Almost Everything" -
  JWA, JWS, JWE, JWK, JWT, JWKS for Node.js with minimal dependencies
- [Mocha](https://github.com/mochajs/mocha),
  [Sinon](https://github.com/sinonjs/sinon),
  [Chai](https://github.com/chaijs/chai),
  [nyc](https://github.com/istanbuljs/nyc),
  [mock-req](https://github.com/diachedelic/mock-req),
  [mock-res](https://github.com/diachedelic/mock-res) - Testing, Mocking & Coverage
- [ESLint](https://github.com/eslint/eslint),
  [Prettier](https://github.com/prettier/prettier),
  [cspell](https://github.com/streetsidesoftware/cspell),
  [markdownlint-cli](https://github.com/igorshubovych/markdownlint-cli) -
  Linting & Formatting
- [commitlint](https://github.com/conventional-changelog/commitlint),
  [Husky](https://github.com/typicode/husky) - Commit Message Linting
- [audit-ci](https://github.com/IBM/audit-ci) - Package Security Audit

### Dependency Graph

```text
@southlane/cognito-jwt-verifier@0.1.2 (2 deps, 280.94kb, 120 files)
╰─┬ jose@1.26.0 (1 dep, 266.29kb, 108 files)
  ╰── @panva/asn1.js@1.0.0 (45.74kb, 18 files)
```

## Getting Help

If you have questions, concerns, bug reports, etc, please file an issue in this
repository's Issue Tracker.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of
conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available,
see the [releases on this repository](https://github.com/maximivanov/cognito-jwt-verifier/releases).

## License

This project is licensed under the MIT License -
see the [LICENSE.md](LICENSE.md) file for details

## Credits and references

- [Verifying a JSON Web Token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html)

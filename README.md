# cognito-jwt-verifier

Verify ID and access JWT tokens from AWS Cognito in your node/Lambda backend
or browser environment with minimal npm dependencies.

Why this library? I couldn't find anything checking
all the boxes for me:

- minimal dependencies
- framework agnostic
- JWKS (public keys) caching
- test coverage

This module is a thin layer on top of [jose](https://github.com/panva/jose)
(the only dependency), to make it easy to work with Cognito tokens.

## Getting Started

### Prerequisites

For the list of supported runtimes check [jose runtime support matrix](https://github.com/panva/jose#runtime-support-matrix).

### Installing

```sh
npm i @southlane/cognito-jwt-verifier
```

## Usage

### Obtain tokens from Cognito

1. Set up a Cognito User Pool.
   Note **User Pool ID** on the "General Settings" page in AWS Console.
2. Within the User Pool, create an Application Client.
   Note **App Client ID** on the App Clients page.
3. Fetch ID/access tokens. Either by making an AWS SDK / Amplify call or
   from a Hosted UI redirect.

   - (test flow for the Hosted UI and implicit flow) Create a new user
     in **General settings** / **Users and groups** / **Create user**.

   - Launch the Hosted UI: **App integration** / **App client settings**
     / **Launch Hosted UI**.

   - Enter login and password for the user you created. Set a new password.

   - Cognito will redirect you to the app's target URL (it doesn't have to
     resolve) and you can inspect ID and access tokens from the URL.

   - Use tokens to decode them at [jwt.io](https://jwt.io/) and/or test
     with this library.

### Verify issued ID and access tokens programmatically

```js
const { verifierFactory } = require('@southlane/cognito-jwt-verifier')

// get a verifier function instance. Put your config values here.
const verify = verifierFactory({
  region: 'us-east-1',
  userPoolId: 'us-east-1_PDsy6i0Bf',
  appClientId: '5ra91i9p4trq42m2vnjs0pv06q',
  tokenType: 'id', // either "access" or "id"
})

// you can decode this token at jwt.io
const expiredToken =
  'eyJraWQiOiI0UFFoK0JaVExkRVFkeUM2b0VheVJDckVjblFDSXhqbFZFbTFVd2RhZ2ZNPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiQlNFSWQ1bkYyN3pNck45QkxYLVRfQSIsInN1YiI6IjI0ZTI2OTEwLWU3YjktNGFhZC1hOTk0LTM4Nzk0MmYxNjRlNyIsImF1ZCI6IjVyYTkxaTlwNHRycTQybTJ2bmpzMHB2MDZxIiwiZXZlbnRfaWQiOiJiNmQ3YTYyZC01NGRhLTQ5ZTYtYTgzOS02NjUwNmYwYzIxYjUiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTU4NzMxMTgzOCwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfUERzeTZpMEJmIiwibmFtZSI6Ik1heCBJdmFub3YiLCJjb2duaXRvOnVzZXJuYW1lIjoiMjRlMjY5MTAtZTdiOS00YWFkLWE5OTQtMzg3OTQyZjE2NGU3IiwiZXhwIjoxNTg3MzE1NDM4LCJpYXQiOjE1ODczMTE4MzgsImVtYWlsIjoibWF4QHNvdXRobGFuZS5jb20ifQ.GrlpeYQDwB81HjBZRkuqzw0ZXSGFBi_pbMoWC1QvHyPYrc6NRto02H4xgMls5OmCGa4bZBYWTT6wfo0bxuOLZDP__JRSfOyPUIbiAWTu1IiyAhbt3nlW1xSNSvf62xXQNveF9sPcvG2Gh6-0nFEUrAuI1a5QAVjXbp1YDDMr2TzrFrugW7zl2Ntzj42xWIq7P0R75S2JYVmBfhAxS6YNO1n8KpOFzxagxmn89leledx4PTxuOdWdmT6vZkW9q9QnOI9kjgUIxfWjx55205P4BwkOeqY7AN0j85LBwAHbhezfzNETybX1pwnMBh1p5_iLYgQMMZ60ZJseGl3cMRsPnQ'

try {
  const tokenPayload = await verify(expiredToken)
} catch (e) {
  // token is malformed, invalid, expired or cannot be validated with known keys
  // act accordingly, e.g. return HTTP 401 Unauthorized error
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

Check [complete usage examples](./example).

### Errors Thrown

- `TypeError` on invalid input arguments.
- `JwtCognitoClaimValidationError` when token's `token_use` does not match.
- Instances of [`JOSEError`](https://github.com/panva/jose/blob/master/docs/modules/_util_errors_.md).

### Leveraging Cache

Verify function instance you get from `verifierFactory()` call has an internal
JWKS cache (via `jose`) to avoid hitting the network on subsequent calls.

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

### Coding Quality Tests

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
- [jose](https://github.com/panva/jose) - Universal "JSON Web Almost
  Everything" - JWA, JWS, JWE, JWT, JWK with no dependencies using native
  crypto runtimes

# gorest_tests

E2E test scenarios for user operations

Prerequisites:

- nodejs (v14 or later)
- npm

In https://gorest.co.in/my-account/access-tokens, create a Primary Token leaving all the parameters as default. Create second one naming it however you want and set it's rate limit/minute to 5, keep rest parameters as default.

Setup:

1. Clone this repository into local machine:

git clone https://github.com/Mackowi/gorest_tests.git

2. Navigate to the project directory and run

npm install

Configuration:

1. Create .env file in root of your project with:

TOKEN=your_primary_access_token
LOW_LIMIT_TOKEN=your_low_limit_access_token

Replace tokens with actual access tokens created in https://gorest.co.in/my-account/access-tokens.

Running tests:

To run the tests, execute npm test

To set up github actions CI, please add 2 action repository secrets, keeping the same names as for the local test execution.

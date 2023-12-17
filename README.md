# gorest_tests
E2E test scenarios for user operations  

Setup:
In https://gorest.co.in/my-account/access-tokens, create a Primary Token leaving all the parameters as default. Create also second one naming it however you want, but set it's limit to 5. In the root of your repository create a .env file where you need to create 2 variables: TOKEN and LOW_LIMIT_TOKEN. Paste your primary token as a TOKEN and the other with limit = 5 AS LOW_LIMIT_TOKEN.
module.exports = {
    "env": {
        "es2021": true,
        "node": true,
        "cypress/globals": true
    },
    "extends": [
        "standard-with-typescript",
        "plugin:cypress/recommended",
        "airbnb-base"
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "cypress"
    ],
    "rules": {
    }
}

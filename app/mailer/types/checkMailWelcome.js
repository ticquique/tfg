const options = (vars) => {
    return {
        "template": "checkMailWelcome",
        "message": {
            "to": vars.to
        },
        "locals": {
            "name": vars.name,
            "passurl": vars.url,
            "password": vars.password
        }
    }
}

module.exports.default = options;
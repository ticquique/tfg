const options = (vars) => {
    return {
        "template": "confirmMail",
        "message": {
            "to": vars.to
        },
        "locals": {
            "name": vars.name
        }
    }
}

module.exports.default = options;
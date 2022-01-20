

function Validator(options) {

    function validate(rule, inputElement, errorElement) {
        var errorMassage = rule.test(inputElement.value)

        if(errorMassage){
            errorElement.innerText = errorMassage
            inputElement.parentElement.classList.add('invalid')
        }
        else {
            errorElement.innerText = ''
            inputElement.parentElement.classList.remove('invalid')
        }
    }

    var formElement = document.querySelector(options.form)

    if(formElement) {

        options.rules.forEach((rule) => {
            const inputElement = formElement.querySelector(rule.selector)
            
            if(inputElement){
                
                const errorElement = inputElement.parentElement.querySelector('.form-message')

                // xử lý blur
                inputElement.onblur = function () {

                    validate(rule, inputElement, errorElement, errorElement)
                }

                // xử lý lúc đang nhập
                inputElement.oninput = () => {
                    errorElement.innerText = ''
                    inputElement.parentElement.classList.remove('invalid')
                }
            }
        })

    }
}


Validator.isRequired = function (selector) {
    return {
        selector,
        test: function (value) {
            return value.trim() ? undefined : "vui lòng nhập trường này -.-"
        }
    }
}

Validator.isEmail = function (selector) {
    return {
        selector,
        test: function (value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

            return regex.test(value) ? undefined : "trường này phải là email :v"
        }
    }
}

function Validator(options) {
   
    var selectorTestRules = {}

    function getParent(element, selector) {
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    function validate(inputElement, rule) {
        //value : inputElement.value
        // test : func testRules[i]

        // các test rules của selector
        const testRules = selectorTestRules[rule.selector]

        var errorMassage;
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)

        // lặp qua từng testRule 
        for (var i = 0; i < testRules.length; i++) {
            switch(inputElement.type){
                case 'radio':  
                case 'checkbox':
                    errorMassage = testRules[i](
                        formElement.querySelector(rule.selector+ ':checked')
                    )
                    break;

                default:
                    errorMassage = testRules[i](inputElement.value)
            }
            if (errorMassage) break;
        }

        if (errorMassage) {
            errorElement.innerText = errorMassage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMassage
    }

    // lấy element của form cần validate
    var formElement = document.querySelector(options.form)
    if (formElement) {

        // khi submit form
        formElement.onsubmit = (e) => {
            e.preventDefault()

            var isFormValid = true;

            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)

                if (!isValid) {
                    isFormValid = false;
                }
            })
            if (isFormValid) {
                // submit với javascript
                if (typeof options.onSubmit === 'function') {

                    var enableInputs = formElement.querySelectorAll('[name]:not([disable])')

                    // lặp qua các input của form, lưu các giá trị trong từng input vào biến values
                    var formValue = Array.from(enableInputs).reduce((values, input) => {
                        
                        switch(input.type){

                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break;

                            case 'checkbox':

                                if(!input.matches(':checked')){
                                    if(!Array.isArray(values[input.name])){
                                        values[input.name] = ''
                                    }
                                    return values
                                }

                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = []
                                }

                                values[input.name].push(input.value)
                                break;
                            
                            case 'file':
                                values[input.name] = input.files
                                break;

                            default:
                                values[input.name] = input.value
                        }

                        return values
                    }, {})

                    options.onSubmit(formValue)

                }
                // submit với hành vi mặc định
                else {
                    formElement.submit()
                }
            }
            else {

            }
        }

        // lặp qua các rule để xử lý sự kiện
        options.rules.forEach((rule) => {
            // mỗi rule gồm có selector và hàm test trả về message

            // lưu lại các rule.test cho mỗi selector
            if (Array.isArray(selectorTestRules[rule.selector])) {
                selectorTestRules[rule.selector].push(rule.test)
            } else {
                selectorTestRules[rule.selector] = [rule.test]
            }

            
            var inputElement = formElement.querySelector(rule.selector)

            if (inputElement) {
                // xử lý on blur
                inputElement.onblur = () => {
                    validate(inputElement, rule)
                }

                // xử lý đang nhập thông tin
                inputElement.oninput = () => {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            }
        })
    }
}

// Định nghĩa các rule
// Nguyên tắc của các rule

Validator.isRequired = function (selector, message) {
    return {
        selector,
        test: function (value) {
            return value ? undefined : message || 'vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'trường này phải là email'
        }
    }
}

Validator.minLength = function (selector, min, message) {
    return {
        selector,
        test: function (value) {
            return value.trim().length >= min ? undefined : message || `vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}

Validator.isConfirmed = function (selector, confirmValue, message) {
    return {
        selector,
        test: function (value) {
            return value === confirmValue() ? undefined : message || 'vui lòng nhập trường này'
        }
    }
}
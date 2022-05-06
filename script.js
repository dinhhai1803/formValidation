function Validator(options) {

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var selectorRules = {}
    
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage ;

        var rules = selectorRules[rule.selector]

        for (var i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value)
            if(errorMessage)
                break
        }
        
        if(errorMessage){
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        }
        else{
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage
    }
    
    var formElement = document.querySelector(options.form)
    
    if(formElement){

        formElement.onsubmit = function(e) {
            e.preventDefault()

            var isFormValid = true
            
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector); 
                var valid = validate(inputElement, rule)
                if(!valid)
                    isFormValid = false
                })
      
                
            if(isFormValid){
                
                if( typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function (values, input){
                        values[input.name] = input.value
                        return values
                    }, {})
                    options.onSubmit(formValues)
                }
                else {
                    formElement.submit()
                }
            }
        }


        
        options.rules.forEach(function(rule) {

            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }
            else{
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElement = formElement.querySelector(rule.selector);

            if(inputElement) {
                inputElement.onblur = function() {
                    validate(inputElement, rule)
                }
            }

            inputElement.oninput = function() {
                var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                errorElement.innerText = ''
                getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
            }
        })
    }
}

Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập thông tin'
        }
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Thông tin phải là email'
        }
    }
}

Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : message || 'Vui lòng nhập tối thiểu ' + min + ' ký tự'
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test : function(value) {
            return value === getConfirmValue() ? undefined : message || 'Gía trị nhập vào không chính xác'
        }
    }
}
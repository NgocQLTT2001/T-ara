//Đối tượng 'Validator'
function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement
        }

    }
    
    var selectorRules = {}

    //thực hiện validate 
    function validate (inputElement, rule) { // Thực hiện hiện ra lỗi và bỏ lỗi đi 
        // var errorElement = getParent(inputElement, '.form-group')
        //Lấy value: inputElement.value
        //test function: rule.test 
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage 
        //Lấy ra các rules của selector 
        var rules = selectorRules[rule.selector]

        //lạp qua tùng rule & kiểm tra
        //Nếu có lỗi thì dừng việc kiểm
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default: 
                errorMessage = rules[i](inputElement.value)
            }
            if (errorMessage) break; 
        } 

        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage
    }

    //Lấy element của form cần validate 
    var formElement = document.querySelector(options.form)
    if (formElement) {

        // Khi submit form 
        formElement.onsubmit = function(e) {
            e.preventDefault()

            var isFormValid = true 

            //Thực hiện lặp qua rừng rules và validate  
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            })
            
            if (isFormValid) {
                //trường hợp submit vs JS
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function (values, input){
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="'+ input.name +'"]:checked').value
                            break;
                            case 'checkbox':
                                if (!input.matches (':checked')) {
                                    return values 
                                }

                                if (!values[input.name]) {
                                    values[input.name] =''
                                }

                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                } 

                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name]= input.files
                                break;
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {})
                    
                    options.onSubmit(formValues)                   
                } 
                //submit vs hành vi mặc định
                else {
                    formElement.submit()
                }
            }
        }
            // Lặp qua mỗi rule và xử lý ( lắng nghe sự kiện blur, input,...)
        options.rules.forEach(function (rule) {

            //Lưu lại các rule trong mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector)
            
            Array.from(inputElements).forEach(function (inputElement) {
                //Xử lý trường hợp blur ra khỏi input 
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }

                //Xử lý mỗi khi người dùng nhập vào input 
                inputElement.oninput = function () {
                    var errorElement =getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            })
        })
        
    }

}

    //Định nghĩa rules (điều luật bắt buộc trong form)
    // Nguyên tắc của các rules:
    //1. Khi có lỗi => trả ra message lỗi
    //2. khi hợp lệ => k trả ra cái j cả (undefined )
    Validator.isRequired = function(selector, message) { // kiểm tra xem người dùng đã nhập chưa 
        return {
            selector: selector,
            test: function(value) {
                return value ? undefined : 'Vui lòng nhập trường này!'
            }
        }
    }

    Validator.isEmail = function(selector, message) {// Kiểm tra xem có phải là email hay k 
        return {
            selector: selector,
            test: function(value) {
                var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                return regex.test(value) ? undefined : 'Trường này phải là Email!'
            }
        }
    }

    Validator.minLength = function(selector, min, message) {// Kiểm tra passmord hợp lệ k
        return {
            selector: selector,
            test: function(value) {
                return value.length >= min ? undefined :`Vui lòng nhập tối thiểu ${min} kí tự`
            }
        }
    }

    //Kiểm tra lại mật khẩu 
    Validator.isConfirmed = function(selector, getConfirmValue, message) {
        return {
            selector: selector,
            test: function(value) {
                return value === getConfirmValue() ? undefined : message ||'Giá trị nhập vào không chính xác!'
            }
        }
    }


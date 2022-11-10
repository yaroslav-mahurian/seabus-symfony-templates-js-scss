class CheckoutForm {
    constructor(firstName, phone, street, house, entrance, floor, apartment, notes) {
        this.firstName = firstName;
        this.phone = phone;
        this.street = street;
        this.house = house;
        
        this.entrance = entrance;
        this.floor = floor;
        this.apartment = apartment;
        this.notes = notes;
    }
}

function validateForm (fields) {
    const errors = [];
    fields.forEach(field => {
        if(field.dataset.validate !== undefined) {
            formFieldValidate(field, errors);
        }
    });

    return errors;
}

// Validate fields
function formFieldValidate (field, errors) {
    const validateInfo = {
        firstName: {
            typeError: ["empty", "invalid"],
            regExp: /^([a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻа-яёА-Я]{2,20})$/gm,
            errors: ["Type your name", "Name required characters contain а-я or a-z only."]
        },
        phone: {
            typeError: ["empty", "invalid"],
            regExp:/^[\d() +-]{12,20}$/gm,
            errors: ["Type your phone", "Incorrect format."]
        },
        street: {
            typeError: ["empty", "invalid"],
            errors: ["Type your street", "Incorrect format."]
        },
        house: {
            typeError: ["empty", "invalid"],
            errors: ["Type your house number", "Incorrect format"]
        },
    };
    let value = "";
    if (field.value) {
        valueRaw = field.value.trim();
        value = valueRaw.replace(' ', '');
    } else {
        valueRaw = field.textContent.trim();
        value = valueRaw.replace(' ', '');
    }

    let fieldType = field.dataset.checkoutFormInput;

    const validator = validateInfo[fieldType];

    if (validator) {
        if (!value) {
            field.classList.add('error');
            field.dataset.typeError = validator.typeError[0];
            errors.push(createError(fieldType, validator.typeError[0], validator.errors[0]));
        } else if (validator.regExp && !validator.regExp.test(value)) {
            field.classList.add('error');
            field.dataset.typeError = validator.typeError[1];
            errors.push(createError(fieldType, validator.typeError[1], validator.errors[1]));
        } else {
            field.removeAttribute("data-type-error");
            field.classList.remove('error');
        }
    }
}

function createError (fieldName, type, text) {
    return {
        field: fieldName,
        type: type,
        errorText: text
    };
}

// Get fields
function getFormData (DOMFields) {
    const formFields = document.querySelectorAll(DOMFields);
    const errors = validateForm(formFields);
    let receivedObj = {};
    
    /* function showErrors(errorsArr) {
        errorsArr.forEach((error) => {
            let field = document.querySelector(`${DOMFields.slice(0, DOMFields.length - 1 )} = ${error.field}]`);
            field.placeholder = error.errorText;
            field.classList.add("input-error");
        });
    }

    showErrors(errors); */

    if (!errors.length) {
        let args = [];
        let value ="";  
        if (DOMFields === '[data-checkout-form-input]') {
            formFields.forEach(field => {
                if (field.value) {
                    value = field.value.trim();
                    args.push(value);
                } else {
                    value = field.textContent.trim();
                    args.push(value);
                }
                //clear fields
                //field.value = "";
            });
            receivedObj = new CheckoutForm(...args);
        }
        return receivedObj;
    }
}
    

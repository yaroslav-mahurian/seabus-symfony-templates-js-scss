class Customer {
    phoneSelector = '#loginPhone'
    otpSelector = '#loginOtp'
    verifyForm = '.login-otp-code'
    token = ''

    login() {
        event.preventDefault();
        event.stopPropagation();
        let telephone = $(this.phoneSelector).val().trim();
        let regexp = /^[\d() +-]{13,}$/gm;
        if(telephone.match(regexp) !== null) {
            $(this.phoneSelector).removeClass('error');
            $.ajax({
                url: `/customer/loginPost`,
                method: 'POST',
                data: {
                    telephone: telephone
                },
                context: document.body
            }).done((response) => {
                if (response.message == 'Success') {
                    this.token = response.token
                    console.log(this.token)
                    this.showVerify()
                }
    
            })
        } else {
            $(this.phoneSelector).addClass('error');
        } 
    }

    verify() {
        event.preventDefault();
        event.stopPropagation();
        let otp = $(this.otpSelector).val()
        $.ajax({
            url: `/customer/verifyLogin`,
            method: 'POST',
            data: {
                otp: otp,
                token: this.token
            },
            context: document.body
        }).done((response) => {
            if (response.message == 'Success') {
                let language = localStorage.getItem('locale')
                window.location.replace(`/${language}/customer`)
            }
        })
    }

    showVerify(){
        $('.modal-option').removeClass('active')
        $(this.verifyForm).addClass('active')
    }
}


var customer = new Customer();
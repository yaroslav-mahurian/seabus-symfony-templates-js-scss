class CheckoutAutofill {
    constructor() {
        
    }
  
    init()  {
      jQuery(function($) {
        const autofillCheckout = {};

        autofillCheckout.init = function() {
          autofillCheckout.checkStorage()
        }

        autofillCheckout.checkStorage = function() {

          // get values from storage
          let formValues = window.localStorage.getItem('sb_checkout_form');
          if( formValues && JSON.parse( formValues ) ) {
              formValues = JSON.parse( formValues );
              
              for (const name in formValues) {
                  const value = formValues[name];
                  if( value && name ) {
                      // loop over saved values and fill in the corresponding form input
                      let $input = $("input[name='" + name + "']");
                      if( $input.length ) {
                          
                          // radio buttons are handled differently than other inputs
                          if( $input.attr('type') === 'radio' ) {
                              $input.filter('[value="' + value + '"]').attr('checked', true);
                          } else if($input.attr('name') !== 'shipping_method[0]' &&  $input.val() == "") {
                              $input.val( value );
                          }
                          
                      }
                  }
                  
              }
          }
        
        
        // listen for new changes
        autofillCheckout.startListener();
  
        }


  
        // listen for form changes and save values as needed
        autofillCheckout.startListener = function() {
            const $form = $('form.form.form--checkout');
            $form.on('change', function(event) {
              let checkoutForm = {};
              $('.checkout-step--shipping :input').each(function() {
                if( !$(this)[0] ) return;
                
                // don't save hidden or CC inputs
                if( $(this)[0].type === 'hidden' || $(this)[0].id === 'shippingStreet' || $(this)[0].name === 'shipping_method[0]' || $(this)[0].classList.contains('__PrivateStripeElement-input') || $(this)[0].autocomplete === 'cc-number' ) {
                    return;
                }

                let name = ( $(this)[0] ? $(this)[0].name : null );
                if( !name ) return;

                let value = $(this).val();

                // radio buttons are handled differently
                if( $(this)[0].type === 'radio' ) {
                    
                    if( !$(this).is(":checked") ) {
                        return;
                    }
                }



                if( value ) {
                    checkoutForm[name] = value;
                }
  
              });
  
              // save all values to browser storage on each change
              window.localStorage.setItem('sb_checkout_form', JSON.stringify( checkoutForm ));
            })
        }
  
        autofillCheckout.init();
      })
    }
}

var checkoutAutofill = new CheckoutAutofill();
checkoutAutofill.init();
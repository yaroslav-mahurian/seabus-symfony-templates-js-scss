class Wishlist {
    counter = 'wishlist_products_counter_number'

    addToWishlist(productId) {
        var e = event;
        var el = $(e.target).closest('[data-wishlist-btn]');
        event.preventDefault();
        event.stopPropagation();
        $.ajax({
            url: `/wishlist/add/${productId}`,
            context: document.body
        }).done((response) => {
            if (response.count) {
                $(`.${this.counter}`).html(response.count)
            }

            jQuery(function($) {
                $('.wishlist_products_counter').addClass("animated");

            
                $('.wishlist_products_counter').on("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
                    $(this).removeClass("animated");
                });
            });
            
            $(el).find('.fav-icon-no-fill').hide();
            $(el).find('.fav-icon-fill').show();
            /* $(el).attr('onclick', 'wishlist.removeFromWishlist('+ productId +')'); */
        })
    }

    removeFromWishlist(productId) {
        var e = event;
        var el = $(e.target).closest('[data-wishlist-btn]');
        e.preventDefault();
        e.stopPropagation();
        $.ajax({
            url: `/wishlist/remove/${productId}`,
            context: document.body
        }).done((response) => {
            /* if (response.count) {
                $(`.${this.counter}`).html(response.count)
            } */
            document.location.reload();
        })
    }

    updateWishlistContent(content) {
        /** @todo implement **/
    }
}
var wishlist = new Wishlist();
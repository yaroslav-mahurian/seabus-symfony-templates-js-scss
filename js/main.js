import SwiperJS from './libs/swiper';
import Checkout from './checkout';
import MyAccount from './my-account';
import CheckoutAutofill from './checkout-autofill';

 //SwiperJS init
const swiperJS = new SwiperJS();
swiperJS.init(); 


//Checkout Page Scripts init
const checkoutPageScripts = new Checkout();
checkoutPageScripts.init();

//My account Page Scripts init
const myAccountPageScripts = new MyAccount();
myAccountPageScripts.init();

//Checkout autofill scripts init
const CheckoutAutofillScripts = new CheckoutAutofill();
CheckoutAutofillScripts.init();

const body = document.querySelector('body');

/* Header */
const header = document.querySelector(".header");
const headerBurger = document.querySelector('#headerBurger');
const headerNav = document.querySelector('#headerNav');
const headerNavWrapper = document.querySelector('.header__nav-wrapper');

/* Open header menu */
if(headerBurger) {
  headerBurger.addEventListener("click", function() {
    headerNav.classList.toggle('is-active');
    body.classList.toggle('no-scroll');
  });
}

/* Close header menu */
body.addEventListener('click', function(e){
  if(e.target.closest('.header__nav-wrapper') === null && e.target.className !== "hamburger-inner" && e.target.className !== "hamburger-box" && e.target.id !== "headerBurger") {
    headerNav.classList.remove('is-active');
    body.classList.remove('no-scroll');
  }

  if(e.target.closest('.ma-login') === null && e.target.closest('[data-header-login-popup]') === null && e.target.closest('.swal-overlay') === null) {
    document.querySelector('.custom-login-form').classList.remove('is-active');
  }


  if(e.target.closest('.ma-login__close')) {
    document.querySelector('.custom-login-form').classList.remove('is-active');
  }

});


const headerSub = document.querySelector(".header-sub");
const headerHeight = header.clientHeight;

const sidebar = document.querySelector('.sidebar');
const sidebarLogo = document.querySelector('.sidebar-logo');
headerSub.style.height = headerHeight + "px";
var subcategoriesBlockOffset;
if(jQuery('.subcategories').length !== 0) {
  subcategoriesBlockOffset = jQuery('.subcategories').offset().top;
}

/* Sticky header */
window.addEventListener("scroll", function() {
  const scrolled = window.pageYOffset;

  if(jQuery('.subcategories').length !== 0 && subcategoriesBlockOffset !== undefined) {
    if(scrolled >= subcategoriesBlockOffset){
      var headerInnerHeight = jQuery('.header').innerHeight();
      //var subcategoriesHeight = jQuery('.subcategories-slider').height();
      var subcategoriesWithPaddingHeight = jQuery('.subcategories').height();
      
      var stickySubcategoriesOffset = headerInnerHeight - 2 + "px";
      jQuery('.subcategories').addClass('sticky');
      jQuery('.subcategories').css('top', stickySubcategoriesOffset);
      jQuery('.subcategories').find('.container').removeClass('container--subcategories');
      jQuery('.subcategories-sub').css('height', subcategoriesWithPaddingHeight);
      sidebar.style.marginTop = subcategoriesWithPaddingHeight + 'px';
      jQuery('.header').addClass('bs-none');
    } else {
      jQuery('.subcategories').removeClass('sticky');
      jQuery('.subcategories-sub').css('height', 0 + 'px');
      jQuery('.subcategories').find('.container').addClass('container--subcategories');
      sidebar.style.marginTop = 0 + 'px';
      jQuery('.header').removeClass('bs-none');

    }
  }
  
  
  if(window.innerWidth >= 1199) {
    
    if (scrolled >= headerHeight / 2) {
      header.classList.add('sticky');
      headerSub.classList.add('is-active');
      sidebarLogo.style.display = "none";
      sidebar.classList.add('sticky');
    }  else {
      header.classList.remove('sticky');
      headerSub.classList.remove('is-active');
      sidebarLogo.style.display = "block";
      sidebar.classList.remove('sticky');
    }
  }
});

/* if(window.innerWidth >= 1199) {
  const sidebarHeight = document.querySelector(".sidebar__wrapper").clientHeight;
  const sectionBlock = document.querySelectorAll(".container--section");
  sectionBlock.forEach(function(item){
    item.style.minHeight = sidebarHeight + "px";
  });
  
}*/

if(window.innerWidth <= 1199) {
  const sidebarHeight = document.querySelector(".sidebar").clientHeight;
  const sectionBlock = document.querySelector(".section");
  if(sectionBlock) {
    sectionBlock.style.marginBottom = sidebarHeight + 15 + "px";
  }
  
}

const navDropdownEls = Array.from(document.querySelectorAll('.nav__dropdown'));
const navDropdownSeparatedEls = Array.from(document.querySelectorAll('.nav__dropdown-separated'));

if(navDropdownSeparatedEls) {
  navDropdownSeparatedEls.forEach(function(item) {
    navDropdownEls.push(item);
  });
} 

if(navDropdownEls) {
  navDropdownEls.forEach(function(item) {
    if(window.innerWidth >= 1200) {
      item.addEventListener("mouseover", function(){
        item.classList.add('is-active');
      });
    
      item.addEventListener("mouseout", function(){
        item.classList.remove('is-active');
      });
    }
  
    item.addEventListener("click", function(){
      item.classList.toggle('is-active');
    });
  
  });
}

/* Sidebar */

// Remove animation eventlistener
const sidebarWrapper = document.querySelector('.sidebar__wrapper');
sidebarWrapper.addEventListener('scroll', function(){
  sidebarWrapper.classList.remove('animated');
});

/* Set active sidebar categories */
/* jQuery(function($) {
  if($('.sidebar-subcategories').find('.current-category').length != 0) {
    var parentCategoryID = $('.sidebar-subcategories').find('.current-category').attr('data-subcategory-parent-id');
    
    $('.sidebar-categories').find('[data-category-id='+ parentCategoryID +']').addClass('current-category');
  }
}); */

/* Init sticky sidebar function */
function updateSidebarStyles() {
  jQuery('.header').removeClass('sticky');
  jQuery('.sidebar').removeClass('sticky');
  jQuery('.subcategories').removeClass('sticky');

  if(window.innerWidth >= 1199 && window.innerHeight >= 768 && window.innerHeight <= 1080) {
    jQuery(function($) {
      var subcategoriesHeight = 0;
      if($('.subcategories').length !== 0) {
        subcategoriesHeight = $('.subcategories').height();
      }
    
      var sidebarCategoriesHeight = $(window).height() - headerHeight - 40 - subcategoriesHeight;
      var sidebarCategoryFontSize = sidebarCategoriesHeight * 0.02;
      var sidebarCategoryIconHeight = sidebarCategoriesHeight * 0.03;
    
      document.documentElement.style.setProperty('--category-icon-height', sidebarCategoryIconHeight.toFixed() + 'px');
      $('.sidebar-categories').css('height', sidebarCategoriesHeight);
      $('.sidebar-category__text').css('font-size', sidebarCategoryFontSize.toFixed() + 'px');
      $('.sidebar-category__icon.svg').css('height', sidebarCategoryIconHeight);
    });
  } else if(window.innerWidth < 1199) {
    jQuery('.sidebar-logo').css('display', 'none');
    jQuery('.sidebar-categories').css('height', '');
    jQuery('.sidebar-category__text').css('font-size', '');
    jQuery('.sidebar-category__icon.svg').css('height', '');
  } else {
    document.documentElement.style.setProperty('--category-icon-height', '50%');
  }
}

jQuery(window).on('resize', function(){
  updateSidebarStyles();
});
  
updateSidebarStyles();
 
/* Wishlist scripts */
jQuery(function($) {
  jQuery(document.body).on('tinvwl_wishlist_mark_products', function() {
    $('.wishlist_products_counter').addClass("animated");
  });

  $('.wishlist_products_counter').on("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
    $(this).removeClass("animated");
  });
});

/* Product page */
jQuery(function($) {
  $('.thwepo-extra-options').find('input[type="number"]').niceNumber();
});

/* Modal */
jQuery(function($) {
  $('[data-open-modal-shop]').on('click', function(){
      $('[data-modal-shop]').addClass('is-active');
  });

  $('.modal-header-close').on('click', function(){
      $(this).parents('.modal').removeClass('is-active');
      $(this).parents('.modal').removeClass('is-active-mobile');
  }); 
});

/* ------------- Mobile vh fix func------------- */
let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);
window.addEventListener('resize', () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
});


class Checkout {
	step = 0;
	cartCounterSelector = ".vi-wcaio-sidebar-cart-count";
	cartSelector = ".cart";
	footerSelector = ".cart__footer";
	cartItemsSelector = ".quote-items";
	loaderSelector = ".cart__loader";

	constructor() {}

	getProducts() {
		var products = [];
		$(".vi-wcaio-sidebar-cart-products  .vi-wcaio-sidebar-cart-pd-wrap").each(function (index) {
			var product = $(this);
			products.push({
				name: product.data("name"),
				id: product.data("product-id"),
				price: product.data("price"),
				brand: "Seabus",
				category: product.data("category"),
				quantity: product.data("quantity"),
				affiliation: "Warsaw",
			});
		});

		return products;
	}

	sendDataLayer(step) {
		window.dataLayer = window.dataLayer || [];
		dataLayer.push({
			ecommerce: {
				currencyCode: "PLN",
				checkout: {
					actionField: { step: step },
					products: this.getProducts(),
				},
			},
			event: "gtm-ee-event",
			"gtm-ee-event-category": "Enhanced Ecommerce",
			"gtm-ee-event-action": "Checkout Step " + step,
			"gtm-ee-event-non-interaction": "False",
		});

		console.log(window.dataLayer);
	}

	sendFbq() {
		var revenue = 0;
		var shipping = 0;

		if ($("#cartSubtotal").length > 0) {
			revenue = parseInt($("#cartSubtotal").data("value"));
		}

		var products = [];
		$(".vi-wcaio-sidebar-cart-products  .vi-wcaio-sidebar-cart-pd-wrap").each(function (index) {
			var product = $(this);
			products.push(product.data("product-id"));
		});

		fbq("track", "InitiateCheckout", {
			value: revenue,
			currency: "PLN",
			content_name: "Checkout",
			content_type: "product",
			content_category: "Checkout",
			content_ids: products,
			num_items: products.length,
		});
	}

	orderDataLayer(order_id) {
		var revenue = 0;
		var shipping = 0;

		if ($("#cartSubtotal").length > 0) {
			revenue = parseInt($("#cartSubtotal").data("value"));
		}
		if ($("#cartDelivery").length > 0) {
			shipping = parseInt($("#cartDelivery").data("value"));
		}
		window.dataLayer = window.dataLayer || [];
		dataLayer.push({
			ecommerce: {
				currencyCode: "PLN",
				purchase: {
					actionField: {
						id: order_id,
						revenue: revenue,
						tax: 0,
						shipping: shipping,
						coupon: "",
						affiliation: "Warsaw",
					},
					products: this.getProducts(),
				},
			},
			event: "gtm-ee-event",
			"gtm-ee-event-category": "Enhanced Ecommerce",
			"gtm-ee-event-action": "Purchase",
			"gtm-ee-event-non-interaction": "False",
		});

		var products = [];
		$(".vi-wcaio-sidebar-cart-products  .vi-wcaio-sidebar-cart-pd-wrap").each(function (index) {
			var product = $(this);
			products.push(product.data("product-id"));
		});

		fbq("track", "Purchase", {
			value: revenue,
			currency: "PLN",
			content_name: "Checkout",
			content_type: "product",
			content_category: "Checkout",
			content_ids: products,
			num_items: products.length,
		});

		console.log(window.dataLayer);
	}

	switchStep(direction) {
		var e = event;
		e.preventDefault();
		e.stopPropagation();
		var currentStep = this.step;
		var step;
		var errorMessage = jQuery("#cartNoShippingZoneMsg").attr("data-message");

		if (direction == "next") {
			step = currentStep + 1;
			this.step = step;
		} else if (direction == "back") {
			step = currentStep - 1;
			this.step = step;
		}

		jQuery("[data-checkout-step]").hide();
		jQuery("[data-checkout-btn-back]").hide();

		// If form need validation
		if (jQuery(e.target).closest(".btn").attr("data-validate-form") !== undefined) {
			let receivedObj = getFormData("[data-checkout-form-input]");

			// If form validation passed
			if (receivedObj != undefined) {
				// If shipping zone is true
				if (jQuery(e.target).closest(".btn").attr("data-no-shipping-zone") == undefined) {
					jQuery("[data-checkout-step=" + step + "]").show();
				} else {
					// Show no shipping zone notice
					if (!jQuery(".cart__warning-wrap").length) {
						jQuery("body").append(
							'<div class="cart__warning-wrap cart__warning-wrap-open">' + errorMessage + "</div>"
						);
					} else {
						jQuery(".cart__warning-wrap")
							.removeClass("cart__warning-wrap-close")
							.addClass("cart__warning-wrap-open");
						jQuery(".cart__warning-wrap").html(errorMessage);
					}
					this.step = step - 1;
					jQuery("[data-checkout-step=" + this.step + "]").show();
				}
			} else {
				this.step = step - 1;
				jQuery("[data-checkout-step=" + this.step + "]").show();
			}
		} else {
			jQuery("[data-checkout-step=" + step + "]").show();
		}

		if (step >= 1) {
			jQuery("[data-checkout-btn-back]").show();
		}

		if (step == 1 || step == 2) {
			this.sendDataLayer(step);
		}
		if (step == 1) this.sendFbq();

		// Step shipping
		if (step == 1 && direction !== "back") {
			var $this = this;
			// Show / hide fields depending on chosen shipping method
			function refreshShipFieldsDisplay() {
				if ($("#shipping_method_delivery").is(":checked")) {
					$("#shippingStreet").show();
					$("#shippingHouseNumber").show();
					$("#shippingEntrance").show();
					$("#shippingFloor").show();
					$("#shippingApartment").show();
					$("#shippingHouseNumber").attr("data-validate", "");
					$("#shippingStreet").attr("data-validate", "");
				} else if ($("#shipping_method_localpickup").is(":checked")) {
					$("#shippingStreet").hide();
					$("#shippingHouseNumber").hide();
					$("#shippingEntrance").hide();
					$("#shippingFloor").hide();
					$("#shippingApartment").hide();
					$("#shippingHouseNumber").removeAttr("data-validate");
					$("#shippingStreet").removeAttr("data-validate");
				}
			}

			function initStreetInput() {
				if (!$("#shippingStreet").hasClass("ui-autocomplete-input")) {
					if ($("#shippingStreet").length !== 0) {
						$("#shippingStreet")
							.autocomplete({
								minLength: 3,
								source: function (request, response) {
									$.ajax({
										type: "GET",
										url: `/street/search/${request.term}`,

										success: function (data) {
											var results = [];

											$.map(data.result, function (item) {
												results.push({ id: item.id, name: item.name, value: item.name });
											});
											if (results.length > 10) {
												response(results.slice(0, 10));
												$("ul.ui-autocomplete").append(
													"<div class='ui-menu-item ui-menu-item-div'>...</div>"
												);
												$("#shippingStreet").focusout(function () {
													$(this).val("");
												});
											} else if (results.length == 0) {
												response(results);
												$("#shippingStreet").focusout(function () {
													$(this).val("");
												});
											} else {
												response(results);
												$("#shippingStreet").focusout(function () {
													$(this).val("");
												});
											}
										},
									});
								},
								select: function (event, ui) {
									var currentstreetId = ui.item.id;
									$("#streetId").val(currentstreetId);
									$("form.form.form--checkout").trigger("change");
									$("#shippingStreet").off("focusout");
									$this.showLoader();
									setTimeout(function () {
										$this.updateDeliveryCost();
									}, 150);
								},
							})
							.autocomplete("instance")._renderItem = function (ul, item) {
							return $("<li>")
								.append(
									"<div id=" +
										item.id +
										" class='ui-menu-item-div' value=" +
										item.value +
										">" +
										item.name +
										"</div>"
								)
								.appendTo(ul);
						};

						// Disable street input chrome autocomplete
						$("#shippingStreet").attr("autocomplete", "chrome-off");
					}
					/* var chosenStreet = $( "#shippingStreet").val();
                        var streetid = $('#shippingStreet').find('option[value="'+ chosenStreet +'"]').attr('data-streetid');
                        $('#shipping_iiko_street_id').val(streetid); */
				}
			}

			initStreetInput();
			refreshShipFieldsDisplay();
			$(document).off("click", 'input[name="shippingMethod"]');
			$(document).on("click", 'input[name="shippingMethod"]', function () {
				refreshShipFieldsDisplay();
				$this.updateDeliveryCost();
				// Scroll to street field
				if ($(this).attr("id") == "shipping_method_delivery") {
					$(".cart__content").animate(
						{
							scrollTop: $("#shippingHouseNumber").offset().top,
						},
						1000
					);
				}
			});

			// init country code autofill
			if (!$("#shippingPhone").hasClass("initialized")) {
				$("#shippingPhone").on("keyup", function () {
					if (this.value.includes("+48 ") === false) {
						this.value = "+48 " + this.value.substr(this.value.indexOf(" ") + 1);
						this.value = this.value.replace("+48 +48", "+48 ");
					}
				});
				$("#shippingPhone").addClass("initialized");
			}

			this.updateDeliveryCost();

			$("#shippingCity")
				.off()
				.on("change", function () {
					$this.updateDeliveryCost();
				});

			$("#shippingHouseNumber")
				.off()
				.on("focusout", function () {
					$this.updateDeliveryCost();
				});
		}

		// Step payment
		if (step == 2 && direction !== "back") {
			var $this = this;
			// init date field
			if (jQuery("#shipping_method_localpickup").is(":checked")) {
				jQuery("#shippingDate").attr("data-shipping-zone", "local");
			}
			this.initDatePickerInput("#shippingDate");

			jQuery(function ($) {
				// console.log(getCookie('utm_source'))
				// Init checkout number fields
				$("[data-nice-number]").niceNumber();

				// Form input description
				$(".fieldset.has-description")
					.find("label")
					.each(function (index, item) {
						$(item).click(function () {
							if (
								$(item)[0] !=
								$(item).closest(".fieldset.has-description").find("label.is-active")[0]
							) {
								$(item)
									.closest(".fieldset.has-description")
									.find("label.is-active")
									.next(".form__input-description")
									.slideUp(300);
								$(item)
									.closest(".fieldset.has-description")
									.find("label.is-active")
									.removeClass("is-active");
							}

							$(item).addClass("is-active");
							$(item).next(".form__input-description").slideDown(300);
							$(".cart__content").animate(
								{
									scrollTop: $(item).next(".form__input-description").offset().top,
								},
								1000
							);
						});
					});

				var initAddProducts = function () {
					// init custom checkout qty field
					function updateAddProducts() {
						$("[data-additional-product]").each(function (index, item) {
							var prodID = $(item).attr("data-additional-product");

							var cartItemProd = $(".vi-wcaio-sidebar-cart-products").find(
								'[data-product-id="' + prodID + '"]'
							);

							if (cartItemProd.length) {
								var qty = $(cartItemProd).find("[data-product-qty]").val();
								var quoteID = $(cartItemProd).attr("data-item-id");

								$(item).find("[data-additional-product-input]").val(qty);
								$(item).attr("data-item-id", quoteID);
							} else {
								$(item).find("[data-additional-product-input]").val(0);
								$(item).attr("data-item-id", "");
							}
						});
					}

					updateAddProducts();

					$("[data-minus-qty-additional-product]")
						.off()
						.on("click", function () {
							$(this).css("pointer-events", "none");
							updateAddProducts();

							// Find input
							var currentInput = $(this)
								.parent("[data-additional-product]")
								.find("[data-additional-product-input]");

							// Get item id
							var quoteItemID = $(this).parent("[data-additional-product]").attr("data-item-id");

							// Get input value
							var currentVal = currentInput.val();

							// Update input value
							if (currentInput.val() !== currentInput.attr("min")) {
								currentInput.val(parseInt(currentVal) - 1);
							}

							if (currentInput.val() == "0") {
								checkout.removeFromCard(quoteItemID);
							} else {
								checkout.updateQty(quoteItemID, currentInput.val());
							}

							$(this).css("pointer-events", "auto");
						});

					$("[data-plus-additional-product-input]")
						.off()
						.on("click", function () {
							$(this).css("pointer-events", "none");

							// Find input
							var currentInput = $(this)
								.parent("[data-additional-product]")
								.find("[data-additional-product-input]");

							// Get input value
							var currentVal = currentInput.val();

							// Update input value
							currentInput.val(parseInt(currentVal) + 1);

							$(this).css("pointer-events", "auto");
						});
				};

				initAddProducts();
			});
		}
	}

	addToCard(productId, disableLoader) {
		event.preventDefault();
		event.stopPropagation();

		var qtyValue = 1;

		if ($(event.target).attr("data-consider-qty") !== undefined) {
			qtyValue = $(event.target).closest(".products-el").find(".products-el__qty-input").val();
		}

		var locale = window.localStorage.getItem("locale");
		$.ajax({
			url: `/${locale}/cart/add/${productId}/${qtyValue}`,
			context: document.body,
		}).done((response) => {
			if (response.cart) {
				this.updateCartContent(response.cart);
				$(this.cartCounterSelector).html(response.count);
			}

			if (response.footer) {
				$(this.footerSelector).html(response.footer);
			}

			if (response.subtotal) {
				$("#cartSubtotal").html(response.subtotal.toFixed(2));
			}
			this.updateCartSteps();
			if (disableLoader !== undefined) {
				this.updateDeliveryCost(true);
			} else {
				this.updateDeliveryCost(true);
			}

			this.calculateTotalProductCharacteristics();

			jQuery(function ($) {
				$(".vi-wcaio-sidebar-cart-count-wrap").addClass("animated");

				$(".vi-wcaio-sidebar-cart-count-wrap").on(
					"animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd",
					function () {
						$(this).removeClass("animated");
					}
				);
			});

			if (response.productInfo) {
				window.dataLayer = window.dataLayer || [];
				dataLayer.push({
					ecommerce: {
						currencyCode: "PLN",
						add: {
							products: [
								{
									name: response.productInfo.name,
									id: productId,
									price: response.productInfo.price,
									brand: "Seabus",
									category: response.productInfo.category,
									quantity: 1,
									affiliation: "Warsaw",
								},
							],
						},
					},
					event: "gtm-ee-event",
					"gtm-ee-event-category": "Enhanced Ecommerce",
					"gtm-ee-event-action": "Adding a Product to a Shopping Cart",
					"gtm-ee-event-non-interaction": "False",
				});

				fbq("track", "AddToCart", {
					content_type: "product",
					content_ids: [productId],
					content_name: response.productInfo.name,
					content_category: response.productInfo.category,
					value: response.productInfo.price,
					currency: "PLN",
				});
			}

			if (promo_product_id !== undefined) {
				if (productId == promo_product_id) {
					this.addGiftToCard(gift_product_id);
				}
			}
		});
	}

	addGiftToCard(giftProdId) {
		this.addToCard(giftProdId);
	}

	removeFromCard(itemId) {
		event.preventDefault();
		event.stopPropagation();
		var locale = window.localStorage.getItem("locale");
		$.ajax({
			url: `/${locale}/cart/remove/${itemId}`,
			context: document.body,
		}).done((response) => {
			if (response.cart) {
				this.updateCartContent(response.cart);
				$(this.cartCounterSelector).html(response.count);
			}

			if (response.footer) {
				$(this.footerSelector).html(response.footer);
			}

			if (response.subtotal) {
				$("#cartSubtotal").html(response.subtotal.toFixed(2));
			}
			this.updateCartSteps();
			this.updateDeliveryCost();
			this.calculateTotalProductCharacteristics();
		});
	}

	updateQty(itemId, qty) {
		event.preventDefault();
		event.stopPropagation();
		var locale = window.localStorage.getItem("locale");
		$.ajax({
			url: `/${locale}/cart/update/${itemId}/${qty}`,
			context: document.body,
		}).done((response) => {
			if (response.cart) {
				this.updateCartContent(response.cart);
			}

			if (response.footer) {
				$(this.footerSelector).html(response.footer);
			}

			if (response.subtotal) {
				$("#cartSubtotal").html(response.subtotal.toFixed(2));
			}

			this.updateCartSteps();
			this.updateDeliveryCost(true);
			this.calculateTotalProductCharacteristics();
		});
	}

	updateCartContent(html) {
		$(this.cartItemsSelector).html(html);
		$(".vi-wcaio-sidebar-cart-pd-quantity").find('input[type="number"]').niceNumber();
		this.updateCartCount();
	}

	updateCartCount() {
		$(".vi-wcaio-sidebar-cart-count").html(
			$(".vi-wcaio-sidebar-cart-products").find(".vi-wcaio-sidebar-cart-pd-wrap").length
		);
	}

	initDatePickerInput(dateSelector) {
		jQuery(function ($) {
			var shipMethod = jQuery("#shippingDate").attr("data-shipping-zone");
			if ($(dateSelector).length !== 0) {
				var maxTimeStr;
				var dt = new Date();

				// Create date string based on timezone
				var DateTime = luxon.DateTime;
				var rawdateStr = DateTime.local().setZone("Poland").toString();
				var rawdate = rawdateStr.split("+")[0];

				/* var date = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 21, 29, 1, 0); */

				// Create date obj based on timezone
				var date = new Date(rawdate);

				var weekDayNumber = date.getDay();

				var minTimeStr = "12:30";

				// minTime date obj
				var minTime = createDateObjBasedOnTime(date, minTimeStr);

				// maxTime depends weeday number
				if (weekDayNumber === 5 || weekDayNumber === 6) {
					maxTimeStr = "22:30";
				} else {
					maxTimeStr = "21:30";
				}

				// maxTime date obj
				var maxTime = createDateObjBasedOnTime(date, maxTimeStr);

				/* Current date + 3d */
				var dateThreeDays = new Date(rawdate);
				var currentDateThreeDays = dateThreeDays.setDate(dateThreeDays.getDate() + 3);

				/* Shipping zones */
				var localPickupDate = new Date(date.getTime() + 30 * 60000);
				var zoneOneDate = new Date(date.getTime() + 90 * 60000);
				var zoneTwoDate = new Date(date.getTime() + 120 * 60000);
				var zoneThreeDate = new Date(date.getTime() + 150 * 60000);
				var zoneFourDate = new Date(date.getTime() + 180 * 60000);

				/* Next day date */
				/* var nextDayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 12, 30, 0, 0); */

				/* Init flatpickr */
				var flatpickr = $(dateSelector).flatpickr({
					enableTime: true,
					time_24hr: true,
					minTime: minTimeStr,
					maxTime: maxTimeStr,
					disableMobile: "true",
					onChange: function (selectedDates, dateStr, instance) {
						/* If selected day != current day */
						if (parseInt(selectedDates[0].getDate()) > parseInt(date.getDate())) {
							var notCurrentDate = new Date(
								date.getFullYear(),
								date.getMonth(),
								parseInt(selectedDates[0].getDate()),
								12,
								30,
								0,
								0
							);
							flatpickr.config.minTime = notCurrentDate;
							/* If selected day = current day */
						} else if (parseInt(selectedDates[0].getDate()) === parseInt(date.getDate())) {
							if (shipMethod === "zone-1") {
								setMinMaxDateOnSelect(zoneOneDate);
							} else if (shipMethod === "zone-2") {
								setMinMaxDateOnSelect(zoneTwoDate);
							} else if (shipMethod === "zone-3") {
								setMinMaxDateOnSelect(zoneThreeDate);
							} else if (shipMethod === "zone-4") {
								setMinMaxDateOnSelect(zoneFourDate);
							} else {
								setMinMaxDateOnSelect(localPickupDate);
							}
						}
					},
				});

				/* Set default options */

				flatpickr.config.maxDate = currentDateThreeDays;

				if (shipMethod === "zone-1") {
					setDefaultMinMaxDate(zoneOneDate);
				} else if (shipMethod === "zone-2") {
					setDefaultMinMaxDate(zoneTwoDate);
				} else if (shipMethod === "zone-3") {
					setDefaultMinMaxDate(zoneThreeDate);
				} else if (shipMethod === "zone-4") {
					setDefaultMinMaxDate(zoneFourDate);
				} else {
					setDefaultMinMaxDate(localPickupDate);
				}

				/* If current time < worktime */
				if (date < minTime) {
					var currentDayDate = new Date(
						date.getFullYear(),
						date.getMonth(),
						date.getDate(),
						12,
						30,
						0,
						0
					);

					flatpickr.config.minDate = currentDayDate;
					flatpickr.config.minTime = currentDayDate;
					flatpickr.setDate(currentDayDate);
				}

				/* Define functions */
				function setMinMaxDateOnSelect(shipZoneObj) {
					flatpickr.config.minDate = shipZoneObj;
					flatpickr.config.minTime = shipZoneObj;
				}

				function setDefaultMinMaxDate(shipZoneObj) {
					flatpickr.config.minDate = shipZoneObj;
					flatpickr.config.minTime = shipZoneObj;
					flatpickr.setDate(shipZoneObj);
				}

				function createDateObjBasedOnTime(dateobj, timestr) {
					var timeArr = timestr.split(":");
					return new Date(
						dateobj.getFullYear(),
						dateobj.getMonth(),
						dateobj.getDate(),
						parseInt(timeArr[0]),
						parseInt(timeArr[1]),
						0
					);
				}
			}
		});
	}

	updateDeliveryCost(disableLoader) {
		var $this = this;
		var quoteId = $("#quoteId").val();

		if (quoteId !== undefined) {
			var quoteIdString = quoteId.toString();
		}
		var buildNumber = $("#shippingHouseNumber").val();
		var shippingMethod = $('input[name="shippingMethod"]:checked').val();
		var cityName = $("#shippingCity").find(":selected").val();
		var streetName = $("#shippingStreet").val();
		var addr;

		if (streetName == "") {
			addr = undefined;
		} else {
			addr = streetName + ", " + buildNumber + ", " + cityName;
		}

		console.log("searched addr: " + addr);

		if (geocoder !== undefined) {
			geocoder.geocode({ address: addr }, function (results, status) {
				var zone;
				if (status === "OK") {
					var newBounds = new google.maps.LatLngBounds(
						bounds.getSouthWest(),
						bounds.getNorthEast()
					);
					marker.setPosition(results[0].geometry.location);
					marker.setMap(map);
					newBounds.extend(results[0].geometry.location);
					map.fitBounds(newBounds);
					if (google.maps.geometry.poly.containsLocation(results[0].geometry.location, polygon1)) {
						zone = "zone-1";
					} else if (
						google.maps.geometry.poly.containsLocation(results[0].geometry.location, polygon2)
					) {
						zone = "zone-2";
					} else if (
						google.maps.geometry.poly.containsLocation(results[0].geometry.location, polygon3)
					) {
						zone = "zone-3";
					} else if (
						google.maps.geometry.poly.containsLocation(results[0].geometry.location, polygon4)
					) {
						zone = "zone-4";
					} else {
						zone = "no-zone";
					}
				} else {
					zone = "no-zone";
				}

				if (addr === undefined) {
					zone = "no-zone";
				}
				jQuery("#shippingDate").attr("data-shipping-zone", zone);
				console.log("zone: " + zone);

				$.ajax({
					url: `/shippingzone/check`,
					method: "POST",
					contentType: "application/json",
					dataType: "json",
					data: JSON.stringify({
						quoteId: quoteIdString,
						shippingMethod: shippingMethod,
						zoneName: zone,
					}),
					beforeSend: function () {
						if (disableLoader === undefined) {
							$this.showLoader();
						}
					},
					error: function () {
						$this.hideLoader();
					},
				}).done((response) => {
					$this.hideLoader();

					if (response.message == "success") {
						if (response.shipping_price !== null) {
							$("#cartDelivery").html(response.shipping_price.toFixed(2));
							$("#cartDelivery")
								.closest(".vi-wcaio-sidebar-cart-footer-cart_total")
								.addClass("is-visible");
						} else {
							$("#cartDelivery")
								.closest(".vi-wcaio-sidebar-cart-footer-cart_total")
								.removeClass("is-visible");
						}

						if (response.subtotal) {
							$("#cartSubtotal").html(response.subtotal.toFixed(2));
						}
					}

					if (response.allowed === false) {
						jQuery("[data-validate-form]").attr("data-no-shipping-zone", "");
						jQuery(".cart__warning-wrap")
							.removeClass("cart__warning-wrap-open")
							.addClass("cart__warning-wrap-close");
					} else {
						jQuery("[data-validate-form]").removeAttr("data-no-shipping-zone");
					}
				});
			});
		}
	}

	showLoader() {
		$(this.loaderSelector).show();
	}

	hideLoader() {
		$(this.loaderSelector).hide();
	}

	updateCartSteps() {
		var currentStep = this.step;

		jQuery("[data-checkout-step]").hide();
		jQuery('[data-checkout-step="' + currentStep + '"]').show();
		if (currentStep >= 1) {
			jQuery("[data-checkout-btn-back]").show();
		}
	}

	placeOrder() {
		var $this = this;

		var locale = window.localStorage.getItem("locale");
		var firstName = $("#shippingFirstName").val();
		var shippingPhone = $("#shippingPhone").val();
		var shippingMethod = $('input[name="shippingMethod"]:checked').val();
		var streetId = $("#streetId").val();
		var buildingNo = $("#shippingHouseNumber").val();
		var entrance = $("#shippingEntrance").val();
		var floor = $("#shippingFloor").val();
		var flat = $("#shippingApartment").val();
		var comment = $("#shippingNotes").val();
		var quoteId = $("#quoteId").val();
		var cityId = $("#shippingCity").find(":selected").attr("id");
		var deliveryDate = $("#shippingDate").val();
		var paymentMethod = $('input[name="paymentMethod"]:checked').val();
		var standartSticksCount = $("#orderChopsticks").val();
		var beginnerSticksCount = $("#orderBeginnerChopsticks").val();
		var personsCount = $("#orderNumberOfPeople").val();
		/* var petGift = $('input[name="PetGift"]:checked').val();    */
		var change = $("#changeAmount").val();

		if (change == undefined) {
			change = "";
		}

		$.ajax({
			url: `/order/create`,
			method: "POST",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify({
				quoteId: quoteId.toString(),
				firstName: firstName,
				telephone: shippingPhone,
				shippingMethod: shippingMethod,
				streetId: streetId.toString(),
				entrance: entrance,
				floor: floor,
				buildingNo: buildingNo,
				flat: flat,
				comment: comment,
				cityId: cityId.toString(),
				deliveryDate: deliveryDate,
				paymentMethod: paymentMethod,
				standartSticksCount: standartSticksCount,
				beginnerSticksCount: beginnerSticksCount,
				personsCount: personsCount,
				/* petGift: petGift, */
				change: change,
			}),
			beforeSend: function () {
				$this.showLoader();
			},
			error: function () {
				$this.hideLoader();
			},
		}).done((response) => {
			$this.hideLoader();
			if (response.message == "success" && response.order_id) {
				$this.orderDataLayer(response.order_id);
				window.location.href = `/${locale}/order/success/${response.order_id}`;
			}
		});
	}

	/* refreshAdditionalProducts() {
        jQuery('[data-additional-product-id]').each(function(index, item) {
            var cartItem = jQuery('[data-product-id="'+jQuery(item).attr('data-additional-product_id')+'"]');

            if(cartItem.length !== 0) {
                jQuery(item).hide();
            } else {
                jQuery(item).show();
            }
        });
    } */

	calculateTotalProductCharacteristics() {
		var productCharacteristicsArr = ["weight", "pieces"];

		$.each(productCharacteristicsArr, function (index, itemName) {
			var valueAttr,
				prodCharacteristicValue,
				prodCharacteristicTotal = 0,
				prodQty;
			var prodCharacteristicContainer = $(`#cart_total_${itemName}`).closest(
				".vi-wcaio-sidebar-cart-footer-cart_total"
			);
			$(".vi-wcaio-sidebar-cart-products")
				.find(`[data-product-${itemName}]`)
				.each(function (index, item) {
					valueAttr = parseInt($(item).attr(`data-product-${itemName}`));
					prodQty = parseInt(
						$(item).closest(".vi-wcaio-sidebar-cart-pd-wrap").find("[data-product-qty]").val()
					);
					prodCharacteristicValue = valueAttr * prodQty;

					if (valueAttr !== undefined) {
						prodCharacteristicTotal += prodCharacteristicValue;
					}
				});

			if (prodCharacteristicTotal !== 0) {
				$(`#cart_total_${itemName}`).text(prodCharacteristicTotal);
				prodCharacteristicContainer.addClass("is-visible");
			} else {
				prodCharacteristicContainer.removeClass("is-visible");
			}
		});
	}
}
var checkout = new Checkout();

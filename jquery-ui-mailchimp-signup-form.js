/*!
 * Mailchimp Signup Form based on jQuery UI Widget
 * Author: office@slicemenice.de
 * Licensed under the MIT license
 *
 *  Requires UI version 1.9+
 */

( function( $, window, document, undefined ) {

	$.widget( 'smn.mailchimpSignupForm', {

		options: {
			mailchimp: {
				username: undefined,
				dc: undefined,
				u: undefined,
				id: undefined
			},
			$emailInput: undefined,
			response: {
				$wrapper: undefined,
				errorTemplate: '<div class="error"></div>',
				successTemplate: '<div class="success"></div>'
			},
			languageCode: 'en',
			i18n: undefined,
			beforeSubmit: undefined,
			collectFormData: undefined,
			generateSubscribeUrl: undefined
		},

		_create: function() {
			var widget = this;

			widget._trigger( 'willBeInitialized' );

			widget.element.on( 'submit.mailchimpSignupForm', widget._onSubmit.bind( widget ) );
			widget.isWaitingForResponse = false;

			widget._trigger( 'hasBeenInitialized' );
		},

		_onSubmit: function( event ) {
			event.preventDefault();

			var widget = this;

			if ( widget.isWaitingForResponse === true ) {
				return;
			}

			widget.isWaitingForResponse = true;
			var email = widget.options.$emailInput.val();

			if ( $.isFunction( widget.options.beforeSubmit ) ) {
				widget.options.beforeSubmit.apply( widget );
			} else {
				widget.options.response.$wrapper.slideUp( {
					always: function() {
						widget.options.response.$wrapper.empty();
					}
				} );
			}

			var subscribeUrl = '//' + widget.options.mailchimp.username + '.' + widget.options.mailchimp.dc + '.list-manage.com/subscribe/post-json';

			if ( widget.options.generateSubscribeUrl ) {
				subscribeUrl = widget.options.generateSubscribeUrl.apply( widget );
			}

			var formData = {
				u: widget.options.mailchimp.u,
				id: widget.options.mailchimp.id
			};

			var formDataArray = widget.element.serializeArray();

			$.each( formDataArray, function( index, item ) {
				formData[ item.name ] = item.value;
			} );

			if ( $.isFunction( widget.options.collectFormData ) ) {
				formData = widget.options.collectFormData.apply( widget, [ formData ] );
			}

			$.ajax( {
				url: subscribeUrl,
				data: formData,
				dataType: 'jsonp',
				jsonp: 'c'
			} ).done( function( response ) {
				if ( response ) {
					var $response;

					switch ( response.result ) {
						case 'error':
							$response = $( widget.options.response.errorTemplate );
							break;

						case 'success':
							$response = $( widget.options.response.successTemplate );
							break;
					}

					var responseMessage = response.msg;

					if ( $.isFunction( widget.options.i18n ) ) {
						responseMessage = widget.options.i18n.apply( widget, [ responseMessage, widget.options.languageCode ] );
					}

					$response.html( responseMessage );
					widget.options.response.$wrapper.stop().append( $response ).slideDown();
				}
			} ).always( function() {
				widget.isWaitingForResponse = false;
			} );
		},

		_destroy: function() {
			var widget = this;

			widget._trigger( 'willBeDestroyed' );

			widget.options.response.$wrapper.slideUp( {
				always: function() {
					widget.options.response.$wrapper.empty();
				}
			} );

			widget._trigger( 'hasBeenDestroyed' );
		}
	} );

} )( jQuery, window, document );
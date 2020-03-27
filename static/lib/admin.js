'use strict';

/* globals $, app, socket, define, fetch */
define('admin/plugins/fusionauth-oidc', ['settings'], function (settings) {
	return {
		init: function () {
			settings.load('fusionauth-oidc', $('#fusionauth-oidc-settings'));

			const save = function (form) {
				settings.save('fusionauth-oidc', form, function () {
					app.alert({
						type: 'success',
						alert_id: 'sso-oidc-saved',
						title: 'Settings Saved',
						message: 'If you changed the email claim, you will need to restart before it will be applied.',
						clickfn: function () {
							socket.emit('admin.reload');
						},
					});
				});
			};

			$('#save').on('click', function () {
				const form = $('#fusionauth-oidc-settings');

				// Trim the fields
				form.find('input[data-trim="true"]').each(function () {
					$(this).val($.trim($(this).val()));
				});

				const baseURL = $('input[name="discoveryBaseURL"]').val();
				if (baseURL) {
					const errorFunc = () => {
						app.alert({
							type: 'danger',
							alert_id: 'sso-oidc-error',
							title: 'An error occurred ',
							message: 'An error has occurred while trying to discover the OIDC configuration. Make sure that this platform supports the well known configuration url and that you have the right url.',
						});
					};

					const timeout = setTimeout(errorFunc, 5000);

					fetch(baseURL + '/.well-known/openid-configuration')
						.then((res) => res.json())
						.then((json) => {
							clearTimeout(timeout);
							$('input[name="authorizationEndpoint"]').val(json.authorization_endpoint);
							$('input[name="tokenEndpoint"]').val(json.token_endpoint);
							$('input[name="userInfoEndpoint"]').val(json.userinfo_endpoint);
							save(form);
						})
						.catch((e) => {
							clearTimeout(timeout);
							console.error(e);
							errorFunc();
						});
				} else {
					save(form);
				}
			});
		},
	};
});

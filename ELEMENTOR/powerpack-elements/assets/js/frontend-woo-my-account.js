(function ($) {
	var WooMyAccountHandler = function ($scope, $) {
		$scope.find('button[name="save_address"], button[name="save_account_details"]').parent().addClass('pp-my-account-button');
	};

	$(window).on("elementor/frontend/init", function () {

		elementorFrontend.hooks.addAction( 'frontend/element_ready/pp-woo-my-account.default', WooMyAccountHandler );

	});
})(jQuery);

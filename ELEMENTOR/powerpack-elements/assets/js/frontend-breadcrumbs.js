(function ($) {
    'use strict';

    var isEditMode = false;

    var getElementSettings = function( $element ) {
		var elementSettings = {},
			modelCID 		= $element.data( 'model-cid' );

		if ( isEditMode && modelCID ) {
			var settings     = elementorFrontend.config.elements.data[ modelCID ],
				settingsKeys = elementorFrontend.config.elements.keys[ settings.attributes.widgetType || settings.attributes.elType ];

			jQuery.each( settings.getActiveControls(), function( controlKey ) {
				if ( -1 !== settingsKeys.indexOf( controlKey ) ) {
					elementSettings[ controlKey ] = settings.attributes[ controlKey ];
				}
			} );
		} else {
			elementSettings = $element.data('settings') || {};
		}

		return elementSettings;
	};

	var BreadcrumbsHandler = function( $scope ) {
		var elementSettings = getElementSettings( $scope ),
            breadcrumbsType = elementSettings.breadcrumbs_type;

		if ( breadcrumbsType !== 'powerpack' ) {
			$scope.find('.pp-breadcrumbs a' ).parent().css({'padding' : '0', 'background-color' : 'transparent', 'border' : '0', 'margin' : '0', 'box-shadow' : 'none'});
		}
		if ( breadcrumbsType === 'yoast' || breadcrumbsType === 'rankmath' ) {
			$scope.find('.pp-breadcrumbs a' ).parent().parent().css({'padding' : '0', 'background-color' : 'transparent', 'border' : '0', 'margin' : '0', 'box-shadow' : 'none'});
		}
	};

    $(window).on('elementor/frontend/init', function () {
        if ( elementorFrontend.isEditMode() ) {
			isEditMode = true;
		}

		elementorFrontend.hooks.addAction( 'frontend/element_ready/pp-breadcrumbs.default', BreadcrumbsHandler );
    });

}(jQuery));

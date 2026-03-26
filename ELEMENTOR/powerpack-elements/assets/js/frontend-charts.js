( function ( $ ) {
	$( window ).on( 'elementor/frontend/init', () => {
		class ChartsWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				return {
					selectors: {
						chart: '.pp-chart-wrapper',
					},
				};
			}

			getDefaultElements() {
				const selectors = this.getSettings( 'selectors' );
				return {
					$chart: this.$element.find( selectors.chart ),
				};
			}

			bindEvents() {
				if ( this.elements.$chart.length ) {
					var chartCanvas = '<canvas id="' + this.elements.$chart.data( 'id' ) + '"></canvas>';
					this.elements.$chart.html( chartCanvas );

					var $canvas         = this.elements.$chart.find( '> canvas' ),
						dataSettings    = this.elements.$chart.data('settings'),
						elementSettings = this.getElementSettings();

					if ( elementSettings.y_axis_labels_prefix || elementSettings.y_axis_labels_suffix ) {
						dataSettings.options.scales.y.ticks.callback = function(value, index, ticks) {
							let prefix = elementSettings.y_axis_labels_prefix || '';
							let suffix = elementSettings.y_axis_labels_suffix || '';
							return prefix + value.toLocaleString() + suffix;
						};
					}

					this.intersectionObserver = elementorModules.utils.Scroll.scrollObserver( {
						callback: event => {
							if ( event.isInViewport ) {
								this.intersectionObserver.unobserve( $canvas[0] );

								var ctx = $canvas[0].getContext( '2d' );
								new Chart( ctx, dataSettings );
							}
						}
					});

					this.intersectionObserver.observe( $canvas[0] );
				}
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-charts', ChartsWidget );
	} );
} ) ( jQuery );
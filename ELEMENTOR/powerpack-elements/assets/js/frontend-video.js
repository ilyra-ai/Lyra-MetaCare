(function($) {
	$( window ).on( 'elementor/frontend/init', () => {
		class VideoWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				return {
					selectors: {
						outerWrap: '.pp-video',
						videoPlay: '.pp-video-play',
					}
				};
			}

			getDefaultElements() {
				const selectors = this.getSettings( 'selectors' );
				return {
					$outerWrap: this.$element.find( selectors.outerWrap ),
					$videoPlay: this.$element.find( selectors.videoPlay ),
				}
			}

			bindEvents() {
				this.initVideo();
			}

			initVideo() {
				const isLightbox = this.elements.$videoPlay.hasClass( 'pp-video-play-lightbox' );
				let self = this;

				this.elements.$videoPlay.off( 'click' ).on( 'click', function( e ) {
					e.preventDefault();

					const videoPlayer = $(this).find( '.pp-video-player' );

					if ( ! isLightbox ) {
						self.videoPlay( videoPlayer, self.elements.$outerWrap );
					}
				});

				if ( ! elementorFrontend.isEditMode() ) {
					if ( this.elements.$videoPlay.data( 'autoplay' ) == '1' && ! isLightbox ) {
						self.videoPlay( this.$element.find( '.pp-video-player' ), this.elements.$outerWrap );
					}
				}
			}

			videoPlay(selector, outerWrap) {
				var $iframe  = $( '<iframe/>' ),
					   $vidSrc = selector.data( 'src' );

				if ( 0 === selector.find( 'iframe' ).length ) {
					if ( outerWrap.hasClass( 'pp-video-type-youtube' ) || outerWrap.hasClass( 'pp-video-type-vimeo' ) || outerWrap.hasClass( 'pp-video-type-dailymotion' ) ) {
						$iframe.attr( 'src', $vidSrc );
					}

					$iframe.attr( 'frameborder', '0' );
					$iframe.attr( 'allowfullscreen', '1' );
					$iframe.attr( 'allow', 'autoplay;encrypted-media;' );
					selector.html( $iframe );

					if ( outerWrap.hasClass( 'pp-video-type-hosted' ) ) {
						var hostedVideoHtml = JSON.parse( outerWrap.data( 'hosted-html' ) );

						$iframe.on( 'load', function() {
							var hostedVideoIframe = $iframe.contents().find( 'body' );
							hostedVideoIframe.html( hostedVideoHtml );
							$iframe.contents().find( 'video' ).css( {"width":"100%", "height":"100%"} );
							$iframe.contents().find( 'video' ).attr( 'autoplay','autoplay' );
					   });
				   }
			   }
		  	}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-video', VideoWidget );
	} );
})(jQuery);
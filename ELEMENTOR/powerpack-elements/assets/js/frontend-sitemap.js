/**
 * PowerPack Sitemap Widget with Tree View Support.
 */
(function( $ ) {
	'use strict';

	$( window ).on( 'elementor/frontend/init', () => {

		/**
		 * Tree view functionality as a jQuery plugin.
		 */
		$.fn.treed = function( options ) {
			const openedClass = options?.openedClass || 'fa-minus-circle';
			const closedClass = options?.closedClass || 'fa-plus-circle';

			const tree = $( this );
			tree.addClass( 'pp-tree' );

			function toggleBranch( $element ) {
				const $icon = $element.children( 'i:first' );
				const $svgIcon = $element.children( 'svg:first' );

				$icon.toggleClass( `${openedClass} ${closedClass}` );
				$svgIcon.toggleClass( `${openedClass} ${closedClass}` );

				const $children = $element.hasClass( 'pp-category-wrap' )
					? $element.children().children( 'ul' )
					: $element.children().children();

				$children.toggle();
			}

			tree.find( 'li' ).has( 'ul' ).each( function() {
				const $branch = $( this );
				$branch.prepend( `<i class="indicator fas ${closedClass}"></i>` );
				$branch.addClass( 'pp-tree-branch' );

				$branch.on( 'click', function( e ) {
					if ( this === e.currentTarget ) {
						toggleBranch( $( this ) );
					}
				} );

				if ( $branch.hasClass( 'pp-category-wrap' ) ) {
					$branch.find( '> .pp-category > .pp-category-link' ).show();
					$branch.children().children( 'ul' ).toggle();
				} else {
					$branch.children().children().toggle();
				}
			} );

			tree.find( '.pp-tree-branch .indicator' ).on( 'click', function( e ) {
				e.stopPropagation();
				toggleBranch( $( this ).closest( 'li' ) );
			} );

			tree.find( '.pp-tree-branch > button' ).on( 'click', function( e ) {
				e.preventDefault();
				$( this ).closest( 'li' ).trigger( 'click' );
			} );
		};

		/**
		 * Elementor Frontend Widget Handler.
		 */
		class SitemapWidget extends elementorModules.frontend.handlers.Base {

			getDefaultSettings() {
				return {
					selectors: {
						list: '.pp-sitemap-list',
					},
				};
			}

			getDefaultElements() {
				const selectors = this.getSettings( 'selectors' );

				return {
					$list: this.$element.find( selectors.list ),
				};
			}

			bindEvents() {
				const elementSettings = this.getElementSettings();
				const list = this.elements.$list;
				const tree = elementSettings.sitemap_tree;
				const style = elementSettings.sitemap_tree_style;

				if ( 'yes' !== tree || ! list.length ) {
					return;
				}

				const styleMap = {
					'plus_circle': { openedClass: 'fa-minus-circle', closedClass: 'fa-plus-circle' },
					'caret': { openedClass: 'fa-caret-down', closedClass: 'fa-caret-right' },
					'plus': { openedClass: 'fa-minus', closedClass: 'fa-plus' },
					'folder': { openedClass: 'fa-folder-open', closedClass: 'fa-folder' },
				};

				list.treed( styleMap[ style ] || {} );
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-sitemap', SitemapWidget );
	} );
})( jQuery );

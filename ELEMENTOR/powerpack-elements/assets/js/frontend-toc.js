(function ($) {
	$( window ).on( 'elementor/frontend/init', () => {
		class TocWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				const elementSettings = this.getElementSettings(),
					listWrapperTag = 'numbers' === elementSettings.marker_view ? 'ol' : 'ul';

				return {
					selectors: {
						widgetContainer: '.pp-toc',
						container:
							'.elementor:not([data-elementor-type="header"]):not([data-elementor-type="footer"])',
						expandButton: '.pp-toc__header',
						collapseButton: '.pp-toc__header',
						body: '.pp-toc__body',
						headerTitle: '.pp-toc__header-title',
						scrollTop: '.pp-toc__scroll-to-top--container',
					},
					classes: {
						anchor: 'pp-toc-menu-anchor',
						listWrapper: 'pp-toc__list-wrapper',
						listItem: 'pp-toc__list-item',
						listTextWrapper: 'pp-toc__list-item-text-wrapper',
						firstLevelListItem: 'pp-toc__top-level',
						listItemText: 'pp-toc__list-item-text',
						activeItem: 'pp-item-active',
						headingAnchor: 'pp-toc__heading-anchor',
						collapsed: 'pp-toc--collapsed',
					},
					listWrapperTag: listWrapperTag,
				};
			}

			getDefaultElements() {
				var settings = this.getSettings(),
					elementSettings = this.getElementSettings();

				return {
					$pageContainer: jQuery(
						elementSettings.container || settings.selectors.container
					),
					$widgetContainer: this.$element.find(settings.selectors.widgetContainer),
					$expandButton: this.$element.find(settings.selectors.expandButton),
					$collapseButton: this.$element.find(settings.selectors.collapseButton),
					$tocBody: this.$element.find(settings.selectors.body),
					$listItems: this.$element.find("." + settings.classes.listItem),
					$scrollTop: this.$element.find(settings.selectors.scrollTop),
				};
			}

			bindEvents() {
				var self = this;

				const elementSettings = this.getElementSettings();

				if ( elementSettings.minimize_box ) {
					this.elements.$expandButton.on( 'click', function () {
						if ( ! $( self.$element ).hasClass( self.getSettings( "classes.collapsed" ) ) ) {
							return self.collapseBox();
						} else {
							return self.expandBox();
						}
					} ).on( 'keyup', function ( event ) {
						self.triggerClickOnEnterSpace( event );
					} );
				}

				if (elementSettings.collapse_subitems) {
					this.elements.$listItems.hover(function (event) {
						return jQuery(event.target).slideToggle();
					});
				}

				if (elementSettings.sticky_toc_toggle) {
					elementorFrontend.elements.$window.on("resize", this.handleStickyToc);
				}

				if (elementSettings.scroll_to_top_toggle) {
					this.elements.$scrollTop.on("click", function () {
						self.scrollToTop();
					});
				}
			}

			triggerClickOnEnterSpace( event ) {
				const ENTER_KEY = 13,
					SPACE_KEY = 32;

				if (ENTER_KEY === event.keyCode || SPACE_KEY === event.keyCode) {
					event.currentTarget.click();
					event.stopPropagation();
				}
			}

			getHeadings() {
				// Get all headings from document by user-selected tags
				var elementSettings = this.getElementSettings(),
					tags = elementSettings.headings_by_tags.join(","),
					selectors = this.getSettings("selectors"),
					excludedSelectors = elementSettings.exclude_headings_by_selector;

				return this.elements.$pageContainer
					.find(tags)
					.not(selectors.headerTitle)
					.filter(function (index, heading) {
						return !jQuery(heading).closest(excludedSelectors).length; // Handle excluded selectors if there are any
					});
			}

			addAnchorsBeforeHeadings() {
				// Add an anchor element right before each TOC heading to create anchors for TOC links
				var classes = this.getSettings("classes");

				this.elements.$headings.before(function (index) {
					return (
						'<span id="' +
						classes.headingAnchor +
						"-" +
						index +
						'" class="' +
						classes.anchor +
						' "></span>'
					);
				});
			}

			activateItem($listItem) {
				var classes = this.getSettings("classes");

				this.deactivateActiveItem($listItem);

				$listItem.addClass(classes.activeItem);

				this.$activeItem = $listItem;

				if (!this.getElementSettings("collapse_subitems")) {
					return;
				}

				var $activeList = void 0;

				if ($listItem.hasClass(classes.firstLevelListItem)) {
					$activeList = $listItem.parent().next();
				} else {
					$activeList = $listItem.parents("." + classes.listWrapper).eq(-2);
				}

				if (!$activeList.length) {
					delete this.$activeList;

					return;
				}

				this.$activeList = $activeList;

				this.$activeList.stop().slideDown();
			}

			deactivateActiveItem($activeToBe) {
				if (!this.$activeItem || this.$activeItem.is($activeToBe)) {
					return;
				}

				var _getSettings = this.getSettings(),
					classes = _getSettings.classes;

				this.$activeItem.removeClass(classes.activeItem);

				if (
					this.$activeList &&
					(!$activeToBe || !this.$activeList[0].contains($activeToBe[0]))
				) {
					this.$activeList.slideUp();
				}
			}

			followAnchor($element, index) {
				const anchorSelector = $element[0].hash;
    			let $anchor;

				try {
					// `decodeURIComponent` for UTF8 characters in the hash.
					$anchor = jQuery(decodeURIComponent(anchorSelector));
				} catch (e) {
					return;
				}

				const observerOptions = {
					rootMargin: '0px',
					threshold: 0
				};
				const observer = this.createObserver(anchorSelector, $anchor, observerOptions, $element, index);
				observer.observe($anchor[0]);
			}

			createObserver(anchorSelector, $anchor, options, $element, index) {
				let lastScrollTop = 0;
				return new IntersectionObserver(entries => {
					entries.forEach(entry => {
						const scrollTop = document.documentElement.scrollTop,
						isScrollingDown = scrollTop > lastScrollTop,
						id = $anchor.attr('id');
						if (entry.isIntersecting && !this.itemClicked) {
							this.viewportItems[id] = true;
							this.activateItem($element);
						} else if (entry.isIntersecting && isScrollingDown) {
							delete this.viewportItems[id];
							if (Object.keys(this.viewportItems).length) {
								this.activateItem(this.$listItemTexts.eq(index + 1));
							}
						} else if (!isScrollingDown) {
							delete this.viewportItems[id];
							this.activateItem(this.$listItemTexts.eq(index - 1));
						}
						lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
					});
				}, options);
			}

			followAnchors() {
				this.$listItemTexts.each((index, element) => { 
					this.followAnchor(jQuery(element), index);

					//Smooth Scroll.
					element.addEventListener('click', function (e) {
						e.preventDefault();

						document.querySelector(this.getAttribute('href')).scrollIntoView({
							behavior: 'smooth'
						});
					});
				});
			}

			setOffset($listItem) {
				var self = this;

				var settings = this.getSettings();
				var list = this.$element.find("." + settings.classes.listItem);

				var offset = this.getCurrentDeviceSetting("scroll_offset");

				list.each(function () {
					$('a', this).on('click', function (e) {
						e.preventDefault();
						var hash = this.hash;

						$('html, body').animate({
							scrollTop: ($(hash).offset().top - parseInt(offset.size))
						}, 800);
					});
				});
			}

			populateTOC() {
				var self = this;

				this.listItemPointer = 0;

				var elementSettings = this.getElementSettings();

				if (elementSettings.hierarchical_view) {
					this.createNestedList();
				} else {
					this.createFlatList();
				}

				this.$listItemTexts = this.$element.find(".pp-toc__list-item-text");

				this.$listItemTexts.on('click', this.onListItemClick.bind(this));

				if (!elementorFrontend.isEditMode()) {
					this.followAnchors();
				}

				$(window).on('scroll', function() {

					if ('window_top' === elementSettings.scroll_to_top_option) {

						if( $(window).scrollTop() > 0 ){
							self.elements.$scrollTop.show();
						} else {
							self.elements.$scrollTop.hide();
						}
					} else {

						var $id = self.getID();

						if( $id.offset().top >= $(window).scrollTop() ) {
							self.elements.$scrollTop.hide();
						} else {
							self.elements.$scrollTop.show();
						}
					}
				});
			}

			createNestedList() {
				this.headingsData.forEach((heading, index) => {
					heading.level = 0;
					for (let i = index - 1; i >= 0; i--) {
						const currentOrderedItem = this.headingsData[i];
						if (currentOrderedItem.tag <= heading.tag) {
							heading.level = currentOrderedItem.level;
						if (currentOrderedItem.tag < heading.tag) {
							heading.level++;
						}
							break;
						}
					}
				});
				this.elements.$tocBody.html(this.getNestedLevel(0));
			}

			createFlatList() {
				this.elements.$tocBody.html(this.getNestedLevel());
			}

			getNestedLevel(level) {
				const settings = this.getSettings(),
					elementSettings = this.getElementSettings(),
					icon = this.getElementSettings('icon');
				let renderedIcon;
				if (icon) {
					// We generate the icon markup in PHP and make it available via get_frontend_settings(). As a result, the
					// rendered icon is not available in the editor, so in the editor we use the regular <i> tag.
					if (elementorFrontend.config.experimentalFeatures.e_font_icon_svg && !elementorFrontend.isEditMode()) {
						renderedIcon = typeof icon.rendered_tag !== 'undefined' ? icon.rendered_tag : '';
					} else {
						renderedIcon = icon.value ? `<i class="${icon.value}"></i>` : '';
					}
				}

				// Open new list/nested list
				let html = `<${settings.listWrapperTag} class="${settings.classes.listWrapper}">`;

				// for each list item, build its markup.
				while (this.listItemPointer < this.headingsData.length) {
					var currentItem = this.headingsData[this.listItemPointer];

					var listItemTextClasses = settings.classes.listItemText;

					if (0 === currentItem.level) {
						// If the current list item is a top level item, give it the first level class
						listItemTextClasses += ' ' + settings.classes.firstLevelListItem;
					}

					if (level > currentItem.level) {
						break;
					}

					if (level === currentItem.level) {
						html += `<li class="${settings.classes.listItem + ' level-' + level}">`;
						html += `<div class="${settings.classes.listTextWrapper}">`;

						let liContent = `<a href="#${currentItem.anchorLink}" class="${listItemTextClasses}">${currentItem.text}</a>`;

						// If list type is bullets, add the bullet icon as an <i> tag
						if ('bullets' === elementSettings.marker_view && icon) {
							liContent = `${renderedIcon}${liContent}`;
						}

						html += liContent;

						html += '</div>';

						this.listItemPointer++;

						var nextItem = this.headingsData[this.listItemPointer];

						if (nextItem && level < nextItem.level) {
							// If a new nested list has to be created under the current item,
							// this entire method is called recursively (outside the while loop, a list wrapper is created)
							html += this.getNestedLevel(nextItem.level);
						}

						html += '</li>';
					}
				}

				html += `</${settings.listWrapperTag}>`;

				return html;
			}

			handleNoHeadingsFound() {
				
				var _messages = ppToc;

				if (elementorFrontend.isEditMode()) {
					return this.elements.$tocBody.html(
						_messages.no_headings_found
					);
				}
			}

			collapseOnInit() {
				var self = this;
				var minimizedOn = this.getElementSettings("minimized_on"),
					currentDeviceMode = elementorFrontend.getCurrentDeviceMode();

				if ("" !== minimizedOn && "array" !== typeof minimizedOn) {
					minimizedOn = [minimizedOn];
				}

				if ( 0 !== minimizedOn.length  && "object" === typeof minimizedOn ) {
					minimizedOn.forEach(function (value) {
						if (
							( "desktop" === value[0] && "desktop" == currentDeviceMode && $(window).width() < elementorFrontend.config.breakpoints.xxl ) ||
							( "tablet" === value[0] && "tablet" === currentDeviceMode && $(window).width() < elementorFrontend.config.breakpoints.lg ) ||
							( "mobile" === value[0] && "mobile" === currentDeviceMode && $(window).width() < elementorFrontend.config.breakpoints.md )
						) {
							self.collapseBox();
						}
					});
				}
			}

			getHeadingAnchorLink(index, classes) {
				const headingID = this.elements.$headings[index].id,
				wrapperID = this.elements.$headings[index].closest('.elementor-widget').id;
				let anchorLink = '';

				if (headingID) {
					anchorLink = headingID;
				} else if (wrapperID) {
				// If the heading itself has an ID, we don't want to overwrite it
					anchorLink = wrapperID;
				}
			
				// If there is no existing ID, use the heading text to create a semantic ID
				if (headingID || wrapperID) {
					jQuery(this.elements.$headings[index]).data('hasOwnID', true);
				} else {
					anchorLink = `${classes.headingAnchor}-${index}`;
				}
				return anchorLink;
			}

			setHeadingsData() {
				this.headingsData = [];
				const classes = this.getSettings('classes');
			
				// Create an array for simplifying TOC list creation
				this.elements.$headings.each((index, element) => {
					const anchorLink = this.getHeadingAnchorLink(index, classes);
					this.headingsData.push({
					tag: +element.nodeName.slice(1),
					text: element.textContent,
					anchorLink
					});
				});
			}

			run() {
				var elementSettings = this.getElementSettings();

				this.elements.$headings = this.getHeadings();

				if (!this.elements.$headings.length) {
					return this.handleNoHeadingsFound();
				}

				this.setHeadingsData();

				if (!elementorFrontend.isEditMode()) {
					this.addAnchorsBeforeHeadings();
				}

				this.populateTOC();

				if (elementSettings.minimize_box) {
					this.collapseOnInit();
				}

				if (elementSettings.sticky_toc_toggle) {
					this.handleStickyToc();
				}

				var offset = this.getCurrentDeviceSetting('scroll_offset');
				if ( '' !== offset.size && undefined !== offset.size ) {
					this.setOffset();
				}
			}

			expandBox() {
				const boxHeight = this.getCurrentDeviceSetting('min_height');

				this.$element.removeClass(this.getSettings('classes.collapsed'));

				this.elements.$tocBody.attr('aria-expanded', 'true');
				this.elements.$tocBody.slideDown();

				// return container to the full height in case a min-height is defined by the user
				this.elements.$widgetContainer.css('min-height', boxHeight.size + boxHeight.unit);
			}

			collapseBox() {
				this.$element.addClass(this.getSettings('classes.collapsed'));

				this.elements.$tocBody.attr('aria-expanded', 'false');
				this.elements.$tocBody.slideUp();

				// close container in case a min-height is defined by the user
				this.elements.$widgetContainer.css('min-height', '0px');
			}

			onInit() {
				var self = this;

				this.viewportItems = [];
				this.initElements();
				this.bindEvents();

				jQuery(document).ready(function () {
					return self.run();
				});
			}

			onListItemClick(event) {
				this.itemClicked = true;

				setTimeout(() => this.itemClicked = false, 2000);

				const $clickedItem = jQuery(event.target),
					$list = $clickedItem.parent().next(),
					collapseNestedList = this.getElementSettings("collapse_subitems");

				let listIsActive;

				if ( collapseNestedList && $clickedItem.hasClass(this.getSettings("classes.firstLevelListItem")) ) {
					if ($list.is(":visible")) {
						listIsActive = true;
					}
				}

				this.activateItem($clickedItem);

				if (collapseNestedList && listIsActive) {
					$list.slideUp();
				}
			}

			handleStickyToc() {

				var self = this;

				var elementSettings = this.getElementSettings();

				var currentDeviceMode = elementorFrontend.getCurrentDeviceMode();

				var $devices = elementSettings.sticky_toc_disable_on;

				var target = this.getID();			

				var type = elementSettings.sticky_toc_type;

				if ("in-place" === type) {				
					
					var parentWidth = target.parent().parent().outerWidth();

					target.css("width", parentWidth);
					tocWidth = parentWidth;
				} else if( "custom-position" === type ) {
					target.css("width", "");
				}

				if (-1 !== $.inArray(currentDeviceMode, $devices) ) {

					target.removeClass('floating-toc');
					$(window).off('scroll', this.stickyScroll);

					return;
				}		

				$(window).on('scroll', $.proxy( this.stickyScroll, this ));		
			}

			stickyScroll(){

				var target = this.getID();
				var elementSettings = this.getElementSettings();
				var item = document.querySelector(".elementor-widget-pp-table-of-contents");			

				var bound, tocHeight;

				bound = item.getBoundingClientRect();

				tocHeight = target.outerHeight();

				if (target.hasClass("floating-toc")) {
					target.parent().parent().css("height", tocHeight);
				} else {
					target.parent().parent().css("height", '');
				}

				if (bound.y + bound.height / 2 < 0) {
					
					if(target.hasClass('floating-toc')){
						return;
					}

					target.fadeOut(250, function(){
						target.addClass("floating-toc");
						target.fadeIn();
					});

				} else {
					
					if(!target.hasClass('floating-toc')){
						return;
					}

					target.fadeOut(250, function(){
						target.removeClass("floating-toc");
						target.fadeIn();
					});
				}
			}

			scrollToTop() {
				var self = this;

				var scrollTo = this.getElementSettings("scroll_to_top_option");

				if ("window_top" === scrollTo) {
					$("html, body").animate({
						scrollTop: 0
					}, 250 );
				} else {

					var $id = this.getID().parents('.elementor-widget-pp-table-of-contents');

					$("html, body").animate({
						scrollTop: $($id).offset().top - 60,
					}, 250 );
				}
			}

			getID() {
				return $("#pp-toc-" + this.$element[0].attributes["data-id"].nodeValue);
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-table-of-contents', TocWidget );
	});

})(jQuery);

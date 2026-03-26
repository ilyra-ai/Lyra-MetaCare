(function ($) {
	$(window).on('elementor/frontend/init', () => {
		class GoogleMapsWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				return {
					selectors: {
						map: '.pp-google-map',
					},
				};
			}

			getDefaultElements() {
				const selectors = this.getSettings('selectors');
				return {
					$map: this.$element.find(selectors.map),
				};
			}

			bindEvents() {
				this.initMap();
			}

			initMap() {
				const elementSettings = this.getElementSettings(),
					widgetId          = this.getID(),
					mapElem           = this.elements.$map,
					locations         = mapElem.data('locations') || [],
					zoom              = mapElem.data('zoom') || 4,
					zoomType          = mapElem.data('zoomtype') || 'auto',
					mapType           = elementSettings.map_type || 'roadmap',
					streetViewControl = elementSettings.map_option_streeview === 'yes',
					mapTypeControl    = elementSettings.map_type_control === 'yes',
					zoomControl       = elementSettings.zoom_control === 'yes',
					fullScreenControl = elementSettings.fullscreen_control === 'yes',
					scrollZoom        = elementSettings.map_scroll_zoom === 'yes' ? 'auto' : 'none',
					mapStyle          = mapElem.data('custom-style') || '',
					animation         = elementSettings.marker_animation || '',
					iwMaxWidth        = parseInt(mapElem.data('iw-max-width'), 10) || null,
					markerAnimation   = this.getMarkerAnimation(animation),
					mapOptions        = this.getMapOptions({
						zoom,
						mapType,
						streetViewControl,
						mapTypeControl,
						zoomControl,
						fullScreenControl,
						scrollZoom,
						mapStyle,
						locations,
					});

				const map      = new google.maps.Map(mapElem[0], mapOptions),
					infowindow = new google.maps.InfoWindow(),
					bounds     = new google.maps.LatLngBounds();

				this.addMarkers({ locations, map, infowindow, bounds, zoomType, markerAnimation, iwMaxWidth });

				window[`pp_map_${widgetId}`] = map;
			}

			getMarkerAnimation(animation) {
				switch (animation) {
					case 'drop':
						return google.maps.Animation.DROP;
					case 'bounce':
						return google.maps.Animation.BOUNCE;
					default:
						return null;
				}
			}

			getMapOptions({ zoom, mapType, streetViewControl, mapTypeControl, zoomControl, fullScreenControl, scrollZoom, mapStyle, locations }) {
				const latlng = new google.maps.LatLng(locations[0]?.lat || 0, locations[0]?.lang || 0);

				return {
					zoom,
					center: latlng,
					mapTypeId: mapType,
					mapTypeControl,
					streetViewControl,
					zoomControl,
					fullscreenControl: fullScreenControl,
					gestureHandling: scrollZoom,
					styles: mapStyle,
				};
			}

			addMarkers({ locations, map, infowindow, bounds, zoomType, markerAnimation, iwMaxWidth }) {
				locations.forEach((location) => {
					const { lat, lang, infowindow: infoWin, title, description, marker_type: iconType, icon_url: iconUrl, icon_size: iconSize, iw_open: iwOnLoad } = location;

					if (!lat || !lang) return;

					const markerIcon = this.getMarkerIcon(iconType, iconUrl, iconSize);
					const markerPosition = new google.maps.LatLng(lat, lang);

					if (zoomType === 'auto') {
						bounds.extend(markerPosition);
						map.fitBounds(bounds);
					}

					const marker = new google.maps.Marker({
						position: markerPosition,
						map,
						title,
						icon: markerIcon,
						animation: markerAnimation,
					});

					if (infoWin === 'yes' && iwOnLoad === 'iw_open') {
						this.openInfoWindow({ infowindow, map, marker, title, description, iwMaxWidth });
					}

					google.maps.event.addListener(marker, 'click', () => {
						this.openInfoWindow({ infowindow, map, marker, title, description, iwMaxWidth });
					});

					google.maps.event.addListener(map, 'click', () => {
						infowindow.close();
					});
				});
			}

			getMarkerIcon(iconType, iconUrl, iconSize) {
				if (iconType !== 'custom') return null;

				const size = parseInt(iconSize, 10) || null;
				const icon = { url: iconUrl };

				if (!isNaN(size)) {
					icon.scaledSize = new google.maps.Size(size, size);
					icon.origin = new google.maps.Point(0, 0);
				}

				return icon;
			}

			openInfoWindow({ infowindow, map, marker, title, description, iwMaxWidth }) {
				let content = `<div class="pp-infowindow-content">
					<div class="pp-infowindow-title">${title}</div>`;

				if (description) {
					content += `<div class="pp-infowindow-description">${description}</div>`;
				}

				content += '</div>';

				const options = { content };
				if (iwMaxWidth) {
					options.maxWidth = iwMaxWidth;
				}

				infowindow.setOptions(options);
				infowindow.open(map, marker);
			}
		}

		elementorFrontend.elementsHandler.attachHandler('pp-google-maps', GoogleMapsWidget);
	});
})(jQuery);

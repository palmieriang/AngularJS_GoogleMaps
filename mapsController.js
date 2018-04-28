angular.module('myModule', ['ngMaterial', 'slickCarousel'])
.controller('mapsController', function($scope, $mdDialog) {

	const itemsPosition = localStorage.getItem("itemsPosition");
	$scope.totalItem = itemsPosition ? JSON.parse(itemsPosition) : [];

	$scope.imgBackground = [
		'https://images.unsplash.com/photo-1484544808355-8ec84e534d75?dpr=1&auto=compress,format&fit=crop&w=2266&h=&q=80&cs=tinysrgb&crop=',
		'https://images.unsplash.com/photo-1488646953014-85cb44e25828?dpr=1&auto=compress,format&fit=crop&w=1866&h=&q=80&cs=tinysrgb&crop=',
		'https://images.unsplash.com/photo-1497302347632-904729bc24aa?dpr=1&auto=compress,format&fit=crop&w=2250&h=&q=80&cs=tinysrgb&crop='
	];

	function initializeForm() {
		$scope.form = {
			firstName : {
				value : '',
				error : ''
			},
			lastName : {
				value : '',
				error : ''
			},
			address1 : {
				value : '',
				error : ''
			},
			address2 : {
				value : '',
				error : ''
			},
			city : {
				value : '',
				error : ''
			},
			country : {
				value : 'United Kingdom',
				error : ''
			},
			postcode : {
				value : '',
				error : ''
			},
			latitude : '',
			longitude : ''
		};
	}

	initializeForm();

	function validate(form) {
		var valid = true;
		form.firstName.error = '';
		form.lastName.error = '';
		form.address1.error = '';
		form.address2.error = '';
		form.postcode.error = '';

		if(form.firstName.value == null || form.firstName.value.length < 2 || form.firstName.value.length > 100) {
			form.firstName.error = 'First name must be between 2 and 100 characters long';
			valid = false;
		}

		if(form.lastName.value == null || form.lastName.value.length < 2 || form.lastName.value.length > 100) {
			form.lastName.error = 'Last name must be between 2 and 100 characters long';
			valid = false;
		}

		if(form.address1.value.length < 2 || form.address1.value.length > 100) {
			form.address1.error = 'Address line 1 must be between 2 and 100 characters long';
			valid = false;
		}

		if(!validatePostcode(form.postcode.value)) {
			form.postcode.error = 'Invalid postcode';
			valid = false;
		}

		return valid;
	}

	function validatePostcode(postcode) {
		var re = /^(GIR[ ]?0AA|((AB|AL|B|BA|BB|BD|BH|BL|BN|BR|BS|BT|CA|CB|CF|CH|CM|CO|CR|CT|CV|CW|DA|DD|DE|DG|DH|DL|DN|DT|DY|E|EC|EH|EN|EX|FK|FY|G|GL|GY|GU|HA|HD|HG|HP|HR|HS|HU|HX|IG|IM|IP|IV|JE|KA|KT|KW|KY|L|LA|LD|LE|LL|LN|LS|LU|M|ME|MK|ML|N|NE|NG|NN|NP|NR|NW|OL|OX|PA|PE|PH|PL|PO|PR|RG|RH|RM|S|SA|SE|SG|SK|SL|SM|SN|SO|SP|SR|SS|ST|SW|SY|TA|TD|TF|TN|TQ|TR|TS|TW|UB|W|WA|WC|WD|WF|WN|WR|WS|WV|YO|ZE)(\d[\dA-Z]?[ ]?\d[ABD-HJLN-UW-Z]{2}))|BFPO[ ]?\d{1,4})$/;
		return re.test(postcode);
	}

	$scope.formatDate = function(str) {
		if(str == null) {
			return null;
		}
		else {
			return moment(str).format('dddd Do MMMM YYYY');
		}
	}

	$scope.$watch('chosenPlaceDetails', function(value, old) {
		if ($scope.chosenPlaceDetails) {
			googleAutoCompleteAddress($scope.chosenPlaceDetails, $scope.form);
		}
	}, true);

	function googleAutoCompleteAddress(chosenPlace, form) {
		form.address1.value = '';
		form.address2.value = '';
		form.city.value = '';
		form.country.value = '';
		form.postcode.value = '';

		var addressComponents = chosenPlace.address_components;
		var line1 = [];
		var addressType;
		for (var i = 0; i < addressComponents.length; i++) {
			addressType = addressComponents[i].types[0];

			if (addressType == 'street_number' || addressType == 'route') {
				line1.push(addressComponents[i].long_name);
			}

			if (addressType == 'neighborhood') {
				form.address2.value = addressComponents[i].long_name;
			}

			if (addressType == 'postal_town') {
				form.city.value = addressComponents[i].long_name;
			}

			if (addressType == 'country') {
				form.country.value = addressComponents[i].long_name;
			}

			if (addressType == 'postal_code') {
				form.postcode.value = addressComponents[i].long_name;
			}
		}

		form.address1.value = line1.join(' ');

		form.latitude = chosenPlace.geometry.location.lat();
		form.longitude = chosenPlace.geometry.location.lng();

		console.log(form);
	}

	console.log($scope.totalItem);

	$scope.addItem = function() {
		if (validate($scope.form)) {

			// confirm details popup
			$scope.showConfirmation();

			// add item without popup confirmation
			// $scope.form.timestamp = new Date();

			// $scope.totalItem.push({lat: $scope.form.latitude, lng: $scope.form.longitude, name: $scope.form.firstName.value + ' ' + $scope.form.lastName.value, date: $scope.form.timestamp});

			// if(typeof(Storage) !== "undefined") {
			// 	localStorage.setItem("itemsPosition", JSON.stringify($scope.totalItem));
			// }

			// console.log($scope.form);

			// initializeForm();
			// $scope.requestSubmitted = true;
		} else {
			$scope.submitActivationError = true;
		}
	}

	function initMap() {

		var infowindow = new google.maps.InfoWindow();
		var bounds = new google.maps.LatLngBounds();
		var marker, i;
		var iconImage = 'pin-map.png';

		$scope.markers = [];

		var mapOptions = {
			zoom: 6,
			center: new google.maps.LatLng(51.509865, -0.118092),
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			zoomControl: true,
			mapTypeControl: true,
			scaleControl: false,
			streetViewControl: false,
			rotateControl: false,
			fullscreenControl: false,
			scrollwheel: true,
			 mapTypeControlOptions: {
          mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
                  'styled_map']
      }
		};

		var styledMapType = new google.maps.StyledMapType(
		[
		  {
		    "elementType": "geometry",
		    "stylers": [
		      {
		        "color": "#242f3e"
		      }
		    ]
		  },
		  {
		    "elementType": "labels.text.fill",
		    "stylers": [
		      {
		        "color": "#746855"
		      }
		    ]
		  },
		  {
		    "elementType": "labels.text.stroke",
		    "stylers": [
		      {
		        "color": "#242f3e"
		      }
		    ]
		  },
		  {
		    "featureType": "administrative.locality",
		    "elementType": "labels.text.fill",
		    "stylers": [
		      {
		        "color": "#d59563"
		      }
		    ]
		  },
		  {
		    "featureType": "poi",
		    "elementType": "labels.text.fill",
		    "stylers": [
		      {
		        "color": "#d59563"
		      }
		    ]
		  },
		  {
		    "featureType": "poi.park",
		    "elementType": "geometry",
		    "stylers": [
		      {
		        "color": "#263c3f"
		      }
		    ]
		  },
		  {
		    "featureType": "poi.park",
		    "elementType": "labels.text.fill",
		    "stylers": [
		      {
		        "color": "#6b9a76"
		      }
		    ]
		  },
		  {
		    "featureType": "road",
		    "elementType": "geometry",
		    "stylers": [
		      {
		        "color": "#38414e"
		      }
		    ]
		  },
		  {
		    "featureType": "road",
		    "elementType": "geometry.stroke",
		    "stylers": [
		      {
		        "color": "#212a37"
		      }
		    ]
		  },
		  {
		    "featureType": "road",
		    "elementType": "labels.text.fill",
		    "stylers": [
		      {
		        "color": "#9ca5b3"
		      }
		    ]
		  },
		  {
		    "featureType": "road.highway",
		    "elementType": "geometry",
		    "stylers": [
		      {
		        "color": "#746855"
		      }
		    ]
		  },
		  {
		    "featureType": "road.highway",
		    "elementType": "geometry.stroke",
		    "stylers": [
		      {
		        "color": "#1f2835"
		      }
		    ]
		  },
		  {
		    "featureType": "road.highway",
		    "elementType": "labels.text.fill",
		    "stylers": [
		      {
		        "color": "#f3d19c"
		      }
		    ]
		  },
		  {
		    "featureType": "transit",
		    "elementType": "geometry",
		    "stylers": [
		      {
		        "color": "#2f3948"
		      }
		    ]
		  },
		  {
		    "featureType": "transit.station",
		    "elementType": "labels.text.fill",
		    "stylers": [
		      {
		        "color": "#d59563"
		      }
		    ]
		  },
		  {
		    "featureType": "water",
		    "elementType": "geometry",
		    "stylers": [
		      {
		        "color": "#17263c"
		      }
		    ]
		  },
		  {
		    "featureType": "water",
		    "elementType": "labels.text.fill",
		    "stylers": [
		      {
		        "color": "#515c6d"
		      }
		    ]
		  },
		  {
		    "featureType": "water",
		    "elementType": "labels.text.stroke",
		    "stylers": [
		      {
		        "color": "#17263c"
		      }
		    ]
		  }
		],
		{name: 'Styled Map'});

		// Create a map object and specify the DOM element for display.
		var map = new google.maps.Map(document.getElementById('map'), mapOptions);

		// styled map
		map.mapTypes.set('styled_map', styledMapType);
		map.setMapTypeId('styled_map');

		// Multiple markers
		if ($scope.totalItem) {
			for (var i = 0; i < $scope.totalItem.length; i++) {
				console.log($scope.totalItem[i]);
				var position = new google.maps.LatLng($scope.totalItem[i].lat, $scope.totalItem[i].lng);
				bounds.extend(position);

				var marker = new google.maps.Marker({
					position: $scope.totalItem[i],
					icon: iconImage,
					map: map
				});

				// infowindow
				google.maps.event.addListener(marker, 'click', (function(marker, i) {
					return function() {
						infowindow.setContent('<div>\
							<p>Name: <span><strong>' + $scope.totalItem[i].name + '</strong></span></p>\
							<p>Date: <span><strong>' + $scope.formatDate($scope.totalItem[i].date) + '</strong></span></p>\
							</div>');
						infowindow.open(map, marker);
					}
				})(marker, i));

				// Automatically center the map fitting all markers on the screen
				map.fitBounds(bounds);

			}
		} else {
			var marker = new google.maps.Marker({
				position: {lat: 51.509865, lng: -0.118092},
				map: map
			});
		}
	}

	// Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
	var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
			this.setZoom(14);
			google.maps.event.removeListener(boundsListener);
	});

	initMap();

	// Popup 1
	$scope.showConfirmation = function(ev) {
		$mdDialog.show({
			templateUrl: 'dialogPopup.html',
			locals: {
				form: $scope.form
			},
			controller: 'confirmController',
			clickOutsideToClose: true
		}).then(function() {

			$scope.form.timestamp = new Date();

			$scope.totalItem.push({lat: $scope.form.latitude, lng: $scope.form.longitude, name: $scope.form.firstName.value + ' ' + $scope.form.lastName.value, date: $scope.form.timestamp});

			if(typeof(Storage) !== "undefined") {
				localStorage.setItem("itemsPosition", JSON.stringify($scope.totalItem));
			}

			initializeForm();
			$scope.requestSubmitted = true;

		}, function() {
			console.log('not added');
		});

	};

	// Popup 2 (needs local server)
	$scope.showConfirmation = function(ev) {
		$mdDialog.show({
			templateUrl: 'popupConfirm.html',
			controller: 'confirmController',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose: false,
			fullscreen: true,
			locals:{
				form: $scope.form
			}
		}).then(function() {

			$scope.form.timestamp = new Date();

			$scope.totalItem.push({lat: $scope.form.latitude, lng: $scope.form.longitude, name: $scope.form.firstName.value + ' ' + $scope.form.lastName.value, date: $scope.form.timestamp});

			if(typeof(Storage) !== "undefined") {
				localStorage.setItem("itemsPosition", JSON.stringify($scope.totalItem));
			}

			initializeForm();
			$scope.requestSubmitted = true;

		}, function() {
			console.log('not added');
		});
	};

})
.controller('confirmController', function($scope, $mdDialog, form) {
	$scope.firstName = form.firstName.value;
	$scope.lastName = form.lastName.value;
	$scope.address1 = form.address1.value;
	$scope.address2 = form.address2.value;
	$scope.country = form.country.value;
	$scope.city = form.city.value;
	$scope.postcode = form.postcode.value;

	$scope.cancel = function() {
		$mdDialog.cancel();
	}

	$scope.submit = function() {
		$mdDialog.hide();
	}

	$scope.formatDate = function(str) {
		if(str == null) {
			return null;
		} else {
			return moment(str).format('dddd Do MMMM YYYY');
		}
	}

})
.directive('googleplace', function($rootScope) {
	return {
		require: 'ngModel',
		scope: {
			ngModel: '=',
			details: '=?'
		},
		link: function(scope, element, attrs, model) {
			var options = {
				types: []
			};
			scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

			google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
				scope.$apply(function() {
					scope.details = scope.gPlace.getPlace();
					model.$setViewValue(element.val());
				});
			});
		}
	};
})
.directive('imageHeader', function() {
	return {
		restrict: 'E',
		templateUrl: '/header.html',
		controller: function($scope) {

		}
	};
});



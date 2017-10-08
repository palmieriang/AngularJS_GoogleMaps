angular.module('myModule', ['ngMaterial'])
.controller('mapsController', function($scope) {

  $scope.totalItem = JSON.parse(localStorage.getItem("itemsPosition") || "[]");

  function initializeRequestForm() {
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

  initializeRequestForm();

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
    $scope.totalItem.push({lat: $scope.form.latitude, lng: $scope.form.longitude});
    console.log($scope.totalItem);
    if(typeof(Storage) !== "undefined") {
      localStorage.setItem("itemsPosition", JSON.stringify($scope.totalItem));
    }
    initializeRequestForm();
  }

	function initMap() {

    var infowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    var marker, i;

    $scope.markers = [];

    var mapOptions = {
      zoom: 13,
      center: new google.maps.LatLng(51.509865, -0.118092),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      scrollwheel: true,
      mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
      }
    };

	  // Create a map object and specify the DOM element for display.
	  var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Multiple markers
    if ($scope.totalItem) {
      for (var i = 0; i < $scope.totalItem.length; i++) {
        console.log($scope.totalItem[i]);

        var marker = new google.maps.Marker({
          position: $scope.totalItem[i],
          map: map
        });

        // infowindow
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
          return function() {
            infowindow.setContent('<div><p>Test</p></div>');
            infowindow.open(map, marker);
          }
        })(marker, i));

      }
    } else {
      var marker = new google.maps.Marker({
        position: {lat: 51.509865, lng: -0.118092},
        map: map
      });
    }
	}

	initMap();

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
});


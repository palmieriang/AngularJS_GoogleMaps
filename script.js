angular.module('myModule', ['ngMaterial'])
.controller('mapsController', function($scope) {

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
      longitude : '',
      quantity : {
        value : '',
        error : ''
      }
      // signDate : {
      //     value : '',
      //     error : ''
      // },
    };  
  }

  initializeRequestForm();

	function initMap() {
	  // Create a map object and specify the DOM element for display.
	  var map = new google.maps.Map(document.getElementById('map'), {
	    center: {lat: 51.509865, lng: -0.118092},
	    zoom: 8
	  });
	}

	initMap();

});
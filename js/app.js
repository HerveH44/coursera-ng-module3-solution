(function() {
  'use strict';

  angular.module('NarrowItDownApp', [])
  .controller('NarrowItDownController', NarrowItDownController)
  .service('MenuSearchService', MenuSearchService)
  .directive('foundItems', foundItemsDirective)
  .constant('ApiBasePath', "http://davids-restaurant.herokuapp.com");

  function foundItemsDirective() {
    var ddo = {
      restrict: 'E',
      templateUrl: 'directive/foundItems.html',
      scope: {
        foundItems: '<',
        onRemove: '&',
        noItemFound: '<'
      },
      controller: foundItemsDirectiveController,
      controllerAs: 'list',
      bindToController: true
    };

    return ddo;
  }

  function foundItemsDirectiveController() {
    var list = this;

    list.buttonTitle = "Don't want this one!";
    list.noResultTitle = "Nothing found";
  }


  NarrowItDownController.$inject = ['MenuSearchService'];
  function NarrowItDownController(MenuSearchService) {
    var ctrl = this;

    ctrl.title = "Narrow Down Your Chinese Menu Choice";
    ctrl.buttonTitle = "Narrow It Down For Me!";

    ctrl.searchTerm = "";
    ctrl.found = [];
    ctrl.noItemFound = false;

    ctrl.getMatchedMenuItems = function () {
      MenuSearchService.getMatchedMenuItems(ctrl.searchTerm)
      .then(function(response){
        ctrl.found = response;
        ctrl.noItemFound = ctrl.found.length == 0;
        console.log("ctrl.noItemFound:", ctrl.noItemFound);
      });
    }

    ctrl.onRemove = function (index) {
      ctrl.found.splice(index, 1);
    }
  }

  MenuSearchService.inject = ['$http', 'ApiBasePath'];
  function MenuSearchService($http, ApiBasePath) {
    var service = this;

    service.getMatchedMenuItems = function(searchTerm) {
      return service.getMenuItems()
      .then(function (result) {
          service.menuItems = result.data.menu_items;

          function filterMenu(el) {
              return searchTerm && el.description.indexOf(searchTerm) !== -1;
          }

          var foundItems = service.menuItems.filter(filterMenu);

          // return processed items
          return foundItems;
      });
    };

    service.getMenuItems = function() {
      return service.result = service.result || $http({
        method: "GET",
        url: (ApiBasePath + "/menu_items.json"),
      });
    }
  }
})();

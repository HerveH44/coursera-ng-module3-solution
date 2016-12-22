/**
 * Created by hhuneau on 21/12/2016.
 * Reformat thanks to dbourgon
 */

// IIFE
(function() {
    'use strict';

    // Definitions
    angular.module('NarrowItDownApp', [])
        .controller('NarrowItDownController', NarrowItDownController)
        .service('MenuSearchService', MenuSearchService)
        .directive('foundItems', foundItemsDirective)
        .constant('ApiBasePath', "http://davids-restaurant.herokuapp.com");

    ///////////////
    // DIRECTIVE:  FoundItemsDirective
    //////////////
    function foundItemsDirective() {
        var ddo = {
            restrict: 'E',
            templateUrl: 'directive/foundItems.html',
            scope: {
                foundItems: '<',
                onRemove: '&',
                noItemFound: '<',
                searching: '<isSearching',
                finished: '<isFinished'
            },
            controller: foundItemsDirectiveController,
            controllerAs: 'list',
            bindToController: true
        };

        return ddo;
    }

    ///////////////
    // DIRECTIVE CTRL:  FoundItemsDirective
    //////////////
    function foundItemsDirectiveController() {
        var list = this;

        list.buttonTitle = "Don't want this one!";
        list.noResultTitle = "Nothing found";

        list.sortOrder = 'id';
        list.sortReverse = false;

        list.headers = [{
            lib: "Id.",
            id: "id"
        },{
            lib: "Short name",
            id: "short_name"
        },{
            lib: "Name",
            id: "name"
        },{
            lib: "Description",
            id: "description"
        },{
            lib: "Price small",
            id: "price_small"
        },{
            lib: "Price large",
            id: "price_large"
        }];
    }

    ///////////////
    // CONTROLLER:     NarrowItDownController
    //////////////
    NarrowItDownController.$inject = ['MenuSearchService'];

    function NarrowItDownController(MenuSearchService) {
        var main = this;

        main.title = "Narrow Down Your Chinese Menu Choice";
        main.buttonTitle = "Narrow It Down For Me!";

        main.searchTerm = "";
        main.found = [];
        main.searching = false;
        main.end = false;

        main.getMatchedMenuItems = function() {
            main.found = [];
            main.end = false;

            if (!main.searchTerm) {
                main.end = true;
                return;
            }

            main.searching = true;
            MenuSearchService.getMatchedMenuItems(main.searchTerm)
                .then(function(response) {
                    main.found = response;
                    main.searching = false;
                    main.end = true;
                })
                .catch(function(error) {
                    main.found = [];
                    main.searching = false;
                    main.end = true;
                });
        }

        main.onRemove = function(index) {
            main.found.splice(index, 1);
        }
    }
    ///////////////
    // SERVICE:     MenuSearchService
    //////////////
    MenuSearchService.inject = ['$http', 'ApiBasePath'];

    function MenuSearchService($http, ApiBasePath) {
        var service = this;

        service.getMatchedMenuItems = function(searchTerm) {
            return service.getMenuItems()
                .then(function(result) {
                    service.menuItems = result.data.menu_items;

                    function filterMenu(el) {
                        return el.description.indexOf(searchTerm) !== -1;
                    }

                    var foundItems = service.menuItems.filter(filterMenu);

                    // return processed items
                    return foundItems;
                }, function(error) {
                    return error;
                });
        };

        service.getMenuItems = function() {
            return $http({
                method: "GET",
                url: (ApiBasePath + "/menu_items.json"),
            });
        }
    }
})();

(function () {
    'use strict';

    var VIEWER_DEFAULT_FILE = 'candy.pdf';

    angular
        .module('GroupDocsViewer', ['ngMaterial', 'ngResource'])
        .factory('FilesFactory', FilesFactory)
        .factory('DocumentInfoFactory', DocumentInfoFactory)
        .controller('ToolbarController', ToolbarController)
        .controller('ThumbnailsController', ThumbnailsController)
        .controller('PagesController', PagesController)
        .controller('AvailableFilesController', AvailableFilesController)
        .constant('FilePath', 'http://www.w3.org/2011/web-apps-ws/papers/Nitobi.pdf')
    	.constant('Watermark',{Text: 'Watermark Text',Color: '16711680',Position: 'Diagonal',Width: '50'});
    ;

    function FilesFactory($resource) {
        return $resource('/files', {}, {
            query: {
                method: 'GET',
                isArray: true
            }
        });
    }

    function DocumentInfoFactory($resource) {
        return $resource('/document/pages?file=:filename', {}, {
            query: {
                method: 'GET',
                //isArray: true
                isArray: false
            }
        });
    }

    function ToolbarController($rootScope, $scope, $mdSidenav,Watermark) {
        $scope.toggleLeft = function () {
            $mdSidenav('left').toggle().then(function () {
                $rootScope.$broadcast('md-sidenav-toggle-complete', $mdSidenav('left'));
            });
        };
        
        $scope.watermark = {
        		Text: Watermark.Text,
        		Color: Watermark.Color, 
        		Position: Watermark.Position,
        		Width: Watermark.Width
        };

        $scope.$on('selected-file-changed', function ($event, selectedFile) {
            $scope.selectedFile = selectedFile;
        });
    }

    function ThumbnailsController($rootScope, $scope, $sce, $mdSidenav, DocumentInfoFactory,FilePath,Watermark) {

        $scope.isLeftSidenavVislble = false;

        if (FilePath) {
        	 $scope.selectedFile = FilePath;
        	 $scope.docInfo = DocumentInfoFactory.query({
        		 filename: FilePath
        	 });
        }
        
        $scope.$on('selected-file-changed', function (event, selectedFile) {
            $scope.selectedFile = selectedFile;
            $scope.docInfo = DocumentInfoFactory.query({
                filename: selectedFile
            });
        });

        $scope.$on('md-sidenav-toggle-complete', function ($event, component) {
            $scope.isLeftSidenavVislble = component.isOpen();
        });

        $scope.onThumbnailClick = function ($event, item) {
            $mdSidenav('left').toggle().then(function () {
                location.hash = 'page-view-' + item.number;
                $rootScope.$broadcast('md-sidenav-toggle-complete', $mdSidenav('left'));
            });
        };

        $scope.onAttachmentThumbnailClick = function ($event,name,number) {
        	 $mdSidenav('left').toggle().then(function () {
        		 location.hash = 'page-view-'+name+'-'+number;
        		 $rootScope.$broadcast('md-sidenav-toggle-complete', $mdSidenav('left'));
        	 });
        };
        
        $scope.createThumbnailUrl = function (pageNumber) {
            if ($scope.isLeftSidenavVislble) {
                return $sce.trustAsResourceUrl('/page/image?width=300&file=' + $scope.selectedFile
                		+ '&page=' + pageNumber
                		+ '&watermarkText=' + Watermark.Text
                		+ '&watermarkColor=' + Watermark.Color
                		+ '&watermarkPosition=' + Watermark.Position
                		+ '&watermarkWidth=' + Watermark.Width);
            }
        };
        
        $scope.createAttachmentThumbnailPageUrl = function (selectedFile,attachment,itemNumber) {
        	if ($scope.isLeftSidenavVislble) {
        		return $sce.trustAsResourceUrl('/attachment/image?width=300&file=' + selectedFile
        				+ '&attachment=' + attachment 
        				+ '&page=' + itemNumber
                		+ '&watermarkText=' + Watermark.Text
                		+ '&watermarkColor=' + Watermark.Color
                		+ '&watermarkPosition=' + Watermark.Position
                		+ '&watermarkWidth=' + Watermark.Width);
        	}
        };

    }

    function PagesController($scope, $sce, DocumentInfoFactory,FilePath,Watermark) {
    	if (FilePath) {
       	 	$scope.selectedFile = FilePath;
       	 	$scope.docInfo = DocumentInfoFactory.query({
       		 filename: FilePath
       	 	});
        }
    	$scope.$on('selected-file-changed', function (event, selectedFile) {
            $scope.selectedFile = selectedFile;
            $scope.docInfo = DocumentInfoFactory.query({
                filename: selectedFile
            });
        });

        $scope.createPageUrl = function (pageNumber) {
            return $sce.trustAsResourceUrl('/page/html?file=' + $scope.selectedFile
            		+ '&page=' + pageNumber
            		+ '&watermarkText=' + Watermark.Text
            		+ '&watermarkColor=' + Watermark.Color
            		+ '&watermarkPosition=' + Watermark.Position
            		+ '&watermarkWidth=' + Watermark.Width);
        };
        
        $scope.createAttachmentPageUrl = function (selectedFile,attachmentName, itemNumber) {
        	 return $sce.trustAsResourceUrl('/attachment/html?file=' + selectedFile
        			 + '&attachment=' + attachmentName
        			 + '&page=' + itemNumber
        			 + '&watermarkText=' + Watermark.Text
        			 + '&watermarkColor=' + Watermark.Color
        			 + '&watermarkPosition=' + Watermark.Position
        			 + '&watermarkWidth=' + Watermark.Width);
        };
    }

    function AvailableFilesController($rootScope, $scope, FilesFactory,DocumentInfoFactory, FilePath) {
    	if (FilePath) {
    		$scope.selectedFile = FilePath;
    		$scope.docInfo = DocumentInfoFactory.query({
    			filename: FilePath
    		});
        }
    	
    	$scope.onOpen = function () {
            $scope.list = FilesFactory.query();
        };

        $scope.onChange = function ($event) {
            $rootScope.$broadcast('selected-file-changed', $scope.selectedFile);
        };

        setTimeout(function () {
            if (VIEWER_DEFAULT_FILE) {
                $scope.list = [VIEWER_DEFAULT_FILE];
                $scope.selectedFile = $scope.list[0];
                $rootScope.$broadcast('selected-file-changed', $scope.selectedFile);
            }
        }, 1000);

    }

})();

function iframe_auto_height(iframe) {
    var body = iframe.contentWindow.document.body,
        html = iframe.contentWindow.document.documentElement,
        height = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
        );

    iframe.parentNode.style.height = height + 'px';
}

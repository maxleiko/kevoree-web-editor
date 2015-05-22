'use strict';

/**
 * @ngdoc function
 * @name editorApp.controller:EditorCtrl
 * @description
 * # EditorCtrl
 * Controller of the editorApp editor
 */
angular.module('editorApp')
    .controller('EditorCtrl', function ($scope, kEditor, uiFactory, kModelHelper, kFactory) {
        $scope.dropDroppable = {
            onDrop: 'onDrop'
        };
        $scope.dropOptions = {
            accept: function (obj) {
                var pkgPath = obj[0].dataset.pkgPath;
                var tdefName = obj[0].innerHTML.trim();
                var tdefs = kEditor.getModel().select(pkgPath+'/typeDefinitions[name='+tdefName+']');
                var tdef = kModelHelper.findBestVersion(tdefs.array);
                var type = kModelHelper.getTypeDefinitionType(tdef);
                // TODO
                //console.log('TODO accept for ', pkgPath, tdef, type);
                return true;
            }
        };

        /**
         * Adds a new instance to the model based on the dropped TypeDefinition
         * @param evt
         * @param obj
         */
        $scope.onDrop = function (evt, obj) {
            var pkgPath = obj.helper[0].dataset.pkgPath;
            var tdefName = obj.helper[0].innerHTML.trim();
            var tdefs = kEditor.getModel().select(pkgPath+'/typeDefinitions[name='+tdefName+']');
            var tdef = kModelHelper.findBestVersion(tdefs.array);
            var type = kModelHelper.getTypeDefinitionType(tdef);

            var model = kEditor.getModel();
            var instance;
            switch (type) {
                case 'node':
                    instance = kFactory.createContainerNode();
                    instance.name = 'node'+parseInt(Math.random()*1000);
                    instance.typeDefinition = tdef;
                    model.addNodes(instance);
                    break;

                case 'group':
                    instance = kFactory.createGroup();
                    instance.name = 'grp'+parseInt(Math.random()*1000);
                    instance.typeDefinition = tdef;
                    model.addGroups(instance);
                    break;

                case 'component':
                    instance = kFactory.createComponentInstance();
                    instance.name = 'comp'+parseInt(Math.random()*1000);
                    instance.typeDefinition = tdef;
                    console.log('TODO add comp logic');
                    break;

                case 'channel':
                    instance = kFactory.createChannel();
                    instance.name = 'chan'+parseInt(Math.random()*1000);
                    instance.typeDefinition = tdef;
                    model.addHubs(instance);
                    break;
            }
        };

        // init the UI kFactory
        uiFactory.init();

        /**
         * Create svg UIs based on current kEditor.getModel()
         */
        function processModel() {
            var model = kEditor.getModel();
            var visitor = new KevoreeLibrary.modeling.api.util.ModelVisitor();
            visitor.visit = function (elem, ref) {
                switch (ref) {
                    case 'nodes':
                        uiFactory.createNode(elem);
                        break;

                    case 'groups':
                        uiFactory.createGroup(elem);
                        break;

                    case 'components':
                        uiFactory.createComponent(elem);
                        break;

                    case 'hubs':
                        uiFactory.createChannel(elem);
                        break;
                }
            };

            model.visit(visitor, false, true, false);
        }

        // listen to model changes on the editor
        kEditor.addListener(processModel);

        // process model to create the instance UIs
        processModel();

        $scope.$on('$destroy', function () {
            kEditor.removeListener(processModel);
        });
    });
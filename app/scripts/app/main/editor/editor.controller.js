'use strict';

/**
 * @ngdoc function
 * @name editorApp.controller:EditorCtrl
 * @description
 * # EditorCtrl
 * Controller of the editorApp editor
 */
angular.module('editorApp')
    .controller('EditorCtrl', function ($scope, kEditor, ui, uiUtils, kModelHelper, kFactory, kInstance, Notification, KWE_POSITION) {
        // init the UI kFactory
        ui.init();

        // process model to create the instance UIs
        kEditor.drawModel();

        $scope.dropDroppable = {
            onDrop: 'onDrop'
        };
        $scope.dropOptions = {
            accept: function (obj) {
                var accept = false;
                var pkgPath = obj[0].dataset.pkgPath;
                var tdefName = obj[0].innerHTML.trim();
                var tdefs = kEditor.getModel().select(pkgPath+'/typeDefinitions[name='+tdefName+']');
                var tdef = kModelHelper.findBestVersion(tdefs.array);
                var type = kModelHelper.getTypeDefinitionType(tdef);

                if (type === 'component') {
                    accept = ui.getDropTarget();
                } else {
                    accept = true;
                }

                // TODO improve to handle TypeDef checks
                return accept;
            }
        };

        /**
         * Adds a new instance to the model based on the dropped TypeDefinition
         * @param evt
         * @param obj
         */
        $scope.onDrop = function (evt, obj) {
            var pkgPath = obj.draggable.scope().tdef.pkgPath;
            var tdefName = obj.draggable.scope().tdef.name;
            var tdefs = kEditor.getModel().select(pkgPath+'/typeDefinitions[name='+tdefName+']');
            var tdef = kModelHelper.findBestVersion(tdefs.array);
            var type = kModelHelper.getTypeDefinitionType(tdef);
            var m = ui.editor.transform().localMatrix;

            function preProcess(instance) {
                instance.typeDefinition = tdef;
                instance.started = true;
                var pos = kFactory.createValue();
                pos.name = KWE_POSITION;
                var pt = uiUtils.getPointInEditor(ui.mousePos.x, ui.mousePos.y);
                pos.value = JSON.stringify({
                    x: pt.x - m.e,
                    y: pt.y - m.f
                });
                instance.addMetaData(pos);
                kInstance.initDictionaries(instance);
            }

            var model = kEditor.getModel();
            var dropTarget = ui.getDropTarget();
            var instance, node;
            switch (type) {
                case 'node':
                    instance = kFactory.createContainerNode();
                    instance.name = 'node'+parseInt(Math.random()*1000);
                    preProcess(instance);
                    model.addNodes(instance);
                    if (dropTarget) {
                        node = model.findByPath(dropTarget.attr('data-path'));
                        if (node) {
                            node.addHosts(instance);
                        }
                    }
                    break;

                case 'group':
                    instance = kFactory.createGroup();
                    instance.name = 'group'+parseInt(Math.random()*1000);
                    preProcess(instance);
                    kInstance.initFragmentDictionaries(instance);
                    model.addGroups(instance);
                    break;

                case 'component':
                    instance = kFactory.createComponentInstance();
                    instance.name = 'comp'+parseInt(Math.random()*1000);
                    preProcess(instance);
                    if (dropTarget) {
                        node = model.findByPath(dropTarget.attr('data-path'));
                        if (node) {
                            node.addComponents(instance);
                        }
                    } else {
                        Notification.warning({
                            title: 'Add component',
                            message: 'You have to drop components in nodes',
                            delay: 5000
                        });
                    }
                    break;

                case 'channel':
                    instance = kFactory.createChannel();
                    instance.name = 'chan'+parseInt(Math.random()*1000);
                    preProcess(instance);
                    kInstance.initFragmentDictionaries(instance);
                    model.addHubs(instance);
                    break;
            }

            ui.setDropTarget(null);
            return true;
        };
    });

(function(_) {'use strict';

angular.module('ag-admin').controller(
    'DbAdapterController',
    function ($scope, $state, $stateParams, flash, DbAdapterResource, dbAdapters) {
        $scope.dbAdapters           = dbAdapters;
        $scope.showNewDbAdapterForm = false;
        $scope.activeAdapter        = $stateParams.adapter ? $stateParams.adapter : '';
        $scope.inEdit               = !!$stateParams.edit;

        $scope.resetForm = function () {
            $scope.$broadcast('ag-form-submit-complete');
            $scope.$broadcast('ag-form-validation-errors-clear');
            $scope.showNewDbAdapterForm = false;
            $scope.adapterName = '';
            $scope.driver      = '';
            $scope.database    = '';
            $scope.dsn         = '';
            $scope.username    = '';
            $scope.password    = '';
            $scope.hostname    = '';
            $scope.port        = '';
            $scope.charset     = '';
            return true;
        };

        $scope.cancelEdit = function () {
            $state.go($state.$current.name, {edit: ''}, {reload: true, inherit: true});
        };

        $scope.startEdit = function () {
            $state.go($state.$current.name, {edit: true}, {notify: true, inherit: true});
        };

        var updateDbAdapters = function (force, message) {
            DbAdapterResource.getList(force).then(function (updatedAdapters) {
                if (message) {
                    flash.success = message;
                }
                $state.go($state.current, {edit: ''}, {
                    reload: true, inherit: true, notify: true
                });
            });
        };

        $scope.createNewDbAdapter = function () {
            var options = {
                adapter_name :  $scope.adapter_name,
                driver       :  $scope.driver,
                database     :  $scope.database,
                username     :  $scope.username,
                password     :  $scope.password,
                hostname     :  $scope.hostname,
                port         :  $scope.port,
                charset      :  $scope.charset
            };
            if ($scope.dsn) {
                options.dsn = $scope.dsn;
            }
            DbAdapterResource.createNewAdapter(options).then(
                function (dbAdapter) {
                    updateDbAdapters(true, 'Database adapter created');
                    $scope.resetForm();
                },
                function (error) {
                    $scope.$broadcast('ag-form-submit-complete');

                    if (error.status !== 400 && error.status !== 422) {
                        /* generic, non-validation related error! */
                        flash.error = 'Error submitting new API';
                        return;
                    }

                    var validationErrors;

                    if (error.status === 400) {
                        validationErrors = [ 'Unexpected or missing data processing form' ];
                    } else {
                        validationErrors = error.data.validation_messages;
                    }

                    $scope.$broadcast('ag-form-validation-errors', validationErrors);
                    flash.error = 'We were unable to validate your form; please check for errors.';
                }
            );
        };

        $scope.saveDbAdapter = function (index) {
            var dbAdapter = $scope.dbAdapters[index];
            var options = {
                driver   :  dbAdapter.driver,
                database :  dbAdapter.database,
                username :  dbAdapter.username,
                password :  dbAdapter.password,
                hostname :  dbAdapter.hostname,
                port     :  dbAdapter.port,
                charset  :  dbAdapter.charset
            };
            if (dbAdapter.dsn) {
                options.dsn = dbAdapter.dsn;
            }
            DbAdapterResource.saveAdapter(dbAdapter.adapter_name, options).then(
                function (dbAdapter) {
                    $scope.$broadcast('ag-form-submit-complete');
                    $scope.$broadcast('ag-form-validation-errors-clear');
                    updateDbAdapters(true, 'Database adapter ' + dbAdapter.adapter_name + ' updated');
                },
                function (error) {
                    $scope.$broadcast('ag-form-submit-complete');

                    if (error.status !== 400 && error.status !== 422) {
                        /* generic, non-validation related error! */
                        flash.error = 'Error submitting new API';
                        return;
                    }

                    var validationErrors;

                    if (error.status === 400) {
                        validationErrors = [ 'Unexpected or missing data processing form' ];
                    } else {
                        validationErrors = error.data.validation_messages;
                    }

                    $scope.$broadcast('ag-form-validation-errors', validationErrors);
                    flash.error = 'We were unable to validate your form; please check for errors.';
                }
            );
        };

        $scope.removeDbAdapter = function (adapter_name) {
            DbAdapterResource.removeAdapter(adapter_name).then(function () {
                updateDbAdapters(true, 'Database adapter ' + adapter_name + ' removed');
                $scope.deleteDbAdapter = false;
            });
        };
    }
);

})(_);

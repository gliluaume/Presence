angular.module('ngPresence.schedule', [
    'ui.router',
    'DataModule',
    'placeholders',
    'ui.bootstrap',
    'ngPresence.core'
])

.config(function config($stateProvider) {
    $stateProvider.state('schedule', {
        url: '/schedule',
        views: {
            "main": {
                controller: 'ScheduleCtrl',
                templateUrl: 'schedule/schedule.tpl.html'
            }
        },
        data: {
            pageTitle: 'Calendrier'
        }
    });
})

.controller('ScheduleCtrl', ['$scope', '$filter', '$timeout', 'Tools', 'DataMngr', 'CoreFactory', function ($scope, $filter, $timeout, Tools, DataMngr, CoreFactory) {
    console.log(DataMngr.read('periods'));
    $scope.uiMessages = DataMngr.uiMessagesLang[0].messages;
    $scope.periods = DataMngr.read('periods');
    var disp = function(){
        for (var i = 0; i < $scope.periods.length; i++){
            $scope.periods[i].tmpStart = $filter('date')($scope.periods[i].start, 'yyyy-MM-dd');
            $scope.periods[i].tmpEnd = $filter('date')($scope.periods[i].end, 'yyyy-MM-dd');
        }
    };
    disp();
    $scope.generated = true;

    $scope.update = function(p){
        if(p && p.tmpStart && p.tmpEnd){
            // TODO Factory On reformate
            p.start = new Date(p.tmpStart);
            p.end = new Date(p.tmpEnd);

            if($scope.isValidPeriod(p)){
                DataMngr.writeItem('periods', p);
                p.edit=!p.edit;
            }
            // TODO semble qu'il ne devrait pas y avoir à faire ça
            $scope.periods = DataMngr.read('periods');
            $scope.$emit('PERIOD_CHANGE', 'update');
        } else {
            console.log("Erreur: periode invalide!");
            console.log(p);
            throw "invalid given period";
        }
    };

    $scope.isValidPeriod = function(period){
        var periods = $scope.periods;
        var ret = false;
        if(typeof period.start === "string"){
            period.start = new Date(period.start);
        }
        if(typeof period.end === "string"){
            period.end = new Date(period.end);
        }
        ret = (period.end - period.start > 0);
        if(ret){
            // N'est pas à cheval sur un autre que lui même:
            for(var i = 0; i < periods.length; i++){
                if(!period.id || period.id != periods[i].id){
                    if ((periods[i].start < period.start && periods[i].end > period.start) || 
                        (periods[i].start < period.end && periods[i].end > period.end) ||
                        (periods[i].start > period.start && periods[i].end < period.end)){
                        ret = false; 
                    }
                }
            }
        }   
        return ret;
    };

    $scope.isValidNewPeriodDesc = function(strStart, strEnd){
        var ret = (strStart != null) && (strEnd != null);
        if(ret){
            var period = {
                id : -2,
                start : new Date(strStart),
                end : new Date(strEnd)
            };
            ret = $scope.isValidPeriod(period);
        }
        return ret;
    };

    $scope.addPeriod = function(){
        var newStart = new Date($scope.newPeriodStart);
        var newEnd = new Date($scope.newPeriodEnd);
        console.log(
        DataMngr.writeItem('periods', 
          {
              id: -1,
              start: newStart,
              end: newEnd,
              open : true
          }));
        // C'est probablement inutile de relire les données, mais c'est plus sur quand on aura une bdd
        $scope.periods = DataMngr.read('periods');
        $scope.newPeriod = null;
        $scope.newPeriodStart = null;
        $scope.newPeriodEnd = null;
        $scope.$emit('PERIOD_CHANGE', 'add');
        disp();
    };

    $scope.deletePeriod = function(p){
        var modalResult;
        var modal = CoreFactory.openModal ($scope, 'sm');
        modal.result.then(function (res) {
            modalResult = res;
            console.log('modalResult : ' + res);
            if(res ==='close'){
                // TODO DataMngr.deleteItem('periods', p);
                $scope.$emit('PERIOD_REMOVE', p);
                // Recharge
                $scope.periods = DataMngr.read('periods');
            }
            }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };
}])
;
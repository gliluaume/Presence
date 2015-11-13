describe('Cours section', function() {
    beforeEach(module('DataModule'));
    beforeEach(module('ngPresence.core'));
    beforeEach(module('ngPresence.parameter'));
    beforeEach(module('ngPresence.course'));
    
    var ctrl, scope;
    beforeEach( inject( function( $controller, $rootScope, DataMngr, ParameterFactory, CoreFactory, CourseFactory) {
        scope = $rootScope.$new();
        DataMngr.setup();
        ctrl = $controller( 'CourseCtrl', {$scope: scope, DataMngr: DataMngr, ParameterFactory: ParameterFactory, CoreFactory: CoreFactory, CourseFactory: CourseFactory});
    }));


    it('test bidon', inject(function() {
        expect(true).toBeTruthy();
    }));
    it('Creates objects in scope', 
        function() {
            expect(ctrl).toBeTruthy();
            expect(scope.uiMessages).toBeDefined();
            expect(scope.dispAddInfo).toBeDefined();
            expect(scope.levels).toBeDefined();
            expect(scope.days).toBeDefined();
    });
})
;

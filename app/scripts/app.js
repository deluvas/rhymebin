
var app = angular.module( 'myApp', [ 'ui.router', 'ui.bootstrap' ] );

app.config( function( $stateProvider, $urlRouterProvider) {

    $stateProvider
        .state( 'home', {
            url: '/',
            templateUrl: 'views/home.html',
            controller: 'HomeController'
        } )

    $urlRouterProvider
        .when( '', '/' )
        .otherwise( '/error' );
    // Remove # from urls
    //$locationProvider.html5Mode( true );
});

app.controller( 'HomeController', function( $scope, $http ) {
    var langTools = ace.require("ace/ext/language_tools");
    var Range = ace.require("ace/range").Range

    var editor = ace.edit("editor");
    editor.setFontSize( 18 );
    //editor.setShowPrintMargin(false);
    editor.renderer.setShowGutter(false);
    editor.renderer.setPadding( 0 );
    editor.setOptions({
        enableBasicAutocompletion: true
    });

    var marker;

    editor.completers = [ {
        getCompletions: function(editor, session, pos, prefix, callback) {
            if ( !marker || prefix != '' ) {
                return;
            }
            $http.get( 'http://rhymebrain.com/talk?function=getRhymes&maxResults=50&word=' + marker )
                .then( function( res ) {
//                    words = _.sortBy( words, function( v ) {
//                        return v.
//                    })

                    var result = _.map( res.data, function( v ) {
                        return {name: v.word, value: v.word, meta: 'score: ' + v.score}
                    })
                    //console.log( result );
                    callback( null, result );
                })
        } }];

    editor.commands.addCommand({
        name: "test",
        bindKey: { win: "Ctrl-E" },
        exec: function(editor) {
            var cursorPos = editor.getCursorPosition();
            var range = editor.find( /\w+/g, {
                backwards: true,
                wrap: false,
                start: { row: cursorPos.row, column: 0 },
                regExp: true,
                preventScroll: true,
                skipCurrent: true
            });
            markRange( editor, range );
        }
    })

    var editorElement = document.querySelector( '#editor');
    editorElement.oncontextmenu = function () {
        var selectionRange = editor.getSession().getSelection().getRange();
        markRange( editor, selectionRange );

        return false;
    };

    var markRange = function( editor, range ) {
        //var selection = editor.getSession().getSelection();
        var markers = editor.getSession().getMarkers();
        marker = editor.getSession().getTextRange( range );

        _.each( markers, function( v, k ) {
            if (v.type==='text') {
                editor.getSession().removeMarker( k );
            }
        })
        editor.getSession().addMarker( range, "ace-text-highlight", "text" );
    }
})
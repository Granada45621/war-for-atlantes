var app = require('express')();
var https = require('http');
var http = https.Server( app );

var io = require('socket.io')( http );

var Vector = require('./module/vector.js');

var citys = [];
var army = [];

var teams = [];
var teams_data = {};

var users = [];

var SETTING = {};
var CLASS = {};

// Class
CLASS.User = function(){
    this.name = 'Guest';
    this.team = false;
    this.enter = false;
    this.index = users.length;

    this.socket = false;
};

CLASS.City = function( data ){
    this.type = 'city';
    this.team = data.team;
    this.index = data.index;
    this.vec = data.vec;
    this.pop = data.pop;
};

CLASS.Army = function( data ){
    this.type = 'army';
    this.index = data.index;
    this.death = false;
    this.team = data.team;
    this.pop = data.pop;
    this.vec = data.vec;
    this.speed = 6;

    this.direction = data.direction;
    this.target = data.target;

    this.time = 0;
};

CLASS.Team = function( data ){
    this.name = data.name;
    this.color = data.color;
};
teams.push( new CLASS.Team( { name : 'The Red', color : 'red' } ) );
teams.push( new CLASS.Team( { name : 'The Green', color : 'green' } ) );
teams.push( new CLASS.Team( { name : 'The Blue', color : 'blue' } ) );
teams.push( new CLASS.Team( { name : 'The Orange', color : 'orange' } ) );
teams.push( new CLASS.Team( { name : 'The Purple', color : 'purple' } ) );
teams.push( new CLASS.Team( { name : 'Jocker', color : 'rgb(200,200,200)' } ) );

teams_data['The Red'] = new CLASS.Team( { name : 'The Red', color : 'red' } );
teams_data['The Green'] = new CLASS.Team( { name : 'The Green', color : 'green' } );
teams_data['The Blue'] = new CLASS.Team( { name : 'The Blue', color : 'blue' } );
teams_data['The Orange'] = new CLASS.Team( { name : 'The Orange', color : 'orange' } );
teams_data['The Purple'] = new CLASS.Team( { name : 'The Purple', color : 'purple' } );
teams_data['Jocker'] = new CLASS.Team( { name : 'Jocker', color : 'rgb(200,200,200)' } );


// Server Program
app.get( '/', function( req, res ){
    res.sendfile('index.html');
});

app.get( '/module/vector.js', function( req, res ){
    res.sendfile('module/vector.js');
});

io.on( 'connection', function( socket ){
    var user = new CLASS.User();
    user.socket = socket;

    users.push( user );

    socket.on( 'select.team', function( data ){
        user.team = data;
        console.log( data.name );
        socket.emit( 'update.user.team', user.team );
    });

    socket.on( 'get.teams', function(){
        socket.emit( 'get.teams', teams );
    });

    socket.on( 'get.teams_data', function(){
        socket.emit( 'get.teams_data', teams_data );
    });

    socket.on( 'new.army', function( dat ){
        var city = citys[ dat.city.index ];
        var pos = new Vector( dat.pos.x, dat.pos.y );

        var data = {
            team : city.team,
            pop : 0,
            vec : new Vector( city.vec.x, city.vec.y ),
            index : Math.random(),

            direction : 0,
            target : pos
        };

        if( city.pop <= 10 ){
            data.pop = Math.floor(city.pop/2);
        }
        else{
            data.pop = 10;
        }

        if( city.pop-data.pop <= 0 )
            data.pop = 0;

        city.pop -= data.pop;

        if( data.pop > 0 )
            army.push( new CLASS.Army( data ) );
    });

    socket.on( 'army.target.change', function( data ){
        for( var a = 0, len = army.length; a < len; a++ ){
            var unit = army[a];

            if( unit.index == data.army.index ){
                unit.target = data.pos;
                break;
            }
        }
    });

    socket.on( 'enter.game', function( data ){
        user.name = data.name;
        user.enter = true;

        var thing = false;
        for( var c = 0, len = citys.length; c < len; c++ ){
            var city = citys[c];

            if( city.team.name == user.team.name ){
                thing = true;
                break;
            }
        }

        if( !thing ){
            // Main City
            var data = {
                team : user.team,
                vec : new Vector( 0,0 ),
                index : citys.length,
                pop : 10
            };

            var check = true;
            while( check ){
                data.vec.Random( 0, 2000, 0, 2000 );

                for( var c = 0, len = citys.length; c < len; c++ ){
                    var city = citys[c];

                    if( city.vec.GetDist( data.vec ) >= 60 ){
                        check = false;
                        break;
                    }
                }

                if( citys.length <= 0 ){
                    break;
                }
            }

            var here = new CLASS.City( data );
            citys.push( here );

            // Other Citys
            for( var a = 0; a < 10; a++ ){
                var data = {
                    team : false,
                    vec : new Vector( 0,0 ),
                    index : citys.length,
                    pop : 2,
                };

                var check = true;
                while( check ){
                    data.vec.Random( here.vec.x-300, here.vec.x+300, here.vec.y-300, here.vec.y+300 );

                    check = false;
                    for( var c = 0, len = citys.length; c < len; c++ ){
                        var city = citys[c];

                        if( city.vec.GetDist( data.vec ) <= 60 ){
                            check = true;
                        }
                    }
                }

                citys.push( new CLASS.City( data ) );
            }
        }
    });
});

function BCGameData(){
    for( var u = 0, len = users.length; u < len; u++ ){
        var user = users[u];

        if( user.enter ){
            user.socket.emit( 'update.city', citys );
            user.socket.emit( 'update.army', army );
        }
    }
}

var ARMY = {};

ARMY.Move = function(){
    var size = 14;

    for( var a = 0, len = army.length; a < len; a++ ){
        var unit = army[a];
        var vec = unit.vec;
        var target = unit.target;

        if( unit.death )
            continue;

        if( unit.target ){
            if( vec.GetDist( target ) > 3 ){
                unit.direction = vec.GetDirection( target ) * 180 / Math.PI;
                vec.Move( unit.speed, unit.direction );
            }
            else{
                unit.target = false;
            }
        }

        // Collision
        for( var c = 0, lena = army.length; c < lena; c++ ){
            var ar = army[c];
            var arvec = ar.vec.Clone().Sub( size/2, size/2 );

            if( unit.index != ar.index ){
                if(
                    vec.x < arvec.x + size &&
                    vec.x + size > arvec.x &&
                    vec.y < arvec.y + size &&
                    size + vec.y > arvec.y
                ){

                    if( ar.team.name == unit.team.name ){
                        unit.pop += ar.pop;
                        ar.death = true;
                    }
                    else if( unit.pop > ar.pop ){
                        unit.pop -= ar.pop;
                        ar.death = true;
                    }
                    else if( unit.pop < ar.pop ){
                        ar.pop -= unit.pop;
                        unit.death = true;
                    }
                    else{
                        unit.death = true;
                        ar.death = true;
                    }
                }
            }
        }

        if( unit.time >= 7 ){
            for( var b = 0, lenb = citys.length; b < lenb; b++ ){
                var city = citys[b];
                var civec = city.vec.Clone().Sub( 10, 10 );

                if(
                    vec.x < civec.x + 20 &&
                    vec.x + size > civec.x &&
                    vec.y < civec.y + 20 &&
                    size + vec.y > civec.y
                ){
                    unit.death = true;

                    if( city.team.name == unit.team.name ){
                        city.pop += unit.pop;
                    }
                    else if( city.pop > unit.pop ){
                        city.pop -= unit.pop;
                    }
                    else if( city.pop < unit.pop ){
                        city.pop = unit.pop - city.pop;
                        city.team = unit.team;
                    }
                    else{
                        city.pop -= unit.pop;
                    }
                }
            }
        }

        unit.time += 1;
    }

    var live = [];
    for( var a = 0, len = army.length; a < len; a++ ){
        var unit = army[a];
        if( !unit.death )
            live.push( unit );
    }

    army = live;
};

ARMY.Main = function(){
    ARMY.Move();
};

function Main(){
    ARMY.Main();
    BCGameData();
}

setInterval( Main, 80 );

setInterval( (function(){
    for( var c = 0, len = citys.length; c < len; c++ ){
        var city = citys[c];
        if( city.team )
            city.pop += 2;
        else{
            city.pop += 1;
            if( city.pop >= 200 )
                city.pop = 200;
        }
    }
}), 5000);

http.listen( process.env.PORT || 3000 );

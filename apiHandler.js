

// var host = "unit-test.newgrounds.io";
// var version = "1.0.0";
var app_id = "45678:1beQXL4p";
var encrypt_key = "Z9GpzFnORCh+HC5X0rC8VQ==";

var ngio = new Newgrounds.io.core(app_id, encrypt_key);
ngio.debug = false;

// ngio.callComponent("Gateway.getDatetime", {}, function(result) {
//    if (result.success) {
//         console.log('The current date/time on the Newgrounds.io server is '+result.datetime);
//    } else {
//         console.log('ERROR!', result.error.message);
//    }
// });

function onLoggedIn() {
    console.log("Welcome " + ngio.user.name + "!");
    loadMedalsAndScoreboards();
    menuController.onLoggedIn(ngio.user.name);
    // console.log(ngio.session_id);
}

function onLoginFailed() {
    console.log("There was a problem logging in: " . ngio.login_error.message );
}

function onLoginCancelled() {
    console.log("The user cancelled the login.");
}



/*
 * Before we do anything, we need to get a valid Passport session.  If the player
 * has previously logged in and selected 'remember me', we may have a valid session
 * already saved locally.
 */
function initSession() {
    ngio.getValidSession(function() {
        if (ngio.user) {
            /* 
             * If we have a saved session, and it has not expired, 
             * we will also have a user object we can access.
             * We can go ahead and run our onLoggedIn handler here.
             */
            onLoggedIn();
        } else {
            /*
             * If we didn't have a saved session, or it has expired
             * we should have been given a new one at this point.
             * This is where you would draw a 'sign in' button and
             * have it execute the following requestLogin function.
             */
             menuController.onLoggedOut();
        }

    });
}



/* 
 * Call this when the user clicks a 'sign in' button from your game.  It MUST be called from
 * a mouse-click event or pop-up blockers will prevent the Newgrounds Passport page from loading.
 */
function requestLogin(callback) {
    ngio.requestLogin(function(){onLoggedIn();if(callback)callback();}, onLoginFailed, onLoginCancelled);
    /* you should also draw a 'cancel login' buton here */
}

/*
 * Call this when the user clicks a 'cancel login' button from your game.
 */
function cancelLogin() {
    /*
     * This cancels the login request made in the previous function. 
     * This will also trigger your onLoginCancelled callback.
     */
    ngio.cancelLoginRequest();
}

/*
 * If your user is logged in, you should also draw a 'sign out' button for them
 * and have it call this.
 */
function logOut() {
    ngio.logOut(function() {
        /*
         * Because we have to log the player out on the server, you will want
         * to handle any post-logout stuff in this function, wich fires after
         * the server has responded.
         */
         console.log("logged out");
         initSession();
         
    });
}


/* vars to record any medals and scoreboards that get loaded */
var medals, scoreboards;

/* handle loaded medals */
function onMedalsLoaded(result) {
    if (result.success)
    {
        medals = result.medals;

        if(ngio.debug)
        for (var i = 0; i < medals.length; i++)
        {
            medals[i].unlocked=false;
            console.log(medals[i]);
        }

    } 
}

/* handle loaded scores */
function onScoreboardsLoaded(result) {
    if (result.success) scoreboards = result.scoreboards;
}

/* load our medals and scoreboards from the server */
function loadMedalsAndScoreboards()
{
	ngio.queueComponent("Medal.getList", {}, onMedalsLoaded);
	ngio.queueComponent("ScoreBoard.getBoards", {}, onScoreboardsLoaded);
	ngio.executeQueue();
}


/* You could use this function to draw the medal notification on-screen */
function onMedalUnlocked(medal) {
    console.log('MEDAL GET:', medal.name);
    menuController.displayMedalUnlock(medal);
}

function reconnect(callback, shouldNotify)
{
    ngio.getValidSession(function() {
        if (ngio.user) {
            /* 
             * If we have a saved session, and it has not expired, 
             * we will also have a user object we can access.
             * We can go ahead and run our onLoggedIn handler here.
             */
            onLoggedIn();
            callback();
        } else {
            /*
             * If we didn't have a saved session, or it has expired
             * we should have been given a new one at this point.
             * This is where you would draw a 'sign in' button and
             * have it execute the following requestLogin function.
             */
             menuController.onLoggedOut();
             // requestLogin();
             if(shouldNotify)
                menuController.onSessionExpired(callback);
        }

    });
}

function checkConnection(callback, shouldNotify)
{
    if(!callback)callback=function(){};
    console.log("checking session");
    if(!ngio||!ngio.session_id)
    {
        reconnect(callback, shouldNotify);
        return;
    }
    ngio.callComponent("App.checkSession", {id:ngio.session_id}, function(result){
        if(result.success)
        {
            if(result.session.expired)
            {
                console.log("session expired");
                reconnect(callback, shouldNotify);
            }else
            {
                console.log("session active");
                callback();
            }
        }
        else
        {
            logOut();
            reconnect(callback, shouldNotify);
        }
    });
   
}

function pingServerToPreventExpiration()
{
    // ngio.callComponent("Gateway.ping", {}, function(result)
    // {
    //     if(ngio.debug)
    //         console.log(result);
    // });
    //  if(ngio.debug)
    //     console.log("ping");
    checkConnection();
}

function unlockMedal(medal_name)
{
    checkConnection(function()
    {
        unlockMedal2(medal_name);
    },true);
}

function unlockMedal2(medal_name) {

    /* If there is no user attached to our ngio object, it means the user isn't logged in and we can't unlock anything */
    if (!ngio.user) return;

    var medal;

    for (var i = 0; i < medals.length; i++) {

        medal = medals[i];

        /* look for a matching medal name */
        if (medal.name == medal_name) {

            /* we can skip unlocking a medal that's already been earned */
            if (!medal.unlocked) {

                /* unlock the medal from the server */
                ngio.callComponent('Medal.unlock', {id:medal.id}, function(result) {

                    if (result.success){ 
                    	onMedalUnlocked(result.medal);
                    	medal.unlocked=true;
                    }
                    else console.log("failed to unlock medal");
                });
            }
            else 
            {
                console.log("medal already unlocked");
                // onMedalUnlocked(medal);
            }

            return;
        }
    }

}

function postScore(board_name, score_value, callback)
{
    checkConnection(function()
    {
        postScore2(board_name, score_value);
        if(callback)
            callback();
    },true);
}

function postScore2(board_name, score_value) {

    /* If there is no user attached to our ngio object, it means the user isn't logged in and we can't post anything */
    if (!ngio.user) return;

    var score;

    for (var i = 0; i < scoreboards.length; i++) {

        scoreboard = scoreboards[i];
        if(scoreboard.name == board_name)
        {
        	ngio.callComponent('ScoreBoard.postScore', {id:scoreboard.id, value:score_value});
        	console.log(score_value +" posted to " + board_name);
 		}   
    }
}




let your_conn = '', you = {spot:'',name:'', select: '', win:0, lose:0, ready_flag:0}, enemy = {spot:'',name:'', select: '', win:0, lose:0, ready_flag:0}, input_val = '';
const config = {
    apiKey: "AIzaSyCb-EVsjkshwtTBLtiR3VOd4YnNdKjxAj4",
    authDomain: "classwork-b5c2a.firebaseapp.com",
    databaseURL: "https://classwork-b5c2a.firebaseio.com",
    projectId: "classwork-b5c2a",
    storageBucket: "classwork-b5c2a.appspot.com",
    messagingSenderId: "612096937225"
};
// Initialize Firebase
firebase.initializeApp(config);

const database = firebase.database();
const rps = database.ref("/rps");
const chat = database.ref("/chat");

function update_info(mode, obj){
    if(mode === "left"){
        $('.player1 .name').text(obj.name);
        $('.player1 .result').show();
    }else{//right
        $('.player2 .name').text(obj.name);
        $('.player2 .result').show();
    }
}
function show_rps(mode){
    if(mode === "left"){
        //IF YOU ARE IN LEFT AS PLAYER1
        if(mode === you.spot){
            $('.p2_selected').html(enemy.select);
            $('.p1_rps').show();
            $('.turn_msg').html("<span class='blue'>" + you.name + ", it is <b>your turn!</b></span>");
        }else{
            $('.turn_msg').html("<span class='red'>" + you.name + "! please <b>wait</b> until '" + enemy.name + "' selects one.</span>");
        }
    }else if(mode === "right"){
        //IF YOU ARE IN RIGHT AS PLAYER2
        if(mode === you.spot){
            $('.p1_selected').html(enemy.select);
            $('.p2_rps').show();
            $('.turn_msg').html("<span class='red'>" + you.name + ", it is <b>your turn!</b></span>");
        }else{
            $('.turn_msg').html("<span class='blue'>" + you.name + "! please <b>wait</b> until '" + enemy.name + "' selects one.</span>");
        }
    }
    //AFTER ONE ROUND IS DONE, SHOW RESULT TO BOTH PLAYERS
    else if(mode === "all"){
        $('.turn_msg').html("");
        if(you.spot === "left"){
            $('.p2_selected').html(enemy.select);
        }else{
            $('.p1_selected').html(enemy.select);
        }
        $('.player1 .p1_selected').show();
        $('.player2 .p2_selected').show();
        
    }
}
function show_winner_loser(mode){
    // console.log(rps.left);
    // console.log(rps.child("left").win);
    let win = 0, lose = 0, winner='';
    if(mode === "same"){
        show_result('', "draw");
    }
    //IF PLAYER1(LEFT) WON
    else if(mode === "left"){
        //IF YOU ARE PLAYER1, THEN WON
        if(you.spot === "left"){
            you.win = you.win + 1;
            enemy.lose = enemy.lose + 1;
            win = you.win;
            lose = enemy.lose;
            winner = you.name;
        }
        //OTHERWISE, YOU LOST
        else{
            you.lose = you.lose + 1;
            enemy.win = enemy.win + 1;
            win = enemy.win;
            lose = you.lose;
            winner = enemy.name;
        }
        //UPDATE SCORE IN FIREBASE
        rps.child("left").update({win : win});
        rps.child("right").update({lose : lose});
        //INFORM THAT PLAYER1(LEFT) WON ON SCREEN
        show_result(winner, "left");
    }
    //IF PLAYER2(RIGHT) WON
    else if(mode === "right"){
        //IF YOU ARE PLAYER1(LEFT), THEN LOST
        if(you.spot === "left"){
            you.lose = you.lose + 1;
            enemy.win = enemy.win + 1;
            win = enemy.win;
            lose = you.lose;
            winner = enemy.name;
        }
        //OTHERWISE, YOU WON
        else{
            you.win = you.win + 1;
            enemy.lose = enemy.lose + 1;
            win = you.win;
            lose = enemy.lose;
            winner = you.name;
        }
        //UPDATE SCORE IN FIREBASE
        rps.child("left").update({lose:lose});
        rps.child("right").update({win:win});
        //INFORM THAT PLAYER2(RIGHT) WON ON SCREEN
        show_result(winner, "right");
    }
}
function show_result(winner, mode){
    //UPDATE HTML IN SCREEN PLAYER1(LEFT) WON
    if(mode === "left"){
        $('.play_result').html("<h1>" + winner + " Won!</h1>");
        $('.player1 .win').text(parseInt($('.player1 .win').text()) + 1);
        $('.player2 .lose').text(parseInt($('.player2 .lose').text()) + 1);
    }
    //UPDATE HTML IN SCREEN PLAYER2(RIGHT) WON
    else if(mode === "right"){
        $('.play_result').html("<h1>" + winner + " Won!</h1>");
        $('.player2 .win').text(parseInt($('.player2 .win').text()) + 1);
        $('.player1 .lose').text(parseInt($('.player1 .lose').text()) + 1);
    }
    //UPDATE HTML IN SCREEN  PLAYER1(LEFT) AND PLAYER2(RIGHT) DRAW
    else{
        $('.play_result').html("<h1>Draw!</h1>");
    }
    //AFTER 2 SECONDS, GO TO NEXT ROUND. RESET SCREEN
    setTimeout(function(){
        $('.play_result').html("");
        $('.player1 .p1_selected').empty().hide();
        $('.player2 .p2_selected').empty().hide();

        //CHANGE BOTH PLAYERS' STATUS AS READY
        rps.child("left").update({select: '', ready_flag:1});
        rps.child("right").update({select: '', ready_flag:1});
    }, 2000);
}
//check you are player1 or player2
rps.once("value", function(snapshot) {
    //console.log(snapshot.child("left").exists());

    //IF LEFT SECTION IS EMPTY, THEN YOU ARE PLAYER1(LEFT)
    if (!snapshot.child("left").exists()){
        you.spot = 'left';
        enemy.spot = 'right';
    }
    //IF LEFT SECTION IS FILLED BUT RIGHT IS EMPTY, THEN YOU ARE PLAYER2(RIGHT)
    else if (!snapshot.child("right").exists()){
        you.spot = 'right';
        enemy.spot = 'left';
    }
    //FULL. WAIT UNTIL ONE OF PLAYERS IS OUT
    else{

    }
    console.log(`your position: ${you.spot}`);
    if(you.spot ==="left" || you.spot ==="right"){
        //ESTABLISH YOUR CONNECTION WITH YOUR INFO
        your_conn = rps.child(you.spot);
        your_conn.set(you);//database.ref("/rps/"+you.spot).set(you);
        
        //IF YOUR CONNECTION IS DISCONNECTED BY REFRESH OR CLOSE THE BROWSER, REMOVE DATA
        //https://firebase.google.com/docs/database/web/offline-capabilities#section-sample
        your_conn.onDisconnect().remove();//database.ref("/rps/"+you.spot).onDisconnect().remove();
    }else{

    }
}, function(errorObject) {// If any errors are experienced, log them to console.
    console.log("The read failed: " + errorObject.code);
});

//KEEP WATCHING CHANGED VALUES AND PLAYERS JOINED OR NOT
rps.on("value", function(snapshot) {
    //UPDATE LOCAL VARIABLES FROM FIREBASE DB TO GET THE LASTEST INFO
    if(you.spot ==="right" && enemy.spot === "left" && snapshot.child("left").exists() && snapshot.val().left.name != ""){
       //console.log(snapshot.val());
       you = snapshot.val().right;
       //update_info("right", you);//ALREADY UPDATED SCREEN FROM JQUERY

       enemy = snapshot.val().left;
       update_info("left", enemy);//UPDATE SCREEN BASED ON FIREBASE DB INFO
    }else if(you.spot ==="left" && enemy.spot === "right" && snapshot.child("right").exists() && snapshot.val().right.name != ""){
        //console.log(snapshot.val());
        you = snapshot.val().left; // already updated from jquery
        //update_info("left", you);
        
        enemy = snapshot.val().right;
        update_info("right", enemy);
    }else{
         //ONE OF PLAYERS DISCONNECTED //RESET SCORE
         enemy.win =0;enemy.lose=0;enemy.select='';enemy.ready_flag=0;
         if(you.spot === "left" && you.ready_flag == "1"){
             you.win = 0;you.lose=0;you.select='';
             rps.child('left').update({win : 0, lose: 0, select: ''});
            $('.player2 .name').html("WAITING FOR PLAYER 2");
            $('.turn_msg').html("");
            
            //INFORM A PLAYER HAS DISCONNECTED IN CHAT ROOM
            chat.push({
				name: "<span class='red'>" + enemy.name + "</span>",
				msg: " has disconnected",
				date: firebase.database.ServerValue.TIMESTAMP
			});
         }else if(you.spot === "right" && you.ready_flag == "1"){
            you.win = 0;you.lose=0;you.select='';
            rps.child('right').update({win : 0, lose: 0, select: ''});
            $('.player1 .name').html("WAITING FOR PLAYER 1");
            $('.turn_msg').html("");

            //INFORM A PLAYER HAS DISCONNECTED IN CHAT ROOM
            chat.push({
				name: "<span class='blue'>" + enemy.name + "</span>",
				msg: " has disconnected",
				date: firebase.database.ServerValue.TIMESTAMP
			});
         }
        console.log("waiting...");
    }

    //CHECK IF IT IS READY TO PLAY ON BOTH SIDE
    if(you.ready_flag === 1 && enemy.ready_flag === 1){
        let left_select = snapshot.val().left.select;
        let right_select = snapshot.val().right.select;
        //CHECK WHOSE TURN
        if(left_select === "" && right_select === ""){
            //PLAYER1(LEFT)'S TURN, SHOW RPS ON SCREEN
            show_rps("left");
        }else if(left_select != "" && right_select === "" ){
            //PLAYER2(RIGHT)'S TURN, SHOW RPS ON SCREEN
            show_rps("right");
        }else if(left_select != "" && right_select != ""){
            //IF BOTH PLAYERS CHOSE, HOLD BOTH PLAYERS' STATUS AS NOT READY
            rps.child("left").update({ready_flag:0});
            rps.child("right").update({ready_flag:0});

            //CHECK WHO WON AND DISPLAY ON BOTH SCREEN
            show_rps("all");
            
            if(left_select === 'ROCK' && right_select === 'PAPER'){show_winner_loser("right");}
            if(left_select === 'ROCK' && right_select === 'SCISSORS'){show_winner_loser("left");}
            if(left_select === 'PAPER' && right_select === 'SCISSORS'){show_winner_loser("right");}
            if(left_select === 'PAPER' && right_select === 'ROCK'){show_winner_loser("left");}
            if(left_select === 'SCISSORS' && right_select === 'ROCK'){show_winner_loser("right");}
            if(left_select === 'SCISSORS' && right_select === 'PAPER'){show_winner_loser("left");}
            if(left_select === right_select){show_winner_loser("same");}
        }else{
        }
    }
}, function(errorObject) {    // If any errors are experienced, log them to console.
    console.log("The read failed: " + errorObject.code);
});

//CHAT
chat.on("child_added", function(snapshot) {
    //DISPLAY CHAT CONTENTS
	$(".chat_scr").append(snapshot.val().name + " : " + snapshot.val().msg + "<br>");
	var bottom = $(".chat_scr").get(0);
    bottom.scrollTop = bottom.scrollHeight;
});
$(document).ready(function(){
    //IF A PLAYER ENTER HIS/HER NAME
    $('.player_name_btn').on('click', function(){
        input_val = $('.player_name').val();
        you.name = input_val;
        //IF THE PLAYER IS PLAYER1(LEFT)
        if(you.spot === "left"){
            //UPDATE SCREEN
            update_info("left", you);
            $('.player1').addClass('active');
            $('.player_name_scr').html('<h1>Hi ' + input_val + "! You are Player 1");
            //UPDATE FIREBASE DB
            your_conn.update({name:you.name, ready_flag :1});
        }
        //IF THE PLAYER IS PLAYER2(RIGHT)
        else if(you.spot === "right"){
            //UPDATE SCREEN
            update_info("right", you);
            $('.player2').addClass('active');
            $('.player_name_scr').html('<h1>Hi ' + input_val + "! You are Player 2");
            //UPDATE FIREBASE DB
            your_conn.update({name:you.name, ready_flag :1});
        }else{//COULDN'T ENTER

        }
    })
    //CHOICE OR ROCK PAPER SCISSORS ON PLAYER1(LEFT) SIDE
    $('.p1_rps').on('click', function(){
        const pick = $(this).attr('data-value');
        //UPDATE SCREEN
        $('.p1_rps').hide();
        $('.p1_selected').html(pick).show();
        //UPDATE FIREBASE DB
        rps.child("left").update({select:pick});
    });
    //CHOICE OR ROCK PAPER SCISSORS ON PLAYER2(LEFT) SIDE    
    $('.p2_rps').on('click', function(){
        const pick = $(this).attr('data-value');
        //UPDATE SCREEN
        $('.p2_rps').hide();
        $('.p2_selected').html(pick).show();
        //UPDATE FIREBASE DB
        rps.child("right").update({select:pick});
    });

    //CHAT INSERT
    $('.chat_submit_btn').on('click', function(e){
        e.preventDefault();
        const chat_input = $.trim($('.chat_input').val());
        let name = you.name;
        if(name === ""){name ="guest";}
        if(you.spot === "left"){
            name = "<span class='blue'>" + name + "</span>";
        }else{
            name = "<span class='red'>" + name + "</span>";
        }
        //UPDATE FIREBASE DB
        chat.push({name: name, msg: chat_input, date: firebase.database.ServerValue.TIMESTAMP});
        //RESET
        $('.chat_input').val("");
    })
})

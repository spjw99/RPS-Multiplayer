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
        if(mode === you.spot){
            $('.p2_selected').html(enemy.select);
            $('.p1_rps').show();
            $('.turn_msg').html("<span class='blue'>" + you.name + ", it is <b>your turn!</b></span>");
        }else{
            $('.turn_msg').html("<span class='red'>" + you.name + "! please <b>wait</b> until '" + enemy.name + "' selects one.</span>");
        }
    }else if(mode === "right"){//right
        if(mode === you.spot){
            $('.p1_selected').html(enemy.select);
            $('.p2_rps').show();
            $('.turn_msg').html("<span class='red'>" + you.name + ", it is <b>your turn!</b></span>");
        }else{
            $('.turn_msg').html("<span class='blue'>" + you.name + "! please <b>wait</b> until '" + enemy.name + "' selects one.</span>");
        }
    }else if(mode === "all"){
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
    }else if(mode === "left"){
        if(you.spot === "left"){
            you.win = you.win + 1;
            enemy.lose = enemy.lose + 1;
            win = you.win;
            lose = enemy.lose;
            winner = you.name;
        }else{
            you.lose = you.lose + 1;
            enemy.win = enemy.win + 1;
            win = enemy.win;
            lose = you.lose;
            winner = enemy.name;
        }
        rps.child("left").update({win : win});
        rps.child("right").update({lose : lose});
        show_result(winner, "left");
    }else if(mode === "right"){
        if(you.spot === "left"){
            you.lose = you.lose + 1;
            enemy.win = enemy.win + 1;
            win = enemy.win;
            lose = you.lose;
            winner = enemy.name;
        }else{
            you.win = you.win + 1;
            enemy.lose = enemy.lose + 1;
            win = you.win;
            lose = enemy.lose;
            winner = you.name;
        }
        
        rps.child("left").update({lose:lose});
        rps.child("right").update({win:win});
        show_result(winner, "right");
    }
}
function show_result(winner, mode){
    if(mode === "left"){
        $('.play_result').html("<h1>" + winner + " Won!</h1>");
        $('.player1 .win').text(parseInt($('.player1 .win').text()) + 1);
        $('.player2 .lose').text(parseInt($('.player2 .lose').text()) + 1);
    }else if(mode === "right"){
        $('.play_result').html("<h1>" + winner + " Won!</h1>");
        $('.player2 .win').text(parseInt($('.player2 .win').text()) + 1);
        $('.player1 .lose').text(parseInt($('.player1 .lose').text()) + 1);
    }else{
        $('.play_result').html("<h1>Draw!</h1>");
    }
    setTimeout(function(){
        $('.play_result').html("");
        $('.player1 .p1_selected').empty().hide();
        $('.player2 .p2_selected').empty().hide();

        rps.child("left").update({select: '', ready_flag:1});
        rps.child("right").update({select: '', ready_flag:1});
    }, 3000);
}
//check you are player1 or player2
rps.once("value", function(snapshot) {
    //console.log(snapshot.child("left").exists());
    if (!snapshot.child("left").exists()){// you are player1 on left
        you.spot = 'left';
        enemy.spot = 'right';
    }else if (!snapshot.child("right").exists()){// you are player2 on right
        you.spot = 'right';
        enemy.spot = 'left';
    }else{//full

    }
    console.log(`your position: ${you.spot}`);
    if(you.spot ==="left" || you.spot ==="right"){
        your_conn = rps.child(you.spot);
        your_conn.set(you);//database.ref("/rps/"+you.spot).set(you);
        //https://firebase.google.com/docs/database/web/offline-capabilities#section-sample
        your_conn.onDisconnect().remove();//database.ref("/rps/"+you.spot).onDisconnect().remove();
    }else{

    }
}, function(errorObject) {    // If any errors are experienced, log them to console.
    console.log("The read failed: " + errorObject.code);
});

rps.on("value", function(snapshot) {// keep watching another player joins or not
    if(you.spot ==="right" && enemy.spot === "left" && snapshot.child("left").exists() && snapshot.val().left.name != ""){
       //update local variable from Firebase DB to get the lastest info
       //console.log(snapshot.val());
       you = snapshot.val().right;// already updated from jquery
       enemy = snapshot.val().left;
       //update_info("right", you);
       update_info("left", enemy);
    }else if(you.spot ==="left" && enemy.spot === "right" && snapshot.child("right").exists() && snapshot.val().right.name != ""){
        //update local variable from Firebase DB to get the lastest info
        //console.log(snapshot.val());
        you = snapshot.val().left; // already updated from jquery
        enemy = snapshot.val().right;
        //update_info("left", you);
        update_info("right", enemy);
    }else{
         //one of players left //reset score
         enemy.win =0;enemy.lose=0;enemy.select='';enemy.ready_flag=0;
         if(you.spot === "left" && you.ready_flag == "1"){
             you.win = 0;you.lose=0;you.select='';
             rps.child('left').update({win : 0, lose: 0, select: ''});
            $('.player2 .name').html("WAITING FOR PLAYER 2");
            $('.turn_msg').html("");
            
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
            chat.push({
				name: "<span class='blue'>" + enemy.name + "</span>",
				msg: " has disconnected",
				date: firebase.database.ServerValue.TIMESTAMP
			});
         }
        console.log("waiting...");
    }

    //check if it is ready to play 
    if(you.ready_flag === 1 && enemy.ready_flag === 1){
        //check who's turn
        let left_select = snapshot.val().left.select;
        let right_select = snapshot.val().right.select;
        if(left_select === "" && right_select === ""){
            //left turn
            show_rps("left");
        }else if(left_select != "" && right_select === "" ){
            //right turn
            show_rps("right");
        }else if(left_select != "" && right_select != ""){
            //HOLD
            rps.child("left").update({ready_flag:0});
            rps.child("right").update({ready_flag:0});
            //check who wins
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
	$(".chat_scr").append(snapshot.val().name + " : " + snapshot.val().msg + "<br>");
	var bottom = $(".chat_scr").get(0);
    bottom.scrollTop = bottom.scrollHeight;
});
$(document).ready(function(){
    $('.player_name_btn').on('click', function(){
        input_val = $('.player_name').val();
        you.name = input_val;
        if(you.spot === "left"){
            update_info("left", you);
            $('.player1').addClass('active');
            $('.player_name_scr').html('<h1>Hi ' + input_val + "! You are Player 1");
            your_conn.update({name:you.name, ready_flag :1});
        }else if(you.spot === "right"){
            update_info("right", you);
            $('.player2').addClass('active');
            $('.player_name_scr').html('<h1>Hi ' + input_val + "! You are Player 2");
            your_conn.update({name:you.name, ready_flag :1});
        }else{

        }
    })
    $('.p1_rps').on('click', function(){
        const pick = $(this).attr('data-value');
        $('.p1_rps').hide();
        $('.p1_selected').html(pick).show();
        rps.child("left").update({select:pick});
    });
    $('.p2_rps').on('click', function(){
        const pick = $(this).attr('data-value');
        $('.p2_rps').hide();
        $('.p2_selected').html(pick).show();
        rps.child("right").update({select:pick});
    });

    //CHAT
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
        chat.push({name: name, msg: chat_input, date: firebase.database.ServerValue.TIMESTAMP});

        $('.chat_input').val("");
    })
})

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

let rps = database.ref("/rps");
let chat = database.ref("/chat");

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
            $('.p1_rps').show();
        }
    }else if("right"){//right
        if(mode === you.spot){
            $('.p2_rps').show();
        }
    }else if("all"){
        $('.p1_rps').show();
        $('.p2_rps').show();
    }
}
function show_winner_loser(mode){
    if(mode === "same"){

    }else if(mode === "left"){
        console.log(rps.child("left").win);
        console.log(rps.child("left").win+1);
        rps.child("left").update({win:rps.child("left").win+1});
        rps.child("right").update({lose:rps.child("right").lose+1});
        show_result("<h1>" + rps.child("left").name + "Wins!");
    }else if(mode === "right"){
        rps.child("left").update({lose:rps.child("left").lose+1});
        rps.child("right").update({win:rps.child("right").win+1});
        show_result("<h1>" + rps.child("right").name + "Wins!");
    }
}
function show_result(msg){
    $('.play_result').html(msg);
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
       console.log(snapshot.val());
       you = snapshot.val().right;// already updated from jquery
       enemy = snapshot.val().left;
       update_info("left", enemy);
       
    }else if(you.spot ==="left" && enemy.spot === "right" && snapshot.child("right").exists() && snapshot.val().right.name != ""){
        //update local variable from Firebase DB to get the lastest info
        console.log(snapshot.val());
        you = snapshot.val().left; // already updated from jquery
        enemy = snapshot.val().right;
        update_info("right", enemy);
    }else{
         //one of players left //reset score
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
            //heck who wins
            if(left_select === 'ROCK' && right_select === 'PAPER'){show_winner_loser("right");}
            if(left_select === 'ROCK' && right_select === 'SCISSORS'){show_winner_loser("left");}
            if(left_select === 'PAPER' && right_select === 'SCISSORS'){show_winner_loser("right");}
            if(left_select === 'PAPER' && right_select === 'ROCK'){show_winner_loser("left");}
            if(left_select === 'SCISSORS' && right_select === 'ROCK'){show_winner_loser("right");}
            if(left_select === 'SCISSORS' && right_select === 'PAPER'){show_winner_loser("left");}
            if(left_select === right_select){show_winner_loser("same");}
            show_rps("all");

            // if(left_select === 'ROCK' && right_select === 'PAPER'){rps.child("left").update({lose:lose+1});rps.child("right").update({win:win+1});show_result("<h1>" + rps.child("right").name + "Wins!</h1>");}
            // if(left_select === 'ROCK' && right_select === 'SCISSORS'){rps.child("left").update({win:win+1});rps.child("right").update({lose:lose+1});show_result("<h1>" + rps.child("left").name + "Wins!</h1>");}
            // if(left_select === 'PAPER' && right_select === 'SCISSORS'){rps.child("left").update({lose:lose+1});rps.child("right").update({win:win+1});show_result("<h1>" + rps.child("right").name + "Wins!</h1>");}
            // if(left_select === 'PAPER' && right_select === 'ROCK'){rps.child("left").update({win:win+1});rps.child("right").update({lose:lose+1});show_result("<h1>" + rps.child("left").name + "Wins!</h1>");}
            // if(left_select === 'SCISSORS' && right_select === 'ROCK'){rps.child("left").update({lose:lose+1});rps.child("right").update({win:win+1});show_result("<h1>" + rps.child("right").name + "Wins!</h1>");}
            // if(left_select === 'SCISSORS' && right_select === 'PAPER'){rps.child("left").update({win:win+1});rps.child("right").update({lose:lose+1});show_result("<h1>" + rps.child("left").name + "Wins!</h1>");}
            // if(left_select === right_select){show_result("<h1>Draw!</h1>");}
            
        }else{

        }

    }
}, function(errorObject) {    // If any errors are experienced, log them to console.
    console.log("The read failed: " + errorObject.code);
});


$(document).ready(function(){
    $('.player_name_btn').on('click', function(){
        input_val = $('.player_name').val();
        you.name=input_val;
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
        $('.p1_selected').html("<h1>" + pick + "</h1>").show();
        rps.child("left").update({select:pick});
    });
    $('.p2_rps').on('click', function(){
        const pick = $(this).attr('data-value');
        $('.p2_rps').hide();
        $('.p2_selected').html("<h1>" + pick + "</h1>").show();
        rps.child("right").update({select:pick});
    });
})
//   // --------------------------------------------------------------
  
//   // Whenever a user clicks the submit-bid
  
//   $("#submit-bid").on("click", function(event) {
//     event.preventDefault();
//     // Get the input values
//     var bidderName = $("#bidder-name").val().trim();
//     var bidderPrice = parseInt($("#bidder-price").val().trim());
  
//     // Log the Bidder and Price (Even if not the highest)
//     console.log(bidderName);
//     console.log(bidderPrice);
  
//     if (bidderPrice > highPrice) {
  
//       // Alert
//       alert("You are now the highest bidder.");
  
//       // Save the new price in Firebase. This will cause our "value" callback above to fire and update
//       // the UI.
//       database.ref().set({
//         highBidder: bidderName,
//         highPrice: bidderPrice
//       });
  
//       // Log the new High Price
//       console.log("New High Price!");
//       console.log(bidderName);
//       console.log(bidderPrice);
//     }
  
//     else {
  
//       // Alert
//       alert("Sorry that bid is too low. Try again.");
//     }
//   });
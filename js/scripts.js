var game_status = 0; 

//{finish:"game-over";

var game_data = [[null, { x:0, y:-1, z:-1, value:0 }, { x:0, y:1, z:-1, value:0 }],
    [{ x:-1, y:1, z:0, value:0 }, { x:0, y:0, z:0, value:0 }, { x:1, y:0, z:-1, value:0 }],
    [{ x:0, y:-1, z:1, value:0 }, { x:1, y:-1, z:0, value:0 }, null]];

function pointy_hex_corner(center, size, i){
    var angle_deg = 60 * i - 30;
    var angle_rad = Math.PI / 180 * angle_deg;
    return { 
        x : center.x + size * Math.cos(angle_rad),
        y : center.y + size * Math.sin(angle_rad)
    }
}

function cell_update(cell) {
    let div = $(`[data-x=${cell.x}][data-y=${cell.y}][data-z=${cell.z}]`);
    div.data("value", cell.value);
    div.find(".span_hex").text(cell.value === 0 ? "" : cell.value);
}

function start_game(){
    if (game_status != 0){
        game_status = 0;
        for (let i = 0; i < 3; i++){
            for (let j = 0; j < 3; j++){
                let data_item = game_data[i][j];
                if (data_item != null) {
                    game_data[i][j].value = 0;
                    cell_update(game_data[i][j]);
                }
            }
        }
    }

    var selected_server = $("option:selected").val();
    $.ajax({
        type: "POST",
        url: selected_server + "2",
        dataType: "json",
        data: "[]",
        success: function(response) {
            response.forEach(el => {
                for (let i = 0; i < 3; i++){
                    for (let j = 0; j < 3; j++){
                        let game_data_item = game_data[i][j];
                        if (game_data_item != null && game_data_item.x == el.x && game_data_item.y == el.y && game_data_item.z == el.z){
                            game_data_item.value = el.value;
                        }
                    }
                }
                cell_update(el);
            });
            $("[data-status]").text("playing");
            game_status = 1;
        },
        error: function(xhr, ajaxOptions, thrownError) {
            game_status = 0;
            $("[data-status]").text("server-fail");
        }
     });
}

function center_game(){
    var position = [{x:225, y:255},{x:225, y:50},{x:375, y:138},{x:375, y:314},{x:225, y:400},{x:75, y:314},{x:75, y:138}];
    var width = $(window).width()/2;
    var offset = $("#game").offset();
    $(".div_hex").offset(function(i,val){
          return { top:val.top, left:width - position[i].x + 260/2 };
    });
}


$(function(){
    // let points = "";
    // let center = {x:100, y:100};
    // let point;
    // for (var i=0;i<5;i++){
    //     point = pointy_hex_corner(center, 100, i);
    //     points += Math.round(point.x) + " " + Math.round(point.y) + ", ";
    // }
    // alert(points);
    
    center_game();
    $(window).resize(function() {
        center_game();
    });

    $('#button_go').click(function(){
        start_game();
    });
    $("select").change(function(){
        start_game();
    });
    $(document).keyup(function(e) {
        if (game_status === 1 ) {
            switch (e.keyCode) {
                case 81 : {
                    console.log("q");

                    break;
                }
                case 87 : {
                    console.log("w");
                    for (let i = 0; i < 3; i++){
                        for (let j = 0; j < 3; j++){
                            let game_data_item = game_data[i][j];
                            if (game_data_item != null && i == 0 && j == 2 ){
                                game_data_item.value +=1;
                                console.log(game_data_item.x + " " + game_data_item.y + " " + game_data_item.z);
                                cell_update(game_data_item);
                            }
                        }
                    }
                    break;
                }
                case 69 : {
                    console.log("e");
                    break;
                }
                case 65 : {
                    console.log("a");
                    break;
                }
                case 83 : {
                    console.log("s");
                    break;
                }
                case 68 : {
                    console.log("d");
                    break;
                }
            }
        }
    });

    var hash = document.URL.substr(document.URL.indexOf('#')+1) 
    if (hash === "test2"){
        start_game();    
    }
});

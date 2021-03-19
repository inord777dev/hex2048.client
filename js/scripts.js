var game_status = 1; //0 - stop; 1 - gaming; -1 - game-over; -2 - server-fail;  -3 - pause for POST;

var game_data = [[null, { x:-1, y:1, z:0, value:0, offset:375}, { x:0, y:1, z:-1, value:2, offset:225 }],
    [{ x:-1, y:0, z:1, value:0, offset:375 }, { x:0, y:0, z:0, value:2, offset:225 }, { x:1, y:0, z:-1, value:0, offset:75 }],
    [{ x:0, y:-1, z:1, value:2, offset:225 }, { x:1, y:-1, z:0, value:0, offset:75 }, null]];

function changeStatus(status) {
    game_status = status;
    let el = $("[data-status]");
    let value;
    if (status == 0) {
        value = "round-select";
    } else if (status == 1) {
        value = "playing";
    } else if (status == -1) {
        value = "game-over";
    };
    el.text(value);
    el.data("status", value);
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
            changeStatus(1);
        },
        error: function(xhr, ajaxOptions, thrownError) {
            changeStatus(-2);
        }
     });
}

function game_calc_up(dif) {
    let hasChanges = false;
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            hasChanges = game_value_calc(x, y, dif) || hasChanges;
        }
    }
    if (!hasChanges && game_data.every(el => el.value > 0 )) {
        changeStatus(-1);
    }
}

function game_calc_down(dif) {
    let hasChanges = false;
    for (let y = 2; y >= 0; y--) {
        for (let x = 2; x >= 0; x--) {
            hasChanges = game_value_calc(x, y, dif) || hasChanges;
        }
    }
    if (!hasChanges && game_data.every(el => el.value > 0 )) {
        changeStatus(-1);
    }
}

function game_value_calc(x, y, dif) {
    let cell = game_data[y][x];
    let hasChange = false;
    let difX = x + dif.x;
    let difY = y + dif.y;
    if (cell != null && difX >= 0 && difX < 3 && difY >= 0 && difY < 3){
        let cell_next = game_data[difY][difX];
        if (cell.value == 0 && cell_next != null && cell_next.value > 0) {
            cell.value = cell_next.value;
            cell_next.value = 0;
            hasChange = true;
            game_value_calc(difX, difY, dif);
        } else if (cell.value > 0 && cell_next != null && cell.value == cell_next.value) {
            cell.value += cell_next.value;
            cell_next.value = 0;
            hasChange = true;
            game_value_calc(difX, difY, dif);
        };
        if (hasChange) {
            cell_update(cell);
            cell_update(cell_next);
        }
    }
    return hasChange;
}

function center_game(){
    //var position = [{x:375, y:138},{x:375, y:314},{x:225, y:400},{x:75, y:314},{x:75, y:138}];
    let width = $(window).width()/2;
    let offset = $("#game").offset();
    for (let x = 0; x < 3; x++){
        for (let y = 0; y < 3; y++){
            let cell = game_data[x][y];
            if (cell != null){
                $(`[data-x=${cell.x}][data-y=${cell.y}][data-z=${cell.z}]`)
                .offset(function(i,val){
                    return { top:val.top, left:width - cell.offset + 260/2 };
                })
                cell_update(cell);
            }
        }
    }
}

function pointy_hex_corner(center, size, i){
    var angle_deg = 60 * i - 30;
    var angle_rad = Math.PI / 180 * angle_deg;
    return { 
        x : center.x + size * Math.cos(angle_rad),
        y : center.y + size * Math.sin(angle_rad)
    }
}

function draw_hex() {
    let points = "";
    let center = {x:100, y:100};
    let point;
    for (var i=0; i<5; i++){
        point = pointy_hex_corner(center, 100, i);
        points += Math.round(point.x) + " " + Math.round(point.y) + ", ";
    }
    console.log(points);
}

$(function(){
    //changeStatus(0);
    changeStatus(1);

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

        if (game_status == 1 ) {
            switch (e.keyCode) {
                case 81 : {
                    console.log("q");
                    game_calc_up({ x:0, y:1 });
                    break;
                }
                case 87 : {
                    console.log("w");
                    game_calc_up({ x:-1, y:1 });
                    break;
                }
                case 69 : {
                    console.log("e");
                    game_calc_down({ x:-1, y:0 });
                    break;
                }
                case 65 : {
                    console.log("a");
                    game_calc_up({ x:1, y:0 });
                    break;
                }
                case 83 : {
                    console.log("s");
                    game_calc_down({ x:1, y:-1 });
                    break;
                }
                case 68 : {
                    console.log("d");
                    game_calc_down({ x:0, y:-1 });
                    break;
                }
            }
        }
    });

    var hash = document.URL.substr(document.URL.indexOf('#') + 1) 
    if (hash === "test2"){
        start_game();    
    }
});

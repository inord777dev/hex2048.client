var game_status; //0 - stop; 1 - gaming; -1 - game-over; -2 - server-fail;  -3 - pause for POST; -4 - win
var you_are_win = false;

 var game_data = [[null, { x:-1, y:1, z:0, value:0, offset:375, merged:false}, { x:0, y:1, z:-1, value:0, offset:225, merged:false }],
     [{ x:-1, y:0, z:1, value:0, offset:375, merged:false }, { x:0, y:0, z:0, value:0, offset:225, merged:false }, { x:1, y:0, z:-1, value:0, offset:75, merged:false }],
     [{ x:0, y:-1, z:1, value:0, offset:225, merged:false }, { x:1, y:-1, z:0, value:0, offset:75, merged:false }, null]];

var colors = [];
colors.v0 = "#FFFFFF";
colors.v2 = "#ECE4DB";
colors.v4 = "#EBE0CA";
colors.v8 = "#E9B381";
colors.v16 = "#E8996C";
colors.v32 = "#E78267";
colors.v64 = "#E56747";
colors.v128 = "#E8CF7F";
colors.v256 = "#E8CC72";
colors.v512 = "#E7C865";
colors.v1024 = "#E7C559";
colors.v2048 = "#E7C24F";

function changeStatus(status) {
    game_status = status;
    let el = $("[data-status]");
    let value;
    if (status == 0) {
        value = "press Go!";
    } else if (status == 1) {
        value = "playing";
    } else if (status == -1) {
        value = "game-over";
    } else if (status == -2) {
        value = "server-fail";
    } else if (status == -4){
        value = "you are champion!";
    };
    if (value){
        el.text(value);
        el.attr("data-status", value);
    }
}

function cell_update(cell) {
    let div = $(`[data-x=${cell.x}][data-y=${cell.y}][data-z=${cell.z}]`);
    div.attr("data-value", cell.value);
    div.find(".span_hex").text(cell.value === 0 ? "" : cell.value);
    div.find("polygon").attr("fill", colors["v" + cell.value]);
}

function game_request() {
    changeStatus(-3);
    let data = [];

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let item = game_data[i][j];
            if (item != null && item.value > 0) {
                data.push(item);
            }
        }
    }

    var selected_server = $("option:selected").val();
    $.ajax({
        type: "POST",
        url: selected_server + "2",
        dataType: "json",
        data: JSON.stringify(data),
        success: function(response) {
            response.forEach(el => {
                cell_update(el);
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        let game_data_item = game_data[i][j];
                        if (game_data_item != null && game_data_item.x == el.x && game_data_item.y == el.y && game_data_item.z == el.z) {
                            game_data_item.value = el.value;
                        }
                    }
                }
            });
            game_over_check();
        },
        error: function(xhr, ajaxOptions, thrownError) {
            changeStatus(-2);
        }
     });
   
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
    game_request();
}

function game_over_check() {
    let game_over_is = true;
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            let cell = game_data[y][x];
            if (cell != null) {
                if (cell.value > 0) {
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            if (i != y || j != x) {
                                let neighbor = game_data[i][j];
                                if (neighbor != null && cell.value == neighbor.value && (Math.abs(cell.x - neighbor.x) + Math.abs(cell.y - neighbor.y) + Math.abs(cell.z - neighbor.z))/2 == 1) {
                                    game_over_is = false;
                                }
                            }
                        }
                    }
                } else {
                    game_over_is = false;
                }
            }
        }
    }
    if (game_over_is) {
        changeStatus(-1);
    } else {
        changeStatus(1);
    }
}

function game_calc(dif, shift) {
    changeStatus(-3);
    for (let y = 0; y <= 2; y++) {
        for (let x = 0; x <= 2; x++) {
            let cell = game_data[y][x];
            if (cell != null) {
                cell.merged = false;
            }
        }
    }
    let hasChanges = shift(dif);
    while (shift(dif)){

    }
    if (hasChanges) {
        game_request();    
    } else {
        changeStatus(1);
    }
}

function game_calc_up(dif) {
    let hasChanges;
    for (let y = 0; y <= 2; y++) {
        for (let x = 0; x <= 2; x++) {
            hasChanges = game_value_calc(x, y, dif) || hasChanges;
        }
    }
    return hasChanges;
}

function game_calc_down(dif) {
    let hasChanges = false;
    for (let y = 2; y >= 0; y--) {
        for (let x = 2; x >= 0; x--) {
            hasChanges = game_value_calc(x, y, dif) || hasChanges;
        }
    }
    return hasChanges;
}

function game_value_calc(x, y, dif) {
    let cell = game_data[y][x];
    let hasChange = false;
    let difX = x + dif.x;
    let difY = y + dif.y;
    if (cell != null && difX >= 0 && difX <= 2 && difY >= 0 && difY <= 2) {
        let cell_next = game_data[difY][difX];
        if (cell.value == 0 && cell_next != null && cell_next.value > 0) {
            cell.value = cell_next.value;
            cell_next.value = 0;
            hasChange = true;
        } else if (cell.value > 0 && !cell.merged && cell_next != null && cell.value == cell_next.value && !cell_next.merged) {
            cell.value += cell_next.value;
            cell.merged = true;
            if (cell.value >= 2048) {
                you_are_win = true;
            }
            cell_next.value = 0;
            hasChange = true;
        };
        if (hasChange) {
            cell_update(cell);
            cell_update(cell_next);
        }
    }
    return hasChange;
}

function center_game(){
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
    changeStatus(0); 

    //changeStatus(1); // for selftest - not for realise
    // for (let i = 0; i < 3; i++){
    //     for (let j = 0; j < 3; j++){
    //         let data_item = game_data[i][j];
    //         if (data_item != null) {
    //             cell_update(game_data[i][j]);
    //         }
    //     }
    // }

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
                    game_calc({ x:0, y:1 }, game_calc_up);
                    break;
                }
                case 87 : {
                    game_calc({ x:-1, y:1 }, game_calc_up);
                    break;
                }
                case 69 : {
                    game_calc({ x:-1, y:0 }, game_calc_down);
                    break;
                }
                case 65 : {
                    game_calc({ x:1, y:0 }, game_calc_up);
                    break;
                }
                case 83 : {
                    game_calc({ x:1, y:-1 }, game_calc_down);
                    break;
                }
                case 68 : {
                    game_calc({ x:0, y:-1 }, game_calc_down);
                    break;
                }
            }
        }
    });

    var hash = document.URL.substr(document.URL.indexOf('#') + 1) 
    if (hash === "test2"){
        $("#localhost").prop("selected", true);
        start_game();   
    } else {
        center_game();
    
        $(window).resize(function() {
            center_game();
        });
    }
});

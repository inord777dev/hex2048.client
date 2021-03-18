var game_status = ["playing", "game-over", "server-fail"];
var data = [null];

function cube_to_axial(cube){
    var q = cube.x
    var r = cube.z
    return Hex(q, r)
}

function axial_to_cube(hex){
    var x = hex.q;
    var z = hex.r
    var y = -x-z
    return new Cube(x, y, z)
}

function pointy_hex_corner(center, size, i){
    var angle_deg = 60 * i - 30;
    var angle_rad = Math.PI / 180 * angle_deg;
    return { 
        x : center.x + size * Math.cos(angle_rad),
        y : center.y + size * Math.sin(angle_rad)
    }
}

function start_game(){
    var selected_server = $("option:selected").val();
    $("[data-status]").text(game_status[0]);
    alert(selected_server);
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

    $('#div_hex').position();

    $('#button_go').click(function(){
        start_game();
    });
    $("select").change(function(){
        start_game();
    });
});

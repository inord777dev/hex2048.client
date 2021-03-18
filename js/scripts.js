var game_status = {start:"playing", finish:"game-over", fail:"server-fail"};
var position = [
    {x:225, y:255},
    {x:225, y:50},
    {x:375, y:138},
    {x:375, y:314},
    {x:225, y:400},
    {x:75, y:314},
    {x:75, y:138},
];
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
    $.ajax({
        type: "POST",
        url: selected_server + "2",
        dataType: "json",
        data: "[]",
        success: function(response) {
            response.forEach(data => {
                var  element = $(`[data-x=${data.x}][data-y=${data.y}][data-z=${data.z}]`);
                element.data("value", data.value);
                element.find(".span_hex").text(data.value);
            });
            $("[data-status]").text(game_status.start);
        },
        error: function(xhr, ajaxOptions, thrownError) {
            $("[data-status]").text(thrownError);
        }
     });
}

function center_game(){
    var width = $(window).width()/2;
    var offset = $("#game").offset();
    $(".div_hex").offset(function(i,val){
          return { top:val.top, left:width - position[i].x + 225/2 };
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

    console.log($(`[data-x=${0}][data-y=${0}][data-z=${0}]`).find(".span_hex").length);

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
});

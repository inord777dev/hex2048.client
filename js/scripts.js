var game_status = ["playing", "game-over"];

const cell = {
    x: 0,
    y: 1,
    z: -1,
    value: 2,
}

$(function(){
    $('#button_go').click(function(){
        $("[data-status]").text(game_status[0]);
    });
});

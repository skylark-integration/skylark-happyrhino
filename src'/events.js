// Events for tablet and desktop
var events = {
    'start': "mousedown",
    'stop': "mouseup",
    'move': "mousemove",
    'enter': "mouseenter",
    'leave': "mouseleave"
};

if (navigator.userAgent.search('Mobile') > 0) {
    events = {
        'start': "touchstart",
        'stop': "touchend",
        'move': "touchmove",
        'enter': "touchenter",
        'leave': "touchleave"
    };
}

module.exports = events;
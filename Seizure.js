
let seizure = false

document.getElementById('goCrazy').onclick = function () {seizure = !seizure};
function getNewColor() {
    rColor = "" + Math.random() * 255;
        bColor = "" + Math.random() * 255;
        gColor = "" + Math.random() * 255;
        newColor = 'rgba(' + rColor + ',' + bColor + ',' + gColor + ', 1)';
        console.log(newColor);
        document.body.style.backgroundColor = newColor;
}

function update() {
    if(seizure) getNewColor()
    
    window.requestAnimationFrame(update);
}
update();
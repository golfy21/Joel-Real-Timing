function hideData(t)
{
    var tab = document.getElementsByClassName(t);
    for (i = 0; i < tab.length; i++) {
        tab[ i ].style.display="none";
    }
    disp[t] = 0
    responsive_dim(0)
}

function showData(t)
{
    var tab = document.getElementsByClassName(t);
    for (i = 0; i < tab.length; i++) {
        tab[ i ].style.display="inline-block";
    }
    disp[t] = 1
    responsive_dim(0)
}


function showMe (chboxs, t) {
    var tab = document.getElementsByClassName(t);
    var vis = "none";
    for(var i=0;i<tab.length;i++) {
        if(chboxs.checked){
            vis = "inline-block"
        } else {
            vis = "none"
        }
        tab[ i ].style.display = vis;
    }
    if(chboxs.checked) {
        disp[t] = 1
    } else {
        disp[t] = 0
    }
    responsive_dim(0)
}

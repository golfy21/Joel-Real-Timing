function lic_class_color() {
    for (i in donnees.d) {

        // On change la couleur de fond des numéros , de l'irating et de la couleur de la position dans la class
        var str = donnees.d[i].cc;
        if (str == "0xffffff" || str == "0x0") str = "0x999999";
        if (str != undefined) {
            if (str != "0xffffff" && str != "0x0") {
                str = str.slice(2);
                for (n = str.length; n < 6; n++) {
                    str = "0" + str
                }
                document.getElementById('num' + i).style.backgroundColor = "#" + str;
                document.getElementById('num' + i).style.color = "#000000";
                document.getElementById('cpos' + i).style.color = "#" + str;
                document.getElementById('scpos' + i).style.color = "#" + str;
            } else {
                document.getElementById('num' + i).style.backgroundColor = "rgba(0,0,0,0)";
                if (donnees.d[i].fr == 0) { // Si les positions ne sont pas gelées
                    document.getElementById('num' + i).style.color = "#9e9e9e";
                } else {
                    document.getElementById('num' + i).style.color = "#555555";
                }
            }
        }

        if (ir_mode == 2) {
            str = donnees.d[i].lic;
            if (str != undefined) {
                str = str.slice(2);
                for (var n = str.length; n < 6; n++) {
                    str = "0" + str
                }
                document.getElementById('ir' + i).style.backgroundColor = "#" + str;
                if (str == "fc8a27" | str == "feec04") {
                    document.getElementById('ir' + i).style.color = "#" + "000000";
                } else {
                    document.getElementById('ir' + i).style.color = "#" + "ffffff";
                }
            }
        } else {
            document.getElementById('ir' + i).style.backgroundColor = "rgba(0,0,0,0)";
            //document.getElementById('ir' + i).style.color = "#ff0000";
        }

        if (lic_mode < 3) {
            str = donnees.d[i].lic;
            if (str != undefined) {
                str = str.slice(2);
                for (var n = str.length; n < 6; n++) {
                    str = "0" + str
                }
                document.getElementById('lic' + i).style.backgroundColor = "#" + str;
                if (str == "fc8a27" | str == "feec04") {
                    document.getElementById('lic' + i).style.color = "#" + "000000";
                } else {
                    document.getElementById('lic' + i).style.color = "#" + "ffffff";
                }
            }
        } else {
            document.getElementById('lic' + i).style.backgroundColor = "rgba(0,0,0,0)";
        }

    }
}

/* LICENCE COLOR CODES :

Rookie (Red): #fc0706
Class D (Orange): #fc8a27
Class C (Yellow): #feec04
Class B (Green): #00c702
Class A (Blue): #0153db
Pro (Black): #000000

*/
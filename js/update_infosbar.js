function update_infosbar() {
    //if (donnees.sof != undefined) {
    /*
        document.getElementById("infosbar").innerHTML = "SOF: " + "<span style='z-index:0;font-style: italic; font-weight: bold'>" + donnees.sof + "</span>";
        document.getElementById("infosbar").innerHTML += " | " + "<span style='font-style: italic; font-weight: bold'>" + type_session;
        document.getElementById("infosbar").innerHTML += " @ " + "<span style='font-style: italic; font-weight: bold'>" + donnees.trackname + "</span>";
        if (donnees.tr != "unlimited")
        //if (donnees.tr < 167*3600)
            document.getElementById("infosbar").innerHTML += " | Time Remaining : " + "<span style='font-style: italic; font-weight: bold'>" + reformat_timeremain(donnees.tr) + "</span>";
        if (selected_idxjs in donnees.d && donnees.c in donnees.d)
            if (donnees.d[selected_idxjs].lr < 32767)
                document.getElementById("infosbar").innerHTML += " | Laps Remaining : " + "<span style='font-style: italic; font-weight: bold'>" + reformat_lapsremain(donnees.d[donnees.c].lr) + "</span>";

        // WEATHER -> waiting for iRacing datas
        // document.getElementById("infosbar").innerHTML += "<br>Weather: " + "<span style='font-style: italic; font-weight: bold'>" + donnees.weathertype + "</span>";
        // document.getElementById("infosbar").innerHTML += " | " + donnees.skies + "</span>";
        // document.getElementById("infosbar").innerHTML += ", " + "<span style='font-style: italic; font-weight: bold'>" + donnees.airtemp + "</span>";
        // document.getElementById("infosbar").innerHTML += ", track " + "<span style='font-style: italic; font-weight: bold'>" + donnees.tracktemp + "</span>";
        // document.getElementById("infosbar").innerHTML += " | Winds: " + "<span style='font-style: italic; font-weight: bold'>" + donnees.winddir + "</span>";
        // document.getElementById("infosbar").innerHTML += ", " + "<span style='font-style: italic; font-weight: bold'>" + donnees.windspeed + "</span>";
        // document.getElementById("infosbar").innerHTML += " | RH " + "<span style='font-style: italic; font-weight: bold'>" + donnees.humidity + "</span>";
        // document.getElementById("infosbar").innerHTML += ", " + "<span style='font-style: italic; font-weight: bold'>" + donnees.airpress + "</span>";


        document.getElementById("infosbar").innerHTML += "<br>Tank: " + "<span style='font-style: italic; font-weight: bold'>" + donnees.f.toFixed(2) + " L</span>";
        document.getElementById("infosbar").innerHTML += " ( <span style='font-style: italic; font-weight: bold'>" + (0.75 * donnees.f).toFixed(2) + " Kg</span> )";
        if (donnees.co > 0) {
            document.getElementById("infosbar").innerHTML += " | <span style='font-style: italic; font-weight: bold'>" + donnees.co.toFixed(3) + " L/lap</span>";
            document.getElementById("infosbar").innerHTML += " ( <span style='font-style: italic; font-weight: bold'>" + (0.75 * donnees.co).toFixed(3) + " Kg/lap</span> )";
        } else {
            document.getElementById("infosbar").innerHTML += " | <span style='font-style: italic; font-weight: bold'>-- L/lap</span>";
            document.getElementById("infosbar").innerHTML += " ( <span style='font-style: italic; font-weight: bold'>-- Kg/lap</span> )";
        }
        document.getElementById("infosbar").innerHTML += " | Fuel needed: <span style='font-style: italic; font-weight: bold'>" + donnees.fn.toFixed(1) + " L</span>";
        document.getElementById("infosbar").innerHTML += " ( <span style='font-style: italic; font-weight: bold'>" + (0.75 * donnees.fn).toFixed(1) + " Kg</span> )";
        if (donnees.co > 0)
            document.getElementById("infosbar").innerHTML += " | Est. Laps: <span style='font-style: italic; font-weight: bold'>" + (donnees.f / donnees.co).toFixed(1) + "</span>";
        else
            document.getElementById("infosbar").innerHTML += " | Est. Laps: <span style='font-style: italic; font-weight: bold'>--</span>";
    */
    //}
    document.getElementById("tank").innerHTML = (fuelfactor * coef_fuel * donnees.f).toFixed(1);
    if (calcfuel_mode == 0) {
        conso = donnees.co;
        fuelneed = donnees.fn;
        text_conso = "(last lap)"
    } else {
        conso = donnees.co5;
        fuelneed = donnees.fn5;
        text_conso = "(5 laps)"
    }

    if (conso > 0) {
        document.getElementById("conso").innerHTML = (fuelfactor * coef_fuel * conso).toFixed(3) + " " + text_conso;
        document.getElementById("estlaps").innerHTML = (donnees.f / conso).toFixed(1);
        if (donnees.f / conso < 2) {
            document.getElementById("estlaps").style.backgroundColor = "#ee0000";
            document.getElementById("tank").style.backgroundColor = "#cc0000";
            document.getElementById("conso").style.backgroundColor = "#880000";
        } else {
            document.getElementById("estlaps").style.backgroundColor = "#00aa00";
            document.getElementById("tank").style.backgroundColor = "#008800";
            document.getElementById("conso").style.backgroundColor = "#005500";
        }
    } else {
        document.getElementById("conso").innerHTML = "-- " + text_conso;
        document.getElementById("estlaps").innerHTML = "--";
    }
    document.getElementById("timeremain").innerHTML = reformat_timeremain(donnees.tr);
    //if (selected_idxjs in donnees.d && donnees.c in donnees.d)
    if (donnees.c in donnees.d)
        //if (donnees.d[selected_idxjs].lr < 32767)
            document.getElementById("lapsremain").innerHTML = reformat_lapsremain(donnees.d[donnees.c].lr);
    document.getElementById("fuelneed").innerHTML = (fuelfactor * coef_fuel * fuelneed).toFixed(1);
    document.getElementById("sessioninfos").innerHTML = type_session + " @ " + donnees.trackname;


    // Affichage des SOF pour chaque classe et du SOF global
    if (donnees.sof != undefined && sof_displayed == 0) {
        sof_displayed = 1;
        if (responsive) {
            h = Math.floor(window.innerWidth / reference_w * ligne_h);
            h2 = (disp_sofbar * sofbar_h / ligne_h) * Math.floor(window.innerWidth / reference_w * ligne_h);
            fz = Math.floor(32 * sofbar_h / ligne_h * window.innerWidth / reference_w * ligne_h / 40)
        } else {
            h = ligne_h;
            h2 = (disp_sofbar * sofbar_h / ligne_h) * ligne_h;
            fz = Math.floor(32 * sofbar_h / 40)
        }
        document.getElementById("sof_cont").innerHTML = "<div onmousedown='class_selected="+0+";update_datas(-1);' style='z-index:6;color:#ffffff;padding-left:8px;padding-right:8px;" +
            "display:inline-block;position:relative;left:0;line-height:" + (2 * h - Math.floor(0.5 * h)) + "px;background-color:#000000'>" +
            "<div style='text-align:center;font-size:" + 14 * h / 40 + "px;line-height:" + (Math.floor(0.5 * h)) + "px'>ALL ("+ donnees.nbcars_class[0]+")</div>" +
            "<div style='text-align:center;line-height:" + (2 * h - 2 * Math.floor(0.5 * h)) + "px'>" + donnees.sof[0] +
            "</div></div>";
        document.getElementById("sofbar").innerHTML = "<div onclick='class_selected="+0+";update_datas(-1);' style='z-index:6;font-size:" + fz + "px;padding-left:8px;" +
            "padding-right:8px;display:inline-block;position:relative;left:0;top:0;line-height:" + h2 + "px;" +
            "background-color:#000000'>ALL ("+ donnees.nbcars_class[0]+"): " + donnees.sof[0] + "</div>";
        nb_classes = 0;
        for (c in donnees.classes) nb_classes += 1
        if (nb_classes > 1) {
            for (c in donnees.classes) {
                str = donnees.carclasscolor[c];
                if (str == "0x0") str = "0x999999";
                str = str.slice(2);
                for (n = str.length; n < 6; n++) {
                    str = "0" + str
                }

                a1 = "";
                a2 = "";
                if (f3_box == 0) {
                    a1 += "<div onmousedown='class_selected=" + c + ";update_datas(-1);'";
                    a2 += "<div onclick='class_selected=" + c + ";update_datas(-1);'";
                } else {
                    a1 += "<div ";
                    a2 += "<div ";
                }
                a1 += " style='z-index:6;padding-left:8px;padding-right:8px;" +
                    "display:inline-block;position:relative;left:0;top:0;line-height:" + (2 * h - Math.floor(0.5 * h)) + "px;background-color:#" + str + "'>" +
                    "<div style='text-align:center;font-size:" + 14 * h / 40 + "px;line-height:" + Math.floor(0.5 * h) + "px'>" + donnees.classname[c] +
                    " ("+ donnees.nbcars_class[c]+")</div>" +
                    "<div style='text-align:center;line-height:" + (2 * h - 2 * Math.floor(0.5 * h)) + "px'>" + donnees.sof[c] + "</div></div>";
                a2 += " style='z-index:6;color:#000000; font-size:" + fz + "px;padding-left:8px;" +
                    "padding-right:8px;display:inline-block;position:relative;left:0;top:0;line-height:" + h2 + "px;" +
                    "background-color:#" + str + "'>" + donnees.classname[c] + " ("+ donnees.nbcars_class[c]+") : " + donnees.sof[c] + "</div>";
                document.getElementById("sof_cont").innerHTML += a1;
                document.getElementById("sofbar").innerHTML += a2;
            }
        }

        /*document.getElementById("sof_cont").innerHTML += "<div style='padding-left:4px;padding-right:0px;" +
            "display:inline-block;position:relative;left:0;top:0;line-height:" + (2 * h - Math.floor(0.5 * h)) + "px;background-color:#" + "#000000" + "'>" +
            "<div style='color: rgba(255,255,255,0.5); text-align:center;font-size:" + 14 * h / 40 + "px;line-height:" + Math.floor(0.5 * h) + "px'>" + "FLAG" + "</div>" +
            "<div style='text-align:center;line-height:" + (2 * h - 2 * Math.floor(0.5 * h)) + "px'>" + "&nbsp" + "</div></div>";*/
    }


    // En fonction du système d'unité d'iRacing on passe de litre/kg à Gallon/livre
    if (donnees.u == 1) {
        document.getElementById("litre").innerHTML = "L";
        document.getElementById("kg").innerHTML = "Kg"
    } else {
        document.getElementById("litre").innerHTML = "Ga";
        document.getElementById("kg").innerHTML = "Lb"
    }

    // Couleurs des éléments dynamiques de la barre d'infos (L, Kg, Tank et Flag-typesession-sof-circuit
    if (coef_fuel ==1) {
        document.getElementById("litre").style.backgroundColor = "#dddddd";
        document.getElementById("litre").style.color = "#000000";
        document.getElementById("kg").style.backgroundColor = "#999999";
        document.getElementById("kg").style.color = "#555555";
    } else {
        document.getElementById("litre").style.backgroundColor = "#999999";
        document.getElementById("litre").style.color = "#555555";
        document.getElementById("kg").style.backgroundColor = "#dddddd";
        document.getElementById("kg").style.color = "#000000";
    }

    if (donnees.flag.slice(-4,-3) == "1") bg = "#ffff00";       // yellow
    else if (donnees.flag.slice(-9,-8) == "1") bg = "#ffff00";  // yellow waving
    else if (donnees.flag.slice(-15,-14) == "1") bg = "#ffff00";  // caution
    else if (donnees.flag.slice(-16,-15) == "1") bg = "#ffff00";  // caution waving
    else if (donnees.flag.slice(-6,-5) == "1") bg = "#0000ff";  // blue
    else if (donnees.flag.slice(-2,-1) == "1") bg = "#ffffff";  // white
    else if (donnees.flag.slice(-3,-2) == "1") bg = "#00ff00";  // green
    else if (donnees.flag.slice(-11,-10) == "1") bg = "#00ff00";  // green held
    else bg = "#999999";                                        // autres

    /*
    else if (donnees.flag == "0x00000002") bg = "#999999";  // checkered
    else if (donnees.flag == "0x00000008") bg = "#ff0000";  // red
    else if (donnees.flag == "0x00000100") bg = "#ffffff";  // one lap to green
    else if (donnees.flag == "0x00010000") bg = "#000000";  // black
    */

    //document.getElementById("sessioninfos").style.backgroundColor = bg;
    document.getElementById("sof_cont").style.backgroundColor = bg;

}
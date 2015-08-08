// Joel Real Timing
// timing.js


// Display the datas contained in text variable
function update_datas(text) {
    if (disp_param == 0)
        disp_ = disp;
    else
        disp_ = disp_all;

    if (text == "-3" || text == "-2") {
        document.getElementById("waitforiracing").style.display = "block"
    } else {
        document.getElementById("waitforiracing").style.display = "none"
    }

    if (text != -1 && text != "-2" && text != "-3") {
        donnees_new = JSON.parse(text);

        // Rechargement de la page si le serveur nous le demande lors d'un changement de session (uniquement en local)
        /*
        if (broadcast == 0)
            if (donnees_new.reload == 1) {
                console.log("rechargement de la page demandée par le seveur ...");
                ws.send("rechargement de la page demandée par le seveur ...");
                setTimeout(function () {
                    location.reload()
                }, 3000)
            }
        */


        if ((donnees_new.styp == type_session) && (donnees_new.sn == sessionnum) && (donnees_new.sid == sessionid)) {     // If we are still in the same session, we don't delete the old datas
            $.extend(true, donnees, donnees_new);     // Merge donnees_new into donnees, recursively
            if (donnees_new.nb != nb_drivers) // Si le nombre de pilotes a changé il faudra recalculer le SOF
                sof_displayed = 0;
        } else {
            switch_f3box_nbrequest = donnees_new.f3;
            send_trackmap_nbrequest = donnees_new.stm;
            trackmap_nbrequest = donnees_new.trm;

            nb_drivers = donnees_new.nb;
            sof_displayed = 0;
            teamracing_received = 0;
            selected_idxjs = -1;
            sessionnum = donnees_new.sn;
            sessionid = donnees_new.sid;
            type_session = donnees_new.styp;
            donnees = JSON.parse(text);
            if (broadcast == 0) {
                ws.send("send_statics");    // we want to collect the statics datas (name, num, ir)
            } else {
                ws3.send("send_statics");    // we want to collect the statics datas (name, num, ir)
            }
            effacer_tableau();
            if (type_session != "Race") classement = "best";
            else classement = "pos";

            // S'il n'y a qu'une seule class on n'affiche pas les colonnes de position des class C et sC
            if (donnees.nbclass == 1) {
                disp["cpos"] = 0;
                disp["scpos"] = 0;
                update_aff(disp_param);
            }
        }
        donnees_reform = {};

        $.extend(true, donnees_reform, donnees);
    }

    // Si la trackmap a changée on demande au serveur de nous envoyer les données
    if (donnees.stm > send_trackmap_nbrequest) {
        if (broadcast == 0)
            ws.send("send_statics");
        else
            ws3.send("send_statics");
        send_trackmap_nbrequest = donnees.stm
    }

    // On calcule les coefficient d'essence en fonction des options
    if (disp_kg_livre == 1) {
        if (donnees.u == 1) {  // systeme metric
            coef_fuel = 0.75
        } else {
            coef_fuel = 1 / (0.45359237 / 0.75 / 3.78541178);        //  1 Ga = 3.78541178 L     1 livre = 0.45359237 kg
        }
    } else {
        coef_fuel = 1;
    }

    if (donnees.d != undefined) {

        // Dès qu'on reçoit toutes les données on dessine le circuit
        if (donnees_new.typ == 1) {
            //draw_track("rgba(90,90,90,0.8)", 1, 2, 1);
            draw_track("#222222", 1, 1, 1);
        }

        update_infosbar();

        button_events();

        if (donnees_new.typ == 1 && type_session != "Race" && liste_donnees["best"] != undefined) classement = "best";

        if (text != -1) { // IMPORTANT Pour éviter la récursivité
            sort(classement);   // Sort the datas
        }

        if (donnees.u != undefined) {
            speedfactor = donnees.u == 1 ? 1 : 1 / 1.609344;
            fuelfactor = donnees.u == 1 ? 1 : 1 / 3.78541178;
        }

        selected_idx = donnees.c;
        if (selected_idxjs == -1) {
            // Verifie que le selected index n'est pas indéfinie (si c'est le spectateur ou le pace car par exemple)
            if (selected_idx in donnees_new.d)
                selected_idxjs = selected_idx; // possibilité de modifier le pilote sélectionné
            else
                selected_idxjs = 1;  // on pointe sur le caridx 1

            selected_idxjsold = selected_idxjs
        }
        // En mode F3 box on sélectionne automatiquement le pilote sélectionné dans iRacing
        if (f3_box == 1) {
            selected_idxjsold = selected_idxjs;
            selected_idxjs = selected_idx;
        }

        for (var i = 0; i < 64; i++) {

            if (i in donnees_new.d) {

                // IMPORTANT! We reformat only new datas

                if (donnees.d[i].spos == 0) donnees_reform.d[i].spos = "--";
                if (donnees.d[i].scpos == 0) donnees_reform.d[i].scpos = "--";

                // On calcul lapdistpct par rapport au selected_idxjs (compris entre -0.5 et +0.5)
                dp = donnees.d[i].dp;
                donnees.d[i].ldp = dp - Math.floor(dp);

                // On calcule les places gagnées
                donnees.d[i].gain = donnees.d[i].spos - donnees.d[i].pos;
                donnees.d[i].cgain = donnees.d[i].scpos - donnees.d[i].cpos;
                donnees_reform.d[i].gain = reformat_gain(donnees.d[i].gain);
                donnees_reform.d[i].cgain = reformat_gain(donnees.d[i].cgain);

                if ((donnees.d[i].name != undefined)) donnees_reform.d[i].name = reformat_name(donnees.d[i].name, donnees.d[i].tn);

                // En dehors des courses on recalcule le gap par rapport au meilleur temps
                if (type_session != "Race") {
                    if ((i in donnees.d) && (clt_idxp1 in donnees.d)) {
                        if (donnees.d[i].b != undefined && donnees.d[clt_idxp1].b != undefined)
                            donnees.d[i].g = donnees.d[i].b - donnees.d[clt_idxp1].b;
                        else donnees.d[i].g = ""
                    }
                    if ((i in donnees.d) && (selected_idxjs in donnees.d)) {
                        if (donnees.d[i].b != undefined && donnees.d[selected_idxjs].b != undefined)
                            donnees.d[i].rc = donnees.d[i].b - donnees.d[selected_idxjs].b;
                        else donnees.d[i].rc = ""
                    }
                }
                if (donnees.d[i].g != undefined) donnees_reform.d[i].g = reformat_gap(donnees.d[i].g);

                // En dehors des courses, on recalcule la position en fonction du meilleur temps
                if (type_session != "Race") {
                    if (donnees.d[i].pos != undefined) donnees_reform.d[i].pos = clt[i];
                    if (donnees.d[i].cpos != undefined) donnees_reform.d[i].cpos = clt_class[i];
                }

                if (donnees.d[i].l != undefined) donnees_reform.d[i].l = reformat_laptime(donnees.d[i].l);
                if (donnees.d[i].b != undefined) donnees_reform.d[i].b = reformat_laptime(donnees.d[i].b);

                if (donnees.d[i].rc != undefined)
                    var rc = donnees.d[i].rc;
                // We recalculate the relative gap if the client changed the selected driver (only in race)
                if (type_session == "Race" && selected_idxjs != selected_idx && f3_box == 0) {
                    if (selected_idxjs in donnees_new.d) {
                        if (donnees.d[selected_idxjs].g != undefined && donnees.d[i].g != undefined)
                            rc = donnees.d[selected_idxjs].g - donnees.d[i].g;
                        else rc = ""
                    }
                }
                // En mode F3 box on remplace le relative gap par celui de la F3 box
                if (f3_box == 1)
                    rc = donnees.d[i].rcf3;
                donnees_reform.d[i].rc = reformat_gap(rc);
                donnees.d[i].rc = rc;

                if (donnees.d[i].lc != undefined) donnees_reform.d[i].lc = reformat_lc(donnees.d[i].lc);
                if (donnees.d[i].np != undefined) donnees_reform.d[i].np = reformat_lc(donnees.d[i].np);
                if (donnees.d[i].ni != undefined) donnees_reform.d[i].ni = reformat_lc(donnees.d[i].ni);
                if (donnees.d[i].sti != undefined) donnees_reform.d[i].sti = reformat_lc((donnees.d[i].sti).toFixed(1));
                if (donnees.d[i].rt != undefined) donnees_reform.d[i].rt = reformat_pit_time(donnees.d[i].rt);
                if (donnees.d[i].st != undefined) donnees_reform.d[i].st = reformat_pit_time(donnees.d[i].st);
                if (donnees.d[i].dp != undefined) donnees_reform.d[i].dp = donnees.d[i].dp.toFixed(4);
                if (donnees.d[i].s != undefined) donnees_reform.d[i].s = reformat_speed(donnees.d[i].s);
                if (donnees.d[i].tops != undefined) donnees_reform.d[i].tops = reformat_speed(donnees.d[i].tops);
                if (donnees.d[i].as != undefined) donnees_reform.d[i].as = reformat_speed(donnees.d[i].as);
                if (donnees.d[i].ms != undefined) donnees_reform.d[i].ms = reformat_speed(donnees.d[i].ms);
                if (donnees.d[i].a != undefined) donnees_reform.d[i].a = reformat_accel(donnees.d[i].a);
                if (donnees.d[i].lic != undefined) donnees_reform.d[i].lic = reformat_lic(donnees.d[i].lic, donnees.d[i].licsub);

                for (var j = 0; j < tab_titres_all.length; j++) {
                    t = tab_titres_all[j];
                    if (disp_[t]) {
                        // We update the html only if there is new datas
                        if (donnees.d[i][liste_donnees[t]["shortname"]] != undefined)
                            document.getElementById(t + i).innerHTML = donnees_reform.d[i][liste_donnees[t]["shortname"]];
                    }
                }

                // On affiche que les pilotes qui ont parcourus au moins 0 m en course
                if (type_session == "Race" && donnees.d[i].dp < 0 && donnees.d[i].dp > -4 && donnees.s_init == 0) {
                    document.getElementById("p" + i).style.display = "none";
                } else {
                    document.getElementById("p" + i).style.display = "block";
                }

                if (f3_box == 0)
                    cl = clt[i];
                else
                    cl = donnees.d[i].posf3;

                if (class_selected ==0) {
                    document.getElementById("p" + i).style.top = (cl - 1) * Math.floor(coef_ligne * ligne_h) + "px";
                    if (i == selected_idxjs) {
                        selected_idxjs_scrollpos = (cl - 1) * Math.floor(coef_ligne * ligne_h)
                    }
                } else {
                    // Affichage par class
                    c = donnees.d[i].classid;
                    if (c == class_selected) {
                        document.getElementById("p" + i).style.top = (clt_class[i] - 1) * Math.floor(coef_ligne * ligne_h) + "px";
                        if (i == selected_idxjs) {
                            selected_idxjs_scrollpos = (clt_class[i] - 1) * Math.floor(coef_ligne * ligne_h)
                        }
                    } else {
                        document.getElementById("p" + i).style.display = "none";
                        if (i == selected_idxjs) {
                            selected_idxjs_scrollpos = -1
                        }
                    }
                }

            } else document.getElementById("p" + i).style.display = "none"
        }
    }

    scroll_to_selected_idxjs();
    animations();
    lic_class_color();
    //if (type_session == "Race" || f3_box == 1)
        deltas_and_gapcolor();
    trackmap();

    if (teamracing_received != undefined) {
        // Dès qu'on reçoit les infos teamracing pour connaitre le type de course on remet en forme
        if (teamracing_received == 0 && donnees.teamracing != undefined) {
            responsive_dim(disp_param);
            teamracing_received = 1
        }
    } else {
        teamracing_received = 0
    }

    selected_idxold = selected_idx
}


function effacer_tableau() {
    // ATTENTION ! on efface pas le delta
    for(var i=0;i<64;i++) {
        for (var j = 0; j < tab_titres_all.length; j++) {
            t = tab_titres_all[j];
            if (t != "delta")
                document.getElementById(t + i).innerHTML = ""
        }
    }

    // On efface les infos de fuel et de session
    document.getElementById("tank").innerHTML = "--";
    document.getElementById("conso").innerHTML = "--";
    document.getElementById("estlaps").innerHTML = "--";
    document.getElementById("timeremain").innerHTML = "--";
    document.getElementById("lapsremain").innerHTML = "--";
    document.getElementById("fuelneed").innerHTML = "--";
    document.getElementById("sessioninfos").innerHTML = "--";
    document.getElementById("sof_cont").innerHTML = "--"
}


// Create elements to display
function aff_titres(param) {
    aff = '';
    //for(t in liste_donnees) if (liste_donnees[t].disp) {
    for (j=0; j < tab_titres_all.length; j++) {
        t = tab_titres_all[j];
        aff += '<div ';
        aff += 'onclick="sort_or_switch(\'' + t + '\');" ';
        aff += 'class="' + t + '" id="' + t + '00">' + liste_donnees[t].titre + '</div>';
    }
    document.getElementById('p00').innerHTML = aff;
    document.getElementById('p00').style.lineHeight = ligne_h + "px";
    document.getElementById('p00').style.height = ligne_h + "px";
}


function aff_ligne_pilote(idx) {
    aff = '';
    for (j=0; j < tab_titres_all.length; j++) {
        t = tab_titres_all[j];
        aff += '<div ';
        aff += 'class="' + t + '" id="' + t + idx + '"></div>';
    }
    return aff;
}


function change_idxsel(i) {
    if (f3_box == 0) {
        selected_idxjsold = selected_idxjs;
        selected_idxjs = i;
        for (i = 1; i <= 64; i++) {
            init_delta[i] = 1
        }
        update_datas(-1)
    }
}


function change_kg_livre() {
    disp_kg_livre = 1;
    if (donnees.u == 1) {  // systeme metric
        coef_fuel = 0.75
    } else {
        coef_fuel = 1 / (0.45359237 / 0.75 / 3.78541178);        //  1 Ga = 3.78541178 L     1 livre = 0.45359237 kg
    }
    update_datas(-1)
}


function change_litre_gallon() {
    disp_kg_livre = 0;
    coef_fuel = 1;
    update_datas(-1)
}


function change_calcfuel_mode() {
    calcfuel_mode = Math.abs(calcfuel_mode -1)
    update_datas(-1)
}

// Param = 0 : on affiche que les colonnes indiquées dans le fichier de config
// Param = 1 : on affiche toutes les colonnes
function init_aff(param) {
    aff_titres(param)
    aff = "<div id='timing'>";
    for (i=0;i<64;i++) {
        aff += '<div class="ligne" ';
		if( /Android|webOS|iPhone|iPad/i.test(navigator.userAgent) ) {
			// Pas de double click sur les tablettes
			aff += "onclick = 'change_idxsel("+i+");' id='p"+i+"'>";
		} else {
			aff += "ondblclick = 'change_idxsel("+i+");' id='p"+i+"'>";
		}
        aff += '<div class="ligneB" id="pB'+i+'">';
        aff += '<div class="ligneH" id="pH'+i+'">';
        aff += '<div class="ligneM" id="pM'+i+'"></div>'; // Sert à masquer partiellement les pilotes hors piste
        aff += aff_ligne_pilote(i);
        aff += '</div></div></div>'
    }
    aff+="</div>";
    document.getElementById('tableau').innerHTML = aff;

    for (i = 0; i < 64; i++) {
        document.getElementById("delta" + i).style.visibility = "visible";
        document.getElementById("p" + i).style.visibility = "visible";
    }

    // on défnit les canvas comme enfant des deltas pour pouvoir défnir leur position en relatif
    for (i = 0; i < 64; i++) {
        document.getElementById("delta" + i).appendChild(document.getElementById("canvas" + i));
        document.getElementById("delta" + i).appendChild(document.getElementById("canvasB" + i));
    }
}


function update_aff(param) {
    for (j=0; j < tab_titres_all.length; j++) {
        t = tab_titres_all[j];
        if (disp[t] || (param == 1))
            if (param == 1)
                if (disp[t]) document.getElementById(t + "00").style.backgroundColor = "rgba(180,0,0,1)";
                else document.getElementById(t + "00").style.backgroundColor = "#000000";
            else document.getElementById(t + "00").style.backgroundColor = "rgba(0,0,0,0)";
        var tab = document.getElementsByClassName(t);
        for (i = 0; i < tab.length; i++) {
            if (disp[t]) {
                tab[i].style.display = "inline-block";
                tab[i].style.visibility = "visible"
            } else {
                if (param == 1) {
                    tab[i].style.display = "inline-block";
                    tab[i].style.visibility = "hidden";
                }
                else tab[i].style.display = "none"
            }
        }
        if (param == 1) {
            document.getElementById(t+"00").style.display = "inline-block";
            document.getElementById(t+"00").style.visibility = "visible"
        } else {
            if (disp[t]) {
                document.getElementById(t + "00").style.display = "inline-block";
                document.getElementById(t + "00").style.visibility = "visible"
            } else {
                document.getElementById(t + "00").style.display = "none";
            }
        }
    }
    responsive_dim(param);
}


// Fonction appelée quand on click sur un titre
function sort_or_switch(t) {
    if (disp_param == 0) {
        if (f3_box == 0) {
            sort(t);
            for (k in donnees.d) clt_old[k] = clt[k]
        }
    } else {
        switch_disp(t)
    }
}


// Sort the drivers by 't'
function sort(t) {
    if (liste_donnees[t].ordre) {  // If we are authorized to sort by 't'
        classement = t;
        classpos = {};
        for (k in donnees.d) {
            pos = 1;
            classid_k = donnees.d[k].classid;
            classpos[classid_k] = 1;
            if (t == "num") t_k = parseInt(donnees.d[k][liste_donnees[t]["shortname"]]);
            else t_k = donnees.d[k][liste_donnees[t]["shortname"]];
            if (t_k == undefined) {
                if (liste_donnees[t].ordre == 1) t_k = 9999;
                else t_k = -9999
            }
            if (t == "best" || t == "last" || t == "pitroadtime" || t == "pitstalltime") {
                if (t_k <= 0) t_k = 9999
            }
            for (j in donnees.d) {
                classid_j = donnees.d[j].classid;
                if (t == "num") t_j = parseInt(donnees.d[j][liste_donnees[t]["shortname"]]);
                else t_j = donnees.d[j][liste_donnees[t]["shortname"]];
                if (t_j == undefined) {
                    if (liste_donnees[t].ordre == 1) t_j = 9999;
                    else t_j = -9999
                }
                if (t == "best" || t == "last" || t == "pitroadtime" || t == "pitstalltime") {
                    if (t_j <= 0) t_j = 9999
                }
                if (liste_donnees[t].ordre == 2) {
                    if (t_j > t_k) {
                        pos += 1;
                        if (classid_j == classid_k)
                            classpos[classid_k] += 1
                    }
                } else if (t_j < t_k) {
                    pos += 1;
                    if (classid_j == classid_k)
                        classpos[classid_k] += 1
                }
                if (t_j == t_k && j > k) {
                    pos += 1;
                    if (classid_j == classid_k)
                        classpos[classid_k] += 1
                }
            }
            clt[k] = pos;
            clt_class[k] = classpos[classid_k];
            if (pos == 1) {
                clt_idxp1 = k
            }
        }
    }
    // On met à jour l'affichage immédiatement
    if (f3_box == 0)
        for(var i=0;i<64;i++)
            document.getElementById("p" + i).style.top = (clt[i] - 1) * Math.floor(coef_ligne * ligne_h) + "px";

}


// ************************ MAIN PROGRAM *************************

// Liste des titres de colonnes (ATTENTION ! Laisser cette liste dans ce fichier javascript sinon ça bug !!! )
// ordre : 0 -> none, 1 -> ascending, 2 -> descending
liste_donnees = {
    pos: {titre: "P", shortname: "pos", ordre: 1},
    cpos: {titre: "C", shortname: "cpos", ordre: 1},
    spos: {titre: "sP", shortname: "spos", ordre: 1},
    scpos: {titre: "sC", shortname: "scpos", ordre: 1},
    gain: {titre: "PG", shortname: "gain", ordre: 2},
    cgain: {titre: "CG", shortname: "cgain", ordre: 2},
    num: {titre: "#", shortname: "num", ordre: 1},
    name: {titre: "NAME", shortname: "name", ordre: 1},
    ir: {titre: "iR", shortname: "ir", ordre: 2},
    lic: {titre: "Lic", shortname: "lic", ordre: 0},
    rel: {titre: "REL", shortname: "rc", ordre: 2},
    delta: {titre: "Δ", shortname: "delta", ordre: 0},
    gap: {titre: "GAP", shortname: "g", ordre: 1},
    last: {titre: "LAST", shortname: "l", ordre: 1},
    best: {titre: "BEST", shortname: "b", ordre: 1},
    lc: {titre: "LC", shortname: "lc", ordre: 2},
    distpct: {titre: "distpct", shortname: "dp", ordre: 2},
    lapdistpct: {titre: "lapdist", shortname: "ldp", ordre: 2},
    posf3: {titre: "posf3", shortname: "posf3", ordre: 1},
    speed: {titre: "SPD", shortname: "s", ordre: 0},
    topspeed: {titre: "TOP", shortname: "tops", ordre: 2},
    apex_speed: {titre: "Apex", shortname: "as", ordre: 0},
    max_speed: {titre: "Max", shortname: "ms", ordre: 0},
    accel: {titre: "Accel", shortname: "a", ordre: 0},
    stint: {titre: "St", shortname: "sti", ordre: 2},
    pit: {titre: "PIT", shortname: "np", ordre: 1},
    pitroadtime: {titre: "lane", shortname: "rt", ordre: 1},
    pitstalltime: {titre: "Stop", shortname: "st", ordre: 1},
    inc: {titre: "INC", shortname: "ni", ordre: 1}
    // NOTE : some datas don't appear here because they aren't displayed
};


function init() {
    init_aff(disp_param);
    update_aff(disp_param);
    window.onresize = function() { responsive_dim(disp_param) };

    // Pour switcher du mode normal au mode édition
    document.getElementById("click_infos").onclick = function() {
        disp_param = Math.abs(disp_param - 1);
        update_aff(disp_param);
        update_datas(-1)
    }
}


// Démarrage de la connection websocket
window.onload = function() {
    console.log("page chargée");
    init_var();
    init();
    init_ws();
};

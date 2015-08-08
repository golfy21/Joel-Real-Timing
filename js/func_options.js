function button_events() {
    // Bouton pour switcher au mode F3 box
    if (donnees.f3 > switch_f3box_nbrequest && broadcast == 0) {  // Pour les clients du broadcast, le mode ne changera pas si le pilote change son mode
        if ((donnees.f3 - switch_f3box_nbrequest) % 2 != 0) { // On vérifie qu'on n'a pas appuyé un nombre pair de fois
            if (f3_box == 0) {
                f3_box = 1;
                document.getElementById("opt_f3_box").checked = true;
                class_selected = 0;
                classement_old = classement;
                selected_idx_before_f3 = selected_idxjs;
                selected_idxjs = selected_idx;  // le mode f3 ne fonctionne que pour le pilote sélectionné dans le jeu
            } else {
                f3_box = 0;
                document.getElementById("opt_f3_box").checked = false;
                classement = classement_old;
                selected_idxjs = selected_idx_before_f3;
                sort(classement);
                for (k in donnees.d) clt_old[k] = clt[k]
            }
        }
        switch_f3box_nbrequest = donnees.f3;
    }

    // Bouton pour afficher la trackmap
    if (donnees.trm > trackmap_nbrequest && broadcast == 0) {  // Pour les clients du broadcast, le mode ne changera pas si le pilote change son mode
        if ((donnees.trm - trackmap_nbrequest) % 2 != 0) { // On vérifie qu'on n'a pas appuyé un nombre pair de fois
            if (disp_trackmap == 0) {
                disp_trackmap = 1;
                document.getElementById('trackmap').style.display='block';
            } else {
                disp_trackmap = 0;
                document.getElementById('trackmap').style.display='none';
            }
        }
        trackmap_nbrequest = donnees.trm;
    }
}


function scroll_to_selected_idxjs() {
    // Calcul du nombre de lignes affichées au-dessus du pilote sélectionné
    n = Math.floor((parseInt($("#container").css("height")) / Math.floor(coef_ligne * ligne_h))/2);

    if (autoscroll == 1 && selected_idxjs_scrollpos != -1) {
        document.getElementById("container").scrollTop = selected_idxjs_scrollpos - n * Math.floor(coef_ligne * ligne_h);
    }
    document.body.scrollLeft = 0;
}


function opt_autoscroll(elt) {
    if (elt.checked) {
        autoscroll = 1
    } else {
        autoscroll = 0
    }
}


function opt_tires_buttons(elt) {
    if (elt.checked) {
        tires_buttons = 1;
        document.getElementById("tires").style.display = "block"
    } else {
        tires_buttons = 0;
        document.getElementById("tires").style.display = "none"
    }
}


function opt_f3_box(elt) {
    if (elt.checked) {
        f3_box = 1;
        selected_idx_before_f3 = selected_idxjs;
        class_selected = 0;
        update_datas(-1);
        classement_old = classement;
        selected_idxjs = selected_idx;  // le mode f3 ne fonctionne que pour le pilote sélectionné dans le jeu
    } else {
        f3_box = 0;
        classement = classement_old;
        selected_idxjs = selected_idx_before_f3;
        sort(classement);
        for (k in donnees.d) clt_old[k] = clt[k]
    }
}


// Affiche tous les pilotes sur la trackmap
function trackmap() {

    //document.getElementById("pexit").innerHTML = "Projected track position after pit : " + (donnees.pexit).toFixed(4);
    document.getElementById("plost").innerHTML = "<span style='-webkit-filter: drop-shadow(1px 1px 1px black);filter: drop-shadow(1px 1px 1px black);" +
        //"background-color:rgba(90,90,90,0.8);" +
        "padding:0.5em;" +
        "font-weight:bold;color:#ff8800; margin-left:0.0em'>Time Lost Next PIT : " + (donnees.plost).toFixed(1) + "s</span>";

    // On efface les pilotes avant de les redessiner
    trackmap_context.clearRect(0, 0, container_w, container_h);

    me = donnees.me;
    if (selected_idxjs != undefined && selected_idxjs in donnees.d) {
        //trackmap_context.beginPath(); //On démarre un nouveau tracé.

        dp = donnees.d[selected_idxjs].dp;
        ldp = dp - Math.floor(dp);
        trackmap_context.globalAlpha=1;
        driver_on_trackmap("rgba(255,255,255,0.75)", ldp, selected_idxjs, 2.5, 1, 1);
        dp_exit = donnees.pexit;
        ldp_exit = dp_exit - Math.floor(dp_exit);
        if (selected_idxjs == me)  // On affiche l'estimation après la sortie des pits que pour le pilote local
            driver_on_trackmap("rgba(255,128,0,0.75)", ldp_exit, selected_idxjs, 2.5, 1, 1);

        // Si je suis dans les pits, on change ma couleur en rajoutant une couche grise dessus
        trackmap_context.globalAlpha=0.66;
        if (donnees.d[selected_idxjs].p) {
            driver_on_trackmap("#666666", ldp, selected_idxjs, 2.5, 1, 1);
        }

        //trackmap_context.closePath();
    } else {
        dp_exit = -1;  // en dernier recours on donne une valeur à dp_exit si jamais on n'accède pas aux données
    }

    // Affichage des autres pilotes
    for (i in donnees.d) {
        // On affiche les autres pilotes encore en piste
        //if (i != me && !( (donnees.d[i].fr == 0) && (donnees.d[i].ts == -1 || donnees.d[i].s < 1) )) {
        //if (i != me && (donnees.d[i].ts != -1)) {
        //if (i != me && donnees.d[i].s > 1 && donnees.d[i].p == 0) {
        if ((donnees.d[i].p == 1 || donnees.d[i].s > 1)) {
            dp = donnees.d[i].dp;
            ldp = dp - Math.floor(dp);
            coul = "rgba(255,0,0,0.5)";

            // Si on n'a pas pu calculer le dp_exit auparavant on prend la position du pilote sélectionné
            if (me != selected_idxjs && selected_idxjs in donnees.d) {
                dp_exit = donnees.d[selected_idxjs].dp
            }

            if (i != selected_idxjs) {
                trackmap_context.globalAlpha = 0.75;
                // Si le pilote a un tour de retard on rajoute du bleu, et s'il a un tour d'avance on met du bleu (sinon du noir
                if (donnees.d[i].dp - dp_exit > 0.5)
                    driver_on_trackmap("#ff5555", ldp, i, 1.5, 0, 2);
                if (donnees.d[i].dp - dp_exit < -0.5)
                    driver_on_trackmap("#55aaff", ldp, i, 1.5, 0, 2);
            }

            // Couleur de la class du pilote
            str = donnees.d[i].cc;
            if (str == "0xffffff" || str == "0x0") str = "0xff0000";
            if (str != undefined) {
                if (str != "0xffffff" && str != "0x0") {
                    str = str.slice(2);
                    for (n = str.length; n < 6; n++) {
                        str = "0" + str
                    }
                }
            }
            trackmap_context.globalAlpha=0.5;
            coul = "#" + str;
            //if (donnees.d[i].s < 1)
            //    coul = "rgba(255,128,0,0.5)";
            if (i != selected_idxjs)
                driver_on_trackmap(coul, ldp, i, 1, 1, 1);

            if (selected_idxjs in donnees.d) {
                trackmap_context.globalAlpha = 1;
                // Si le pilote a pitté plus tard on le marque d'un petit point noir (seulement si plus d'un tour d'écart)
                if (donnees.d[i].sti < donnees.d[selected_idxjs].sti - 1)
                    driver_on_trackmap("#000000", ldp, i, 0.33, 1, 1);
            }

            // Si un pilote est dans les pits, on change sa couleur en rajoutant une couche grise dessus
            /*trackmap_context.globalAlpha=0.66;
            if (donnees.d[i].p) {
                driver_on_trackmap("#666666", ldp, i, 1, 1, 1);
                if (Math.abs(donnees.d[i].dp - dp_exit) > 0.5)
                    driver_on_trackmap("#666666", ldp, i, 1.5, 0, 2);
            }*/
        }
    }

}


function driver_on_trackmap(coul, ldp, caridx, taille, plein, epaisseur_trait) {
    var w = 0;
    k = Math.floor(donnees.coef_k * ldp);
    d = donnees.coef_k * ldp;
    k2 = k + 1;
    if (k2 >= donnees.k_max) k2 = 0;

    if (k in donnees.x && k in donnees.y && donnees.k_max > 0) {
        if (k >= donnees.k_max) k = 0;

        rayon = taille * track_maxlength / 50 / 2;

        x1 = (-donnees.x[k] + track_max_x) * track_mult;
        y1 = (-donnees.y[k] + track_max_y) * track_mult;
        x2 = (-donnees.x[k2] + track_max_x) * track_mult;
        y2 = (-donnees.y[k2] + track_max_y) * track_mult;

        // On fait une interpolation
        x = (container_w - track_w)/2 + x1 + (x2 - x1) * (d - k);
        y = (container_h - track_h)/2 + y1 + (y2 - y1) * (d - k);

        // Si le driver est dans les stands, on le décale sur le côté de la piste
        l = Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1));
        if (donnees.d[caridx].p && l != 0) {
            decale_x = -(y2 - y1) / l * track_epaisseur * 1.5;
            decale_y = (x2 - x1) / l * track_epaisseur * 1.5;
        } else {
            decale_x = 0;
            decale_y = 0
        }
        x += decale_x;
        y += decale_y;

        trackmap_context.beginPath(); //On démarre un nouveau tracé.
        trackmap_context.arc(x, y, rayon, 0, Math.PI * 2); //On trace la courbe délimitant notre forme
        trackmap_context.fillStyle = coul;
        trackmap_context.strokeStyle = coul;
        trackmap_context.lineWidth = rayon/7;
        if (plein)
            trackmap_context.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
        else
            trackmap_context.stroke(); //On utilise la méthode fill(); si l'on veut une forme pleine
        trackmap_context.closePath();
    }
}


function draw_track(coul, opac, epaisseur, efface) {
    var w = 0;
    if (efface)
        trackmap_fond_context.clearRect(0, 0, container_w, container_h);
    trackmap_context.globalAlpha = opac;
    if (donnees.k_max > 0) {

        // Caractéristiques du circuit à dessiner
        w = donnees.max_x - donnees.min_x;
        h = donnees.max_y - donnees.min_y;
        if (w == 0 || h == 0) {
            w = 1;
            h = 1
        }
        cv_w = container_w * 0.9;
        cv_h = container_h * 0.9;
        mult = cv_w / w;
        mult_h = cv_h / h;
        if (mult_h < mult) mult = mult_h;
        track_max_x = donnees.max_x;
        track_max_y = donnees.max_y;
        track_min_x = donnees.min_x;
        track_min_y = donnees.min_y;
        track_w = (track_max_x - track_min_x) * mult;
        track_h = (track_max_y - track_min_y) * mult;
        track_mult = mult;
        track_maxlength = track_w;
        if (track_h > track_w)
            track_maxlength = track_h;
        track_epaisseur = epaisseur * track_maxlength / 50;


        trackmap_fond_context.beginPath(); //On démarre un nouveau tracé.
        trackmap_fond_context.lineWidth = track_epaisseur;
        trackmap_fond_context.lineJoin = "round";
        trackmap_fond_context.strokeStyle = coul;
        for (k = 0; k < donnees.k_max; k++) {
            k2 = k + 1;
            if (k2 >= donnees.k_max) k2 = 0;

            if (k in donnees.x && k in donnees.y && donnees.k_max > 0) {
                if (k >= donnees.k_max) k = 0;
                x = (container_w - track_w) / 2 + (-donnees.x[k] + track_max_x) * track_mult;
                y = (container_h - track_h) / 2 + (-donnees.y[k] + track_max_y) * track_mult;

                if (k == 0) {
                    trackmap_fond_context.moveTo(x, y);//On se déplace au coin inférieur gauche
                    x0 = x;
                    y0 = y;
                } else
                    if (k == 1) {
                        x1 = x;
                        y1 = y
                    }
                    if (k == 2) {
                        x2 = x;
                        y2 = y
                    }
                    trackmap_fond_context.lineTo(x, y);
            }
        }
        trackmap_fond_context.lineTo(x0, y0);
        trackmap_fond_context.lineTo(x1, y1);
        trackmap_fond_context.stroke(); //On trace seulement les lignes.
        trackmap_fond_context.closePath();

        trackmap_fond_context.beginPath(); //On démarre un nouveau tracé.
        trackmap_fond_context.strokeStyle = "#000000"; // couleur de la ligne d'arrivée
        trackmap_fond_context.lineWidth = epaisseur * track_maxlength / 50 * 2;
        trackmap_fond_context.moveTo(x0, y0);
        trackmap_fond_context.lineTo(x2, y2);
        trackmap_fond_context.stroke(); //On trace seulement les lignes.
        trackmap_fond_context.closePath();
        trackmap_fond_context.beginPath(); //On démarre un nouveau tracé.
        trackmap_fond_context.strokeStyle = "#ffffff"; // couleur de la ligne d'arrivée
        trackmap_fond_context.lineWidth = epaisseur * track_maxlength / 50;
        trackmap_fond_context.moveTo(x0, y0);
        trackmap_fond_context.lineTo(x2, y2);
        trackmap_fond_context.stroke(); //On trace seulement les lignes.
        trackmap_fond_context.closePath();
    }
}











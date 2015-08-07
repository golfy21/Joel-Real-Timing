function init_var() {

    // On détecte si la page est lancée en local ou depuis l'extérieur (on activera alors la version broadcast)
    h = window.location.hostname
    if (h) {
        b = /[0-9]+[.][0-9]+[.][0-9]+[.][0-9]+/.test(h)    // Fait un test pour savoir si le hostname est une adresse ip
    } else {
        b = true
    }
    if (h != "localhost" & (h == internetIP | !b)) {
        broadcast = 1
    } else {
        broadcast = 0
    }

    // On peut forcer le broadcast
    if (window.location.href.split('?')[1]=="b") {
        broadcast = 1
    }

    clt = [];
    clt_ = [];
    for (i = 0; i < 64; i++) {
        clt[i] = i + 1;
        clt_[i] = i + 1;
    }
    clt_old = [];
    for (i = 0; i < 64; i++) {
        clt_old[i] = i + 1
    }
    clt_class = [];
    for (i = 0; i < 64; i++) {
        clt_class[i] = i + 1
    }
    classement = "pos";
    classement_old = classement;
    donnees = {};
    donnees_new = {};
    sessionnum = 0;
    sessionid = 0;
    type_session = "";
    speedfactor = 1;
    fuelfactor = 1;
    selected_idx = -1;
    selected_idxold = -1;
    selected_idxjs = -1;
    selected_idxjsold = 1;
    lastlap = [];
    bestlap = [];
    besttag = 0;
    lasttag = 0;
    bestbestidx = 0;
    bestlastidx = 0;
    deltax = [];
    deltaxold = [];
    for (i = 0; i < 64; i++) {
        deltax[i] = 0
        deltaxold[i] = 0
    }
    gapold = [];
    relold = [];
    rel2 = [];
    rel2old = [];
    gap2 = [];
    gap2old = [];
    for (i = 0; i < 64; i++) {
        rel2old[i] = [];
        gap2old[i] = [];
    }
    rel2start = [];
    gap2start = [];
    for (i = 0; i < 64; i++) {
        rel2start[i] = 999999;
        gap2start[i] = 999999
    }
    rel2startok = [];
    gap2startok = [];
    init_delta = [];
    for (i = 0; i <= 64; i++) {
        rel2startok[i] = 0;
        gap2startok[i] = 0;
        init_delta[i] = 1;
    }
    barrex = [];
    barrexold = [];
    for (i = 0; i < 64; i++) {
        barrex[i] = 0;
        barrexold[i] = 0
    }
    coef_w = 1;

    for (i = 0; i < 64; i++) {
        cv = document.createElement("canvas");
        cv.setAttribute("width", w['delta']);
        cv.setAttribute("height", delta_h);
        cv.setAttribute("id", "canvas" + i);
        document.body.appendChild(cv);
    }
    for (i = 0; i < 64; i++) {
        cvB = document.createElement("canvas");
        cvB.setAttribute("class", "canvasB");
        cvB.setAttribute("id", "canvasB" + i);
        cvB.setAttribute("width", w['delta']);
        cvB.setAttribute("height", delta_h);
        document.body.appendChild(cvB);
    }


    canvas = [];
    canvasB = [];
    context = [];
    contextB = [];
    for (i = 0; i < 64; i++) {
        canvas[i] = document.querySelector('#canvas' + i);
        context[i] = canvas[i].getContext('2d');
        canvasB[i] = document.querySelector('#canvasB' + i);
        contextB[i] = canvasB[i].getContext('2d');
    }


    // On range les titres dans le dictionnaire disp pour avoir le bon ordre pour les valeurs affichées
    disp = {};
    for (j = 0; j < tab_titres.length; j++) {
        t = tab_titres[j];
        disp[t] = 1
    }

    // On rajoute les autres titres à la suite, peu importe l'ordre
    disp_all = {};
    for (j = 0; j < tab_titres_all_default.length; j++) {
        t = tab_titres_all_default[j];
        if (!(t in disp)) {
            disp[t] = 0
        }
        disp_all[t] = 1
    }

    // On forme tab_titres_all
    j = 0;
    tab_titres_all = [];
    for (t in disp) {
        tab_titres_all[j] = t;
        j++
    }


    wait = 0;
    clt_idxp1 = 1;
    disp_param = 0;
    coef_fuel = 1;  // unités d'essence en litre par defaut (0.75 pour les kg)
    calcfuel_mode = 0; // 0 -> calculs en tenant compte du dernier tour, 1 -> on tient compte de la moyenne des 5 derniers tours
    teamracing_received = 0;
    document.getElementById("app_name").innerHTML = "Joel Real Timing v" + version;
    bg = "#999999"; // couleur du drapeau par défaut à l'ouverture
    class_selected = 0;
    sof_displayed = 0;
    nb_drivers = 0;

    selected_idxjs_scrollpos = 0;

    // On active le lien pour l'affichage des options (si on l'affiche directement depuis le css, ça fait "bugguer" l'affichage de l'iPad
    document.getElementById("display_options").style.display = "block";

    // On coche les checkbox des options en fonction des valeurs choisies
    if (autoscroll == 1) {
        document.getElementById("opt_autoscroll").checked = true
    } else {
        document.getElementById("opt_autoscroll").checked = false
    }
    if (tires_buttons == 0) {
        document.getElementById("tires").style.display = "none";
        document.getElementById("opt_tires_buttons").checked = false
    } else {
        document.getElementById("tires").style.display = "block";
        document.getElementById("opt_tires_buttons").checked = true
    }
    if (f3_box == 1) {
        document.getElementById("opt_f3_box").checked = true
    } else {
        document.getElementById("opt_f3_box").checked = false
    }

    if (disp_trackmap == 1)
        document.getElementById('trackmap').style.display='block';
    else
        document.getElementById('trackmap').style.display='none';

    switch_f3box_nbrequest = 0;
    send_trackmap_nbrequest = 0;
    trackmap_nbrequest = 0;
    trackmap_loaded = 0;

    // Création du canvas pour la trackmap
    cv = document.createElement("canvas");
    cv.setAttribute("id", "trackmap_canvas");
    document.getElementById("trackmap").appendChild(cv);
    trackmap_canvas = document.querySelector('#trackmap_canvas');
    trackmap_context = trackmap_canvas.getContext('2d');

    cv = document.createElement("canvas");
    cv.setAttribute("id", "trackmap_fond_canvas");
    document.getElementById("trackmap").appendChild(cv);
    trackmap_fond_canvas = document.querySelector('#trackmap_fond_canvas');
    trackmap_fond_context = trackmap_fond_canvas.getContext('2d');

}

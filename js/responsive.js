function responsive_dim(param) {
    if (param == 0) {
        disp_ = disp;
        reference_w_ = reference_w
    } else {
        disp_ = disp_all;
        reference_w_ = 2000
    }

    // Si ce n'est pas une course en team en passe du mode 5 ou du mode 6 au mode 1
    if ((name_mode == 5 || name_mode == 6) && (donnees.teamracing == 0))
        name_mode_ = 1;
    else {
        name_mode_ = name_mode;
    }

    largeur_totale = 0;
    for (t in disp_) largeur_totale += w[t]*disp_[t]

    if (responsive) {
        coef_w = window.innerWidth;
        for (t in disp_) {
            padd = $("#"+t+"0").css("paddingLeft");
            coef_w -= parseInt(padd)
        }
        coef_w = coef_w / largeur_totale
    } else {
        coef_w = 1
    }

    if (responsive) {
        if (name_mode_ == 5) {
            coef_ligne = 2 * window.innerWidth / reference_w_;  // on double la hauteur des lignes quand on afficher le nom et la team sur 2 lignes
        } else {
            coef_ligne = 1 * window.innerWidth / reference_w_
        }
    } else {
        if (name_mode_ == 5) {
            coef_ligne = 2;  // on double la hauteur des lignes quand on afficher le nom et la team sur 2 lignes
        } else {
            coef_ligne = 1
        }
    }

    delta_h = Math.floor(coef_ligne * ligne_h);

    // Redimensionnement des graphiques
    for (i = 0; i < 64; i++) {
        img = document.createElement("canvas");
        img.setAttribute("height", delta_h);
        img.setAttribute("width", Math.floor(coef_w * w['delta']));
        ctx = img.getContext('2d');
        ctx.drawImage(canvas[i], 0, 0, Math.floor(coef_w * w['delta']), delta_h);
        context[i].canvas.height = delta_h;
        context[i].canvas.width = Math.floor(coef_w * w['delta']);
        context[i].drawImage(img, 0, 0);
        img.remove();
        imgB = document.createElement("canvas");
        imgB.setAttribute("height", delta_h);
        imgB.setAttribute("width", Math.floor(coef_w * w['delta']));
        ctxB = img.getContext('2d');
        ctxB.drawImage(canvasB[i], 0, 0, Math.floor(coef_w * w['delta']), delta_h);
        contextB[i].canvas.height = delta_h;
        contextB[i].canvas.width = Math.floor(coef_w * w['delta']);
        contextB[i].drawImage(imgB, 0, 0);
        imgB.remove()
    }

    if( !/Android|webOS|iPhone|iPad/i.test(navigator.userAgent))  {  //Si c'est une tablette on désactive l'astuce permettant de cacher la scrolling barre car sinon ça rame
        document.getElementById("container").style.position = "absolute";
    } else {
    	document.body.style.overflow = "auto"
    }

    class_ligne_ = document.getElementsByClassName("ligne");
    class_ligne0_ = document.getElementsByClassName("ligne0");
    class_name_ = document.getElementsByClassName("name");
    if (responsive) {
        class_ligne0_[0].style.height = Math.floor(window.innerWidth / reference_w_ * ligne_h) + "px"
    } else {
        class_ligne0_[0].style.height = ligne_h + "px"
    }
    for (i = 0; i < class_ligne_.length; i++) {
        class_ligne_[i].style.height = Math.floor(coef_ligne * ligne_h) + "px";
        //class_ligne_[i].style.lineHeight = Math.floor(coef_ligne * ligne_h) + "px";
    }
    for (i = 0; i < class_name_.length; i++) {
        if (name_mode_ == 5) {
            if (responsive) {
                class_name_[i].style.lineHeight = Math.floor(window.innerWidth / reference_w_ * ligne_h) + "px"
            } else {
                class_name_[i].style.lineHeight = ligne_h + "px"
            }
        } else {
            if (responsive) {
                class_name_[i].style.lineHeight = Math.floor(coef_ligne * ligne_h) + "px"
            } else {
                class_name_[i].style.lineHeight = ligne_h + "px"
            }
        }
    }

    for (t in disp_) {
        class_t = document.getElementsByClassName(t);
        for (i = 0; i < class_t.length; i++) {
            class_t[i].style.width = Math.floor(coef_w * w[t]) + "px"
        }
    }

    id_tableau = document.getElementById("tableau");
    if (responsive) {
        id_tableau.style.lineHeight = Math.floor(coef_ligne * ligne_h) + "px";

        //document.getElementById("container").style.fontSize = Math.floor(24 * window.innerWidth / reference_w_ * ligne_h / 40) + "px";

        document.getElementById("timing").style.fontSize = Math.floor(24 * window.innerWidth / reference_w_ * ligne_h / 40) + "px";
        document.getElementById("p00").style.fontSize = Math.floor(24 * window.innerWidth / reference_w_ * ligne_h / 40) + "px";
        document.getElementById("infosbar").style.fontSize = Math.floor(24 * window.innerWidth / reference_w * ligne_h / 40) + "px";
        document.getElementById("donate").style.fontSize = Math.floor(24 * window.innerWidth / reference_w * ligne_h / 40) + "px";
        document.getElementById("p00").style.lineHeight = Math.floor(window.innerWidth / reference_w_ * ligne_h) + "px";
        document.getElementById("infosbar").style.lineHeight = Math.floor(window.innerWidth / reference_w * ligne_h) + "px";
        document.getElementById("donate").style.lineHeight = Math.floor(window.innerWidth / reference_w * ligne_h) + "px";
        document.getElementById("container").style.top = (disp_sofbar * sofbar_h / ligne_h + disp_paypal + 2 * disp_infosbar) * Math.floor(window.innerWidth / reference_w * ligne_h) + Math.floor(window.innerWidth / reference_w_ * ligne_h) + "px"
        document.getElementById("infosbar").style.top = (disp_sofbar * sofbar_h / ligne_h + disp_paypal) * Math.floor(window.innerWidth / reference_w * ligne_h) + "px";

        document.getElementById("click_infos").style.height = (disp_sofbar * sofbar_h / ligne_h + 2 * disp_infosbar) * Math.floor(window.innerWidth / reference_w * ligne_h) + "px";
        document.getElementById("click_infos").style.top = disp_paypal * Math.floor(window.innerWidth / reference_w * ligne_h) + "px";

        document.getElementById("p00").style.top = (disp_sofbar * sofbar_h / ligne_h + disp_paypal + 2 * disp_infosbar) * Math.floor(window.innerWidth / reference_w * ligne_h) + "px";

        document.getElementById("sofbar").style.fontSize = Math.floor(32 * sofbar_h / ligne_h * window.innerWidth / reference_w * ligne_h / 40) + "px";
        document.getElementById("sofbar").style.lineHeight = (disp_sofbar * sofbar_h / ligne_h) * Math.floor(window.innerWidth / reference_w * ligne_h) + "px";
        document.getElementById("sofbar").style.top = disp_paypal * Math.floor(window.innerWidth / reference_w * ligne_h) + "px";
    } else {
        id_tableau.style.lineHeight = coef_ligne * ligne_h + "px";

        //document.getElementById("container").style.fontSize = Math.floor(24 * ligne_h / 40) + "px";

        document.getElementById("timing").style.fontSize = Math.floor(24 * ligne_h / 40) + "px";
        document.getElementById("p00").style.fontSize = Math.floor(24 * ligne_h / 40) + "px";
        document.getElementById("infosbar").style.fontSize = Math.floor(24 * ligne_h / 40) + "px";
        document.getElementById("donate").style.fontSize = Math.floor(24 * ligne_h / 40) + "px";
        document.getElementById("p00").style.lineHeight = ligne_h + "px";
        document.getElementById("infosbar").style.lineHeight = ligne_h + "px";
        document.getElementById("donate").style.lineHeight = ligne_h + "px";
        document.getElementById("container").style.top = (disp_sofbar * sofbar_h / ligne_h + disp_paypal + 2 * disp_infosbar + 1) * ligne_h + "px"
        document.getElementById("infosbar").style.top = (disp_sofbar * sofbar_h / ligne_h + disp_paypal) * ligne_h + "px";

        document.getElementById("click_infos").style.height = (disp_sofbar * sofbar_h / ligne_h + 2 * disp_infosbar)*ligne_h + "px";
        document.getElementById("click_infos").style.top = disp_paypal * ligne_h + "px";

        document.getElementById("p00").style.top = (disp_sofbar * sofbar_h / ligne_h + disp_paypal + 2 * disp_infosbar) * ligne_h + "px";

        document.getElementById("sofbar").style.fontSize = Math.floor(32 * sofbar_h / 40) + "px";
        document.getElementById("sofbar").style.lineHeight = (disp_sofbar * sofbar_h / ligne_h)*ligne_h + "px";
        document.getElementById("sofbar").style.top = disp_paypal * ligne_h + "px";
    }

    if (transparency_OBS) {
        document.body.style.backgroundColor = "rgba(34,34,34,0.0)";
    }

    if (lic_mode >= 3) {
        for (i in donnees.d) {
            if ("lic" in disp_) document.getElementById("lic" + i).innerHTML = reformat_lic(donnees.d[i].lic, donnees.d[i].licsub)
        }
    }

    if (disp_paypal == 0) {
        document.getElementById("donate").style.display = "none"
    } else {
        document.getElementById("donate").style.display = "block"
    }

    // Mise en forme de la barre d'infos avec ses éléments
    if (disp_infosbar == 0) {
        document.getElementById("infosbar").style.display = "none"
    } else {
        document.getElementById("infosbar").style.display = "block"
    }
    if (responsive) {
        h = Math.floor(window.innerWidth / reference_w * ligne_h);
    } else {
        h = ligne_h
    }

    // Si on veut cacher les infos de fuel on décale le timeremain et les infos de session
    if (disp_fuelinfos) {
        decal_timeremain = 0;
        decal_lapsremain = 0;
        decal_infos = 0;
        document.getElementById("litre").style.display = "block";
        document.getElementById("kg").style.display = "block";
        document.getElementById("tank_h").style.display = "block";
        document.getElementById("tank").style.display = "block";
        document.getElementById("conso").style.display = "block";
        document.getElementById("estlaps_h").style.display = "block";
        document.getElementById("estlaps").style.display = "block";
        document.getElementById("fuelneed_h").style.display = "block";
        document.getElementById("fuelneed").style.display = "block"
    } else {
        decal_timeremain = -7*h;
        decal_lapsremain = -7*h;
        decal_infos = -12*h;
        document.getElementById("litre").style.display = "none";
        document.getElementById("kg").style.display = "none";
        document.getElementById("tank_h").style.display = "none";
        document.getElementById("tank").style.display = "none";
        document.getElementById("conso").style.display = "none";
        document.getElementById("estlaps_h").style.display = "none";
        document.getElementById("estlaps").style.display = "none";
        document.getElementById("fuelneed_h").style.display = "none";
        document.getElementById("fuelneed").style.display = "none"
    }

    document.getElementById("litre").style.top = 0*h + "px";
    document.getElementById("litre").style.left = 0*h + "px";
    document.getElementById("litre").style.width = h + "px";
    document.getElementById("kg").style.top = h + "px";
    document.getElementById("kg").style.left = 0*h + "px";
    document.getElementById("kg").style.width = h + "px";
    document.getElementById("tank_h").style.top = 0*h + "px";
    document.getElementById("tank_h").style.left = h + "px";
    document.getElementById("tank_h").style.width = 3*h + "px";
    document.getElementById("tank_h").style.lineHeight = Math.floor(0.5*h) + "px";
    document.getElementById("tank_h").style.fontSize = 14 * h / 40 + "px";
    document.getElementById("tank").style.top = Math.floor(0.5*h) + "px";
    document.getElementById("tank").style.left = h + "px";
    document.getElementById("tank").style.width = 3*h + "px";
    document.getElementById("tank").style.lineHeight = 2*h - 2*Math.floor(0.5*h) + "px";
    document.getElementById("tank").style.fontSize = 40 * h / 40 + "px";
    document.getElementById("conso").style.top = Math.floor(0.5*h) + 2*h - 2*Math.floor(0.5*h) + "px";
    document.getElementById("conso").style.left = h + "px";
    document.getElementById("conso").style.width = 3*h + "px";
    document.getElementById("conso").style.lineHeight = Math.floor(0.5*h) + "px";
    document.getElementById("conso").style.fontSize = 14 * h / 40 + "px";
    document.getElementById("estlaps_h").style.top = 0*h + "px";
    document.getElementById("estlaps_h").style.left = 4*h + "px";
    document.getElementById("estlaps_h").style.width = 3*h + "px";
    document.getElementById("estlaps_h").style.lineHeight = Math.floor(0.5*h) + "px";
    document.getElementById("estlaps_h").style.fontSize = 14 * h / 40 + "px";
    document.getElementById("estlaps").style.top = Math.floor(0.5*h) + "px";
    document.getElementById("estlaps").style.left = 4*h + "px";
    document.getElementById("estlaps").style.width = 3*h + "px";
    document.getElementById("estlaps").style.lineHeight = 2*h - Math.floor(0.5*h) + "px";
    document.getElementById("estlaps").style.fontSize = 60 * h / 40 + "px";
    document.getElementById("lapsremain_h").style.top = 0*h + "px";
    document.getElementById("lapsremain_h").style.left = decal_lapsremain + 14*h + "px";
    document.getElementById("lapsremain_h").style.width = 4*h + "px";
    document.getElementById("lapsremain_h").style.lineHeight = Math.floor(0.5*h) + "px";
    document.getElementById("lapsremain_h").style.fontSize = 14 * h / 40 + "px";
    document.getElementById("lapsremain").style.top = Math.floor(0.5*h) + "px";
    document.getElementById("lapsremain").style.left = decal_lapsremain + 14*h + "px";
    document.getElementById("lapsremain").style.width = 4*h + "px";
    document.getElementById("lapsremain").style.lineHeight = 2*h - Math.floor(0.5*h) + "px";
    document.getElementById("lapsremain").style.fontSize = 60 * h / 40 + "px";
    document.getElementById("fuelneed_h").style.top = 0*h + "px";
    document.getElementById("fuelneed_h").style.left = 18*h + "px";
    document.getElementById("fuelneed_h").style.lineHeight = Math.floor(0.5*h) + "px";
    document.getElementById("fuelneed_h").style.fontSize = 14 * h / 40 + "px";
    document.getElementById("fuelneed").style.top = Math.floor(0.5*h) + "px";
    document.getElementById("fuelneed").style.left = 18*h + "px";
    if (disp_infosbar == 2) {
        document.getElementById("fuelneed_h").style.right = 0 + "px";
        document.getElementById("fuelneed_h").style.width = "auto";
        document.getElementById("fuelneed").style.right = 0 + "px";
        document.getElementById("fuelneed").style.width = "auto";
    } else {
        document.getElementById("fuelneed_h").style.width = 5*h + "px";
        document.getElementById("fuelneed").style.width = 5 * h + "px";
    }
    document.getElementById("fuelneed").style.lineHeight = 2*h - Math.floor(0.5*h) + "px";
    document.getElementById("fuelneed").style.fontSize = 60 * h / 40 + "px";

    document.getElementById("timeremain_h").style.top = 0*h + "px";
    document.getElementById("timeremain_h").style.left = decal_timeremain + 7*h + "px";
    document.getElementById("timeremain_h").style.width = 7*h + "px";
    document.getElementById("timeremain_h").style.lineHeight = Math.floor(0.5*h) + "px";
    document.getElementById("timeremain_h").style.fontSize = 14 * h / 40 + "px";
    document.getElementById("timeremain").style.top = Math.floor(0.5*h) + "px";
    document.getElementById("timeremain").style.left = decal_timeremain + 7*h + "px";
    document.getElementById("timeremain").style.width = 7*h + "px";
    document.getElementById("timeremain").style.lineHeight = 2*h - Math.floor(0.5*h) + "px";
    document.getElementById("timeremain").style.fontSize = 60 * h / 40 + "px";
    document.getElementById("sessioninfos").style.top = 2* (disp_infosbar - 1)*h + "px";
    document.getElementById("sessioninfos").style.left = (decal_infos + 23*h)*(2-disp_infosbar) + "px";
    document.getElementById("sessioninfos").style.fontSize = 14 * h / 40 + "px";
    document.getElementById("sessioninfos").style.lineHeight = Math.floor(0.5*h) + "px";
    document.getElementById("sof_cont").style.top = 2* (disp_infosbar - 1)*h + Math.floor(0.5 * h) + "px";
    document.getElementById("sof_cont").style.left = (decal_infos + 23*h) *(2-disp_infosbar) + "px";
    document.getElementById("sof_cont").style.lineHeight = 2*h - Math.floor(0.5*h) + "px";
    document.getElementById("sof_cont").style.height = 2*h - Math.floor(0.5*h) + "px";

    document.getElementById("tires_all_h").style.fontSize = 14 * h / 40 + "px";
    document.getElementById("tires_all_h").style.lineHeight = Math.floor(0.5*h) + "px";
    document.getElementById("tires_all_cont").style.lineHeight = 2*h - 2*Math.floor(0.5*h) + "px";
    document.getElementById("tires_all_cont").style.width = 2*h + "px";
    document.getElementById("tires_none_h").style.fontSize = 14 * h / 40 + "px";
    document.getElementById("tires_none_h").style.lineHeight = Math.floor(0.5*h) + "px";
    document.getElementById("tires_none_cont").style.lineHeight = 2*h - 2*Math.floor(0.5*h) + "px";
    document.getElementById("tires_none_cont").style.width = 2*h + "px";
    document.getElementById("tires").style.top = 2* (disp_infosbar - 1)*h + Math.floor(0.5*h) + "px";
    document.getElementById("tires").style.lineHeight = 2*h - Math.floor(0.5*h) + "px";
    document.getElementById("tires").style.height = 2*h - Math.floor(0.5*h) + "px";
    document.getElementById("tires").style.right = 2*h - Math.floor(0.5*h) + 8 + "px";

    document.getElementById("logo").style.top = 2* (disp_infosbar - 1)*h + Math.floor(0.5*h) + "px";
    document.getElementById("logo").style.height = 2*h - Math.floor(0.5*h) - 2 + "px";

    document.getElementById("app_name").style.fontSize = 14 * h / 40 + "px";
    document.getElementById("app_name").style.lineHeight = Math.floor(0.5*h) + "px";
    document.getElementById("app_name").style.top = (disp_infosbar - 1)*(2*h) + "px";

    document.getElementById("flag_img").style.top = 2* (disp_infosbar - 1)*h + Math.floor(0.5*h) + "px";
    document.getElementById("flag_img").style.left = (decal_infos + 23*h)*(2-disp_infosbar) + "px";
    document.getElementById("flag_img").style.right = 2*h - Math.floor(0.5*h) + 8 + "px";
    document.getElementById("flag_img").style.width = window.innerWidth - (2*h - Math.floor(0.5*h) + 8) - (decal_infos + 23*h)*(2-disp_infosbar) + "px";
    document.getElementById("flag_img").style.height = 2*h - Math.floor(0.5*h) + "px";


    container_h = parseInt($("#container").css("height"));
    container_w = parseInt($("#container").css("width"));
    container_top = parseInt($("#container").css("top"));

    document.getElementById("waitforiracing").style.fontSize = 2 * h + "px";
    document.getElementById("waitforiracing").style.lineHeight = container_h + "px";

    // mini sofbar
    if (disp_sofbar) {
        document.getElementById("sofbar").style.display = "block";
    } else {
        document.getElementById("sofbar").style.display = "none"
    }

    document.getElementById("options").style.top = container_top + "px";
    document.getElementById("display_options").style.top = container_top + "px";

    document.getElementById("trackmap").style.top = container_top + "px";
    document.getElementById("display_trackmap").style.top = container_top + "px";
    document.getElementById("trackmap_canvas").setAttribute("width", container_w);
    document.getElementById("trackmap_canvas").setAttribute("height", container_h);
    document.getElementById("trackmap_fond_canvas").setAttribute("width", container_w);
    document.getElementById("trackmap_fond_canvas").setAttribute("height", container_h);

    // On redessine le circuit à la bonne taille
    //draw_track("rgba(90,90,90,0.8)", 1, 2, 1);
    draw_track("#222222", 1, 1, 1);

    //document.getElementById("container").style.filter = "blur(8px)"
}

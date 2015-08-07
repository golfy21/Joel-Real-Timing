function reformat_gain(gain) {
    if (gain < 0) {
        return "<span style='color:#ff0000'>"+gain+"</span>"
    } else if (gain > 0) {
        return "<span style='color:#00ff00'>+"+gain+"</span>"
    } else {
        return "--"
    }
}


function reformat_name(name, teamname) {

    // Si ce n'est pas une course en team en passe du mode 5 ou du mode 6 au mode 1
    if ((name_mode == 5 || name_mode == 6) && (donnees.teamracing == 0))
        name_mode_ = 1;
    else {
        name_mode_ = name_mode;
    }

    //name_old = name
    nom_ = name.split(" ")
    prenom = nom_[0]
    lettreprenom = prenom[0]
    nom = nom_[nom_.length - 1].toUpperCase()
    if (name_mode_ == 1) {
        name = name;
    } else if (name_mode_ == 2) {
        name = lettreprenom + ". " + nom
    } else if (name_mode_ == 3) {
        name = nom[0] + nom[1] + nom[2]
    } else if (name_mode_ == 4) {
        name = teamname
    } else if (name_mode_ == 5) {
        name = teamname + "<br>" + "<span style='color:#9e9e9e; font-weight:500'>" + name + "</span>"
    } else if (name_mode_ == 6) {
        name = teamname + "<span style='color:#9e9e9e; font-weight:500'> (" + lettreprenom + ". " + nom + ")</span>"
    }
    //console.log(name_old + "/" + name)
    return name
}


function reformat_pit_time(time) {
    if (time <= 0) return "";
    if (Math.abs(time) < 60) t = time.toFixed(1)
    else {
        if (time < 3600) {
            min = Math.floor(time / 60);
            sec = (Math.abs(time) % 60).toFixed(0);
            if (sec < 10) sec = "0" + sec;
            t = min + "'" + sec
        } else {
            heu = Math.floor(time / 3600);
            min = Math.floor((Math.abs(time-3600*heu) / 60));
            if (min < 10) min = "0" + min;
            t = heu + "h" + min
        }
    }
    return t
}


function reformat_speed(speed) {
    if (speed > 500 || speed <= 0) return "";
    var s = Math.floor(10*speedfactor*speed)/10;
    return s.toFixed(1)
}


function reformat_accel(accel) {
    var a = accel.toFixed(1);
    if (a >= 0) a = "+" + a;
    return a
}


function reformat_gap(gap) {
    if (gap == 0) return "";
    var abs_gap = Math.abs(gap);
    if (abs_gap < 60) g = abs_gap.toFixed(2);
    else {
        if (abs_gap < 3600) {
            min = Math.floor(abs_gap / 60);
            //sec = (abs_gap % 60).toFixed(0);
            sec = Math.floor(abs_gap - 60*min);
            if (sec < 10) sec = "0" + sec;
            g = min + "'" + sec
        } else {
            heu = Math.floor(abs_gap / 3600);
            min = Math.floor((abs_gap-3600*heu) / 60);
            if (min < 10) min = "0" + min;
            g = heu + "h" + min
        }
    }
    if (gap >= 0) g = "+" + g;
    else g = "-" + g
    return g
}


function reformat_lc(lc) {
    if (lc <= 0) return "--";
    return lc
}


function reformat_laptime(laptime) {
    if (laptime <= 0) return "--";
    min = Math.floor(laptime / 60);
    sec = (laptime % 60).toFixed(3);
    if (sec < 10) sec = "0" + sec;
    return min+"'"+sec
}


function reformat_lic(lic, sub) {
    if (disp_param == 0) {
        reference_w_ = reference_w
    } else {
        reference_w_ = 2000
    }
    var l = "";
    if ((lic_mode == 1) || (lic_mode == 3)) {
        if (lic == "0xfc0706") l = "R";
        if (lic == "0xfc8a27") l = "D";
        if (lic == "0xfeec04") l = "C";
        if (lic == "0xc702") l = "B";
        if (lic == "0x153db") l = "A";
        if (lic == "0x0") l = "P";
    } else {
        if (lic == "0xfc0706") l = "Rookie";
        if (lic == "0xfc8a27") l = "CLASS D";
        if (lic == "0xfeec04") l = "CLASS C";
        if (lic == "0xc702") l = "CLASS B";
        if (lic == "0x153db") l = "CLASS A";
        if (lic == "0x0") l = "Pro";
    }
    var s = " " + (sub/100).toFixed(2);
    bcol = lic.slice(2);
    for (var n = bcol.length; n < 6; n++) {
        bcol = "0" + bcol
    }
    if (bcol == "fc8a27" || bcol == "feec04") col = "#000000";
    else col = "#FFFFFF";
    bcol = "#" + bcol;

    if (lic_mode >= 3) {
        if (responsive) h = window.innerWidth / reference_w_ * ligne_h;
        else h = ligne_h;
        pw = h/1.5*16/40;
        ph = h/5*16/40 ;
        if (coef_ligne / (window.innerWidth / reference_w_)==2) ph += h/2.5;
        return "<span style='padding:"+ph+"px "+pw+"px;border: 1px solid #555555;background-color:"+bcol+";color:"+col+";vertical-align:top;line-height:"+coef_ligne*ligne_h+"px;font-size:"+(h * 16 / 40)+"px'>" + l + s + "</span>"
    } else return l + s
}


function reformat_timeremain(time) {
    if (time != "unlimited") {
        if (time < 167*3600) {
            heu = Math.floor(time / 3600);
            min = Math.floor((time - 3600 * heu) / 60);
            sec = Math.floor(time - 3600 * heu - 60 * min);
            if (min < 10) min = "0" + min;
            if (sec < 10) sec = "0" + sec;
            t = heu + ":" + min + ":" + sec;
            return t
        } else {
            return "--"
        }
    } else {
        return time
    }
}


function reformat_lapsremain(laps) {
    /*lapdistpctraw_s = 0;
    l = 0;
    if (selected_idxjs in donnees.d)
        lapdistpctraw_s = Math.floor(10*(donnees.d[selected_idxjs].dp - donnees.d[selected_idxjs].lc))/10;
    if ((selected_idxjs in donnees.d) && (donnees.p1 in donnees.d)) {
        l = laps + 1 - lapdistpctraw_s;
        if (donnees.d[donnees.p1].dp - donnees.d[donnees.p1].lc < donnees.d[selected_idxjs].dp - donnees.d[selected_idxjs].lc)  // Si le pilote n'est pas dans le même tour
            l += 1
    }
    if (l < 0) l = 0;
    return l.toFixed(1)*/
    if (laps < 0) return "--";
    return laps.toFixed(1)
}
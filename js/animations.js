function animations() {
    bestbest = 9999;
    bestlast = 9999;
    bestbestidxold = bestbestidx;
    bestlastidxold = bestlastidx;

    for (i in donnees.d) {

        if (f3_box == 1) {
            document.getElementById('p' + i).style.transitionProperty = "none";
            clt_[i] = donnees.d[i].posf3;
        } else {
            clt_[i] = clt[i];
            document.getElementById('p' + i).style.transitionProperty = "top"
        }

        // Background Color of the lines
        if (i == selected_idxjs) {
            document.getElementById('p'+i).style.backgroundColor = '#FFFFFF';
            document.getElementById('p'+i).style.color = '#000000';
        } else {
            if (donnees.d[i].fr == 0) { // Si les positions ne sont pas gelées
                document.getElementById('p' + i).style.backgroundColor = clt_[i] % 2 == 1 ? 'rgba(51,51,51,0.5)' : 'rgba(34,34,34,0.5)';
            } else {
                document.getElementById('p' + i).style.backgroundColor = clt_[i] % 2 == 1 ? 'rgba(210,210,210,1)' : 'rgba(200,200,200,1)';
            }
        }


        // Animation en couleur lors des changements de position
        //if (donnees.d[i].dp > 0) {
        if (animation) {

            // Gestion des position et des transitions pour l'animation
            if (clt[i] < clt_old[i]) {   // si on a gagné des places
                document.getElementById('pB' + i).style.transitionDuration = "0s"
                document.getElementById('pB' + i).style.transitionDelay = "0s"
                //document.getElementById('p' + i).style.transitionDelay = "0.5s"
                document.getElementById('pB' + i).style.backgroundColor = 'rgba(0,180,0,0.5)';
            }
            if (clt[i] > clt_old[i]) {   // si on a perdu des places
                document.getElementById('pB' + i).style.transitionDuration = "0s"
                document.getElementById('pB' + i).style.transitionDelay = "0s"
                //document.getElementById('p' + i).style.transitionDelay = "0.5s"
                document.getElementById('pB' + i).style.backgroundColor = 'rgba(180,0,0,0.5)';
            }
            if (clt[i] == clt_old[i]) {
                document.getElementById('pB' + i).style.transitionDuration = "0.5s"
                document.getElementById('pB' + i).style.transitionDelay = "2s"
                //document.getElementById('p' + i).style.transitionDelay = "0s"
                document.getElementById('pB' + i).style.backgroundColor = 'rgba(0,0,0,0)';
            }
        }
        //}

        clt_old[i] = clt[i];

        // Les animations ne commencent qu'après le franchissement de la ligne de départ
        //if (donnees.d[i].dp > 1) {

            // Animation des chronos
            last = donnees.d[i].l
            best = donnees.d[i].b
            if (best < bestbest & best > 9 & donnees.d[i].p != 1) {
                bestbest = best;
                bestbestidx = i;
            }
            if (last < bestlast & last > 9 & donnees.d[i].p != 1) {
                bestlast = last;
                bestlastidx = i;
            }

            if (last != lastlap[i]) {   // si on a gagné des places
                document.getElementById('last' + i).style.transitionDuration = "0s"
                document.getElementById('last' + i).style.transitionDelay = "0s"
                document.getElementById('last' + i).style.backgroundColor = 'rgba(200,200,200,0.5)';
                if (last == best & lasttag == 0) {
                    document.getElementById('last' + i).style.backgroundColor = 'rgba(0,255,0,0.5)';
                }
            }
            if (last == lastlap[i]) {
                document.getElementById('last' + i).style.transitionDuration = "3s"
                document.getElementById('last' + i).style.transitionDelay = "2s"
                document.getElementById('last' + i).style.backgroundColor = 'rgba(0,0,0,0)';
            }
            if (best != bestlap[i]) {   // si on a gagné des places
                document.getElementById('best' + i).style.transitionDuration = "0s"
                document.getElementById('best' + i).style.transitionDelay = "0s"
                document.getElementById('best' + i).style.backgroundColor = 'rgba(200,200,200,0.5)';
                if (last == best & besttag == 0) {
                    document.getElementById('best' + i).style.backgroundColor = 'rgba(0,255,0,0.5)';
                }
            }
            if (best == bestlap[i]) {
                document.getElementById('best' + i).style.transitionDuration = "3s"
                document.getElementById('best' + i).style.transitionDelay = "2s"
                document.getElementById('best' + i).style.backgroundColor = 'rgba(0,0,0,0)';
            }
            lastlap[i] = donnees.d[i].l
            bestlap[i] = donnees.d[i].b

        //}

        // Gestion des couleurs des noms ... en fonction de la couleur du fond
        if ((i == selected_idxjs) || (donnees.d[i].fr == 1)) {
            document.getElementById('p' + i).style.color = '#000000';
            //document.getElementById('name' + i).style.color = '#000000';
            document.getElementById('ir' + i).style.color = '#000000';
            //document.getElementById('speed' + i).style.color = '#000000';
            document.getElementById('apex_speed' + i).style.color = '#005555';
            document.getElementById('max_speed' + i).style.color = '#330077';
            if (i == selected_idxjs) {
                document.getElementById('p' + i).style.backgroundColor = '#FFFFFF';
            }
            document.getElementById('last' + i).style.color = '#000000';
            document.getElementById('best' + i).style.color = '#000000';
            document.getElementById('lc' + i).style.color = '#000000';
            document.getElementById('stint' + i).style.backgroundColor = '#FFFF00';
            document.getElementById('stint' + i).style.color = '#000000';
        } else {
            document.getElementById('p' + i).style.color = '#FFFFFF';
            //document.getElementById('name' + i).style.color = '#ffffff';
            document.getElementById('ir' + i).style.color = '#ffffff';
            //document.getElementById('speed' + i).style.color = '#ffffff';
            document.getElementById('apex_speed' + i).style.color = '#aaeedd';
            document.getElementById('max_speed' + i).style.color = '#ccaaee';
            document.getElementById('last' + i).style.color = '#ffffff';
            document.getElementById('best' + i).style.color = '#ffffff';
            document.getElementById('lc' + i).style.color = '#ffffff';
            document.getElementById("stint" + i).style.backgroundColor = 'rgba(0,0,0,0)';
            document.getElementById('stint' + i).style.color = '#FFFF00';
        }



        // Gestion des indications de Pit et les temps de pit
        //if (donnees.d[i].p == 1 | donnees.d[i].s<1 | donnees.d[i].ts == -1) {
        //if (donnees.d[i].p == 1 | donnees.d[i].s<1) {
        if (donnees.d[i].dp == -4)  // Si le pilote n'est pas encore sur la grille
            document.getElementById('pM' + i).style.backgroundColor = 'rgba(0,0,0,0.8)';
        else {
            if ((donnees.d[i].fr == 0) && (donnees.d[i].ts == -1 || donnees.d[i].s < 1)) { // Display name grey when driver is deconnected temporary or not or when He is stop anywhere
                document.getElementById('pM' + i).style.backgroundColor = 'rgba(0,0,0,0.5)';
            } else {
                document.getElementById('pM' + i).style.backgroundColor = 'rgba(0,0,0,0)';
            }
        }
        if (donnees.d[i].p == 1) {
            document.getElementById('pitroadtime'+i).style.color = '#000000';
            document.getElementById('name'+i).style.color = '#ff9900';
            document.getElementById('pitroadtime'+i).style.backgroundColor = '#ff9900';
            document.getElementById('last'+i).innerHTML = "PIT"
            document.getElementById('last'+i).style.color = "#ff9900"
        } else {
            document.getElementById('pitroadtime' + i).style.color = '#9e9e9e';
            document.getElementById('pitroadtime' + i).style.backgroundColor = 'rgba(0,0,0,0)';
            if ((i == selected_idxjs) || (donnees.d[i].fr == 1)) {
                document.getElementById('name' + i).style.color = '#000000';
                document.getElementById('last' + i).style.color = "#000000"
            } else {
                document.getElementById('name' + i).style.color = '#ffffff';
                document.getElementById('last' + i).style.color = "#ffffff"
            }
        }
        if (donnees.d[i].ps == 1) {
            document.getElementById('pitstalltime'+i).style.color = '#ffffff';
            document.getElementById('pitstalltime'+i).style.backgroundColor = '#ff9900';
        } else {
            document.getElementById('pitstalltime'+i).style.color = '#9e9e9e';
            document.getElementById('pitstalltime'+i).style.backgroundColor = 'rgba(0,0,0,0)';
        }

        //}

    }


    besttag = 0;
    lasttag = 0;
    if (bestbestidxold!=bestbestidx) {    // On change de best donc on remet les bonnes couleurs pour les autres
        if (bestbestidxold>0) {
            document.getElementById('best'+bestbestidxold).style.color = "#FFFFFF";
        }
        if (bestbestidx>0) {
            document.getElementById('best'+bestbestidx).style.transitionDuration = "0s"
            document.getElementById('best'+bestbestidx).style.transitionDelay = "0s"
            document.getElementById('best'+bestbestidx).style.backgroundColor = 'rgba(255,102,255,0.5)';
            besttag = 1;
        }
    }
    if (bestbestidx>0) {
        document.getElementById('best'+bestbestidx).style.color = "#FF66FF";
    }
    if (bestlastidxold!=bestlastidx) {    // On change de best donc on remet les bonnes couleurs pour les autres
        if (bestlastidxold>0) {
            document.getElementById('last'+bestlastidxold).style.color = "#FFFFFF";
        }
        if (bestlastidx>0) {
            document.getElementById('last'+bestlastidx).style.transitionDuration = "0s"
            document.getElementById('last'+bestlastidx).style.transitionDelay = "0s"
            document.getElementById('last'+bestlastidx).style.backgroundColor = 'rgba(0,217,255,0.5)';
            lasttag = 1;
        }
    }
    if (bestlastidx>0) {
        document.getElementById('last'+bestlastidx).style.color = "#00d9FF";
    }
}

function deltas_and_gapcolor() {
    if (selected_idxjs >= 0) {
        if (selected_idxjs in donnees.d)
            lapdistpctraw_s = donnees.d[selected_idxjs].dp - donnees.d[selected_idxjs].lc;

        for (i in donnees.d) {

            if (donnees.d[i].fr == 0) { // Si les positions ne sont pas gelées

                lapdistpctraw_i = donnees.d[i].dp - donnees.d[i].lc;

                //deltaxold[i] = deltax[i];
                if (donnees.d[i].pos > donnees.d[selected_idxjs].pos) {
                    deltax[i] = (Math.floor(lapdistpctraw_i * coef_w * w['delta'])) % (coef_w * w['delta'])
                } else {
                    deltax[i] = (Math.floor(lapdistpctraw_s * coef_w * w['delta'])) % (coef_w * w['delta'])
                }


                //barrexold[i] = barrex[i];
                barrex[i] = (Math.floor(lapdistpctraw_i * coef_w * w['delta'])) % (coef_w * w['delta']) + 1

                //{ Barre de position des pilotes
                if ((barrex[i] != barrexold[i]) || (selected_idxjsold != selected_idxjs)) {
                    if (i == selected_idxjs) {
                        contextB[i].fillStyle = 'rgba(0,0,0,1)'
                    } else {
                        contextB[i].fillStyle = 'rgba(255,255,255,1)'
                    }
                    if (barrex[i] > barrexold[i])
                        contextB[i].clearRect(barrexold[i]-10, 0, barrex[i] - barrexold[i]+10+1, delta_h);
                    else
                        contextB[i].clearRect(barrexold[i], 0, 10, delta_h);
                    contextB[i].fillRect(barrex[i], 0, 1, delta_h)
                    barrexold[i] = barrex[i];
                }

                if (type_session == "Race" || f3_box == 1) {
                    if ((deltax[i] != deltaxold[i]) && i != selected_idxjs) {     // on ralentit l'actualisation du delta
                        for (j = 1; j < 64; j++) {
                            rel2old[j][i] = rel2old[j - 1][i];
                            gap2old[j][i] = gap2old[j - 1][i]
                        }
                        rel2old[0][i] = rel2[i];
                        rel2[i] = donnees.d[i].rc;
                        gap2old[0][i] = gap2[i];
                        gap2[i] = donnees.d[i].g;
                        if (init_delta[i] | (deltax[i] <= coef_w * w['delta'] / 2 & rel2startok[i] != 1)) {
                            init_delta[i] = 0;
                            rel2start[i] = rel2[i];
                            rel2startok[i] = 1
                        }
                        if (init_delta[i] | (barrex[i] <= coef_w * w['delta'] / 2 & gap2startok[i] != 1)) {
                            init_delta[i] = 0
                            gap2start[i] = gap2[i];
                            gap2startok[i] = 1
                        }
                        if (deltax[i] > coef_w * w['delta'] / 2) {
                            rel2startok[i] = 0
                        }
                        if (barrex[i] > coef_w * w['delta'] / 2) {
                            gap2startok[i] = 0
                        }
                        if (rel2start[i] < 999999) {
                            coul = Math.floor(32 - (rel2[i] - rel2start[i]) * 16);
                            if (coul > 64) {
                                coul = 64
                            }
                            if (coul < 0) {
                                coul = 0
                            }
                            y = (rel2[i] - rel2start[i]) * delta_h / 2;
                            document.getElementById('rel' + i).style.color = couleurs2[coul];
                            if (deltax[i] > deltaxold[i]) {
                                context[i].clearRect(deltaxold[i] + 1, 0, deltax[i] - deltaxold[i], delta_h);
                                context[i].fillStyle = couleurs2[coul];
                                if (y > 0) {
                                    context[i].fillRect(deltaxold[i] + 1, delta_h / 2 - y, deltax[i] - deltaxold[i], y);
                                } else {
                                    context[i].fillRect(deltaxold[i] + 1, delta_h / 2, deltax[i] - deltaxold[i], -y);
                                }
                            }
                            if (deltax[i] < deltaxold[i] - coef_w * w['delta'] / 2) { // Si on recommence un autre tour
                                context[i].clearRect(deltaxold[i], 0, coef_w * w['delta'] - deltaxold[i], delta_h);
                                context[i].fillStyle = "rgba(100,100,100,0.5)";
                                context[i].fillRect(deltax[i] + 1, 0, coef_w * w['delta'] - deltax[i] - 1, delta_h);
                                context[i].fillStyle = couleurs2[coul];
                                if (y > 0) {
                                    context[i].fillRect(0, delta_h / 2 - y, deltax[i] + 1, y);
                                } else {
                                    context[i].fillRect(0, delta_h / 2, deltax[i] + 1, -y);
                                }
                                deltaxold[i] = -100; // pour être sûr d'effacer le début du delta au changement de tour
                            } else {
                                deltaxold[i] = deltax[i];
                            }
                        }
                        if (gap2start[i] < 999999) {
                            coul = Math.floor(32 - (gap2[i] - gap2start[i]) * 16);
                            if (coul > 64) {
                                coul = 64
                            }
                            if (coul < 0) {
                                coul = 0
                            }
                            document.getElementById('gap' + i).style.color = couleurs2[coul];
                        }

                        // Pour éviter un affichage erronné du delta au départ
                        if (rel2start[i] == 0) {
                            init_delta[i] = 1
                        }

                        //deltaxold[i] = deltax[i];
                    }
                }

                if ((selected_idxjsold != selected_idxjs)) {    // Si on a changé de pilote pour le focus
                    context[i].clearRect(0, 0, coef_w * w['delta'], delta_h);
                    for (i in donnees.d) {
                        init_delta[i] = 1
                    }
                }

            }

        }
        if (f3_box == 0)
            selected_idxjsold = selected_idxjs
    }
}

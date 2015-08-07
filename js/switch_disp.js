function switch_disp(t) {
    if (t == "name") {
        if (disp[t]) {
            name_mode++;
            name_mode %= 7;
        } else {
            name_mode = 1
        }
        if (name_mode == 0)
            disp[t] = 0;
        else
            disp[t] = 1
    } else if (t == "ir") {
        if (disp[t]) {
            ir_mode++;
            ir_mode %= 3;
        } else {
            ir_mode = 1
        }
        if (ir_mode == 0)
            disp[t] = 0;
        else
            disp[t] = 1
    } else if (t == "lic") {
        if (disp[t]) {
            lic_mode++;
            lic_mode %= 5;
        } else {
            lic_mode = 1
        }
        if (lic_mode == 0)
            disp[t] = 0;
        else
            disp[t] = 1
    } else {
        disp[t] = Math.abs(disp[t] - 1);
    }
    update_aff(disp_param);
    update_datas(-1)
}

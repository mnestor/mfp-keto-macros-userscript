// ==UserScript==
// @name         MyFitnessPal Percentages for Macros
// @namespace    mnestor79
// @version      0.1
// @description  Adds ability to have macro percentages that aren't a multiple of 5
// @author       mnestor79
// @include      http://www.myfitnesspal.com/account/change_goals_custom*
// @include      https://www.myfitnesspal.com/account/change_goals_custom*
// @include      http://www.myfitnesspal.com/account/change_goals_custom/*
// @include      https://www.myfitnesspal.com/account/change_goals_custom/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

function GM_main ($) {
    main();
}

if (typeof jQuery === "function") {
    GM_main (jQuery);
}
else {
    add_jQuery (GM_main, "1.7.2");
}

function add_jQuery (callbackFn, jqVersion2) {
    var jqVersion   = jqVersion2 || "1.7.2";
    var D           = document;
    var targ        = D.getElementsByTagName ('head')[0] || D.body || D.documentElement;
    var scriptNode  = D.createElement ('script');
    scriptNode.src  = 'http://ajax.googleapis.com/ajax/libs/jquery/' + jqVersion + '/jquery.min.js';
    scriptNode.addEventListener ("load", function () {
        var scriptNode          = D.createElement ("script");
        scriptNode.textContent  =
            'var gm_jQuery  = jQuery.noConflict (true);\n' + '(' + callbackFn.toString () + ')(gm_jQuery);'
        ;
        targ.appendChild (scriptNode);
    }, false);
    targ.appendChild (scriptNode);
}

function main() {
    //create the real fields to use
    var $carbs = jQuery("<input id='goals_carb_ratio_real' value='" + GM_getValue("carbs", "5") + "' size='4' class='text short' />");
    var $protein = jQuery("<input id='goals_protein_ratio_real' value='" + GM_getValue("protein", "60") + "' size='4' class='text short' />");
    var $fat = jQuery("<input id='goals_fat_ratio_real' value='" + GM_getValue("fat", "35") + "' size='4' class='text short' />");
    
    //get jQuery objects for the dropdowns
    var $carbs_drop = jQuery('#goals_carb_ratio');
    var $protein_drop = jQuery('#goals_protein_ratio');
    var $fat_drop = jQuery('#goals_fat_ratio');
    
    $total_line = jQuery('<tr><td class="first">Macro % Total</td></tr>');
    $total_value = jQuery('<td><span></span>%</td>');
    $total_line.append($total_value);
    $fat_drop.parent().parent().after($total_line);
    
    function update_total() {
        var total = parseInt($carbs.val()) + parseInt($protein.val()) + parseInt($fat.val());
        jQuery('span', $total_value).text(total);
        if (total == 100) {
            $total_value.css('color', 'black');
        } else {
            $total_value.css('color', 'red');
        }
    }
    update_total();
    
    function change_val(type, new_value, dest_obj) {
        var bSetValue = false;
        jQuery('option', dest_obj).each(function() {
            var $this = jQuery(this);
            if ($this.val() == new_value) {
                $this.prop('selected', true);
                bSetValue = true;
            } else {
                $this.prop('selected', false);
            }
        });
        if (!bSetValue) {
            dest_obj.append($("<option></option>").attr("value", new_value).text(new_value + "%").prop('selected', true)); 
        }
        GM_setValue(type, new_value);
        update_total();
    }
    
    $carbs.change(function() { change_val('carbs', jQuery(this).val(), $carbs_drop); });
    $protein.change(function() { change_val('protein', jQuery(this).val(), $protein_drop); });
    $fat.change(function() { change_val('fat', jQuery(this).val(), $fat_drop); });
    
    //Hide the dropdowns
    $carbs_drop.hide();
    $protein_drop.hide();
    $fat_drop.hide();
    
    //insert the text fields
    $carbs_drop.before($carbs);
    $protein_drop.before($protein);
    $fat_drop.before($fat);
    
    //give it one last change so that we submit the correct values
    jQuery('form:has(input[name=commit])').submit(function() {
        change_val('carbs', $carbs.val(), $carbs_drop);
        change_val('protein', $protein.val(), $protein_drop);
        change_val('fat', $fat.val(), $fat_drop);
    });
}

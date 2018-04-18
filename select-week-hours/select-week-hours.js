/* ====================================================================
 * Copyright (C) TIFX - All rights reserved
 * Written by Bruno B. Stein <stein.bbs@gmail.com>, 2018
 * ====================================================================
 */
(function ( $ ) {
	$.fn.selectWeekHours = function(options = {}) {
		// Define the plugin elements
		var pluginElements = {
			'selector': this,
			'wrap': "#select-week-hours-wrap",
			'table': "#select-week-hours-wrap table",
			'trTable': "#select-week-hours-wrap table > tbody > tr",
			'thTable': "#select-week-hours-wrap table > tbody > th",
			'thTableHours': "#select-week-hours-wrap table > thead > tr > th[data-hour]",
			'btnWeek': "#select-week-hours-wrap table > tbody > tr > td.btn-select-weekday",
			'selected_week_hours': "#select-week-hours-wrap input#selected_week_hours",
			'uiSelectable': "#select-week-hours-wrap table#selectable"
		};
		// Define default settings
		const settings = $.extend({
			"language": "en",
			"selected": "",
			"selected_color": "#007dc5",
		}, options );

		const lang = new Array();
		lang["en"] = {
			"title": "Week  Hours",
			"ctrl_click": "*Press (Ctrl + Click) to select hours.",
			"weekdays": [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ]
		};
		lang["pt-BR"] = {
			"title": "Horas da Semana",
			"ctrl_click": "*Pressione (Ctrl + Clique) para selecionar as horas.",
			"weekdays": [ "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab" ]
		};

		// Define hours
		const week_hours = new Array();
		for (var i = 0; i < 24; i++) {
			if (i < 10) i = "0" + i;
			week_hours.push(i);
		}

		if (!lang[settings.language]) {
			settings.language = "en";
		}

		var getSelectWeekHours = function() {
			var table  = "<div id='select-week-hours-wrap'>";
			table += "<input type='hidden' name='selected_week_hours' id='selected_week_hours' />";
			table += "<table id='selectable'>";
			table += "<thead>";
			table += "<tr>";
			table += "<th id='plugin-title'>";
			table += lang[settings.language].title;
			table += "</th>";
			for (var i = 0; i < week_hours.length; i++) {
				table += "<th class='btn-select-hour selectable' colspan='2' data-hour='" + week_hours[i] + "'>" + week_hours[i] + "</th>";
			}
			table += "</tr>";
			table += "</thead>";
			table += "<tbody>";
			for (var i = 0; i < 7; i++) {
				table += "<tr data-weekday='" + i + "'>";
				table += "<td class='btn-select-weekday selectable'>" + lang[settings.language]['weekdays'][i] + "</td>";
				for (var j = 0; j < week_hours.length; j++) {
					table += "<td class='selectable' data-hour='" + week_hours[j] + "' data-range-hours='" + week_hours[j] + ":00:00-" + week_hours[j] + ":30:00'></td>";
					table += "<td class='selectable' data-hour='" + week_hours[j] + "' data-range-hours='" + week_hours[j] + ":30:00-" + week_hours[j] + ":59:59'></td>";
				}
				table += "</tr>";
			}
			table += "</tbody>";
			table += "<tfoot>";
			table += "<tr>";
			table += "<td colspan='50'>" + lang[settings.language].ctrl_click + "</td>";
			table += "</tr>";
			table += "</tfoot>";
			table += "</table>";
			table += "</div>";
			return table;
		};

		var calHoursRange = function(hours) {
			var total_hours = hours.length;
			var range_from = hours[0].split('-')[0];
			var range_until = hours[total_hours-1].split('-')[1];
			var range = range_from + "-" + range_until;
			return range;
		}

		var getWeekHoursSelected = function() {
			var weekday_hours = new Array();
			var hours = new Array();
			$(pluginElements.trTable).each(function() {
				var weekday = $(this).data('weekday');
				$(this).children('td').not(':first').each(function() {
					if ($(this).hasClass('selected')) {
						hours.push($(this).data('range-hours'));
					} else if (hours.length > 0) {
						var range = weekday + "-" + calHoursRange(hours);
						weekday_hours.push(range);
						hours = [];
					}
				});
				if (hours.length > 0) {
					var range = weekday + "-" + calHoursRange(hours);
					weekday_hours.push(range);
					hours = [];
				}
			});
			$(pluginElements.selected_week_hours).val(weekday_hours.join(','));
		}

		var selectWeekHours = function(selected) {
			var selected_hours = selected.split(',');
			for (var i=0; i<selected_hours.length; i++) {
				var range = selected_hours[i].split('-');
				var selector_range_from = $(pluginElements.table).find("tr[data-weekday='" + range[0] + "'] > td[data-range-hours^='" + range[1] + "-']");
				var selector_range_until = $(pluginElements.table).find("tr[data-weekday='" + range[0] + "'] > td[data-range-hours$='-" + range[2] + "']");
				selector_range_from.addClass('selected');
				selector_range_until.addClass('selected');
				selector_range_from.nextUntil(selector_range_until).addClass('selected');
			}
			$(pluginElements.selected_week_hours).val(selected);
		}

		$(pluginElements.selector).html(getSelectWeekHours());
		$(pluginElements.uiSelectable).selectable({
			classes: {
				"ui-selected": "selected"
			},
			selected: function(event, ui) {
				if ($(ui.selected).hasClass('btn-select-hour')) {
					$(pluginElements.trTable).find('td[data-hour="' + $(ui.selected).data('hour') + '"]').addClass('selected');
				}
				if ($(ui.selected).hasClass('btn-select-weekday')) {
					$(ui.selected).parents('tr').find('td').addClass('selected');
				}
			},
			unselected: function(event, ui) {
				if ($(ui.unselected).hasClass('btn-select-hour')) {
					$(pluginElements.trTable).find('td[data-hour="' + $(ui.unselected).data('hour') + '"]').removeClass('selected');
				}
				if ($(ui.unselected).hasClass('btn-select-weekday')) {
					$(ui.unselected).parents('tr').find('td').removeClass('selected');
				}
			},
			stop: function( event, ui ) {
				getWeekHoursSelected();
			},
			filter: ".selectable"
		});

		if (settings.selected != "") {
			selectWeekHours(settings.selected);
		}
	}
}( jQuery ));

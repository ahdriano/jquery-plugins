/* ====================================================================
 * Copyright (C) TIFX - All rights reserved
 * Written by Bruno B. Stein <stein.bbs@gmail.com>, 2015
 * ====================================================================
 */
(function ( $ ) {
	$.fn.selectWeekHours = function(options = {}) {
		var $plugin = this;
		var settings = $.extend({
			"language": "en",
			"selected": "",
			"selected_color": "#007dc5",
			"disabled": true
		}, options );

		var weekdays = [];
		    weekdays["en"] = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
		    weekdays["pt_BR"] = [ "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab" ];

		var week_hours = [];
		for (var i = 0; i < 24; i++) {
			if (i < 10) i = "0" + i;
			week_hours.push(i);
		}

		if (!weekdays[settings.language]) {
			settings.language = "en";
		}

		var getTable = function(selected) {
			table =  "<input type='hidden' name='selected_week_hours' value='"+selected+"' id='SelectedHours' />";
			table += "<table class='table table-bordered hours table "+((settings.disabled) ? "disabled" : "")+"'>";
			table += "<thead>";
			table += "<tr>";
			table += "<th><input name='plugin_enable' id='plugin_enable' type='checkbox' "+((!settings.disabled) ? "checked" : "")+" /></th>";
			for (var i = 0; i < week_hours.length; i++) {
				table += "<th class='hour text-center' colspan='2'>" + week_hours[i] + "</th>";
			}
			table += "</tr>";
			table += "</thead>";
			table += "</tbody>";
			for (var i = 0; i < 7; i++) {
				table += "<tr class='day_"+i+"'><td class='day'>" + weekdays[settings.language][i] + "</td>";
				for (var j = 0; j < week_hours.length; j++) {
					table += "<td class='hour_" + j + " min_0'></td>";
					table += "<td class='hour_" + j + " min_30'></td>";
				}
				table += "</tr>";
			}
			table += "</tbody>";
			table += "</table>";
			return table;
		};
		var decode_selected_hour = function (item) {
			var hour = 0;
			var classes = item.attr('class').split(' ');
			$.each(classes, function(i, cls) {
				if (cls.indexOf('hour_') == 0) {
					hour += parseInt(cls.split('_')[1], 10) * 100;
				} else if (cls == 'min_30') {
					hour += 30;
				}
			});
			return hour;
		}
		var add_hours_to_input = function() {
			if ($('#plugin_enable:checked').length == 0) {
				$('#SelectedHours').val('');
				return;
			}
			var res = new Array();
			var day = 0;
			$('table.hours tr').not(':first').each(function(i, tr) {
				var base = $(tr).children('td[class^=hour].selected:first');
				while (base.length) {
					var prefix = day + '-' + decode_selected_hour(base) + '-';
					var first_not = base.nextAll().not('.selected').filter(':first');
					if (first_not.length) {
						res.push(prefix + decode_selected_hour(first_not));
						base = first_not.nextAll('.selected:first');
					} else {
						res.push(prefix + '2400');
						break;
					}
				}
				day++;
			});
			$('#SelectedHours').val(res.join(','));
		}
		var change_color = function(element) {
			if (element) {
				if (!element.hasClass("selected")) {
					element.removeAttr("style");
				} else {
					element.css("background-color", settings.selected_color);
				}
			} else {
				$('table.hours tbody tr').find('td[class^=hour]').each(function() {
					if ($('table.hours').hasClass('disabled') || !$(this).hasClass("selected")) {
						$(this).removeAttr("style");
					} else if ($(this).hasClass("selected")) {
						$(this).css("background-color", settings.selected_color);
					}
				});
			}
		}

		var table = getTable(options.selected);
		$plugin.html(table);

		$.each($('#SelectedHours').val().split(','), function(i, hour) {
			var tmp = hour.split('-');
			var start = parseInt(tmp[1], 10);
			start = Math.floor(start / 100) * 2 + (start % 100 ? 1 : 0);
			var end = parseInt(tmp[2], 10);
			end = Math.floor(end / 100) * 2 + (end % 100 ? 1 : 0);
			$('table.hours tr.day_' + tmp[0] + ' td[class^=hour]').each(function(i, td) {
				if (i >= start && i < end)
					$(td).addClass('selected');
			});
		});
		change_color();

		$('#plugin_enable').change(function() {
			if ($('#plugin_enable:checked').length) {
				$('table.hours').removeClass('disabled');
			} else {
				$('table.hours').addClass('disabled');
			}
			change_color();
		});
		$('table.hours td[class^=hour]').click(function() {
			if (!$('table.hours').hasClass('disabled')) {
				$(this).toggleClass('selected');
				if ($(this).hasClass('selected')) {
					$(this).css("background-color", settings.selected_color);
				} else {
					$(this).removeAttr("style");
				}
			}
			change_color($(this));
			add_hours_to_input();
		});
		$('table.hours td.day').click(function() {
			if (!$('table.hours').hasClass('disabled')) {
				if ($(this).parent().find('td[class^=hour]').hasClass('selected')) {
					$(this).parent().find('td[class^=hour]').removeClass('selected');
				} else {
					$(this).parent().children('td[class^=hour]').addClass('selected');
				}
			}
			change_color();
			add_hours_to_input();
		});
		$('table.hours th.hour').click(function() {
			if (!$('table.hours').hasClass('disabled')) {
				var hour = 'hour_' + parseInt($(this).html(), 10);
				if ($('table.hours td.' + hour).filter('.selected:first').length) {
					$('table.hours td.' + hour).removeClass('selected');
				} else {
					$('table.hours td.' + hour).addClass('selected');
				}
			}
			change_color();
			add_hours_to_input();
		});
	}
}( jQuery ));

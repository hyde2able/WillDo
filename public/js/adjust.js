// forked from sugyan's "簡易住所入力補完" http://jsdo.it/sugyan/address
$(function() {
    var geocoder = new google.maps.Geocoder();
 
    var input = $('#address');
    var list  = $('<ul>');
    input.parent().append(list);
 
    var prev = null, changed = false;
    input.bind('keyup', function() {
        if (changed) return;
        changed = true;
        setTimeout(function() {
            changed = false;
            var value = input.val();
            if (value == prev) return;
            prev = value;
            search_by_word(value);
        }, 1000);
    });
    var selected = -1;
    input.bind('keydown', function(event) {
        if (event.keyCode == 38 || event.keyCode == 40) {
            if (event.keyCode == 38) selected = Math.max(selected - 1, 0);
            if (event.keyCode == 40) selected = Math.min(selected + 1, list.children().length - 1);
            list.children().each(function(i, e) {
                $(e).css('background-color', (i == selected ? '#CCCCCC' : '#FFFFFF'));
            });
            return false;
        }
        if (event.keyCode == 39 && selected != -1) {
            $(list.children()[selected]).find('a').click();
        }
        return true;
    });
    function search_by_word(address) {
        geocoder.geocode({
            address: address,
            region: '.jp',
            language: 'ja'
        }, function(results, status) {
            if (status != 'OK') return;
            var candidates = [];
            for (var i = 0, l = results.length; i < l; i++) {
                var political = false;
                for (var j = 0; j < results[i].types.length; j++) {
                    if (results[i].types[j] == 'political') political = true;
                }
                if (! political) continue;
                var array = [];
                for (var j = results[i].address_components.length - 1; j >= 0; j--) {
                    var component = results[i].address_components[j];
                    if (component.types[0] != 'country') {
                        array.push(component.long_name);
                    }
                }
                candidates.push(array.join(' '));
            }
            update_list(candidates);
        });
    }
    function update_list(candidates) {
        selected = -1;
        list.children().remove();
        $.each(candidates, function(i, candidate) {
            list.append($('<li>').css({
                'list-style': 'none',
                'font-size': 'small',
                'margin': 0
            }).append($('<a>', { href: '#' }).click(function() {
                input.val($(this).text());
                input.focus();
                return false;
            }).text(candidate)));
        });
    }
});
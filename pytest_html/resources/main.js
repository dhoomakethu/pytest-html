/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

function toArray(iter) {
    if (iter === null) {
        return null;
    }
    return Array.prototype.slice.call(iter);
}

function find(selector, elem) {
    if (!elem) {
        elem = document;
    }
    return elem.querySelector(selector);
}

function find_all(selector, elem) {
    if (!elem) {
        elem = document;
    }
    return toArray(elem.querySelectorAll(selector));
}

function sort_column(elem) {
    toggle_sort_states(elem);
    var colIndex = toArray(elem.parentNode.childNodes).indexOf(elem);
    var key;
    if (elem.classList.contains('numeric')) {
        key = key_num;
    } else if (elem.classList.contains('result')) {
        key = key_result;
    } else {
        key = key_alpha;
    }
    sort_table(elem, key(colIndex));
}

addEventListener("DOMContentLoaded", function() {
    reset_sort_headers();

    split_extra_onto_two_rows();
    sort_column(find('.initial-sort'));

    find_all('.col-links a.image').forEach(function(elem) {
        elem.addEventListener("click",
                              function(event) {
                                  var node = elem;
                                  while (node && !node.classList.contains('results-table-row')) {
                                      node = node.parentNode;
                                  }
                                  if (node != null) {
                                      if (node.nextSibling &&
                                          node.nextSibling.classList.contains("extra")) {
                                          var href = find('.image img', node.nextSibling).src;
                                          window.open(href);
                                      }
                                  }
                                  event.preventDefault();
                              }, false)
    });

    find_all('.image a').forEach(function(elem) {
        elem.addEventListener("click",
                              function(event) {
                                  window.open(find('img', elem).getAttribute('src'));
                                  event.preventDefault();
                              }, false)
    });

    find_all('.sortable').forEach(function(elem) {
        elem.addEventListener("click",
                              function(event) {
                                  sort_column(elem);
                              }, false)
    });

});

function sort_table(clicked, key_func) {
    one_row_for_data();
    var rows = find_all('.results-table-row');
    var reversed = !clicked.classList.contains('asc');

    var sorted_rows = sort(rows, key_func, reversed);

    var parent = document.getElementById('results-table-body');
    sorted_rows.forEach(function(elem) {
        parent.appendChild(elem);
    });

    split_extra_onto_two_rows();
}

function sort(items, key_func, reversed) {
    var sort_array = items.map(function(item, i) {
        return [key_func(item), i];
    });
    var multiplier = reversed ? -1 : 1;

    sort_array.sort(function(a, b) {
        var key_a = a[0];
        var key_b = b[0];
        return multiplier * (key_a >= key_b ? 1 : -1);
    });

    return sort_array.map(function(item) {
        var index = item[1];
        return items[index];
    });
}

function key_alpha(col_index) {
    return function(elem) {
        return elem.childNodes[col_index].firstChild.data.toLowerCase();
    };
}

function key_num(col_index) {
    return function(elem) {
        return parseFloat(elem.childNodes[col_index].firstChild.data);
    };
}

function key_result(col_index) {
    return function(elem) {
        var strings = ['Error', 'Failed', 'XFailed', 'XPassed', 'Skipped',
                       'Passed'];
        return strings.indexOf(elem.childNodes[col_index].firstChild.data);
    };
}

function reset_sort_headers() {
    find_all('.sort-icon').forEach(function(elem) {
        elem.parentNode.removeChild(elem);
    });
    find_all('.sortable').forEach(function(elem) {
        var icon = document.createElement("div");
        icon.className = "sort-icon";
        icon.textContent = "vvv";
        elem.insertBefore(icon, elem.firstChild);
        elem.classList.remove("desc", "active");
        elem.classList.add("asc", "inactive");
    });
}

function toggle_sort_states(elem) {
    //if active, toggle between asc and desc
    if (elem.classList.contains('active')) {
        elem.classList.toggle('asc');
        elem.classList.toggle('desc');
    }

    //if inactive, reset all other functions and add ascending active
    if (elem.classList.contains('inactive')) {
        reset_sort_headers();
        elem.classList.remove('inactive');
        elem.classList.add('active');
    }
}

function split_extra_onto_two_rows() {
    find_all('tr.results-table-row').forEach(function(elem) {
        var new_row = document.createElement("tr")
        new_row.className = "extra";
        elem.parentNode.insertBefore(new_row, elem.nextSibling);
        find_all(".extra", elem).forEach(function (td_elem) {
            if (find(".log", td_elem)) {
                new_row.appendChild(td_elem);
                td_elem.colSpan=5;
            } else {
                td_elem.parentNode.removeChild(td_elem);
            }
        });
    });
}

function one_row_for_data() {
    find_all('tr.results-table-row').forEach(function(elem) {
        if (elem.nextSibling.classList.contains('extra')) {
            toArray(elem.nextSibling.childNodes).forEach(
                function (td_elem) {
                    elem.appendChild(td_elem);
                })
        } else {
            var new_td = document.createElement("td");
            new_td.className = "extra";
            elem.appendChild(new_td);
        }
    });
}

/*!
 * Semantic Graphael JavaScript Library v0.1
 *
 * Copyright 2016 Paul Tournemaine
 * Released under the MIT license
 *
 * Date: 2016-01-04T16:53Z
 */
/* global Raphael */

(function ($) {

    // verify Raphael is available
    if (typeof Raphael === 'undefined') {
	warn("Please, import Raphael.js");
	return;
    }

    // verify Raphael filter is available
    if (typeof Raphael.filterOps === "undefined") {
	warn("Please, import Raphael-SVG-Filter.js");
	return;
    }



    var methods = {
	/**
	 * Init the graph
	 * @param {object} options
	 * @returns {each}
	 */
	init: function (options) {
	    debug("SemanticGraphael init");

	    var settings = $.extend({}, $.fn.semanticGraphael.default.param, options);

	    debug("Init Setting");
	    debug(settings);

	    return this.each(function () {
		debug("SemanticGraphael Created On " + $(this).attr('id'));

		// creation of the svg DOM 
		var paper = new Raphael(this, $(this).width(), $(this).height());
		$(this).data("semanticGraphael_paper", paper);
		var itemSet = paper.set();
		var id = 0;
		var central = addItem(paper, itemSet, settings.centralItem.imgUrl, settings.centralItem.label, paper.width / 2, paper.height / 2);
		var connections = addConnections(paper, itemSet, central, settings.connections);

		$(this).data("semanticGraphael_paper", paper);
	    });
	},
	/**
	 * Display the SemanticGraphael version
	 * @returns {undefined}
	 */
	version: function () {
	    console.log("SemanticGraphael v" + $.fn.semanticGraphael.version);
	    return $.fn.semanticGraphael.version;
	},
	/**
	 * Return the paper used for this graph
	 * @returns {RaphaelPaper}
	 */
	getPaper: function () {
	    return $(this).data("semanticGraphael_paper");
	}
    };

    $.fn.semanticGraphael = function (methodOrOptions) {
	if (methods[methodOrOptions]) {
	    return methods[ methodOrOptions ].apply(this, Array.prototype.slice.call(arguments, 1));
	} else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
	    // Default to "init"
	    return methods.init.apply(this, arguments);
	} else {
	    $.error('Method ' + methodOrOptions + ' does not exist on jQuery.semanticGraphaels');
	}
    };

    /**
     * Display a warning 
     * @param {string} message
     * @returns {undefined}
     */
    function warn(message) {
	if (window.console && window.console.warn) {
	    window.console.warn(message);
	}
    }

    /**
     * Display a message if semanticGraphael is in debug mode
     * @param {string|object|numbers} message
     * @returns {undefined}
     */
    function debug(message) {
	if ($.fn.semanticGraphael.default.debug && window.console && window.console.log) {
	    window.console.log(message);
	}
    }


    /**
     * Add an item centered on (x,y)
     * @param {RaphaelPaper} paper
     * @param {RaphaelItemSet} itemSet
     * @param {string} imgUrl
     * @param {string} name
     * @param {Number} x
     * @param {Number} y
     * @returns {RaphaelItemSet}
     */
    function addItem(paper, itemSet, imgUrl, name, x, y) {
	// get parameters
	var imgSize = $.fn.semanticGraphael.default.ItemOptions.imgSize;
	var margin = $.fn.semanticGraphael.default.ItemOptions.textMargin;
	var fontSize = $.fn.semanticGraphael.default.ItemOptions.fontSize;

	// calculate coord to be centered on (x,y)
	var imgX, imgY, textX, textY;
	imgX = x - (imgSize / 2);
	imgY = y - (imgSize + margin + fontSize) / 2;
	textX = imgX + (imgSize / 2);
	textY = imgY + imgSize + margin;

	// create the image and the text in an itemSet
	var set = paper.set();
	var img = paper.image(imgUrl, imgX, imgY, imgSize, imgSize);
	var text = paper.text(textX, textY, name).attr({'font-size': fontSize});
	set.push(img);
	set.push(text);
	itemSet.push(set);

	// return the item itemSet
	return set;
    }

    /**
     * Add connections to the central item
     * @param {RaphaelPaper} paper
     * @param {RaphaelItemSet} itemSet
     * @param {RaphaelItem} centralItem
     * @param {RaphaelItem[]} connections
     * @returns {object{items,connections}}
     */
    function addConnections(paper, itemSet, centralItem, connections) {
	var ret = {
	    items: [],
	    connections: []
	};
	// nb de connection connections.length;
	var angle = 360 / connections.length;
	var radius = getPaperRadius(paper);
	var origin = getCentralItemOrigin(centralItem);
	debug("origin");
	debug(origin);




	debug(connections.length + " items with a rayon of " + radius + " pixels and " + angle + " ° per item");

	var actualAngle = 0;
	$.each(connections, function (index, item) {
	    var conn = addConnection(paper, itemSet, centralItem, item, origin, radius, actualAngle);

	    ret.connections.push(conn.connection);
	    ret.items.push(conn.item);
	    actualAngle += angle;
	});

	return ret;
    }

    /**
     * Add a connection item
     * @param {RaphaelPaper} paper
     * @param {RaphaelItemSet} itemSet
     * @param {RaphaelItem} centralItem
     * @param {object{imgUrl,label,connectLabel} item
     * @param {RaphaelItem} origin
     * @param {Number} radius
     * @param {Number} angle
     * @returns {object{item,connection}}
     */
    function addConnection(paper, itemSet, centralItem, item, origin, radius, angle) {
	var pos = getItemPosition(origin, radius, angle);
	var rItem = addItem(paper, itemSet, item.imgUrl, item.label, pos.x, pos.y);
	var conn = paper.connection(centralItem, rItem, "#eee", item.connectLabel);

	return {item: rItem, connection: conn};
    }

    /**
     * Calculate the paper radius according to the parameter and the paper siz
     * @param {RaphaelPaper} paper
     * @returns {Number}
     */
    function getPaperRadius(paper) {
	// get parameters values
	var imgSize = $.fn.semanticGraphael.default.ItemOptions.imgSize;
	var verticalMargin = $.fn.semanticGraphael.default.ItemOptions.verticalMargin;
	var textMargin = $.fn.semanticGraphael.default.ItemOptions.textMargin;
	var horizontalMargin = $.fn.semanticGraphael.default.ItemOptions.horizontalMargin;

	// calculate the radius
	return Math.min((paper.width / 2) - imgSize - verticalMargin, ((paper.height / 2) - (imgSize + horizontalMargin + textMargin)));
    }


    /**
     * Return the item center point 
     * @param {RaphaelObject} centralItem
     * @returns {object{x,y}}
     */
    function getCentralItemOrigin(centralItem) {
	var bbox = centralItem.getBBox();
	return {
	    x: (bbox.x + bbox.x2) / 2,
	    y: (bbox.y + bbox.y2) / 2
	};
    }

    /**
     * return the item position according to the center ,the angle and the radius
     * @param {object} origin
     * @param {int} radius
     * @param {int} angle
     * @returns object{x,y}
     */
    function getItemPosition(origin, radius, angle) {
	// get the delta x and y
	var dx = Math.cos(angle * Math.PI / 180) * radius;
	var dy = Math.sin(angle * Math.PI / 180) * radius;

	// return the positionobject considering the origin position and dx and dy
	return {
	    x: (origin.x + dx),
	    y: (origin.y + dy)
	};
    }

    function isBelow(a, b, margin) {
	return b.y2 + margin < a.y;
    }

    function isAbove(a, b, margin) {
	return a.y2 + margin < b.y;
    }

    function isOnRight(a, b, margin) {
	return b.x2 + margin < a.x;
    }

    function isOnLeft(a, b, margin) {
	return a.x2 + margin < b.x;
    }

    /**
     * Return the path coord between two object with a margin
     * @param {RaphaelObject} a
     * @param {RaphaelObject} b
     * @param {int} margin
     * @returns [] path
     */
    function getPathAToB(a, b, margin) {
	// get A center point
	var ABBox = a.getBBox();
	var centAx = (ABBox.x + ABBox.x2) / 2;
	var centAy = (ABBox.y + ABBox.y2) / 2;

	// get B center point
	var BBBox = b.getBBox();
	var centBx = (BBBox.x + BBBox.x2) / 2;
	var centBy = (BBBox.y + BBBox.y2) / 2;

	// get the line equation gettting through A center point and B center point 
	// get the slope
	var slopeXOY = (centBy - centAy) / (centBx - centAx);	// coordinate system XOY
	var slopeYOX = (centBx - centAx) / (centBy - centAy);	// coordinate system YOX
	// get the intercept
	var interceptXOY = centBy - (centBx * slopeXOY);    // coordinate system XOY
	var interceptYOX = centBx - (centBy * slopeYOX);    // coordinate system YOX
	
	// init return variable 
	var x1 = null, x2 = null, y1 = null, y2 = null;

	var calculated = false; // the point hasn't been calculated yet

	if (ABBox.x2 + margin < BBBox.x) { // A is on the left of B 
	    x1 = ABBox.x2 + margin;
	    x2 = BBBox.x - margin;
	} else if (BBBox.x2 + margin < ABBox.x) { // A is on the right of B 
	    x1 = BBBox.x2 + margin;
	    x2 = ABBox.x - margin;
	} else if (ABBox.y2 + margin < BBBox.y) { // A is above B 
	    y1 = ABBox.y2 + margin;
	    y2 = BBBox.y - margin;
	} else if (BBBox.y2 + margin < ABBox.y) { // A is below B 
	    y1 = BBBox.y2 + margin;
	    y2 = ABBox.y - margin;
	}


	if (!calculated && x1 !== null && x2 !== null) { // we know x1 and x2
	    // use coordinate system XOY to calc y1 and y2
	    y1 = x1 * slopeXOY + interceptXOY;
	    y2 = x2 * slopeXOY + interceptXOY;
	    // now it has been calculated
	    calculated = true;
	} else if (!calculated && y1 !== null && y2 !== null) { // not calculated yet and we know y1 and y2
	    //  use coordinate system YOX to calc x1 and x2
	    x1 = y1 * slopeYOX + interceptYOX;
	    x2 = y2 * slopeYOX + interceptYOX;
	}
	// return the two points for the path
	return {x1: x1, y1: y1, x2: x2, y2: y2};
    }

    Raphael.fn.connection = function (obj1, obj2, line, linkName) {
	var text = null;
	// we have an object in the first parameter ( in case of update, because obj1 or obj2 was moved )
	if (obj1.line && obj1.from && obj1.to) {
	    // get back the original objects 
	    line = obj1;
	    linkName = line.linkName;
	    text = line.text;
	    obj1 = line.from;
	    obj2 = line.to;
	}

	debug("connection  " + linkName + " between" + obj1 + " and " + obj2);
	debug(obj1);
	debug(obj2);

	// get the two point between which we gonna draw the path 
	var point = getPathAToB(obj1, obj2, $.fn.semanticGraphael.default.connectionOptions.margin);
	debug("point");
	debug(point);
	var path = ["M", point.x1, point.y1, "L", point.x2, point.y2].join(",");
	// if we already have a line ( in case of update too )
	if (line && line.line) {
	    // just update the path
	    line.line.attr({path: path});
	    text.attr({x: ((point.x1 + point.x2) / 2), y: ((point.y1 + point.y2) / 2)});
	} else { //  otherwise connection creation 
	    // line creation
	    var ret = {
		linkName: linkName,
		line: this.path(path).attr($.fn.semanticGraphael.default.connectionOptions.lineAttr),
		from: obj1,
		to: obj2
	    };

	    // text creation 
	    var t = this.text((point.x1 + point.x2) / 2, (point.y1 + point.y2) / 2, linkName);
	    // add the filter on the text 
	    t.filterInstall(getFontBackgoundFilter(this));

	    // add the text in the returned object 
	    ret.text = t;

	    // add the line node attr 
	    $(ret.line.node).attr($.fn.semanticGraphael.default.connectionOptions.lineNodeAttr);

	    // return the connection object
	    return ret;
	}




    };

    /**
     * Raffraichit les connections après un move 
     * @param {RaphaelItemSet[]} connections
     * @returns {undefined}
     */
    Raphael.fn.refreshConnection = function (connections) {
	for (var i = connections.length; i--; ) {
	    connection(connections[i]);
	}
    };


    /**
     * 
     * @param {RaphaelPaper} paper
     * @returns {RaphaelFilter}
     */
    function getFontBackgoundFilter(paper) {
	// if no filter is available, we create a default one
	if ($.fn.semanticGraphael.default.connectionOptions.fontFilter === null) {
	    // create the filter
	    var fontBackgroundFilter = paper.filterCreate("fontBackgroundFilter");

	    // add the background color to the filter
	    var feFlood = new Raphael.filterOps.svgFilter('feFlood', {"flood-color": "white"});
	    fontBackgroundFilter.appendOperation(feFlood);

	    // add the composite effect to the sourceGraphic to the filter
	    var feComposite = new Raphael.filterOps.svgFilter('feComposite', {in: "SourceGraphic"});
	    fontBackgroundFilter.appendOperation(feComposite);

	    // store it in the global variable 
	    $.fn.semanticGraphael.default.connectionOptions.fontFilter = fontBackgroundFilter;
	}

	// return the global variable 
	return $.fn.semanticGraphael.default.connectionOptions.fontFilter;
    }


    /**
     * Default properties
     */
    $.fn.semanticGraphael.default = {
	/**
	 * Item size options
	 */
	ItemOptions: {
	    imgSize: 64,
	    textMargin: 10,
	    verticalMargin: 15,
	    horizontalMargin: 15,
	    fontSize: 14
	},
	/**
	 * connection attributes options
	 */
	connectionOptions: {
	    /**
	     * Margin between the line and the two connected objects 
	     */
	    margin: 5,
	    /**
	     * SVG attributes added on the line
	     */
	    lineAttr: {
		fill: "none",
		opacity: 0.6,
		'stroke-width': 2
	    },
	    /**
	     * Attribute added on the node of the line
	     */
	    lineNodeAttr: {
		'stroke-dasharray': '10 4',
		'stroke-linecap': 'round'
	    },
	    /**
	     * Filter added on the text 
	     * You can create a new filter on the paper before initializing the graph 
	     * and then store it in this variable
	     */
	    fontFilter: null
	},
	/**
	 * If true , debug informations are logged in the console
	 */
	debug: false,
	/**
	 * init parameters merged with parameters passed to the init function
	 */
	initParam: {
	    /**
	     * Main item, positionned ,centered in the graph
	     */
	    centralItem: {
	    },
	    /**
	     * item array containing item connected to the central item
	     */
	    connections: [],
	    /**
	     * If true, the graph is movable 
	     */
	    movable: true
	}
    };

    /**
     * Library version 
     */
    $.fn.semanticGraphael.version = "0.1";

}(jQuery));
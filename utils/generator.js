var xkcd = require('xkcd');
var request = require('request');
const cheerio = require('cheerio');
const debug = true;
//fall back in case most recent check fails. This is the xkcd on 5/28/17
var latestComicNumXkcd = 1842;
var latestComicAbstruse = 575;
//Sets the most recent comic indices for some comic sites.
generateInitNums();
module.exports.getComic = function (comicsToSelectFrom, returnRandomComic) {
    let numComics = 6;
    var selectedComic = getRandomIntInclusive(1, numComics);
    var allComicsAreZero = true;
    if (comicsToSelectFrom) {
        for (var comic of comicsToSelectFrom) {
            if (comic) {
                allComicsAreZero = false;
                break;
            }
        }
        if (!allComicsAreZero) {
            while (comicsToSelectFrom[selectedComic - 1] == 0) {
                selectedComic = getRandomIntInclusive(1, numComics);
            }
        }
    }
    var comic = {};
    switch (selectedComic) {
        case 1:
            comic.publisher = "xkcd";
            let selectedXKCD = getRandomIntInclusive(1, latestComicNumXkcd);
            //No dediated xkcd because there is a wrapper already
            xkcd(selectedXKCD, function (data) {
                comic.publisherUrl = "https://xkcd.com/" + selectedXKCD;
                comic.img = data.img;
                comic.title = data.safe_title;
                comic.alt = data.alt;
                returnRandomComic(comic);
            });
            break;
        case 2:
            comic.publisher = "Cyanide & Happiness";
            getCyanideAndHappiness(function (url, title, origUrl) {
                comic.img = url;
                title = title.capitalize();
                comic.title = title;
                comic.publisherUrl = origUrl;
                returnRandomComic(comic);
            });
            break;
        case 3:
            comic.publisher = "Dilbert";
            getDilbert(function (url, title, origUrl) {
                comic.img = url;
                comic.title = title;
                if (title === ' - Dilbert by Scott Adams') {
                    comic.title = 'By Scott Adams';
                }
                comic.publisherUrl = origUrl;
                returnRandomComic(comic);
            });
            break;
        case 4:
            comic.publisher = "SMBC";
            getSMBC(function (url, title, origUrl) {
                comic.img = url;
                comic.title = title;
                comic.publisherUrl = origUrl;
                returnRandomComic(comic);
            });
            break;
        case 5:
            comic.publisher = "Penny Arcade";
            getPennyArcade(function (url, title, origUrl) {
                comic.img = url;
                comic.title = title;
                comic.publisherUrl = origUrl;
                returnRandomComic(comic);
            });
            break;
        case 6:
            comic.publisher = "Abstruse Goose";
            getAbstruseGoose(function (url, title, origUrl, alt) {
                comic.img = url;
                comic.title = title;
                comic.publisherUrl = origUrl;
                //Alt text is sometimes there - if it exists, set it on the object
                if (alt != undefined && alt != "") {
                    comic.alt = alt;
                }
                returnRandomComic(comic);
            });
            break;
    }
};

function getCyanideAndHappiness(returnComic) {
    var url = 'http://explosm.net/comics/random';
    request({
        url: url
    }, function (err, res, body) {
        if (debug) {
            console.log(res.request.uri.href);
        }
        const $ = cheerio.load(body);
        let comicUrl = $("#main-comic").attr('src');
        let title = $(".author-credit-name").text();
        returnComic(comicUrl, title, res.request.uri.href);
    });
}

function getDilbert(returnComic) {
    //generate random date, from 1989 (very first dilbert comic)
    //Additionally, dilbert automatically shows the first comic if you choose one from BEFORE that date
    //So no additional verification is needed
    var now = new Date();
    var year = getRandomIntInclusive(1989, now.getFullYear());
    var month = getRandomIntInclusive(1, 12);
    var day = getRandomIntInclusive(1, 31);
    var dateString = year + '-' + month + '-' + day;
    var testDate = new Date(dateString);
    //If it's not a valid date OR if it's in the future, get a new random date
    while (!testDate.isValid() || testDate > now) {
        year = getRandomIntInclusive(1989, now.getFullYear());
        month = getRandomIntInclusive(1, 12);
        day = getRandomIntInclusive(1, 31);
        dateString = year + '-' + month + '-' + day;
        testDate = new Date(dateString);
    }
    var url = 'http://dilbert.com/strip/' + dateString;
    request({
        url: url
    }, function (err, res, body) {
        if (debug) {
            console.log(res.request.uri.href);
        }
        const $ = cheerio.load(body);
        let comic = $("img.img-comic");
        let comicUrl = $(comic).attr('src');
        let title = $(comic).attr('alt');
        //If still undefined for some reason, try all this again
        if (comic == undefined) {
            getDilbert(returnComic);
            return;
        }
        returnComic(comicUrl, title, url);
    });
}

function getSMBC(returnComic) {
    var url = 'http://www.smbc-comics.com/random.php';
    request({
        url: url
    }, function (err, res, body) {
        if (debug) {
            console.log(res.request.uri.href);
        }
        const $ = cheerio.load(body);
        let comicUrl = $("#cc-comic").attr('src');
        let title = $("#cc-comic").attr('title');
        if (comicUrl == undefined) {
            getSMBC(returnComic);
            return;
        }
        if (comicUrl.startsWith("/")) {
            comicUrl = "http://www.smbc-comics.com" + comicUrl;
        }
        returnComic(comicUrl, title, res.request.uri.href);
    });
}

function getPennyArcade(returnComic) {
    var now = new Date();
    var year = getRandomIntInclusive(1999, now.getFullYear());
    var month = getRandomIntInclusive(1, 12);
    var day = getRandomIntInclusive(1, 31);
    var dateString = year + '/' + month + '/' + day;
    var testDate = new Date(dateString);
    //If it's not a valid date OR if it's in the future OR if it's a weekend
    while (!testDate.isValid() || testDate > now || testDate.getDay() == 0 || testDate.getDay() == 6) {
        year = getRandomIntInclusive(1999, now.getFullYear());
        month = getRandomIntInclusive(1, 12);
        day = getRandomIntInclusive(1, 31);
        dateString = year + '/' + month + '/' + day;
        testDate = new Date(dateString);
    }
    var url = 'https://www.penny-arcade.com/comic/' + dateString;
    request({
        url: url
    }, function (err, res, body) {
        if (debug) {
            console.log(res.request.uri.href);
        }
        const $ = cheerio.load(body);
        let comic = $("#comicFrame > a > img");
        let comicUrl = $(comic).attr('src');
        let title = $(comic).attr('alt');
        if (comicUrl == undefined) {
            getPennyArcade(returnComic);
            return;
        }
        returnComic(comicUrl, title, url);
    });
}

function getAbstruseGoose(returnComic) {
    var randomComic = getRandomIntInclusive(1, latestComicAbstruse);
    var url = 'http://abstrusegoose.com/' + randomComic;
    request({
        url: url
    }, function (err, res, body) {
        if (debug) {
            console.log(res.request.uri.href);
        }
        const $ = cheerio.load(body);
        let comicUrl = $("body > section > img").attr('src');
        let title = $("body > section > h1 > a").text();
        if (comicUrl == undefined) {
            getAbstruseGoose(returnComic);
            return;
        }
        let alt = $("body > section > img").attr('title');
        returnComic(comicUrl, title, res.request.uri.href, alt);
    });
}

//Helpers
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateInitNums() {
    //Sets most recent XKCD on init
    xkcd(function (data) {
        if (data) {
            latestComicNumXkcd = data.num;
        }
    });
    //Sets most recent AbstruseGoose on init
    var abstruseurl = 'http://abstrusegoose.com/';
    request({
        url: abstruseurl
    }, function (err, res, body) {
        if (err) {
            console.log("Error loading abstruse goose");
            latestComicAbstruse = 100;
            return;
        }
        const $ = cheerio.load(body);
        let title = $("body > section > h1 > a").attr('href');
        var parse_title = title.split('/');
        latestComicAbstruse = parseInt(parse_title[3]);
    });
}

//Redefinitions
//To check for valid random dates
Date.prototype.isValid = function () {
    // An invalid date object returns NaN for getTime() and NaN is the only
    // object not strictly equal to itself.
    return this.getTime() === this.getTime();
};
//To capitalize the first letter in a string
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};




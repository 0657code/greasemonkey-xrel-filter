// ==UserScript==
// @name        xREL Release Filter
// @namespace   tag:https://github.com/0657code/greasemonkey-xrel-filter,2015-07-16
// @description Release filter for xREL. Also hides the "new comments" box upon clicking on its title. Special thanks to GarionCZ for his SteamGifts filter script.
// @author      0657_Code
// @include     http://www.xrel.to/movie/*/releases.html*
// @include     http://www.xrel.to/tv/*/releases.html*
// @downloadURL https://github.com/0657code/greasemonkey-xrel-filter/raw/master/xREL_Release_Filter.user.js
// @updateURL   https://github.com/0657code/greasemonkey-xrel-filter/raw/master/xREL_Release_Filter.meta.js
// @version     1.0.1
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

// Constants
{
  var ID_DIV_HEADER = "idDivHeader";
  var ID_DIV_CONTENT = "idDivContent";
  
  var CONST_TYPE_TELESYNC = ' TeleSync';
  var CONST_TYPE_WEBRIP = ' Web-Rip';
  var CONST_TYPE_DVD_RIP = ' DVD-Rip';
  var CONST_TYPE_DVD_SCR = ' DVD-Scr.';
  var CONST_TYPE_DVD = ' DVD-R';
  var CONST_TYPE_HDTV = ' HDTV';
  var CONST_TYPE_BLURAY = ' Blu-ray';
  var CONST_CAT_XVID = 'XviD';
  var CONST_CAT_X264 = 'x264';
  var CONST_CAT_DVD = 'DVD-R';
  var CONST_CAT_HDTV = 'HDTV';
  var CONST_CAT_COMPLETE_HD = 'Compl. HD';
  var CONST_RLSNAME_BDRIP = /BDRip/i;
  var CONST_RLSNAME_720P = /720p/i;
  var CONST_RLSNAME_1080P = /1080p/i;
  var CONST_RLSNAME_COMPLETE_BLURAY = /Complete.Bluray/i;

  var KEY_FILTER_MASTERSWITCH = "filterMasterSwitch";
  var KEY_FILTER_TYPE_TELESYNC = "filterTypeTeleSync";
  var KEY_FILTER_TYPE_WEBRIP = "filterTypeWebRip";
  var KEY_FILTER_TYPE_DVD_RIP = "filterTypeDvdRip";
  var KEY_FILTER_TYPE_DVD_SCR = "filterTypeDvdScr";
  var KEY_FILTER_TYPE_DVD = "filterTypeDvd";
  var KEY_FILTER_TYPE_HDTV = "filterTypeHdtv";
  var KEY_FILTER_TYPE_BLURAY = "filterTypeBluRay";
  var KEY_FILTER_CAT_XVID = "filterCatXvid";
  var KEY_FILTER_CAT_X264 = "filterCatX264";
  var KEY_FILTER_CAT_DVD = "filterCatDvd";
  var KEY_FILTER_CAT_HDTV = "filterCatHdtv";
  var KEY_FILTER_CAT_COMPLETE_HD = "filterCatCompleteHd";
  var KEY_FILTER_RLSNAME_BDRIP = "filterRlsnameBdRip";
  var KEY_FILTER_RLSNAME_720P = "filterRlsname720p";
  var KEY_FILTER_RLSNAME_1080P = "filterRlsname1080p";
  var KEY_FILTER_RLSNAME_COMPLETE_BLURAY = "filterRlsnameCompleteBluRay";
  var KEY_HIDE_NEW_COMMENTS = "hideNewComments";
  
  var DEFAULT_FILTER_STATUS = false;
}

// Variables, settings
{
  var HIDE_FILTER_DEFAULT = true;
  var HIDE_NEW_COMMENTS_DEFAULT = true;
  var HIDE_BOTTOM_CLEARFIX = true; // autimatically deactivated if there more than one page
  var HIDE_BOTTOM_BANNER = false;
  
  var FILTER_US_RELEASE = false;
  var FILTER_SEASON_WHITELIST = [
  ]
  var FILTER_GROUP_WHITELIST = [
  ]

  var filter_MasterSwitch = GM_getValue(KEY_FILTER_MASTERSWITCH, DEFAULT_FILTER_STATUS);
  var filter_Type_TeleSync = GM_getValue(KEY_FILTER_TYPE_TELESYNC, DEFAULT_FILTER_STATUS);
  var filter_Type_WebRip = GM_getValue(KEY_FILTER_TYPE_WEBRIP, DEFAULT_FILTER_STATUS);
  var filter_Type_DvdRip = GM_getValue(KEY_FILTER_TYPE_DVD_RIP, DEFAULT_FILTER_STATUS);
  var filter_Type_DvdScr = GM_getValue(KEY_FILTER_TYPE_DVD_SCR, DEFAULT_FILTER_STATUS);
  var filter_Type_Dvd = GM_getValue(KEY_FILTER_TYPE_DVD, DEFAULT_FILTER_STATUS);
  var filter_Type_Hdtv = GM_getValue(KEY_FILTER_TYPE_HDTV, DEFAULT_FILTER_STATUS);
  var filter_Type_BluRay = GM_getValue(KEY_FILTER_TYPE_BLURAY, DEFAULT_FILTER_STATUS);
  var filter_Cat_Xvid = GM_getValue(KEY_FILTER_CAT_XVID, DEFAULT_FILTER_STATUS);
  var filter_Cat_X264 = GM_getValue(KEY_FILTER_CAT_X264, DEFAULT_FILTER_STATUS);
  var filter_Cat_Dvd = GM_getValue(KEY_FILTER_CAT_DVD, DEFAULT_FILTER_STATUS);
  var filter_Cat_Hdtv = GM_getValue(KEY_FILTER_CAT_HDTV, DEFAULT_FILTER_STATUS);
  var filter_Cat_CompleteHd = GM_getValue(KEY_FILTER_CAT_COMPLETE_HD, DEFAULT_FILTER_STATUS);
  var filter_Rlsname_BdRip = GM_getValue(KEY_FILTER_RLSNAME_BDRIP, DEFAULT_FILTER_STATUS);
  var filter_Rlsname_720p = GM_getValue(KEY_FILTER_RLSNAME_720P, DEFAULT_FILTER_STATUS);
  var filter_Rlsname_1080p = GM_getValue(KEY_FILTER_RLSNAME_1080P, DEFAULT_FILTER_STATUS);
  var filter_Rlsname_CompleteBluRay = GM_getValue(KEY_FILTER_RLSNAME_COMPLETE_BLURAY, DEFAULT_FILTER_STATUS);

  var contentDivStyleDisplay;
  var commentDivStyleDisplay;
}

// Filter function
filterReleases();
function filterReleases() {
  var releases = getReleases();

  // Remove the filtering
  for (i = 0; i < releases.length; i++)
    removeFiltering(releases[i]);
  
  if(filter_MasterSwitch)
  {
    var releasesToRemove = [];

    // Filter loop, fills releasesToRemove array
    for (i = 0; i < releases.length; i++) {
      // Remove the filtering
      removeFiltering(releases[i]);

      // Type filters
      {
        if (filter_Type_TeleSync) {
          if (isReleaseType(releases[i], CONST_TYPE_TELESYNC)) {
            releasesToRemove.push(releases[i]);
            continue;
          }
        }
        if (filter_Type_WebRip) {
          if (isReleaseType(releases[i], CONST_TYPE_WEBRIP)) {
            releasesToRemove.push(releases[i]);
            continue;
          }
        }
        if (filter_Type_DvdRip) {
          if (isReleaseType(releases[i], CONST_TYPE_DVD_RIP)) {
            releasesToRemove.push(releases[i]);
            continue;
          }
        }
        if (filter_Type_DvdScr) {
          if (isReleaseType(releases[i], CONST_TYPE_DVD_SCR)) {
            releasesToRemove.push(releases[i]);
            continue;
          }
        }
        if (filter_Type_Dvd) {
          if (isReleaseType(releases[i], CONST_TYPE_DVD)) {
            releasesToRemove.push(releases[i]);
            continue;
          }
        }
        if (filter_Type_Hdtv) {
          if (isReleaseType(releases[i], CONST_TYPE_HDTV)) {
            releasesToRemove.push(releases[i]);
            continue;
          }
        }
        if (filter_Type_BluRay) {
          if (isReleaseType(releases[i], CONST_TYPE_BLURAY)) {
            releasesToRemove.push(releases[i]);
            continue;
          }
        }
      }

      // Category filters
      {
        if (filter_Cat_Xvid) {
          if (isReleaseCat(releases[i], CONST_CAT_XVID)) {
            releasesToRemove.push(releases[i]);
            continue;
          }
        }
        if (filter_Cat_X264) {
          if (isReleaseCat(releases[i], CONST_CAT_X264)) {
            releasesToRemove.push(releases[i]);
            continue;
          }
        }
        if (filter_Cat_Dvd) {
          if (isReleaseCat(releases[i], CONST_CAT_DVD)) {
            releasesToRemove.push(releases[i]);
            continue;
          }
        }
        if (filter_Cat_Hdtv) {
          if (isReleaseCat(releases[i], CONST_CAT_HDTV)) {
            releasesToRemove.push(releases[i]);
            continue;
          }
        }
        if (filter_Cat_CompleteHd) {
          if (isReleaseCat(releases[i], CONST_CAT_COMPLETE_HD)) {
            releasesToRemove.push(releases[i]);
            continue;
          }
        }
      }

      // Releasename filters
      {
        if (filter_Rlsname_BdRip) {
          if (isReleaseName(releases[i], CONST_RLSNAME_BDRIP)) {
            releasesToRemove.push(releases[i]);
            continue;
          }
        }
        if (filter_Rlsname_720p) {
          if (isReleaseName(releases[i], CONST_RLSNAME_720P)) {
            releasesToRemove.push(releases[i]);
            continue;
          }
        }
        if (filter_Rlsname_1080p) {
          if (isReleaseName(releases[i], CONST_RLSNAME_1080P)) {
            releasesToRemove.push(releases[i]);
            continue;
          }
        }
        if (filter_Rlsname_CompleteBluRay) {
          if (isReleaseName(releases[i], CONST_RLSNAME_COMPLETE_BLURAY)) {
            releasesToRemove.push(releases[i]);
            continue;
          }
        }
      }

      // US-Release filter
      if (typeof FILTER_US_RELEASE !== 'undefined' && FILTER_US_RELEASE) {
        if (releases[i].className == "release_item release_us") {
          releasesToRemove.push(releases[i]);
          continue;
        }
      }

      // Season filter
      if (typeof FILTER_SEASON_WHITELIST !== 'undefined' && FILTER_SEASON_WHITELIST.length > 0 && window.location.pathname.search(/\/tv\//i) != -1) {
        if (!isReleaseSeason(releases[i], FILTER_SEASON_WHITELIST)) {
          releasesToRemove.push(releases[i]);
          continue;
        }
      }

      // Group filter
      if (typeof FILTER_GROUP_WHITELIST !== 'undefined' && FILTER_GROUP_WHITELIST.length > 0) {
        if (!isReleaseByGroup(releases[i], FILTER_GROUP_WHITELIST)) {
          releasesToRemove.push(releases[i]);
          continue;
        }
      }
    }

    // Remove the releases in releasesToRemove array
    for (i = 0; i < releasesToRemove.length; i++) {
      releasesToRemove[i].style.display = 'none';
      releasesToRemove[i].nextElementSibling.style.display = 'none';
    }
  }
}

// Parses the release elements from the whole page
function getReleases() {
  var releasesOdd = document.getElementsByClassName('release_item release_odd');
  var releasesEven = document.getElementsByClassName('release_item release_even');
  var releasesUS = document.getElementsByClassName('release_item release_us');
  var releasesHighlight = document.getElementsByClassName('release_item release_highlight');
  var allReleases = [];
  allReleases.push.apply(allReleases, releasesOdd);
  allReleases.push.apply(allReleases, releasesEven);
  allReleases.push.apply(allReleases, releasesUS);
  allReleases.push.apply(allReleases, releasesHighlight);
  return allReleases;
}

function isReleaseType(release, type) {
  var release_type = release.getElementsByClassName('release_type') [0];
  return release_type.firstChild.textContent == type;
}

function isReleaseCat(release, cat) {
  var release_cat = release.getElementsByClassName('release_cat') [0];
  var sub_link = release_cat.getElementsByClassName('sub_link') [0];
  var span = sub_link.getElementsByTagName('span') [0];
  return span.textContent == cat;
}

function isReleaseName(release, filter) {
  var release_title = release.getElementsByClassName('release_title') [0];
  var sub_link = release_title.getElementsByClassName('sub_link') [0];
  var span = sub_link.getElementsByTagName('span') [0];
  return span.textContent.search(filter) != -1;
}

function isReleaseSeason(release, seasonArray) {
  var release_title = release.getElementsByClassName('release_title')[0];
  var sub = release_title.getElementsByClassName('sub') [0];
  for (j = 0; j < seasonArray.length; j++)
    if (sub.textContent.indexOf(seasonArray[j]) != - 1)
      return true;
  return false;
}

function isReleaseByGroup(release, groupArray) {
  var release_grp = release.getElementsByClassName('release_grp')[0];
  for (j = 0; j < groupArray.length; j++)
    if (release_grp.textContent.indexOf(groupArray[j]) != - 1)
      return true;
  return false;
}

// Removes filtering from a given release
function removeFiltering(release) {
  release.style.display = '';
}

// Draws the UI
drawUi();
function drawUi() {
  // HeaderDiv
  {
    // HeaderTextSpan
    {
      var headerTextSpan = document.createElement("span");
      headerTextSpan.appendChild(document.createTextNode(" Filter "/*getFilterCaption()*/));
      headerTextSpan.onclick = function() {
        // Clicking on the header opens/closes the filter details UI
        var contentDiv = document.getElementById(ID_DIV_CONTENT);
        if (contentDiv.style.display !== "none"){
          contentDivStyleDisplay = contentDiv.style.display;
          contentDiv.style.display = "none";
        }
        else{
          contentDiv.style.display = contentDivStyleDisplay;
        }
      };
      // Make unselectable
      if ('unselectable' in headerTextSpan)       // Internet Explorer, Opera
        headerTextSpan.unselectable = !headerTextSpan.unselectable;
      else {
        if (window.getComputedStyle) {
          var style = window.getComputedStyle (headerTextSpan, null);
          if ('MozUserSelect' in style) { // Firefox
            headerTextSpan.style.MozUserSelect = (style.MozUserSelect == "none") ? "text" : "none";
          }
          else {
            if ('webkitUserSelect' in style) {      // Google Chrome and Safari
              headerTextSpan.style.webkitUserSelect = (style.webkitUserSelect == "none") ? "text" : "none";
            }
          }
        }
      }
    }
    
    // HeaderCheckbox
    {
      var headerCheckbox = document.createElement("input");
      headerCheckbox.setAttribute("type", "checkbox");
      headerCheckbox.checked = filter_MasterSwitch;
      headerCheckbox.onclick = function() {
        GM_setValue(KEY_FILTER_MASTERSWITCH, headerCheckbox.checked);
        filter_MasterSwitch = headerCheckbox.checked;
        filterReleases();
      };
    }
    
    var headerDiv = document.createElement("div");
    headerDiv.id = ID_DIV_HEADER;
    headerDiv.style.fontWeight = "700";
    headerDiv.style.paddingTop = "5px";
    headerDiv.style.paddingBottom = "5px";
    headerDiv.style.paddingLeft = "10px";
    headerDiv.style.paddingRight = "10px";
    headerDiv.style.cursor = "pointer";
    headerDiv.style.font = '700 14px/22px "Open Sans",sans-serif';
    headerDiv.appendChild(headerTextSpan);
    headerDiv.appendChild(headerCheckbox);
  }

  // ContentDiv
  {
    // CatDiv
    {
      // XviD
      {
        var catXvidSpan = document.createElement("span");
        catXvidSpan.appendChild(document.createTextNode("XviD"));

        var catXvidCheckbox = document.createElement("input");
        catXvidCheckbox.setAttribute("type", "checkbox");
        catXvidCheckbox.checked = !filter_Cat_Xvid;
        catXvidCheckbox.onclick = function() {
          GM_setValue(KEY_FILTER_CAT_XVID, !catXvidCheckbox.checked);
          filter_Cat_Xvid = !catXvidCheckbox.checked;
          filterReleases();
        };

        var catXvidDiv = document.createElement("div");
        catXvidDiv.appendChild(catXvidSpan);
        catXvidDiv.appendChild(catXvidCheckbox);
      }
      // X264
      {
        var catX264Span = document.createElement("span");
        catX264Span.appendChild(document.createTextNode("X264"));

        var catX264Checkbox = document.createElement("input");
        catX264Checkbox.setAttribute("type", "checkbox");
        catX264Checkbox.checked = !filter_Cat_X264;
        catX264Checkbox.onclick = function() {
          GM_setValue(KEY_FILTER_CAT_X264, !catX264Checkbox.checked);
          filter_Cat_X264 = !catX264Checkbox.checked;
          filterReleases();
        };

        var catX264Div = document.createElement("div");
        catX264Div.appendChild(catX264Span);
        catX264Div.appendChild(catX264Checkbox);
      }
      // DVD
      {
        var catDvdSpan = document.createElement("span");
        catDvdSpan.appendChild(document.createTextNode("DVD-R"));

        var catDvdCheckbox = document.createElement("input");
        catDvdCheckbox.setAttribute("type", "checkbox");
        catDvdCheckbox.checked = !filter_Cat_Dvd;
        catDvdCheckbox.onclick = function() {
          GM_setValue(KEY_FILTER_CAT_DVD, !catDvdCheckbox.checked);
          filter_Cat_Dvd = !catDvdCheckbox.checked;
          filterReleases();
        };

        var catDvdDiv = document.createElement("div");
        catDvdDiv.appendChild(catDvdSpan);
        catDvdDiv.appendChild(catDvdCheckbox);
      }
      // HDTV
      {
        var catHdtvSpan = document.createElement("span");
        catHdtvSpan.appendChild(document.createTextNode("HDTV"));

        var catHdtvCheckbox = document.createElement("input");
        catHdtvCheckbox.setAttribute("type", "checkbox");
        catHdtvCheckbox.checked = !filter_Cat_Hdtv;
        catHdtvCheckbox.onclick = function() {
          GM_setValue(KEY_FILTER_CAT_HDTV, !catHdtvCheckbox.checked);
          filter_Cat_Hdtv = !catHdtvCheckbox.checked;
          filterReleases();
        };

        var catHdtvDiv = document.createElement("div");
        catHdtvDiv.appendChild(catHdtvSpan);
        catHdtvDiv.appendChild(catHdtvCheckbox);
      }
      // Complete HD
      {
        var catCompleteHdSpan = document.createElement("span");
        catCompleteHdSpan.appendChild(document.createTextNode("Compl. HD"));

        var catCompleteHdCheckbox = document.createElement("input");
        catCompleteHdCheckbox.setAttribute("type", "checkbox");
        catCompleteHdCheckbox.checked = !filter_Cat_CompleteHd;
        catCompleteHdCheckbox.onclick = function() {
          GM_setValue(KEY_FILTER_CAT_COMPLETE_HD, !catCompleteHdCheckbox.checked);
          filter_Cat_CompleteHd = !catCompleteHdCheckbox.checked;
          filterReleases();
        };

        var catCompleteHdDiv = document.createElement("div");
        catCompleteHdDiv.appendChild(catCompleteHdSpan);
        catCompleteHdDiv.appendChild(catCompleteHdCheckbox);
      }

      var catDiv = document.createElement("div");
      catDiv.appendChild(document.createTextNode("Category"));
      catDiv.appendChild(catXvidDiv);
      catDiv.appendChild(catX264Div);
      catDiv.appendChild(catDvdDiv);
      catDiv.appendChild(catHdtvDiv);
      catDiv.appendChild(catCompleteHdDiv);
    }

    // TypeDiv
    {
      // TeleSync
      {
        var typeTeleSyncSpan = document.createElement("span");
        typeTeleSyncSpan.appendChild(document.createTextNode("TeleSync"));

        var typeTeleSyncCheckbox = document.createElement("input");
        typeTeleSyncCheckbox.setAttribute("type", "checkbox");
        typeTeleSyncCheckbox.checked = !filter_Type_TeleSync;
        typeTeleSyncCheckbox.onclick = function() {
          GM_setValue(KEY_FILTER_TYPE_TELESYNC, !typeTeleSyncCheckbox.checked);
          filter_Type_TeleSync = !typeTeleSyncCheckbox.checked;
          filterReleases();
        };

        var typeTeleSyncDiv = document.createElement("div");
        typeTeleSyncDiv.appendChild(typeTeleSyncSpan);
        typeTeleSyncDiv.appendChild(typeTeleSyncCheckbox);
      }

      // Web-Rip
      {
        var typeWebRipSpan = document.createElement("span");
        typeWebRipSpan.appendChild(document.createTextNode("Web-Rip"));

        var typeWebRipCheckbox = document.createElement("input");
        typeWebRipCheckbox.setAttribute("type", "checkbox");
        typeWebRipCheckbox.checked = !filter_Type_WebRip;
        typeWebRipCheckbox.onclick = function() {
          GM_setValue(KEY_FILTER_TYPE_WEBRIP, !typeWebRipCheckbox.checked);
          filter_Type_WebRip = !typeWebRipCheckbox.checked;
          filterReleases();
        };

        var typeWebRipDiv = document.createElement("div");
        typeWebRipDiv.appendChild(typeWebRipSpan);
        typeWebRipDiv.appendChild(typeWebRipCheckbox);
      }

      // DVD-Rip
      {
        var typeDvdRipSpan = document.createElement("span");
        typeDvdRipSpan.appendChild(document.createTextNode("DVD-Rip"));

        var typeDvdRipCheckbox = document.createElement("input");
        typeDvdRipCheckbox.setAttribute("type", "checkbox");
        typeDvdRipCheckbox.checked = !filter_Type_DvdRip;
        typeDvdRipCheckbox.onclick = function() {
          GM_setValue(KEY_FILTER_TYPE_DVD_RIP, !typeDvdRipCheckbox.checked);
          filter_Type_DvdRip = !typeDvdRipCheckbox.checked;
          filterReleases();
        };

        var typeDvdRipDiv = document.createElement("div");
        typeDvdRipDiv.appendChild(typeDvdRipSpan);
        typeDvdRipDiv.appendChild(typeDvdRipCheckbox);
      }

      // DVD-Scr
      {
        var typeDvdScrSpan = document.createElement("span");
        typeDvdScrSpan.appendChild(document.createTextNode("DVD-Scr."));

        var typeDvdScrCheckbox = document.createElement("input");
        typeDvdScrCheckbox.setAttribute("type", "checkbox");
        typeDvdScrCheckbox.checked = !filter_Type_DvdScr;
        typeDvdScrCheckbox.onclick = function() {
          GM_setValue(KEY_FILTER_TYPE_DVD_SCR, !typeDvdScrCheckbox.checked);
          filter_Type_DvdScr = !typeDvdScrCheckbox.checked;
          filterReleases();
        };

        var typeDvdScrDiv = document.createElement("div");
        typeDvdScrDiv.appendChild(typeDvdScrSpan);
        typeDvdScrDiv.appendChild(typeDvdScrCheckbox);
      }

      // DVD
      {
        var typeDvdSpan = document.createElement("span");
        typeDvdSpan.appendChild(document.createTextNode("DVD-R"));

        var typeDvdCheckbox = document.createElement("input");
        typeDvdCheckbox.setAttribute("type", "checkbox");
        typeDvdCheckbox.checked = !filter_Type_Dvd;
        typeDvdCheckbox.onclick = function() {
          GM_setValue(KEY_FILTER_TYPE_DVD, !typeDvdCheckbox.checked);
          filter_Type_Dvd = !typeDvdCheckbox.checked;
          filterReleases();
        };

        var typeDvdDiv = document.createElement("div");
        typeDvdDiv.appendChild(typeDvdSpan);
        typeDvdDiv.appendChild(typeDvdCheckbox);
      }

      // HDTV
      {
        var typeHdtvSpan = document.createElement("span");
        typeHdtvSpan.appendChild(document.createTextNode("HDTV"));

        var typeHdtvCheckbox = document.createElement("input");
        typeHdtvCheckbox.setAttribute("type", "checkbox");
        typeHdtvCheckbox.checked = !filter_Type_Hdtv;
        typeHdtvCheckbox.onclick = function() {
          GM_setValue(KEY_FILTER_TYPE_HDTV, !typeHdtvCheckbox.checked);
          filter_Type_Hdtv = !typeHdtvCheckbox.checked;
          filterReleases();
        };

        var typeHdtvDiv = document.createElement("div");
        typeHdtvDiv.appendChild(typeHdtvSpan);
        typeHdtvDiv.appendChild(typeHdtvCheckbox);
      }

      // BluRay
      {
        var typeBluRaySpan = document.createElement("span");
        typeBluRaySpan.appendChild(document.createTextNode("BluRay"));

        var typeBluRayCheckbox = document.createElement("input");
        typeBluRayCheckbox.setAttribute("type", "checkbox");
        typeBluRayCheckbox.checked = !filter_Type_BluRay;
        typeBluRayCheckbox.onclick = function() {
          GM_setValue(KEY_FILTER_TYPE_BLURAY, !typeBluRayCheckbox.checked);
          filter_Type_BluRay = !typeBluRayCheckbox.checked;
          filterReleases();
        };

        var typeBluRayDiv = document.createElement("div");
        typeBluRayDiv.appendChild(typeBluRaySpan);
        typeBluRayDiv.appendChild(typeBluRayCheckbox);
      }

      var typeDiv = document.createElement("div");
      typeDiv.style.paddingLeft = "15px";
      typeDiv.appendChild(document.createTextNode("Type"));
      typeDiv.appendChild(typeTeleSyncDiv);
      typeDiv.appendChild(typeWebRipDiv);
      typeDiv.appendChild(typeDvdRipDiv);
      typeDiv.appendChild(typeDvdScrDiv);
      typeDiv.appendChild(typeDvdDiv);
      typeDiv.appendChild(typeHdtvDiv);
      typeDiv.appendChild(typeBluRayDiv);
    }

    // RlsnameDiv
    {
      // BD-Rip
      {
        var rlsnameBdRipSpan = document.createElement("span");
        rlsnameBdRipSpan.appendChild(document.createTextNode("BD-Rip"));

        var rlsnameBdRipCheckbox = document.createElement("input");
        rlsnameBdRipCheckbox.setAttribute("type", "checkbox");
        rlsnameBdRipCheckbox.checked = !filter_Rlsname_BdRip;
        rlsnameBdRipCheckbox.onclick = function() {
          GM_setValue(KEY_FILTER_RLSNAME_BDRIP, !rlsnameBdRipCheckbox.checked);
          filter_Rlsname_BdRip = !rlsnameBdRipCheckbox.checked;
          filterReleases();
        };

        var rlsnameBdRip = document.createElement("div");
        rlsnameBdRip.appendChild(rlsnameBdRipSpan);
        rlsnameBdRip.appendChild(rlsnameBdRipCheckbox);
      }

      // 720p
      {
        var rlsname720pSpan = document.createElement("span");
        rlsname720pSpan.appendChild(document.createTextNode("720p"));

        var rlsname720pCheckbox = document.createElement("input");
        rlsname720pCheckbox.setAttribute("type", "checkbox");
        rlsname720pCheckbox.checked = !filter_Rlsname_720p;
        rlsname720pCheckbox.onclick = function() {
          GM_setValue(KEY_FILTER_RLSNAME_720P, !rlsname720pCheckbox.checked);
          filter_Rlsname_720p = !rlsname720pCheckbox.checked;
          filterReleases();
        };
        
        var rlsname720p = document.createElement("div");
        rlsname720p.appendChild(rlsname720pSpan);
        rlsname720p.appendChild(rlsname720pCheckbox);
      }

      // 1080p
      {
        var rlsname1080pSpan = document.createElement("span");
        rlsname1080pSpan.appendChild(document.createTextNode("1080p"));

        var rlsname1080pCheckbox = document.createElement("input");
        rlsname1080pCheckbox.setAttribute("type", "checkbox");
        rlsname1080pCheckbox.checked = !filter_Rlsname_1080p;
        rlsname1080pCheckbox.onclick = function() {
          GM_setValue(KEY_FILTER_RLSNAME_1080P, !rlsname1080pCheckbox.checked);
          filter_Rlsname_1080p = !rlsname1080pCheckbox.checked;
          filterReleases();
        };

        var rlsname1080p = document.createElement("div");
        rlsname1080p.appendChild(rlsname1080pSpan);
        rlsname1080p.appendChild(rlsname1080pCheckbox);
      }

      // Complete BluRay
      {
        var rlsnameCompleteBluRaySpan = document.createElement("span");
        rlsnameCompleteBluRaySpan.appendChild(document.createTextNode("Compl. BluRay"));

        var rlsnameCompleteBluRayCheckbox = document.createElement("input");
        rlsnameCompleteBluRayCheckbox.setAttribute("type", "checkbox");
        rlsnameCompleteBluRayCheckbox.checked = !filter_Rlsname_CompleteBluRay;
        rlsnameCompleteBluRayCheckbox.onclick = function() {
          GM_setValue(KEY_FILTER_RLSNAME_COMPLETE_BLURAY, !rlsnameCompleteBluRayCheckbox.checked);
          filter_Rlsname_CompleteBluRay = !rlsnameCompleteBluRayCheckbox.checked;
          filterReleases();
        };

        var rlsnameCompleteBluRay = document.createElement("div");
        rlsnameCompleteBluRay.appendChild(rlsnameCompleteBluRaySpan);
        rlsnameCompleteBluRay.appendChild(rlsnameCompleteBluRayCheckbox);
      }

      var rlsnameDiv = document.createElement("div");
      rlsnameDiv.style.paddingLeft = "15px";
      rlsnameDiv.appendChild(document.createTextNode("Rls.-Name"));
      rlsnameDiv.appendChild(rlsnameBdRip);
      rlsnameDiv.appendChild(rlsname720p);
      rlsnameDiv.appendChild(rlsname1080p);
      rlsnameDiv.appendChild(rlsnameCompleteBluRay);
    }

    var contentDiv = document.createElement("div");
    contentDiv.id = ID_DIV_CONTENT;
    contentDiv.style.display = "flex";
    contentDiv.style.paddingTop = "5px";
    contentDiv.style.paddingBottom = "5px";
    contentDiv.appendChild(catDiv);
    contentDiv.appendChild(typeDiv);
    contentDiv.appendChild(rlsnameDiv);
  }
  
  if(typeof HIDE_FILTER_DEFAULT !== 'undefined' && HIDE_FILTER_DEFAULT){
    contentDivStyleDisplay = contentDiv.style.display;
    contentDiv.style.display = "none";
  }

  // Add the filter UI to the correct place on the current page
  insertFilterUi(headerDiv);
  insertFilterUi(contentDiv);
}

// Inserts a node into the rls_filter_selection div
function insertFilterUi(filterUi) {
  var element = document.getElementById("rls_filter_selection");
  if (element !== 'undefined') {
    if(element.firstElementChild.className == "sub")
      element.replaceChild(filterUi, element.firstElementChild);
    else
      element.appendChild(filterUi);
  }
}

// Makes the "new comments" header clickable (hide/unhide)
clickableNewComments();
function clickableNewComments(){
  var divs_titles = document.getElementsByClassName('box_title1');
  if (divs_titles.length > 1){
    commentTitleDiv = divs_titles[1];
    commentTitleDiv.style.cursor = "pointer";
    commentTitleDiv.onclick = function() {
      var commentDiv = commentTitleDiv.nextElementSibling;
      GM_setValue(KEY_HIDE_NEW_COMMENTS, commentDiv.style.display !== "none");
      if (commentDiv.style.display !== "none"){
        commentDivStyleDisplay = commentDiv.style.display;
        commentDiv.style.display = "none";
      }
      else
        commentDiv.style.display = commentDivStyleDisplay;
    };
  }
  if (GM_getValue(KEY_HIDE_NEW_COMMENTS, HIDE_NEW_COMMENTS_DEFAULT)){
    var commentDiv = commentTitleDiv.nextElementSibling;
    commentDivStyleDisplay = commentDiv.style.display;
    commentDiv.style.display = "none";
  }
}

// Remove bottom banner
if (typeof HIDE_BOTTOM_BANNER !== 'undefined' && HIDE_BOTTOM_BANNER)
{
  document.getElementById('bottom').style.display = 'none';
}

// Remove bottom clearfix (if only one page exists)
if (typeof HIDE_BOTTOM_CLEARFIX !== 'undefined' && HIDE_BOTTOM_CLEARFIX)
{
  var clearfix = document.getElementsByClassName('releases_bottom clearfix')[0];
  if(clearfix.childElementCount == 0)
    clearfix.style.display = 'none';
}

    /**
     * Module Description
     * 
     * Version    Date            Author           Remarks
     * 1.00       01 Mar 2020     Garvit
     *
     */

    var FOLDER_ID = 25466;

    // Email Plugin entry point
    function process(email) {
        var title = "Process Email Received";
        nlapiLogExecution('DEBUG', 'First log', title);

        var subject = email.getSubject();
        var textbody = email.getTextBody();
        var approver = email.getFrom();

        if (subject.indexOf('Picklist -') == -1) {
            return
        }
        try {

            var matchString = 'Picklist -';
            var pickIndex = subject.indexOf(matchString);
            if (pickIndex) {
                pickIndex = parseInt(pickIndex) + matchString.length;
            }

            var emailSubStr = subject.substr(pickIndex);
            emailSubStr = emailSubStr.trim();
            var internalIdLen = emailSubStr.indexOf(" ");
            var pickNum = (subject.substr(pickIndex, internalIdLen + 1)).trim();
            if (isEmpty(pickNum)) {
                return
            }
            nlapiLogExecution('DEBUG', title, 'pickNum: ' + pickNum);
            var iFInternalId = getIFIdFromPickList(pickNum)
            if (isEmpty(iFInternalId)) {
                return
            }
            nlapiLogExecution('DEBUG', title, 'iFInternalId: ' + iFInternalId);
            // var ifRecord= record.load({
            //     type: "itemfulfillment",
            //     id: iFInternalId,
            //     isDynamic: true,
            // });
            var attachments = email.getAttachments();
            for (var indexAtt in attachments) {
                var fileObj = attachments[indexAtt]
                fileObj.setFolder(FOLDER_ID)
                var fielId = nlapiSubmitFile(fileObj)
                nlapiAttachRecord('file', fielId, "itemfulfillment", iFInternalId);
            }

        } catch (e) {
            nlapiLogExecution('DEBUG', 'EXCEPTION', e);
            return true;
        }
    }

    function getIFIdFromPickList(pickNum) {
        var intId = ''
        var itemfulfillmentSearch = nlapiSearchRecord("itemfulfillment", null,
            [
                ["type", "anyof", "ItemShip"],
                "AND",
                ["mainline", "is", "T"],
                "AND",
                ["custbody_pick_list", "is", pickNum]
            ],
            [
                new nlobjSearchColumn("internalid")
            ]
        );
        if (itemfulfillmentSearch.length) {
            for (i = 0; i < itemfulfillmentSearch.length; i++) {
                intId = itemfulfillmentSearch[i].getId();
            }
        }
        return intId
    }

    function isEmpty(stValue) {
        if ((stValue == '') || (stValue == null) || (stValue == undefined) || (stValue == 'null')) {
            return true;
        }
        return false;
    }
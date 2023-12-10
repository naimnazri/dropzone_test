Dropzone.autoDiscover = false;

var dpSuspendForm;
var fileSuspendForm;

var dpClosedForm;
var fileClosedForm;

var rakanID;
var accountStatus;
var rmID;
var arrSuspendedClosedFile;
var arrStatusRemark;

var arrSuspendFile = [];
var arrClosedFile = [];

$(function () {
    rmID = localStorage.getItem('rmID');
    //console.log(`RakanID: ${rakanID}, RMID: ${rmID}`)
    getSuspendedForm()
    getClosedForm();

    $('#editStatus').hide();
    $('#backListRakanMikroProfile').on('click', function () {
        window.location = '/Admin/admin/RakanMikroSayangProfile';
    })
    $('#btnEditStatus').on('click', function () {
        $('#displayStatusCard').hide();
        $('#editStatus').show();
    })

    $('#cancelEdit').on('click', function () {
        $('#displayStatusCard').show();
        $('#editStatus').hide();
    })

    getDetails();

    $('#sendEdit').on('click', function () {
        // Get the selected radio button value
        var selectedValue = document.querySelector('input[name="statusRM"]:checked').value;
        var s;
        var internalRemarksRM = $('#internalRmNote').val();
        var publicRemarksRM = $('#rmNote').val();

        if (selectedValue == 3) { s = "Under Review"; }
        else if (selectedValue == 4) { s = "Approved"; }
        else if (selectedValue == 5) { s = "Declined"; }

        let statusAndPublicRemark = `${s}:${publicRemarksRM}`; // Combine Status and Public Remarks
        let statusAndInternalRemark = `${s}:${internalRemarksRM}`; // Combine Status and Internal Remarks

        var data = {
            "rakanMikroID": rakanID,
            "status": s,
            "statusID": parseInt(selectedValue),
            "remarks": statusAndPublicRemark, // Public Remarks
        }

        var dataInternal = {
            "rakanMikroID": rakanID,
            "status": s,
            "statusID": parseInt(selectedValue),
            "remarks": statusAndInternalRemark // Internal Remarks
        }

        postStatus(data)

        if (internalRemarksRM !== '') {
            postInternalRemarksRM(dataInternal)
        } 
    })

    displayFormSuspendClosed();
    $('#updateActive').on('click', function () {
        // Get the selected radio button value
        var selectedValue = document.querySelector('input[name="statusAkaunRM"]:checked').value;
        var s;
        let internalRemarksActive = $('#internalActiveRemarks').val();
        let publicRemarksActive = $('#publicActiveRemarks').val();

        if (selectedValue == 2) { s = "Active"; internalStatus = "Active"; internalStatusId = 2; }
        else if (selectedValue == 3) { s = "Suspended"; internalStatus = "Suspended"; internalStatusId = 3; }
        else if (selectedValue == 4) { s = "Closed"; internalStatus = "Closed"; internalStatusId = 4; }

        let statusAndPublicRemark = `${s}:${publicRemarksActive}`; // Combine Status and Public Remarks
        let statusAndInternalRemark = `${s}:${internalRemarksActive}`; // Combine Status and Internal Remarks

        var data = {
            "rakanMikroID": rakanID,
            "status": s,
            "statusID": parseInt(selectedValue),
            "remarks": statusAndPublicRemark, // Public Remarks
        }

        var dataInternal = {
            "rakanMikroID": rakanID,
            "status": internalStatus,
            "statusID": parseInt(internalStatusId),
            "remarks": statusAndInternalRemark // Internal Remarks
        }

        postSuspendClosed(data, selectedValue)

        if (internalRemarksActive !== '') {
            postInternalRemarksSuspenClose(dataInternal)
        } 
    })
    $('#updateSuspend').on('click', function () {
        // Get the selected radio button value
        var selectedValue = document.querySelector('input[name="statusAkaunRM"]:checked').value;
        var s;
        var internalStatus;
        var internalStatusId;
        var internalRemarksSuspen = $('#internalSuspendRemarks').val();
        var publicRemarksSuspen = $('#publicSuspendRemarks').val();

        if (selectedValue == 2) { s = "Active"; }
        else if (selectedValue == 3) { s = "Suspended"; internalStatus = "Suspended"; internalStatusId = 3; }
        else if (selectedValue == 4) { s = "Closed"; internalStatus = "Closed"; internalStatusId = 4; }

        let statusAndPublicRemark = `${s}:${publicRemarksSuspen}`; // Combine Status and Public Remarks
        let statusAndInternalRemark = `${s}:${internalRemarksSuspen}`; // Combine Status and Internal Remarks

        var data = {
            "rakanMikroID": rakanID,
            "status": s,
            "statusID": parseInt(selectedValue),
            "remarks": statusAndPublicRemark, // Public Remarks
        }

        var dataInternal = {
            "rakanMikroID": rakanID,
            "status": internalStatus,
            "statusID": parseInt(internalStatusId),
            "remarks": statusAndInternalRemark // Internal Remarks
        }

        postSuspendClosed(data, selectedValue)

        if (internalRemarksSuspen !== '') {
            postInternalRemarksSuspenClose(dataInternal)
        } 

    })
    $('#updateClosed').on('click', function () {
        // Get the selected radio button value
        var selectedValue = document.querySelector('input[name="statusAkaunRM"]:checked').value;
        var s;
        var internalStatus;
        var internalStatusId;
        var internalRemarksClose = $('#internalClosedRemarks').val();
        var publicRemarksSClose = $('#publicClosedRemarks').val();

        if (selectedValue == 2) { s = "Active"; }
        else if (selectedValue == 3) { s = "Suspended"; internalStatus = "Suspended"; internalStatusId = 3; }
        else if (selectedValue == 4) { s = "Closed"; internalStatus = "Closed"; internalStatusId = 4; }

        let statusAndPublicRemark = `${s}:${publicRemarksSClose}`; // Combine Status and Public Remarks
        let statusAndInternalRemark = `${s}:${internalRemarksClose}`; // Combine Status and Internal Remarks

        var data = {
            "rakanMikroID": rakanID,
            "status": s,
            "statusID": parseInt(selectedValue),
            "remarks": statusAndPublicRemark, // Public Remarks
        }

        var dataInternal = {
            "rakanMikroID": rakanID,
            "status": internalStatus,
            "statusID": parseInt(internalStatusId),
            "remarks": statusAndInternalRemark // Internal Remarks
        }

        postSuspendClosed(data, selectedValue)

        if (internalRemarksClose !== '') {
            postInternalRemarksSuspenClose(dataInternal)
        }
    })

});

function generateDate(tarikh) {

    let d = new Date(tarikh);

    let monthNames = ["January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"];

    let day = d.getDate();

    let monthIndex = d.getMonth();
    let monthName = monthNames[monthIndex];

    let year = d.getFullYear();

    return `${day} ${monthName} ${year}`;
}

function generateDateTime(tarikh) {

    let d = new Date(tarikh);

    let monthNames = ["January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"];

    let day = d.getDate();

    let monthIndex = d.getMonth();
    let monthName = monthNames[monthIndex];

    let year = d.getFullYear();

    let hours = d.getHours();
    let minutes = d.getMinutes();

    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be displayed as 12

    // Format the time as h:mm AM/PM
    let time = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    return `${day} ${monthName} ${year} ${time}`;
}

function getDetails() {
    var urlGetDetail = dataIP + '/api/rakanMikro/GetDetails?userid=' + localStorage.getItem('rmID');
    var token = localStorage.getItem("token");
    $.ajax({
        url: urlGetDetail,
        type: "get",

        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },

        contentType: "application/json; charset-utf-8",
        success: function (data) {

            $(".card_title, .card_description, .card_image").removeClass("loading");
            $(".fade-in").fadeIn();

            rakanID = data.accountDetail.rakanMikroID;
            accountStatus = data.accountDetail.accountStatus;

            //company details
            $("#displayNamaBerdaftar").text(data.companyDetail.companyName);
            $("#displayNomborPendaftaran").text(data.companyDetail.companyRegistrationNumber);
            $("#displayJenisPerniagaan").text(data.companyDetail.businessType);
            $("#displayAktiviti").text(data.companyDetail.businessActivity);
            $("#displayAlamatBerdaftar1").text(data.companyDetail.address1);
            $("#displayAlamatBerdaftar2").text(data.companyDetail.address2);
            $("#displayBandar").text(data.companyDetail.town);
            $("#displayNegeri").text(data.companyDetail.state);
            $("#displayPoskod").text(data.companyDetail.postcode);
            $("#displayNomborTelefon").text(data.companyDetail.phoneNumber);
            $("#displayCompanyEmail").text(data.accountDetail.email);

            //bank detail
            $("#displayNamaBank").text(data.bankDetail.bankName);
            $("#displayNomborAkaun").text(data.bankDetail.accountNumber);
            $("#displayNamaAkaun").text(data.bankDetail.accountName);

            //assignee Detail
            $("#displayNamaWakil").text(data.assigneeDetail.name);
            $("#displayNomborICWakil").text(data.assigneeDetail.icNumber);
            $("#displayAlamatWakil1").text(data.assigneeDetail.address1);
            $("#displayAlamatWakil2").text(data.assigneeDetail.address2);
            $("#displayBandarWakil").text(data.assigneeDetail.town);
            $("#displayNegeriWakil").text(data.assigneeDetail.state);
            $("#displayPoskodWakil").text(data.assigneeDetail.postcode);
            $("#displayNomborTelefonWakil").text(data.assigneeDetail.phoneNumber);
            $("#displayEmelWakil").text(data.assigneeDetail.email);

            //Status Detail
            generateStatus(data.accountDetail.statusID);
            displayStatusAkaun(data.accountDetail.statusID);
            getRemarks(data.accountDetail.rakanMikroID)
            //generateTarikh(data.accountDetail.appliedDate);

            //document
            for (var a = 0; a < data.documentDetails.length; a++) {
                let d = `<a onclick="downloadFileRM('${data.documentDetails[a].id}')" class="lato-bold-18 link-color-blue text-underline text-blue-underline cursor-pointer" target="_blank" rel=”noopener noreferrer”>${data.documentDetails[a].fileName}</a>`;

                if (data.documentDetails[a].docType == "bussinessRegistration") {
                    $("#displaySalinanPendaftaranPerniagaan_0").html(d);
                }
                else if (data.documentDetails[a].docType == "assigneeMyKad") {
                    $("#displaySalinanICWakil_0").html(d);
                }
                else if (data.documentDetails[a].docType == "assigneeMyKadBack") {
                    $("#displaySalinanICWakil_1").html(d);
                }
                else if (data.documentDetails[a].docType == "agreementForm") {
                    $("#displayBorangPerjanjian_0").html(d);
                }

            }
            getRemarksHistory(rakanID);
            getDocumentHistory(rakanID);
            getDocumentHistoryBusinessRegistration(rakanID);
            getDocumentHistorySalinanICWakil(rakanID);
            getStatusRemarksHistory(rakanID)
        }
    });
}

function generateStatus(id) {
    // Get the radio button elements by name
    var radioButtons = document.getElementsByName("statusRM");

    // Loop through the radio buttons
    for (var i = 0; i < radioButtons.length; i++) {
        // Check if the value matches the API response
        if (radioButtons[i].value === id.toString()) {
            // Set the radio button as checked
            radioButtons[i].checked = true;
        }
    }

    if (id == 2) {
        $("#displayStatus").html("Pending Verification")
    }
    else if (id == 3) {
        $("#displayStatus").html("Under Review")
    }
    else if (id == 4) {
        $("#displayStatus").html("Approved")
        $('#btnEditStatus').hide();
    }
    else if (id == 5) {
        $("#displayStatus").html("Declined")
    }
}

function postStatus(data) {
    var urlPostStatus = dataIP + '/api/rakanMikro/ApplicationStatus';
    var token = localStorage.getItem("token");
    console.log(`postStatus Data: ${data}`)
    $.ajax({
        url: urlPostStatus,
        dataType: 'json',
        type: 'put',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        success: function (response, status) {

            $('#modal_success').modal('show');
            $('#modalTextSuccess').text('The status and remarks were successfully updated.');
            if (data.statusID == 5) {
                $('#btnModalSuccess').on('click', function () {
                    window.location.href = window.location.origin + '/Admin/admin/RakanMikroSayang';
                })
            }
            else {
                $('#btnModalSuccess').on('click', function () {
                    window.location.reload();
                })
            }
        },
        error: function (data, xhr, status) {
            
            var err = data.status;
            var errMessage = data.responseJSON;

            if (err == 400) {
                console.log(errMessage)
            }
        }
    });
}

function postSuspendClosed(data, statusAccount) {
    var urlPostStatus = dataIP + '/api/rakanMikro/AccountStatus';
    var token = localStorage.getItem("token");
    $.ajax({
        url: urlPostStatus,
        dataType: 'json',
        type: 'put',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        success: function (response, status) {

            if (statusAccount == 3) {

                var mainDocForm = new FormData();
                mainDocForm.append('userID', rmID);
                //mainDocForm.append('accountrmsuspended', fileSuspendForm);

                for (var i = 0; i < arrSuspendFile.length; i++) {
                    var file = arrSuspendFile[i];
                    mainDocForm.append('accountrmsuspended', file);
                }

                postSuspendClosedDocument(mainDocForm)


            } else if (statusAccount == 4) {

                var mainDocForm = new FormData();
                mainDocForm.append('userID', rmID);
                //mainDocForm.append('accountrmclosed', fileClosedForm);

                for (var i = 0; i < arrClosedFile.length; i++) {
                    var file = arrClosedFile[i];
                    mainDocForm.append('accountrmclosed', file);
                }

                postSuspendClosedDocument(mainDocForm)

            }

            $('#modal_success').modal('show');
            $('#modalTextSuccess').text('The status and remarks were successfully updated.');
            $('#btnModalSuccess').on('click', function () {
                window.location.reload();
            })
        },
        error: function (data, xhr, status) {

            var err = data.status;
            var errMessage = data.responseJSON;

            if (err == 400) {
                console.log(errMessage)
            }
        }
    });
}

function postInternalRemarksSuspenClose(data) {
    var urlPostStatus = dataIP + '/api/rakanMikro/InternalRemarks';
    var token = localStorage.getItem("token");
    $.ajax({
        url: urlPostStatus,
        dataType: 'json',
        type: 'put',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        success: function (response, status) {

            console.log(`Response: ${response}, Status: ${status}`);

        },
        error: function (data, xhr, status) {

            var err = data.status;
            var errMessage = data.responseJSON;

            if (err == 400) {
                console.log(errMessage)
            }
        }
    });
}
function postInternalRemarksRM(data) {
    var urlPostStatus = dataIP + '/api/rakanMikro/InternalRemarks';
    var token = localStorage.getItem("token");
    $.ajax({
        url: urlPostStatus,
        dataType: 'json',
        type: 'put',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        success: function (response, status) {

            console.log(`Response: ${response}, Status: ${status}`);
            
        },
        error: function (data, xhr, status) {

            var err = data.status;
            var errMessage = data.responseJSON;

            if (err == 400) {
                console.log(errMessage)
            }
        }
    });
}

function getRemarks(id) {

    $.ajax({
        url: dataIP + '/api/rakanMikro/Remarks?rakanMikroID=' + id,
        type: "get",

        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
        },

        contentType: "application/json; charset-utf-8",
        success: function (data) {

            $(".card_title, .card_description, .card_image").removeClass("loading");
            $(".fade-in").fadeIn();

            if (data.length > 0) {
                for (var i = data.length - 1; i < data.length; i++) {
                    $("#displayNotes").text(data[i].remarks)
                }
            }
            else { $("#displayNotes").text(' ')     }
            
        }
    });
}

function downloadFileRM(id) {
    var token = localStorage.getItem("token");
    $.ajax({
        url: dataIP + '/api/download/RakanMikroDocuments?id=' + id,
        type: "get",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        cache: false,
        xhrFields: {
            responseType: 'blob'
        },
        success: function (data, status, xhr) {
            //console.log(status)
            if (status == 'success') {
                const fileType = xhr.getResponseHeader("content-type");
                var file = new Blob([data], { type: fileType });
                var fileURL = URL.createObjectURL(file);
                window.open(fileURL);
            }
        },
    })
}

function getStatusRemarksHistory(id) {
    //var arrayStatusHistory = [];

    var arraySort = [];
    var arraySortMulti = []
    var arrayFinalSort = []
    var arrayFinalSortDoc = []

    $.ajax({
        url: dataIP + '/api/rakanMikro/Remarks?rakanMikroID=' + id,
        type: "get",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
        },
        contentType: "application/json; charset-utf-8",
        success: function (data) {

            $(".card_title, .card_description, .card_image").removeClass("loading");
            $(".fade-in").fadeIn();

            //console.log(data)

            combineStatusRemarks(data)

            // Below code is Not use anymore, just for reference only.
            //for (var i = 0, len = data.length; i < len; i++) {

                
            //    let date1, date2, j, sort;
            //    sort = {};

            //    if (i === len - 1) {
            //        break
            //    }

            //    j = i + 1;
            //    date1 = data[i].remarkDate;
            //    date2 = (data[j].remarkDate) ? data[j].remarkDate : '';


            //    //console.log(`Date 1: ${date1}, Date 2: ${date2}`)

            //    const result = isDateWithinHalfMinuteRange(date1,date2)

            //    //console.log(result)

            //    if (result) {

            //        sort['remarkID01'] = data[i].remarksID;
            //        sort['remarkBy01'] = data[i].remarkBy;
            //        sort['remarkDate01'] = data[i].remarkDate;
            //        sort['remarkType01'] = data[i].remarkType;
            //        sort['remark01'] = data[i].remarks;

            //        sort['remarkID02'] = data[j].remarksID;
            //        sort['remarkBy02'] = data[j].remarkBy;
            //        sort['remarkDate02'] = data[j].remarkDate;
            //        sort['remarkType02'] = data[j].remarkType;
            //        sort['remark02'] = data[j].remarks;

            //        arraySortMulti.push(sort)

            //    } else {

            //        sort['remarkID'] = data[i].remarksID;
            //        sort['remarkBy'] = data[i].remarkBy;
            //        sort['remarkDate'] = data[i].remarkDate;
            //        sort['remarkType'] = data[i].remarkType;
            //        sort['remark'] = data[i].remarks;

            //        arraySort.push(sort)
            //    }

            //}
            //console.log(arraySortMulti)
            //console.log(arraySort)

            // Loop Multi Remarks
            //for (var i = 0, len = arraySortMulti.length; i < len; i++) {

            //    var data = arraySortMulti;

            //    let remarkDate;
            //    let adminInCharge;
            //    let statusHistory;
            //    let internalRemarks;
            //    let publicRemarks;
            //    let attachment;

            //    (data[i].remarkDate01 > data[i].remarkDate02) ? remarkDate = data[i].remarkDate01 : remarkDate = data[i].remarkDate02;
            //    (data[i].remarkBy01 == data[i].remarkBy02) ? adminInCharge = data[i].remarkBy01 : adminInCharge = 'None';

            //    if (data[i].remarkType01 === 'InternalRemarks') {

            //        statusHistory = filterStatusRemarks(data[i].remark02.split(':')[0]);
            //        internalRemarks = (data[i].remark01.split(':')[1]) ? data[i].remark01.split(':')[1] : data[i].remark01;
            //        publicRemarks = (data[i].remark02.split(':')[1]) ? data[i].remark02.split(':')[1] : data[i].remark02;


            //    } else if (data[i].remarkType02 === 'InternalRemarks') {

            //        statusHistory = filterStatusRemarks(data[i].remark01.split(':')[0]);
            //        internalRemarks = (data[i].remark02.split(':')[1]) ? data[i].remark02.split(':')[1] : data[i].remark02;
            //        publicRemarks = (data[i].remark01.split(':')[1]) ? data[i].remark01.split(':')[1] : data[i].remark01;

            //    } else {

            //        statusHistory = (filterStatusRemarks(data[i].remark01.split(':')[0]) !== '') ? filterStatusRemarks(data[i].remark01.split(':')[0]) : filterStatusRemarks(data[i].remark02.split(':')[0]);
            //        internalRemarks = '';

            //        if (data[i].remark01 !== '') {
            //            publicRemarks = (data[i].remark01.split(':')[1]) ? data[i].remark01.split(':')[1] : data[i].remark01;

            //        } else if (data[i].remark02 !== '') {
            //            publicRemarks = (data[i].remark02.split(':')[1]) ? data[i].remark02.split(':')[1] : data[i].remark02;

            //        }

            //    }

            //    attachment = '-';

            //    const sortF = {
            //        remarkDate: remarkDate,
            //        adminInCharge: adminInCharge,
            //        statusHistory: statusHistory,
            //        internalRemarks: internalRemarks,
            //        publicRemarks: publicRemarks,
            //        attachment: attachment
            //    }

            //    arrayFinalSort.push(sortF)

            //}

            // Loop Single Remarks
            //for (var i = 0, len = arraySort.length; i < len; i++) {

            //    var data = arraySort;

            //    let remarkDate;
            //    let adminInCharge;
            //    let statusHistory;
            //    let internalRemarks;
            //    let publicRemarks;
            //    let attachment;


            //    (data[i].remarkDate) ? remarkDate = data[i].remarkDate : remarkDate = '';
            //    (data[i].remarkBy) ? adminInCharge = data[i].remarkBy : adminInCharge = 'None';
            //    statusHistory = filterStatusRemarks(data[i].remark.split(':')[0]);

            //    if (data[i].remarkType == 'InternalRemarks') {

            //        internalRemarks = (data[i].remark.split(':')[1]) ? data[i].remark.split(':')[1] : data[i].remark;
            //        publicRemarks = "";

            //    } else {

            //        internalRemarks = '';
            //        publicRemarks = (data[i].remark.split(':')[0]) ? data[i].remark.split(':')[0] : data[i].remark;

            //    }

            //    attachment = '-';

            //    const sortF = {
            //        remarkDate: remarkDate,
            //        adminInCharge: adminInCharge,
            //        statusHistory: statusHistory,
            //        internalRemarks: internalRemarks,
            //        publicRemarks: publicRemarks,
            //        attachment: attachment
            //    }

            //    arrayFinalSort.push(sortF)

            //}

            //console.log(arrSuspendedClosedFile)
            //console.log(arrayFinalSort)

            //for (var i = 0; i < arrayFinalSort.length; i++) {
            //    let array1 = arrayFinalSort[i];
            //    let arrTime1 = array1.remarkDate;

            //    let matched = false; // Flag to check if a match is found

            //    for (var j = 0; j < arrSuspendedClosedFile.length; j++) {
            //        let array2 = arrSuspendedClosedFile[j];
            //        let arrTime2 = array2.lastModified;

            //        const result = isDateWithinHalfMinuteRange(arrTime1, arrTime2);

            //        if (result) {
            //            const item = {
            //                remarkDate: array1.remarkDate,
            //                adminInCharge: array1.adminInCharge,
            //                statusHistory: array1.statusHistory,
            //                internalRemarks: array1.internalRemarks,
            //                publicRemarks: array1.publicRemarks,
            //                docID: array2.id,
            //                docDesc: array2.docDesc,
            //                fileName: array2.fileName,
            //                lastModified: array2.lastModified,
            //            };

            //            arrayFinalSortDoc.push(item);
            //            matched = true; // Set the flag to true when a match is found
            //            break; // Break out of the loop once a match is found
            //        }
            //    }

            //    // If no match is found, add the array1 item without array2 data
            //    if (!matched) {
            //        const item = {
            //            remarkDate: array1.remarkDate,
            //            adminInCharge: array1.adminInCharge,
            //            statusHistory: array1.statusHistory,
            //            internalRemarks: array1.internalRemarks,
            //            publicRemarks: array1.publicRemarks,
            //        };

            //        arrayFinalSortDoc.push(item);
            //    }
            //}

            //console.log(arrayFinalSortDoc)


            //for (var i = 0, len = arrayFinalSortDoc.length; i < len; i++) {
            //    var data = arrayFinalSortDoc;
            //    var item = {};
            //    let attachment;
                //var remarktype = data[i].remarkType;

                //if (data[i].docID === undefined) {
                //    attachment = '<div class="text-center">-</div>';
                //} else {
                //    attachment = `<a onclick="downloadFileRM('${data[i].docID}')" class="lato-bold-18 link-color-blue text-underline text-blue-underline cursor-pointer" target="_blank" rel="noopener noreferrer">${data[i].fileName}</a>`;
                //}


                //item["date"] = generateDateTime(data[i].remarkDate);
                //item["adminInCharge"] = data[i].adminInCharge;
                //item["statusHistory"] = data[i].statusHistory;
                //item["internalRemarks"] = data[i].internalRemarks;
                //item["publicRemarks"] = data[i].publicRemarks;
                //item["attachment"] = attachment;
                //item[""] = '';


                //arrayStatusHistory.push(item)
            //}

            //statusRemarksHistory(arrayStatusHistory);

        }
    });
}

function combineStatusRemarks(data) {

    //console.log(data)
    var arrayStatusHistory = []
    let rmApplicationArr = [];
    let rmAccountStatusArr = [];
    let rmInternalRemark = [];

    let rmStatusRemarks = [];

    // Pass to Specific Remarks Type
    for (let i = 0; i < data.length; i++) {

        let item = {};

        item['remarkID'] = data[i].remarksID;
        item['remarkBy'] = data[i].remarkBy;
        item['remarkDate'] = data[i].remarkDate;
        item['remarkType'] = data[i].remarkType;
        item['remark'] = data[i].remarks;

        if (data[i].remarkType == 'rakanMikroApplication') {

            rmApplicationArr.push(item)

        } else if (data[i].remarkType == 'rakanMikroAccountStatus') {

            rmAccountStatusArr.push(item)

        } else if (data[i].remarkType == 'InternalRemarks') {

            rmInternalRemark.push(item)

        }
    }

    //console.log(rmApplicationArr)
    //console.log(rmAccountStatusArr)
    //console.log(rmInternalRemark)

    // RM Application Status
    for (let i = 0; i < rmApplicationArr.length; i++) {

        let array1 = rmApplicationArr[i];
        let item = {};
        let matched = false; // Flag to check if a match is found

        for (let j = 0; j < rmInternalRemark.length; j++) {

            let array2 = rmInternalRemark[j];

            let result = isDateWithinHalfMinuteRange(array1.remarkDate, array2.remarkDate) || isIDWithinOne(array1.remarksID, array2.remarksID);

            if (result) {

                item["ID1"] = array1.remarkID;
                item["ID2"] = array2.remarkID;
                item["date"] = generateDateTime(array1.remarkDate);
                item["adminInCharge"] = array1.remarkBy;
                item["statusHistory"] = filterStatusRemarks(array1.remark.split(':')[0]);
                item["internalRemarks"] = (array2.remark.split(':')[1]) ? array2.remark.split(':')[1] : array2.remark;
                item["publicRemarks"] = (array1.remark.split(':')[1]) ? array1.remark.split(':')[1] : array1.remark;
                item["docStatus"] = '';
                item["attachments"] = [];

                rmStatusRemarks.push(item);
                matched = true; // Set the flag to true when a match is found
                break; // Break out of the loop once a match is found

            }

        }

        if (!matched) {
            item["ID1"] = array1.remarkID;
            item["ID2"] = '';
            item["date"] = generateDateTime(array1.remarkDate);
            item["adminInCharge"] = array1.remarkBy;
            item["statusHistory"] = filterStatusRemarks(array1.remark.split(':')[0]);
            item["internalRemarks"] = '';
            item["publicRemarks"] = (array1.remark.split(':')[1]) ? array1.remark.split(':')[1] : array1.remark;
            item["docStatus"] = '';
            item["attachments"] = [];

            rmStatusRemarks.push(item);
        }
    }

    // RM Account Status
    for (let i = 0; i < rmAccountStatusArr.length; i++) {

        let array1 = rmAccountStatusArr[i];
        let item = {};
        let matched = false; // Flag to check if a match is found

        for (let j = 0; j < rmInternalRemark.length; j++) {

            let array2 = rmInternalRemark[j];

            let result = isDateWithinHalfMinuteRange(array1.remarkDate, array2.remarkDate) || isIDWithinOne(array1.remarksID, array2.remarksID);

            if (result) {

                let statusHistory = filterStatusRemarks(array1.remark.split(':')[0]);
                var docStatus;

                if (statusHistory == 'Suspended') {
                    docStatus = 'accountrmsuspended';
                } else if (statusHistory == 'Suspended') {
                    docStatus = 'accountrmclosed';
                } else {
                    docStatus = '';
                }

                item["ID1"] = array1.remarkID;
                item["ID2"] = array2.remarkID;
                item["date"] = generateDateTime(array1.remarkDate);
                item["adminInCharge"] = array1.remarkBy;
                item["statusHistory"] = statusHistory;
                item["internalRemarks"] = (array2.remark.split(':')[1]) ? array2.remark.split(':')[1] : array2.remark;
                item["publicRemarks"] = (array1.remark.split(':')[1]) ? array1.remark.split(':')[1] : array1.remark;
                item["docStatus"] = docStatus;
                item["attachments"] = [];

                rmStatusRemarks.push(item);
                matched = true; // Set the flag to true when a match is found
                break; // Break out of the loop once a match is found

            }

        }

        if (!matched) {

            let statusHistory = filterStatusRemarks(array1.remark.split(':')[0]);
            var docStatus;

            if (statusHistory == 'Suspended') {
                docStatus = 'accountrmsuspended';
            } else if (statusHistory == 'Closed') {
                docStatus = 'accountrmclosed';
            } else {
                docStatus = '';
            }

            item["ID1"] = array1.remarkID;
            item["ID2"] = '';
            item["date"] = generateDateTime(array1.remarkDate);
            item["adminInCharge"] = array1.remarkBy;
            item["statusHistory"] = filterStatusRemarks(array1.remark.split(':')[0]);
            item["internalRemarks"] = '';
            item["publicRemarks"] = (array1.remark.split(':')[1]) ? array1.remark.split(':')[1] : array1.remark;
            item["docStatus"] = '';
            item["attachments"] = [];

            rmStatusRemarks.push(item);
        }
    }

    //console.log(rmStatusRemarks)

    rmStatusRemarks.forEach((remarks, index) => {

        let docStatus = remarks.docStatus;
        let date = remarks.date;
        let rNo = index;

        for (let i = arrSuspendedClosedFile.length - 1; i >= 0; i--) {

            let docStatus1 = arrSuspendedClosedFile[i].docDesc;
            let date1 = arrSuspendedClosedFile[i].lastModified;

            if (docStatus == docStatus1 && isDateWithinTwoMinuteRange(date, date1)) {

                remarks.attachments.push(arrSuspendedClosedFile[i]);
                //arrSuspendedClosedFile.splice(i, 1);

            } else {}

        }

    });

    console.log(rmStatusRemarks)

    for (var i = 0, len = rmStatusRemarks.length; i < len; i++) {
        var data = rmStatusRemarks;
        var item = {};
        let attachment = [];

        let files = data[i].attachments;
        //console.log(files);
        if (files !== '') {

            let doc;

            files.forEach((file, index) => {

                doc = `<a onclick="downloadFileRM('${file.id}')" class="lato-bold-18 link-color-blue text-underline text-blue-underline cursor-pointer" target="_blank" rel="noopener noreferrer">${file.fileName}</a>`;
                doc += `<br/>`;
                attachment.push(doc);
            });

        } else {

            let doc = '<div class="text-center">-</div>';
            attachment.push(doc);

        }

        item["date"] = generateDateTime(data[i].date);
        item["adminInCharge"] = data[i].adminInCharge;
        item["statusHistory"] = data[i].statusHistory;
        item["internalRemarks"] = data[i].internalRemarks;
        item["publicRemarks"] = data[i].publicRemarks;
        item["attachment"] = attachment;
        item[""] = '';

        arrayStatusHistory.push(item)
    }

    console.log(arrayStatusHistory)

    statusRemarksHistory(arrayStatusHistory);
        
}

function filterStatusRemarks(data) {

    //console.log(data)
    const allowedStatus = new Set(['Suspended', 'Closed', 'Active', 'Under Review', 'Approved', 'Decline']);

    if (allowedStatus.has(data)) {
        return data;

    } else {
        return '';
    }

}

function isIDWithinOne(id1, id2) {

    if (compareID(id1, id2)) {
        return true;
        //console.log('beza dalam 1')
    } else {
        return false;
        //console.log('luar dari 1')
    }
}

function compareID(id1, id2) {
    return Math.abs(id1 - id2) <= 1;
}

function isDateWithinHalfMinuteRange(date1, date2) {
    // Convert dates to milliseconds since Unix epoch
    const time1 = new Date(date1);
    const time2 = new Date(date2);

    // Define the 2-minute range in milliseconds
    const twoMinuteRange = 0.5 * 60 * 1000;

    // Check if the absolute difference between the two dates is within the range
    return Math.abs(time1 - time2) <= twoMinuteRange;
}

function isDateWithinTwoMinuteRange(date1, date2) {
    // Convert dates to milliseconds since Unix epoch
    const time1 = new Date(date1);
    const time2 = new Date(date2);

    // Define the 2-minute range in milliseconds
    const twoMinuteRange = 2 * 60 * 1000;

    // Check if the absolute difference between the two dates is within the range
    return Math.abs(time1 - time2) <= twoMinuteRange;
}

function statusRemarksHistory(data) {

    table = $('#statusRemarksHistoryTable').DataTable({

        "aaData": data,
        "columns":
            [
                { "data": "date" },
                { "data": "adminInCharge" },
                { "data": "statusHistory" },
                { "data": "internalRemarks" },
                { "data": "publicRemarks" },
                { "data": "attachment" },
                { "data": "" }
            ],
        responsive:
        {
            details: {
                type: 'column',
                target: -1
            }
        },
        columnDefs: [
            {
                'targets': -1,
                'searchable': false,
                'orderable': false,
                'className': 'control'
            }
        ],
        "order": [[0, "desc"]]
    });

}

function getRemarksHistory(id) {
    var arrayReturn = [];
    var arrayStatusHistory = []
    $.ajax({
        url: dataIP + '/api/rakanMikro/Remarks?rakanMikroID=' + id,
        type: "get",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
        },
        contentType: "application/json; charset-utf-8",
        success: function (data) {

            $(".card_title, .card_description, .card_image").removeClass("loading");
            $(".fade-in").fadeIn();

            //console.log(data)
            for (var i = 0, len = data.length; i < len; i++) {
                var item = {};
                var remarktype = data[i].remarkType;
                
                item["date"] = generateDate(data[i].remarkDate);
                item["name"] = data[i].remarkBy;
                item["remarks"] = data[i].remarks;
                item[""] = '';

                if (remarktype == "rakanMikroApplication") {
                    arrayReturn.push(item);

                } else if (remarktype == "rakanMikroAccountStatus") {
                    arrayStatusHistory.push(item);

                }
            }
            listHistory(arrayReturn);
            statusHistory(arrayStatusHistory)

        }
    });
}

function statusHistory(data) {

    table = $('#statusHistoryTable').DataTable({

        "aaData": data,
        "columns":
            [
                { "data": "date" },
                { "data": "remarks" },
                { "data": "name" },
                { "data": "" }
            ],
        responsive:
        {
            details: {
                type: 'column',
                target: -1
            }
        },
        columnDefs: [
            {
                'targets': -1,
                'searchable': false,
                'orderable': false,
                'className': 'control'
            }
        ]
    });

}

function listHistory(data) {
    table = $('#remarksHistoryTable').DataTable({
        
        "aaData": data,
        "columns":
            [
                { "data": "date" },
                { "data": "name" },
                { "data": "remarks" },
                { "data": "" }
            ],
        responsive:
        {
            details: {
                type: 'column',
                target: -1
            }
        },
        columnDefs: [
            {
                'targets': -1,
                'searchable': false,
                'orderable': false,
                'className': 'control'
            }
        ]
    });

}

function getDocumentHistory(id) {
    var arrayReturn = [];
    $.ajax({
        url: dataIP + '/api/rakanMikro/historyUploadedDocuments?id=' + id + '&userid=' + localStorage.getItem('rmID'),
        type: "get",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
        },
        contentType: "application/json; charset-utf-8",
        success: function (data) {

            $(".card_title, .card_description, .card_image").removeClass("loading");
            $(".fade-in").fadeIn();

            //console.log(data)
            //for (var i = 0, len = data.length; i < len; i++) {
            //    var item = {};

            //    item["date"] = generateDate(data[i].lastModified);
            //    item["document uploaded"] = data[i].description;
            //    item[""] = '';
            //    arrayReturn.push(item);
            //}
            //documentHistory(arrayReturn);

            let arrSuspendedClosedFile1 = [];

            for (let i = 0; i < data.length; i++) {

                let item = {};
                if (data[i].docType == 'accountrmsuspended' || data[i].docType == 'accountrmclosed') {

                    item['id'] = data[i].id;
                    item['docDesc'] = data[i].docType;
                    item['fileName'] = data[i].fileName;
                    item['lastModified'] = data[i].lastModified;

                    arrSuspendedClosedFile1.push(item);
                }
            }
            arrSuspendedClosedFile = arrSuspendedClosedFile1;
            //console.log(arrSuspendedClosedFile)

            var tableHTML = '<table><thead><tr><th>Date</th><th>Document Uploaded</th></tr></thead><tbody>';

            for (var i = 0, len = data.length; i < len; i++) {
                tableHTML += '<tr>';
                tableHTML += '<td>' + generateDate(data[i].lastModified) + '</td>';
                tableHTML += '<td><a onclick="downloadFileRM(\'' + data[i].id + '\')" class="lato-bold-18 link-color-blue text-underline text-blue-underline cursor-pointer" target="_blank" rel=”noopener noreferrer”>' + data[i].fileName + '</a></td>';
                tableHTML += '</tr>';
            }

            tableHTML += '</tbody></table>';
            // Assuming you have an element with the id "documentTable" where you want to display the table.
            $('#documentHistoryTable').html(tableHTML);

        }
    });
}

function documentHistory(data) {
    table = $('#documentHistoryTable').DataTable({

        "aaData": data,
        "columns":
            [
                { "data": "date" },
                { "data": "document uploaded" },
                { "data": "" }
            ],
        responsive:
        {
            details: {
                type: 'column',
                target: -1
            }
        },
        columnDefs: [
            {
                'targets': -1,
                'searchable': false,
                'orderable': false,
                'className': 'control'
            }
        ]
    });

}

function getDocumentHistoryBusinessRegistration(id){
    var arrayReturn = [];
    $.ajax({
        url: dataIP + '/api/rakanMikro/historyUploadedDocuments?id=' + id + '&userid=' + localStorage.getItem('rmID'),
        type: "get",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
        },
        contentType: "application/json; charset-utf-8",
        success: function (data) {

            $(".card_title, .card_description, .card_image").removeClass("loading");
            $(".fade-in").fadeIn();

            var tableHTML = '<table><thead><tr><th>Date & Time</th><th>Document Uploaded</th></tr></thead><tbody>';

            for (var i = 0, len = data.length; i < len; i++) {

                let docType = data[i].docType;

                if (docType == "bussinessRegistration") {

                    tableHTML += '<tr>';
                    tableHTML += '<td>' + generateDateTime(data[i].lastModified) + '</td>';
                    tableHTML += '<td><a onclick="downloadFileRM(\'' + data[i].id + '\')" class="lato-bold-18 link-color-blue text-underline text-blue-underline cursor-pointer" target="_blank" rel=”noopener noreferrer”>' + data[i].fileName + '</a></td>';
                    tableHTML += '</tr>';

                } else {

                }
            }

            tableHTML += '</tbody></table>';
            // Assuming you have an element with the id "documentTable" where you want to display the table.
            $('#documentHistoryTableBusinessRegistration').html(tableHTML);

        }
    });
}
function getDocumentHistorySalinanICWakil(id) {
    var arrayReturn = [];
    $.ajax({
        url: dataIP + '/api/rakanMikro/historyUploadedDocuments?id=' + id + '&userid=' + localStorage.getItem('rmID'),
        type: "get",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
        },
        contentType: "application/json; charset-utf-8",
        success: function (data) {
            //console.log(data)

            $(".card_title, .card_description, .card_image").removeClass("loading");
            $(".fade-in").fadeIn();

            var tableHTML = '<table><thead><tr><th>Date & Time</th><th>Document Uploaded</th></tr></thead><tbody>';

            for (var i = 0, len = data.length; i < len; i++) {

                let docType = data[i].docType;

                if (docType == "assigneeMyKad" || docType == "assigneeMyKadBack") {

                    tableHTML += '<tr>';
                    tableHTML += '<td>' + generateDateTime(data[i].lastModified) + '</td>';
                    tableHTML += '<td><a onclick="downloadFileRM(\'' + data[i].id + '\')" class="lato-bold-18 link-color-blue text-underline text-blue-underline cursor-pointer" target="_blank" rel=”noopener noreferrer”>' + data[i].fileName + '</a></td>';
                    tableHTML += '</tr>';

                } else {

                }

            }

            tableHTML += '</tbody></table>';
            // Assuming you have an element with the id "documentTable" where you want to display the table.
            $('#documentHistoryTableSalinanICWakil').html(tableHTML);

        }
    });
}

function displayStatusAkaun(statusid) {    

    if (statusid == 4) {
        $('#displayStatusAkaun').show();
        getAccountStatus();
        
        
    } else {
        $('#displayStatusAkaun').hide();
    }

}

function getAccountStatus() {

    if (accountStatus == "Active") {
        $("input[name='statusAkaunRM'][value='2']").prop("checked", true);

    } else if (accountStatus == "Suspended") {
        $("input[name='statusAkaunRM'][value='3']").prop("checked", true);

    } else if (accountStatus == "Closed") {
        $("input[name='statusAkaunRM'][value='4']").prop("checked", true);
        $("#rmStatusActive").prop({ disabled: true, checked: false });
        $("#rmStatusSuspended").prop({ disabled: true, checked: false });

    }
}

function displayFormSuspendClosed() {

    $("input[name='statusAkaunRM']").on("change", function () {
        let value = $(this).val();

        if (accountStatus == "Active") {
            
            if (value == 3) {

                $('.suspendedDocumentForm').show();
                $('.closedDocumentForm').hide();
                $('.activeForm').hide();

            } else if (value == 4) {

                $('.suspendedDocumentForm').hide();
                $('.closedDocumentForm').show();
                $('.activeForm').hide();

            }  else {

                $('.suspendedDocumentForm').hide();
                $('.closedDocumentForm').hide();
                $('.activeForm').hide();

            }


        } else if (accountStatus == "Suspended") {

            if (value == 3) {

                $('.suspendedDocumentForm').hide();
                $('.closedDocumentForm').hide();
                $('.activeForm').hide();

            } else if (value == 4) {

                $('.suspendedDocumentForm').hide();
                $('.closedDocumentForm').show();
                $('.activeForm').hide();

            } else if (value == 2) {

                $('.suspendedDocumentForm').hide();
                $('.closedDocumentForm').hide();
                $('.activeForm').show();

            } else {

                $('.suspendedDocumentForm').hide();
                $('.closedDocumentForm').hide();
                $('.activeForm').hide();

            }


        } else if (accountStatus == "Closed") {

            $('.suspendedDocumentForm').hide();
            $('.closedDocumentForm').hide();
            $('.activeForm').hide();

        }


    });

}

//var arrSuspendFile = [];
//var arrClosedFile = [];

function getSuspendedForm() {
    dpSuspendForm = $("#suspendDocument").dropzone({
        addRemoveLinks: true,
        maxFilesize: 15, // MB
        maxFiles: 3,
        acceptedFiles: "image/jpeg,image/jpg, application/pdf",
        dictFileTooBig: "Fail terlalu besar ({{filesize}}MB). Saiz maksimum: {{maxFilesize}}MB.",
        dictInvalidFileType: "Sila muatnaik jenis fail yang dibenarkan.",
        dictCancelUpload: "Padam fail",
        dictMaxFilesExceeded: "Hanya tiga fail dibenarkan muatnaik",
        dictRemoveFile: "Padam fail",
        sending: function (file) {
            arrSuspendFile = [];
        },
        complete: function (file) {
            getFileSuspendedForm(file);
            hideProgressAfterComplete(file.previewElement);
        }
    });
}

function getFileSuspendedForm(file) {
    //fileSuspendForm = file;
    arrSuspendFile.push(file);
}

function getClosedForm() {
    dpClosedForm = $("#closedDocument").dropzone({
        addRemoveLinks: true,
        maxFilesize: 15, // MB
        maxFiles: 3,
        acceptedFiles: "image/jpeg,image/jpg, application/pdf",
        dictFileTooBig: "Fail terlalu besar ({{filesize}}MB). Saiz maksimum: {{maxFilesize}}MB.",
        dictInvalidFileType: "Sila muatnaik jenis fail yang dibenarkan.",
        dictCancelUpload: "Padam fail",
        dictMaxFilesExceeded: "Hanya tiga fail dibenarkan muatnaik",
        dictRemoveFile: "Padam fail",
        sending: function (file) {
            arrClosedFile = [];
        },
        complete: function (file) {
            getFileClosedForm(file);
            hideProgressAfterComplete(file.previewElement);
        }
    });
}

function getFileClosedForm(file) {
    //fileClosedForm = file;
    arrClosedFile.push(file);
}

function hideProgressAfterComplete(id) {
    if (id) {
        $(id).find('.dz-progress').css('opacity', '0');
    }
}

function postSuspendClosedDocument(mainDocForm) {
    var apiRakanMikroAccountStatus = dataIP + '/api/upload/RakanMikroAccountStatus';
    var token = localStorage.getItem("token");
    $.ajax({
        url: apiRakanMikroAccountStatus,
        type: 'post',
        contentType: false,
        processData: false,
        data: mainDocForm,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        success: function (data, status, xhr) {

        }, error: function () {

        }
    });
}
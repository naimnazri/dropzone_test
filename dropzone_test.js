var backfl = {
	kematian_document0: [],
	kematian_document1: [],
	kematian_document2: [],
	kematian_document3: [],
	kematian_document4: [],
	kematian_document5: [],
	kematian_document6: [],
	kematian_document7: [],
	kematian_document8: [],
	kematian_document9: [],
	kematian_document10: [],
};

var dropzoneInstance;
var tuntutanKematianForm;
var tuntutanKematianDocument;
var canUpload = true;
var userid;
var claimID;
var claimNo;
var currentFileList = [];
var checkEffDateStart;
var checkEffDateEnd;
var successFileUpload = 0;
let isUploading = false;
var alertShown = false;
var stat;
var initialFileCounts = {};
var isFilesChanged = [];

var descSalinanGeran = "Salinan geran probet/surat kuasa mentadbir/sijil faraid. Sekiranya tiada, sila kemukakan: Sijil Perkahwinan, jika Penuntut adalah pasangan / Sijil Kelahiran Penuntut, jika Penuntut adalah anak / Sijil Kelahiran Si Mati, jika Penuntut adalah ibu/ayah";

let documentText = [
	"Borang Tuntutan Kematian",
	"Sijil Kematian",
	"Kad Pengenalan Penuntut",
	"Kad Pengenalan Si Mati",
	descSalinanGeran,
	"Borang Tuntutan Manfaat Kematian",
	"Laporan Polis",
	"Laporan Bedah Siasat",
	"Laporan Toksikologi",
	"Potongan akhbar",
	"Lain-lain"
]

Dropzone.autoDiscover = false;

function createDropzoneElement() {

	let documentType = [
		"Borang Tuntutan Kematian",
		"Sijil Kematian",
		"Kad Pengenalan Penuntut",
		"Kad Pengenalan Si Mati",
		descSalinanGeran,
		"Borang Tuntutan Manfaat Kematian",
		"Laporan Polis",
		"Laporan Bedah Siasat",
		"Laporan Toksikologi",
		"Potongan akhbar",
		"Lain-lain"
	]

	documentType.forEach((item, index) => {
		$(`#kematianDocument${index}Label`).text(item);
		getTuntutanDocuments(index)

		if (index < 5) {
			$(`#kematianDocument${index}Label`).append('<span class="error">*</span>');
		}
	})

	documentText.forEach((item, index) => {
		$(`#dokumenLabel${index}`).text(item);

		$(`#btnEdit${index}`).click(function () {
			$(`#btnCloseEdit${index}`).show()
			$(`#btnEdit${index}`).hide()
			$(`#div_kematian_document${index}`).show()

			$(`#attach_kematian_document${index}`).hide()
		});

		$(`#btnCloseEdit${index}`).click(function () {
			$(`#btnCloseEdit${index}`).hide()
			$(`#btnEdit${index}`).show()

			$(`#div_kematian_document${index}`).hide()

			$(`#attach_kematian_document${index}`).show()
		});
	})
}

function getBackfiles(id, file) {
	backfl[`kematian_document${id}`] = file ?? [];
}

/* Upload documents tuntutan */
function getTuntutanDocuments(id) {
	var token_claimant = localStorage.getItem("token_claimant");

	dropzoneInstance = $(`form#dropzone_kematian_document${id}`).dropzone({
		addRemoveLinks: true,
		maxFilesize: 5, // MB
		dictFileTooBig: "Fail terlalu besar ({{filesize}}MB). Saiz maksimum: {{maxFilesize}}MB.",
		dictInvalidFileType: "Sila muatnaik jenis fail yang dibenarkan.",
		uploadMultiple: true,
		parallelUploads: 1,
		maxFiles: 50,
		acceptedFiles: "image/jpeg, image/jpg, image/png, application/pdf",
		dictCancelUpload: "Delete File",
		init: function () {
			var dropzone = this;
			var maxFileSizeMB = 5;
			var alertShown = false;
			var initialFileCount = dropzone.getAcceptedFiles().length;
			initialFileCounts[id] = initialFileCount;
			var updatedFileCount = dropzone.getAcceptedFiles().length;

			function getTotalFileSize() {
				var totalSize = 0;
				dropzone.getAcceptedFiles().forEach(function (file) {
					totalSize += file.size;
				});
				return totalSize;
			}

			function updateErrorMessage(maxFileSizeMB) {
				var totalSizeMB = getTotalFileSize() / (1024 * 1024); // Convert to MB
				if (totalSizeMB > maxFileSizeMB && !alertShown) {
					alert(`Saiz fail dokumen telah melebihi 5MB (${totalSizeMB.toFixed(2)}MB). Sila pastikan saiz tidak melebihi 5MB.`);
					alertShown = true;
					$(`#errorDocument${id}`).text("*Sila pastikan saiz tidak melebihi 5MB.");
					$(`#errorDocument${id}`).show();
				}
				else {
					$(`#errorDocument${id}`).text("");
					$(`#errorDocument${id}`).hide();
				}
			}

			this.on("success", function (serverResponse) {
				var status = serverResponse.status;

				if (status == "success") {
					localStorage.setItem("upload", 1);
				}

				getBackfiles(id, this.getAcceptedFiles());
			});

			let addButton = $(`<span class="link-color-blue text-underline font-weight-bold d-flex py-4 justify-content-center cursor-pointer" style="cursor:pointer;">Pilih Fail<img src="/Content/images/icon-plus-circle-v2.svg" class="pl-2" width="25px"></span>`);
			addButton.click(function () {
				dropzone.hiddenFileInput.click();
			});
			$(`#dropzone_kematian_document${id}`).children(':last').after(addButton);


			currentFileList.forEach((item) => {
				if (id == +item.docType.replace('kematian_document', '').slice(0, 1)) {
					$.ajax({
						url: dataIP + `/api/download/AdditionalClaimDoc?id=${item.id}&userid=${userid}`,
						type: "get",
						beforeSend: function (xhr) {
							xhr.setRequestHeader('Authorization', 'Bearer ' + token_claimant);
						},
						cache: false,
						xhrFields: {
							responseType: 'blob'
						},
						success: function (data, status, xhr) {
							const fileType = xhr.getResponseHeader("content-type");

							if (status == 'success') {
								let index = +item.docType.replace('kematian_document', '').slice(0, 1)
								var myBlob = data;
								var myFile = blobToFile(myBlob, documentText[index], fileType);

								dropzone.emit("addedfile", myFile);
								dropzone.emit("complete", myFile);

								backfl[item.docType.slice(0, 18)].push([myFile] ?? []);
							}
						}
					})
				}
			})

			this.on("addedfile", function (file) {
				getBackfiles(id, dropzone.getAcceptedFiles());

				if (initialFileCounts[id] !== updatedFileCount) {
					isFilesChanged.push(true);
				}
				else {
					isFilesChanged.push(false);
				}
			});

			this.on("removedfile", function (file) {
				$(`#btnCloseEdit${id}`).remove();

				getBackfiles(id, dropzone.getAcceptedFiles());

				if (backfl[`kematian_document${id}`].length > 0) {
					$(`#checkDocument${id}`).addClass("valid");
					$(`#checkDocument${id}`).removeClass("invalid");
				} else {
					$(`#checkDocument${id}`).removeClass("valid");
					$(`#checkDocument${id}`).addClass("invalid");
					$(`#errorDocument${id}`).hide();
				}

				if (dropzone.getRejectedFiles().length > 0) {
					canUpload = false;
				} else {
					canUpload = true;
				}

				if (file.previewElement != null && file.previewElement.parentNode != null) {
					file.previewElement.parentNode.removeChild(file.previewElement);
				}
				dropzone._updateMaxFilesReachedClass();
				alertShown = false;
				updateErrorMessage(maxFileSizeMB);

				if (initialFileCounts[id] !== updatedFileCount) {
					isFilesChanged.push(true);
				}
				else {
					isFilesChanged.push(false);
				}
			});

			this.on("complete", function (file) {
				getBackfiles(id, dropzone.getAcceptedFiles());
				hideProgressAfterComplete(file.previewElement);

				$(`#checkDocument${id}`).addClass("valid");
				$(`#checkDocument${id}`).removeClass("invalid");
				$(`#errorDocument${id}`).hide();

				if (dropzone.getRejectedFiles().length > 0) {
					canUpload = false;
				} else {
					canUpload = true;
				}
				alertShown = false;
			});

			this.on("maxfilesexceeded", function (file) {
				this.removeFile(file);
			});

			this.on("queuecomplete", function () {
				getBackfiles(id, dropzone.getAcceptedFiles());

				if (!alertShown) {
					updateErrorMessage(maxFileSizeMB);
					alertShown = true;

				}
			});
		}
	});
}

$(document).ready(function () {

	if (localStorage.getItem("token_claimant")) {
		getLoginDetails();
	} else {
		createDropzoneElement();
	}

	$("#displayConsent").on("click", () => {

		validateICFormat();
		var token_claimant = localStorage.getItem("token_claimant");
		isError = []

		//new
		if (!token_claimant) {
			for (var i = 0; i < 5; i++) {
				if (backfl[`kematian_document${i}`].length <= 0) {
					$(`#errorDocument${i}`).show()
					isError.push(true);
				} else {
					$(`#errorDocument${i}`).hide()
					isError.push(false);
				}
			}

			if ($("#tuntutanKematianForm").valid() && !isError.includes(true)) {
				$("#modal_consent").modal("show");

				$("[name^='consent']").change(function () {
					if (!$("[name^='consent']").not(':checked').length > 0) {
						$("#hantarFormTuntutan").prop("disabled", false)
					} else {
						$("#hantarFormTuntutan").prop("disabled", true)
					}
				});

				$('#modal_consent').on('hidden.bs.modal', function () {
					$("[name^='consent']").attr('checked', false);
				})
			}
		}
		//update
		else {
			isFilesChanged = [];

			for (var i = 0; i < 5; i++) {
				if ($(`#attach_kematian_document${i} a`).length <= 0 || $(`#dropzone_kematian_document${i} .dz-preview`).length <= 0) {
					$(`#errorDocument${i}`).show()
					isError.push(true);
				} else {
					$(`#errorDocument${i}`).hide()
					isError.push(false);
				}
			}

			//check for file changes
			for (let i = 0; i < 11; i++) {
				const initialCount = initialFileCounts[i];

				const currentCount = backfl[`kematian_document${i}`].length;

				if (initialCount !== currentCount) {
					isFilesChanged.push(true);
				} else {
					isFilesChanged.push(false);
				}
			}

			console.log(isFilesChanged, $("#tuntutanKematianForm").valid(), !isError.includes(true), isFilesChanged.includes(true))

			const allNoChanges = isFilesChanged.every(hasChanges => !hasChanges);

			if (allNoChanges) {//no changes made
				alert('Sila tambah/kemaskini dokumen sokongan untuk tujuan rayuan.');
			} else {
				if ($("#tuntutanKematianForm").valid() && !isError.includes(true)) {
					$("#modal_consent").modal("show");

					$("[name^='consent']").change(function () {
						if (!$("[name^='consent']").not(':checked').length > 0) {
							$("#hantarFormTuntutan").prop("disabled", false)
						} else {
							$("#hantarFormTuntutan").prop("disabled", true)
						}
					});

					$('#modal_consent').on('hidden.bs.modal', function () {
						$("[name^='consent']").attr('checked', false);
					})
				}
			}
		}

	})

	$('#tarikhKematian').on('change', function () {
		var eventDay = $('#tarikhKematian').val();

		if (eventDay != '') {
			if (eventDay < checkEffDateStart || eventDay > checkEffDateEnd) {
				$("#modal_failTambah").modal('show');
				$('#modal_failTambah #modalText').text('Harap maaf. Tarikh berikut tidak termasuk dalam tempoh perlindungan.');

				$('#modal_failTambah #reset').on('click', function () {
					$("#modal_failTambah").modal('hide');

					$('#tarikhKematian').val('');
					eventDay = '';
				});
			}
		}
	});

	/* Submit form */
	$("#hantarFormTuntutan").on("click", () => {
		submitForm();
	})

	setFormValidation();
	getHubunganList();
	getBankList();
})

function getLoginDetails() {
	var token_claimant = localStorage.getItem("token_claimant");
	$.ajax({
		url: dataIP + "/api/account/LoginDetails",
		contentType: 'application/json',
		type: "get",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + token_claimant);
		},
		contentType: "application/json; charset-utf-8",
		success: function (data) {
			userid = data.id;
			getTuntutanDetails(data)
		}
	});
}

function getTuntutanDetails({ id, username }) {
	var token_claimant = localStorage.getItem("token_claimant");
	$.ajax({
		url: dataIP + "/api/claim/TuntutanThirdParty?userid=" + id,
		contentType: 'application/json',
		type: "get",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + token_claimant);
		},
		contentType: "application/json; charset-utf-8",
		success: function (data) {
			let info = data[0];

			stat = info.claimStatusName;
			retentionControl(stat);

			let deathDate = new Date(info.deathDate)
			let deathYear = deathDate.getFullYear()
			let deathMonth = deathDate.getMonth() + 1 < 10 ? "0" + (deathDate.getMonth() + 1) : deathDate.getMonth() + 1;
			let deathDay = deathDate.getDate() + 1 < 10 ? "0" + deathDate.getDate() : deathDate.getDate()

			$("#namaPenuh").val(info.applicantName)
			$("#noKadPengenalan").val(info.applicantIcNo)
			$("#tarikhKematian").val(`${deathYear}-${deathMonth}-${deathDay}`)
			//$("#tarikhKematian").val(`${deathDay}/${deathMonth}/${deathYear}`)
			$("#namaPenuhPenuntut").val(info.claimantName)
			$("#noKadPengenalanPenuntut").val(info.claimantIcNo)
			$("#nomborTelefonPenuntut").val(info.claimantTelNo)
			$("#alamatEmelPenuntut").val(info.claimantEmail)
			$("#hubunganPenuntut").val(info.claimantRelationshipID);
			$("#lainLainHubunganPenuntut").val(info.claimantRelationshipLainLain);
			$("#bankID").val(info.bankID);
			$("#accountNumber").val(info.accountNo);

			$("#tuntutanKematianForm input").prop("disabled", true);
			$("#tuntutanKematianForm select").prop("disabled", true);

			claimID = info.claimID;
			claimNo = info.claimNo;

			getDocumentList(info.claimNo, id)
		}
	});
}

function retentionControl(stat) {
	if (stat == "Telah Diluluskan") {//Approved
		$('[id^="btnEdit"]').hide();
		$('[id^="displayConsent"]').hide();
	}
	else if (stat == "Rayuan") {//Declined
		$('[id^="kemaskini"]').text("HANTAR RAYUAN");
	}
	//else default (able to edit & view files)
}

function getDocumentList(claimNo, id) {
	var token_claimant = localStorage.getItem("token_claimant");

	$.ajax({
		url: dataIP + `/api/claim/listDocuments?claimNumber=${claimNo}&userid=${id}`,
		contentType: 'application/json',
		type: "get",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + token_claimant);
		},
		contentType: "application/json; charset-utf-8",
		success: function (data) {

			currentFileList = data;
			createDropzoneElement();

			data.forEach((item) => {
				let index = item.docType.replace('kematian_document', '').split("-")[0];
				let val = item.docType.replace('kematian_document', '');

				$(`#div_kematian_document${index}`).hide();
				$(`#attach_kematian_document${index}`).show();
				$(`#btnEdit${index}`).show();

				$(`#list_kematian_document${index}`).append(
					`<a id="link_kematian_document${val}" data-id="${item.id}" onclick="getDokumenDownload(this)" 
					class="lato-bold-18 link-color-blue text-underline text-blue-underline cursor-pointer"
					target="_blank" rel="”noopener" noreferrer”="">${item.fileName}</a>
					<span class="cursor-pointer" onclick="deleteFile(this)" data-doc-id="${item.id}">
					<img class="img-fluid cursor-pointer mx-0 mx-md-2" src="/Content/images/delete_icon_v2.svg"
					alt="Card image cap" max-width="24px;" style="height:24px;"></span><br/><br>`
				)
			})
		}
	});
}

function deleteFile(id) {
	var docId = $(id).attr('data-doc-id');
	$('#deleteFileId').val(docId);
	$('#modal_confirmDelete').modal('show');
}

function deleteSpecificFile() {
	$('#modal_loadingUpdate').modal('show');
	$('#modal_confirmDelete').modal('hide');

	var fileID = $('#deleteFileId').val();

	var apiDeleteFile = dataIP + '/api/claim/ClaimDocument?claimNumber=' + claimNo + '&documentID=' + fileID + '&userid=' + userid;
	var token_claimant = localStorage.getItem("token_claimant");
	$.ajax({
		url: apiDeleteFile,
		type: "delete",
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + token_claimant);
		},
		contentType: "application/json; charset=utf-8",
		success: function () {
			$('#modal_loadingUpdate').modal('hide');
			window.location.reload();
		},
		error: function (xhr, status, error) {
			$("#modalGagalTuntutan").modal('show');

			$('#modalGagalTuntutan #close').on('click', function () {
				$('#modal_loadingUpdate').modal('hide');
			});
		}
	});
}

/* Set Form Validation */
function setFormValidation() {
	tuntutanKematianForm = $(`#tuntutanKematianForm`).validate({
		focusInvalid: false,
		invalidHandler: function (form, validator) {
			if (!validator.numberOfInvalids()) return;
			$("html, body").scrollTop($(validator.errorList[0].element).offset().top - 100)
		},
		ignore: ":disabled",
		rules: {
			namaPenuh: {
				required: true,
			},
			noKadPengenalan: {
				required: true,
				maxlength: 12,
				minlength: 12
			},
			tarikhKematian: {
				required: true,
			},
			namaPenuhPenuntut: {
				required: true,
			},
			noKadPengenalanPenuntut: {
				required: true,
				maxlength: 12,
				minlength: 12
			},
			nomborTelefonPenuntut: {
				required: true,
			},
			alamatEmelPenuntut: {
				required: true,
				email: true,
			},
			hubunganPenuntut: {
				required: true,
			},
			bankID: {
				required: true,
			},
			accountNumber: {
				required: true,
			},
		},
		messages: {
			namaPenuh: {
				required: "*Sila lengkapkan medan ini",
			},
			noKadPengenalan: {
				required: "*Sila lengkapkan medan ini",
				maxlength: "*Tidak boleh melebihi 12 angka",
				minlength: "*Tidak boleh kurang dari 12 angka"
			},
			tarikhKematian: {
				required: "*Sila lengkapkan medan ini",
			},
			namaPenuhPenuntut: {
				required: "*Sila lengkapkan medan ini",
			},
			noKadPengenalanPenuntut: {
				required: "*Sila lengkapkan medan ini",
				maxlength: "*Tidak boleh melebihi 12 angka",
				minlength: "*Tidak boleh kurang dari 12 angka"
			},
			nomborTelefonPenuntut: {
				required: "*Sila lengkapkan medan ini",
			},
			alamatEmelPenuntut: {
				required: "*Sila lengkapkan medan ini",
				email: "*Sila masukkan alamat emel mengikut format yang betul"
			},
			hubunganPenuntut: {
				required: "*Sila lengkapkan medan ini",
			},
			lainLainHubunganPenuntut: {
				required: "*Sila lengkapkan medan ini",
			},
			bankID: {
				required: "*Sila lengkapkan medan ini",
			},
			accountNumber: {
				required: "*Sila lengkapkan medan ini",
			},
		},
	});

	$("#nomborTelefonPenuntut").rules("add", { regexNoTelefon: /^\d{3}-\d{7,8}$/ })
	$("#alamatEmelPenuntut").rules("add", {
		regexAlamatEmel: /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/
	});

	/* set maximum date for input date*/
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	var dd = yesterday.getDate() < 10 ? "0" + yesterday.getDate() : yesterday.getDate();
	var mm = yesterday.getMonth() + 1 < 10 ? "0" + (yesterday.getMonth() + 1) : yesterday.getMonth() + 1; //January is 0!
	var yyyy = yesterday.getFullYear();

	document.getElementById("tarikhKematian").setAttribute("max", `${yyyy}-${mm}-${dd}`);

}

function blobToFile(theBlob, docType, fileType) {
	let blob = new Blob([theBlob], { type: fileType });
	return new File([blob], docType, { lastModified: Date.now(), type: fileType },);
}

function hideProgressAfterComplete(id) {
	if (id) {
		$(id).find('.dz-progress').css('opacity', '0');
	}

}

/* Get Hubungan List */
function getHubunganList() {
	var arrayReturn = [];
	var token_claimant = localStorage.getItem("token_claimant");
	$.ajax({
		url: dataIP + "/ListOfRelationship",
		contentType: 'application/json',
		type: "get",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + token_claimant);
		},
		contentType: "application/json; charset-utf-8",
		success: function (data) {
			var item = {};
			var options = "";
			for (var i = 0; i < data.length; i++) {
				options += "<option class='lato-18-regular' value=" + data[i].relationshipID + ">" + data[i].relationshipDesc + "</option>";
				arrayReturn.push(item);
			}
			$("#hubunganPenuntut").append(options);


			$("#hubunganPenuntut").on("change", function () {
				var selectedOption = $(this).val();
				var lainLainHubunganPenuntutInput = $("#lainLainHubunganPenuntut");

				if (selectedOption == 8 && lainLainHubunganPenuntutInput.val().trim() !== "") {
					$("#lainLainHubunganPenuntut-error").addClass("d-none");
					$("#lainLainHubunganPenuntut").removeClass("d-none");
					lainLainHubunganPenuntutInput.prop("required", true);
				}
				else if (selectedOption == 8 && lainLainHubunganPenuntutInput.val().trim() == "") {
					$("#lainLainHubunganPenuntut-error").removeClass("d-none");
					$("#lainLainHubunganPenuntut").removeClass("d-none");
					lainLainHubunganPenuntutInput.prop("required", true);
				}
				else {
					$("#lainLainHubunganPenuntut-error").addClass("d-none");
					$("#lainLainHubunganPenuntut").addClass("d-none");
					lainLainHubunganPenuntutInput.prop("required", false);
				}
			});

		}
	});
}

/* Get Bank List */
function getBankList() {
	var arrayReturn = [];
	var token_claimant = localStorage.getItem("token_claimant");
	$.ajax({
		url: dataIP + "/ListOfBank",
		contentType: 'application/json',
		type: "get",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + token_claimant);
		},
		contentType: "application/json; charset-utf-8",
		success: function (data) {
			var item = {};
			var options = "";
			for (var i = 0; i < data.length; i++) {
				options += "<option class='lato-18-regular' value=" + data[i].bankID + ">" + data[i].bankName + "</option>";
				arrayReturn.push(item);
			}
			$("#bankID").append(options);

			validateAccountLength(data);
		}
	});
}

//check acc no length limit
function validateAccountLength(data) {
	var errText;

	$("#bankID").on("change", function () {
		var selectedBankID = $(this).val();
		var selectedBank = data.find(bank => bank.bankID == selectedBankID);

		var savAcc = selectedBank.savingAccLenght;
		var currAcc = selectedBank.currentAccLenght;

		var checkAccNo;

		$("#accountNumber").val("");
		$("#accountNumber-error").text("");

		if (selectedBank && savAcc) {

			if (savAcc.length >= currAcc.length) {
				checkAccNo = savAcc;
			}

			//12 Digits
			if ((selectedBank.bankID == 1 || selectedBank.bankID == 6 || selectedBank.bankID == 10 || selectedBank.bankID == 24) || checkAccNo == "12 Digits") {
				$("#accountNumber").attr("minlength", 12).attr("maxlength", 12);
				errText = "Sila masukkan sekurang-kurangnya 12 digit";

				//15 Digits
			} else if ((selectedBank.bankID == 2 || selectedBank.bankID == 27) || checkAccNo == "15 Digits") {
				$("#accountNumber").attr("minlength", 15).attr("maxlength", 15);
				errText = "Sila masukkan sekurang-kurangnya 15 digit";

				//13 Digits
			} else if ((selectedBank.bankID == 3 || selectedBank.bankID == 30) || checkAccNo == "13 Digits") {
				$("#accountNumber").attr("minlength", 13).attr("maxlength", 13);
				errText = "Sila masukkan sekurang-kurangnya 13 digit";

				//14 Digits
			} else if ((selectedBank.bankID == 4 || selectedBank.bankID == 5 || selectedBank.bankID == 12) || checkAccNo == "14 Digits") {
				$("#accountNumber").attr("minlength", 14).attr("maxlength", 14);
				errText = "Sila masukkan sekurang-kurangnya 14 digit";

				//10 & 14 Digits
			} else if ((selectedBank.bankID == 7) || checkAccNo == "10 & 14 Digits") {
				$("#accountNumber").attr("minlength", 10).attr("maxlength", 14);
				errText = "Sila masukkan sekurang-kurangnya 10 digit";

				//11 & 13 Digits
			} else if ((selectedBank.bankID == 9) || checkAccNo == "11 & 13 Digits") {
				$("#accountNumber").attr("minlength", 11).attr("maxlength", 13);
				errText = "Sila masukkan sekurang-kurangnya 11 digit";

				//10 Digits
			} else if ((selectedBank.bankID == 11 || selectedBank.bankID == 14) || checkAccNo == "10 Digits") {
				$("#accountNumber").attr("minlength", 10).attr("maxlength", 10);
				errText = "Sila masukkan sekurang-kurangnya 10 digit";

				//9 to 16 Digits
			} else if ((selectedBank.bankID == 13) || checkAccNo == "9 to 16 Digits") {
				$("#accountNumber").attr("minlength", 9).attr("maxlength", 16);
				errText = "Sila masukkan sekurang-kurangnya 9 digit";

				//12, 13, 14, 15 & 17 Digits
			} else if (selectedBank.bankID == 15) {
				$("#accountNumber").attr("minlength", 12).attr("maxlength", 17);
				errText = "Sila masukkan sekurang-kurangnya 12 digit";

				//5 to 17 Digits
			} else if ((selectedBank.bankID == 16) || checkAccNo == "5 to 17 Digits") {
				$("#accountNumber").attr("minlength", 5).attr("maxlength", 17);
				errText = "Sila masukkan sekurang-kurangnya 5 digit";

				//16 Digits
			} else if ((selectedBank.bankID == 17 || selectedBank.bankID == 22) || checkAccNo == "16 Digits") {
				$("#accountNumber").attr("minlength", 16).attr("maxlength", 16);
				errText = "Sila masukkan sekurang-kurangnya 16 digit";

				//7, 9, 10, 11, 12, 13, 14 & 17 Digits
			} else if (selectedBank.bankID == 18) {
				$("#accountNumber").attr("minlength", 7).attr("maxlength", 17);
				errText = "Sila masukkan sekurang-kurangnya 7 digit";

				//10-17 Digits
			} else if ((selectedBank.bankID == 19 || selectedBank.bankID == 23) || checkAccNo == "10-17 Digits") {
				$("#accountNumber").attr("minlength", 10).attr("maxlength", 17);
				errText = "Sila masukkan sekurang-kurangnya 10 digit";

				//7, 9 & 10 Digits
			} else if ((selectedBank.bankID == 20) || checkAccNo == "7, 9 & 10 Digits") {
				$("#accountNumber").attr("minlength", 7).attr("maxlength", 10);
				errText = "Sila masukkan sekurang-kurangnya 7 digit";

				//5-17 Digits
			} else if ((selectedBank.bankID == 21) || checkAccNo == "5-17 Digits") {
				$("#accountNumber").attr("minlength", 5).attr("maxlength", 17);
				errText = "Sila masukkan sekurang-kurangnya 5 digit";

				//6 Digits
			} else if ((selectedBank.bankID == 25) || checkAccNo == "6 Digits") {
				$("#accountNumber").attr("minlength", 6).attr("maxlength", 6);
				errText = "Sila masukkan sekurang-kurangnya 6 digit";

				//8 Digits
			} else if ((selectedBank.bankID == 26) || checkAccNo == "8 Digits") {
				$("#accountNumber").attr("minlength", 8).attr("maxlength", 8);
				errText = "Sila masukkan sekurang-kurangnya 8 digit";

				//13 & 15 Digits
			} else if ((selectedBank.bankID == 31) || checkAccNo == "13 & 15 Digits") {
				$("#accountNumber").attr("minlength", 13).attr("maxlength", 15);
				errText = "Sila masukkan sekurang-kurangnya 13 digit";

				// sila pilih (undefined)
			} else if (selectedBank.bankID == undefined) {
				$("#accountNumber").removeAttr("minlength").removeAttr("maxlength");
				errText = "Sila masukkan no. akaun bank yang sah!";

				// null or '-'
			} else {
				$("#accountNumber").removeAttr("minlength").removeAttr("maxlength");
				errText = "Sila masukkan no. akaun bank yang sah!";
			}

			// sila pilih (undefined)
		} else if (selectedBank.bankID == undefined) {
			$("#accountNumber").removeAttr("minlength").removeAttr("maxlength");
			errText = "Sila masukkan no. akaun bank yang sah!";

			// null or '-'
		} else {
			$("#accountNumber").removeAttr("minlength").removeAttr("maxlength");
			errText = "Sila masukkan no. akaun bank yang sah!";
		}

	});



	$("#accountNumber").on("blur", function () {
		$("#accountNumber-error").text(errText);

	});

}

/* #1 validate if deceased's NRIC match with customer record  */
function verifyDeceasedIC() {
	let icNo = document.getElementById("noKadPengenalan").value
	let icNoC = document.getElementById("noKadPengenalanPenuntut").value

	if ($("#noKadPengenalan").valid() && $("#noKadPengenalan").val() != null) {
		if (icNo !== icNoC) {
			var token_claimant = localStorage.getItem("token_claimant");
			$.ajax({
				url: dataIP + `/VerifyCustomer?icNumber=${icNo}`,
				contentType: 'application/json',
				type: "get",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer ' + token_claimant);
				},
				contentType: "application/json; charset-utf-8",
				success: function (data) {

					if (data.verified) {
						$("#modalFailIC").modal("hide")
						$("#noKadPengenalan").removeClass('error-input');

						let products = data.products;
						let prodList = products.map(product => product.productID);

						//checking for coverage period
						let productWithID1 = products.find(product => product.productID);
						let effDateStart = productWithID1.effectiveDateStart;
						checkEffDateStart = moment(effDateStart).format('YYYY-MM-DD');
						let effDateEnd = productWithID1.effectiveDateEnd;
						checkEffDateEnd = moment(effDateEnd).format('YYYY-MM-DD');

						//console.log(checkEffDateStart, checkEffDateEnd);

					} else {
						$("#modalFailIC").modal("show")
						$("#noKadPengenalan").addClass('error-input');
						$("#noKadPengenalan").val("");
					}

				}
			});
		} else {
			$("#modalFailICDeceasedNClaimant").modal("show")
			$("#noKadPengenalanPenuntut").addClass('error-input');
			$("#noKadPengenalan").val("");
			$("#noKadPengenalanPenuntut").val("");
		}
	}
}


// #2 validate if claimant's NRIC match with nominee of the respective certificate
function verifyClaimantIC() {

	let icNo = document.getElementById("noKadPengenalan").value
	let icNoC = document.getElementById("noKadPengenalanPenuntut").value

	if (icNo.length !== 0) {

		if ($("#noKadPengenalanPenuntut").valid()) {
			var token_claimant = localStorage.getItem("token_claimant");
			$.ajax({
				url: dataIP + `/verifyClaimant?icNumberClaimant=${icNoC}&icNumberUser=${icNo}`,
				contentType: 'application/json',
				type: "get",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer ' + token_claimant);
				},
				contentType: "application/json; charset-utf-8",
				success: function (data) {

					if (data.verified) {
						$("#modalFailICClaimant").modal("hide")
						$("#noKadPengenalanPenuntut").removeClass('error-input');
					} else if (icNoC === icNo) {
						$("#modalFailICDeceasedNClaimant").modal("show")
						$("#noKadPengenalan").addClass('error-input');
						$("#noKadPengenalanPenuntut").addClass('error-input');
						$("#noKadPengenalan").val("");
						$("#noKadPengenalanPenuntut").val("");
					} else {
						$("#modalFailICClaimant").modal("show")
						$("#noKadPengenalanPenuntut").addClass('error-input');
						$("#noKadPengenalanPenuntut").val("");
					}
				}
			});
		}
	} else {
		$("#modalEnterDeceasedID").modal("show")
		$("#noKadPengenalan").addClass('error-input');
		$("#noKadPengenalanPenuntut").val("");
		$("#noKadPengenalan").focus();
	}

}

function submitForm() {
	$("#modal_consent").modal("hide");

	$("#modal_loadingUpdate").modal("show");

	let fileList = [];
	Object.keys(backfl).forEach((keys) => {
		if (backfl[keys].length > 0) {
			fileList.push(backfl[keys][0])
		}
	})

	let data = {
		applicant: {
			"name": document.getElementById("namaPenuh").value,
			"icNo": document.getElementById("noKadPengenalan").value
		},
		benefitID: 4,
		deathClaim: {
			"deathDate": document.getElementById("tarikhKematian").value
		},
		claimant: {
			"name": document.getElementById("namaPenuhPenuntut").value,
			"icNo": document.getElementById("noKadPengenalanPenuntut").value,
			"telNo": document.getElementById("nomborTelefonPenuntut").value,
			"email": document.getElementById("alamatEmelPenuntut").value,
			"relationshipID": document.getElementById("hubunganPenuntut").value,
			"relationshipLainLain": document.getElementById("lainLainHubunganPenuntut").value,
			"bankID": document.getElementById("bankID").value,
			"accountNumber": document.getElementById("accountNumber").value
		}
	}

	if (!localStorage.getItem("token_claimant")) {
		$.ajax({
			url: dataIP + '/api/claim/TuntutanThirdParty?submit=false',
			dataType: 'json',
			type: 'post',
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(data),
			success: function (data, status, xhr) {
				if (status == "success") {
					if (data.claimID && data.claimNumber) {
						if (fileList.length > 0) {
							//var fd = new FormData();
							//fd.append('claimID', data.claimID);

							//Object.keys(backfl).forEach((keys) => {
							//	if (backfl[keys].length > 0) {
							//		backfl[keys].forEach((file, index) => {
							//			fd.append(`${keys}-${index}`, file);
							//		})
							//	}
							//})
							//console.table([...fd], backfl);
							//postTuntutanDocument(fd);

							//$("#modal_successTambah").modal('show');

							//$('#modal_successTambah').on('hidden.bs.modal', function () {
							//	location.reload();
							//	localStorage.removeItem("token_claimant");
							//	window.location = '/Main/TuntutanPerkhidmatan/Index?type=dokumen';
							//});
							let isUploading = false;

							window.addEventListener("beforeunload", function (e) {
								if (isUploading) {
									e.preventDefault();
									e.returnValue = "You have pending form submission. Leaving this page will cancel the progress. Are you sure you want to leave?";
								}
							});

							var promises = [];

							Object.keys(backfl).forEach((keys) => {
								if (backfl[keys].length > 0) {
									backfl[keys].forEach((file) => {
										var fd = new FormData();
										fd.append('claimID', data.claimID);
										fd.append(keys, file);

										var promise = postTuntutanDocument(fd);
										promises.push(promise);
									});
								}
							});

							isUploading = true;

							Promise.all(promises)
								.then(function () {
									$("#modal_successTambah").modal('show');

									data2 = {
										"claimID": data.claimID,
										"claimNumber": data.claimNumber
									}

									$('#modal_successTambah #btnModalSuccess').on('click', function () {
										$("#modal_loadingUpdate").modal("show");

										$.ajax({
											url: dataIP + '/api/claim/TuntutanThirdPartySubmit',
											dataType: 'json',
											type: 'post',
											contentType: "application/json; charset=utf-8",
											data: JSON.stringify(data2),
											success: function (data2, status, xhr) {

												localStorage.removeItem("token_claimant");
												window.location = '/Main/TuntutanPerkhidmatan/Index?type=dokumen';
											}
										});


									});
									console.log(successFileUpload);
								})
								.catch(function (error) {
									$("#modalGagalTuntutan").modal('show');
								})
								.finally(function () {
									isUploading = false;
									$("#modal_loadingUpdate").modal("hide");
								});
						}
					} $("#modal_loadingUpdate").modal("hide");
				} else {
					$("#modalGagalTuntutan").modal('show');
					$("#modal_loadingUpdate").modal("hide");
				}
			}, error: function (xhr, status, error) {
				$("#modalGagalTuntutan").modal('show');
				$("#modal_loadingUpdate").modal("hide");
			}
		});
	} else {

		if (fileList.length > 0) {
			//var fd = new FormData();
			//fd.append('claimID', claimID);

			//Object.keys(backfl).forEach((keys) => {
			//	if (backfl[keys].length > 0) {
			//		backfl[keys].forEach((file, index) => {
			//			fd.append(`${keys}-${index}`, file);
			//		})
			//	}
			//})
			//postTuntutanDocument(fd);
			var promises = [];

			Object.keys(backfl).forEach((keys) => {
				if (backfl[keys].length > 0) {
					backfl[keys].forEach((file) => {
						var fd = new FormData();
						fd.append('claimID', claimID);
						fd.append(keys, file);

						var promise = postTuntutanDocument(fd);
						promises.push(promise);
					});
				}
			});

			Promise.allSettled(promises)
				.then(function () {

					if (successFileUpload == 0) {
						$('#modalGagalTuntutan #modalText').text("Tuntutan gagal dihantar. Tiada dokumen baru dimuatnaik.");
						$("#modalGagalTuntutan").modal('show');
						$('#modalGagalTuntutan').on('hidden.bs.modal', function () {
							$("#modal_loadingUpdate").modal("hide");
							location.reload();
						});
					} else {
						$("#modal_successUpdate").modal('show');
						$('#modal_successUpdate').on('hidden.bs.modal', function () {
							$("#modal_loadingUpdate").modal("hide");
							location.reload();
						});
					}
				})
				.catch(function (error) {
					console.error("Error processing promises:", error);
				});
		}

	}
}

function postTuntutanDocument(fd) {
	return new Promise(function (resolve, reject) {

		var apiDeathClaimDocs = dataIP + '/api/upload/DeathClaimForm';
		$.ajax({
			url: apiDeathClaimDocs,
			type: 'post',
			contentType: false,
			processData: false,
			data: fd,
			success: function (data, status, xhr) {
				resolve();
				successFileUpload++;
			}, error: function () {

				if (!localStorage.getItem("token_claimant")) {

					if (successFileUpload == 0) {
						$('#modalGagalTuntutan #modalText').text("Tuntutan gagal dihantar.");
					}

					$("#modalGagalTuntutan").modal('show');
					$('#modalGagalTuntutan').on('hidden.bs.modal', function () {
						location.reload();
					});
				}
				reject();
			}
		});
	});
}

function getDokumenDownload(elem) {
	var token_claimant = localStorage.getItem("token_claimant");
	var id = $(elem).data('id')

	$.ajax({
		url: dataIP + `/api/download/AdditionalClaimDoc?id=${id}&userid=${userid}`,
		type: "get",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + token_claimant);
		},
		cache: false,
		xhrFields: {
			responseType: 'blob'
		},
		success: function (data, status, xhr) {
			if (status == 'success') {
				const fileType = xhr.getResponseHeader("content-type");
				var file = new Blob([data], { type: fileType });
				var fileURL = URL.createObjectURL(file);

				var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
				var isMobile = /^((?!Android|webOS|iPod|BlackBerry|IEMobile|Opera Mini|iPad).)*iPhone/i.test(navigator.userAgent);
				if (!isMobile && !isSafari) {
					window.open(fileURL, '_blank');
				}
				else {
					window.location.assign(fileURL);
				}
			}
		}
	})
}

function validateICFormat() {

	$("[id^='noKadPengenalan']").keyup(function () {

		var keep = $(this).val();

		var first = keep.substr(0, 2);  // year
		var second = keep.substr(2, 2); // month
		var third = keep.substr(4, 2);  // date

		var cutoff = (new Date()).getFullYear() - 2000;

		//convert 850510 to 85-05-10 : dateformat - yy-mm-dd
		var calBirthday = (first > cutoff ? '19' : '20') + first + '-' + second + '-' + third;

		//calculate age by birthday
		var cAge = moment().diff(calBirthday, 'years');
		//console.log(cAge);
		if (isNaN(cAge)) {
			$("#modalFailIC").modal('show');
			$("#modalFailIC #modalText").text('Sila masukkan nombor MyKad anda dengan betul');
			$(this).attr("value", ' ');
		}

		return false;
	});

}

/* add regex for no telefon */
$.validator.addMethod(
	"regexNoTelefon",
	function (value, element, regexp) {
		if (regexp.constructor != RegExp)
			regexp = new RegExp(regexp);
		else if (regexp.global)
			regexp.lastIndex = 0;
		return this.optional(element) || regexp.test(value);
	},
	"*Sila masukkan no telefon mengikut format yang betul (xxx-xxxxxxxx)"
);

/* add regex for email address */
$.validator.addMethod(
	"regexAlamatEmel",
	function (value, element, regexp) {
		if (regexp.constructor != RegExp)
			regexp = new RegExp(regexp);
		else if (regexp.global)
			regexp.lastIndex = 0;
		return this.optional(element) || regexp.test(value);
	},
	"*Sila masukkan alamat emel mengikut format yang betul"
);
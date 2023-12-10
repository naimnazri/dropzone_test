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

var currentFileList = [];
var successFileUpload = 0;
let isUploading = false;
var alertShown = false;

var initialFileCounts = {};
var isFilesChanged = [];

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

    createDropzoneElement();

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

});

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

function blobToFile(theBlob, docType, fileType) {
	let blob = new Blob([theBlob], { type: fileType });
	return new File([blob], docType, { lastModified: Date.now(), type: fileType },);
}

function hideProgressAfterComplete(id) {
	if (id) {
		$(id).find('.dz-progress').css('opacity', '0');
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
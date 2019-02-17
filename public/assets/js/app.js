// Grab the articles as a json
$(document).ready(function () {

  $.getJSON("/articles", function (data) {
    for (var i = 0; i < data.length; i++) {
      $("#articles").append("<div data-id='" + data[i]._id + "'>" + "<h2>" + data[i].question + "</h2>" + "<br/>" + data[i].answer + "</div>");
    }
  });

  $(document).on("click", "#savenote", function () {
    var thisId = $(this).attr("data-id");

    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function (data) {
        $("#notes").empty();
      });
    $("#bodyinput").val("");
  });

  $("#fetchData").on("click", function () {

    $.ajax({
      method: "get",
      url: "/scrape",
      success: function (progress) {
        alert(progress)
      },
      error: function () {
      }
    })
  })

  $(".question").on("click", function () {
    var thisId = $(this).attr("data-id");
    $("#notes").empty();
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      .then(function (data) {
        $("#notes").append("<h2>" + data.question + "</h2>");
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        $("#notes").append("<button data-id='" + data._id + "' id='savenote' class='btn btn-primary'> Save Note</button>");

        if (data) {
          $("#titleinput").val(data.title);
          $("#bodyinput").val(data.note.body);
        }
      })

  })
})
